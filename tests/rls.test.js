import test from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.SUPABASE_ANON_KEY;

const missingEnv = !SUPABASE_URL || !SERVICE_ROLE_KEY || !ANON_KEY;

const maybeTest = missingEnv ? test.skip : test;

maybeTest("RLS blocks cross-user calculator state reads and writes", async () => {
  const ctx = await createTestContext();
  try {
    await assertOwnUserRowsExist(ctx);

    const insert = await ctx.userA
      .from("calculator_states")
      .upsert({
        user_id: ctx.userAId,
        life_chip: "family",
        geography: "US",
        timeline: 10,
        total_assets: "\\x01",
        allocation_json: "\\x02",
        monthly_contribution: "\\x03",
        aspire_rate: 7.03,
        aspire_gap: -3.6
      })
      .select("user_id")
      .single();
    assert.ifError(insert.error);

    const ownRead = await ctx.userA
      .from("calculator_states")
      .select("user_id, life_chip")
      .eq("user_id", ctx.userAId)
      .single();
    assert.ifError(ownRead.error);
    assert.equal(ownRead.data.life_chip, "family");

    const crossRead = await ctx.userB
      .from("calculator_states")
      .select("user_id")
      .eq("user_id", ctx.userAId);
    assert.ifError(crossRead.error);
    assert.deepEqual(crossRead.data, []);

    const crossUpdate = await ctx.userB
      .from("calculator_states")
      .update({ geography: "Austin" })
      .eq("user_id", ctx.userAId)
      .select("user_id");
    assert.ifError(crossUpdate.error);
    assert.deepEqual(crossUpdate.data, []);
  } finally {
    await cleanup(ctx);
  }
});

maybeTest("RLS blocks anon calculator state reads", async () => {
  const ctx = await createTestContext();
  try {
    await ctx.userA.from("calculator_states").upsert({
      user_id: ctx.userAId,
      total_assets: "\\x01",
      allocation_json: "\\x02",
      monthly_contribution: "\\x03"
    });

    const anonRead = await ctx.anon
      .from("calculator_states")
      .select("user_id")
      .eq("user_id", ctx.userAId);
    assert.ok(anonRead.error, "anon should not have calculator_states access");
  } finally {
    await cleanup(ctx);
  }
});

maybeTest("RLS keeps private scenarios owner-only and allows public share reads", async () => {
  const ctx = await createTestContext();
  try {
    const privateInsert = await ctx.userA
      .from("scenarios")
      .insert({
        user_id: ctx.userAId,
        name: "Private scenario",
        levers: "\\x04",
        derived: { aspireRate: 7.03, aspireGap: -3.6 },
        is_public: false
      })
      .select("id")
      .single();
    assert.ifError(privateInsert.error);

    const publicInsert = await ctx.userA
      .from("scenarios")
      .insert({
        user_id: ctx.userAId,
        name: "Public scenario",
        levers: "\\x05",
        derived: { aspireRate: 7.03, aspireGap: -3.6 },
        is_public: true,
        share_id: `test_${ctx.suffix}`
      })
      .select("id, share_id")
      .single();
    assert.ifError(publicInsert.error);

    const userBPrivateRead = await ctx.userB
      .from("scenarios")
      .select("id")
      .eq("id", privateInsert.data.id);
    assert.ifError(userBPrivateRead.error);
    assert.deepEqual(userBPrivateRead.data, []);

    const anonPrivateRead = await ctx.anon
      .from("scenarios")
      .select("id")
      .eq("id", privateInsert.data.id);
    assert.ifError(anonPrivateRead.error);
    assert.deepEqual(anonPrivateRead.data, []);

    const anonPublicRead = await ctx.anon
      .from("scenarios")
      .select("id, name, share_id")
      .eq("share_id", publicInsert.data.share_id)
      .single();
    assert.ifError(anonPublicRead.error);
    assert.equal(anonPublicRead.data.name, "Public scenario");
  } finally {
    await cleanup(ctx);
  }
});

async function createTestContext() {
  const suffix = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, clientOptions());
  const anon = createClient(SUPABASE_URL, ANON_KEY, clientOptions());
  const [userARecord, userBRecord] = await Promise.all([
    createAuthUser(admin, `rls+a_${suffix}@example.com`),
    createAuthUser(admin, `rls+b_${suffix}@example.com`)
  ]);
  const [userA, userB] = await Promise.all([
    signIn(`rls+a_${suffix}@example.com`),
    signIn(`rls+b_${suffix}@example.com`)
  ]);
  return {
    suffix,
    admin,
    anon,
    userA,
    userB,
    userAId: userARecord.id,
    userBId: userBRecord.id
  };
}

async function createAuthUser(admin, email) {
  const password = `Test-${cryptoRandom()}!aA1`;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });
  assert.ifError(error);
  passwordByEmail.set(email, password);
  return data.user;
}

async function signIn(email) {
  const client = createClient(SUPABASE_URL, ANON_KEY, clientOptions());
  const { error } = await client.auth.signInWithPassword({
    email,
    password: passwordByEmail.get(email)
  });
  assert.ifError(error);
  return client;
}

async function assertOwnUserRowsExist(ctx) {
  const readA = await ctx.userA.from("users").select("id,email").eq("id", ctx.userAId).single();
  assert.ifError(readA.error);
  assert.equal(readA.data.id, ctx.userAId);
}

async function cleanup(ctx) {
  if (!ctx?.admin) return;
  await ctx.admin.from("baseline_overrides").delete().in("user_id", [ctx.userAId, ctx.userBId]);
  await ctx.admin.from("calculator_states").delete().in("user_id", [ctx.userAId, ctx.userBId]);
  await ctx.admin.from("scenarios").delete().in("user_id", [ctx.userAId, ctx.userBId]);
  await ctx.admin.from("users").delete().in("id", [ctx.userAId, ctx.userBId]);
  await Promise.allSettled([
    ctx.admin.auth.admin.deleteUser(ctx.userAId),
    ctx.admin.auth.admin.deleteUser(ctx.userBId)
  ]);
}

function clientOptions() {
  return {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  };
}

function cryptoRandom() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const passwordByEmail = new Map();

if (missingEnv) {
  console.warn("Skipping RLS tests; set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and SUPABASE_ANON_KEY.");
}

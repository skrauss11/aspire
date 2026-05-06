import { encodeFallbackToken, toPersisted } from "./schema.js";

export function mountGate({ container, scenario, onSaved }) {
  container.innerHTML = `
    <form class="save-gate-form">
      <label for="saveEmail">Save this scenario and open the simulator.</label>
      <div class="save-gate-row">
        <input id="saveEmail" name="email" type="email" placeholder="Enter your email" required>
        <button type="submit">Save and open simulator</button>
      </div>
      <p>Scenario outputs are educational, not advice. Unsubscribe anytime.</p>
      <div class="gate-error" role="alert"></div>
    </form>
  `;
  const form = container.querySelector("form");
  const button = form.querySelector("button");
  const error = form.querySelector(".gate-error");
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const email = new FormData(form).get("email").trim();
    if (!email) return;
    button.disabled = true;
    button.textContent = "Saving...";
    const persisted = toPersisted(scenario);
    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, basket: persisted.basket })
      });
      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      onSaved(data.simulatorUrl || `/simulator/?t=${data.t}`);
    } catch (err) {
      error.textContent = "The save service did not respond, so this browser will carry the scenario forward.";
      onSaved(`/simulator/?s=${encodeFallbackToken(persisted)}`);
    }
  });
}

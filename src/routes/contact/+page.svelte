<script lang="ts">
  // SCAFFOLD ONLY — no submit handler / backend. Phase 4 (FORM-01..03) wires the form backend + validation.
  // Prevent a naive full-page GET submit while the backend is absent.
  function onsubmit(e: SubmitEvent) {
    e.preventDefault(); // no-op until Phase 4
  }
</script>

<svelte:head>
  <title>Contact — Diversity Includes Disability</title>
  <meta name="description" content="Contact Diversity Includes Disability to book a training, request consulting, or partner with us." />
</svelte:head>

<h1>Contact</h1>
<p class="lede">
  Prefer email? Reach us directly at
  <a href="mailto:emanrimawi@gmail.com">emanrimawi@gmail.com</a>.
</p>
<p class="disclaimer"><em>The form below is a scaffold — submission is wired in a later phase. Use the email link above meanwhile.</em></p>

<form novalidate {onsubmit}>
  <div class="field">
    <label for="c-name">Name</label>
    <input id="c-name" name="name" type="text" autocomplete="name" aria-describedby="c-name-error" required />
    <p id="c-name-error" class="error" role="alert" aria-live="polite"></p>
  </div>

  <div class="field">
    <label for="c-email">Email</label>
    <input id="c-email" name="email" type="email" autocomplete="email" aria-describedby="c-email-error" required />
    <p id="c-email-error" class="error" role="alert" aria-live="polite"></p>
  </div>

  <div class="field">
    <label for="c-message">Message</label>
    <textarea id="c-message" name="message" rows="6" aria-describedby="c-message-error" required></textarea>
    <p id="c-message-error" class="error" role="alert" aria-live="polite"></p>
  </div>

  <button class="button" type="submit">Send message</button>
  <p class="disclaimer"><em>(Sending is disabled until the Phase-4 backend is connected.)</em></p>
</form>

<style>
  .lede { font-size: 1.125em; max-inline-size: var(--measure); }
  .disclaimer { color: var(--color-text-muted); }
  form { display: grid; gap: var(--space-6); max-inline-size: var(--measure); margin-block-start: var(--space-6); }
  .field { display: grid; gap: var(--space-2); }
  label { font-weight: var(--font-weight-heading); }
  input, textarea {
    padding: var(--space-3); font: inherit;
    color: var(--color-text); background: var(--color-bg);
    border: 1px solid var(--color-border); border-radius: var(--radius);
  }
  input:focus-visible, textarea:focus-visible {
    outline: var(--focus-ring-width) solid var(--color-focus); outline-offset: 2px;
  }
  .error { color: var(--color-text-muted); min-height: 1em; margin: 0; }
</style>

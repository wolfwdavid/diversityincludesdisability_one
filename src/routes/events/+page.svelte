<script lang="ts">
  import { events, type EventItem } from '$lib/data/events';
  const sorted: EventItem[] = [...events].sort((a, b) => +new Date(a.date) - +new Date(b.date));
</script>

<svelte:head>
  <title>Events — Diversity Includes Disability</title>
  <meta name="description" content="Upcoming events, trainings, and panels from Diversity Includes Disability." />
</svelte:head>

<h1>Events</h1>
<p class="disclaimer"><em>Sample events shown below are placeholders — pending real listings.</em></p>

{#if sorted.length > 0}
  <ul class="events">
    {#each sorted as ev}
      <li>
        <h2>{ev.title}</h2>
        <p class="meta"><time datetime={ev.date}>{ev.date}</time> · {ev.location}</p>
        <p>{ev.description}</p>
        {#if ev.url}
          <p><a class="button is-secondary" href={ev.url} rel="noopener noreferrer">Event details</a></p>
        {/if}
      </li>
    {/each}
  </ul>
{:else}
  <p class="empty">No upcoming events — check back soon.</p>
{/if}

<style>
  .disclaimer { color: var(--color-text-muted); }
  .events { list-style: none; padding: 0; display: grid; gap: var(--space-6); margin-block-start: var(--space-6); }
  .events li { padding: var(--space-4); border: 1px solid var(--color-border); border-radius: var(--radius); }
  .meta { color: var(--color-text-muted); }
  .empty { margin-block-start: var(--space-6); font-size: 1.125em; }
</style>

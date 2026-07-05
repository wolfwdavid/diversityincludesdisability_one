<script lang="ts">
  import { base } from '$app/paths';
  import { posts } from '$lib/posts';
</script>

<svelte:head>
  <title>News — Diversity Includes Disability</title>
  <meta name="description" content="Updates, essays, and announcements from Diversity Includes Disability." />
</svelte:head>

<h1>News</h1>

{#if posts.length > 0}
  <ul class="post-list">
    {#each posts as post}
      <li>
        <h2><a href="{base}/blog/{post.slug}/">{post.title}</a></h2>
        <p class="meta"><time datetime={post.date}>{post.date}</time></p>
        <p class="summary">{post.summary}</p>
      </li>
    {/each}
  </ul>
{:else}
  <p class="empty">No posts yet — check back soon.</p>
{/if}

<style>
  .post-list { list-style: none; padding: 0; display: grid; gap: var(--space-8); margin-block-start: var(--space-6); }
  .post-list h2 { margin-block-end: var(--space-1); }
  .post-list a { color: var(--color-accent); }
  .meta { color: var(--color-text-muted); margin: 0; }
  .summary { max-inline-size: var(--measure); }
  .empty { margin-block-start: var(--space-6); font-size: 1.125em; }
</style>

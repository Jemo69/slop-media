<script>let { data } = $props();</script>
<h1 style="padding:16px">slop-media</h1>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;padding:16px">
{#each data.items as m}
<a href="/w/{m.id}" style="border:1px solid #333;text-decoration:none;color:#fff">
<video src={m.rawUrl} style="width:100%;aspect-ratio:16/9;background:#111" preload="metadata"></video>
<div style="padding:8px;font-size:13px">{m.filename} · PR #{m.pr} · {m.repo}</div>
</a>
{/each}
</div>
{#if !data.items.length}<p style="padding:16px;opacity:.6">No uploads yet. Use the CLI to upload.</p>{/if}

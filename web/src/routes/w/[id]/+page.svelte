<script>let { data } = $props();</script>
<div style="max-width:960px;margin:0 auto;padding:16px">
<a href="/" style="color:#888">← all</a>
<h2>{data.filename}</h2>
<video src={data.rawUrl} controls autoplay playsinline style="width:100%;background:#111"></video>
<pre style="background:#111;padding:12px;overflow:auto">{"<video src=\"" + data.rawUrl + "\" width=\"100%\" controls></video>"}</pre>
</div>

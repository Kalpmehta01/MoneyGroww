// Server-side news proxy: fetches Yahoo Finance's RSS feed directly (no CORS
// issue server-to-server, so the rss2json.com relay the frontend used to
// depend on is no longer needed at all) and does a light regex-based parse
// into plain JSON items. Cached at the CDN edge for 5 minutes since news
// doesn't need to be fresher than that.

const { json, guard, fetchWithTimeout, safeHttpUrl } = require('./_lib/security');

function extractTag(block, tag) {
  const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
  if (!match) return '';
  return match[1]
    .replace('<![CDATA[', '')
    .replace(']]>', '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

exports.handler = async (event) => {
  const blocked = guard(event, { methods: ['GET'], name: 'news', max: 30, windowMs: 60_000 });
  if (blocked) return blocked;

  try {
    const res = await fetchWithTimeout(
      'https://finance.yahoo.com/news/rssindex',
      { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MoneyGrowwBot/1.0)' } },
      8000
    );

    if (!res.ok) {
      return json(502, { error: 'Upstream RSS fetch failed' });
    }

    const xml = (await res.text()).slice(0, 500_000);
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) && items.length < 6) {
      const block = match[1];
      const title = extractTag(block, 'title').slice(0, 300);
      // Only http(s) links are passed on: a feed-supplied "javascript:" URL
      // must never reach an <a href> in the browser.
      const link = safeHttpUrl(extractTag(block, 'link'));
      const pubDate = extractTag(block, 'pubDate').slice(0, 64);
      const description = extractTag(block, 'description').slice(0, 600);
      if (title && link) {
        items.push({ title, link, pubDate, description, thumbnail: '' });
      }
    }

    return json(200, { items }, { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' });
  } catch (err) {
    console.error('news failed', err);
    return json(502, { error: 'Failed to fetch news' });
  }
};

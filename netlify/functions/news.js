// Server-side news proxy: fetches Yahoo Finance's RSS feed directly (no CORS
// issue server-to-server, so the rss2json.com relay the frontend used to
// depend on is no longer needed at all) and does a light regex-based parse
// into plain JSON items. Cached at the CDN edge for 5 minutes since news
// doesn't need to be fresher than that.

function extractTag(block, tag) {
  const match = block.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`));
  if (!match) return '';
  return match[1]
    .replace('<![CDATA[', '')
    .replace(']]>', '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

exports.handler = async () => {
  try {
    const res = await fetch('https://finance.yahoo.com/news/rssindex', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MoneyGrowwBot/1.0)' },
    });

    if (!res.ok) {
      return { statusCode: 502, body: JSON.stringify({ error: 'Upstream RSS fetch failed' }) };
    }

    const xml = await res.text();
    const items = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xml)) && items.length < 6) {
      const block = match[1];
      const title = extractTag(block, 'title');
      const link = extractTag(block, 'link');
      const pubDate = extractTag(block, 'pubDate');
      const description = extractTag(block, 'description');
      if (title) {
        items.push({ title, link, pubDate, description, thumbnail: '' });
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
      },
      body: JSON.stringify({ items }),
    };
  } catch (err) {
    return { statusCode: 502, body: JSON.stringify({ error: 'Failed to fetch news', detail: String(err) }) };
  }
};

// Server-side news proxy: fetches an Indian markets RSS feed directly (no CORS
// issue server-to-server, so no third-party relay is needed) and does a light
// regex-based parse into plain JSON items. Cached at the CDN edge for 5
// minutes since news doesn't need to be fresher than that.
//
// Yahoo Finance retired its /news/rssindex feed (it now returns 404), so the
// feeds below are tried in order and the first one that yields items wins.

const { json, guard, fetchWithTimeout, safeHttpUrl } = require('./_lib/security');

const FEEDS = [
  { source: 'Mint', url: 'https://www.livemint.com/rss/markets' },
  { source: 'The Economic Times', url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms' },
];

const MAX_ITEMS = 6;

const NAMED_ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

function decodeEntities(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, code) => {
    if (code[0] === '#') {
      const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : '';
    }
    return NAMED_ENTITIES[code.toLowerCase()] ?? whole;
  });
}

function extractTag(block, tag) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`));
  if (!match) return '';
  const raw = match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1');
  return decodeEntities(raw.replace(/<[^>]+>/g, ''))
    .replace(/<[^>]+>/g, '') // entity-encoded markup becomes real tags after decoding
    .replace(/\s+/g, ' ')
    .trim();
}

function parseFeed(xml, source) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) && items.length < MAX_ITEMS) {
    const block = match[1];
    const title = extractTag(block, 'title').slice(0, 300);
    // Only http(s) links are passed on: a feed-supplied "javascript:" URL
    // must never reach an <a href> in the browser.
    const link = safeHttpUrl(extractTag(block, 'link'));
    const pubDate = extractTag(block, 'pubDate').slice(0, 64);
    const description = extractTag(block, 'description').slice(0, 600);
    if (title && link) {
      items.push({ title, link, pubDate, description, source, thumbnail: '' });
    }
  }
  return items;
}

exports.handler = async (event) => {
  const blocked = guard(event, { methods: ['GET'], name: 'news', max: 30, windowMs: 60_000 });
  if (blocked) return blocked;

  for (const feed of FEEDS) {
    try {
      const res = await fetchWithTimeout(
        feed.url,
        { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MoneyGrowwBot/1.0)' } },
        8000
      );
      if (!res.ok) {
        console.error('news feed failed', feed.url, res.status);
        continue;
      }

      const xml = (await res.text()).slice(0, 500_000);
      const items = parseFeed(xml, feed.source);
      if (items.length > 0) {
        return json(200, { items }, { 'Cache-Control': 'public, max-age=300, stale-while-revalidate=600' });
      }
    } catch (err) {
      console.error('news feed error', feed.url, err);
    }
  }

  return json(502, { error: 'Failed to fetch news' });
};

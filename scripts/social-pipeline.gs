/**
 * social-pipeline.gs
 * Google Apps Script for denzuko/stream-assets social media pipeline
 *
 * Sheet: content-pipeline (1R0FR3zPW87wXb2yq-EitZny8r0jmLH3CZ-7vgUp0ej4)
 *
 * Tabs:
 *   Queue    — ingestion stubs (topic, angle, source_urls, target_fish, pull_type)
 *   Drafts   — generated post variants, one row per platform slot
 *   Posted   — archive of published posts
 *   Config   — ANTHROPIC_API_KEY, MASTODON_TOKEN, MASTODON_INSTANCE, etc.
 *
 * Triggers:
 *   onEdit(e)         — when Queue row marked approved, generate drafts
 *   scheduledPost()   — time-driven, runs every hour, posts scheduled rows
 *   generateDrafts()  — manual trigger from menu
 */

// ── Column indices (1-based) ─────────────────────────────────────────────────

const QUEUE_COLS = {
  STUB_ID:      1,
  STATUS:       2,   // pending | approved | generated | skip
  TOPIC:        3,
  ANGLE:        4,
  SOURCE_URLS:  5,
  SITE_SLUG:    6,   // e.g. 01-a-better-tweedy-bird
  SITE_URL:     7,
  TARGET_FISH:  8,   // practitioner | compliance | community
  PULL_TYPE:    9,   // site | bmac | book | advisory
  PULL_URL:     10,
  SCHEDULED_AT: 11,
  NOTES:        12,
};

const DRAFT_COLS = {
  STUB_ID:       1,
  GENERATED_AT:  2,
  PLATFORM:      3,   // mastodon | linkedin | reddit | bmac
  SUBREDDIT:     4,
  SCHEDULED_AT:  5,
  COPY:          6,
  CHAR_COUNT:    7,
  HASHTAGS:      8,
  SITE_ANCHOR:   9,
  TARGET_FISH:   10,
  PULL_TYPE:     11,
  PULL_URL:      12,
  IMAGE_QUERY:   13,
  STATUS:        14,  // draft | approved | scheduled | posted | skip
  POSTED_AT:     15,
  ENGAGEMENT:    16,
};

// ── Config helpers ───────────────────────────────────────────────────────────

function getConfig(key) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Config');
  if (!sheet) sheet = ss.insertSheet('Config');
  const data = sheet.getDataRange().getValues();
  for (const row of data) {
    if (row[0] === key) return row[1];
  }
  return null;
}

// ── Sheet bootstrap ──────────────────────────────────────────────────────────

function bootstrapSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Queue tab
  let queue = ss.getSheetByName('Queue');
  if (!queue) {
    queue = ss.insertSheet('Queue');
    queue.appendRow([
      'stub_id', 'status', 'topic', 'angle', 'source_urls',
      'site_slug', 'site_url', 'target_fish', 'pull_type', 'pull_url',
      'scheduled_at', 'notes'
    ]);
    queue.setFrozenRows(1);
  }

  // Drafts tab
  let drafts = ss.getSheetByName('Drafts');
  if (!drafts) {
    drafts = ss.insertSheet('Drafts');
    drafts.appendRow([
      'stub_id', 'generated_at', 'platform', 'subreddit', 'scheduled_at',
      'copy', 'char_count', 'hashtags', 'site_anchor',
      'target_fish', 'pull_type', 'pull_url',
      'image_query', 'status', 'posted_at', 'engagement'
    ]);
    drafts.setFrozenRows(1);
  }

  // Posted tab
  let posted = ss.getSheetByName('Posted');
  if (!posted) {
    posted = ss.insertSheet('Posted');
    posted.appendRow([
      'stub_id', 'platform', 'subreddit', 'posted_at',
      'copy', 'char_count', 'post_url', 'engagement'
    ]);
    posted.setFrozenRows(1);
  }

  // Config tab
  let config = ss.getSheetByName('Config');
  if (!config) {
    config = ss.insertSheet('Config');
    config.appendRow(['key', 'value', 'notes']);
    config.appendRow(['ANTHROPIC_API_KEY', '', 'claude-sonnet-4-20250514']);
    config.appendRow(['MASTODON_TOKEN', '', 'access token']);
    config.appendRow(['MASTODON_INSTANCE', 'https://infosec.exchange', 'instance base URL']);
    config.appendRow(['CONTENT_RATIO', '2:1', 'technical:policy ratio']);
    config.setFrozenRows(1);
  }

  SpreadsheetApp.getUi().alert('Sheets bootstrapped. Fill in Config tab before generating.');
}

// ── Brand voice system prompt ────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are the social media voice for Dwight Spencer (denzuko),
Principal of Da Planet Security, Technology Chair of Restore The Fourth,
25-year infosec practitioner, author of the forthcoming book "The Watchers You Fed."

The goal is NOT to announce content. It is to start a conversation that pulls
the right reader toward the site, the book, or a professional conversation.
Think: working a room of potential readers — personalised, direct, not broadcast.

AUDIENCE FISH TYPES — match tone to target:
- practitioner: OT/ICS engineers, DevSecOps, self-hosters, 2600/HPR/SDF crowd.
  Hook: technical claim they'll argue with or +1. Pull: site post for depth.
- compliance: procurement officers, CISOs, DIB contractors, DevOps leads.
  Hook: business or cost implication. Pull: DPS advisory or book.
- community: privacy advocates, civil liberties, RT4 adjacent, journalists.
  Hook: concrete local or policy angle. Pull: book pre-order or BMAC.

PULL TYPES:
- site: end with site URL (only if linking to a specific post)
- bmac: mention lab_access tier addendum — inside baseball for members
- book: reference "The Watchers You Fed" (KDP, pre-Labor Day 2026)
- advisory: signal for DPS fractional CISO engagement

PLATFORM RULES:
MASTODON (hard 500 char including hashtags):
- Direct practitioner-to-practitioner, original observation not news summary
- 3-4 hashtags from: #infosec #OT #ICS #SCADA #selfhosted #infrastructure
  #foss #devops #devsecops #privacy #FourthAmendment #supplychain #homelab
- No rhetorical questions. No numbered lists. No em-dash abuse (max one).
- End with site URL only when linking to a specific post.

LINKEDIN (1000-1500 chars):
- Professional register, lead with business/technical implication not news
- Concrete: what does this mean for someone running infrastructure today
- Active voice. No "It's worth noting". No "In conclusion". No "This is why X matters".

REDDIT title: factual, specific, no editorializing
REDDIT body: 2-3 sentence hook + link, written as a peer dropping a find not a promo

BMAC (members-only lab_access tier):
- Inside baseball: what's actually happening at the bench
- Connect to ongoing work: observability stack, pbx-quadlet, Watchers manuscript
- No performance of expertise — they're already in

OUTPUT: Return ONLY valid JSON. No preamble, no markdown fences.
Schema:
{
  "mastodon": {"copy": "string", "char_count": int, "hashtags": ["string"], "verified_under_500": bool},
  "linkedin": {"copy": "string", "char_count": int},
  "reddit": [{"subreddit": "string", "title": "string", "body": "string"}],
  "bmac": {"copy": "string"},
  "image_query": "string"
}`;

// ── Generate drafts for one Queue row ────────────────────────────────────────

function generateForRow(queueRow) {
  const apiKey = getConfig('ANTHROPIC_API_KEY');
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not set in Config tab');

  const [stubId, , topic, angle, sourceUrls, siteSlug, siteUrl,
         targetFish, pullType, pullUrl, scheduledAt] = queueRow;

  const userMsg = `Generate social media posts for the following.

TOPIC: ${topic}
ANGLE: ${angle}
SOURCE_URLS: ${sourceUrls}
SITE_ANCHOR: ${siteUrl || ''}
TARGET_FISH: ${targetFish}
PULL_TYPE: ${pullType}
PULL_URL: ${pullUrl || ''}

Generate now.`;

  const payload = JSON.stringify({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMsg }]
  });

  const resp = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    payload: payload,
    muteHttpExceptions: true
  });

  if (resp.getResponseCode() !== 200) {
    throw new Error(`API error ${resp.getResponseCode()}: ${resp.getContentText()}`);
  }

  const data = JSON.parse(resp.getContentText());
  let raw = data.content[0].text.trim();
  raw = raw.replace(/^```json\s*/,'').replace(/^```\s*/,'').replace(/\s*```$/,'');
  return JSON.parse(raw);
}

// ── Write generated variants to Drafts tab ───────────────────────────────────

function writeDrafts(stubId, generated, queueRow) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const drafts = ss.getSheetByName('Drafts');
  const now = new Date().toISOString();
  const [,, topic,, sourceUrls, siteSlug, siteUrl,
         targetFish, pullType, pullUrl, scheduledAt] = queueRow;

  const base = [stubId, now, '', '', scheduledAt || '',
                '', 0, '', siteUrl || '',
                targetFish, pullType, pullUrl || '',
                generated.image_query || '', 'draft', '', ''];

  // Mastodon
  if (generated.mastodon) {
    const m = generated.mastodon;
    const row = [...base];
    row[2] = 'mastodon';
    row[5] = m.copy;
    row[6] = m.char_count || m.copy.length;
    row[7] = (m.hashtags || []).join(' ');
    drafts.appendRow(row);
  }

  // LinkedIn
  if (generated.linkedin) {
    const row = [...base];
    row[2] = 'linkedin';
    row[5] = generated.linkedin.copy;
    row[6] = generated.linkedin.char_count || generated.linkedin.copy.length;
    drafts.appendRow(row);
  }

  // Reddit — one row per subreddit
  for (const r of (generated.reddit || [])) {
    const row = [...base];
    row[2] = 'reddit';
    row[3] = r.subreddit;
    row[5] = `TITLE: ${r.title}\n\n${r.body}`;
    row[6] = r.body.length;
    drafts.appendRow(row);
  }

  // BMAC
  if (generated.bmac) {
    const row = [...base];
    row[2] = 'bmac';
    row[5] = generated.bmac.copy;
    row[6] = generated.bmac.copy.length;
    drafts.appendRow(row);
  }
}

// ── Process all approved Queue rows ─────────────────────────────────────────

function generateDrafts() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const queue = ss.getSheetByName('Queue');
  if (!queue) { SpreadsheetApp.getUi().alert('No Queue tab found.'); return; }

  const data = queue.getDataRange().getValues();
  let generated = 0;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[QUEUE_COLS.STATUS - 1] !== 'approved') continue;

    try {
      const result = generateForRow(row);
      writeDrafts(row[0], result, row);
      queue.getRange(i + 1, QUEUE_COLS.STATUS).setValue('generated');
      generated++;
      Utilities.sleep(2000); // rate limit
    } catch (e) {
      queue.getRange(i + 1, QUEUE_COLS.NOTES).setValue(`ERROR: ${e.message}`);
    }
  }

  SpreadsheetApp.getUi().alert(`Generated drafts for ${generated} stub(s).`);
}

// ── onEdit trigger: auto-generate when status set to approved ────────────────

function onEdit(e) {
  if (!e) return;
  const sheet = e.range.getSheet();
  if (sheet.getName() !== 'Queue') return;
  if (e.range.getColumn() !== QUEUE_COLS.STATUS) return;
  if (e.value !== 'approved') return;

  const row = sheet.getRange(e.range.getRow(), 1, 1, 12).getValues()[0];
  try {
    const result = generateForRow(row);
    writeDrafts(row[0], result, row);
    sheet.getRange(e.range.getRow(), QUEUE_COLS.STATUS).setValue('generated');
  } catch (err) {
    sheet.getRange(e.range.getRow(), QUEUE_COLS.NOTES).setValue(`ERROR: ${err.message}`);
  }
}

// ── Mastodon posting ─────────────────────────────────────────────────────────

function postToMastodon(copy) {
  const token = getConfig('MASTODON_TOKEN');
  const instance = getConfig('MASTODON_INSTANCE') || 'https://infosec.exchange';
  if (!token) throw new Error('MASTODON_TOKEN not set');

  const resp = UrlFetchApp.fetch(`${instance}/api/v1/statuses`, {
    method: 'post',
    headers: { 'Authorization': `Bearer ${token}` },
    payload: { status: copy, visibility: 'public' },
    muteHttpExceptions: true
  });

  if (resp.getResponseCode() !== 200) {
    throw new Error(`Mastodon error ${resp.getResponseCode()}: ${resp.getContentText()}`);
  }
  return JSON.parse(resp.getContentText()).url;
}

// ── Scheduled posting: runs hourly via time-driven trigger ───────────────────

function scheduledPost() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const drafts = ss.getSheetByName('Drafts');
  const posted = ss.getSheetByName('Posted');
  if (!drafts) return;

  const now = new Date();
  const data = drafts.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const status    = row[DRAFT_COLS.STATUS - 1];
    const platform  = row[DRAFT_COLS.PLATFORM - 1];
    const schedAt   = row[DRAFT_COLS.SCHEDULED_AT - 1];
    const copy      = row[DRAFT_COLS.COPY - 1];

    if (status !== 'scheduled') continue;
    if (!schedAt) continue;

    const schedTime = new Date(schedAt);
    if (schedTime > now) continue;

    // Only auto-post Mastodon; LinkedIn and Reddit require manual action
    if (platform !== 'mastodon') {
      drafts.getRange(i + 1, DRAFT_COLS.STATUS).setValue('ready');
      continue;
    }

    try {
      const postUrl = postToMastodon(copy);
      drafts.getRange(i + 1, DRAFT_COLS.STATUS).setValue('posted');
      drafts.getRange(i + 1, DRAFT_COLS.POSTED_AT).setValue(now.toISOString());
      posted.appendRow([
        row[0], platform, row[DRAFT_COLS.SUBREDDIT - 1],
        now.toISOString(), copy, copy.length, postUrl, ''
      ]);
    } catch (e) {
      drafts.getRange(i + 1, DRAFT_COLS.STATUS).setValue('error');
      drafts.getRange(i + 1, DRAFT_COLS.ENGAGEMENT).setValue(`POST ERROR: ${e.message}`);
    }
  }
}

// ── Approve all drafts for a stub (bulk action) ──────────────────────────────

function approveStub() {
  const ui = SpreadsheetApp.getUi();
  const resp = ui.prompt('Enter stub_id to approve all drafts for:');
  if (resp.getSelectedButton() !== ui.Button.OK) return;
  const stubId = resp.getResponseText().trim();

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const drafts = ss.getSheetByName('Drafts');
  const data = drafts.getDataRange().getValues();

  let count = 0;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === stubId && data[i][DRAFT_COLS.STATUS - 1] === 'draft') {
      drafts.getRange(i + 1, DRAFT_COLS.STATUS).setValue('scheduled');
      count++;
    }
  }
  ui.alert(`Scheduled ${count} draft(s) for stub ${stubId}.`);
}

// ── Custom menu ──────────────────────────────────────────────────────────────

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📡 Pipeline')
    .addItem('Bootstrap sheets', 'bootstrapSheets')
    .addSeparator()
    .addItem('Generate drafts (approved stubs)', 'generateDrafts')
    .addItem('Approve stub → scheduled', 'approveStub')
    .addSeparator()
    .addItem('Run scheduled posts now', 'scheduledPost')
    .addToUi();
}

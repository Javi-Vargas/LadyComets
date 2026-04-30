/**
 * One-time seed script: uploads real Lady Comets images to Supabase Storage
 * and inserts the corresponding content_items records.
 *
 * Run from project root:  node scripts/seed-content.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const SUPABASE_URL = 'https://tpzsegzfexfnsvewtbew.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRwenNlZ3pmZXhmbnN2ZXd0YmV3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwMDgwODIsImV4cCI6MjA5MjU4NDA4Mn0.XW_ZZ6yvWRQcLjce2zpatQn_l-ZBmsKEm9wOJGrbSS8'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const ASSETS_DIR =
  '/home/elias/.cursor/projects/home-elias-dev-projects-CometsBballV2/assets'

const PREFIX =
  'c__Users_Elias_AppData_Roaming_Cursor_User_workspaceStorage_729cc5ad132fbd30c6a73697e4061d9a_images_'

function assetPath(filename) {
  return resolve(ASSETS_DIR, PREFIX + filename)
}

// ── Content definitions ────────────────────────────────────────────────────────
// Each entry: { slug, srcFile, section, type, title, excerpt, date?, featured?,
//               large?, col_span?, row_span?, sort_order, published }

const ITEMS = [
  // ── BENTO FEED (home page) ──────────────────────────────────────────────────
  {
    slug: 'tryouts-may-2026',
    srcFile: 'image-35a7e9c1-cc38-4fab-a4f6-58873988a03a.png',
    section: 'feed',
    type: 'general',
    title: 'TRYOUTS — SAT MAY 2 · 2–4PM · WINTER PARK, FL',
    excerpt:
      'Take your game to the next level. Open tryouts for the 2026 roster — fun & competitive environment, travel opportunities, high-level semi-pro competition.',
    large: true,
    col_span: 'md:col-span-2',
    row_span: 'md:row-span-1',
    accent: 'hsl(var(--primary))',
    sort_order: 0,
    published: true,
  },
  {
    slug: 'queen-of-the-city-tournament',
    srcFile: 'image-c6172b89-56f6-4770-bef0-c0393ae29dbf.png',
    section: 'feed',
    type: 'general',
    title: 'QUEEN OF THE CITY TOURNAMENT — CONFIRMED',
    excerpt: 'The Orlando Lady Comets are officially in.',
    large: false,
    col_span: 'md:col-span-1',
    row_span: 'md:row-span-1',
    accent: 'hsl(var(--primary))',
    sort_order: 1,
    published: true,
  },
  {
    slug: 'sponsors-shoutout',
    srcFile: 'image-9a431087-5d4f-4e46-9927-c4b0566f336d.png',
    section: 'feed',
    type: 'culture',
    title: 'SHOUT OUT TO OUR SPONSORS',
    excerpt:
      'Orlando Deluxe Cleaners · Inca Electric LLC · Kiwi\'s Pub & Grill — thank you for supporting our community.',
    large: false,
    col_span: 'md:col-span-1',
    row_span: 'md:row-span-1',
    accent: 'hsl(var(--accent))',
    sort_order: 2,
    published: true,
  },

  // ── NEWS ────────────────────────────────────────────────────────────────────
  {
    slug: 'inca-electric-2026-sponsor',
    srcFile: 'image-5b194d45-100e-43c2-8109-f8858f741f15.png',
    section: 'news',
    type: 'general',
    title: 'Inca Electric LLC — Official 2026 Season Sponsor',
    excerpt:
      'Inca Electric LLC joins the Lady Comets as a proud 2026 season partner. Licensed, bonded, and insured — powering the Lady Comets all season long. Let\'s run it back!',
    date: 'Apr 2026',
    featured: false,
    sort_order: 0,
    published: true,
  },
  {
    slug: 'gt5-partnership',
    srcFile: 'image-2d250c36-a94d-400e-a476-adc0acff15b6.png',
    section: 'news',
    type: 'general',
    title: 'Official Partnership: Lady Comets × GT5 Basketball',
    excerpt:
      'Uniting men\'s and women\'s basketball in Orlando. The Lady Comets and GT5 Basketball join forces — Building Opportunities. Growing the Game.',
    date: 'Apr 2026',
    featured: false,
    sort_order: 1,
    published: true,
  },
  {
    slug: 'dj-fabulouz-partnership',
    srcFile: 'image-185c12d5-9fa3-4da3-bde8-4fcd218c8bb1.png',
    section: 'news',
    type: 'culture',
    title: 'Official Partnership: Lady Comets × DJ Fabulouz',
    excerpt:
      'The Lady Comets bring WNBA-style energy to Orlando — and DJ Fabulouz is the official soundtrack. #LadyComets #OrlandoBasketball #WNBAStyleEnergy',
    date: 'Apr 2026',
    featured: false,
    sort_order: 2,
    published: true,
  },
  {
    slug: 'corporate-sponsorship-opportunities',
    srcFile: 'image-495b888b-e460-4e9d-a313-c8a332f44c02.png',
    section: 'news',
    type: 'feature',
    title: "Partner With Orlando's Rising Women's Basketball Program",
    excerpt:
      'Community Impact · Positive Brand Alignment · Marketing Opportunities · Social Media & Game Announcements. Sponsorship tiers available: Title, Gold, and Community Sponsor. Inquiries: OrlandoLadyComets@gmail.com · @OrlandoLadyComets',
    date: '2026',
    featured: true,
    sort_order: 3,
    published: true,
  },
  {
    slug: 'local-business-sponsorships',
    srcFile: 'image-c4ea3e0c-7a5d-42db-a199-4c6c968e49d4.png',
    section: 'news',
    type: 'general',
    title: 'Local Business Sponsorship Tiers — 2026 Season',
    excerpt:
      'Community Supporter ($100) · Bronze Sponsor ($250) · Silver Sponsor ($500) · Gold Sponsor ($1,000). Benefits range from social media shoutouts to logo on jerseys, banners, vendor tables, and "Business of the Game" recognition. Contact orlandoladycomets@gmail.com to become a sponsor.',
    date: '2026',
    featured: false,
    sort_order: 4,
    published: true,
  },
  {
    slug: 'media-professionals',
    srcFile: 'image-a23b35a2-506d-4531-b64a-b177b908ce68.png',
    section: 'news',
    type: 'general',
    title: 'Calling All Media Professionals — Join the Lady Comets',
    excerpt:
      'Seeking videographers, streaming techs, editors, and photographers to join Orlando\'s rising women\'s semi-pro basketball team. Game filming, live streaming, and media coverage opportunities available. Contact orlandoladycomets@gmail.com.',
    date: '2026',
    featured: false,
    sort_order: 5,
    published: true,
  },
]

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`Seeding ${ITEMS.length} content items...\n`)

  for (const item of ITEMS) {
    process.stdout.write(`[${item.slug}] uploading image... `)

    const fileBuffer = readFileSync(assetPath(item.srcFile))
    const storagePath = `content/${item.slug}.png`

    const { error: uploadError } = await supabase.storage
      .from('lady-comets')
      .upload(storagePath, fileBuffer, {
        contentType: 'image/png',
        upsert: true,
      })

    if (uploadError) {
      console.error(`UPLOAD FAILED: ${uploadError.message}`)
      continue
    }

    process.stdout.write('done. inserting record... ')

    const payload = {
      section: item.section,
      type: item.type,
      title: item.title,
      excerpt: item.excerpt ?? null,
      image_path: storagePath,
      image_url: null,
      date: item.date ?? null,
      read_time: null,
      featured: item.featured ?? false,
      wide: false,
      col_span: item.col_span ?? null,
      row_span: item.row_span ?? null,
      large: item.large ?? false,
      accent: item.accent ?? null,
      instagram_url: null,
      published: item.published,
      sort_order: item.sort_order,
      created_at: new Date().toISOString(),
    }

    const { error: insertError } = await supabase
      .from('content_items')
      .insert(payload)

    if (insertError) {
      console.error(`INSERT FAILED: ${insertError.message}`)
      continue
    }

    console.log('done.')
  }

  console.log('\nVerifying...')
  const { data, error } = await supabase
    .from('content_items')
    .select('id, section, title')
    .order('section')
    .order('sort_order')

  if (error) {
    console.error('Verification query failed:', error.message)
    return
  }

  console.log(`\n${data.length} content items in DB:`)
  for (const row of data) {
    console.log(`  [${row.section}] ${row.title}`)
  }
}

main().catch(console.error)

/**
 * One-time migration script: SQLite → Supabase
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_KEY=your-service-role-key \
 *   node migrate.js
 *
 * Use the SERVICE ROLE key (not anon key) so RLS is bypassed.
 * Find it in Supabase → Project Settings → API → service_role key.
 */

const sqlite3 = require('sqlite3').verbose();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_KEY env vars before running.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const db = new sqlite3.Database('./clubs.db');

function parseJSON(value, fallback = []) {
  if (!value) return fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

function parseBool(value) {
  if (typeof value === 'boolean') return value;
  return value === 'true' || value === true || value === 1;
}

async function migrateClubs() {
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM clubs', async (err, rows) => {
      if (err) return reject(err);

      console.log(`Migrating ${rows.length} clubs…`);

      for (const row of rows) {
        const club = {
          name:                  row.name,
          description:           row.description,
          category:              parseJSON(row.category, []),
          meeting_time:          row.meeting_time || '',
          meeting_location:      row.meeting_location || '',
          contact_email:         row.contact_email || '',
          contact_phone:         row.contact_phone || '',
          website:               row.website || '',
          instagram:             row.instagram || '',
          twitter:               row.twitter || '',
          facebook:              row.facebook || '',
          application_deadline:  row.application_deadline || '',
          interview_start_date:  row.interview_start_date || '',
          interview_end_date:    row.interview_end_date || '',
          rating:                row.rating || 0,
          review_count:          row.review_count || 0,
          member_count:          row.member_count || 0,
          slogan:                row.slogan || '',
          acceptance_rate:       row.acceptance_rate || 0,
          applications_open:     row.applications_open || '',
          results_released:      row.results_released || '',
          open_positions:        parseJSON(row.open_positions, []),
          available_spots:       row.available_spots || 0,
          application_questions: parseJSON(row.application_questions, []),
          // Note: local /uploads/ paths won't resolve after Express is removed.
          // Re-upload files via the Admin dashboard after migration.
          logo:                  row.logo || null,
          backdrop:              row.backdrop || null,
          hiring_package:        row.hiring_package || null,
          is_hiring:             parseBool(row.isHiring),
          has_interviews:        parseBool(row.hasInterviews),
        };

        const { error } = await supabase.from('clubs').insert(club);
        if (error) {
          console.error(`  ✗ Failed to insert "${row.name}":`, error.message);
        } else {
          console.log(`  ✓ ${row.name}`);
        }
      }
      resolve();
    });
  });
}

async function migrateReviews() {
  return new Promise((resolve, reject) => {
    db.all('SELECT r.*, c.name as club_name FROM reviews r JOIN clubs c ON r.club_id = c.id', async (err, rows) => {
      if (err) return reject(err);
      if (!rows.length) return resolve();

      console.log(`\nMigrating ${rows.length} reviews…`);

      // Get Supabase club IDs by name
      const { data: supaClubs } = await supabase.from('clubs').select('id, name');
      const clubMap = Object.fromEntries((supaClubs || []).map(c => [c.name, c.id]));

      for (const row of rows) {
        const clubId = clubMap[row.club_name];
        if (!clubId) { console.warn(`  ⚠ No Supabase club found for review: ${row.club_name}`); continue; }

        const { error } = await supabase.from('reviews').insert({
          club_id:       clubId,
          student_name:  row.student_name,
          club_position: row.club_position || '',
          rating:        row.rating,
          review_text:   row.review_text || '',
        });
        if (error) console.error(`  ✗ Review error:`, error.message);
        else console.log(`  ✓ Review for ${row.club_name}`);
      }
      resolve();
    });
  });
}

(async () => {
  try {
    await migrateClubs();
    await migrateReviews();
    console.log('\nMigration complete.');
  } catch (e) {
    console.error('Migration failed:', e);
  } finally {
    db.close();
  }
})();

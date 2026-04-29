/**
 * Supabase data-access layer.
 * All components import from here instead of calling supabase directly.
 */
import supabase from '../supabaseClient';

// ── Clubs ─────────────────────────────────────────────────────

export async function getClubs() {
  const { data, error } = await supabase.from('clubs').select('*').order('name');
  if (error) throw error;
  return data;
}

export async function getClubById(id) {
  const { data, error } = await supabase.from('clubs').select('*').eq('id', id).single();
  if (error) throw error;
  return data;
}

export async function getClubByName(name) {
  const { data } = await supabase.from('clubs').select('*').eq('name', name).single();
  return data || null;
}

export async function createClub(clubData, logoFile, backdropFile) {
  let logoUrl = null;
  let backdropUrl = null;

  if (logoFile) logoUrl = await uploadClubAsset('club-assets', `logos/${Date.now()}-${logoFile.name}`, logoFile);
  if (backdropFile) backdropUrl = await uploadClubAsset('club-assets', `backdrops/${Date.now()}-${backdropFile.name}`, backdropFile);

  const { data, error } = await supabase.from('clubs').insert({
    ...clubData,
    logo: logoUrl,
    backdrop: backdropUrl,
  }).select().single();
  if (error) throw error;
  return data;
}

export async function updateClub(id, clubData, logoFile, backdropFile) {
  if (logoFile) clubData.logo = await uploadClubAsset('club-assets', `logos/${Date.now()}-${logoFile.name}`, logoFile);
  if (backdropFile) clubData.backdrop = await uploadClubAsset('club-assets', `backdrops/${Date.now()}-${backdropFile.name}`, backdropFile);

  const { data, error } = await supabase.from('clubs').update(clubData).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteClub(id) {
  const { error } = await supabase.from('clubs').delete().eq('id', id);
  if (error) throw error;
}

// ── Reviews ───────────────────────────────────────────────────

export async function getReviews(clubId) {
  const { data, error } = await supabase
    .from('reviews').select('*').eq('club_id', clubId).order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function addReview({ clubId, studentName, clubPosition, rating, reviewText }) {
  const { data, error } = await supabase.from('reviews').insert({
    club_id:       clubId,
    student_name:  studentName,
    club_position: clubPosition,
    rating,
    review_text:   reviewText,
  }).select().single();
  if (error) throw error;

  // Recalculate club rating
  const { data: allReviews } = await supabase.from('reviews').select('rating').eq('club_id', clubId);
  if (allReviews?.length) {
    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await supabase.from('clubs').update({
      rating:       Math.round(avg * 10) / 10,
      review_count: allReviews.length,
    }).eq('id', clubId);
  }
  return data;
}

// ── Profiles ──────────────────────────────────────────────────

export async function getProfile(userId) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) throw error;
  return data;
}

export async function upsertProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles').update(updates).eq('id', userId).select().single();
  if (error) throw error;
  return data;
}

export async function uploadAvatar(userId, file) {
  const path = `${userId}/${Date.now()}-${file.name}`;
  const url = await uploadClubAsset('avatars', path, file);
  await upsertProfile(userId, { avatar_url: url });
  return url;
}

// ── Favorites ─────────────────────────────────────────────────

export async function getFavorites(userId) {
  const { data, error } = await supabase
    .from('favorites').select('club_id, clubs(*)').eq('user_id', userId);
  if (error) throw error;
  return (data || []).map(f => f.clubs).filter(Boolean);
}

export async function addFavorite(userId, clubId) {
  const { error } = await supabase.from('favorites').insert({ user_id: userId, club_id: clubId });
  if (error && error.code !== '23505') throw error; // ignore unique-violation
}

export async function removeFavorite(userId, clubId) {
  const { error } = await supabase.from('favorites').delete().eq('user_id', userId).eq('club_id', clubId);
  if (error) throw error;
}

export async function isFavorited(userId, clubId) {
  const { data } = await supabase.from('favorites').select('id').eq('user_id', userId).eq('club_id', clubId).maybeSingle();
  return !!data;
}

// ── Applications ──────────────────────────────────────────────

export async function getApplications(userId) {
  const { data, error } = await supabase
    .from('applications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(toAppShape);
}

export async function saveApplication(userId, app) {
  // Try to find existing row for this user+club
  const { data: existing } = await supabase
    .from('applications').select('id').eq('user_id', userId).eq('club_id', app.clubId).maybeSingle();

  const row = {
    user_id:              userId,
    club_id:              app.clubId,
    club_name:            app.clubName,
    club_logo:            app.clubLogo || null,
    student_name:         app.studentName || '',
    position:             app.position || '',
    second_role:          app.secondRole || '',
    year:                 app.year || '',
    program:              app.program || '',
    email:                app.email || '',
    phone:                app.phone || '',
    answers:              app.answers || {},
    resume_file_name:     app.resumeFileName || null,
    status:               app.status || 'Incomplete',
    application_deadline: app.applicationDeadline || '',
    interview_start_date: app.interviewStartDate || '',
    results_released:     app.resultsReleased || '',
    date_submitted:       app.dateSubmitted || '',
  };

  let result;
  if (existing) {
    const { data, error } = await supabase.from('applications').update(row).eq('id', existing.id).select().single();
    if (error) throw error;
    result = data;
  } else {
    const { data, error } = await supabase.from('applications').insert(row).select().single();
    if (error) throw error;
    result = data;
  }
  return toAppShape(result);
}

export async function updateApplication(id, updates) {
  const row = {};
  if ('status' in updates) row.status = updates.status;
  if ('position' in updates) row.position = updates.position;
  if ('secondRole' in updates) row.second_role = updates.secondRole;
  if ('answers' in updates) row.answers = updates.answers;
  if ('dateSubmitted' in updates) row.date_submitted = updates.dateSubmitted;
  if ('interviewSlot' in updates) row.interview_slot = updates.interviewSlot;

  const { data, error } = await supabase.from('applications').update(row).eq('id', id).select().single();
  if (error) throw error;
  return toAppShape(data);
}

export async function deleteApplication(id) {
  const { error } = await supabase.from('applications').delete().eq('id', id);
  if (error) throw error;
}

// Map snake_case DB row → camelCase shape the components expect
function toAppShape(row) {
  if (!row) return null;
  return {
    id:                  row.id,
    clubId:              row.club_id,
    clubName:            row.club_name,
    clubLogo:            row.club_logo,
    position:            row.position,
    secondRole:          row.second_role,
    year:                row.year,
    program:             row.program,
    email:               row.email,
    phone:               row.phone,
    answers:             row.answers || {},
    resumeFileName:      row.resume_file_name,
    status:              row.status,
    applicationDeadline: row.application_deadline,
    interviewStartDate:  row.interview_start_date,
    resultsReleased:     row.results_released,
    dateSubmitted:       row.date_submitted,
    createdAt:           row.created_at,
    studentName:         row.student_name || row.email || 'Applicant',
    interviewSlot:       row.interview_slot || null,
  };
}

// ── Admin ─────────────────────────────────────────────────────

export async function getAllUsers() {
  const { data, error } = await supabase.from('profiles').select('*').order('created_at');
  if (error) throw error;
  return data;
}

export async function getApplicationsByClubName(clubName) {
  const { data, error } = await supabase
    .from('applications')
    .select('*, profiles(name)')
    .eq('club_name', clubName)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(toAppShape);
}

export async function getApplicationsByClubId(clubId) {
  const { data, error } = await supabase
    .from('applications')
    .select('*')
    .eq('club_id', clubId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(toAppShape);
}

// ── Storage ───────────────────────────────────────────────────

export async function uploadClubAsset(bucket, path, file) {
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(path);
  return publicUrl;
}

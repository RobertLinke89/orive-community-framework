-- CRAWLER project apcrvowzrihkpkuwxbhb. Applied 2026-11-02 (approved by Robert).
-- Personal Coaching gets category points like the other core categories (25, 'holistic_core'),
-- and 'performance' is no longer a corporate keyword for Personal Coaching rows (sport performance, not corporate).
-- Rollback: supabase/rollbacks/20261105000000_personal_coaching_scoring.rollback.sql
CREATE OR REPLACE FUNCTION public.orive_quality_signals(f facilitators)
 RETURNS jsonb LANGUAGE sql STABLE AS $function$
with x as (select
 coalesce(f.website,'') w, coalesce(f.email,'') e, coalesce(f.phone,'') p, coalesce(f.instagram,'') ig, coalesce(f.city,'') c,
 coalesce(f.source,'') s, lower(coalesce(f.name,'')||' '||coalesce(f.website,'')) t, coalesce(f.categories,'{}') cats),
y as (select *,
 case when s ~* '(iyengar|mbsr|vmbn|vereniging yoga nederland|cranio|shiatsu|yoga austria|peter hess|european union of yoga|yogalærerforbund|jógakennara|irish yoga|savez za yogu|joga savez|fnely|tam register|apym|joga združenje|kambotree|iakp)' then 'certified_association'
      when s ~* '(icf|coach federation|izba coachingu)' then 'coach_federation'
      when s ~* '(web|own website)' then 'web_crawl' else 'other_directory' end src_type,
 case when w='' then 'none' when w ~* '(facebook|instagram|linktr|linkedin|wix(site)?\.com|jimdo|webnode|wordpress\.com|business\.site|blogspot|godaddysites|coachingfederation|site123|weebly)' then 'free_or_social' else 'own_domain' end web_type,
 (t ~* '(executive|business coach|leadership|corporate|management|manager|sales|career|karriere|consult|hr |team coach|teamcoach|vânzări|afaceri|biznes|uzlet|üzlet|vezet|mentor)'
  or (t ~* 'performance' and not ('Personal Coaching' = any(cats)))) corp,
 t ~* '(psycholog|pszichol|psychotherap|physio|kliniek|clinic|klinik)' clinical,
 cats && array['Yoga','Mindfulness','BodyWork','Sound Healing','Spiritual Growth','Breathwork','Meditation','Ice Bathing','Kambo','Reiki','Sauna & Heat','Personal Coaching'] core
 from x)
select jsonb_build_object(
 'source_type', src_type,
 'source_points', case src_type when 'certified_association' then 30 when 'coach_federation' then 15 when 'web_crawl' then 10 else 10 end,
 'website', web_type,
 'website_points', case web_type when 'own_domain' then 20 when 'free_or_social' then 8 else 0 end,
 'has_email', e<>'', 'has_phone', p<>'', 'has_city', c<>'', 'has_instagram', ig<>'',
 'contact_points', (case when e<>'' then 6 else 0 end)+(case when p<>'' then 5 else 0 end)+(case when c<>'' then 4 else 0 end),
 'social_points', case when ig<>'' then 10 else 0 end,
 'category_fit', case when core then 'holistic_core' when 'Life Coaching'=any(cats) then 'life_coaching' when 'Coaching'=any(cats) then 'generic_coaching' else 'unknown' end,
 'category_points', case when core then 25 when 'Life Coaching'=any(cats) then 15 when 'Coaching'=any(cats) then 8 else 0 end,
 'corporate_keywords', corp, 'clinical_keywords', clinical,
 'penalty', (case when corp then -20 else 0 end)+(case when clinical then -10 else 0 end),
 'years_active', 'unknown', 'reviews', 'unknown', 'model', 'v1') from y $function$;
-- orive_quality_score / orive_quality_tier unchanged (pure sum + thresholds A>=80 B>=65 C>=50).

-- rescore Personal Coaching rows (before-values kept in public._bak_pc_quality_20261102)
UPDATE public.facilitators f SET quality_signals = public.orive_quality_signals(f),
  quality_score = public.orive_quality_score(public.orive_quality_signals(f)),
  quality_tier = public.orive_quality_tier(public.orive_quality_score(public.orive_quality_signals(f))),
  quality_scored_at = now()
WHERE 'Personal Coaching' = ANY(f.categories);

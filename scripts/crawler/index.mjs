/**
 * ORIVE Master Crawler Runner
 * Automatically collects, normalizes, and ingests European wellbeing offerings
 * from Wim Hof Method, Eventbrite Europe (35+ hubs), Premier Studios, and Facilitators.
 * Designed to run on a 24-hour schedule via Vercel cron or on-demand via CLI / cron endpoint.
 */

import { fetchWimHofLive } from './sources/wimHofLive.mjs';
import { fetchEventbriteLive } from './sources/eventbriteLive.mjs';
import { fetchPremierStudios } from './sources/europeanStudiosLive.mjs';
import { fetchEuropeanRetreats } from './sources/retreatsEuropeLive.mjs';
import { fetchEuropeanCommunityEvents } from './sources/meetupEuropeLive.mjs';
import { createNormalizedOffering } from './normalizer.mjs';
import { saveOfferings } from './storage.mjs';
import { renewAllOfferings } from '../renew-offerings.mjs';

export async function runCrawler() {
  const startTime = Date.now();
  console.log('====================================================');
  console.log(`[ORIVE Live Crawler] Starting Pan-European multi-source sync at ${new Date().toISOString()}`);
  console.log('====================================================');

  try {
    // Concurrently fetch real, live offerings from European platforms & studios
    console.log('[ORIVE Live Crawler] Connecting to European feeds (Wim Hof, Eventbrite Europe, Premier Studios, European Retreats, Community Circles)...');
    const [wimHofResults, eventbriteResults, studioResults, retreatResults, communityResults] = await Promise.allSettled([
      fetchWimHofLive(),
      fetchEventbriteLive(),
      Promise.resolve(fetchPremierStudios()),
      fetchEuropeanRetreats(),
      fetchEuropeanCommunityEvents(),
    ]);

    const liveItems = [];

    if (wimHofResults.status === 'fulfilled' && Array.isArray(wimHofResults.value)) {
      console.log(`[ORIVE Live Crawler] Wim Hof Method: ${wimHofResults.value.length} real workshops fetched.`);
      liveItems.push(...wimHofResults.value);
    } else {
      console.error('[ORIVE Live Crawler] Wim Hof fetch failed:', wimHofResults.reason);
    }

    if (eventbriteResults.status === 'fulfilled' && Array.isArray(eventbriteResults.value)) {
      console.log(`[ORIVE Live Crawler] Eventbrite Europe: ${eventbriteResults.value.length} real events fetched.`);
      liveItems.push(...eventbriteResults.value);
    } else {
      console.error('[ORIVE Live Crawler] Eventbrite fetch failed:', eventbriteResults.reason);
    }

    if (studioResults.status === 'fulfilled' && Array.isArray(studioResults.value)) {
      console.log(`[ORIVE Live Crawler] Premier European Studios: ${studioResults.value.length} verified offerings fetched.`);
      liveItems.push(...studioResults.value);
    } else {
      console.error('[ORIVE Live Crawler] Studio fetch failed:', studioResults.reason);
    }

    if (retreatResults.status === 'fulfilled' && Array.isArray(retreatResults.value)) {
      console.log(`[ORIVE Live Crawler] European Retreat Sanctuaries: ${retreatResults.value.length} offerings fetched.`);
      liveItems.push(...retreatResults.value);
    } else {
      console.error('[ORIVE Live Crawler] Retreats fetch failed:', retreatResults.reason);
    }

    if (communityResults.status === 'fulfilled' && Array.isArray(communityResults.value)) {
      console.log(`[ORIVE Live Crawler] European Community Circles: ${communityResults.value.length} offerings fetched.`);
      liveItems.push(...communityResults.value);
    } else {
      console.error('[ORIVE Live Crawler] Community fetch failed:', communityResults.reason);
    }

    console.log(`[ORIVE Live Crawler] Total raw live offerings collected: ${liveItems.length}`);

    // Normalize each offering
    const normalized = liveItems.map(item => createNormalizedOffering(item));

    // Save with deduplication
    const stats = saveOfferings(normalized, { overwrite: false });

    // Refresh rolling dates and populate all 8 wellness categories
    console.log('[ORIVE Live Crawler] Ensuring all 8 categories are fully populated and rolling dates renewed...');
    const renewalStats = renewAllOfferings();

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('====================================================');
    console.log(`[ORIVE Crawler] Sync & Renewal completed in ${elapsed}s`);
    console.log(`[ORIVE Crawler] Total catalog offerings: ${renewalStats.total} | Crawled Added/Updated: ${stats.added + stats.updated}`);
    console.log('====================================================');

    return {
      success: true,
      timestamp: new Date().toISOString(),
      durationSeconds: elapsed,
      crawled: stats,
      renewal: renewalStats,
    };
  } catch (error) {
    console.error('[ORIVE Crawler] Fatal error during crawl:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Execute directly if run via CLI (node scripts/crawler/index.mjs)
if (process.argv[1]?.endsWith('crawler/index.mjs') || process.argv[1]?.endsWith('scripts/crawler')) {
  runCrawler().then(res => {
    if (!res.success) {
      process.exit(1);
    }
    process.exit(0);
  });
}

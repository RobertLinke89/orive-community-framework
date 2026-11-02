 /**
  * Build a URL with UTM query parameters
  */
 export function buildUrlWithUtm(
   baseUrl: string,
   utmParams?: {
     utm_source?: string;
     utm_medium?: string;
     utm_campaign?: string;
     utm_content?: string;
     utm_term?: string;
   }
 ): string {
   if (!utmParams || Object.keys(utmParams).length === 0) return baseUrl;
 
   const url = new URL(baseUrl);
   Object.entries(utmParams).forEach(([key, value]) => {
     if (value) url.searchParams.set(key, value);
   });
   return url.toString();
 }
 
 /**
  * Parse UTM parameters from the current URL
  */
 export function parseUtmFromUrl(urlString?: string): Record<string, string> {
   const url = new URL(urlString || window.location.href);
   const utm: Record<string, string> = {};
   const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
   utmKeys.forEach((key) => {
     const value = url.searchParams.get(key);
     if (value) utm[key] = value;
   });
   return utm;
 }
 
 /**
  * Store UTM in sessionStorage (first-touch) and localStorage (last-touch)
  */
 export function persistUtm(utm: Record<string, string>) {
   if (Object.keys(utm).length === 0) return;
 
   // Last-touch (always overwrite)
   localStorage.setItem("lastUtm", JSON.stringify(utm));
 
   // First-touch (only if not already set)
   const existing = sessionStorage.getItem("firstUtm");
   if (!existing) {
     sessionStorage.setItem("firstUtm", JSON.stringify(utm));
   }
 }
 
 /**
  * Retrieve first-touch and last-touch UTM from storage
  */
 export function getStoredUtm(): { first: Record<string, string>; last: Record<string, string> } {
   const firstRaw = sessionStorage.getItem("firstUtm");
   const lastRaw = localStorage.getItem("lastUtm");
   return {
     first: firstRaw ? JSON.parse(firstRaw) : {},
     last: lastRaw ? JSON.parse(lastRaw) : {},
   };
 }
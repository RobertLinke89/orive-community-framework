import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

type CurrentCounts = Record<string, number>;

type OverrideRow = {
  resource_type: string;
  action: string;
  is_enabled: boolean;
  cooldown_minutes: number;
};

function makeKey(resourceType: string, action: string): string {
  return `${resourceType}::${action}`;
}

function parseKey(key: string): { resourceType: string; action: string } {
  const [resourceType, action] = key.split("::");
  return { resourceType, action: action ?? "" };
}

function iso(d: Date): string {
  return d.toISOString();
}

function uniq<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function buildAlertEmailHtml(params: {
  appUrl: string;
  resourceType: string;
  action: string;
  windowStart: string;
  windowEnd: string;
  currentCount: number;
  baselinePerHour: number;
}): string {
  const ratio =
    params.baselinePerHour > 0
      ? (params.currentCount / params.baselinePerHour).toFixed(2)
      : "∞";

  const auditLink = `${params.appUrl}/admin/pii-audit`;

  return `
  <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; line-height: 1.4">
    <h2 style="margin:0 0 12px">PII Access Spike Detected</h2>
    <p style="margin:0 0 12px">
      A spike was detected for <b>${params.resourceType}</b> / <b>${params.action}</b>.
    </p>
    <table style="border-collapse: collapse; width: 100%; max-width: 720px">
      <tbody>
        <tr>
          <td style="padding: 8px 10px; border: 1px solid #e5e7eb; width: 220px"><b>Window</b></td>
          <td style="padding: 8px 10px; border: 1px solid #e5e7eb">${params.windowStart} → ${params.windowEnd}</td>
        </tr>
        <tr>
          <td style="padding: 8px 10px; border: 1px solid #e5e7eb"><b>Current count</b></td>
          <td style="padding: 8px 10px; border: 1px solid #e5e7eb">${params.currentCount}</td>
        </tr>
        <tr>
          <td style="padding: 8px 10px; border: 1px solid #e5e7eb"><b>7-day baseline / hour</b></td>
          <td style="padding: 8px 10px; border: 1px solid #e5e7eb">${params.baselinePerHour.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding: 8px 10px; border: 1px solid #e5e7eb"><b>Ratio</b></td>
          <td style="padding: 8px 10px; border: 1px solid #e5e7eb">${ratio}×</td>
        </tr>
      </tbody>
    </table>
    <p style="margin:14px 0 0">
      Review details in the admin audit page: <a href="${auditLink}">${auditLink}</a>
    </p>
  </div>
  `;
}

async function getAdminEmails(supabaseUrl: string, serviceKey: string): Promise<string[]> {
  const supabase = createClient(supabaseUrl, serviceKey);

  const { data: roles, error: rolesError } = await supabase
    .from("user_roles")
    .select("user_id")
    .eq("role", "admin")
    .limit(200);

  if (rolesError) throw rolesError;

  const userIds = uniq((roles ?? []).map((r: any) => r.user_id).filter(Boolean));
  if (userIds.length === 0) return [];

  const emails: string[] = [];
  for (const uid of userIds) {
    try {
      // Admin API requires service role key
      const resp = await supabase.auth.admin.getUserById(uid);
      const email = resp.data?.user?.email;
      if (email) emails.push(email);
    } catch (e) {
      console.warn("Failed to resolve admin email for user:", uid, e);
    }
  }

  return uniq(emails);
}

async function loadCurrentCounts(
  supabase: any,
  windowStartISO: string,
  windowEndISO: string
): Promise<CurrentCounts> {
  // We need (resource_type, action) for counting; fetch and aggregate in code.
  const { data, error } = await supabase
    .from("pii_access_log")
    .select("resource_type, action")
    .gte("accessed_at", windowStartISO)
    .lt("accessed_at", windowEndISO)
    .limit(10000);

  if (error) throw error;

  const out: CurrentCounts = {};
  for (const row of data ?? []) {
    const rt = (row as any).resource_type as string | null;
    const act = (row as any).action as string | null;
    if (!rt || !act) continue;
    const k = makeKey(rt, act);
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

async function loadBaselinePerHour(
  supabase: any,
  resourceType: string,
  action: string,
  baselineStartISO: string,
  baselineEndISO: string
): Promise<number> {
  // Baseline: total count over last 7 days divided by 168 hours.
  const { count, error } = await supabase
    .from("pii_access_log")
    .select("id", { count: "exact", head: true })
    .eq("resource_type", resourceType)
    .eq("action", action)
    .gte("accessed_at", baselineStartISO)
    .lt("accessed_at", baselineEndISO);

  if (error) throw error;
  const total = Number(count ?? 0);
  return total / 168;
}

async function isInCooldown(
  supabase: any,
  resourceType: string,
  action: string,
  nowISO: string,
  cooldownMinutes: number
): Promise<boolean> {
  const { data, error } = await supabase
    .from("pii_alert_cooldowns")
    .select("last_alert_at")
    .eq("resource_type", resourceType)
    .eq("action", action)
    .maybeSingle();

  if (error) throw error;
  if (!data?.last_alert_at) return false;

  const last = new Date(data.last_alert_at as string).getTime();
  const now = new Date(nowISO).getTime();
  return now - last < cooldownMinutes * 60 * 1000;
}

async function upsertCooldown(
  supabase: any,
  params: {
    resourceType: string;
    action: string;
    lastAlertAtISO: string;
    windowStartISO: string;
    windowEndISO: string;
    lastCount: number;
    baselinePerHour: number;
  }
): Promise<void> {
  const { error } = await supabase
    .from("pii_alert_cooldowns")
    .upsert(
      {
        resource_type: params.resourceType,
        action: params.action,
        last_alert_at: params.lastAlertAtISO,
        last_window_start: params.windowStartISO,
        last_window_end: params.windowEndISO,
        last_count: params.lastCount,
        baseline_per_hour: params.baselinePerHour,
      },
      { onConflict: "resource_type,action" }
    );

  if (error) throw error;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;

    // We keep this endpoint safe even if it's invoked multiple times:
    // - Global cooldown prevents expensive repeated work
    // - Per-resource cooldown prevents alert spam
    const now = new Date();
    const nowISO = iso(now);

    // 5-minute global run throttle (to prevent repeated invocations)
    const globalKey = "__global__";
    const supabase = createClient(supabaseUrl, serviceKey);
    const globalInCooldown = await isInCooldown(supabase, globalKey, "*", nowISO, 5);
    if (globalInCooldown) {
      return new Response(
        JSON.stringify({ ok: true, skipped: true, reason: "global_cooldown" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // mark global run now (reuses cooldown table)
    await upsertCooldown(supabase, {
      resourceType: globalKey,
      action: "*",
      lastAlertAtISO: nowISO,
      windowStartISO: nowISO,
      windowEndISO: nowISO,
      lastCount: 0,
      baselinePerHour: 0,
    });

    // Time windows
    const windowEnd = now;
    const windowStart = new Date(now.getTime() - 60 * 60 * 1000);
    const baselineEnd = now;
    const baselineStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const windowStartISO = iso(windowStart);
    const windowEndISO = iso(windowEnd);
    const baselineStartISO = iso(baselineStart);
    const baselineEndISO = iso(baselineEnd);

    console.log("PII monitor run", {
      windowStartISO,
      windowEndISO,
      baselineStartISO,
      baselineEndISO,
    });

    const currentCounts = await loadCurrentCounts(supabase, windowStartISO, windowEndISO);
    const keys = Object.keys(currentCounts);

    if (keys.length === 0) {
      return new Response(
        JSON.stringify({ ok: true, spikes: 0, checked: 0 }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resend = new Resend(resendApiKey);
    const adminEmails = await getAdminEmails(supabaseUrl, serviceKey);

    if (adminEmails.length === 0) {
      console.warn("No admin emails found; skipping notifications.");
      return new Response(
        JSON.stringify({ ok: true, spikes: 0, checked: keys.length, warned: "no_admins" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const appUrl = Deno.env.get("APP_URL") || "https://orive.app";

    let spikesSent = 0;
    const decisions: any[] = [];

    // Load enabled overrides once
    const { data: overridesData, error: overridesError } = await supabase
      .from("pii_alert_overrides")
      .select("resource_type, action, is_enabled, cooldown_minutes")
      .eq("is_enabled", true)
      .limit(1000);
    if (overridesError) throw overridesError;

    const overridesMap = new Map<string, OverrideRow>();
    for (const o of (overridesData ?? []) as any[]) {
      if (!o?.resource_type || !o?.action) continue;
      overridesMap.set(makeKey(o.resource_type, o.action), o as OverrideRow);
    }

    for (const key of keys) {
      const { resourceType, action } = parseKey(key);
      const currentCount = currentCounts[key] ?? 0;

      // Spike threshold: 3x baseline AND min 20
      if (currentCount < 20) {
        decisions.push({ resourceType, action, currentCount, skipped: "min_20" });
        continue;
      }

      const baselinePerHour = await loadBaselinePerHour(
        supabase,
        resourceType,
        action,
        baselineStartISO,
        baselineEndISO
      );

      const isSpike = baselinePerHour > 0
        ? currentCount > 3 * baselinePerHour
        : currentCount >= 20; // if no history, treat as spike (still subject to cooldown)

      if (!isSpike) {
        decisions.push({ resourceType, action, currentCount, baselinePerHour, skipped: "below_threshold" });
        continue;
      }

      const override = overridesMap.get(makeKey(resourceType, action));
      const cooldownMinutes =
        override && Number.isFinite(Number(override.cooldown_minutes))
          ? Math.max(1, Math.min(1440, Number(override.cooldown_minutes)))
          : 60;

      const cooldown = await isInCooldown(supabase, resourceType, action, nowISO, cooldownMinutes);
      if (cooldown) {
        decisions.push({ resourceType, action, currentCount, baselinePerHour, cooldownMinutes, skipped: "cooldown" });
        continue;
      }

      const html = buildAlertEmailHtml({
        appUrl,
        resourceType,
        action,
        windowStart: windowStartISO,
        windowEnd: windowEndISO,
        currentCount,
        baselinePerHour,
      });

      const subject = `PII spike: ${resourceType}/${action} (${currentCount} in last hour)`;

      const emailResp = await resend.emails.send({
        from: "ORIVE <onboarding@resend.dev>",
        to: adminEmails,
        subject,
        html,
      });

      console.log("Sent PII spike alert", { resourceType, action, emailResp });
      spikesSent++;

      await upsertCooldown(supabase, {
        resourceType,
        action,
        lastAlertAtISO: nowISO,
        windowStartISO,
        windowEndISO,
        lastCount: currentCount,
        baselinePerHour,
      });

      decisions.push({ resourceType, action, currentCount, baselinePerHour, cooldownMinutes, alerted: true });
    }

    return new Response(
      JSON.stringify({ ok: true, spikesSent, checked: keys.length, decisions }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in monitor-pii-access:", error);
    return new Response(JSON.stringify({ ok: false, error: error?.message ?? String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

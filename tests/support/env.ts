import crypto from "crypto";
import os from "os";
import path from "path";

// Test-mode only: no real keys. Stripe client is a mock; webhook secret is a local dummy.
process.env.BOOKING_TOKEN_SECRET = crypto.randomBytes(32).toString("hex");
process.env.INTAKE_ENCRYPTION_KEY = crypto.randomBytes(32).toString("base64");
process.env.STRIPE_WEBHOOK_SECRET = "whsec_" + crypto.randomBytes(16).toString("hex");
process.env.CRON_SECRET = crypto.randomBytes(24).toString("hex");
process.env.NEXT_PUBLIC_APP_URL = "https://orive.test";
process.env.ORIVE_STORE_FILE = path.join(os.tmpdir(), `orive-store-${process.pid}.json`);
delete process.env.STRIPE_SECRET_KEY;
delete process.env.SUPABASE_SERVICE_ROLE_KEY;
delete process.env.RESEND_API_KEY;
delete process.env.ALLOW_STRIPE_SIMULATION;
delete process.env.VERCEL;
delete process.env.VERCEL_ENV;

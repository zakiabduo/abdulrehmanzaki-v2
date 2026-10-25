import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { z } from "zod";
import { profile } from "@/data/content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(10).max(5000),
});

// Best-effort spam brake (per server instance): 5 messages per IP per 10 minutes.
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 10 * 60_000);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > 5;
}

const clean = (s: string) => s.replace(/[\r\n"<>]/g, " ").trim();

/** Gmail SMTP: free, no domain needed. Message lands in your inbox; Reply goes straight to the visitor. */
async function sendViaGmail(opts: { name: string; email: string; message: string; to: string }) {
  const user = process.env.SMTP_USER!.trim();
  const pass = process.env.SMTP_PASS!.replace(/\s+/g, "");
  const transport = nodemailer.createTransport({ host: "smtp.gmail.com", port: 465, secure: true, auth: { user, pass } });
  await transport.sendMail({
    from: `"${clean(opts.name)} via Portfolio" <${user}>`,
    to: opts.to,
    replyTo: `"${clean(opts.name)}" <${opts.email}>`,
    subject: `New portfolio message from ${clean(opts.name)}`,
    text: `${opts.message}\n\n---\nFrom: ${clean(opts.name)} <${opts.email}>`,
  });
}

/** Resend: needs a verified domain to email anyone except your own Resend account address. */
async function sendViaResend(opts: { name: string; email: string; message: string; to: string }) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY!.trim()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.RESEND_FROM?.trim() || "Portfolio <onboarding@resend.dev>",
      to: [opts.to],
      reply_to: opts.email,
      subject: `New message from ${clean(opts.name)}`,
      text: `${opts.message}\n\nFrom: ${clean(opts.name)} <${opts.email}>`,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text().catch(() => "")}`);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  // Honeypot: bots fill hidden fields. Pretend success, send nothing.
  if (body && typeof body === "object" && "website" in body && body.website) return NextResponse.json({ ok: true });
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (limited(ip)) return NextResponse.json({ error: "Too many messages. Try again later." }, { status: 429 });

  const useGmail = Boolean(process.env.SMTP_USER?.trim() && process.env.SMTP_PASS?.trim());
  const useResend = Boolean(process.env.RESEND_API_KEY?.trim());
  if (!useGmail && !useResend) {
    console.error("No mail provider configured: set SMTP_USER + SMTP_PASS (Gmail) or RESEND_API_KEY");
    return NextResponse.json({ error: "Email service not configured" }, { status: 500 });
  }

  const to = process.env.CONTACT_TO_EMAIL?.trim() || process.env.SMTP_USER?.trim() || profile.email;
  const opts = { ...parsed.data, to };

  try {
    if (useGmail) await sendViaGmail(opts);
    else await sendViaResend(opts);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(useGmail ? "Gmail SMTP failed" : "Resend failed", err);
    return NextResponse.json({ error: "Send failed" }, { status: 502 });
  }
}

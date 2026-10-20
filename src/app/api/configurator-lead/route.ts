import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// TODO: move to environment variables (TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID) and rotate the token.
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "8849520995:AAGibguAuBQLdkohwcj34zvuUjA7JnnGBDU";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "872587503";

type LeadPayload = {
  source?: string;
  intent?: string;
  pageUrl?: string;
  selectedCarModel?: string;
  selectedWheelModel?: string;
  wheel?: {
    model?: string;
    category?: string;
    finish?: string;
    finishHex?: string;
    size?: string;
  };
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
    message?: string;
  };
  /** Honeypot: real visitors never fill this field. */
  company?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clean(value: unknown, max = 200) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function line(label: string, value: string) {
  return value ? `<b>${label}:</b> ${escapeHtml(value)}` : "";
}

export async function POST(request: Request) {
  let payload: LeadPayload;
  try {
    payload = (await request.json()) as LeadPayload;
  } catch {
    return NextResponse.json({ ok: false, message: "Invalid request body" }, { status: 400 });
  }

  // Silently accept bot submissions without forwarding them.
  if (clean(payload.company)) {
    return NextResponse.json({ ok: true });
  }

  const name = clean(payload.customer?.name, 120);
  const email = clean(payload.customer?.email, 160);
  const phone = clean(payload.customer?.phone, 40);
  const message = clean(payload.customer?.message, 1000);

  if (!name || !email || !phone) {
    return NextResponse.json({ ok: false, message: "Please fill in your name, email and phone." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, message: "Please enter a valid email address." }, { status: 400 });
  }
  if (phone.replace(/\D/g, "").length < 6) {
    return NextResponse.json({ ok: false, message: "Please enter a valid phone number." }, { status: 400 });
  }

  const wheelModel = clean(payload.wheel?.model) || clean(payload.selectedWheelModel);
  const finish = clean(payload.wheel?.finish);
  const finishHex = clean(payload.wheel?.finishHex, 20);
  const source = clean(payload.source) || "Website";

  const text = [
    "🛞 <b>New DRAXLER order request</b>",
    line("Source", source),
    line("Request", clean(payload.intent)),
    "",
    "<b>— Customer —</b>",
    line("Name", name),
    line("Email", email),
    line("Phone", phone),
    line("Message", message),
    "",
    "<b>— Configuration —</b>",
    line("Wheel", wheelModel),
    line("Series", clean(payload.wheel?.category)),
    line("Finish", [finish, finishHex && `(${finishHex})`].filter(Boolean).join(" ")),
    line("Size", clean(payload.wheel?.size)),
    line("Vehicle", clean(payload.selectedCarModel)),
    line("Page", clean(payload.pageUrl, 300)),
    "",
    `<i>Received ${new Date().toISOString().replace("T", " ").slice(0, 16)} UTC</i>`,
  ]
    .filter((row, index, rows) => row !== "" || (rows[index - 1] !== "" && index > 0))
    .join("\n");

  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Telegram sendMessage failed:", response.status, await response.text());
      return NextResponse.json(
        { ok: false, message: "We could not send your request. Please try again or contact us on WhatsApp." },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("Telegram request error:", error);
    return NextResponse.json(
      { ok: false, message: "We could not send your request. Please try again or contact us on WhatsApp." },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true, message: "Request received" });
}

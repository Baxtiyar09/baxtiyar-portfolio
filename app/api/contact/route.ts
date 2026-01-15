import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const name = String(body?.name || "").trim();
        const email = String(body?.email || "").trim();
        const message = String(body?.message || "").trim();

        if (!name || !email || !message) {
            return NextResponse.json({ error: "Missing fields." }, { status: 400 });
        }
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            return NextResponse.json({ error: "Invalid email." }, { status: 400 });
        }

        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        const TO_EMAIL = process.env.CONTACT_TO_EMAIL || "baxtiyaralizada1@gmail.com";
        const FROM_EMAIL = "Portfolio <onboarding@resend.dev>";


        if (!RESEND_API_KEY) {
            return NextResponse.json(
                { error: "Server email is not configured." },
                { status: 500 }
            );
        }


        const subject = `Portfolio message from ${name}`;
        const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>New message from portfolio</h2>
        <p><b>Name:</b> ${escapeHtml(name)}</p>
        <p><b>Email:</b> ${escapeHtml(email)}</p>
        <p><b>Message:</b><br/>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
      </div>
    `;

        const resendRes = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${RESEND_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: FROM_EMAIL,
                to: [TO_EMAIL],
                subject,
                html,
                replyTo: email,
            }),
        });

        if (!resendRes.ok) {
            const errText = await resendRes.text().catch(() => "");
            return NextResponse.json(
                { error: "Failed to send email.", details: errText },
                { status: 500 }
            );
        }

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: "Bad request." }, { status: 400 });
    }
}

function escapeHtml(str: string) {
    return str
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

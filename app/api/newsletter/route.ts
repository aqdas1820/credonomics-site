import { NextRequest, NextResponse } from "next/server";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_123');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'CredoNomics <newsletter@credonomics.in>',
      to: [email],
      subject: 'Welcome to CredoNomics!',
      html: '<p>Thanks for subscribing to the <strong>Monthly Indian Equity Opportunity Report</strong>.</p>',
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send welcome email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Subscribed successfully!" }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }
}

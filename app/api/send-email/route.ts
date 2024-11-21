import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, subject, message, attachments } = await request.json();

    // Here you would integrate with an email service (e.g., SendGrid, AWS SES)
    // For demo purposes, we'll just log the email
    console.log(`Email to ${email}:`, {
      subject,
      message,
      attachments
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

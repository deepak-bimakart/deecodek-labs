type ContactPayload = {
  name: string;
  email: string;
  service?: string | null;
  budget?: string | null;
  message: string;
  submissionId: string;
};

/**
 * Notify CONTACT_NOTIFY_EMAIL via Resend when configured.
 * Never throws — failures are logged and swallowed so contact save still succeeds.
 */
export async function notifyContactSubmission(payload: ContactPayload): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.CONTACT_NOTIFY_EMAIL?.trim();
  if (!apiKey || !to) return;

  const from =
    process.env.CONTACT_FROM_EMAIL?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "DeeCodeK Labs <onboarding@resend.dev>";

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const subject = `New contact: ${payload.name}`;
    const lines = [
      `Name: ${payload.name}`,
      `Email: ${payload.email}`,
      payload.service ? `Service: ${payload.service}` : null,
      payload.budget ? `Budget: ${payload.budget}` : null,
      "",
      payload.message,
      "",
      `Submission ID: ${payload.submissionId}`,
    ].filter((l) => l !== null);

    const { error } = await resend.emails.send({
      from,
      to: [to],
      replyTo: payload.email,
      subject,
      text: lines.join("\n"),
    });

    if (error) {
      console.error("[contact-notify] Resend error:", error);
    }
  } catch (e) {
    console.error("[contact-notify] Failed to send:", e);
  }
}

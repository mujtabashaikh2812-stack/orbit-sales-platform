export interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId: string;
  threadId: string;
  isDryRun: boolean;
  error?: string;
}

/**
 * Checks whether Dry-Run Mode is enforced.
 * Defaults to true for complete safety unless explicitly disabled in .env.local
 */
export function isDryRunMode(): boolean {
  return process.env.DRY_RUN_MODE !== "false";
}

export async function sendGmailMessage(
  params: SendEmailParams
): Promise<SendEmailResult> {
  const dryRun = isDryRunMode();
  const clientId = process.env.GMAIL_CLIENT_ID;
  const clientSecret = process.env.GMAIL_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN;
  const senderEmail = process.env.GMAIL_SENDER_EMAIL || "operator@orbit.local";

  // Safety Check: If Dry-Run is active OR Gmail credentials are not present, do not send real email
  if (dryRun || !clientId || !clientSecret || !refreshToken) {
    const timestamp = Date.now();
    return {
      success: true,
      messageId: `gmail_dryrun_msg_${timestamp}`,
      threadId: `gmail_dryrun_th_${timestamp}`,
      isDryRun: true,
    };
  }

  // Live Gmail API sending
  try {
    // 1. Refresh OAuth access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!tokenRes.ok) {
      const tokenErr = await tokenRes.text();
      return {
        success: false,
        messageId: "",
        threadId: "",
        isDryRun: false,
        error: `Gmail OAuth refresh failed: ${tokenErr}`,
      };
    }

    const { access_token } = await tokenRes.json();

    // 2. Build RFC 2822 email payload
    const utf8Subject = `=?utf-8?B?${Buffer.from(params.subject).toString("base64")}?=`;
    const messageParts = [
      `From: ${senderEmail}`,
      `To: ${params.to}`,
      `Subject: ${utf8Subject}`,
      "MIME-Version: 1.0",
      "Content-Type: text/plain; charset=utf-8",
      "",
      params.body,
    ];
    const rawMessage = messageParts.join("\r\n");
    const encodedMessage = Buffer.from(rawMessage)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    // 3. Post to Gmail API
    const sendRes = await fetch(
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/send",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw: encodedMessage }),
      }
    );

    if (!sendRes.ok) {
      const sendErr = await sendRes.text();
      return {
        success: false,
        messageId: "",
        threadId: "",
        isDryRun: false,
        error: `Gmail API sending error (${sendRes.status}): ${sendErr}`,
      };
    }

    const sendData = await sendRes.json();
    return {
      success: true,
      messageId: sendData.id,
      threadId: sendData.threadId,
      isDryRun: false,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error contacting Gmail API";
    return {
      success: false,
      messageId: "",
      threadId: "",
      isDryRun: false,
      error: msg,
    };
  }
}

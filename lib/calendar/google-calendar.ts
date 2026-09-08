export interface CreateEventParams {
  summary: string;
  description: string;
  attendeeEmail: string;
  startTime: string; // ISO string
  durationMinutes: number;
}

export interface CalendarEventResult {
  success: boolean;
  eventId: string;
  meetLink?: string;
  htmlLink?: string;
  isSimulated: boolean;
  error?: string;
}

export async function createGoogleCalendarEvent(
  params: CreateEventParams
): Promise<CalendarEventResult> {
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN;

  // Live Google Calendar API if credentials are provided
  if (
    clientId &&
    clientSecret &&
    refreshToken &&
    !clientId.includes("placeholder")
  ) {
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
          eventId: "",
          isSimulated: false,
          error: `Google Calendar OAuth refresh error: ${tokenErr}`,
        };
      }

      const { access_token } = await tokenRes.json();

      // 2. Calculate start and end ISO dates
      const startDate = new Date(params.startTime);
      const endDate = new Date(startDate.getTime() + params.durationMinutes * 60000);

      // 3. Post event to primary calendar with Google Meet conference enabled
      const eventRes = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            summary: params.summary,
            description: params.description,
            start: { dateTime: startDate.toISOString() },
            end: { dateTime: endDate.toISOString() },
            attendees: [{ email: params.attendeeEmail }],
            conferenceData: {
              createRequest: {
                requestId: `req-${Date.now()}`,
                conferenceSolutionKey: { type: "hangoutsMeet" },
              },
            },
          }),
        }
      );

      if (!eventRes.ok) {
        const eventErr = await eventRes.text();
        return {
          success: false,
          eventId: "",
          isSimulated: false,
          error: `Calendar event creation error (${eventRes.status}): ${eventErr}`,
        };
      }

      const eventData = await eventRes.json();
      return {
        success: true,
        eventId: eventData.id,
        meetLink: eventData.hangoutLink || eventData.conferenceData?.entryPoints?.[0]?.uri,
        htmlLink: eventData.htmlLink,
        isSimulated: false,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error contacting Google Calendar";
      return {
        success: false,
        eventId: "",
        isSimulated: false,
        error: msg,
      };
    }
  }

  // Preview & simulation mode
  const timestamp = Date.now();
  const simulatedId = `gcal_evt_${timestamp}`;
  const simulatedMeet = `https://meet.google.com/orb-${timestamp.toString().slice(-4)}-cal`;

  return {
    success: true,
    eventId: simulatedId,
    meetLink: simulatedMeet,
    htmlLink: `https://calendar.google.com/calendar/event?eid=${simulatedId}`,
    isSimulated: true,
  };
}

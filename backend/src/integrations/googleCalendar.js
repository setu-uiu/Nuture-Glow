import { google } from 'googleapis';

const getOAuthClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return null;
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

const getScopes = () => {
  const raw = process.env.GOOGLE_SCOPES || 'https://www.googleapis.com/auth/calendar';
  return raw
    .split(',')
    .map((scope) => scope.trim())
    .filter(Boolean);
};

export const getGoogleOAuthUrl = (state) => {
  const client = getOAuthClient();
  if (!client) {
    throw new Error('Google OAuth is not configured');
  }

  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: getScopes(),
    state
  });
};

export const exchangeAuthCodeForTokens = async (code) => {
  const client = getOAuthClient();
  if (!client) {
    throw new Error('Google OAuth is not configured');
  }

  const { tokens } = await client.getToken(code);
  return {
    accessToken: tokens.access_token || null,
    refreshToken: tokens.refresh_token || null,
    expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null
  };
};

export const refreshAccessToken = async (refreshToken) => {
  const client = getOAuthClient();
  if (!client) {
    throw new Error('Google OAuth is not configured');
  }

  client.setCredentials({ refresh_token: refreshToken });
  const response = await client.refreshAccessToken();
  const tokens = response.credentials || {};

  return {
    accessToken: tokens.access_token || null,
    refreshToken: tokens.refresh_token || refreshToken || null,
    expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null
  };
};

export const createCalendarEvent = async (accessToken, payload) => {
  const client = getOAuthClient();
  if (!client) {
    throw new Error('Google OAuth is not configured');
  }

  client.setCredentials({ access_token: accessToken });

  const calendar = google.calendar({ version: 'v3', auth: client });
  const event = {
    summary: payload.title,
    description: payload.description || undefined,
    start: {
      dateTime: payload.start,
      timeZone: payload.timeZone || 'UTC'
    },
    end: {
      dateTime: payload.end,
      timeZone: payload.timeZone || 'UTC'
    },
    attendees: Array.isArray(payload.attendees)
      ? payload.attendees.map((email) => ({ email }))
      : undefined
  };

  const result = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: event
  });

  return result.data;
};

export const deleteCalendarEvent = async (accessToken, eventId) => {
  const client = getOAuthClient();
  if (!client) {
    throw new Error('Google OAuth is not configured');
  }

  client.setCredentials({ access_token: accessToken });
  const calendar = google.calendar({ version: 'v3', auth: client });
  await calendar.events.delete({ calendarId: 'primary', eventId });
  return true;
};

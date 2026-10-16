import { createRestClient } from '@jucollet/trivia-client/rest';

// Game server URL. In development, the tvOS simulator reaches the server
// running on the Mac through localhost.
export const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/+$/, '') || 'http://localhost:8080';

// Address of the phone web app, shown on the lobby and encoded in its QR code.
// Override it to test a local client (e.g. http://192.168.1.10:5173).
export const JOIN_URL = process.env.EXPO_PUBLIC_JOIN_URL?.replace(/\/+$/, '') || 'https://trivia.julco.dev';

// Link of the QR code: the phone client opens the join form with the code filled in.
export const joinLink = (code: string) => `${JOIN_URL}/join/${encodeURIComponent(code)}`;

export const api = createRestClient({ baseUrl: API_URL });

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

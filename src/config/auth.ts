// Temporary global authentication token shared by every API call until
// per-user login is wired up across the app. Must match GLOBAL_AUTH_TOKEN
// on the optimus-user-service backend.
export const GLOBAL_AUTH_TOKEN =
  process.env.REACT_APP_AUTH_TOKEN || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

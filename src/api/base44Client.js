import { createClient } from '@base44/sdk';

// Create client without authentication - run locally
export const base44 = createClient({
  appId: "687f33ef23f636e1a60871bd",
  requiresAuth: false // Disable authentication for local development
});

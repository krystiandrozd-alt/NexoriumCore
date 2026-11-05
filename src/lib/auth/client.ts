'use client';

// Nexorium Core - Neon Auth (browser side)
// Talks to the app's own /api/auth/* route, which proxies to Neon Auth.

import { createAuthClient } from '@neon/auth/next';

export const authClient = createAuthClient();

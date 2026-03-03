/**
 * playfab/client.js
 *
 * Low-level PlayFab API client.
 * Handles both Client API (player-authenticated) and Server API (secret key) calls.
 *
 * PlayFab has two relevant APIs:
 *   - Client API: called from the game client (browser), uses a session ticket
 *   - Server API: called from your backend, uses the title secret key
 *
 * This module is the backend Server API client.
 * The Phaser game client will use the PlayFab JavaScript SDK directly.
 */

const https = require('https');

const TITLE_ID = process.env.PLAYFAB_TITLE_ID;
const SECRET_KEY = process.env.PLAYFAB_SECRET_KEY;

if (!TITLE_ID) {
  console.warn('[PlayFab] WARNING: PLAYFAB_TITLE_ID is not set in environment');
}

/**
 * Make an authenticated request to the PlayFab Server API.
 *
 * @param {string} endpoint  - API path, e.g. '/Server/GetPlayerProfile'
 * @param {object} body      - Request payload
 * @returns {Promise<object>} - The `data` field from the PlayFab response
 */
function serverRequest(endpoint, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: `${TITLE_ID}.playfabapi.com`,
      path: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-SecretKey': SECRET_KEY,
        'Content-Length': Buffer.byteLength(data),
      },
    };

    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(raw);
          if (parsed.code === 200) {
            resolve(parsed.data);
          } else {
            const msg = `PlayFab [${parsed.error}]: ${parsed.errorMessage}`;
            console.error(`[PlayFab] API error on ${endpoint}:`, msg, parsed.errorDetails || '');
            reject(new Error(msg));
          }
        } catch (e) {
          reject(new Error(`PlayFab parse error: ${e.message} — raw: ${raw.slice(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

module.exports = { serverRequest };

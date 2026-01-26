/**
 * Smoke Test for Monolith Architecture
 * 
 * Purpose: Verify basic functionality with minimal load
 * - 1 virtual user
 * - 30 second duration
 * - Quick validation that the system works
 */

import { check, sleep } from 'k6';
import http from 'k6/http';
import { config } from '../../config/monolith.js';
import { executeUserFlow } from '../../utils/helpers.js';

export const options = {
  stages: [
    { duration: '10s', target: 1 }, // Ramp up to 1 user
    { duration: '20s', target: 1 }, // Stay at 1 user
    { duration: '5s', target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],    // Error rate should be less than 1%
  },
};

export default function () {
  const baseUrl = config.baseUrl;

  // Optional health check (monolith may not have /health endpoint)
  const healthCheck = http.get(`${baseUrl}/health`);
  check(healthCheck, {
    'health check status is 200 or 404': (r) => r.status === 200 || r.status === 404,
  });

  // Execute full user flow
  executeUserFlow(baseUrl);

  sleep(1);
}

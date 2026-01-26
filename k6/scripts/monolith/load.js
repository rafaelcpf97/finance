/**
 * Load Test for Monolith Architecture
 * 
 * Purpose: Test system under normal expected load
 * - 10 virtual users
 * - 1 minute duration
 * - Simulates typical production load
 */

import { check, sleep } from 'k6';
import http from 'k6/http';
import { config } from '../../config/monolith.js';
import { executeUserFlow } from '../../utils/helpers.js';

export const options = {
  stages: [
    { duration: '10s', target: 5 },  // Ramp up to 5 users
    { duration: '30s', target: 10 }, // Ramp up to 10 users
    { duration: '20s', target: 10 }, // Stay at 10 users
    { duration: '10s', target: 0 },  // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% < 500ms, 99% < 1s
    http_req_failed: ['rate<0.01'],                  // Error rate < 1%
    http_reqs: ['rate>10'],                          // At least 10 requests per second
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

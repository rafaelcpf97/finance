/**
 * Spike Test for Microservices Architecture
 * 
 * Purpose: Test system behavior under sudden load spikes
 * - Rapid increase to 100 users, then back down
 * - Simulates traffic spikes (e.g., flash sales, viral content)
 */

import { check, sleep } from 'k6';
import http from 'k6/http';
import { config } from '../../config/microservices.js';
import { executeUserFlow } from '../../utils/helpers.js';

export const options = {
  stages: [
    { duration: '10s', target: 10 },   // Normal load
    { duration: '5s', target: 100 },   // Sudden spike to 100 users
    { duration: '10s', target: 100 }, // Maintain spike
    { duration: '5s', target: 10 },   // Sudden drop back to normal
    { duration: '10s', target: 10 },  // Normal load
    { duration: '5s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'], // 95% < 3s (more lenient for spikes)
    http_req_failed: ['rate<0.1'],      // Error rate < 10% (more lenient for spikes)
  },
};

export default function () {
  const baseUrl = config.baseUrl;

  // Health check
  const healthCheck = http.get(`${baseUrl}/health`);
  check(healthCheck, {
    'health check status is 200': (r) => r.status === 200,
  });

  // Execute full user flow
  executeUserFlow(baseUrl);

  sleep(0.5);
}

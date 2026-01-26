/**
 * Stress Test for Microservices Architecture
 * 
 * Purpose: Test system under high load to find breaking points
 * - 50 virtual users
 * - 2 minute duration
 * - Identifies performance bottlenecks and limits
 */

import { check, sleep } from 'k6';
import http from 'k6/http';
import { config } from '../../config/microservices.js';
import { executeUserFlow } from '../../utils/helpers.js';

export const options = {
  stages: [
    { duration: '20s', target: 10 },  // Ramp up to 10 users
    { duration: '30s', target: 25 },  // Ramp up to 25 users
    { duration: '30s', target: 50 },  // Ramp up to 50 users
    { duration: '20s', target: 50 },  // Stay at 50 users
    { duration: '20s', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1500', 'p(99)<3000'], // 95% < 1.5s, 99% < 3s
    http_req_failed: ['rate<0.05'],                   // Error rate < 5% (more lenient for stress test)
    http_reqs: ['rate>20'],                           // At least 20 requests per second
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

  sleep(0.5); // Reduced sleep time for higher throughput
}

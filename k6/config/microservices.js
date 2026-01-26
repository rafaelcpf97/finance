/**
 * Microservices Architecture Test Configuration
 * 
 * Base URL: http://localhost:8000 (API Gateway)
 */
export const config = {
  baseUrl: __ENV.BASE_URL || 'http://localhost:8000',
};

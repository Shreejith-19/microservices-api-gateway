/**
 * Temporary placeholder and mock data for UI shell demonstration.
 * CLEARLY SEPARATED from live backend data.
 * In a future phase, these structures will be substituted with live state from the API client.
 */

export const PLACEHOLDER_NOTICE = {
  isPlaceholder: true,
  badgeText: 'PREVIEW / UI DEMO',
  disclaimer: 'Data currently displayed is mock telemetry for layout demonstration.',
};

export const MOCK_SERVICES_HEALTH = [
  {
    name: 'API Gateway',
    port: 3000,
    protocol: 'HTTP/REST',
    status: 'READY',
    role: 'Centralized edge routing, JWT validation & rate limiting',
    endpoint: '/health',
  },
  {
    name: 'Auth Service',
    port: 5001,
    protocol: 'HTTP',
    status: 'STANDBY',
    role: 'Credential hashing, MongoDB auth_db & token signing',
    endpoint: '/api/auth/register',
  },
  {
    name: 'User Service',
    port: 5002,
    protocol: 'HTTP',
    status: 'STANDBY',
    role: 'User profile management & gRPC client dispatcher',
    endpoint: '/api/users/profile',
  },
  {
    name: 'Notification Service',
    port: 50053,
    httpPort: 5003,
    protocol: 'gRPC (HTTP/2)',
    status: 'STANDBY',
    role: 'Binary Protocol Buffers email dispatching engine',
    endpoint: 'rpc SendEmail',
  },
  {
    name: 'Redis',
    port: 6379,
    protocol: 'TCP',
    status: 'STANDBY',
    role: 'Distributed atomic rate-limit counters & sliding TTL',
    endpoint: 'redis://localhost:6379',
  },
];

export const MOCK_USER_PROFILE = {
  userId: '6aac166578bd25ae16472377',
  name: 'Alex Mercer',
  email: 'engineer@microservices.local',
  bio: 'Distributed Systems & Cloud Infrastructure Engineer.',
  profilePicture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  createdAt: '2026-11-05T16:33:41.950Z',
  updatedAt: '2026-11-05T18:12:09.112Z',
};

export const MOCK_JWT_PAYLOAD = {
  header: {
    alg: 'HS256',
    typ: 'JWT',
  },
  payload: {
    userId: '6aac166578bd25ae16472377',
    email: 'engineer@microservices.local',
    iat: 1789663128,
    exp: 1789666728,
  },
  rawToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWFjMTY2NTc4YmQyNWFlMTY0NzIzNzciLCJlbWFpbCI6ImVuZ2luZWVyQG1pY3Jvc2VydmljZXMubG9jYWwiLCJpYXQiOjE3ODk2NjMxMjgsImV4cCI6MTc4OTY2NjcyOH0.PSZWau-t3OsrYTCiqhra0IvJVqZqXMYQCyykWqDbcAo',
};

export const MOCK_REQUEST_LOGS = [
  {
    id: 'req_101',
    timestamp: '22:45:12.842',
    method: 'POST',
    path: '/api/auth/login',
    status: 200,
    durationMs: '18.4',
    clientIp: '127.0.0.1',
    target: 'Auth Service (:5001)',
    headersSent: {
      'content-type': 'application/json',
    },
    injectedHeaders: {},
  },
  {
    id: 'req_102',
    timestamp: '22:45:19.102',
    method: 'GET',
    path: '/api/users/profile',
    status: 200,
    durationMs: '12.8',
    clientIp: '127.0.0.1',
    target: 'User Service (:5002)',
    headersSent: {
      authorization: 'Bearer eyJhbGciOiJIUzI1Ni...',
    },
    injectedHeaders: {
      'x-user-id': '6aac166578bd25ae16472377',
      'x-user-email': 'engineer@microservices.local',
    },
  },
  {
    id: 'req_103',
    timestamp: '22:45:34.901',
    method: 'POST',
    path: '/api/users/test-notification',
    status: 200,
    durationMs: '46.2',
    clientIp: '127.0.0.1',
    target: 'User Service (:5002) -> Notification Service (:50053 gRPC)',
    headersSent: {
      authorization: 'Bearer eyJhbGciOiJIUzI1Ni...',
    },
    injectedHeaders: {
      'x-user-id': '6aac166578bd25ae16472377',
      'x-user-email': 'engineer@microservices.local',
    },
  },
  {
    id: 'req_104',
    timestamp: '22:46:01.320',
    method: 'GET',
    path: '/api/users/profile',
    status: 429,
    durationMs: '1.9',
    clientIp: '127.0.0.1',
    target: 'Rejected at API Gateway (Redis Rate Limit)',
    headersSent: {
      authorization: 'Bearer eyJhbGciOiJIUzI1Ni...',
    },
    injectedHeaders: {},
    errorDetail: 'Too many requests, retry after 42 seconds',
  },
];

export const MOCK_RATE_LIMIT_STATE = {
  limit: 100,
  remaining: 94,
  windowSeconds: 60,
  resetInSeconds: 42,
  key: 'ratelimit:user:6aac166578bd25ae16472377',
  strategy: 'Sliding Window (Redis Atomic Pipeline)',
};


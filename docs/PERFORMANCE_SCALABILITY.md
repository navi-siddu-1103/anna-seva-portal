# Performance & Scalability Analysis - Anna Seva Portal

## Executive Summary

This document provides a comprehensive performance and scalability analysis for the Anna Seva Portal, including current architecture assessment, bottlenecks, optimization strategies, and scaling recommendations.

---

## Current Architecture Overview

### Technology Stack
- **Frontend**: Next.js 15.3.3 with React 18, Turbopack
- **Backend**: Next.js API Routes (Serverless)
- **Database**: MongoDB (Local: `mongodb://localhost:27017/anna-seva-portal`)
- **Authentication**: JWT with HttpOnly cookies, bcryptjs
- **Notifications**: Nodemailer (SMTP), Twilio (SMS)
- **Maps**: Google Maps API
- **AI**: Google Genkit for personalized recommendations

### Current Scale Metrics
- **Users**: Development phase (0-100 users)
- **Database**: 5 collections (users, cardholders, distributors, tokens, distributions)
- **API Endpoints**: ~15 routes
- **Port**: 9002 (Development)
- **Environment**: Single server, local MongoDB

---

## Performance Analysis

### 1. Database Performance

#### Current Issues
❌ **No Connection Pooling**: Each API call creates a new MongoDB connection
❌ **No Database Indexing**: Missing indexes on frequently queried fields
❌ **Inefficient Queries**: No pagination, fetches all documents
❌ **No Caching**: Repeated queries fetch same data from database
❌ **Local MongoDB**: Not production-ready, single point of failure

#### Optimization Strategies

**A. Implement Connection Pooling**
```typescript
// src/lib/mongodb.ts - IMPROVED VERSION
import { MongoClient, MongoClientOptions } from 'mongodb';

let cachedClient: MongoClient | null = null;
let cachedDb: any = null;

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI not defined');
  }

  // Return cached connection
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const options: MongoClientOptions = {
    maxPoolSize: 10, // Connection pool size
    minPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  };

  const client = new MongoClient(uri, options);
  await client.connect();
  
  const db = client.db('anna-seva-portal');
  
  cachedClient = client;
  cachedDb = db;
  
  return { client, db };
}
```

**B. Create Database Indexes**
```javascript
// Run this in MongoDB shell or startup script
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

db.cardholders.createIndex({ userId: 1 });
db.cardholders.createIndex({ cardNumber: 1 }, { unique: true });
db.cardholders.createIndex({ email: 1 });
db.cardholders.createIndex({ status: 1 });

db.distributors.createIndex({ userId: 1 });
db.distributors.createIndex({ licenseNumber: 1 }, { unique: true });
db.distributors.createIndex({ email: 1 });
db.distributors.createIndex({ status: 1 });

db.tokens.createIndex({ cardholderId: 1 });
db.tokens.createIndex({ distributorId: 1 });
db.tokens.createIndex({ tokenNumber: 1 }, { unique: true });
db.tokens.createIndex({ status: 1 });
db.tokens.createIndex({ createdAt: -1 });

db.distributions.createIndex({ cardholderId: 1 });
db.distributions.createIndex({ distributorId: 1 });
db.distributions.createIndex({ tokenId: 1 });
db.distributions.createIndex({ distributionDate: -1 });
```

**C. Implement Query Pagination**
```typescript
// Example: src/app/api/cardholder/list/route.ts
export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const skip = (page - 1) * limit;

  const { db } = await connectToDatabase();
  const cardholders = db.collection('cardholders');

  const [data, total] = await Promise.all([
    cardholders.find({})
      .project({ userId: 0 })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray(),
    cardholders.countDocuments({})
  ]);

  return NextResponse.json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
}
```

**D. Implement Redis Caching**
```typescript
// src/lib/redis.ts - NEW FILE
import { createClient } from 'redis';

let redisClient: any = null;

export async function getRedisClient() {
  if (redisClient) return redisClient;
  
  redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });
  
  await redisClient.connect();
  return redisClient;
}

// Cache wrapper for database queries
export async function cacheQuery(
  key: string, 
  fetchFn: () => Promise<any>, 
  ttl: number = 300 // 5 minutes
) {
  const redis = await getRedisClient();
  
  // Check cache first
  const cached = await redis.get(key);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from database
  const data = await fetchFn();
  
  // Store in cache
  await redis.setEx(key, ttl, JSON.stringify(data));
  
  return data;
}
```

---

### 2. API Performance

#### Current Issues
❌ **No Rate Limiting**: Vulnerable to DDoS attacks
❌ **No Response Compression**: Large JSON payloads
❌ **Synchronous Email/SMS**: Blocks API responses
❌ **No API Monitoring**: Can't track slow endpoints

#### Optimization Strategies

**A. Implement Rate Limiting**
```typescript
// src/middleware/rateLimit.ts - NEW FILE
import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

export async function rateLimit(
  identifier: string, 
  maxRequests: number = 100, 
  windowMs: number = 60000
) {
  const redis = await getRedisClient();
  const key = `ratelimit:${identifier}`;
  
  const requests = await redis.incr(key);
  
  if (requests === 1) {
    await redis.expire(key, Math.floor(windowMs / 1000));
  }
  
  if (requests > maxRequests) {
    return NextResponse.json(
      { error: 'Too many requests' }, 
      { status: 429 }
    );
  }
  
  return null;
}

// Usage in API routes
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const rateLimitError = await rateLimit(ip, 100, 60000);
  if (rateLimitError) return rateLimitError;
  
  // Your API logic here
}
```

**B. Enable Response Compression**
```typescript
// next.config.ts - UPDATE
const nextConfig: NextConfig = {
  compress: true, // Enable gzip compression
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  images: {
    remotePatterns: [/* existing patterns */],
  },
  
  // Additional performance settings
  swcMinify: true,
  reactStrictMode: true,
  
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
};
```

**C. Async Notification Queue**
```typescript
// src/lib/queue.ts - NEW FILE
import { Queue, Worker } from 'bullmq';
import { getRedisClient } from '@/lib/redis';

const notificationQueue = new Queue('notifications', {
  connection: { host: 'localhost', port: 6379 }
});

export async function queueEmail(emailData: any) {
  await notificationQueue.add('send-email', emailData);
}

export async function queueSMS(smsData: any) {
  await notificationQueue.add('send-sms', smsData);
}

// Worker process (separate file or process)
const worker = new Worker('notifications', async (job) => {
  if (job.name === 'send-email') {
    // Send email using nodemailer
  } else if (job.name === 'send-sms') {
    // Send SMS using Twilio
  }
}, {
  connection: { host: 'localhost', port: 6379 }
});

// Update registration API
export async function POST(request: Request) {
  // ... create user ...
  
  // Queue notifications instead of sending directly
  await queueEmail({
    to: email,
    name,
    role
  });
  
  await queueSMS({
    phone,
    name,
    role
  });
  
  // Return immediately
  return NextResponse.json({ success: true });
}
```

---

### 3. Frontend Performance

#### Current Issues
❌ **Large Bundle Size**: All components loaded upfront
❌ **No Image Optimization**: External images not optimized
❌ **No Code Splitting**: Single JavaScript bundle
❌ **No Service Worker**: No offline support

#### Optimization Strategies

**A. Implement Code Splitting**
```typescript
// Use dynamic imports for heavy components
import dynamic from 'next/dynamic';

const DashboardCharts = dynamic(() => import('@/components/dashboard/charts'), {
  loading: () => <Skeleton className="h-[400px]" />,
  ssr: false
});

const MapComponent = dynamic(() => import('@/components/maps/google-maps'), {
  loading: () => <Skeleton className="h-[500px]" />,
  ssr: false
});
```

**B. Optimize Images**
```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image 
  src="/logo.png" 
  alt="Anna Seva Portal"
  width={200}
  height={100}
  priority // For above-fold images
  quality={85}
/>
```

**C. Implement PWA (Progressive Web App)**
```javascript
// Install next-pwa
// npm install next-pwa

// next.config.ts
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  // Your existing Next.js config
});
```

---

## Scalability Recommendations

### Phase 1: Small Scale (100-1,000 users)

**Infrastructure:**
- ✅ MongoDB Atlas (M10 cluster - $57/month)
- ✅ Vercel/Netlify deployment (Free tier)
- ✅ Redis Cloud (Free 30MB)
- ✅ CloudFlare CDN (Free)

**Database:**
- ✅ Create all recommended indexes
- ✅ Enable connection pooling
- ✅ Implement pagination (20 items/page)

**API:**
- ✅ Add rate limiting (100 req/min per IP)
- ✅ Enable response compression
- ✅ Async email/SMS with simple queue

**Estimated Cost:** $70/month

---

### Phase 2: Medium Scale (1,000-10,000 users)

**Infrastructure:**
- ✅ MongoDB Atlas M30 cluster ($260/month)
- ✅ Vercel Pro plan ($20/month)
- ✅ Redis Cloud 250MB ($5/month)
- ✅ CloudFlare Pro ($20/month)
- ✅ Separate worker instance for background jobs

**Database:**
- ✅ MongoDB replica set (3 nodes)
- ✅ Read replicas for analytics
- ✅ Database sharding by region (if multi-state)

**API:**
- ✅ API Gateway with load balancing
- ✅ Separate microservices:
  - Authentication service
  - Notification service
  - Distribution service
- ✅ BullMQ with Redis for job queuing

**Monitoring:**
- ✅ New Relic / DataDog APM
- ✅ Sentry for error tracking
- ✅ LogRocket for session replay

**Estimated Cost:** $350/month

---

### Phase 3: Large Scale (10,000-100,000 users)

**Infrastructure:**
- ✅ MongoDB Atlas M60 cluster ($1,150/month)
- ✅ AWS/Azure Kubernetes Service
- ✅ Redis Cluster (Multiple nodes)
- ✅ CloudFlare Enterprise
- ✅ Multi-region deployment

**Architecture:**
- ✅ Microservices with Docker/Kubernetes
- ✅ API Gateway (Kong/AWS API Gateway)
- ✅ Message Queue (RabbitMQ/Kafka)
- ✅ Event-driven architecture
- ✅ CQRS pattern (Command Query Responsibility Segregation)

**Database:**
- ✅ Sharded MongoDB cluster (by state/region)
- ✅ Separate read/write databases
- ✅ Elasticsearch for search functionality
- ✅ TimescaleDB for analytics/reporting

**CDN & Caching:**
- ✅ Multi-region CDN
- ✅ Redis cluster for caching
- ✅ Edge caching with Cloudflare Workers

**Security:**
- ✅ DDoS protection
- ✅ WAF (Web Application Firewall)
- ✅ API authentication with OAuth2
- ✅ Encryption at rest and in transit

**Estimated Cost:** $3,000-5,000/month

---

### Phase 4: National Scale (100,000+ users)

**Infrastructure:**
- ✅ Multi-cloud deployment (AWS + Azure)
- ✅ Geographic load balancing
- ✅ Auto-scaling groups
- ✅ Dedicated bare-metal for critical services

**Architecture:**
- ✅ Event sourcing architecture
- ✅ Serverless for spiky workloads
- ✅ GraphQL federation
- ✅ gRPC for inter-service communication

**Database:**
- ✅ Multi-region MongoDB clusters
- ✅ Data lakes for analytics (AWS S3 + Athena)
- ✅ Real-time analytics (Apache Flink)
- ✅ Backup to multiple regions

**Performance:**
- ✅ Response time: <200ms (p95)
- ✅ Availability: 99.99% uptime
- ✅ Concurrent users: 10,000+
- ✅ Requests/second: 5,000+

**Estimated Cost:** $15,000-30,000/month

---

## Immediate Action Items (Next 30 Days)

### Priority 1: Critical
1. ✅ **Migrate to MongoDB Atlas** (Free M0 cluster to start)
   - Export local data: `mongodump --db anna-seva-portal`
   - Create Atlas account and cluster
   - Import data: `mongorestore --uri "mongodb+srv://..."`
   - Update `MONGODB_URI` in `.env.local`

2. ✅ **Create Database Indexes** (Run the index creation scripts)

3. ✅ **Implement Connection Pooling** (Update `src/lib/mongodb.ts`)

4. ✅ **Add Pagination to List APIs** (Update list routes)

### Priority 2: High
5. ✅ **Deploy to Vercel/Netlify**
   - Push to GitHub (already done)
   - Connect repository to Vercel
   - Add environment variables
   - Deploy

6. ✅ **Add Basic Rate Limiting** (Simple in-memory for now)

7. ✅ **Enable Response Compression** (Update `next.config.ts`)

8. ✅ **Implement Async Notifications** (Simple queue or skip for now)

### Priority 3: Medium
9. ✅ **Add Error Tracking** (Sentry free tier)

10. ✅ **Implement Code Splitting** (Dynamic imports)

11. ✅ **Optimize Images** (Next.js Image component)

12. ✅ **Add Performance Monitoring** (Vercel Analytics)

---

## Performance Metrics & Targets

### Current Metrics (Development)
- **Page Load Time**: 2-3 seconds
- **API Response Time**: 500-1000ms
- **Database Query Time**: 100-500ms
- **Concurrent Users**: 1-5
- **Uptime**: ~95% (development machine)

### Target Metrics (Production - Phase 1)
- **Page Load Time**: <1 second
- **API Response Time**: <200ms (p95)
- **Database Query Time**: <50ms (p95)
- **Concurrent Users**: 100+
- **Uptime**: 99.5%

### Target Metrics (Production - Phase 2)
- **Page Load Time**: <500ms
- **API Response Time**: <100ms (p95)
- **Database Query Time**: <30ms (p95)
- **Concurrent Users**: 1,000+
- **Uptime**: 99.9%

---

## Monitoring & Observability

### Essential Metrics to Track

**Application Metrics:**
- Request rate (requests/second)
- Error rate (errors/total requests)
- Response time (p50, p95, p99)
- Active users (concurrent sessions)

**Database Metrics:**
- Query execution time
- Connection pool usage
- Cache hit rate
- Slow query log

**Infrastructure Metrics:**
- CPU usage
- Memory usage
- Network I/O
- Disk I/O

### Recommended Tools

**Free Tier Options:**
- ✅ Vercel Analytics (built-in)
- ✅ MongoDB Atlas monitoring (built-in)
- ✅ Sentry (error tracking)
- ✅ Google Analytics (user tracking)
- ✅ Uptime Robot (uptime monitoring)

**Paid Options (for scale):**
- ✅ DataDog APM ($15/host/month)
- ✅ New Relic ($49/month)
- ✅ LogRocket ($99/month)
- ✅ PagerDuty (incident management)

---

## Load Testing Recommendations

### Tools
- **k6**: Modern load testing tool (free)
- **Apache JMeter**: Traditional load testing
- **Artillery**: Node.js load testing
- **Locust**: Python-based load testing

### Test Scenarios

```javascript
// k6 load test script (test.js)
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Error rate under 1%
  },
};

export default function () {
  // Test login
  const loginRes = http.post('http://localhost:9002/api/auth/login', {
    email: 'test@example.com',
    password: 'password123',
  });
  
  check(loginRes, {
    'login successful': (r) => r.status === 200,
  });
  
  sleep(1);
  
  // Test profile fetch
  const profileRes = http.get('http://localhost:9002/api/cardholder/profile');
  
  check(profileRes, {
    'profile fetched': (r) => r.status === 200,
  });
  
  sleep(1);
}
```

Run test:
```bash
k6 run test.js
```

---

## Security Performance Considerations

### Current Vulnerabilities
❌ **No HTTPS** in development (use in production)
❌ **JWT tokens never expire** (add refresh token mechanism)
❌ **No password strength requirements**
❌ **No account lockout after failed attempts**

### Recommendations

**A. Implement Request Throttling**
```typescript
// Prevent brute force attacks on login
const loginAttempts = new Map();

export async function POST(request: Request) {
  const { email } = await request.json();
  const attempts = loginAttempts.get(email) || 0;
  
  if (attempts >= 5) {
    return NextResponse.json(
      { error: 'Too many login attempts. Try again in 15 minutes.' },
      { status: 429 }
    );
  }
  
  // ... login logic ...
  
  if (loginFailed) {
    loginAttempts.set(email, attempts + 1);
    setTimeout(() => loginAttempts.delete(email), 15 * 60 * 1000);
  } else {
    loginAttempts.delete(email);
  }
}
```

**B. Add Security Headers**
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline';"
          },
        ],
      },
    ];
  },
};
```

---

## Cost Optimization

### Current Costs (Development)
- **Infrastructure**: $0 (local)
- **MongoDB**: $0 (local)
- **Email (Gmail)**: $0 (free tier)
- **SMS (Twilio Trial)**: $0 (trial)
- **Total**: $0/month

### Production Cost Breakdown (Phase 1)

| Service | Plan | Cost/Month |
|---------|------|------------|
| MongoDB Atlas | M10 Cluster | $57 |
| Vercel | Hobby (free) | $0 |
| Redis Cloud | 30MB Free | $0 |
| CloudFlare | Free | $0 |
| SendGrid Email | 100/day free | $0 |
| Twilio SMS | Pay-as-you-go | $10-20 |
| Domain | .in domain | $1 |
| **Total** | | **$68-78/month** |

### Cost Optimization Tips
1. ✅ Use MongoDB Atlas free M0 tier initially (512MB)
2. ✅ Vercel free tier supports 100GB bandwidth
3. ✅ SendGrid offers 100 emails/day for free
4. ✅ Twilio trial credits for testing
5. ✅ CloudFlare free tier for CDN
6. ✅ Use GitHub Pages for static docs

---

## Disaster Recovery & Backup

### Backup Strategy

**MongoDB Atlas (Automatic):**
- Continuous backups (point-in-time recovery)
- Snapshot every 6 hours
- Retain snapshots for 7 days

**Manual Backups:**
```bash
# Daily backup script
mongodump --uri="mongodb+srv://..." --out=/backups/$(date +%Y%m%d)

# Upload to S3/Google Cloud Storage
aws s3 cp /backups/$(date +%Y%m%d) s3://anna-seva-backups/ --recursive
```

**Recovery Plan:**
1. ✅ Restore from latest snapshot (MongoDB Atlas - 5 minutes)
2. ✅ Restore from manual backup (10-30 minutes)
3. ✅ Rebuild from source control + seed data (1-2 hours)

---

## Conclusion

The Anna Seva Portal currently has a solid foundation but requires several optimizations before production deployment. The immediate priorities are:

1. **Migrate to cloud database** (MongoDB Atlas)
2. **Add database indexes** for query performance
3. **Implement connection pooling** to handle concurrent users
4. **Deploy to production** (Vercel/Netlify)
5. **Add monitoring** (Sentry, Vercel Analytics)

Following the phased scaling approach outlined above will ensure the application can grow from hundreds to hundreds of thousands of users while maintaining performance and reliability.

---

**Last Updated:** November 23, 2025  
**Next Review:** December 2025

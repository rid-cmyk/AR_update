# Design Document - WhatsApp API Integration

## Overview

Integrasi WhatsApp Business API ke dalam Sistem Manajemen Pondok Pesantren untuk mengirimkan notifikasi otomatis kepada stakeholder (santri, guru, orang tua, admin). Sistem ini akan menggunakan WhatsApp Cloud API (Meta) dengan arsitektur berbasis message queue untuk menangani pengiriman pesan secara asinkron dan scalable.

**Tech Stack:**
- WhatsApp Cloud API (Meta Business Platform)
- Next.js 14 API Routes
- Prisma ORM dengan PostgreSQL
- Redis untuk message queue dan caching
- Webhook untuk callback status pesan

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Application Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   UI Pages   │  │  API Routes  │  │   Webhooks   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Service Layer                                │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ WhatsApp Service │  │  Template Service │  │ Queue Service│  │
│  └────────┬─────────┘  └────────┬─────────┘  └──────┬───────┘  │
└───────────┼────────────────────┼────────────────────┼───────────┘
            │                    │                    │
            ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Data Layer                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │     Redis    │  │  WhatsApp    │          │
│  │   Database   │  │  Message Q   │  │  Cloud API   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### Message Flow

```
User Action → Notification Trigger → Message Queue → WhatsApp API → Recipient
                                          ↓
                                    Message Log
                                          ↓
                                    Webhook Callback → Update Status
```

## Components and Interfaces

### 1. Database Schema Extensions

```prisma
// New tables for WhatsApp integration

model WhatsAppConfig {
  id                Int      @id @default(autoincrement())
  phoneNumberId     String   // WhatsApp Phone Number ID
  businessAccountId String   // WhatsApp Business Account ID
  apiKey            String   // Encrypted API Key
  webhookToken      String   // Webhook verification token
  status            WhatsAppStatus @default(disconnected)
  lastVerified      DateTime?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model WhatsAppTemplate {
  id              Int      @id @default(autoincrement())
  name            String   @unique
  category        TemplateCategory
  language        String   @default("id")
  status          TemplateStatus @default(draft)
  whatsappId      String?  // Template ID from WhatsApp
  header          String?
  body            String
  footer          String?
  buttons         Json?    // Array of button objects
  variables       Json?    // Array of variable placeholders
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  messages        WhatsAppMessage[]
}

model WhatsAppMessage {
  id              Int      @id @default(autoincrement())
  recipient       String   // Phone number in E.164 format
  templateId      Int?
  template        WhatsAppTemplate? @relation(fields: [templateId], references: [id])
  messageType     MessageType @default(template)
  content         String   // Message content or template variables JSON
  status          MessageStatus @default(pending)
  whatsappId      String?  // Message ID from WhatsApp
  conversationType ConversationType?
  cost            Float?   // Cost in IDR
  errorCode       String?
  errorMessage    String?
  sentAt          DateTime?
  deliveredAt     DateTime?
  readAt          DateTime?
  failedAt        DateTime?
  retryCount      Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relations
  userId          Int?
  user            User?    @relation(fields: [userId], references: [id])
  notificationType NotificationType
}

model WhatsAppQuota {
  id              Int      @id @default(autoincrement())
  dailyLimit      Int      @default(1000)
  monthlyLimit    Int      @default(10000)
  costThreshold   Float    @default(1000000) // in IDR
  dailyCount      Int      @default(0)
  monthlyCount    Int      @default(0)
  currentCost     Float    @default(0)
  lastResetDaily  DateTime @default(now())
  lastResetMonthly DateTime @default(now())
  bypassCategories Json?   // Array of notification types that bypass limit
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model WhatsAppWebhookLog {
  id              Int      @id @default(autoincrement())
  eventType       String
  payload         Json
  signature       String?
  processed       Boolean  @default(false)
  error           String?
  createdAt       DateTime @default(now())
}

enum WhatsAppStatus {
  connected
  disconnected
  error
}

enum TemplateCategory {
  authentication
  marketing
  utility
}

enum TemplateStatus {
  draft
  pending_approval
  approved
  rejected
}

enum MessageType {
  template
  text
  interactive
}

enum MessageStatus {
  pending
  queued
  sent
  delivered
  read
  failed
}

enum ConversationType {
  service
  marketing
  utility
}

enum NotificationType {
  forgot_passcode
  hafalan_update
  target_achieved
  pengumuman
  ujian_result
  raport_ready
  absensi_alert
  jadwal_reminder
  prestasi_notification
}
```

### 2. WhatsApp Service Layer

**File:** `lib/services/whatsapp.service.ts`

```typescript
interface WhatsAppServiceInterface {
  // Configuration
  verifyConnection(): Promise<boolean>;
  getConfig(): Promise<WhatsAppConfig | null>;
  updateConfig(config: Partial<WhatsAppConfig>): Promise<WhatsAppConfig>;
  
  // Template Management
  createTemplate(template: CreateTemplateDto): Promise<WhatsAppTemplate>;
  syncTemplates(): Promise<void>;
  getTemplateByName(name: string): Promise<WhatsAppTemplate | null>;
  
  // Message Sending
  sendTemplateMessage(params: SendTemplateParams): Promise<WhatsAppMessage>;
  sendTextMessage(recipient: string, text: string): Promise<WhatsAppMessage>;
  sendInteractiveMessage(params: SendInteractiveParams): Promise<WhatsAppMessage>;
  
  // Queue Management
  queueMessage(message: QueueMessageDto): Promise<void>;
  processQueue(): Promise<void>;
  retryFailedMessages(): Promise<void>;
  
  // Status & Monitoring
  getMessageStatus(messageId: string): Promise<MessageStatus>;
  getStatistics(period: 'daily' | 'weekly' | 'monthly'): Promise<Statistics>;
  checkQuota(): Promise<QuotaStatus>;
}

interface SendTemplateParams {
  recipient: string;
  templateName: string;
  variables: Record<string, string>;
  userId?: number;
  notificationType: NotificationType;
}

interface QueueMessageDto {
  recipient: string;
  templateName?: string;
  content: string;
  messageType: MessageType;
  notificationType: NotificationType;
  userId?: number;
  priority?: number;
}

interface Statistics {
  totalMessages: number;
  successRate: number;
  failedRate: number;
  totalCost: number;
  byCategory: Record<NotificationType, number>;
}
```

### 3. Template Service

**File:** `lib/services/template.service.ts`

```typescript
interface TemplateServiceInterface {
  // Template CRUD
  create(data: CreateTemplateDto): Promise<WhatsAppTemplate>;
  update(id: number, data: UpdateTemplateDto): Promise<WhatsAppTemplate>;
  delete(id: number): Promise<void>;
  findAll(filter?: TemplateFilter): Promise<WhatsAppTemplate[]>;
  findByName(name: string): Promise<WhatsAppTemplate | null>;
  
  // Template Rendering
  renderTemplate(templateName: string, variables: Record<string, string>): Promise<string>;
  validateVariables(templateName: string, variables: Record<string, string>): boolean;
  
  // WhatsApp Sync
  submitToWhatsApp(templateId: number): Promise<void>;
  syncStatus(templateId: number): Promise<TemplateStatus>;
}

interface CreateTemplateDto {
  name: string;
  category: TemplateCategory;
  language: string;
  body: string;
  header?: string;
  footer?: string;
  buttons?: ButtonConfig[];
  variables?: string[];
}

interface ButtonConfig {
  type: 'quick_reply' | 'url' | 'phone_number';
  text: string;
  url?: string;
  phoneNumber?: string;
}
```

### 4. Queue Service (Redis)

**File:** `lib/services/queue.service.ts`

```typescript
interface QueueServiceInterface {
  // Queue Operations
  enqueue(message: QueueMessageDto): Promise<void>;
  dequeue(): Promise<QueueMessageDto | null>;
  peek(): Promise<QueueMessageDto | null>;
  getQueueSize(): Promise<number>;
  
  // Priority Queue
  enqueuePriority(message: QueueMessageDto, priority: number): Promise<void>;
  
  // Dead Letter Queue
  moveToDeadLetter(message: QueueMessageDto, error: string): Promise<void>;
  getDeadLetterQueue(): Promise<QueueMessageDto[]>;
  retryDeadLetter(messageId: number): Promise<void>;
  
  // Batch Operations
  enqueueBatch(messages: QueueMessageDto[]): Promise<void>;
  dequeueBatch(count: number): Promise<QueueMessageDto[]>;
}
```

### 5. Notification Triggers

**File:** `lib/services/notification-trigger.service.ts`

```typescript
interface NotificationTriggerInterface {
  // Forgot Passcode
  onForgotPasscodeRequest(userId: number, phoneNumber: string): Promise<void>;
  
  // Hafalan
  onHafalanCreated(hafalanId: number): Promise<void>;
  onTargetAchieved(targetId: number): Promise<void>;
  
  // Pengumuman
  onPengumumanCreated(pengumumanId: number): Promise<void>;
  
  // Ujian & Raport
  onUjianVerified(ujianId: number): Promise<void>;
  onRaportGenerated(raportId: number): Promise<void>;
  
  // Absensi
  onAbsensiAlpha(absensiId: number): Promise<void>;
  sendDailyAbsensiSummary(guruId: number): Promise<void>;
  
  // Jadwal
  sendJadwalReminder(jadwalId: number): Promise<void>;
  
  // Prestasi
  onPrestasiValidated(prestasiId: number): Promise<void>;
}
```

### 6. Webhook Handler

**File:** `app/api/webhooks/whatsapp/route.ts`

```typescript
interface WebhookHandlerInterface {
  // Verification
  verifyWebhook(signature: string, payload: string): boolean;
  
  // Event Handlers
  handleMessageStatus(event: MessageStatusEvent): Promise<void>;
  handleIncomingMessage(event: IncomingMessageEvent): Promise<void>;
  
  // Logging
  logWebhookEvent(event: WebhookEvent): Promise<void>;
}

interface MessageStatusEvent {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: number;
  recipient_id: string;
  errors?: Array<{
    code: number;
    title: string;
    message: string;
  }>;
}
```

## Data Models

### WhatsApp Message Lifecycle

```
pending → queued → sent → delivered → read
                    ↓
                  failed (retry up to 3 times)
                    ↓
              dead_letter_queue
```

### Template Variable Format

```json
{
  "forgot_passcode_registered": {
    "variables": ["{{1}}", "{{2}}", "{{3}}"],
    "mapping": {
      "{{1}}": "tanggal",
      "{{2}}": "nama",
      "{{3}}": "passcode"
    }
  }
}
```

### Cost Calculation

```typescript
// Conversation-based pricing (Indonesia)
const PRICING = {
  service: 500,      // IDR per conversation
  marketing: 1000,   // IDR per conversation
  utility: 300       // IDR per conversation
};

// Conversation window: 24 hours
// Multiple messages within 24h = 1 conversation
```

## Error Handling

### Error Categories

1. **API Errors (4xx, 5xx)**
   - 400: Invalid request format
   - 401: Authentication failed
   - 403: Permission denied
   - 429: Rate limit exceeded
   - 500: WhatsApp server error

2. **Business Logic Errors**
   - Invalid phone number format
   - Template not approved
   - Quota exceeded
   - Recipient not found

3. **Network Errors**
   - Timeout (> 30 seconds)
   - Connection refused
   - DNS resolution failed

### Retry Strategy

```typescript
const RETRY_CONFIG = {
  maxRetries: 3,
  backoffMultiplier: 3,
  initialDelay: 5000, // 5 seconds
  // Delays: 5s, 15s, 45s
};

async function retryWithBackoff(fn: () => Promise<any>, attempt = 0) {
  try {
    return await fn();
  } catch (error) {
    if (attempt >= RETRY_CONFIG.maxRetries) {
      throw error;
    }
    
    const delay = RETRY_CONFIG.initialDelay * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt);
    await sleep(delay);
    return retryWithBackoff(fn, attempt + 1);
  }
}
```

### Error Logging

```typescript
interface ErrorLog {
  messageId: number;
  errorCode: string;
  errorMessage: string;
  requestPayload: any;
  responsePayload: any;
  timestamp: Date;
  retryCount: number;
}
```

## Testing Strategy

### Unit Tests

1. **Template Service**
   - Template rendering with variables
   - Variable validation
   - Template CRUD operations

2. **WhatsApp Service**
   - Message formatting
   - API request construction
   - Error handling

3. **Queue Service**
   - Enqueue/dequeue operations
   - Priority queue ordering
   - Dead letter queue management

4. **Notification Triggers**
   - Correct template selection
   - Variable mapping
   - Recipient resolution

### Integration Tests

1. **API Routes**
   - POST /api/whatsapp/send
   - GET /api/whatsapp/templates
   - POST /api/webhooks/whatsapp

2. **Database Operations**
   - Message logging
   - Status updates
   - Quota tracking

3. **WhatsApp API**
   - Send template message
   - Webhook verification
   - Template sync

### End-to-End Tests

1. **Forgot Passcode Flow**
   - User requests reset → Message queued → Sent → Delivered

2. **Hafalan Notification Flow**
   - Guru creates hafalan → Parent receives notification

3. **Broadcast Flow**
   - Admin creates pengumuman → Multiple recipients receive messages

### Manual Testing Checklist

- [ ] WhatsApp API connection setup
- [ ] Template creation and approval
- [ ] Send test message to registered number
- [ ] Verify webhook callback reception
- [ ] Check message status updates
- [ ] Test quota limiting
- [ ] Test retry mechanism
- [ ] Verify cost calculation
- [ ] Test error scenarios (invalid number, failed API)
- [ ] Load test with 100+ messages

## Security Considerations

### API Key Management

```typescript
// Encrypt API keys before storing
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!;
const ALGORITHM = 'aes-256-gcm';

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(':');
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

### Webhook Signature Verification

```typescript
function verifyWebhookSignature(payload: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.WHATSAPP_APP_SECRET!)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### Rate Limiting

```typescript
// Implement rate limiting per user/IP
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
});

async function checkRateLimit(identifier: string): Promise<boolean> {
  const { success } = await ratelimit.limit(identifier);
  return success;
}
```

### Data Privacy

- Phone numbers stored in E.164 format
- Message content not logged (only metadata)
- PII masked in error logs
- Audit trail for all WhatsApp operations

## Performance Optimization

### Caching Strategy

```typescript
// Cache templates in Redis
const CACHE_TTL = 3600; // 1 hour

async function getTemplateWithCache(name: string): Promise<WhatsAppTemplate | null> {
  const cacheKey = `template:${name}`;
  
  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from database
  const template = await prisma.whatsAppTemplate.findUnique({
    where: { name }
  });
  
  if (template) {
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(template));
  }
  
  return template;
}
```

### Batch Processing

```typescript
// Process messages in batches to avoid rate limiting
const BATCH_SIZE = 10;
const BATCH_DELAY = 2000; // 2 seconds between batches

async function processBatch() {
  const messages = await queueService.dequeueBatch(BATCH_SIZE);
  
  for (const message of messages) {
    try {
      await whatsappService.sendMessage(message);
      await sleep(200); // 200ms delay between messages
    } catch (error) {
      await queueService.moveToDeadLetter(message, error.message);
    }
  }
  
  if (messages.length === BATCH_SIZE) {
    await sleep(BATCH_DELAY);
    await processBatch(); // Process next batch
  }
}
```

### Database Indexing

```sql
-- Indexes for performance
CREATE INDEX idx_whatsapp_message_status ON "WhatsAppMessage"(status);
CREATE INDEX idx_whatsapp_message_created_at ON "WhatsAppMessage"(createdAt);
CREATE INDEX idx_whatsapp_message_recipient ON "WhatsAppMessage"(recipient);
CREATE INDEX idx_whatsapp_message_notification_type ON "WhatsAppMessage"(notificationType);
CREATE INDEX idx_whatsapp_template_name ON "WhatsAppTemplate"(name);
CREATE INDEX idx_whatsapp_template_status ON "WhatsAppTemplate"(status);
```

## Monitoring & Alerting

### Metrics to Track

1. **Message Metrics**
   - Total messages sent (daily/monthly)
   - Success rate
   - Failed rate
   - Average delivery time

2. **Cost Metrics**
   - Daily cost
   - Monthly cost
   - Cost per notification type
   - Projected monthly cost

3. **Performance Metrics**
   - Queue size
   - Processing time
   - API response time
   - Retry rate

4. **Error Metrics**
   - Error rate by type
   - Dead letter queue size
   - Webhook failures

### Alert Conditions

```typescript
const ALERT_THRESHOLDS = {
  failureRate: 0.1,        // Alert if > 10% messages fail
  queueSize: 1000,         // Alert if queue > 1000 messages
  costThreshold: 0.8,      // Alert at 80% of monthly budget
  apiResponseTime: 5000,   // Alert if response > 5 seconds
  deadLetterSize: 50       // Alert if DLQ > 50 messages
};
```

### Dashboard Widgets

1. **Real-time Stats**
   - Messages sent today
   - Current queue size
   - Success rate (24h)
   - Cost today

2. **Charts**
   - Messages by notification type (pie chart)
   - Message trend (line chart)
   - Cost trend (line chart)
   - Success/failure rate (bar chart)

3. **Recent Activity**
   - Last 10 messages sent
   - Recent failures
   - Webhook events

## Deployment Considerations

### Environment Variables

```env
# WhatsApp API
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_API_KEY=your_api_key
WHATSAPP_APP_SECRET=your_app_secret
WHATSAPP_WEBHOOK_TOKEN=your_webhook_token

# Encryption
ENCRYPTION_KEY=your_32_byte_hex_key

# Redis
REDIS_URL=redis://localhost:6379

# Quota
WHATSAPP_DAILY_LIMIT=1000
WHATSAPP_MONTHLY_LIMIT=10000
WHATSAPP_COST_THRESHOLD=1000000
```

### Background Jobs

```typescript
// Cron jobs for maintenance tasks

// 1. Process message queue (every minute)
cron.schedule('* * * * *', async () => {
  await queueService.processQueue();
});

// 2. Retry failed messages (every 5 minutes)
cron.schedule('*/5 * * * *', async () => {
  await whatsappService.retryFailedMessages();
});

// 3. Reset daily quota (every day at midnight)
cron.schedule('0 0 * * *', async () => {
  await quotaService.resetDailyQuota();
});

// 4. Sync template status (every hour)
cron.schedule('0 * * * *', async () => {
  await templateService.syncAllTemplates();
});

// 5. Send daily absensi summary (every day at 6 PM)
cron.schedule('0 18 * * *', async () => {
  await notificationTrigger.sendAllDailyAbsensiSummaries();
});

// 6. Send jadwal reminders (every 30 minutes)
cron.schedule('*/30 * * * *', async () => {
  await notificationTrigger.sendUpcomingJadwalReminders();
});
```

### Scalability

- Use Redis cluster for high availability
- Implement horizontal scaling for API routes
- Use database connection pooling
- Implement circuit breaker for WhatsApp API calls
- Use CDN for static assets (template images)

## Migration Plan

### Phase 1: Setup & Configuration
1. Create database tables
2. Setup WhatsApp Business Account
3. Configure API credentials
4. Setup Redis instance

### Phase 2: Core Services
1. Implement WhatsApp service
2. Implement template service
3. Implement queue service
4. Setup webhook endpoint

### Phase 3: Notification Triggers
1. Forgot passcode integration
2. Hafalan notifications
3. Pengumuman broadcast
4. Ujian & raport notifications

### Phase 4: Monitoring & Optimization
1. Setup dashboard
2. Implement alerting
3. Performance optimization
4. Load testing

### Phase 5: Production Rollout
1. Soft launch (limited users)
2. Monitor and fix issues
3. Full rollout
4. Documentation and training

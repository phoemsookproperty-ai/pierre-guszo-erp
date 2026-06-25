# Provider Integration Guide — AI Try-On Studio

This document provides technical instructions on configuring external virtual try-on APIs (Fashn, Fal, Replicate), formatting request/response payloads, configuring webhooks/polling, and calculating budget limits.

---

## 1. Provider Adapter Payload Specifications

To ensure the system is extensible, each provider adapter implements the standard `VirtualTryOnProvider` interface. The server gathers options and converts them to the exact payload format required by each API.

### A. Fashn API Configuration (`fashn.ts`)
* **Endpoint**: `https://api.fashn.ai/v1/run`
* **Auth Header**: `Authorization: Bearer <FASHN_API_KEY>`
* **Request Payload**:
```json
{
  "model_image": "https://supabase-signed-source-url.com",
  "garment_image": "https://supabase-signed-garment-url.com",
  "category": "tops", // tops, bottoms, one-pieces
  "mode": "professional",
  "cover_feet": true,
  "adjust_hands": true,
  "guidance_scale": 2.5,
  "timesteps": 25,
  "seed": 42
}
```
* **Response Payload (Async Job Created)**:
```json
{
  "id": "job_abc123xyz",
  "status": "queued",
  "position": 1
}
```

---

### B. Fal AI API Configuration (`fal.ts`)
* **Endpoint**: `https://queue.fal.run/fal-ai/foduu/idm-vton`
* **Auth Header**: `Authorization: Key <FAL_API_KEY>`
* **Request Payload**:
```json
{
  "human_image_url": "https://supabase-signed-source-url.com",
  "garment_image_url": "https://supabase-signed-garment-url.com",
  "description": "A midnight navy double breasted custom fit wool suit",
  "category": "upper_body" // upper_body, lower_body, dresses
}
```
* **Response Payload**:
```json
{
  "request_id": "req-123-abc",
  "status": "IN_QUEUE",
  "queue_position": 2
}
```

---

### C. Replicate API Configuration (`replicate.ts`)
* **Endpoint**: `https://api.replicate.com/v1/predictions`
* **Auth Header**: `Authorization: Token <REPLICATE_API_TOKEN>`
* **Request Payload**:
```json
{
  "version": "da77198e0e935a4d6b63...", // IDM-VTON model version hash
  "input": {
    "human_image": "https://supabase-signed-source-url.com",
    "garment_image": "https://supabase-signed-garment-url.com",
    "description": "dark grey check jacket suit",
    "category": "upper_body"
  }
}
```

---

## 2. Webhooks vs. Polling Queues

Due to varying processing durations (10–30 seconds), the platform supports both **Webhooks** (for production environments) and **Polling** (for simpler setups or local preview modes).

* **Polling (Default)**: The server queries the job status every 3 seconds:
  `GET https://api.fashn.ai/v1/status/{job_id}`.
* **Webhooks (Production)**: The generation API includes a `webhook` callback URL in the request payload. The provider sends a `POST` request with the finalized payload upon completion. We verify this webhook signature using a shared secret (`AI_TRYON_WEBHOOK_SECRET`).

---

## 3. Cost & Budget Control Math

To prevent unexpected API billing spikes, every request goes through a strict budget validation layer.

```typescript
export interface BudgetCheckResult {
  allowed: boolean;
  reason?: string;
  estimatedCost: number;
}

export async function checkBudgetLimit(
  userId: string,
  customerId: string,
  requestedCount: number,
  costPerImage: number
): Promise<BudgetCheckResult> {
  const estimatedCost = requestedCount * costPerImage;
  const today = new Date().toISOString().split('T')[0];

  // 1. Fetch current daily total cost spent
  const dailySpend = await getDailySystemCost(today);
  const monthlySpend = await getMonthlySystemCost();
  
  const maxDailyBudget = parseFloat(process.env.AI_TRYON_DAILY_BUDGET || '10.00');
  const maxMonthlyBudget = parseFloat(process.env.AI_TRYON_MONTHLY_BUDGET || '100.00');

  // 2. Check global budget caps
  if (dailySpend + estimatedCost > maxDailyBudget) {
    return { allowed: false, reason: 'EXCEEDED_DAILY_GLOBAL_BUDGET', estimatedCost };
  }
  if (monthlySpend + estimatedCost > maxMonthlyBudget) {
    return { allowed: false, reason: 'EXCEEDED_MONTHLY_GLOBAL_BUDGET', estimatedCost };
  }

  // 3. Check individual Sales user caps
  const userDailyCount = await getUserDailyGenerationsCount(userId, today);
  const userDailyLimit = parseInt(process.env.AI_TRYON_USER_DAILY_LIMIT || '20');
  
  if (userDailyCount + requestedCount > userDailyLimit) {
    return { allowed: false, reason: 'EXCEEDED_USER_DAILY_LIMIT', estimatedCost };
  }

  return { allowed: true, estimatedCost };
}
```

### Auto-Notification Triggering
* **70% Threshold**: Logs a system alert and warns the dashboard.
* **90% Threshold**: Sends a priority notification to the Manager profile.
* **100% Threshold**: Immediately locks the generation API endpoints for all non-Owner roles.

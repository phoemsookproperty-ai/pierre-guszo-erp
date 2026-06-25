# Implementation Plan — AI Virtual Try-On Studio Module

Add the AI Virtual Try-On Studio ("ลองสูทเสมือนด้วย AI") feature into the Pierre Guszo ERP. This module enables staff to capture customer photographs, execute AI virtual try-ons with face preservation, and link the resulting mockup images directly to customer profiles, invoices, and job cards.

---

## User Review Required

> [!IMPORTANT]
> **1. Image Quality Check Engine**
> We propose using a lightweight server-side check (verifying size, aspect ratios, and using a simple face-detection API if available) or mocking it during early stages. Do you want an automated ML model for face detection and blur checks (e.g. MediaPipe or face-api.js run on the server/client), or should we start with a simpler aspect-ratio + file-size + placeholder validation layout that allows human override? (We recommend client-side basic validation + simple server-side mock for stability, as run-time ML libraries can bloat Next.js builds).
>
> **2. Storage Retention Policy**
> Due to storage limits and privacy (PDPA), we recommend a default retention policy of **30 days** for non-selected Try-On results, while keeping "Selected" results indefinitely as they belong to active production jobs. Please let us know if you prefer a different duration.

---

## Open Questions

> [!NOTE]
> **1. Credit Limits and Approvals**
> The system requires tracking estimated costs per session. If a user exceeds their daily credit limit, they must request Owner approval. We will provide a simple database approval workflow. Do you have a preferred initial daily limit per Sales user? (We suggest 20 generations per user per day).

---

## Proposed Changes

We will introduce the following files into the existing `pierre-guszo-erp` repository.

### Database Migrations
#### [NEW] [20260625000000_ai_tryon_schema.sql](file:///Users/wuttichai/.gemini/antigravity/scratch/pierre-guszo-erp/supabase/migrations/20260625000000_ai_tryon_schema.sql)
Creates the try-on catalog, sessions, results, consents, provider configurations, and logging tables. Configures RLS policies for each table.

#### [NEW] [20260625000001_ai_tryon_seed.sql](file:///Users/wuttichai/.gemini/antigravity/scratch/pierre-guszo-erp/supabase/migrations/20260625000001_ai_tryon_seed.sql)
Seeds the catalog with 20 realistic color & pattern variations and default styles.

### Core Architecture & Providers
#### [NEW] [tryon.ts](file:///Users/wuttichai/.gemini/antigravity/scratch/pierre-guszo-erp/src/lib/tryon.ts)
Unified provider interface declarations, prompt assembler utilities, and the provider registry client.

#### [NEW] [mock.ts](file:///Users/wuttichai/.gemini/antigravity/scratch/pierre-guszo-erp/src/lib/adapters/mock.ts)
A reliable local mock adapter that simulates API latency, queue states, and returns realistic placeholder images for sandbox execution.

#### [NEW] [fal.ts](file:///Users/wuttichai/.gemini/antigravity/scratch/pierre-guszo-erp/src/lib/adapters/fal.ts)
Adapter implementation for the Fal AI virtual try-on API.

#### [NEW] [fashn.ts](file:///Users/wuttichai/.gemini/antigravity/scratch/pierre-guszo-erp/src/lib/adapters/fashn.ts)
Adapter implementation for the Fashn try-on API.

### Next.js API Routes & Server Actions
#### [NEW] [route.ts](file:///Users/wuttichai/.gemini/antigravity/scratch/pierre-guszo-erp/src/app/api/ai-tryon/sessions/route.ts)
Handles session initialization, source image registration, and quality check validations.

#### [NEW] [route.ts](file:///Users/wuttichai/.gemini/antigravity/scratch/pierre-guszo-erp/src/app/api/ai-tryon/sessions/[id]/generate/route.ts)
Validates consent and budget before executing AI adapters, pushing request to queue.

#### [NEW] [route.ts](file:///Users/wuttichai/.gemini/antigravity/scratch/pierre-guszo-erp/src/app/api/ai-tryon/sessions/[id]/status/route.ts)
Handles queue status polling.

#### [NEW] [route.ts](file:///Users/wuttichai/.gemini/antigravity/scratch/pierre-guszo-erp/src/app/api/ai-tryon/consent/route.ts)
Records digital signature and consent logs.

### Frontend Routing & Pages
#### [MODIFY] [sidebar.tsx](file:///Users/wuttichai/.gemini/antigravity/scratch/pierre-guszo-erp/src/components/layout/sidebar.tsx)
Insert the new "ลองสูทเสมือนด้วย AI" sidebar entry under the "งานวัดตัว / ผลิต" category.

#### [NEW] [page.tsx](file:///Users/wuttichai/.gemini/antigravity/scratch/pierre-guszo-erp/src/app/(dashboard)/tryon/page.tsx)
Main dashboard screen for the AI Virtual Try-On Studio.

#### [NEW] [tryon-tab.tsx](file:///Users/wuttichai/.gemini/antigravity/scratch/pierre-guszo-erp/src/components/tryon/tryon-tab.tsx)
Tab container integrated into the Customer profile page displaying past Try-On histories.

---

## Phased Implementation Plan

### Phase 1: Database Schema & Seed Catalog
* Implement database table structures, triggers, and indices.
* Configure RLS filters (Owner/Manager can manage budgets/providers, Sales can run sessions, Tailors can read results).
* Load the seed catalog containing 20 patterns and styles.

### Phase 2: Customer Consent & Upload Wizard
* Implement PDPA/AI Consent capture layout with digital signature canvas.
* Develop custom `<CameraCapture />` component with Webrtc camera selection, flash control, and silhouette overlay.
* Create basic image metadata scrubbing and quality review parser (resolution, aspect ratio check).

### Phase 3: Provider Abstraction & Queue System
* Setup `VirtualTryOnProvider` interfaces and Mock adapter returning structured data.
* Build API route controllers.
* Implement status queue poller.

### Phase 4: Studio Workspace UI & Compare Mode
* Implement three-pane split layout: Customer snapshot, Wizard configuration, and Result grids.
* Build Compare overlay supporting side-by-side panning, zooming, and favoriting.
* Enable linking selected generated images directly to existing orders and invoice items.

### Phase 5: Budget Admin & Cost Tracking
* Develop cost tracking logs, daily user budget locks, and warning flags at 70%, 90%, and 100% consumption.
* Implement Owner approval requests dashboard.
* Build automated Playwright E2E verification test suite.

---

## Verification Plan

### Automated Tests
* **Unit Tests**:
  * Run validation schema checks: `npm run test` (verify Zod shapes for generation settings, aspect ratio validators, and budget credit calculations).
* **E2E Integration Checks**:
  * We will add a mock testing suite verifying:
    * Init Session -> Trigger Mock Generation -> Verify status poller transitions through states (Queued -> Processing -> Completed) -> Read mock outputs -> Link to Order.

### Manual Verification
1. **Mock Login Testing**:
   * Login as Sales: Verify access to generate image but disabled access to change API configs or view global costs.
   * Login as Owner: Verify capability to change provider costs and override user limits.
2. **PDPA Block**:
   * Navigate to Try-On page. Choose customer without active consent: Verify prompt blocking wizard and requesting signature.
3. **Camera Silhouette**:
   * Test camera component on tablet/mobile screens to check overlay fit and rotation angles.

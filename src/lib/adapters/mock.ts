import { TryOnGenerationInput, TryOnGenerationResult, TryOnJobStatus, VirtualTryOnProvider } from '../tryon';

// In-memory job state store for simulation
interface MockJob {
  id: string;
  createdAt: number;
  input: TryOnGenerationInput;
  cancelled: boolean;
}

const mockJobs = new Map<string, MockJob>();

// Sample high-quality unsplash suit images to match user selections
const suitMockImages = [
  'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=600&auto=format&fit=crop', // Navy Blue
  'https://images.unsplash.com/photo-1593032465175-481ac7f401a0?q=80&w=600&auto=format&fit=crop', // Charcoal Grey
  'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?q=80&w=600&auto=format&fit=crop', // Sand Beige
  'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop', // Black Tuxedo
];

export class MockAdapter implements VirtualTryOnProvider {
  async generate(input: TryOnGenerationInput): Promise<TryOnGenerationResult> {
    const jobId = `mock_job_${Math.random().toString(36).substring(2, 11)}_${Date.now()}`;
    
    mockJobs.set(jobId, {
      id: jobId,
      createdAt: Date.now(),
      input,
      cancelled: false,
    });

    return {
      providerJobId: jobId,
      status: 'queued',
      estimatedCost: 0.0000,
    };
  }

  async getStatus(jobId: string): Promise<TryOnJobStatus> {
    const job = mockJobs.get(jobId);
    
    if (!job) {
      return {
        providerJobId: jobId,
        status: 'failed',
        error: 'Job not found in mock store',
      };
    }

    if (job.cancelled) {
      return {
        providerJobId: jobId,
        status: 'failed',
        error: 'Job was cancelled by request',
      };
    }

    const elapsedSeconds = (Date.now() - job.createdAt) / 1000;

    // Simulate standard queues transitions:
    // 0-3s: Queued
    // 3-8s: Processing (progress 10-90%)
    // > 8s: Completed
    if (elapsedSeconds < 3) {
      return {
        providerJobId: jobId,
        status: 'queued',
        progressPct: 0,
      };
    } else if (elapsedSeconds < 8) {
      const progressPct = Math.min(Math.round(((elapsedSeconds - 3) / 5) * 100), 95);
      return {
        providerJobId: jobId,
        status: 'processing',
        progressPct,
      };
    } else {
      // Completed - Pick mockup image based on color hex or default
      const images: string[] = [];
      const imageCount = job.input.numImages || 1;
      
      for (let i = 0; i < imageCount; i++) {
        // Rotates between mock photos or adds index query params to prevent caching
        const baseImg = suitMockImages[(i + Math.floor(elapsedSeconds)) % suitMockImages.length];
        images.push(`${baseImg}&idx=${i}&color=${encodeURIComponent(job.input.colorHex)}`);
      }

      return {
        providerJobId: jobId,
        status: 'completed',
        progressPct: 100,
        outputImageUrls: images,
      };
    }
  }

  async cancel(jobId: string): Promise<void> {
    const job = mockJobs.get(jobId);
    if (job) {
      job.cancelled = true;
    }
  }
}

/**
 * Registry client factory function.
 */
export function getProviderAdapter(providerName: string): VirtualTryOnProvider {
  return new MockAdapter();
}

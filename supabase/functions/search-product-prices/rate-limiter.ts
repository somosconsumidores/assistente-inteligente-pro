
// Rate limiter and circuit breaker for API calls
export class RateLimiter {
  private lastAmazonCall: number = 0;
  private amazonCallCount: number = 0;
  private amazonCircuitOpen: boolean = false;
  private amazonCircuitOpenTime: number = 0;
  private readonly AMAZON_MIN_DELAY = 1200; // 1.2 seconds between calls
  private readonly AMAZON_CIRCUIT_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CALLS_PER_MINUTE = 10;
  private readonly RESET_WINDOW = 60 * 1000; // 1 minute

  async waitForAmazonCall(): Promise<boolean> {
    const now = Date.now();
    
    // Check if circuit breaker is open
    if (this.amazonCircuitOpen) {
      if (now - this.amazonCircuitOpenTime > this.AMAZON_CIRCUIT_TIMEOUT) {
        console.log('Amazon circuit breaker reset - attempting recovery');
        this.amazonCircuitOpen = false;
        this.amazonCallCount = 0;
      } else {
        console.log('Amazon circuit breaker is open - skipping Amazon API call');
        return false;
      }
    }

    // Reset call count if window expired
    if (now - this.lastAmazonCall > this.RESET_WINDOW) {
      this.amazonCallCount = 0;
    }

    // Check rate limit
    if (this.amazonCallCount >= this.MAX_CALLS_PER_MINUTE) {
      console.log('Amazon rate limit reached - skipping call');
      return false;
    }

    // Wait for minimum delay
    const timeSinceLastCall = now - this.lastAmazonCall;
    if (timeSinceLastCall < this.AMAZON_MIN_DELAY) {
      const waitTime = this.AMAZON_MIN_DELAY - timeSinceLastCall;
      console.log(`Rate limiting: waiting ${waitTime}ms before Amazon API call`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastAmazonCall = Date.now();
    this.amazonCallCount++;
    return true;
  }

  handleAmazonError(statusCode: number): void {
    if (statusCode === 429) {
      console.log('Amazon API rate limit hit - opening circuit breaker');
      this.amazonCircuitOpen = true;
      this.amazonCircuitOpenTime = Date.now();
    }
  }

  async exponentialBackoff(attempt: number, maxAttempts: number = 3): Promise<void> {
    if (attempt >= maxAttempts) return;
    
    const delay = Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10 seconds
    console.log(`Exponential backoff: waiting ${delay}ms (attempt ${attempt + 1}/${maxAttempts})`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}

export const rateLimiter = new RateLimiter();

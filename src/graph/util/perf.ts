/**
 * Performance measurement utilities for graph rendering
 */

/**
 * Measure the execution time of an async function
 */
export async function measureRenderTime<T>(
  fn: () => Promise<T>
): Promise<{ result: T; timeMs: number }> {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return { result, timeMs: end - start };
}

/**
 * Measure the execution time of a sync function
 */
export function measureSyncTime<T>(
  fn: () => T
): { result: T; timeMs: number } {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  return { result, timeMs: end - start };
}

/**
 * Estimate FPS over a duration by counting frames
 */
export async function estimateFPS(durationMs: number = 1000): Promise<number> {
  return new Promise((resolve) => {
    let frameCount = 0;
    const startTime = performance.now();

    function countFrame() {
      frameCount++;
      const elapsed = performance.now() - startTime;

      if (elapsed < durationMs) {
        requestAnimationFrame(countFrame);
      } else {
        const fps = (frameCount / elapsed) * 1000;
        resolve(Math.round(fps));
      }
    }

    requestAnimationFrame(countFrame);
  });
}

/**
 * Get current memory usage (if available)
 * Returns undefined if memory API is not available
 */
export function getMemoryUsage(): number | undefined {
  // Check if performance.memory is available (Chrome only)
  const perf = performance as Performance & {
    memory?: { usedJSHeapSize: number };
  };

  if (perf.memory) {
    return perf.memory.usedJSHeapSize;
  }

  return undefined;
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Format milliseconds to human-readable string
 */
export function formatMs(ms: number): string {
  if (ms < 1) return `${(ms * 1000).toFixed(0)} us`;
  if (ms < 1000) return `${ms.toFixed(1)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}

/**
 * Create a performance mark for timing sections
 */
export function createPerformanceTimer(name: string) {
  const markStart = `${name}-start`;
  const markEnd = `${name}-end`;
  const measureName = `${name}-duration`;

  return {
    start() {
      performance.mark(markStart);
    },
    end(): number {
      performance.mark(markEnd);
      try {
        performance.measure(measureName, markStart, markEnd);
        const entries = performance.getEntriesByName(measureName);
        const duration = entries[entries.length - 1]?.duration || 0;
        // Clean up
        performance.clearMarks(markStart);
        performance.clearMarks(markEnd);
        performance.clearMeasures(measureName);
        return duration;
      } catch {
        return 0;
      }
    },
  };
}

/**
 * Debounce function for preventing excessive re-renders
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function for limiting re-render frequency
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

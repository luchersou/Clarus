export async function waitFor<T>(
  check: () => Promise<T | null | undefined | false>,
  { timeoutMs = 10_000, intervalMs = 100, message = "condition" } = {},
): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const result = await check();
    if (result) return result;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error(`Timed out waiting for ${message}`);
}
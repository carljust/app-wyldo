export function callbackCode(url: string, expectedRedirect: string): string {
  const actual = new URL(url),
    expected = new URL(expectedRedirect);
  if (
    actual.protocol !== expected.protocol ||
    actual.host !== expected.host ||
    actual.pathname !== expected.pathname ||
    actual.hash
  )
    throw new Error("Invalid authentication callback");
  if (actual.searchParams.has("error"))
    throw new Error("Authentication was cancelled or denied");
  const codes = actual.searchParams.getAll("code");
  if (codes.length !== 1 || !codes[0] || codes[0].length > 2048)
    throw new Error("Missing authentication code");
  return codes[0];
}

import { RequestParams } from 'artillery';

export function beforeRequest(
  req: RequestParams,
  context: any,
  ee: any,
  next: () => void
): void {
  const token = context.vars.token;

  if (!req.headers) req.headers = {}; // Ensure headers object exists

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;

    // 🔍 Debug log (optional — remove in final test)
    console.log(`[Token Attached] ${token.slice(0, 20)}...`);
  } else {
    console.warn('❌ No token found in context.vars');
  }

  return next();
}

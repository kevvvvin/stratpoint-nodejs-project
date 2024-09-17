export async function fetchHelper<T>(
  authHeader: string,
  url: string,
  method: string,
  body?: T,
  internalSecret?: string,
): Promise<Response> {
  const headers: HeadersInit = {
    Authorization: authHeader,
    'Content-Type': 'application/json',
  };

  if (internalSecret) headers['x-internal-service-secret'] = internalSecret;

  const fetchOptions: RequestInit = {
    method: method,
    headers: headers,
  };

  if (body) fetchOptions.body = JSON.stringify(body);

  const response = await fetch(url, fetchOptions);
  return response;
}

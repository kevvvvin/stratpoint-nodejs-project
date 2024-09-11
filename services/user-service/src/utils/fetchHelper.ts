export async function fetchHelper<T>(
  authHeader: string,
  url: string,
  method: string,
  body: T,
): Promise<Response> {
  const fetchOptions: RequestInit = {
    method: method,
    headers: {
      Authorization: authHeader,
      'Content-Type': 'application/json',
    },
  };

  if (body) fetchOptions.body = JSON.stringify(body);

  const response = await fetch(url, fetchOptions);
  return response;
}

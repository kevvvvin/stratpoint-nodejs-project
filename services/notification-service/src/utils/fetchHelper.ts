import { envConfig } from '../configs';

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
      'x-internal-service-secret': envConfig.serviceSecret as string,
    },
  };

  if (body) fetchOptions.body = JSON.stringify(body);

  const response = await fetch(url, fetchOptions);
  return response;
}

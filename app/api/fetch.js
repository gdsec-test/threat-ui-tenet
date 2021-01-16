import fetch from '@gasket/fetch';

export default async ({ url, params = {}, method = 'GET' }) => {
  const payload = {
    method,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }
  if (method !== 'GET') {
    payload.body = JSON.stringify(params);
  }
  // handle if it's not JSON
  const resp = await fetch(url, payload);
  return await resp.json();
};

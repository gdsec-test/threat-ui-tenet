import fetch from './fetch';

export default async (inputs) => {
  const resp = await fetch({
    url: '/api/classify',
    method: 'POST',
    params: {
      iocs: inputs
    }
  });
  return Object.keys(resp).map((type) => ({ type, input: resp[type] }));
};

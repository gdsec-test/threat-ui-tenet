import fetch from './fetch';

export default async (inputs) => {
  return await fetch({
    url: '/api/classify',
    method: 'POST',
    params: {
      iocs: inputs
    }
  });
};

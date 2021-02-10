import fetch from './fetch';

export default async (inputs) => {
  return await fetch({
    url: '/api/classifications',
    method: 'POST',
    params: {
      iocs: inputs
    }
  });
};

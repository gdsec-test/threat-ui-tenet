import fetch from './fetch';

export default async ({ inputType, inputs = [], modules = [], metadata = {} }) => {
  return await fetch({
    url: '/api/jobs',
    method: 'POST',
    params: {
      iocType: inputType,
      iocs: inputs,
      modules,
      metadata
    }
  });
};

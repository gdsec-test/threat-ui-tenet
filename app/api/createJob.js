import fetch from './fetch';

export default async ({ inputType, inputs=[], modules = [] }) => {
  return await fetch({ url: '/job', method: 'POST', params: {
    'ioc_type': inputType,
    'iocs': inputs,
    modules
  }});
};
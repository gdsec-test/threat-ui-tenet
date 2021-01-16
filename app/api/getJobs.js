import fetch from './fetch';

export default async () => {
  return await fetch({ url: '/jobs'});
};

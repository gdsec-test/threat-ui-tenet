import fetch from './fetch';

export default async (id) => {
  return await fetch({ url: `/api/job/${id}`});
};

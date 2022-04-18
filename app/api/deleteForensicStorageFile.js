import fetch from './fetch';

export default async (filePath) => {
  return await fetch({
    url: '/api/forensic/delete',
    method: 'DELETE',
    params: {
      filePath
    }
  });
};

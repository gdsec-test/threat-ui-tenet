import fetch from '@gasket/fetch';

export default async () => {
  const res = await fetch('/jobs');
  if (res.ok) {
    // handle success
  } else {
    // handle error
  }
};
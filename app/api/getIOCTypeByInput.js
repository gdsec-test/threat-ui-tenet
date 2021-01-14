const REGEX = {
  MD5: /^[a-f0-9]{32}$/
};

export default async (input) => {
  return await new Promise(resolve => {
    const name = Object.keys(REGEX).find(regexName => {
      const regex = REGEX[regexName];
      return regex.test(input);
    });
    resolve(name || 'unknown');
  });
};
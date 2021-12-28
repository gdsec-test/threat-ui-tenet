/* eslint-disable complexity */
import fetch from './fetch';

export default async () => {
  const modules = await fetch({ url: '/api/modules' });
  const mappedModules = [];
  for (const module in modules) {
    if (module) {
      mappedModules.push({
        module,
        domain: modules[module].supportedIOCTypes.includes('DOMAIN') ? 'Yes' : 'No',
        url: modules[module].supportedIOCTypes.includes('URL') ? 'Yes' : 'No',
        ip: modules[module].supportedIOCTypes.includes('IP') ? 'Yes' : 'No',
        email: modules[module].supportedIOCTypes.includes('EMAIL') ? 'Yes' : 'No',
        md5: modules[module].supportedIOCTypes.includes('MD5') ? 'Yes' : 'No',
        sha1: modules[module].supportedIOCTypes.includes('SHA1') ? 'Yes' : 'No',
        sha256: modules[module].supportedIOCTypes.includes('SHA256') ? 'Yes' : 'No',
        sha512: modules[module].supportedIOCTypes.includes('SHA512') ? 'Yes' : 'No',
        cve: modules[module].supportedIOCTypes.includes('CVE') ? 'Yes' : 'No',
        hostname: modules[module].supportedIOCTypes.includes('HOSTNAME') ? 'Yes' : 'No',
        godaddyusername: modules[module].supportedIOCTypes.includes('GODADDY_USERNAME') ? 'Yes' : 'No',
        awshostname: modules[module].supportedIOCTypes.includes('AWSHOSTNAME') ? 'Yes' : 'No'
      });
    }
  }
  return mappedModules;
};

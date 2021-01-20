import { IOC_TYPE } from '../utils/const';

const MODULES = {
  [IOC_TYPE.UNKNOWN]: ['whois', 'splunk'],
  [IOC_TYPE.DOMAIN]: ['whois'],
  [IOC_TYPE.EMAIL]: ['whois', 'snow', 'recordedFuture'],
  [IOC_TYPE.CVE]: ['whois', 'circl'],
  [IOC_TYPE.CWE]: ['whois', 'circl'],
  [IOC_TYPE.CAPEC]: ['whois', 'auth0'],
  [IOC_TYPE.CPE]: ['whois', 'cmap'],
  [IOC_TYPE.URL]: ['whois', 'emailReputation'],
  [IOC_TYPE.MD5]: ['whois', 'mitre'],
  [IOC_TYPE.SHA1]: ['whois', 'recordedFuture', 'snow', 'tanium', 'urlhaus', 'mitre', 'geoip', 'splunk'],
  [IOC_TYPE.SHA256]: ['whois'],
  [IOC_TYPE.SHA512]: ['whois'],
  [IOC_TYPE.IP]: ['whois'],
  [IOC_TYPE.HOSTNAME]: ['whois'],
  [IOC_TYPE.AWSHOSTNAME]: ['whois'],
  [IOC_TYPE.GODADDY_USERNAME]: ['whois'],
  [IOC_TYPE.MITRE_TACTIC]: ['whois'],
  [IOC_TYPE.MITRE_TECHNIQUE]: ['whois'],
  [IOC_TYPE.MITRE_SUBTECHNIQUE]: ['whois'],
  [IOC_TYPE.MITRE_MITIGATION]: ['whois']
};

export default (IOCTypes) => {
  return new Promise(resolve => {
    resolve(IOCTypes.reduce((acc, { type, input }) => {
      const modules = MODULES[type];
      modules.forEach(module => {
        if (!acc.has(module)) {
          acc.set(module, { count: 0, values: []});
        }
        const moduleItem = acc.get(module);
        moduleItem.count++;
        moduleItem.values.push({ type, input });
      });
      return acc;
    }, new Map()));
  });
};

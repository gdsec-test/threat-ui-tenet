import { IOC_TYPE } from '../utils/const';

const REGEX = {
  [IOC_TYPE.UNKNOWN]: /^$/gi,
  [IOC_TYPE.IP]: /\b(?:(?:2(?:[0-4][0-9]|5[0-5])|[0-1]?[0-9]?[0-9])\.){3}(?:(?:2([0-4][0-9]|5[0-5])|[0-1]?[0-9]?[0-9]))\b/gi,
  [IOC_TYPE.DOMAIN]: /(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]/gi,
  [IOC_TYPE.EMAIL]: /^([A-Z|a-z|0-9](\.|_){0,1})+[A-Z|a-z|0-9]@([A-Z|a-z|0-9])+((\.){0,1}[A-Z|a-z|0-9]){2}\.[a-z]{2,3}$/gi,
  [IOC_TYPE.CVE]: /CVE-\d{4}-\d{4,7}/gi,
  [IOC_TYPE.CWE]: /^$/gi,
  [IOC_TYPE.CAPEC]: /^$/gi,
  [IOC_TYPE.CPE]: /^$/gi,
  [IOC_TYPE.URL]: /^(https?:\/\/)?([\da-z.-]+\.[a-z.]{2,6}|[\d.]+)([/:?=&#]{1}[\da-z.-]+)*[/?]?$/gim,
  [IOC_TYPE.MD5]: /^[a-f0-9]{32}$/,
  [IOC_TYPE.SHA1]: /\b([a-fA-F0-9]{40})\b/g,
  [IOC_TYPE.SHA256]: /\b([a-fA-F0-9]{64})\b/g,
  [IOC_TYPE.SHA512]: /\b([a-fA-F0-9]{128})\b/g,
  [IOC_TYPE.HOSTNAME]: /^(?!\w+:\/\/)[^\s:]+\.[^\s:]+(:\d+)?(?!:)$/gm,
  [IOC_TYPE.AWSHOSTNAME]: /^https?:\/\/sqs.[\w\d\-.]{7,40}\.amazonaws.com\/[\d]{12}\/[a-zA-Z0-9-_]{1,80}$/gm,
  [IOC_TYPE.GODADDY_USERNAME]: /^$/gi,
  [IOC_TYPE.MITRE_TACTIC]: /^$/gi,
  [IOC_TYPE.MITRE_TECHNIQUE]: /^$/gi,
  [IOC_TYPE.MITRE_SUBTECHNIQUE]: /^$/gi,
  [IOC_TYPE.MITRE_MITIGATION]: /^$/gi
};

export default async inputs => {
  return await new Promise(resolve => {
    const names = inputs.replaceAll(' ', '').split(',').map(input => {
      const type = Object.keys(REGEX).find(regexName => {
        const regex = REGEX[regexName];
        return regex.test(input);
      }) || IOC_TYPE.UNKNOWN;
      return { input, type };
    });
    resolve(names);
  });
};

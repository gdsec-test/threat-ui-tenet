const MODULES = {
  unknown: ["whois", "splunk"],
  domain:["whois"],
  email: ["whois", "snow", "recordedFuture"],
  cve: ["whois", "circl"],
  cwe: ["whois", "circl"],
  capec: ["whois", "auth0"],
  cpe: ["whois", "cmap"],
  url:["whois", "emailReputation"],
  MD5: ["whois", "mitre"],
  sha1: ["whois", "recordedFuture", "snow", "tanium", "urlhaus", "mitre", "geoip", "splunk"],
  sha256:["whois"],
  sha512: ["whois"],
  ip: ["whois"],
  hostname: ["whois"],
  awshostname:["whois"],
  godaddy_username: ["whois"],
  mitre_tactic:["whois"],
  mitre_technique: ["whois"],
  mitre_subtechnique: ["whois"],
  mitre_mitigation: ["whois"]
}

export default(IOCType) => {
  return new Promise(resolve => {
    resolve(MODULES[IOCType]);
  });
};

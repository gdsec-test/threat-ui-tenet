export const IOC_TYPE = {
  AWSHOSTNAME: 'awshostname',
  CAPEC: 'capec',
  CPE: 'cpe',
  CVE: 'cve',
  CWE: 'cwe',
  DOMAIN: 'domain',
  EMAIL: 'email',
  GODADDY_USERNAME: 'godaddy_username',
  HOSTNAME: 'hostname',
  IP: 'ip',
  MD5: 'md5',
  MITRE_MITIGATION: 'mitre_mitigation',
  MITRE_SUBTECHNIQUE: 'mitre_subtechnique',
  MITRE_TACTIC: 'mitre_tactic',
  MITRE_TECHNIQUE: 'mitre_technique',
  MITRE_MATRIX: 'mitre_matrix',
  MITRE_GROUP: 'mitre_group',
  MITRE_SOFTWARE: 'mitre_software',
  SHA1: 'sha1',
  SHA256: 'sha256',
  SHA512: 'sha512',
  UNKNOWN: 'unknown',
  URL: 'url'
};

export const MODULES = {
  APIVOID: 'apivoid',
  WHOIS: 'whois',
  SPLUNK: 'splunk',
  SNOW: 'snow',
  RECORDEDFUTURE: 'recordedFuture',
  CIRCL: 'circl',
  AUTH0: 'auth0',
  EMAILREPUTATION: 'emailReputation',
  MITRE: 'mitre',
  TANIUM: 'tanium',
  URLHAUS: 'urlhaus',
  GEOIP: 'geoip',
  PASSIVETOTAL: 'passivetotal',
  TRUSTAR: 'trustar',
  ZEROBOUNCE: 'zerobounce',
  URLSCANIO: 'urlscanio',
  SUCURI: 'sucuri'
};

export const JOB_STATUS = {
  PENDING: 'PENDING',
  DONE: 'DONE'
};

export const IOC_TYPE_DESC = {
  unknown: { desc: 'Unknown', id: 'unknown' },
  domain: { desc: 'Domain', id: 'domain' },
  email: { desc: 'Email Address', id: 'email' },
  cve: { desc: 'CVE', id: 'cve' },
  cwe: { desc: 'CWE', id: 'cwe' },
  capec: { desc: 'CAPEC', id: 'capec' },
  cpe: { desc: 'CPE', id: 'cpe' },
  url: { desc: 'URL', id: 'url' },
  md5: { desc: 'MD5 Hash', id: 'md5' },
  sha1: { desc: 'SHA1 Hash', id: 'sha1' },
  sha256: { desc: 'SHA256 Hash', id: 'sha256' },
  sha512: { desc: 'SHA512 Hash', id: 'sha512' },
  ip: { desc: 'IP Address', id: 'ip' },
  hostname: { desc: 'Hostname (GoDaddy machine hostnames)', id: 'hostname' },
  awshostname: { desc: 'Hostname (AWS hostnames)', id: 'awshostname' },
  godaddy_username: { desc: 'GoDaddy Username', id: 'godaddy_username' },
  mitre_tactic: { desc: 'Mitre Tactic', id: 'mitre_tactic' },
  mitre_technique: { desc: 'Mitre Technique', id: 'mitre_technique' },
  mitre_subtechnique: { desc: 'Mitre Subtechnique', id: 'mitre_subtechnique' },
  mitre_mitigation: { desc: 'Mitre Mitigation', id: 'mitre_mitigation' },
  mitre_matrix: { desc: 'Mitre Matrix', id: 'mitre_matrix' },
  mitre_group: { desc: 'Mitre Group', id: 'mitre_group' },
  mitre_software: { desc: 'Mitre Software', id: 'mitre_software' }
};

export const THEMES = [
  { value: 'apathy', label: 'apathy' },
  { value: 'apathy:inverted', label: 'apathy:inverted' },
  { value: 'ashes', label: 'ashes' },
  { value: 'bespin', label: 'bespin' },
  { value: 'brewer', label: 'brewer' },
  { value: 'bright:inverted', label: 'bright:inverted' },
  { value: 'bright', label: 'bright' },
  { value: 'chalk', label: 'chalk' },
  { value: 'codeschool', label: 'codeschool' },
  { value: 'colors', label: 'colors' },
  { value: 'eighties', label: 'eighties' },
  { value: 'embers', label: 'embers' },
  { value: 'flat', label: 'flat' },
  { value: 'google', label: 'google' },
  { value: 'grayscale', label: 'grayscale' },
  {
    value: 'grayscale:inverted',
    label: 'grayscale:inverted'
  },
  { value: 'greenscreen', label: 'greenscreen' },
  { value: 'harmonic', label: 'harmonic' },
  { value: 'hopscotch', label: 'hopscotch' },
  { value: 'isotope', label: 'isotope' },
  { value: 'marrakesh', label: 'marrakesh' },
  { value: 'mocha', label: 'mocha' },
  { value: 'monokai', label: 'monokai' },
  { value: 'ocean', label: 'ocean' },
  { value: 'paraiso', label: 'paraiso' },
  { value: 'pop', label: 'pop' },
  { value: 'railscasts', label: 'railscasts' },
  { value: 'rjv-default', label: 'rjv-default' },
  { value: 'shapeshifter', label: 'shapeshifter' },
  {
    value: 'shapeshifter:inverted',
    label: 'shapeshifter:inverted'
  },
  { value: 'solarized', label: 'solarized' },
  { value: 'summerfruit', label: 'summerfruit' },
  {
    value: 'summerfruit:inverted',
    label: 'summerfruit:inverted'
  },
  { value: 'threezerotwofour', label: 'threezerotwofour' },
  { value: 'tomorrow', label: 'tomorrow' },
  { value: 'tube', label: 'tube' },
  { value: 'twilight', label: 'twilight' }
];

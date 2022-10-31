const BUCKET = {
  'dev-private': 'gd-respstorag-dev-private-godaddy-threat-research-forensic',
  dev: 'gd-respstorag-dev-godaddy-threat-research-forensic',
  prod: 'gd-respstorag-prod-godaddy-threat-research-forensic'
};

module.exports = {
  getBucket: (host) => {
    if (host.includes('dev')) {
      if (process.env.NODE_ENV === 'development') {
        if (process.env.LOCAL_TENET_CONFIG === 'true') {
          // only this file defines local env and dev-private
          return BUCKET['dev-private'];
        } else {
          return BUCKET['dev'];
        }
      }
    } else {
      return BUCKET['prod'];
    }
  },
  REGION: 'us-west-2'
};

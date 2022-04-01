import get from 'lodash.get';
import Papa from 'papaparse';
import React from 'react';

const parsers = {
  csv: (data) => Papa.parse(data, { header: true, skipEmptyLines: true }).data,
  spaces: (data) => data.toString().split(' ')
};

const DataParseSchema = {
  apivoid: (data = []) => {
    const BlacklistedProp = 'Blacklisted';
    const result = data.map((obj) => {
      const IOCsList = { ...obj, Data: parsers.csv(obj.Data) };
      IOCsList.Data = IOCsList.Data.reduce((acc, item) => {
        const { IoC, Blacklisted = '', ...rest } = item;
        acc[IoC] = acc[IoC] || [];
        acc[IoC].push({ Blacklisted, ...rest });
        if (Blacklisted.toLowerCase() === 'true') {
          acc[BlacklistedProp][IoC] = acc[BlacklistedProp][IoC] || [];
          acc[BlacklistedProp][IoC].push(item);
        }
        return acc;
      }, {[BlacklistedProp]: {}});
      IOCsList.Metadata = IOCsList.Metadata.reduce((acc, item) => {
      let IOC = 'unknown';
      const t = item.split(',');
      const itemProps = t.reduce((itemAcc, propItem) => {
        const props = propItem.split(':');
        const value = props.slice(1, props.length).join('');
        if (props[0] === 'IOC') {
          IOC = value;
        } else {
          itemAcc[props[0]] = value;
        }
        return itemAcc;
      }, {});
      acc[IOC] = acc[IOC] || {};
      acc[IOC] = {...acc[IOC], ...itemProps};
      return acc;
      }, {});
      return IOCsList;
    });
    return result.length === 1 ? result[0] : result;
  },
  shodan: (data = []) => {
    const result = data.map((obj) => {
      return { ...obj, Data: parsers.csv(obj.Data) };
    });
    return result.length === 1 ? result[0] : result;
  },
  recordedfuture: (data = []) => {
    const result = data.map((obj) => {
      const spacedPropName = ['Affected Machines: CPE', 'RawRisk Rules Associated'];
      const result = parsers[obj.DataType](obj.Data);
      result.forEach((item) => {
        if (item[spacedPropName]) {
          item[spacedPropName] = parsers.spaces(item[spacedPropName]);
        }
      });
      return { ...obj, Data: result };
    });
    return result.length === 1 ? result[0] : result;
  },
  urlhaus: (data = []) => {
    const result = data.map((obj) => {
      return { ...obj, Data: parsers.csv(obj.Data) };
    });
    return result.length === 1 ? result[0] : result;
  },
  virustotal: (data = []) => {
    const result = data.map((obj) => {
      return { ...obj, Data: parsers.csv(obj.Data) };
    });
    return result.length === 1 ? result[0] : result;
  },
  passivetotal: (data = []) => {
    const result = data.map((obj) => {
      return { ...obj, Data: parsers.csv(obj.Data) };
    });
    return result.length === 1 ? result[0] : result;
  },
  trustar: (data = []) => {
    const result = data.map((obj) => {
      return { ...obj, Data: parsers.csv(obj.Data) };
    });
    return result.length === 1 ? result[0] : result;
  },
  zerobounce: (data = []) => {
    const result = data.map((obj) => {
      return { ...obj, Data: parsers.csv(obj.Data) };
    });
    return result.length === 1 ? result[0] : result;
  },
  nvd: (data = []) => {
    const result = data.map((obj) => {
      return { ...obj, Data: parsers.csv(obj.Data) };
    });
    return result.length === 1 ? result[0] : result;
  },
  urlscanio: (data = []) => {
    const result = data.map((obj) => {
      return { ...obj, Data: parsers.csv(obj.Data) };
    });
    return result.length === 1 ? result[0] : result;
  },
  sucuri: (data = []) => {
    const result = data.map((obj) => {
      return { ...obj, Data: parsers.csv(obj.Data) };
    });
    return result.length === 1 ? result[0] : result;
  }
};

export const parseData = (data) => {
  data.badness = [];
  const { responses = {} } = data;
  data.responses = Object.keys(responses).reduce((acc, key) => {
    const moduleDataFormatter = DataParseSchema[key];
    if (moduleDataFormatter) {
      const badness = [];
      const result = moduleDataFormatter(acc[key]);
      [].concat(result.Data).forEach(({Badness} = {}) => {
        const badnessScore = parseFloat(Badness);
        if (!isNaN(badnessScore)) {
          badness.push(badnessScore);
        }
      });
      if (badness.length) {
        data.badness.push({ module: key, badness });
      }
      acc[key] = result;
    }
    return acc;
  }, responses);
  return data;
};

const getKeyPath = (keyPath) => {
  let parsedKeyPath = keyPath.slice(); // we make copy of original array casue we cannot change it
  // if it is element of array, we read schema config for whole array by removing index from path
  parsedKeyPath = parsedKeyPath.filter((key) => typeof key !== 'number');
  parsedKeyPath = parsedKeyPath.reverse(); // we have to reverse path array, because it is reversed initially
  return parsedKeyPath;
};

const DataExpandSchema = {
  root: {
    apivoid: {
      Data: true
    },
    shodan: {
      Data: true
    },
    recordedfuture: {
      Data: true
    },
    urlhaus: {
      Data: true
    },
    virustotal: {
      Data: true
    },
    passivetotal: {
      Data: true
    },
    trustar: {
      Data: true
    },
    zerobounce: {
      Data: true
    },
    nvd: {
      Data: true
    },
    urlscanio: {
      Data: true
    },
    sucuri: {
      Data: true
    }
  }
};

export const expandData = (keyPath) => {
  const config = get(DataExpandSchema, getKeyPath(keyPath));
  if (config) {
    // it is object or boolean
    if (typeof config === 'boolean') {
      return config; // return exact value of expanded, usually true
    }
    return true; // if it is object, we assume it has to be expanded cause of some children to be expanded
  }
  return false; // if it's not in schema, we don't expand at all
};

const DataFormatSchema = {
  root: {
    shodan: {
      Data: {}
    },
    recordedfuture: {
      Data: {
        IntelCardLink: (value) => (
          <a target='_blank' rel='noreferrer' href={value}>
            {value}
          </a>
        )
      }
    },
    urlhaus: {
      Data: {}
    },
    virustotal: {
      Data: {}
    },
    passivetotal: {
      Data: {}
    },
    trustar: {
      Data: {}
    },
    zerobounce: {
      Data: {}
    },
    nvd: {
      Data: {}
    },
    urlscanio: {
      Data: {}
    },
    sucuri: {
      Data: {}
    }
  }
};

export const formatData = (raw, value, ...keyPath) => {
  const config = get(DataFormatSchema, getKeyPath(keyPath));
  if (typeof config === 'function') {
    // if we have handler to format value we call it
    return config(value); // return exact value of expanded, usually true
  }
  return value; // if it's not in schema, we don't expand at all
};


export const badnessFormatter = (badnessResponses) => {
  let badnessScore = 'N\\A';
  const severity = {
    critical: '#B30000',
    major: '#E07800',
    minor: '#4FA800'
  }
  if (badnessResponses.length) {
    badnessScore = badnessResponses.reduce((acc, {module, badness}) => {
      const average = Math.max(...badness);
      if (average < 0.5) {
        acc.push(<span style={{color: severity.minor}}>{average.toFixed(2)} ({module});</span>);
      } else if (average < 0.75) {
        acc.push(<span style={{color: severity.major}}>{average.toFixed(2)} ({module});</span>);
      } else if (average <= 1) {
        acc.push(<span style={{color: severity.critical}}>{average.toFixed(2)} ({module});</span>);
      }
      return acc;
    }, [])
  }
  return badnessScore;
}
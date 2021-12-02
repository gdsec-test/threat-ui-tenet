import React from 'react';
import Papa from 'papaparse';
import get from 'lodash.get';

const parsers = {
  csv: (data) => Papa.parse(data, { header: true, skipEmptyLines: true }).data,
  spaces: (data) => data.toString().split(' ')
};

const DataParseSchema = {
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
  return Object.keys(data).reduce((acc, key) => {
    const moduleDataFormatter = DataParseSchema[key];
    if (moduleDataFormatter) {
      acc[key] = moduleDataFormatter(acc[key]);
    }
    return acc;
  }, data);
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

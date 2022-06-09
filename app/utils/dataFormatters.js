import get from 'lodash.get';
import Papa from 'papaparse';
import React from 'react';

const parsers = {
  csv: (data) => Papa.parse(data, { header: true, skipEmptyLines: true }).data,
  spaces: (data) => data.toString().split(' '),
  json: (data) => JSON.parse(data)
};

const extractData = result => {
  const tempResult = result.map(report => {
    let { Data, Metadata } = report;
    if (Data && Data.length && Data.length === 1) {
      Data = Data[0];
    }
    if (Object.keys(Metadata).length) {
      return Data ? { ...Data, Metadata } : report;
    } else {
      return Data ? { ...Data } : report;
    }
  });
  return tempResult.length === 1 ? tempResult[0] : tempResult;
};

const DataParseSchema = {
  apivoid: (data = []) => {
    const BlacklistedProp = 'Blacklisted';
    const result = data.map(obj => {
      const IOCsList = { ...obj, Data: parsers.csv(obj.Data) };
      IOCsList.Data = IOCsList.Data.reduce(
        (acc, item) => {
          const { IoC, Blacklisted = '', ...rest } = item;
          acc[IoC] = acc[IoC] || [];
          acc[IoC].push({ Blacklisted, ...rest });
          if (Blacklisted.toLowerCase() === 'true') {
            acc[BlacklistedProp][IoC] = acc[BlacklistedProp][IoC] || [];
            acc[BlacklistedProp][IoC].push(item);
          }
          return acc;
        },
        { [BlacklistedProp]: {} }
      );
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
        acc[IOC] = { ...acc[IOC], ...itemProps };
        return acc;
      }, {});
      return IOCsList;
    });
    return extractData(result);
  },
  shodan: (data = []) => {
    const result = data.map(obj => {
      return { ...obj, Data: parsers.csv(obj.Data) };
    });
    return extractData(result);
  },
  recordedfuture: (data = []) => {
    const result = data.map(obj => {
      const spacedPropName = ['Affected Machines: CPE', 'RawRisk Rules Associated'];
      const result = parsers[obj.DataType](obj.Data);
      result.forEach(item => {
        if (item[spacedPropName]) {
          item[spacedPropName] = parsers.spaces(item[spacedPropName]);
        }
      });
      return { ...obj, Data: result };
    });
    return extractData(result);
  },
  urlhaus: (data = []) => {
    const result = data.map(obj => {
      return { ...obj, Data: parsers.csv(obj.Data) };
    });
    return extractData(result);
  },
  virustotal: (data = []) => {
    const result = data.map(obj => {
      return { ...obj, Data: parsers.csv(obj.Data) };
    });
    return extractData(result);
  },
  passivetotal: (data = []) => {
    const result = data.map(obj => {
      return { ...obj, Data: parsers.json(obj.Data) };
    });
    return extractData(result);
  },
  trustar: (data = []) => {
    const result = data.map(obj => {
      return { ...obj, Data: parsers.csv(obj.Data) };
    });
    return extractData(result);
  },
  zerobounce: (data = []) => {
    const result = data.map(obj => {
      return { ...obj, Data: parsers.csv(obj.Data) };
    });
    return extractData(result);
  },
  nvd: (data = []) => {
    const result = data.map(obj => {
      return { ...obj, Data: parsers.csv(obj.Data) };
    });
    return extractData(result);
  },
  urlscanio: (data = []) => {
    const result = data.map(obj => {
      return { ...obj, Data: parsers.csv(obj.Data) };
    });
    return extractData(result);
  },
  sucuri: (data = []) => {
    const result = data.map(obj => {
      return { ...obj, Data: parsers.csv(obj.Data) };
    });
    return extractData(result);
  }
};

export const parseData = data => {
  data.badness = [];
  const { responses = {} } = data;
  data.responses = Object.keys(responses).reduce((acc, key) => {
    const moduleDataFormatter = DataParseSchema[key];
    if (moduleDataFormatter) {
      const badness = [];
      const result = moduleDataFormatter(acc[key]);
      [].concat(result.Data).forEach(({ Badness } = {}) => {
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

const getKeyPath = keyPath => {
  let parsedKeyPath = keyPath.slice(); // we make copy of original array casue we cannot change it
  // if it is element of array, we read schema config for whole array by removing index from path
  parsedKeyPath = parsedKeyPath.filter(key => isNaN(parseInt(key)));
  parsedKeyPath = parsedKeyPath.reverse(); // we have to reverse path array, because it is reversed initially
  return parsedKeyPath;
};

const DataExpandSchema = {
  apivoid: false,
  shodan: false,
  recordedfuture: false,
  urlhaus: false,
  virustotal: false,
  passivetotal: false,
  trustar: false,
  zerobounce: false,
  nvd: false,
  urlscanio: false,
  sucuri: false
};

export const expandData = keyPath => {
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
  shodan: {},
  recordedfuture: {
    IntelCardLink: value => (
      <a target='_blank' rel='noreferrer' href={value}>
        {value}
      </a>
    )
  },
  urlhaus: {},
  virustotal: {},
  passivetotal: {},
  trustar: {},
  zerobounce: {},
  nvd: {},
  urlscanio: {},
  sucuri: {}
};

export const formatData = (toggleClick, expand, value, ...keyPath) => {
  const config = get(DataFormatSchema, getKeyPath(keyPath));
  let formattedValue = value;
  if (typeof config === 'function') {
    // if we have handler to format value we call it
    formattedValue = config(value); // return exact value of expanded, usually true
  }
  return (
    <div onClick={toggleClick} className={'JobDetails_ReportValue ' + (expand ? 'expanded' : '')}>
      {formattedValue}
    </div>
  );
};

export const badnessFormatter = (badnessResponses) => {
  let badnessScore = 'N\\A';
  const severity = {
    critical: '#B30000',
    major: '#E07800',
    minor: '#4FA800'
  };
  if (badnessResponses.length) {
    badnessScore = badnessResponses.reduce((acc, { module, badness }) => {
      const average = Math.max(...badness);
      if (average < 0.5) {
        acc.push(
          <span style={{ color: severity.minor }}>
            {average.toFixed(2)} ({module});
          </span>
        );
      } else if (average < 0.75) {
        acc.push(
          <span style={{ color: severity.major }}>
            {average.toFixed(2)} ({module});
          </span>
        );
      } else if (average <= 1) {
        acc.push(
          <span style={{ color: severity.critical }}>
            {average.toFixed(2)} ({module});
          </span>
        );
      }
      return acc;
    }, []);
  }
  return badnessScore;
};

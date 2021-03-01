import Papa from 'papaparse';

const parsers = {
  csv: (data) => Papa.parse(data, { header: true, skipEmptyLines: true }).data,
  spaces: (data) => data.toString().split(' ')
};

export default {
  shodan: (data = []) => {
    return data.map((obj) => {
      return { ...obj, Data: parsers.csv(obj.Data) };
    });
  },
  recordedfuture: (data = []) => {
    return data.map((obj) => {
      const spacedPropName = 'Affected Machines: CPE';
      const result = parsers.csv(obj.Data);
      result.forEach((item) => {
        if (item[spacedPropName]) {
          item[spacedPropName] = parsers.spaces(item[spacedPropName]);
        }
      });
      return { ...obj, Data: result };
    });
  }
};

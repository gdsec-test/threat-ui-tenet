import Papa from 'papaparse';

const parsers = {
  csv: (data) => Papa.parse(data, { header: true, skipEmptyLines: true }).data,
  spaces: (data) => data.toString().split(' ')
};

export default {
  shodan: (data = []) => {
    const result = data.map((obj) => {
      return { ...obj, Data: parsers.csv(obj.Data) };
    });
    return result.length === 1 ? result[0] : result;
  },
  recordedfuture: (data = []) => {
    const result = data.map((obj) => {
      const spacedPropName = 'Affected Machines: CPE';
      const result = parsers[obj.DataType](obj.Data);
      result.forEach((item) => {
        if (item[spacedPropName]) {
          item[spacedPropName] = parsers.spaces(item[spacedPropName]);
        }
      });
      return { ...obj, Data: result };
    });
    return result.length === 1 ? result[0] : result;
  }
};

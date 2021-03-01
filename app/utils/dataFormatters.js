import Papa from 'papaparse';

export default {
  shodan: (data = []) => {
    return data.map((obj) => {
      return { ...obj, Data: Papa.parse(obj.Data, { header: true, skipEmptyLines: true }).data };
    });
  },
  recordedfuture: (data = []) => {
    return data.map((obj) => {
      return { ...obj, Data: Papa.parse(obj.Data, { header: true, skipEmptyLines: true }).data };
    });
  }
};

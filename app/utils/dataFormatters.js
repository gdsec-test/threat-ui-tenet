import Papa from 'papaparse';

export default {
  shodan: (data = []) => {
    return data.map(({ Data }) => {
      return Papa.parse(Data, { header: true, skipEmptyLines: true }).data;
    });
  }
};

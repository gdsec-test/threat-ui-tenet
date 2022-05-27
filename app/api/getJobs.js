import { JOB_STATUS } from '../utils/const';
import fetch from './fetch';

const getJobs = async () => {
  let jobs = await fetch({ url: '/api/jobs' });
  jobs = jobs.map(({ JobDB: { jobId, startTime, submission = {} }, jobPercentage }) => {
    let status = JOB_STATUS.DONE;
    const { metadata: { tags = [], modules = [] } = {} } = submission;
    const modulesStatus = modules.reduce((acc, module) => {
      const isDone = jobPercentage === 100;
      if (isDone) {
        acc[module] = JOB_STATUS.DONE;
      } else {
        acc[module] = JOB_STATUS.PENDING;
        status = JOB_STATUS.PENDING;
      }
      return acc;
    }, {});
    return {
      id: jobId,
      tags,
      status,
      jobPercentage,
      modules: modulesStatus,
      timestamp: startTime
    };
  });
  return jobs;
};

export default getJobs;
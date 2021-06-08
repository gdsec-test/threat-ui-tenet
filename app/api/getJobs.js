import fetch from './fetch';
import { JOB_STATUS } from '../utils/const';

export default async () => {
  let jobs = await fetch({ url: '/api/jobs' });
  jobs = jobs.map(({ JobDB: { jobId, startTime, submission = {} }, jobPercentage }) => {
    const { metadata: { tags = [], modules = [] } = {} } = submission;
    const modulesStatus = jobPercentage === 100 ? JOB_STATUS.DONE : JOB_STATUS.PENDING;
    return {
      id: jobId,
      tags,
      status: modulesStatus,
      modules,
      timestamp: startTime
    };
  });
  return jobs;
};

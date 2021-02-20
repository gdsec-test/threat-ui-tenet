import fetch from './fetch';
import { JOB_STATUS } from '../utils/const';

export default async () => {
  let jobs = await fetch({ url: '/api/jobs' });
  jobs = jobs.map(({ jobId, startTime, responses, submission = {} }) => {
    let status = JOB_STATUS.DONE;
    const { metadata: { tags = [], modules = [] } = {} } = submission;
    const modulesStatus = modules.reduce((acc, module) => {
      const isDone = Object.keys(responses).indexOf(module) >= 0;
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
      modules: modulesStatus,
      timestamp: startTime
    };
  });
  return jobs;
};

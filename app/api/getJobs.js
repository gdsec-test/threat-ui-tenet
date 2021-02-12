import fetch from './fetch';
import { JOB_STATUS } from '../utils/const';

export default async () => {
  let jobs = await fetch({ url: '/api/jobs' });
  jobs = jobs.map(({ jobId, startTime, responses, submission = {} }) => {
    const status = Math.random() > 0.5 ? JOB_STATUS.PENDING : JOB_STATUS.DONE;
    const { metadata: { tags = [] } = {} } = submission;
    return {
      id: jobId,
      tags,
      status,
      modules: Object.keys(responses).reduce((acc, module) => {
        acc[module] = responses[module] ? JOB_STATUS.DONE : JOB_STATUS.PENDING;
        return acc;
      }, {}),
      timestamp: startTime
    };
  });
  return jobs;
};

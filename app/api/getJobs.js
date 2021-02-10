import fetch from './fetch';
import { JOB_STATUS } from '../utils/const';

export default async () => {
  let jobs = await fetch({ url: '/api/jobs' });
  // mock-start
  jobs = jobs.map(({ JobID, StartTime, responses, submission = {} }) => {
    const status = Math.random() > 0.5 ? JOB_STATUS.PENDING : JOB_STATUS.DONE;
    const { metadata: { tags = [] } = {} } = submission;
    const timestamp = new Date();
    // timestamp.setHours(Math.round(Math.random() * 24), Math.round(Math.random() * 60), Math.round(Math.random() * 60));
    return {
      id: JobID,
      tags,
      status,
      modules: Object.keys(responses).reduce((acc, module) => {
        acc[module] = responses[module] ? JOB_STATUS.DONE : JOB_STATUS.PENDING;
        return acc;
      }, {}),
      timestamp: StartTime || timestamp.valueOf()
    };
  });
  // mock-end
  return jobs;
};

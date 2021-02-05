import fetch from './fetch';
import { MODULES, JOB_STATUS } from '../utils/const';
import generate from 'project-name-generator';

export default async () => {
  let jobs = await fetch({ url: '/api/jobs' });
  // mock-start
  jobs = jobs.map(({ JobID, StartTime }) => {
    const status = Math.random() > 0.5 ? JOB_STATUS.PENDING : JOB_STATUS.DONE;
    const modules = Object.values(MODULES).reduce((acc, name) => {
      if (Math.random() > 0.5) {
        if (status === JOB_STATUS.PENDING) {
          acc[name] = Math.random() > 0.5 ? JOB_STATUS.PENDING : JOB_STATUS.DONE;
        } else {
          acc[name] = JOB_STATUS.DONE;
        }
      }

      return acc;
    }, {});
    const timestamp = new Date();
    timestamp.setHours(Math.round(Math.random() * 24), Math.round(Math.random() * 60), Math.round(Math.random() * 60));
    return {
      id: JobID,
      tags: generate({ words: 3 }).raw,
      status,
      modules,
      timestamp: StartTime
    };
  });
  // mock-end
  return jobs;
};

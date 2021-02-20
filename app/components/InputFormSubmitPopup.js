import React, { Fragment } from 'react';
import { withRouter } from 'next/router';
import { Form, Button } from '@ux/uxcore2';
import Loader from './common/Loader';
import CopyToClipboard from './common/CopyToClipboard';

export default withRouter(({ submitIsInProgress, submittedJobs, router }) => {
  return (
    <Form
      className={'InputForm'}
      action=''
      onSubmit={(e) => {
        e.preventDefault();
      }}
    >
      <div>
        {submitIsInProgress && (
          <Fragment>
            <Loader inline size='lg' text='Jobs are submitting...' />
          </Fragment>
        )}
        {submittedJobs.map(({ id, tags = [] }) => (
          <div key={id}>
            <CopyToClipboard value={`${location.origin}/job/${id}`} />
            Job{' '}
            <a
              href={`/job/${id}`}
              onClick={(e) => {
                e.preventDefault();
                router.push(`/job/${id}`);
              }}
            >
              {tags.join(', ')}
            </a>{' '}
            submitted successfully
          </div>
        ))}
        <Button
          design='secondary'
          onClick={() => router.push(`/jobs?jobIds=${submittedJobs.map(({ id }) => id).join(',')}`)}
        >
          See created jobs
        </Button>
      </div>
    </Form>
  );
});

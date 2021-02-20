import React from 'react';
import { Spinner } from '@ux/uxcore2';

export default ({ text }) => {
  return (
    <div className='Loader'>
      <div>{text}</div>
      <div>
        <Spinner size='lg' />
      </div>
    </div>
  );
};

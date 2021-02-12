import React from 'react';
import Cross from '@ux/icon/x';
import '@ux/icon/x/index.css';

export default ({ tags, onClick }) => {
  return (
    <div>
      {tags.map((tag) => {
        return (
          <span className='Tag' key={tag}>
            {`${tag}`}
            <Cross onClick={(e) => onClick(tag, e)} width={'1em'} height={'1em'} />
          </span>
        );
      })}
    </div>
  );
};

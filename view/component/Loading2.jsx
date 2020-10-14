import React from 'react';

const Loading2 = (props) => {
  return (
    <div
      className='text-center'
      style={{
        position: 'absolute',
        margin: 'auto',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        width: 200,
        height: 200,
        zIndex: 9999,
        display: props.display ? 'block' : 'none',
      }}
    >
      <img src='/img/loading2.gif' />
    </div>
  );
};

export default Loading2;

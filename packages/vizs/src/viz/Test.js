import React, { useEffect, useState } from 'react';

const Table = ({ primary, ...rest }) => {

  return (
    <>
      <div> {"this is test panel"} </div>
      <div>{Math.random()}</div> <div> {JSON.stringify(primary)} </div>
    </>
  );
};

export default Table;

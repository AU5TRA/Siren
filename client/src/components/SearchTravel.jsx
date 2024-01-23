import React, { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const SearchTravel = () => {
  const [inputValueFrom, setInputValueFrom] = useState('');
  const [inputValueTo, setInputValueTo] = useState('');

  const onChangeFunc = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/book/search?from=${inputValueFrom}&to=${inputValueTo}`,
        {
          method: 'GET',
        }
      );

      const res = await response.json();
      const received = res.data.result;
      console.log(received);
      if (Array.isArray(received)) {
      } else {
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <Fragment>
      <div>
        <label htmlFor="from">From station</label>
        <input
          type="text"
          id="from"
          onChange={(e) => setInputValueFrom(e.target.value)}
          value={inputValueFrom}
          style={{ width: '300px', marginRight: '10px' }}
          placeholder="From station"
        />
        <label htmlFor="to">To station</label>
        <input
          type="text"
          id="to"
          onChange={(e) => setInputValueTo(e.target.value)}
          value={inputValueTo}
          style={{ width: '300px', marginRight: '10px' }}
          placeholder="To station"
        />
        <button onClick={onChangeFunc}>Search</button>
      </div>
      
    </Fragment>
  );
};

export default SearchTravel;

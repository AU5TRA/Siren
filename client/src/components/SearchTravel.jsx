import React, { Fragment, useEffect, useState } from 'react';

const SearchTravel = () => {
  const [inputValueFrom, setInputValueFrom] = useState('');
  const [inputValueTo, setInputValueTo] = useState('');
  const [trains, setTrains] = useState([]);
  const [fares, setFare] = useState([]);
  const [selectedTrain, setSelectedTrain] = useState(null);

  const [inputValue, setInputValue] = useState('');
  //const [data, setData] = useState([]);
  const [suggestionsFrom, setSuggestionsFrom] = useState([]);
  const [selectedSuggestionFrom, setSelectedSuggestionFrom] = useState(null);
  //const [showInfoData, setInfoData] = useState([]);


  const [suggestionsTo, setSuggestionsTo] = useState([]);
  const [selectedSuggestionTo, setSelectedSuggestionTo] = useState([]);

  const onChangeFrom = async (e) => {
    const value = e.target.value;
    setInputValueFrom(value);
    try {
      const response = await fetch(`http://localhost:3001/book/station/search?name=${value}`, {
        method: "GET",
      });

      const res = await response.json();
      const received = res.data.result;
      console.log(received);
      if (Array.isArray(received)) {
        //setData(received);
        // setSuggestions(received.map((item) => item.train_name));
        setSuggestionsFrom(received.map((item) => item.station_name));
      } else {
        //setData([]);
        //setSuggestions([]);
        setSuggestionsFrom([]);
      }
    } catch (err) {
      console.error(err.message);
    }
  };
  const onChangeTo = async (e) => {
    const value = e.target.value;
    setInputValueTo(value);
    try {
      const response = await fetch(`http://localhost:3001/book/station/search?name=${value}`, {
        method: "GET",
      });

      const res = await response.json();
      const received = res.data.result;
      console.log(received);
      if (Array.isArray(received)) {
        //setData(received);
        setSuggestionsTo(received.map((item) => item.station_name));
      } else {
        //setData([]);
        setSuggestionsTo([]);
      }
    } catch (err) {
      console.error(err.message);
    }
  };


  // const onSelectSuggestion = (selectedSuggestion) => {
  //   setInputValue(selectedSuggestion);
  //   setSelectedSuggestion(selectedSuggestion);
  //   setSuggestions([]);
  // }

  const onSelectSuggestionFrom = (selectedSuggestion) => {
    setInputValueFrom(selectedSuggestion);
    console.log(inputValueFrom + "from")
    setSelectedSuggestionFrom(selectedSuggestion);
    setSuggestionsFrom([]);
  }

  const onSelectSuggestionTo = (selectedSuggestion) => {
    setInputValueTo(selectedSuggestion);
    console.log(inputValueFrom + "to");
    setSelectedSuggestionTo(selectedSuggestion);
    setSuggestionsTo([]);
  }

  const onSearchFunc = async () => {
    try {
      console.log("from " + inputValueFrom + "to " + inputValueTo )
      const response = await fetch(
        `http://localhost:3001/book/search?from=${inputValueFrom}&to=${inputValueTo}`,
        {
          method: 'GET',
        }
      );

      const res = await response.json();
      const received = res.data.result;
      const received2 = res.data.result2;
      console.log(received);
      console.log(received2);
      if (Array.isArray(received)) {
        setTrains(received);
        setFare(received2);
      } else {
        setTrains([]);
        setFare([]);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleTrainClick = (train) => {
    setSelectedTrain(selectedTrain === train ? null : train);
  };

  return (
    <Fragment>
      <div>
        <label htmlFor="from">From station</label>
        <input
          type="text"
          id="from"
          onChange={onChangeFrom}
          value={inputValueFrom}
          style={{ width: '300px', marginRight: '10px' }}
          placeholder="From station"
        />
        <label htmlFor="to">To station</label>
        <input
          type="text"
          id="to"
          onChange={onChangeTo}
          value={inputValueTo}
          style={{ width: '300px', marginRight: '10px' }}
          placeholder="To station"
        />
        <div className="drop-down-from">
          {
            suggestionsFrom.map((item, index) => (
              <div key={index} onClick={() => onSelectSuggestionFrom(item)}>
                {item}
                <hr />
              </div>
            ))
          }
        </div>
        <div className="drop-down-to">
          {
            suggestionsTo.map((item, index) => (
              <div key={index} onClick={() => onSelectSuggestionTo(item)}>
                {item}
                <hr />
              </div>
            ))
          }
        </div>
        <button onClick={onSearchFunc} className="search-button">Search</button>
      </div>
      <table className="table mt-5 text-container">
        <thead>
          <tr>
            <th className="hoverable">Train ID</th>
            <th>Train Name</th>
          </tr>
        </thead>
        <tbody>
          {trains.map((train, index) => (
            <Fragment key={index}>
              <tr>
                <td style={{ fontSize: '18px' }}>{train.train_id}</td>
                <td className="hoverable" style={{ fontSize: '18px', cursor: 'pointer' }} onClick={() => handleTrainClick(train)}>
                  {train.train_name}
                </td>
              </tr>
              {selectedTrain === train && (
                <tr>
                  <td colSpan="2" style={{ fontSize: '18px' }}>
                    <table>
                      <thead>
                        <tr>
                          <th>Class</th>
                          <th>Fare</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fares.map((f, index) => (
                          <tr key={index}>
                            <td style={{ fontSize: '18px' }}>{f.class_name}</td>
                            <td style={{ fontSize: '18px' }}>{f.fare}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </Fragment>
  );
};

export default SearchTravel;

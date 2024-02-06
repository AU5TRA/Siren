import React, { Fragment, useEffect, useState } from 'react';
import './comp.css'

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
      console.log("from " + inputValueFrom + "to " + inputValueTo)
      const response = await fetch(
        `http://localhost:3001/book/search?from=${inputValueFrom}&to=${inputValueTo}`,
        {
          method: 'GET',
        }
      );

      const res = await response.json();
      const received = res.data.result;  // trains
      const received2 = res.data.result2;  //  trains with class and fare
      console.log(received);
      console.log(received2);
      if (Array.isArray(received)) {
        setTrains(received);
        setFare(received2);
        console.log(received2);
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
        <div className="input-container">
          <label htmlFor="from" className="label">From: </label>
          <input
            type="text"
            id="from"
            onChange={onChangeFrom}
            value={inputValueFrom}
            style={{ width: '300px', marginRight: '10px' }}
          />
        </div>
        <div className="input-container">
          <label htmlFor="to" className="label">To: </label>
          <input
            type="text"
            id="to"
            onChange={onChangeTo}
            value={inputValueTo}
            style={{ width: '300px', marginRight: '10px' }}
          />
        </div>
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
      <div className="train-container mt-5">
        {trains.map((train, index) => (
          <Fragment key={index}>
            <div
              className="train hoverable"
              style={{ cursor: 'pointer', padding: '10px', marginBottom: '5px' }}
              onClick={() => handleTrainClick(train)}
            >
              <div><h4> {train.train_id} <span style={{ margin: '0 25px' }}></span>  {train.train_name}</h4></div>
            </div>
            {selectedTrain === train && (
              <div className="class-cards-container">
                {fares
                  .filter(f => f.train_id === train.train_id)
                  .map((f, index) => (
                    <div key={index} className="class-card">
                      <div>{f.class_name}</div>
                      <div><strong>Fare:</strong> {f.fare} Tk.</div>
                    </div>
                  ))}
              </div>

            )}
          </Fragment>
        ))}
      </div>
    </Fragment>
  );

};

export default SearchTravel;

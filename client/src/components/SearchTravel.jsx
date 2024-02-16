import React, { Fragment, useEffect, useState } from 'react';
import { Link, json } from 'react-router-dom';
import './comp.css'
import 'react-datepicker/dist/react-datepicker.css';
import './App.css'
import DatePicker from 'react-datepicker';
import { useData } from './AppContext';


const SearchTravel = () => {
  const { dates, setDates, fromStationSearch, setFromStationSearch, toStationSearch, setToStationSearch } = useData();



  const [inputValueFrom, setInputValueFrom] = useState(fromStationSearch || '');
  const [inputValueTo, setInputValueTo] = useState(toStationSearch || '');
  const [dateSearched, setDate] = useState(dates)


  const [trains, setTrains] = useState([]);
  const [fares, setFare] = useState([]);
  const [selectedTrain, setSelectedTrain] = useState(null);


  const [selectedTrainId, setSelectedTrainId] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);


  const [searchClicked, setSearchClicked] = useState(false);

  const [inputValue, setInputValue] = useState('');
  const [suggestionsFrom, setSuggestionsFrom] = useState([]);
  const [selectedSuggestionFrom, setSelectedSuggestionFrom] = useState(null);
  const [suggestionsTo, setSuggestionsTo] = useState([]);
  const [selectedSuggestionTo, setSelectedSuggestionTo] = useState([]);
  const [seat, setSeat] = useState([]);
  const [availableSeat, setAvailableSeat] = useState([]);

  const [availableSeatsMap, setAvailableSeatsMap] = useState({});

  useEffect(() => {
    if (inputValueFrom) {
      onSearchFunc();
    }
  }, []);

  const onChangeFrom = async (e) => {
    const value = e.target.value;
    setInputValueFrom(value);
    try {
      // const dateSend = dateSearched ? dateSearched : new Date();
      const dateReceived = new Date('dateSearched');

      const response = await fetch(`http://localhost:3001/book/station/search?name=${value}&date=${dateReceived}`, {
        method: "GET",
      });

      const res = await response.json();
      const received = res.data.result;
      if (Array.isArray(received)) {
        setSuggestionsFrom(received.map((item) => item.station_name));
      } else {
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
      const r = JSON.stringify(res.data.info);

      const received = res.data.result;


      if (Array.isArray(received)) {
        setSuggestionsTo(received.map((item) => item.station_name));
        // setAvailableSeat(received2.map((item) => item.available_seats));

      }
      else {
        setSuggestionsTo([]);
      }
    } catch (err) {
      console.error(err.message);
    }
  };

  const onSelectSuggestionFrom = (selectedSuggestion) => {
    setInputValueFrom(selectedSuggestion);
    setSelectedSuggestionFrom(selectedSuggestion);
    setSuggestionsFrom([]);
  };

  const onSelectSuggestionTo = (selectedSuggestion) => {
    setInputValueTo(selectedSuggestion);
    setSelectedSuggestionTo(selectedSuggestion);
    setSuggestionsTo([]);
  };



  const onSearchFunc = async () => {
    try {
      setDates(dateSearched);
      setFromStationSearch(inputValueFrom);
      setToStationSearch(inputValueTo);
      setSearchClicked(true);
      const response = await fetch(
        `http://localhost:3001/book/search?from=${inputValueFrom}&to=${inputValueTo}&date=${dateSearched}`,
        {
          method: 'GET',
        }
      );


      const res = await response.json();
      // console.log(res.data.result + "  " + res.data.result2 + "  " + res.data.info + "  " + res.data.from + "  " + res.data.to);
      const received = res.data.result;
      const received2 = res.data.result2;
      const allInfo = res.data.info;

      console.log(allInfo);

      if (Array.isArray(received)) {
        setTrains(received);
        setFare(received2);
        setSeat(allInfo);
        // setAvailableSeat(av_seat);
        // setAvailableSeat(allInfo.map((item) => item.available_seats));

        // console.log(availableSeat);

        // const availableSeatsMap = {};
        // allInfo.forEach(info => {
        //   const { train_id, route_id, class_id, available_seats } = info;
        //   const key = `${train_id}_${route_id}_${class_id}`;
        //   if (!availableSeatsMap[key]) {
        //     availableSeatsMap[key] = available_seats;
        //   } else {
        //     availableSeatsMap[key] = availableSeatsMap[key].concat(available_seats);
        //   }
        // });



        // setAvailableSeatsMap(availableSeatsMap);
        // console.log(availableSeatsMap);

        const availableSeatsMap = {};

        // Populate availableSeatsMap with data
        allInfo.forEach((info) => {
          const key = `${info.train_id}_${info.route_id}_${info.class_id}`;
          availableSeatsMap[key] = info.available_seats;
        });

        setAvailableSeatsMap(availableSeatsMap);
        console.log(availableSeatsMap);
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
    setSelectedTrainId(train.train_id === selectedTrainId ? null : train.train_id);
    setSelectedRoute(train.route_id);
  };

  const ReviewButton = ({ trainId, classId }) => (
    <Link to={`/review?trainId=${trainId}&classId=${classId}`} className="review-button">
      Review
    </Link>
  );

  const handleBookNow = (trainId, classId, routeId) => {
    setSelectedTrainId(trainId);
    setSelectedClassId(classId);
    setSelectedRoute(routeId);
  };


  return (
    <Fragment>
      
      
     
      <div style={{marginTop:'40px'}}>
        
        <div className="input-container">
          <label htmlFor="from" className="label">From: </label>
          <input
            type="text"
            id="from"
            onChange={onChangeFrom}
            value={inputValueFrom}
            style={{
              width: '300px',
              marginRight: '10px',
              height: '40px',
              borderRadius: '5px', // Adjust this value to increase or decrease the corner roundness
              border: '2px solid darkgreen' // Specifies the border width, style, and color
            }}
          />  
        </div>
      
        <div className="input-container">
          <label htmlFor="to" className="label">To: </label>
          <input
            type="text"
            id="to"
            onChange={onChangeTo}
            value={inputValueTo}
            style={{
              width: '300px',
              marginRight: '10px',
              height: '40px',
              borderRadius: '5px', // Adjust this value to increase or decrease the corner roundness
              border: '2px solid darkgreen' // Specifies the border width, style, and color
            }}
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
        <div className="input-container" >
          <label htmlFor="from" className="label">Pick Date: </label>
          <DatePicker className="datePicker2"  placeholderText='Date of Journey'
            showIcon
            selected={dateSearched}
            onChange={(date) => setDate(date)}
            dateFormat='dd/MM/yyyy'

          />
        </div>

        <button onClick={onSearchFunc} className="button">search</button>
        {searchClicked && fares.length === 0 && (
          <div className='not found mt-5'>
            <h5>No trains found !</h5>
          </div>
        )}
      </div>
      {fares.length > 0 && (
        <div className="train-container mt-5">
          {trains.map((train, index) => (
            <Fragment key={index}>
              <div
                className="train hoverable"
                style={{ cursor: 'pointer', padding: '10px', marginBottom: '5px' }}
                onClick={() => handleTrainClick(train)}
              >
                <div><h4> {train.train_id} <span style={{ margin: '0 25px' }}></span>  {train.train_name}</h4><Link to={`/train/${train.train_id}`} >Route: {train.route_id}</Link>
                </div>

              </div>

              {/* {selectedTrain === train && (
                <div className="class-cards-container">
                  {fares
                    .filter(f => f.train_id === train.train_id)
                    .map((f, index) => {
                      const seatInfo = seat.find(seatInfo => seatInfo.train_id === train.train_id && seatInfo.class_id === f.class_id);
                      const availableSeatsCount = seatInfo ? seatInfo.available_seats_count : 0;
                      return (
                        <div key={index} className="class-card">
                          <div>{f.class_name}<span style={{ margin: '0 25px' }}></span>  <ReviewButton trainId={train.train_id} classId={f.class_id} /></div>
                          <div><strong>Fare:</strong> {f.fare} Tk.</div>
                          <div><strong>Seat Count:</strong> {availableSeatsCount}</div>
                          <div><center><button onClick={() => handleBookNow(train.train_id, f.class_id)} className='bookButton'>book now</button></center></div>
                          {selectedTrainId === train.train_id && selectedClassId === f.class_id && availableSeat[index] && (
                            <div>
                              {availableSeat[index].map((seat, idx) => (
                                <span key={idx}>{seat} </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )} */}

              {selectedTrain === train && (
                <div className="class-cards-container">
                  {fares
                    .filter((f) => f.train_id === train.train_id)
                    .map((f, index) => {
                      const key = `${train.train_id}_${train.route_id}_${f.class_id}`;
                      const availableSeats = availableSeatsMap[key] || []; // Default to empty array if no data found
                      const availableSeatsCount = availableSeats.length;

                      return (
                        <div key={index} className="class-card">
                          <div>
                            {/* <h4>
                              {train.train_id}{' '}
                              <span style={{ margin: '0 25px' }}></span> {train.train_name}
                            </h4> */}
                            {/* <Link to={`/train/${train.train_id}`}>Route: {train.route_id}</Link> */}
                          </div>
                          <div><strong style={{ fontSize: '24px'}}>{f.class_name}</strong><span style={{ margin: '0 40px' }}></span>  <ReviewButton trainId={train.train_id} classId={f.class_id} /></div>
                          <div><strong>Fare:</strong> {f.fare} Tk.</div>
                          <div><strong>Seat Count:</strong> {availableSeatsCount}</div>
                          <div>
                            <center>
                              <button onClick={() => handleBookNow(train.train_id, f.class_id, train.route_id)} className='button'>book now</button>
                            </center>
                          </div>
                          {selectedTrainId === train.train_id && selectedClassId === f.class_id && availableSeats.length > 0 && (
                            <div>
                              {availableSeats.map((seat, idx) => (
                                <span key={idx}>{seat} </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}



            </Fragment>
          ))}
        </div>
      )}

    </Fragment>
  );

};

export default SearchTravel;

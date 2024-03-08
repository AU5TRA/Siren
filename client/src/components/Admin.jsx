import React, { Fragment } from 'react'

import { useEffect, useState } from 'react';

import Modal from 'react-modal';
import ErrorModal from './ErrorModal';

import { json } from 'react-router-dom';
const customStyles = {

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '5px',
  border: '2px solid #0e360e',
  borderColor: '#0e360e',
  width: '50%',
  maxWidth: '400px',
};


const spanStyle = {

  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: '15px'
}


const modalStyle = {
  top: '50%',
  left: '50%',
  right: 'auto',
  bottom: 'auto',
  marginRight: '-50%',
  transform: 'translate(-50%, -50%)',
  maxWidth: '400px',
}




const Admin = () => {
  const [openModal, setOpenModal] = useState(false);
  const [number_of_stations, setNumber_of_stations] = useState(0);
  const [number_of_classes, setNumber_of_classes] = useState(0);
  const [stations, setStations] = useState({});
  const [classes, setClasses] = useState({});
  const [trainId, setTrainId] = useState('');
  const [trainName, setTrainName] = useState('');
  const [routeId, setRouteId] = useState('');
  const [routeName, setRouteName] = useState('');
  const [message, setMessage] = useState('');
  const [existRoute, setExistRoute] = useState(false);

  const [selectedSuggestionFrom, setSelectedSuggestionFrom] = useState(null);


  const [stationData, setStationData] = useState([]);
  const [classData, setClassData] = useState([]);

  const [allStationData, setAllStationData] = useState([]);


  const handleAddButtonClick = async () => {
    // const stations = 5; // Example number of stations
    try {
      console.log(number_of_classes, number_of_stations, trainId, trainName, routeId, routeName);
      const result = await fetch(`http://localhost:3001/admin/addTrain/${trainId}/${trainName}/${routeId}/${number_of_stations}/${number_of_classes}`, {
      });
      const data = await result.json();
      console.log(data);
      setMessage('');

      if (data.message !== undefined) {
        console.log("message : " + data.message);
        setMessage(data.message);
      }

      setExistRoute(false);
      if (data.data.exist === 0) {
        setExistRoute(true);

      }
      else {
        setStations(data.stations);
        console.log(JSON.stringify(stations[1]));
        console.log("haha");
        setExistRoute(false);

      }
      setAllStationData(data.allStations);
      console.log("allStationData : " + JSON.stringify(allStationData) + "----------------------------");
      console.log("stations : " + JSON.stringify(data.stations));





    } catch (error) {
      console.error(error);
    }
    setOpenModal(true);
  }
  const handleInputChange = (index, type, value) => {
    const updatedStations = [...stationData];
    if (!updatedStations[index]) {
      updatedStations[index] = {};
    }
    updatedStations[index][type] = value;
    setStationData(updatedStations);
    console.log("updatedStations : " + JSON.stringify(updatedStations));
  };

  const handleInputChangeClass = (index, type, value) => {
    const updatedClasses = [...classData];
    if (!updatedClasses[index]) {
      updatedClasses[index] = {};
    }
    updatedClasses[index][type] = value;
    setClassData(updatedClasses);
    console.log("updatedClasses : " + JSON.stringify(updatedClasses));
  };


  const closeModal = async (e)=>{
    console.log("train id: " + trainId)
    console.log("train name: " + trainName)
    console.log("routeId: " + routeId)
    console.log("routeName: " + routeName)
    console.log("finalClasses : " + JSON.stringify(classData));
    console.log("finalStations : " + JSON.stringify(stationData));


    try {
      const result = await fetch('http://localhost:3001/admin/addTrain/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
           trainId,
           trainName,
           routeId,
           routeName,
           stationData,
           classData
        })
      
    })
    console.log("////////////result : " + JSON.stringify(result));
    if(result.status === 200)
    alert("Train added successfully");
  } catch (error) {
      console.error(error);
    }
    
    // setOpenModal(false);
  }




  function renderInputs() {
    const inputs = [];
    if (!existRoute && stations && stations.length > 0) {
      // Display existing stations
      stations.forEach((station, index) => {
        inputs.push(
          <Fragment key={index}>
            {index + 1}.
            <input
              type="text"
              placeholder={`Station ${index + 1} Name`}
              style={{ ...customStyles }}
              value={stations[index][index + 1]}
              disabled={true}
            />
            {(index + 1) === 1 ?
              <></> :
              <input
                type="text"
                placeholder={`Station ${index + 1} Arrival Time`}
                style={{ ...customStyles }}
                onChange={(e) => handleInputChange(index, 'arrival', e.target.value)}
              />}
            {(index + 1) === stations.length ?
              <></> :
              <input
                type="text"
                placeholder={`Station ${index + 1} Departure Time`}
                style={{ ...customStyles }}
                onChange={(e) => handleInputChange(index, 'departure', e.target.value)}
              />}
            <br />
          </Fragment>
        );
      });
    } else {
      for (let i = 0; i < number_of_stations; i++) {
        inputs.push(
          <Fragment key={i}>
            {i + 1}.
            <input
              type="text"
              placeholder={`Station ${i + 1} Name`}
              list="stationSuggestions"
              style={{ ...customStyles }}
              onChange={(e) => handleInputChange(i, 'name', e.target.value)}
            />
            <datalist id="stationSuggestions" >
              {allStationData.map((station, index) => (
                <option key={index + 1} value={station} />
              ))}
            </datalist>

            <input
              type="text"
              placeholder={`Station ${i + 1} Arrival Time`}
              style={{ ...customStyles }}
              onChange={(e) => handleInputChange(i, 'arrival', e.target.value)}
            />
            <input
              type="text"
              placeholder={`Station ${i + 1} Departure Time`}
              style={{ ...customStyles }}
              onChange={(e) => handleInputChange(i, 'departure', e.target.value)}
            />
            <br />
          </Fragment>
        );
      }
    }
    for (let i = 0; i < number_of_classes; i++) {
      inputs.push(
        <Fragment key={i}>
          {i + 1}.
          <input type="text" placeholder={`Class ${i + 1} Name`} style={{ ...customStyles }} onChange={(e) => handleInputChangeClass(i, 'name', e.target.value)} />
          <input type="text" placeholder={`Class ${i + 1} Total Seat Count`} style={{ ...customStyles }} onChange={(e) => handleInputChangeClass(i, 'seats', e.target.value)} />
          <br />
        </Fragment>
      );
    }
    return inputs;
  }


  return <Fragment>
    <h1>Admin Page</h1>
    <input type="text" placeholder="Enter train ID" style={{ ...customStyles }} onChange={(e) => setTrainId(e.target.value)} />
    <span style={{ spanStyle }}></span>
    <input type="text" placeholder="Enter train name" style={{ ...customStyles }} onChange={(e) => setTrainName(e.target.value)} />
    <span style={{ spanStyle }}></span>

    <input type="text" placeholder="Enter Route ID" style={{ ...customStyles }} onChange={(e) => setRouteId(e.target.value)} />
    <span style={{ spanStyle }}></span>

    <input type="text" placeholder="Enter Number of Classes" style={{ ...customStyles }} onChange={(e) => setNumber_of_classes(e.target.value)} />
    <span style={{ spanStyle }}></span>

    <input type="text" placeholder="Enter Number of Stations" style={{ ...customStyles }} onChange={(e) => setNumber_of_stations(e.target.value)} />
    <span style={{ spanStyle }}></span>

    <button onClick={handleAddButtonClick} style={{ ...customStyles }}>Add</button>


    <Modal
      isOpen={openModal}
      onRequestClose={closeModal}
      style={modalStyle}
      contentLabel="Add stations & classes"
    >
      {existRoute && <input type="text" placeholder="Enter Route name" style={{ ...customStyles }} onChange={(e) => setRouteName(e.target.value)} />}

      <span style={{ spanStyle }}></span>
      {renderInputs()}
      <button onClick={closeModal}> Confirm</button>
    </Modal>

    {message && <ErrorModal isOpen={openModal} errorMessage={message} closeModal={closeModal} />}
  </Fragment>
}

export default Admin;
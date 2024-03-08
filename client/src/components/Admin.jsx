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



  const handleAddButtonClick = async () => {
    // const stations = 5; // Example number of stations
    try {
      console.log(number_of_classes, number_of_stations, trainId, trainName, routeId, routeName);
      const result = await fetch(`http://localhost:3001/admin/addTrain/${trainId}/${trainName}/${routeId}/${routeName}/${number_of_stations}/${number_of_classes}`, {
      });
      const data = await result.json();
      console.log(data);
      if (data.message !== undefined) {
        console.log("message : " + data.message);
        setMessage(data.message);
      }
    } catch (error) {
      console.error(error);
    }
    setOpenModal(true);
  }




  function closeModal() {
    setOpenModal(false);
  }
  function renderInputs() {
    const inputs = [];
    for (let i = 0; i < number_of_stations; i++) {
      inputs.push(
        <Fragment key={i}>
          {i + 1}.
          <input type="text" placeholder={`Station ${i + 1} Station ID`} style={{ ...customStyles }} />
          <input type="text" placeholder={`Station ${i + 1} Name`} style={{ ...customStyles }} />
          <input type="text" placeholder={`Station ${i + 1} Arrival Time`} style={{ ...customStyles }} />
          <input type="text" placeholder={`Station ${i + 1} Departure Time`} style={{ ...customStyles }} />
          <br />
        </Fragment>
      );
    }
    for (let i = 0; i < number_of_classes; i++) {
      inputs.push(
        <Fragment key={i}>
          {i + 1}.
          <input type="text" placeholder={`Class ${i + 1} Class ID`} style={{ ...customStyles }} />
          <input type="text" placeholder={`Class ${i + 1} Name`} style={{ ...customStyles }} />
          <input type="text" placeholder={`Class ${i + 1} Price`} style={{ ...customStyles }} />
          <input type="text" placeholder={`Class ${i + 1} Total Seat Count`} style={{ ...customStyles }} />
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
      <input type="text" placeholder="Enter Route name" style={{ ...customStyles }} onChange={(e) => setRouteName(e.target.value)} />

      <span style={{ spanStyle }}></span>
      {renderInputs()}
      <button onClick={closeModal}>Close Modal</button>
    </Modal>

    {message && <ErrorModal isOpen={openModal} errorMessage={message} closeModal={closeModal} />}
  </Fragment>
}

export default Admin
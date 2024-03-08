import React, { Fragment } from 'react'

import { useEffect, useState } from 'react';

import Modal from 'react-modal';
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
  marginTop: '10px'
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


  function handleAddButtonClick() {
    // const stations = 5; // Example number of stations

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
    <input type="text" placeholder="Enter train ID" style={{ ...customStyles }} />
    <span style={{ spanStyle }}></span>
    <input type="text" placeholder="Enter train name" style={{ ...customStyles }} />
    <span style={{ spanStyle }}></span>

    <input type="text" placeholder="Enter Number of classes" style={{ ...customStyles }} />
    <span style={{ spanStyle }}></span>

    <input type="text" placeholder="Enter Route ID" style={{ ...customStyles }} />
    <span style={{ spanStyle }}></span>
    <input type="text" placeholder="Enter Route name" style={{ ...customStyles }} />

    <span style={{ spanStyle }}></span>
    <input type="text" placeholder="Enter Number of Classes" style={{ ...customStyles }} onChange={(e) => setNumber_of_classes(e.target.value)} />

    <span style={{ spanStyle }}></span>
    <input type="text" placeholder="Enter Number of Stations" style={{ ...customStyles }} onChange={(e) => setNumber_of_stations(e.target.value)} />
    <button onClick={handleAddButtonClick} style={{ ...customStyles }}>Add</button>


    <Modal
      isOpen={openModal}
      onRequestClose={closeModal}
      style={modalStyle}
      contentLabel="Add stations & classes"
    >
      {renderInputs()}
      <button onClick={closeModal}>Close Modal</button>
    </Modal>



  </Fragment>
}

export default Admin
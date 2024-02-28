import React from 'react'
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useData } from './AppContext'

import './ticketBook.css';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};



const TicketBookingPage = () => {
  const { userId, route } = useData();
  const location = useLocation();
  // const navigate = useNavigate();
  const { selectedSeats, totalFare, trainName, className, routeName, date, from, to, selectedStation, selectedStation_d } = location.state;

  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [discountedFare, setDiscountedFare] = useState(totalFare);

  const [modalIsOpen, setIsOpen] = useState(false);
  const [transactionId, setTransactionId] = useState(null);
  

  // const [tickets, setTickets] = useState([]);

  useEffect(() => {
    // const fetchData = ()
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3001/booking/ticket?trainName=${trainName}&className=${className}&routeName=${routeName}&date=${date}&from=${from}&to=${to}&selectedSeats=${selectedSeats.join(',')}&totalFare=${totalFare}&boarding=${selectedStation}&destination=${selectedStation_d}`);
        const result = await response.json();
        console.log(JSON.stringify(result));
        if (result.status === 'success' && result.data && result.data.offers) {
          setOffers(result.data.offers);
          console.log(result.data.offers);
         // setSelectedOffer(result.data.offers[0].offer_id);
        }
      } catch (error) {
        console.error(error.message);
      }
    };

    if (location.state) {
      fetchData();
    }
  }, [location]);

  const handleOfferSelect = (offer) => {
    setSelectedOffer(offer.offer_id);
    if (offer) {
      const discount = (totalFare * offer.offer_pct) / 100;
      setDiscountedFare(totalFare - discount);
    } else {
      setDiscountedFare(totalFare);
    }
  };


  const handleConfirm = async () => {
    try {
      const response = await fetch('http://localhost:3001/booking/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          selectedSeats,
          totalFare,
          selectedStation,
          selectedStation_d,
          selectedOffer,
          discountedFare,
          transactionId,
          userId,
          className,
          trainName,
          route
        }),
      });
      const result = await response.json();
      if (result.status === 'success') {
        alert('Booking confirmed successfully');
        // console.log(result.data.ticket);
        // setTickets(result.data.ticket);
        // console.log(tickets);
        if (transactionId == null) {
          // window.location.href = `/users/${userId}`;
          // location
          window.location.href = `/users/${userId}`;
          // navigate(`/users/${userId}`, {state : {seat_numbers : selectedSeats, ticket_ids : tickets}});
        }
        else window.location.href = window.location.href = `/users/${userId}`;
      } else {
        alert('Booking failed');
      }

      openModal();
    } catch (error) {
      console.error(error.message);
    }
  }


  const handleConfirm1 = async () => {
    try {
      openModal();
    } catch (error) {
      console.error(error.message);
    }
  }

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
  }




  return (
    <>
      <div>
        <h1>Ticket Details</h1>
        <p>Selected Seats: {selectedSeats.join(', ')}</p>
        <p>Total Fare: {totalFare}</p>
        <p>Train Name: {trainName}</p>
        <p>Class Name: {className}</p>
        <p>Route Name: {routeName}</p>
        <p>Date: {date}</p>
        <p>From: {from}</p>
        <p>To: {to}</p>
        <p>{selectedStation}</p>
        <p>{selectedStation_d}</p>
      </div>

      <div>
        <h2>Available Offers</h2>
        <div className="offer-cards">
          {offers.map((offer) => (
            offer.offer_id !== 0 && ( 
              <div key={offer.offer_id} className={`offer-card ${selectedOffer && selectedOffer=== offer.offer_id ? 'selected' : ''}`}>
                <p>{offer.offer_description}!</p>
                <button onClick={() => handleOfferSelect(offer)}>
                  {selectedOffer && selectedOffer === offer.offer_id ? 'Selected' : 'Select'}
                </button>
              </div>
            )
          ))}
        </div>
      </div>
      <span style={{ padding: '20px' }}></span>
      <div>
        <p><strong>Discounted Fare: </strong>{discountedFare} tk.</p>
      </div>
      <div>
        <button className='confirmButton' style={{ width: '200px' }} onClick={handleConfirm1}>Confirm Booking</button>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Add Transaction ID modal"
      >



        <div className="modal-header">
          <h4>Add Transaction Id</h4>
          <button onClick={closeModal} className="close">
            &times;
          </button>
        </div>
        <form>
          <div className="modal-body">
            <input
              type="text"
              className="form-control mb-2"
              placeholder='Transaction ID'
              value={transactionId || ''}
              onChange={e => setTransactionId(e.target.value)}
            />
            {transactionId ? (
              <button type="button" onClick={handleConfirm} className="btn btn-success">
                Confirm
              </button>
            ) : (
              <button type="button" onClick={handleConfirm} className="btn btn-danger">
                Add Later
              </button>
            )}
          </div>
        </form>
      </Modal>
    </>
  );
};

export default TicketBookingPage;
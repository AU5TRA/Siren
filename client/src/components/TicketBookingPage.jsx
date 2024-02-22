import React from 'react'
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './ticketBook.css';
const TicketBookingPage = () => {
  const location = useLocation();
  const { selectedSeats, totalFare, trainName, className, routeName, date, from, to, selectedStation, selectedStation_d } = location.state;

  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [discountedFare, setDiscountedFare] = useState(totalFare);


  useEffect(() => {
    // const fetchData = ()
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3001/booking/ticket?trainName=${trainName}&className=${className}&routeName=${routeName}&date=${date}&from=${from}&to=${to}&selectedSeats=${selectedSeats.join(',')}&totalFare=${totalFare}&boarding=${selectedStation}&destination=${selectedStation_d}`);
        const result = await response.json();
        console.log(JSON.stringify(result));
        if (result.status === 'success' && result.data && result.data.offers) {
          setOffers(result.data.offers);
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
    setSelectedOffer(offer);
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
        }),
      });
      const result = await response.json();
      if (result.status === 'success') {
        alert('Booking confirmed successfully');
      } else {
        alert('Booking failed');
      }
    } catch (error) {
      console.error(error.message);
    }
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
            <div key={offer.offer_id} className={`offer-card ${selectedOffer && selectedOffer.offer_id === offer.offer_id ? 'selected' : ''}`}>
              <p>{offer.offer_description}!</p>
              <button onClick={() => handleOfferSelect(offer)}>
                {selectedOffer && selectedOffer.offer_id === offer.offer_id ? 'Selected' : 'Select'}
              </button>
            </div>
          ))}
        </div>
      </div>
      <span style={{ padding: '20px' }}></span>
      <div>
        <p><strong>Discounted Fare: </strong>{discountedFare} tk.</p>
      </div>
      <div>
        <button className='confirmButton' style={{ width: '200px' }} onClick={handleConfirm}>Confirm Booking</button>
      </div>
    </>
  );
};

export default TicketBookingPage;
import React from 'react'
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const TicketBookingPage = () => {
  const location = useLocation();
  const { selectedSeats, totalFare, trainName, className, routeName, date, from, to , selectedStation, selectedStation_d} = location.state;

  useEffect(() => {
    // const fetchData = ()
    const fetchData = async () => {
      try {
        const response = await fetch(`http://localhost:3001/booking/ticket?trainName=${trainName}&className=${className}&routeName=${routeName}&date=${date}&from=${from}&to=${to}&selectedSeats=${selectedSeats.join(',')}&totalFare=${totalFare}&boarding=${selectedStation}&destination=${selectedStation_d}`);
        
      } catch (error) {
          console.error(error.message);
      }
  };

  if (location.state) {
      fetchData();
  }
  }, [location]);



  return (
    <div><h1>Ticket Details</h1>
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


  )
}

export default TicketBookingPage
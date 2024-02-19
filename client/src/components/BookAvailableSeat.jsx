import React, { Fragment } from 'react'
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './bookSeat.css';
import { useData } from './AppContext';

const BookAvailableSeat = () => {
    const {name} =useData();
    const [trainId, setTrainId] = useState('');
    const [classId, setClassId] = useState('');
    const [routeId, setRouteId] = useState('');
    const [availableSeatCount, setAvailableSeatCount] = useState('');
    const [totalSeat, setTotalSeat] = useState('');
    const [availableSeatArr, setAvailableSeatArr] = useState([]);

    const [selectedSeats, setSelectedSeats] = useState([]);

    const location = useLocation();

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const trainIdParam = searchParams.get('trainId');
        const classIdParam = searchParams.get('classId');
        const routeIdParam = searchParams.get('routeId');
        const dateParam = searchParams.get('date');
        const fromParam = searchParams.get('from');
        const toParam = searchParams.get('to');

        setClassId(classIdParam);
        setTrainId(trainIdParam);
        setRouteId(routeIdParam);
        // setDate(dateParam);
        // setFrom(fromParam);
        // setTo(toParam);

        // console.log("Train ID:" + trainIdParam + " " + "Class ID:" + classIdParam + " " + "Route ID:" + routeIdParam + " " + "Date:" + dateParam + " " + "From:" + fromParam + " " + "To:" + toParam);



        const fetchData = async () => {
            try {

                const trainQueryParam = encodeURIComponent(trainIdParam);
                const classTypeQueryParam = encodeURIComponent(classIdParam);
                const routeQueryParam = encodeURIComponent(routeIdParam);
                const dateQueryParam = encodeURIComponent(dateParam);
                const fromQueryParam = encodeURIComponent(fromParam);
                const toQueryParam = encodeURIComponent(toParam);

                console.log("PARAMS : " + trainQueryParam + " " + classTypeQueryParam + " " + routeQueryParam + " " + dateQueryParam + " " + fromQueryParam + " " + toQueryParam);

                const url = `http://localhost:3001/booking/seat?trainId=${trainQueryParam}&classId=${classTypeQueryParam}&routeId=${routeQueryParam}&date=${dateQueryParam}&from=${fromQueryParam}&to=${toQueryParam}`;

                const response = await fetch(url);
                const rec = await response.json();
                // console.log(rec.data.available_seat_count);
                // console.log(rec.data.available_seats);
                // console.log(rec.data.total_seats);
                setAvailableSeatCount(rec.data.available_seats_count);
                setAvailableSeatArr(rec.data.available_seats);
                setTotalSeat(rec.data.total_seats);

                // console.log("Available Seat Count: " + availableSeatCount);
                // console.log("Available Seat Arr: " + availableSeatArr);
                // console.log("Total Seat: " + totalSeat);
            } catch (error) {
                console.error(error.message);
            }
        };

        if (trainIdParam && classIdParam && routeIdParam && dateParam && fromParam && toParam) {
            fetchData();
        }

    }, [location.search]);

    // console.log('Train ID:' + trainId + " " + "Class ID:" + classId + " " + "Route ID:" + routeId + " " + "Date:" + date + " " + "From:" + from + " " + "To:" + to) ;
    const handleSeatClick = (seatNumber) => {
        let updatedSeats = [...selectedSeats];
        if (updatedSeats.includes(seatNumber)) {
            updatedSeats = updatedSeats.filter(seat => seat !== seatNumber); 
        } else {
            updatedSeats.push(seatNumber); 
        }
        updatedSeats.sort((a, b) => a - b);
    
        setSelectedSeats(updatedSeats);
    };

    const renderSeats = () => {
        if (!totalSeat || totalSeat <= 0) {
            return <p>No seats available</p>;
        }

        const seats = [];
        for (let i = 1; i <= totalSeat; i += 4) {
            seats.push(
                <li key={i} className="seat" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', width: '50%' }}>
                        {[0, 1, 2, 3].map(offset => {
                            const seatNumber = i + offset;
                            const isCurrentSeatAvailable = availableSeatArr.includes(seatNumber);
                            return (seatNumber <= totalSeat && seatNumber > 0) ? (


                                (seatNumber%2)?
                                <div key={seatNumber} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <input type="checkbox" id={`seat-${seatNumber}`} onClick={() => handleSeatClick(seatNumber)} disabled={!isCurrentSeatAvailable} style={{ marginTop: '25px', marginRight:'10px'}} />
                                    <label htmlFor={`seat-${seatNumber}`} style={{ marginTop: '5px', marginRight:'10px' }}>{seatNumber}</label>
                                </div>
                                :
                                <div key={seatNumber} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <input type="checkbox" id={`seat-${seatNumber}`} onClick={() => handleSeatClick(seatNumber)} disabled={!isCurrentSeatAvailable} style={{ marginTop: '25px', marginRight:'50px'}} />
                                    <label htmlFor={`seat-${seatNumber}`} style={{ marginTop: '5px',marginRight:'50px' }}>{seatNumber}</label>
                                </div>
                            ) : <div key={seatNumber}></div>;
                        })}
                    </div>
                </li>
            );
        }
        return seats;
    };

    return (
        <Fragment>
            <div className="plane" style={{ display: 'flex', justifyContent: 'space-between'}}>
                <div className="seats">
                    <div className="cockpit" style={{ marginTop: '40px' }}>
                        <h1>Please select a seat</h1>
                    </div>
                    <ol className="cabin fuselage">
                        {renderSeats()}
                    </ol>
                </div>

                <div className="selected-seat" style={{ width: '500px', height: 'auto', border: '1px solid black', display: 'flex', flexDirection: 'column', margin: '40px', padding: '10px' }}>
                    <div><p><h3 style={{fontSize:'45px'}}>Tickets</h3></p>
                        <p style={{fontSize:'25px'}}> <strong>Name:</strong> <span style={{padding: '10px'}}></span> {name}</p>
                        <p style={{fontSize:'25px'}}><strong>Train ID:</strong> <span style={{padding: '10px'}}></span>{trainId}</p>
                        <p style={{fontSize:'25px'}}> <strong>Class ID:</strong> <span style={{padding: '10px'}}></span>{classId}</p>
                        <p style={{fontSize:'25px'}}><strong>Route ID:</strong> <span style={{padding: '10px'}}></span>{routeId}</p></div>
                        <p style={{fontSize:'25px'}}><strong>Selected Seats: </strong></p>
                        <p style={{fontSize:'25px'}}>
                    {selectedSeats.length > 0 ? ` ${selectedSeats.join(', ')}` : 'No seats selected'}</p>
                </div>
            </div>
        </Fragment>
    );
};

export default BookAvailableSeat


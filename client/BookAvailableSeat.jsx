import React, { Fragment } from 'react'
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const BookAvailableSeat = () => {

    const [trainId, setTrainId] = useState('');
    const [classId, setClassId] = useState('');
    const [routeId, setRouteId] = useState('');
    const [availableSeatCount, setAvailableSeatCount] = useState('');
    const [totalSeat, setTotalSeat] = useState('');
    const [availableSeatArr, setAvailableSeatArr] = useState([]);
    // const [date, setDate] = useState('');
    // const [from, setFrom] = useState('');
    // const [to, setTo] = useState('');
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

    const renderSeats = () => {
        if (!totalSeat || totalSeat <= 0) {
            return <p>No seats available</p>;
        }

        const seats = [];
        for (let i = 1; i <= totalSeat; i++) {
            const isSeatAvailable = availableSeatArr.includes(i);
            seats.push(
                <li key={i} className="seat">
                    <input type="checkbox" disabled={!isSeatAvailable} />
                    {/* <label htmlFor={`seat-${i}`}>{i}</label> */}
                </li>
            );
        }
        return seats;
    };




    return <Fragment>
        <h1>Book Available Seat</h1>
        <p>Train ID: {trainId}</p>
        <p>Class ID: {classId}</p>
        <p>Route ID: {routeId}</p>
        <div className="plane">
            <div className="cockpit">
                <h1>Please select a seat</h1>
            </div>
            <ol className="cabin fuselage">
                <li className="row">{renderSeats()}</li>
            </ol>
        </div>

    </Fragment>
}

export default BookAvailableSeat


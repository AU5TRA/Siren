import React, { useState, useEffect, Fragment } from 'react';
import { useParams } from 'react-router-dom';


function convertTo12HourFormat(time24) {
    const [hours, minutes] = time24.split(":");
    const parsedHours = parseInt(hours, 10);

    // Determine AM or PM
    const period = parsedHours >= 12 ? "PM" : "AM";

    // Convert to 12-hour format
    const hours12 = parsedHours % 12 || 12;

    return `${hours12}:${minutes} ${period}`;
}

const TrainRoute = () => {
    const { id } = useParams();
    const [routes, setRoute] = useState(null);
    const [train_name, setTrainName] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:3001/trains/${id}`);
                const rec = await response.json();
                console.log(rec.data.result);
                setRoute(rec.data.result);
                const train_name = rec.data.result[0].train_name;
                setTrainName(train_name); 
                // console.log(userData);
            } catch (error) {
                console.error(error.message);
            }
        };

        fetchData();
    }, [id]);

    return (
        <Fragment>
            <h3 style={{ marginBottom: '50px', marginTop:'50px'}}><b><center> {train_name} </center></b></h3>
            {routes && routes.map(route => (
                <div style={{ marginBottom: '30px' }}>
                    
                <ul className="list-group list-group-flush" style={{ marginBottom: '30px' }} key={route.station_id}>
                    <li className="list-group-item">
                        <img src="../../location.png" style={{ width: '20px', height: '25px' }} />
                        <span style={{ marginLeft: '30px' }}></span>
                        <b>{route.station_name}</b>
                    </li>
                    {route.arrival !== null && route.departure !== null && (
                        <li className="list-group-item">
                            Arrival: {convertTo12HourFormat(route.arrival)}
                            <span style={{ marginLeft: '150px' }}> Departure: {convertTo12HourFormat(route.departure)}</span>
                        </li>
                    )}
                    {route.arrival === null && route.departure !== null && (
                        <li className="list-group-item">
                            Departure: {convertTo12HourFormat(route.departure)}
                        </li>
                    )}
                    {route.arrival !== null && route.departure === null && (
                        <li className="list-group-item">
                            Arrival: {convertTo12HourFormat(route.arrival)}
                        </li>
                    )}
                    {route.arrival === null && route.departure === null && (
                        <li className="list-group-item">
                            No Arrival or Departure Information
                        </li>
                    )}
                </ul>
                </div>
            ))}
        </Fragment>

    );
};

export default TrainRoute;

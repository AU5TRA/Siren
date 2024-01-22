import React, { Fragment, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';

const TrainInfo = () => {
    const [trains, setTrains] = useState([]);

    const getTrains = async () => {
        try {
            const response = await fetch("http://localhost:3001/trains");
            const jsondata = await response.json();
            setTrains(jsondata.data?.trains || []); // Safe access and default to an empty array
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        getTrains();
    }, []);     
    console.log(trains);

    return (
        <Fragment>
        <table className="table mt-5 text-container">
            <thead>
                <tr>
                    <th>Train ID</th>
                    <th>Train Name</th>
                    
                </tr>
            </thead>
            <tbody>
                {trains.map(train => (
                    <tr>
                        <td>{train.train_id}</td>
                        <td>{train.train_name}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </Fragment>
    );
};

export default TrainInfo;

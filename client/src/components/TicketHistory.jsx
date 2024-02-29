import React, { Fragment } from 'react'
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useData } from './AppContext'

import './ticketBook.css';




const TicketHistory = () => {
    const { userId } = useData();

    const navigate = useNavigate();


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:3001/siren/users/${userId}/history`);
            } catch (error) {
                console.error(error.message);
            }
        };


    }, []);






    return (
        <Fragment>
            <h1>Ticket History</h1>
        </Fragment>
    );


};

export default TicketHistory;
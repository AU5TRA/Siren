import React, { Fragment, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from './AppContext';
import './ticketBook.css';

function formatDate(time24) {
    const [hours, minutes] = time24.split(":");
    const parsedHours = parseInt(hours, 10);
    const period = parsedHours >= 12 ? "PM" : "AM";
    const hours12 = parsedHours % 12 || 12;
    return `${hours12}:${minutes} ${period}`;
}

const TicketHistory = () => {
    const { userId } = useData();
    const navigate = useNavigate();
    const [ticketHistory, setTicketHistory] = useState([]);
    const [seatmap, setSeatmap] = useState({});
    const [ticketTransactionMap, setTicketTransactionMap] = useState({});

    useEffect(() => {
        const fetchTicketHistory = async () => {
            try {
                if (!userId) return;

                const response = await fetch(`http://localhost:3001/users/${userId}/tickets`);
                if (!response.ok) {
                    throw new Error('Failed to fetch ticket history');
                }
                const data = await response.json();
                console.log("data:///", data);
                setTicketHistory(data.data.tickets);
                setSeatmap(data.data.map);

                const ttMap = {};
                data.data.tickets.forEach(ticket => {
                    if (!ttMap[ticket.transaction_id]) {
                        ttMap[ticket.transaction_id] = [];
                    }
                    ttMap[ticket.transaction_id].push(ticket.ticket_id);
                });
                setTicketTransactionMap(ttMap);
            } catch (error) {
                console.error(error.message);
            }
        };

        fetchTicketHistory();
    }, [userId]);

    const handleProceedToPay = (transactionId) => {
    };

    return (
        <Fragment>
            {Object.entries(ticketTransactionMap).map(([transactionId, ticketIds]) => (
                <div key={transactionId}>
                    {transactionId === 'null' && <h4>Pending Tickets</h4>}
                    {transactionId !== 'null' && <h4>Transaction ID: {transactionId}</h4>}
                    <ul className='ticket-details-list'>
                        {ticketIds.map(ticketId => {
                            const ticket = ticketHistory.find(ticket => ticket.ticket_id === ticketId);
                            return (
                                <li key={ticketId}>
                                    <p>Ticket ID: {ticketId}</p>
                                    <p>Ticket status: {ticket ? ticket.ticket_status : ''}</p>
                                    <p>Date: {ticket ? formatDate(ticket.date_of_journey) : ''}</p>
                                    <p>Seat: {seatmap[ticketId]}</p>
                                    {ticket && ticket.ticket_status === 'pending' && (
                                        <button onClick={() => handleProceedToPay(transactionId)} className="payButton">
                                            Proceed to Pay
                                        </button>
                                    )}
                                    <span style={{ marginLeft: '150px' }}></span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}
        </Fragment>
    );

};

export default TicketHistory;

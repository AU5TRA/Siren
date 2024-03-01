import React, { Fragment, useEffect, useState } from 'react';
import { useData } from './AppContext';
import './ticketBook.css';
import Modal from 'react-modal';

function formattime(time24) {
    const [hours, minutes] = time24.split(":");
    const parsedHours = parseInt(hours, 10);
    const period = parsedHours >= 12 ? "PM" : "AM";
    const hours12 = parsedHours % 12 || 12;
    return `${hours12}:${minutes} ${period}`;
}

function formatDate(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
}

const TicketHistory = () => {
    const { userId } = useData();
    const [ticketHistory, setTicketHistory] = useState([]);
    const [seatmap, setSeatmap] = useState({});
    const [ticketTransactionMap, setTicketTransactionMap] = useState({});
    const [timeMap, setTimeMap] = useState({});
    // const [showModal, setShowModal] = useState(false);
    const [modalIsOpen, setIsOpen] = useState(false);
    const [selectedTransactionId, setSelectedTransactionId] = useState(null);

    useEffect(() => {
        const fetchTicketHistory = async () => {
            try {
                if (!userId) return;

                const response = await fetch(`http://localhost:3001/users/${userId}/tickets`);
                if (!response.ok) {
                    throw new Error('Failed to fetch ticket history');
                }
                const data = await response.json();
                // console.log("data:///", data);
                setTicketHistory(data.data.tickets);
                setSeatmap(data.data.map);
                setTimeMap(data.data.time);

                console.log("timeMap", timeMap);
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




    function openModal() {
        setIsOpen(true);
    }

    function closeModal() {
        setIsOpen(false);
        console.log("//// selectedTransactionId : ", selectedTransactionId);
        // sendTransactionId(selectedTransactionId);
    }

    const sendTransactionId = async (transactionId) => {
        try {
            const response = await fetch(`http://localhost:3001/users/${userId}/transaction/${transactionId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ transactionId }),
            });
            const data = await response.json();
            console.log("data", data);
        } catch (error) {
            console.error(error.message);
        }
    }



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
                                    <p><strong>Ticket ID:</strong> {ticketId}</p>
                                    <p><strong>Ticket status:</strong> {ticket ? ticket.ticket_status : ''}</p>
                                    <p><strong>Date:</strong> {ticket ? formatDate(ticket.date_of_journey) : ''}</p>
                                    <p><strong>Time:</strong> {ticket ? formattime(timeMap[ticket.ticket_id]) : ''}</p>
                                    <p><strong>Seat:</strong> {seatmap[ticketId]}</p>
                                    {ticket && ticket.ticket_status === 'pending' && (
                                        <button onClick={openModal} className="btn btn-warning">
                                            Proceed to pay
                                        </button>
                                    )}
                                    <span style={{ marginLeft: '150px' }}></span>
                                </li>
                            );
                        })}
                    </ul>
                </div>

            ))}
            <Modal isOpen={modalIsOpen} onRequestClose={closeModal} contentLabel="Example Modal">
                {/* <input type="text" placeholder="Enter transactionID " /> */}
                <input type="text" placeholder="Enter transactionID " value={selectedTransactionId} onChange={(e) => setSelectedTransactionId(e.target.value)} />
                {console.log("selectedTransactionId", selectedTransactionId)}
                <button onClick={closeModal}>close</button>
            </Modal>
        </Fragment>
    );

};

export default TicketHistory;

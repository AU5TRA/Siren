-- function for offer eligibility
CREATE OR REPLACE FUNCTION get_eligible_offers(ticket_count INTEGER)
RETURNS TABLE (
    offer_id INT,
    offer_criteria INT,
    offer_description VARCHAR,
    offer_pct DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT o.offer_id, o.offer_criteria, o.offer_description, o.offer_pct
    FROM offer o
    WHERE o.offer_criteria <= ticket_count;
END;
$$ LANGUAGE plpgsql;




-- ticket insert function
CREATE OR REPLACE FUNCTION insert_ticket_transaction(
    user_id INTEGER,
    boarding_station_id INTEGER,
    destination_station_id INTEGER,
    price DECIMAL(10, 2),
    transaction_id INTEGER,
    seat_id INTEGER 
)
RETURNS VOID AS $$
BEGIN
    IF transaction_id IS NULL THEN
        INSERT INTO ticket(user_id, boarding_station_id, destination_station_id, price, ticket_status, seat_id) 
        VALUES (user_id, boarding_station_id, destination_station_id, price, 'pending', seat_id);
    ELSE
        INSERT INTO transaction(transaction_id, mode_of_transaction, offer_id, transaction_time, amount, received)
        VALUES (transaction_id, mode_of_transaction, offer_id, transaction_time, amount, received);
        
        INSERT INTO ticket(user_id, boarding_station_id, destination_station_id, price, ticket_status, transaction_id, seat_id) 
        VALUES (user_id, boarding_station_id, destination_station_id, price, 'confirmed', transaction_id, seat_id);
    END IF;
END;
$$ LANGUAGE plpgsql;





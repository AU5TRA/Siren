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


-- drop function insert_ticket_transaction;
CREATE OR REPLACE FUNCTION insert_ticket(
    user_id INTEGER,
    boarding_station_id INTEGER,
    destination_station_id INTEGER,
    price DECIMAL(10, 2),
    transaction_id INTEGER,
    seat_id INTEGER,
    route_id INTEGER,
    journey_date DATE,
    station_sequence INTEGER[]
)
RETURNS VOID AS $$
BEGIN
    
    FOR i IN 1 .. array_length(station_sequence, 1) LOOP
        UPDATE seat_availability
        SET available = FALSE
        WHERE seat_availability.seat_id = insert_ticket.seat_id
        AND seat_availability.travel_date = journey_date
        AND seat_availability.station_id = station_sequence[i];
    END LOOP;

    IF transaction_id IS NULL THEN
        INSERT INTO ticket(user_id, boarding_station_id, destination_station_id, price, ticket_status, seat_id, date_of_journey)
        VALUES (user_id, boarding_station_id, destination_station_id, price, 'pending', seat_id, journey_date);
    ELSE
        INSERT INTO ticket(user_id, boarding_station_id, destination_station_id, price, ticket_status, transaction_id, seat_id, date_of_journey)
        VALUES (user_id, boarding_station_id, destination_station_id, price, 'confirmed', transaction_id, seat_id, journey_date);
    END IF;
  
END;
$$ LANGUAGE plpgsql;



-- transaction insert function
CREATE OR REPLACE FUNCTION insert_transaction(
    transaction_id INTEGER,
    mode_of_transaction VARCHAR(50),
    offer_id INTEGER,
    amount DECIMAL(10, 2),
    user_id INTEGER
)
RETURNS VOID AS $$
DECLARE
    transaction_time TIMESTAMP := now();
    received INTEGER;
BEGIN
    if transaction_id IS NULL THEN
        received := 0;
        transaction_id := nextval('negative_transaction_id_seq');
        INSERT INTO transaction(mode_of_transaction, offer_id, transaction_time, amount, received, user_id)
        VALUES (mode_of_transaction, offer_id, transaction_time, amount, received, user_id);
    ELSE
        received := 1;
        INSERT INTO transaction(transaction_id, mode_of_transaction, offer_id, transaction_time, amount, received, user_id)
        VALUES (transaction_id, mode_of_transaction, offer_id, transaction_time, amount, received, user_id);
    END IF;
END;
$$ LANGUAGE plpgsql;




CREATE SEQUENCE negative_transaction_id_seq
    START WITH -1  
    INCREMENT BY -1; 

-- drop function insert_ticket_transaction;


-----------------------------------------------station sequence finding function
CREATE OR REPLACE FUNCTION get_station_sequence(route_id_input INT)
RETURNS TABLE(
    route_id INT,
    station_id INT,
    sequence_number INT,
    station_name varchar(50)
) AS $$
BEGIN
    RETURN QUERY WITH RECURSIVE StationSequence AS (
        SELECT 
            rs.route_id,
            rs.station_id,
            rs.sequence_number,
            s.station_name
        FROM 
            route_stations rs
        JOIN 
            station s ON rs.station_id = s.station_id
        WHERE 
            rs.route_id = route_id_input
        UNION ALL
        SELECT 
            rs.route_id,
            rs.station_id,
            rs.sequence_number,
            s.station_name
        FROM 
            route_stations rs
        JOIN 
            StationSequence ss ON rs.route_id = ss.route_id AND rs.sequence_number = ss.sequence_number + 1
        JOIN 
            station s ON rs.station_id = s.station_id
    )
    SELECT DISTINCT * FROM StationSequence
    ORDER BY sequence_number;
END;
$$ LANGUAGE plpgsql;


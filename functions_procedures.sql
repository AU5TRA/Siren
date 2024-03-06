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

    IF transaction_id < 0 THEN
        INSERT INTO ticket(user_id, boarding_station_id, destination_station_id, price, ticket_status, transaction_id, seat_id, date_of_journey)
        VALUES (user_id, boarding_station_id, destination_station_id, price, 'pending', transaction_id, seat_id, journey_date);
    ELSE
        INSERT INTO ticket(user_id, boarding_station_id, destination_station_id, price, ticket_status, transaction_id, seat_id, date_of_journey)
        VALUES (user_id, boarding_station_id, destination_station_id, price, 'confirmed', transaction_id, seat_id, journey_date);
    END IF;
  
END;
$$ LANGUAGE plpgsql;



-- transaction insert function
-- CREATE OR REPLACE FUNCTION insert_transaction(
--     transaction_id INTEGER,
--     mode_of_transaction VARCHAR(50),
--     offer_id INTEGER,
--     amount DECIMAL(10, 2),
--     user_id INTEGER
-- )
-- RETURNS VOID AS $$
-- DECLARE
--     transaction_time TIMESTAMP := now();
--     received INTEGER;
-- BEGIN
--     if transaction_id IS NULL THEN
--         received := 0;
--         transaction_id := nextval('negative_transaction_id_seq');
--         INSERT INTO transaction(transaction_id, mode_of_transaction, offer_id, transaction_time, amount, received, user_id)
--         VALUES (transaction_id, mode_of_transaction, offer_id, transaction_time, amount, received, user_id);
--     ELSE
--         received := 1;
--         INSERT INTO transaction(transaction_id, mode_of_transaction, offer_id, transaction_time, amount, received, user_id)
--         VALUES (transaction_id, mode_of_transaction, offer_id, transaction_time, amount, received, user_id);
--     END IF;
-- END;
-- $$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION insert_transaction(
    transaction_id INTEGER,
    mode_of_transaction VARCHAR(50),
    offer_id INTEGER,
    amount DECIMAL(10, 2),
    user_id INTEGER
)
RETURNS transaction AS $$
DECLARE
    transaction_time TIMESTAMP := now();
    received INTEGER;
    new_transaction transaction; 
BEGIN
    if transaction_id IS NULL THEN
        received := 0;
        transaction_id := nextval('negative_transaction_id_seq');
        INSERT INTO transaction(transaction_id, mode_of_transaction, offer_id, transaction_time, amount, received, user_id)
        VALUES (transaction_id, mode_of_transaction, offer_id, transaction_time, amount, received, user_id)
        RETURNING * INTO new_transaction; 
    ELSE
        received := 1;
        INSERT INTO transaction(transaction_id, mode_of_transaction, offer_id, transaction_time, amount, received, user_id)
        VALUES (transaction_id, mode_of_transaction, offer_id, transaction_time, amount, received, user_id)
        RETURNING * INTO new_transaction; 
    END IF;
    
    RETURN new_transaction; 
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



------------------populate the seat availability table

CREATE OR REPLACE PROCEDURE populate_seat_availability()
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM seat_availability WHERE travel_date < CURRENT_DATE;

  IF NOT EXISTS (SELECT 1 FROM seat_availability WHERE travel_date = CURRENT_DATE + INTERVAL '3 day') THEN
    INSERT INTO seat_availability (seat_id, travel_date, station_id, available)
    SELECT seat.seat_id, CURRENT_DATE + INTERVAL '3 day', route_stations.station_id, TRUE
    FROM seat
    JOIN route_stations ON seat.route_id = route_stations.route_id
    WHERE NOT EXISTS (
      SELECT 1 
      FROM seat_availability 
      WHERE seat_availability.seat_id = seat.seat_id 
      AND seat_availability.travel_date = CURRENT_DATE + INTERVAL '3 day'
      AND seat_availability.station_id = route_stations.station_id
    );
  END IF;
END;
$$;

----- refunding
-- CREATE OR REPLACE PROCEDURE refund_tickets(user_id INTEGER, transaction_id1 INTEGER) AS $$
-- DECLARE
--     refund_amt DECIMAL(10, 2);
-- BEGIN
--     SELECT amount * 0.8 INTO refund_amt
--     FROM transaction
--     WHERE transaction_id = transaction_id1;
    
--     INSERT INTO refund (transaction_id, refund_time, refund_amount)
--     VALUES (transaction_id1, NOW(), refund_amt);

    
--     UPDATE seat_availability sa
--     SET available = TRUE
    
--     FROM ticket t 
--     WHERE sa.seat_id = t.seat_id 
--     AND t.transaction_id = transaction_id1
--     AND t.user_id = user_id;
    
--     DELETE FROM ticket
--     WHERE user_id = user_id
--     AND transaction_id = transaction_id1;
-- END;
-- $$ LANGUAGE plpgsql;


CREATE OR REPLACE PROCEDURE refund_tickets(user_id1 INTEGER, transaction_id1 INTEGER) 
LANGUAGE plpgsql
AS $$
DECLARE
    refund_amt DECIMAL(10, 2);
BEGIN
    SELECT amount * 0.8 INTO refund_amt
    FROM "transaction"
    WHERE transaction_id = transaction_id1;
    
    INSERT INTO refund (transaction_id, refund_time, refund_amount)
    VALUES (transaction_id1, NOW(), refund_amt);

    
    UPDATE seat_availability sa
    SET available = TRUE
    FROM ticket t 
    WHERE sa.seat_id = t.seat_id 
    AND t.transaction_id = transaction_id1
    AND t.user_id = user_id1;

    UPDATE ticket SET ticket_status = 'cancelled'
    WHERE user_id = user_id1 AND transaction_id = transaction_id1;

    UPDATE "transaction" SET received = 0
    WHERE transaction_id = transaction_id1;
    
    DELETE FROM ticket
    WHERE user_id = user_id1
    AND transaction_id = transaction_id1;
END;
$$;

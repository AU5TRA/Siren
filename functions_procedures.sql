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


--station sequence finding function
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

CREATE OR REPLACE PROCEDURE book_tickets(
    date_param DATE,
    selectedSeats_param INT[],
    totalFare_param NUMERIC,
    selectedStation_param VARCHAR(50),
    selectedStation_d_param VARCHAR(50),
    selectedOffer_param INT,
    discountedFare_param NUMERIC,
    transactionId_param INT,
    userId_param INT,
    className_param VARCHAR(50),
    trainName_param VARCHAR(50),
    route_param INT,
    transMode_param VARCHAR(50)
)
LANGUAGE plpgsql
AS $$
DECLARE
    selectedSeatsArray INT[];
    cnt INT;
    price NUMERIC;
    b_id INT;
    d_id INT;
    tr_id INT;
    cl_id INT;
    result RECORD;
    stationIds INT[];
    startStation INT;
    endStation INT;
    startIndex INT;
    endIndex INT;
    stations INT[];
    offer_id INT;
    t_m VARCHAR(50);
    t_id INT;
    resTransaction RECORD;
    transactionId2 INT;
    seat INT;
    result3 RECORD;
    seat_id_n INT;
BEGIN
    selectedSeatsArray := selectedSeats_param;
    cnt := array_length(selectedSeatsArray, 1);

    price := totalFare_param / cnt;

    SELECT B_STATION_ID INTO b_id FROM BOARDING_STATION WHERE B_STATION_NAME = selectedStation_param;
    SELECT B_STATION_ID INTO d_id FROM BOARDING_STATION WHERE B_STATION_NAME = selectedStation_d_param;
    

    SELECT train_id INTO tr_id FROM train WHERE train_name = trainName_param;
    SELECT class_id INTO cl_id FROM class WHERE class_name = className_param;
    

    SELECT * INTO result FROM get_station_sequence(route_param);

    stationIds := ARRAY(SELECT station_id FROM result);

    SELECT station_id INTO startStation FROM boarding_station WHERE B_STATION_NAME = selectedStation_param;
    SELECT station_id INTO endStation FROM boarding_station WHERE B_STATION_NAME = selectedStation_d_param;

    startIndex := array_position(stationIds, startStation);
    endIndex := array_position(stationIds, endStation);

    stations := ARRAY(SELECT unnest(stationIds[startIndex:endIndex + 1]));

    offer_id := selectedOffer_param;

    t_m := transMode_param;
    IF (transactionId_param IS NULL) THEN
        t_id := NULL;
        t_m := '';
    ELSE
        t_id := transactionId_param;
    END IF;

    SELECT transaction_id INTO transactionId2 FROM insert_transaction(t_id, t_m, offer_id, totalFare_param, userId_param);
    

    FOR seat IN SELECT unnest(selectedSeatsArray) LOOP
        SELECT SEAT_ID INTO seat_id_n FROM SEAT WHERE SEAT_NUMBER = seat AND route_id = route_param AND TRAIN_ID = tr_id AND CLASS_ID = cl_id;
       
        PERFORM insert_ticket(userId_param, b_id, d_id, price, transactionId2, seat_id_n, route_param, date_param, stations);
    END LOOP;
END;
$$;




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

-- refunding

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
   
END;
$$;






CREATE OR REPLACE PROCEDURE book_tickets(
    date_param DATE,
    selectedSeats_param INT[],
    totalFare_param NUMERIC,
    selectedStation_param VARCHAR(50),
    selectedStation_d_param VARCHAR(50),
    selectedOffer_param INT,
    discountedFare_param NUMERIC,
    transactionId_param INT,
    userId_param INT,
    className_param VARCHAR(50),
    trainName_param VARCHAR(50),
    route_param INT,
    transMode_param VARCHAR(50)
)
LANGUAGE plpgsql
AS $$
DECLARE
    selectedSeatsArray INT[];
    cnt INT;
    price NUMERIC;
    result1 RECORD;
    result2 RECORD;
    b_id INT;
    d_id INT;
    result4 RECORD;
    tr_id INT;
    result5 RECORD;
    cl_id INT;
    result RECORD;
    stationIds INT[];
    startStation RECORD;
    endStation RECORD;
    startIndex INT;
    endIndex INT;
    stations INT[];
    offerRes RECORD;
    offer_id INT;
    t_m VARCHAR(50);
    t_id INT;
    resTransaction RECORD;
    transactionId2 INT;
    seat INT;
    result3 RECORD;
    seat_id_n INT;
BEGIN
    selectedSeatsArray := selectedSeats_param;
    cnt := array_length(selectedSeatsArray, 1);

    price := totalFare_param / cnt;

    SELECT B_STATION_ID INTO result1 FROM BOARDING_STATION WHERE B_STATION_NAME = selectedStation_param;
    SELECT B_STATION_ID INTO result2 FROM BOARDING_STATION WHERE B_STATION_NAME = selectedStation_d_param;
    b_id := result1.B_STATION_ID;
    d_id := result2.B_STATION_ID;

    SELECT train_id INTO result4 FROM train WHERE train_name = trainName_param;
    tr_id := result4.train_id;
    SELECT class_id INTO result5 FROM class WHERE class_name = className_param;
    cl_id := result5.class_id;

    SELECT * INTO result FROM get_station_sequence(route_param);

    stationIds := ARRAY(SELECT station_id FROM result);

    SELECT station_id INTO startStation FROM boarding_station WHERE B_STATION_NAME = selectedStation_param;
    SELECT station_id INTO endStation FROM boarding_station WHERE B_STATION_NAME = selectedStation_d_param;

    startIndex := array_position(stationIds, startStation.station_id);
    endIndex := array_position(stationIds, endStation.station_id);

    stations := ARRAY(SELECT unnest(stationIds[startIndex:endIndex + 1]));

    SELECT * INTO offerRes FROM offer WHERE offer_id = selectedOffer_param;
    offer_id := offerRes.offer_id;

    t_m := transMode_param;
    t_id := transactionId_param;
    IF (t_id = '') THEN
        t_id := NULL;
        t_m := '';
    END IF;

    SELECT * INTO resTransaction FROM insert_transaction(t_id, t_m, offer_id, totalFare_param, userId_param);
    transactionId2 := resTransaction.transaction_id;

    FOR seat IN SELECT unnest(selectedSeatsArray) LOOP
        SELECT SEAT_ID INTO result3 FROM SEAT WHERE SEAT_NUMBER = seat AND route_id = route_param AND TRAIN_ID = tr_id AND CLASS_ID = cl_id;
        seat_id_n := result3.SEAT_ID;

        PERFORM insert_ticket(userId_param, b_id, d_id, price, transactionId2, seat_id_n, route_param, date_param, stations);
    END LOOP;
END;
$$;




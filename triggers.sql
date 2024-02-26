-- register new user trigger
CREATE OR REPLACE FUNCTION sign_up()
RETURNS TRIGGER AS $$
DECLARE
    LNAME VARCHAR(50);
    FNAME VARCHAR(50);
    NID VARCHAR(20);
    BREG VARCHAR(20);
    PASSENGER_EMAIL VARCHAR(100);
BEGIN
    SELECT INTO NID passenger.nid_number FROM passenger WHERE nid_number = NEW.nid_number AND LENGTH(NEW.nid_number) > 0;
    IF FOUND THEN
        RAISE EXCEPTION 'NID already in use' USING ERRCODE = 'XX001';
    END IF;

    SELECT INTO BREG passenger.birth_registration_number FROM passenger WHERE birth_registration_number = NEW.birth_registration_number AND LENGTH(NEW.birth_registration_number) > 0;
    IF FOUND THEN
        RAISE EXCEPTION 'Birth Registration Number already in use' USING ERRCODE = 'XX002';
    END IF;

    IF NEW.nid_number IS NULL AND NEW.birth_registration_number IS NULL THEN
        RAISE EXCEPTION 'NID or Birth Registration Number must be provided' USING ERRCODE = 'XX003';
    END IF;

    FNAME := NEW.first_name;
    LNAME := NEW.last_name;
    IF LENGTH(FNAME) = 0 OR LENGTH(LNAME) = 0 THEN
        RAISE EXCEPTION 'First Name and Last Name are required fields' USING ERRCODE = 'XX005';
    END IF;

    
    IF NEW.email IS NULL THEN
        RAISE EXCEPTION 'Email is required' USING ERRCODE = 'XX008';
    END IF;

    SELECT INTO PASSENGER_EMAIL passenger.email FROM passenger WHERE email = NEW.email AND NEW.email IS NOT NULL;

    IF FOUND THEN
        RAISE EXCEPTION 'Email already in use' USING ERRCODE = 'XX007';
    END IF;

    IF NEW.date_of_birth IS NULL OR  NEW.date_of_birth > CURRENT_DATE THEN
        RAISE EXCEPTION 'Insert a valid date of Birth' USING ERRCODE = 'XX006';
    END IF;

    IF NEW.phone_number IS NULL OR LENGTH(NEW.phone_number) <> 11 THEN
        RAISE EXCEPTION 'Invalid phone Number' USING ERRCODE = 'XX004';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



CREATE TRIGGER sign_up_trigger
BEFORE INSERT 
ON passenger
FOR EACH ROW
EXECUTE FUNCTION sign_up();





-- check for password match , phone number check , postcode check before updating passenger information
CREATE OR REPLACE FUNCTION check_password()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.password <> OLD.password THEN
        RAISE EXCEPTION 'Password does not match' USING ERRCODE = 'XX009';
    END IF;
    IF NEW.phone_number IS NULL OR LENGTH(NEW.phone_number) < 11 THEN
        RAISE EXCEPTION 'Invalid phone Number' USING ERRCODE = 'XX004';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



CREATE TRIGGER check_password_trigger
BEFORE UPDATE
ON passenger
FOR EACH ROW
EXECUTE FUNCTION check_password();




-- inserting into ticket and transaction table

-- userId, b_station_id, d_station_id, price, transactionId, seat_id


-- CREATE OR REPLACE FUNCTION insert_ticket_transaction(user_id INTEGER, boarding_station_id INTEGER, destination_station_id INTEGER, price DECIMAL(10, 2), transaction_id INTEGER)
-- RETURNS TABLE (
--     ticket_id VARCHAR(15),
--     user_id INTEGER,
--     boarding_station_id INTEGER,
--     destination_station_id INTEGER,
--     price DECIMAL(10, 2),
--     ticket_status VARCHAR(20),
--     transaction_id INTEGER,
--     mode_of_transaction VARCHAR(50),
--     offer_id INTEGER,
--     transaction_time TIMESTAMP,
--     -- amount DECIMAL(10, 2),
--     -- received BOOLEAN
-- ) AS $$
-- BEGIN 
--     IF NEW.transaction_id IS NULL THEN
--         NEW.ticket_status := 'pending';
--         INSERT INTO ticket(ticket_id, user_id, boarding_station_id, destination_station_id, price, ticket_status)
--         VALUES (NEW.ticket_id, NEW.user_id, NEW.boarding_station_id, NEW.destination_station_id, NEW.price, NEW.ticket_status);
--     ELSE
--         NEW.received := TRUE;
--         NEW.ticket_status := 'confirmed';
--         INSERT INTO transaction(transaction_id, mode_of_transaction, offer_id, transaction_time, amount, received)
--         VALUES (NEW.transaction_id, NEW.mode_of_transaction, NEW.offer_id, NEW.transaction_time, NEW.amount, NEW.received);
--         INSERT INTO ticket(ticket_id, user_id, boarding_station_id, destination_station_id, price, ticket_status, transaction_id)
--         VALUES (NEW.ticket_id, NEW.user_id, NEW.boarding_station_id, NEW.destination_station_id, NEW.price, NEW.ticket_status, NEW.transaction_id);
--     END IF;
--     RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insert_ticket_transaction(
    p_user_id INTEGER,
    p_boarding_station_id INTEGER,
    p_destination_station_id INTEGER,
    p_price DECIMAL(10, 2),
    p_transaction_id INTEGER,
    p_seat_id INTEGER
)
RETURNS TABLE (
    user_id INTEGER,
    boarding_station_id INTEGER,
    destination_station_id INTEGER,
    price DECIMAL(10, 2),
    ticket_status VARCHAR(20),
    transaction_id INTEGER,
    mode_of_transaction VARCHAR(50),
    offer_id INTEGER,
    transaction_time TIMESTAMP,
    seat_id INTEGER
) AS $$
BEGIN 
    IF p_transaction_id IS NULL THEN
        INSERT INTO ticket(user_id, boarding_station_id, destination_station_id, price, ticket_status)
        VALUES (NEW.ticket_id, p_user_id, p_boarding_station_id, p_destination_station_id, p_price, 'pending');
    ELSE
        INSERT INTO transaction(transaction_id, mode_of_transaction, offer_id, transaction_time)
        VALUES (p_transaction_id, NEW.mode_of_transaction, NEW.offer_id, NEW.transaction_time);
        
        INSERT INTO ticket(ticket_id, user_id, boarding_station_id, destination_station_id, price, ticket_status, transaction_id)
        VALUES (NEW.ticket_id, p_user_id, p_boarding_station_id, p_destination_station_id, p_price, 'confirmed', p_transaction_id);
    END IF;
    
    RETURN QUERY SELECT * FROM ticket WHERE ticket_id = NEW.ticket_id;
END;
$$ LANGUAGE plpgsql;


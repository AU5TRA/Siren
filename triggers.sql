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
CREATE OR REPLACE FUNCTION insert_ticket_transaction()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.transaction_id IS NULL THEN
        NEW.received := FALSE;
        NEW.ticket_status := 'pending';
        INSERT INTO ticket(ticket_id, user_id, boarding_station_id, destination_station_id, total_fare, travel_status)
        VALUES (NEW.ticket_id, NEW.user_id, NEW.boarding_station_id, NEW.destination_station_id, NEW.total_fare, NEW.travel_status);
    ELSIF NEW.transaction_id IS NOT NULL THEN
        NEW.received := TRUE;
        NEW.ticket_status := 'confirmed';
        INSERT INTO transaction(transaction_id, mode_of_transaction, offer_id, transaction_time, amount, received)
        VALUES (NEW.transaction_id, NEW.mode_of_transaction, NEW.offer_id, NEW.transaction_time, NEW.amount, NEW.received);
        INSERT INTO ticket(ticket_id, user_id, boarding_station_id, destination_station_id, total_fare, travel_status, transaction_id)
        VALUES (NEW.ticket_id, NEW.user_id, NEW.boarding_station_id, NEW.destination_station_id, NEW.total_fare, NEW.travel_status, NEW.transaction_id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER insert_ticket_transaction_trigger
BEFORE INSERT
ON ticket
FOR EACH ROW
EXECUTE FUNCTION insert_ticket_transaction();




    -- transaction_id INTEGER PRIMARY KEY,
    -- mode_of_transaction VARCHAR(50) NOT NULL,
    -- offer_id INTEGER REFERENCES offer(offer_id),
    -- transaction_time TIMESTAMP,
    -- amount DECIMAL(10, 2) NOT NULL
    -- received BOOLEAN 



    -- ticket_id VARCHAR(15) PRIMARY KEY,
    -- user_id INTEGER REFERENCES passenger(user_id),
    -- boarding_station_id INTEGER REFERENCES boarding_station(b_station_id),
    -- destination_station_id INTEGER REFERENCES boarding_station(b_station_id),
    -- total_fare DECIMAL(10, 2) NOT NULL,
    -- travel_status VARCHAR(20),
    -- transaction_id INTEGER REFERENCES transaction(transaction_id)
-- register new user trigger
CREATE OR REPLACE FUNCTION log_in()
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

    IF NEW.phone_number IS NULL OR LENGTH(NEW.phone_number) < 11 THEN
        RAISE EXCEPTION 'Invalid phone Number' USING ERRCODE = 'XX004';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;



CREATE TRIGGER log_in_trigger
BEFORE INSERT 
ON passenger
FOR EACH ROW
EXECUTE FUNCTION log_in();





---- function to extract the offers of which the ticket count>= offer_criteria



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

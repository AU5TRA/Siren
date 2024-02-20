CREATE OR REPLACE FUNCTION log_in() 
RETURNS TRIGGER AS $$
DECLARE 
    LNAME VARCHAR(50);
    FNAME VARCHAR(50);
    NID VARCHAR(50);
    BREG VARCHAR(50);
    PASSENGER_EMAIL VARCHAR(50);
    DOB DATE;
    PW VARCHAR(50);
BEGIN 
    SELECT INTO PASSENGER_EMAIL passenger.email FROM passenger WHERE email = NEW.email;
    IF FOUND THEN
        RAISE EXCEPTION 'Email already exists';
    END IF;

    SELECT INTO NID passenger.nid_number FROM passenger WHERE nid_number = NEW.nid_number;
    SELECT INTO BREG passenger.birth_registration_number FROM passenger WHERE birth_registration_number = NEW.birth_registration_number;
    IF FOUND THEN
        RAISE EXCEPTION 'NID or Birth Registration Number already exists';
    END IF;

    IF NEW.nid_number IS NULL AND NEW.birth_registration_number IS NULL THEN
        RAISE EXCEPTION 'NID or Birth Registration Number must be provided';
    END IF;

    PW := NEW.password;
    IF LENGTH(PW) < 8 THEN
        RAISE EXCEPTION 'Password must be at least 8 characters';
    END IF;

    FNAME := NEW.first_name;
    LNAME := NEW.last_name;
    IF LENGTH(FNAME) = 0 OR LENGTH(LNAME) = 0 THEN
        RAISE EXCEPTION 'First Name and Last Name cannot be empty';
    END IF;

    DOB := NEW.date_of_birth;
    IF DOB > CURRENT_DATE THEN
        RAISE EXCEPTION 'Date of Birth cannot be in the future';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_in_trigger
BEFORE INSERT 
ON passenger
FOR EACH ROW
EXECUTE FUNCTION log_in();




INSERT INTO passenger (first_name, last_name, email, date_of_birth, gender, phone_number, nid_number, birth_registration_number)
VALUES ('John', 'Doe', 'john@mail', '1990-01-15', '2', '123456789', '123456789', NULL);




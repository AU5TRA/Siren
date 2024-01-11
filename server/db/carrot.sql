-- creating table for passenger
CREATE TABLE passenger (
    user_id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    address VARCHAR(255),
    birth_registration_number VARCHAR(20),
    post_code VARCHAR(10),
    password VARCHAR(100) NOT NULL,
    nid_number VARCHAR(20),  
    CHECK (
        NOT (nid_number IS NULL AND birth_registration_number IS NULL)
    )
);

-- Creating the 'class' table
CREATE TABLE class (
    class_id PRIMARY KEY,
    class_name VARCHAR(50) UNIQUE NOT NULL
);

-- Creating the 'train' table
CREATE TABLE train (
    train_id PRIMARY KEY,
    train_name VARCHAR(50) NOT NULL
);

-- Creating the 'station' table
CREATE TABLE station (
    station_id PRIMARY KEY,
    station_name VARCHAR(50) UNIQUE NOT NULL,
    location VARCHAR(100),
    zone VARCHAR(50)
);

-- Creating the 'fareList' table
CREATE TABLE fareList (
    class_id INTEGER REFERENCES class(class_id),
    source INTEGER REFERENCES station(station_id),
    destination INTEGER REFERENCES station(station_id),
    fare DECIMAL(5,2), -- Assuming fare is a numeric value, adjust the data type as needed
    PRIMARY KEY (class_id, source, destination)
);

-- Creating the 'distance' table
CREATE TABLE distance (
    source INTEGER REFERENCES station(station_id),
    destination INTEGER REFERENCES station(station_id),
    track_length NUMERIC, -- Assuming track_length is a numeric value, adjust the data type as needed
    PRIMARY KEY (source, destination)
);


-- Creating the 'Seat' table with array of station_ids
CREATE TABLE seat (
    seat_id SERIAL PRIMARY KEY,
    train_id INTEGER REFERENCES train(train_id),
    class_id INTEGER REFERENCES class(class_id),
    seat_number VARCHAR(10),
    available_stations INTEGER[] REFERENCES station(station_id) ARRAY,
    travel_date DATE
);


-- Creating the 'offer' table
CREATE TABLE offer (
    offer_id SERIAL PRIMARY KEY,
    offer_criteria VARCHAR(100) NOT NULL,
    offer_description VARCHAR(255) NOT NULL,
    offer_pct DECIMAL(5, 2) NOT NULL
);


-- Creating the 'Ticket' table
CREATE TABLE ticket (
    ticket_id PRIMARY KEY,
    user_id INTEGER REFERENCES passenger(user_id),
    seat_id INTEGER REFERENCES seat(seat_id),
    start_station INTEGER REFERENCES station(station_id),
    destination_station INTEGER REFERENCES station(station_id),
    offer_id INTEGER REFERENCES offer(offer_id),
    total_fare DECIMAL(10, 2) NOT NULL,
    travel_status VARCHAR(20) -- Assuming travel_status is a string, adjust as needed
);



-- Creating the 'review' table
CREATE TABLE review (
    review_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES passenger(user_id),
    ticket_id INTEGER REFERENCES ticket(ticket_id),
    train_id INTEGER REFERENCES train(train_id),
    class_id INTEGER REFERENCES class(class_id),
    review_content VARCHAR(100),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL-- Assuming ratings are between 1 and 5, adjust as needed
);


-- Creating the 'Payment' table
CREATE TABLE payment (
    transaction_id PRIMARY KEY,
    user_id INTEGER REFERENCES passenger(user_id),
    ticket_id INTEGER REFERENCES ticket(ticket_id),
    mode_of_transaction VARCHAR(50) NOT NULL,
    offer_id INTEGER REFERENCES offer(offer_id),
    time_of_payment TIMESTAMP,
    amount DECIMAL(10, 2) NOT NULL
);

-- Creating the 'Refund' table
CREATE TABLE refund (
    refund_id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES payment(transaction_id),
    time_of_refund TIMESTAMP,
    refund_amount DECIMAL(10, 2) NOT NULL
);





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


CREATE TABLE class (
    class_id INTEGER PRIMARY KEY,
    class_name VARCHAR(50) UNIQUE NOT NULL
);


CREATE TABLE train (
    train_id INTEGER PRIMARY KEY,
    train_name VARCHAR(50) NOT NULL
);


CREATE TABLE station (
    station_id INTEGER PRIMARY KEY,
    station_name VARCHAR(50) UNIQUE NOT NULL,
    
);


CREATE TABLE fareList (
    class_id INTEGER REFERENCES class(class_id),
    source INTEGER REFERENCES station(station_id),
    destination INTEGER REFERENCES station(station_id),
    fare DECIMAL(5,2), 
    PRIMARY KEY (class_id, source, destination)
);


CREATE TABLE distance (
    source INTEGER REFERENCES station(station_id),
    destination INTEGER REFERENCES station(station_id),
    track_length DECIMAL(6, 2), 
    PRIMARY KEY (source, destination)
);


CREATE TABLE seat (
    seat_id SERIAL PRIMARY KEY,
    train_id INTEGER REFERENCES train(train_id),
    class_id INTEGER REFERENCES class(class_id),
    seat_number VARCHAR(10),
    travel_date DATE
);

CREATE TABLE seat_availability (
    seat_id INTEGER REFERENCES seat(seat_id),
    station_id INTEGER REFERENCES station(station_id),
    PRIMARY KEY (seat_id, station_id) 
);



CREATE TABLE offer (
    offer_id SERIAL PRIMARY KEY,
    offer_criteria VARCHAR(100) NOT NULL,
    offer_description VARCHAR(255) NOT NULL,
    offer_pct DECIMAL(5, 2) NOT NULL
);



CREATE TABLE ticket (
    ticket_id VARCHAR(15) PRIMARY KEY,
    user_id INTEGER REFERENCES passenger(user_id),
    seat_id INTEGER REFERENCES seat(seat_id),
    start_station INTEGER REFERENCES station(station_id),
    destination_station INTEGER REFERENCES station(station_id),
    total_fare DECIMAL(10, 2) NOT NULL,
    travel_status VARCHAR(20) 
);


CREATE TABLE Schedule (
    train_id INTEGER REFERENCES train(train_id),
    station_id INTEGER REFERENCES station(station_id),
    sequence INTEGER,
    arrival TIME,
    departure TIME,
    PRIMARY KEY (train_id, station_id)
);

CREATE TABLE review (
    review_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES passenger(user_id),
    ticket_id VARCHAR(15) REFERENCES ticket(ticket_id),
    train_id INTEGER REFERENCES train(train_id),
    class_id INTEGER REFERENCES class(class_id),
    review_content VARCHAR(100),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL
);



CREATE TABLE payment (
    transaction_id INTEGER PRIMARY KEY,
    user_id INTEGER REFERENCES passenger(user_id),
    ticket_id VARCHAR(15) REFERENCES ticket(ticket_id),
    mode_of_transaction VARCHAR(50) NOT NULL,
    offer_id INTEGER REFERENCES offer(offer_id),
    time_of_payment TIMESTAMP,
    amount DECIMAL(10, 2) NOT NULL
);


CREATE TABLE refund (
    refund_id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES payment(transaction_id),
    time_of_refund TIMESTAMP,
    refund_amount DECIMAL(10, 2) NOT NULL
);



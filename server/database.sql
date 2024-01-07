CREATE DATABASE SIREN;
CREATE TABLE passenger(
    user_id BIGSERIAL PRIMARY KEY,
    username VARCHAR(200) NOT NULL,
    email VARCHAR(100) NOT NULL, 
    nid VARCHAR(17) UNIQUE, 
    gender CHAR,
    phone VARCHAR(12) NOT NULL,
    password VARCHAR(255) NOT NULL
);

INSERT INTO passenger (username, email, nid, gender, phone, password ) values ('Sheikh Ifti', 'example@example.com', '1234567587985643','F', '01717181624', 'sfghsydgfhdsf');


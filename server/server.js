require("dotenv").config();
const authorization = require("./middleware/authorize");
const express = require("express");
const cors = require("cors");
const db = require("./db");
const jwtGenerator = require("./utils/jwtGenerator");
const bcrypt = require('bcryptjs');
// const { v4: uuidv4 } = require('uuid');
const app = express();
app.use(express.json());
app.use(cors());

function generateTicketId(trainName, className, date) {
  const timestamp = Date.now();
  const uniqueString = trainName.slice(0, 3) + className.slice(0, 3) + date.replaceAll('-', '');
  const randomString = Math.random().toString(36).substring(2, 7);

  return uniqueString + '_' + timestamp + '_' + randomString;
}


app.get("/is-verify", authorization, async (req, res) => {
  try {
    console.log("-----------------");
    console.log("aurthorization successful");
    res.json(true);
  } catch (err) {
    console.log(err.message);
    res.status(500).json("Server Error");
  }
});


// ticket
app.get("/booking/ticket", async (req, res) => {
  try {
    const { trainName, className, routeName, date, from, to, selectedSeats, totalFare } = req.query;
    console.log(trainName + " " + className + " " + routeName + " " + date + " " + from + " " + to + " " + selectedSeats + " " + totalFare);

    // const ticketID = uuidv4();
    // const results = await db.query('SELECT * FROM passenger WHERE user_id = $1', [req.body.user_id]);
  } catch (error) {
    console.error(error.message);
  }
});


// book a seat
app.get('/booking/seat', async (req, res) => {
  try {
    const { trainId, classId, routeId, date, from, to } = req.query;
    console.log(trainId + " " + classId + " " + routeId + " " + date + " " + from + " " + to);

    const dateReceived = new Date(date);
    const year = dateReceived.getFullYear();
    const month = String(dateReceived.getMonth() + 1).padStart(2, '0');
    const day = String(dateReceived.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    const queryFrom = `SELECT station_name from station WHERE LOWER(station_name) LIKE LOWER($1);`

    const queryTo = `SELECT station_name from station WHERE LOWER(station_name) LIKE LOWER($1);`


    const fromStation = await db.query(queryFrom, [from]);
    const toStation = await db.query(queryTo, [to]);

    const r1 = await db.query('SELECT station_id FROM station WHERE UPPER(station_name) = $1', [from.toUpperCase()]);
    const r2 = await db.query('SELECT station_id FROM station WHERE UPPER(station_name) = $1', [to.toUpperCase()]);
    console.log(r1.rows[0]);
    console.log(r2.rows[0]);

    const fromStationId = parseInt(r1.rows[0].station_id);
    const toStationId = parseInt(r2.rows[0].station_id);
    console.log("from station id : " + fromStationId);
    console.log("to station id : " + toStationId);

    const RouteNameQuery = `SELECT route_name FROM route WHERE route_id = $1`;
    const resultRouteName = await db.query(RouteNameQuery, [routeId]);
    const routeName = resultRouteName.rows[0].route_name;


    const query3 = `
  WITH RECURSIVE StationSequence AS (
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
        rs.route_id = $1
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
  ORDER BY sequence_number;`;

    const resultForStations = await db.query(query3, [routeId]);
    console.log("resultForStations : " + resultForStations.rows.length);

    const stations = resultForStations.rows;
    console.log(stations);
    console.log(stations.length);
    console.log("--------------");


    const queryForFare = `SELECT 
        f.fare, t.train_name, c.class_name
    FROM 
        train t
    JOIN 
        train_class tc ON t.train_id = tc.train_id
    JOIN 
        class c ON tc.class_id = c.class_id
    JOIN 
        fareList f ON c.class_id = f.class_id
    WHERE 
        t.train_id = $1
        AND tc.class_id = $2
     `;

    const resultFare = await db.query(queryForFare, [trainId, classId]);
    console.log("resultFare : " + resultFare.rows[0].fare);
    const sendFare = resultFare.rows[0].fare;
    const trainName = resultFare.rows[0].train_name;
    const className = resultFare.rows[0].class_name;
    console.log("train name : " + trainName);
    console.log("class name : " + className);



    const queryForAvailableSeats = `
    SELECT CAST(seat_number AS INTEGER) AS seat_number
    FROM (
        SELECT s.seat_number
        FROM seat_availability sa
        JOIN seat s ON sa.seat_id = s.seat_id
        WHERE s.train_id = $1
        AND s.class_id = $2
        AND s.route_id = $3
        AND sa.travel_date = $4
        AND sa.station_id = ANY($5)
        AND sa.available = TRUE
        GROUP BY s.seat_number
        HAVING COUNT(DISTINCT sa.station_id) = $6
    ) AS seats
    ORDER BY CAST(seat_number AS INTEGER);
     `;
    const result = await db.query(queryForAvailableSeats, [trainId, classId, routeId, formattedDate, stations.map(s => s.station_id), stations.length]);
    // console.log("res : " + result.rows.length);
    const availableSeats = [];
    for (const r of result.rows) {
      availableSeats.push(r.seat_number);
    }

    console.log(availableSeats);

    const queryForTotalSeats = `
      SELECT seat_count FROM train_class WHERE train_id = $1 AND class_id = $2;
      `;
    const result3 = await db.query(queryForTotalSeats, [trainId, classId]);
    const total_seat = result3.rows[0].seat_count;
    console.log("res3 : " + total_seat);
    // console.log("res3 : " + result3.rows.length);
    res.status(200).json({
      status: "success",
      data: {
        available_seats_count: result.rows.length,
        available_seats: availableSeats,
        total_seats: total_seat,
        fare: sendFare,
        train_name: trainName,
        class_name: className,
        route_name: routeName
      }
    });
  }
  catch (err) {
    console.log(err);
  }

});


// review
app.get("/review", async (req, res) => {
  try {
    const trainID = req.query.trainID;
    const classType = req.query.classType;
    const results = await db.query('SELECT * FROM review WHERE train_id = $1 AND class_id = $2', [trainID, classType]);
    res.status(200).json({
      status: "success",
      result: results.rows,
    });
  } catch (err) {
    console.log(err);
  }
});

// /// suggestive search train
app.get("/book/station/search", async (req, res) => {
  try {
    const st = req.query.name;
    console.log(st);
    const results = await db.query(
      'SELECT station_name FROM station WHERE LOWER(station_name) LIKE LOWER($1)',
      [`%${st.toLowerCase()}%`]
    );
    console.log(results);
    //const firstNames = results.rows.map(row => row.first_name);

    res.status(200).json({
      status: "success",
      data: {
        result: results.rows,
        //names : firstNames 
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});


///train search booking

app.get("/book/search", async (req, res) => {
  try {
    const fromS = req.query.from;
    console.log(fromS);
    const toS = req.query.to;
    console.log(toS);
    console.log("******");
    const dateString = req.query.date;


    const dateReceived = new Date(dateString);

    const year = dateReceived.getFullYear();
    const month = String(dateReceived.getMonth() + 1).padStart(2, '0');
    const day = String(dateReceived.getDate()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}`;
    const queryFrom = `SELECT station_name from station WHERE LOWER(station_name) LIKE LOWER($1);`

    const queryTo = `SELECT station_name from station WHERE LOWER(station_name) LIKE LOWER($1);`


    const fromStation = await db.query(queryFrom, [fromS]); // finding the names of the FROM-TO stations
    const toStation = await db.query(queryTo, [toS]);

    const r1 = await db.query('SELECT station_id FROM station WHERE UPPER(station_name) = $1', [fromS.toUpperCase()]);
    const r2 = await db.query('SELECT station_id FROM station WHERE UPPER(station_name) = $1', [toS.toUpperCase()]);


    const fromStationId = parseInt(r1.rows[0].station_id);
    const toStationId = parseInt(r2.rows[0].station_id);



    const queryforTrain = (`
        SELECT DISTINCT t.train_id, t.train_name, tr.route_id
    FROM train t
    JOIN train_routes tr ON t.train_id = tr.train_id
    JOIN route_stations rs_from ON tr.route_id = rs_from.route_id
    JOIN route_stations rs_to ON tr.route_id = rs_to.route_id
    JOIN station s_from ON rs_from.station_id = s_from.station_id
    JOIN station s_to ON rs_to.station_id = s_to.station_id
    WHERE s_from.station_id = $1
    AND s_to.station_id = $2
    AND rs_from.sequence_number < rs_to.sequence_number;
        `);  // returns the unique train, route pairs

    const trainResults = await db.query(queryforTrain, [fromStationId, toStationId]);
    const trainIdsSet = new Set(trainResults.rows.map(row => row.train_id));
    const trainIdsArray = Array.from(trainIdsSet); // returns the unique train ids
    const trainIdsString = trainIdsArray.join(',');

    const routeIDSet = new Set(trainResults.rows.map(row => row.route_id));
    const distinctRouteIDs = Array.from(routeIDSet);  // returns the unique routes to exist

    const query2 = `SELECT 
        t.train_id, 
        t.train_name, 
        c.class_name,
        c.class_id,
        f.fare
    FROM 
        train t
    JOIN 
        train_class tc ON t.train_id = tc.train_id
    JOIN 
        class c ON tc.class_id = c.class_id
    JOIN 
        fareList f ON c.class_id = f.class_id
    WHERE 
        t.train_id IN (${trainIdsString})
        AND f.source = $1        
        AND f.destination = $2 
     `;// returns the fares of those trains to go from FROM to TO for each of their classes

    const trainFares = await db.query(query2, [fromStationId, toStationId]);
    const query3 = `
        WITH RECURSIVE StationSequence AS (
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
              rs.route_id = $1
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
        ORDER BY sequence_number;`;   // for a given route_id, extracts the stations and their sequence

    let routeStations = []; // This will hold routeIDs and their stations
    for (const routeID of distinctRouteIDs) {
      const result = await db.query(query3, [routeID]);
      routeStations.push({ routeID: routeID, results: result.rows });
    }
    console.log("m1");

    const queryForAvailableSeats = `
    SELECT CAST(seat_number AS INTEGER) AS seat_number
    FROM (
        SELECT s.seat_number
        FROM seat_availability sa
        JOIN seat s ON sa.seat_id = s.seat_id
        WHERE s.train_id = $1
        AND s.class_id = $2
        AND s.route_id = $3
        AND sa.travel_date = $4
        AND sa.station_id = ANY($5)
        AND sa.available = TRUE
        GROUP BY s.seat_number
        HAVING COUNT(DISTINCT sa.station_id) = $6
    ) AS seats
    ORDER BY CAST(seat_number AS INTEGER);
     `;
    console.log("m2");

    const queryForTotalSeats = `
      SELECT seat_count FROM train_class WHERE train_id = $1 AND class_id = $2;
      `;

    const result4 = [];



    for (const train of trainResults.rows) {  // train_id, train_name, route_id
      const t_id = train.train_id;
      const r_id = train.route_id;
      const t_name = train.train_name;
      const stations_in_route = routeStations.find(r => r.routeID === r_id).results; // holds the stations

      const classes = await db.query('SELECT class_id FROM train_class where train_id= $1', [t_id]);

      for (const c of classes.rows) {
        const class_id = c.class_id;
        const result2 = await db.query(queryForAvailableSeats, [t_id, class_id, r_id, formattedDate, stations_in_route.map(s => s.station_id), stations_in_route.length]);
        // console.log(result2.rows.length);
        // console.log("---------------");
        const availableSeats = [];
        for (const r of result2.rows) {
          availableSeats.push(r.seat_number);
        }

        const result3 = await db.query(queryForTotalSeats, [t_id, class_id]);

        // console.log(result2.rows[0].seat_id + " " + result2.rows[1].seat_id);

        result4.push({ train_id: t_id, route_id: r_id, class_id: class_id, available_seats_count: result2.rows.length, available_seats: availableSeats, total_seats: result3.rows[0].seat_count });
      }

    }

    console.log(result4);


    res.status(200).json({
      status: "success",
      data: {
        result: trainResults.rows,
        result2: trainFares.rows,
        from: fromStation.rows,
        to: toStation.rows,
        info: result4
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});






// Get all users
app.get("/users", async (req, res) => {
  try {
    // console.log("route handler");

    const results = await db.query('SELECT * FROM passenger ORDER BY user_id');

    res.status(200).json({
      status: "success",
      result: results.rows.length,
      data: {
        users: results.rows,
      },
    });
  } catch (err) {
    console.log(err);
  }
});

// get all trains
app.get("/trains", async (req, res) => {
  try {
    // console.log("route handler");

    const results = await db.query('SELECT * FROM train ORDER BY train_id');
    console.log(results.rows[0]);
    res.status(200).json({
      status: "success",
      result: results.rows.length,
      data: {
        trains: results.rows,
      },
    });
  } catch (err) {
    console.log(err);
  }
});

//Get a train route
app.get("/trains/:id", async (req, res) => {
  console.log(req.params.id);

  try {
    const trainID = parseInt(req.params.id);

    const results = await db.query(`SELECT 
      tr.train_id,
      tr.train_name,
      r.route_id,
      r.route_name,
      rs.sequence_number,
      s.station_id,
      s.station_name,
      sch.arrival,
      sch.departure
  FROM 
      train_routes trr
  JOIN 
      train tr ON trr.train_id = tr.train_id
  JOIN 
      route r ON trr.route_id = r.route_id
  JOIN 
      route_stations rs ON r.route_id = rs.route_id
  JOIN 
      station s ON rs.station_id = s.station_id
  JOIN 
      Schedule sch ON tr.train_id = sch.train_id AND s.station_id = sch.station_id AND r.route_id = sch.route_id
  WHERE 
      tr.train_id = $1
  ORDER BY 
      tr.train_id, r.route_id, rs.sequence_number;
  `, [trainID]);

    res.status(200).json({
      status: "success",
      data: {
        result: results.rows,
      },
    });
  } catch (err) {
    console.log(err);
  }
});



//Get a user
app.get("/users/:id", async (req, res) => {
  console.log(req.params.id);

  try {
    const userID = parseInt(req.params.id);
    const results = await db.query(
      'SELECT * FROM passenger WHERE user_id = $1',
      [userID]
    );

    res.status(200).json({
      status: "succes",
      data: {
        result: results.rows[0],
      },
    });
  } catch (err) {
    console.log(err);
  }
});


// Create a user

app.post("/users", async (req, res) => {
  console.log(req.body);
  const { email, phone_number, password } = req.body;
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  try {
    // const phone_number = req.body.phone_number
    // const email = req.body.email;
    const { first_name, last_name, nid_number, birth_registration_number, phone_number, email, date_of_birth, password, gender } = req.body;
    console.log(first_name + " " + last_name + " " + nid_number + " " + birth_registration_number + " " + phone_number + " " + email + " " + date_of_birth + " " + password + " " + gender);
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    const results = await db.query(
      'INSERT INTO passenger (first_name,last_name,nid_number,birth_registration_number,phone_number,email,date_of_birth,password,gender) values ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *', [first_name, last_name, nid_number, birth_registration_number, phone_number, email, date_of_birth, hashedPassword, gender]);
    // console.log(phone_number + " " + email);
    // //
    // if (!email && !phone_number) {
    //   return res.status(300).json({ status: "email and phone_number cannot both be empty" });
    // }
    // else if (!email && phone_number) {
    //   const result1 = await db.query('SELECT * FROM passenger WHERE phone_number = $1', [req.body.phone_number]);

    //   if (result1.rows.length !== 0) {
    //     // res.send("user already exists")
    //     res.status(400).json(
    //       {
    //         status: "user already exists",
    //         "userID": result1.rows[0].user_id
    //       }
    //     )
    //   }
    //   else {
    //     const results = await db.query(
    //       'INSERT INTO passenger (first_name,last_name,email,gender,phone_number,nid_number,date_of_birth,address,birth_registration_number,post_code,password) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
    //       [req.body.first_name, req.body.last_name, req.body.email, req.body.gender, req.body.phone_number, req.body.nid_number, req.body.date_of_birth, req.body.address, req.body.birth_registration_number, req.body.post_code, req.body.password]
    //     );
    //     //console.log("row start");
    //     const jwtToken = jwtGenerator(results.rows[0].user_id);
    //     console.log(results.rows[0].user_id);
    //     return res.json({ jwtToken });

    //     /*res.status(201).json({
    //       status: "succes",
    //       "userID": results.rows[0].user_id,

    //     });*/
    //   }
    // }

    // else if (!phone_number && email) {
    //   const result2 = await db.query('SELECT * FROM passenger WHERE email = $1', [req.body.email]);

    //   if (result2.rows.length !== 0) {
    //     res.status(400).json(
    //       {
    //         status: "user already exists",
    //         "userID": result2.rows[0].user_id
    //       }
    //     )
    //   }

    //   else {
    // const results = await db.query(
    //   'INSERT INTO "user" (first_name,last_name,email,gender,phone_number,nid_number,date_of_birth,address,birth_registration_number,post_code,password) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
    //   [req.body.first_name, req.body.last_name, req.body.email, req.body.gender, req.body.phone_number, req.body.nid_number, req.body.date_of_birth, req.body.address, req.body.birth_registration_number, req.body.post_code, hashedPassword]
    // );
    // const jwtToken = jwtGenerator(results.rows[0].user_id);
    // console.log(results.rows[0].user_id);
    // return res.json({ jwtToken });
    /*res.status(201).json({
      status: "succes",
      "userID": results.rows[0].user_id
    });*/
    // }
    // }
    // else {
    //   const check = await db.query('SELECT * FROM passenger WHERE email = $1 OR phone_number = $2', [req.body.email, req.body.phone_number]);
    //   console.log(check);
    //   if (check.rows.length !== 0) {
    //     res.status(400).json(
    //       {
    //         status: "user already exists",
    //         "userID": check.rows[0].user_id
    //       }
    //     )
    //   }
    //
    // else {
    //   const results = await db.query(
    //     'INSERT INTO passenger (first_name,last_name,email,gender,phone_number,nid_number,date_of_birth,address,birth_registration_number,post_code,password) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
    //     [req.body.first_name, req.body.last_name, req.body.email, req.body.gender, req.body.phone_number, req.body.nid_number, req.body.date_of_birth, req.body.address, req.body.birth_registration_number, req.body.post_code, hashedPassword]
    //   );
    //   //console.log("row start");
    //   console.log(results.rows[0].user_id);
    //   //console.log("row end");
    //   res.status(201).json({
    //     status: "succes",
    //     "userID": results.rows[0].user_id
    //   });
    // }
    // }

    const jwtToken = jwtGenerator(results.rows[0].user_id);
    console.log(results.rows[0].user_id);
    return res.status(201).json({
      status: "success",
      data: {
        status: "Account created successfully",
        userID: results.rows[0].user_id
      }
    });

  } catch (err) {
    console.log(err);
    if (err.code === 'XX001') {
      return res.status(400).json({ error: "NID already in use" });
    }
    else if (err.code === 'XX002') {
      return res.status(400).json({ error: "Birth Registration Number already in use" });
    }
    else if (err.code === 'XX003') {
      return res.status(400).json({ error: "NID or Birth Registration Number must be provided" });
    }
    else if (err.code === 'XX004') {
      return res.status(400).json({ error: "Invalid phone Number" });
    }
    else if (err.code === 'XX005') {
      return res.status(400).json({ error: "First Name and Last Name are required fields" });
    }
    else if (err.code === 'XX006') {
      return res.status(400).json({ error: "Invalid date of Birth" });
    }
    else if (err.code === 'XX007') {
      return res.status(400).json({ error: "Email already in use. Please provide a new email" });
    }
    else if (err.code === 'XX008') {
      return res.status(400).json({ error: "Email is a required field" });
    }
    else {
      console.log("unknown error");
      return res.status(401).json({ error: err.message });
    }
  }
});


// Update user


app.put("/users/:id/update", async (req, res) => {

  try {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    // console.log("here" + req.body.new_password + " here" + req.body.password);
    var hashedPassword = await bcrypt.hash(req.body.new_password, salt);

    const user = await db.query("SELECT * FROM passenger WHERE user_id = $1", [req.params.id]);

    // if (!user.rows.length) {
    //   return res.status(404).json({ error: "User not found" });
    // }

    const userData = user.rows[0];
    // const isOldPasswordValid = await bcrypt.compare(req.body.password, userData.password);

    // if (!isOldPasswordValid) {
    //   console.log("Incorrect password");
    //   return res.status(401).json({ error: "Invalid old password" });
    // }

    if (req.body.new_password === '') {
      hashedPassword = userData.password;
    }

    console.log(req.body.address + " ---" + req.body.post_code + "+++----- " + req.body.phone_number + " " + hashedPassword + " " + req.body.birth_registration_number + " " + req.params.id)

    const results = await db.query(
      'UPDATE passenger SET address = $1, post_code = $2, phone_number = $3, password = $4, birth_registration_number = $5 WHERE user_id = $6 returning *',
      [
        req.body.address,
        req.body.post_code,
        req.body.phone_number,
        hashedPassword,
        req.body.birth_registration_number,
        req.params.id
      ]
    );

    console.log(results);
    console.log("updated");
    res.status(200).json({
      status: "success",
      data: {
        user: results.rows[0],
      },
    });
  } catch (err) {
    console.error(err.code);
    console.error("-------------------")
    console.error(err);
    // res.status(500).json({ error: err.message });
    if (err.code === 'XX004') {
      return res.status(400).json({ error: "Invalid phone Number" });
    }
    else if (err.code === 'XX009') {
      // console.log("in Incorrect password");
      return res.status(400).json({ error: "Incorrect Password" });
    }
  }
});


// Delete user

app.delete("/users/:id", async (req, res) => {
  try {
    console.log("deleting user " + req.params.id);
    const results = db.query('DELETE FROM passenger where user_id = $1', [
      req.params.id,
    ]);
    // console.log(results);
    res.status(204).json({
      status: "sucess",

    });
  } catch (err) {
    console.log(err);
  }
});



// Search User // dummy
app.get("/search", async (req, res) => {
  try {
    const userName = req.query.name;
    console.log(userName);
    const results = await db.query(
      'SELECT * FROM train WHERE LOWER(train_name) LIKE LOWER($1)',
      [`%${userName.toLowerCase()}%`]
    );
    console.log(results);
    //const firstNames = results.rows.map(row => row.first_name);

    res.status(200).json({
      status: "success",
      data: {
        result: results.rows,
        //names : firstNames 
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});
// dummy end


//suggestive search train
app.get("/trains/name/search", async (req, res) => {
  try {
    const userName = req.query.name;
    console.log(userName);
    const results = await db.query(
      'SELECT * FROM train WHERE LOWER(train_name) LIKE LOWER($1)',
      [`%${userName.toLowerCase()}%`]
    );
    console.log(results);
    //const firstNames = results.rows.map(row => row.first_name);

    res.status(200).json({
      status: "success",
      data: {
        result: results.rows,
        //names : firstNames 
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});


// Search Train
app.get("/trains/search", async (req, res) => {
  try {
    const userName = req.query.name;
    console.log(userName);
    const results = await db.query(
      'SELECT * FROM train WHERE LOWER(train_name) LIKE LOWER($1)',
      [`%${userName.toLowerCase()}%`]
    );
    console.log(results);
    //const firstNames = results.rows.map(row => row.first_name);

    res.status(200).json({
      status: "success",
      data: {
        result: results.rows,
        //names : firstNames 
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
});

//login
app.post("/users/login", async (req, res) => {
  try {
    const results = await db.query("SELECT * FROM passenger WHERE email = $1", [req.body.email]);
    const isOldPasswordValid = await bcrypt.compare(req.body.password, results.rows[0].password);
    if (!isOldPasswordValid) {

      return res.status(401).json({ message: "Invalid password" });
    }

    console.log("login successful");
    const jwtToken = jwtGenerator(results.rows[0].user_id);
    console.log(jwtToken);
    res.status(200).json({
      status: "success",
      data: {
        result: results.rows,
        res: jwtToken
      },
      message: "Login Successful"
    });
  }
  catch (err) {
    console.error(err.message);
  }
});

const port = process.env.PORT || 3001;        //environ variable -> env // port env te pass na korle default value 3001
app.listen(port, () => {
  console.log(`server is up and listening on port ${port}`);
});

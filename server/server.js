require("dotenv").config();
const authorization = require("./middleware/authorize");
const express = require("express");
const cors = require("cors");
const db = require("./db");
const jwtGenerator = require("./utils/jwtGenerator");
const bcrypt = require('bcryptjs');
// const { requirePropFactory } = require("@mui/material");
// const { v4: uuidv4 } = require('uuid');
const app = express();
app.use(express.json());
app.use(cors());


app.post('/transaction/refund/:userId/:transactionId', async (req, res) => {

  const { userId, transactionId } = req.params;


  const result = await db.query(`SELECT * FROM transaction WHERE user_id = $1 AND transaction_id = $2`, [userId, transactionId])


  const refund = await db.query(`CALL refund_tickets($1, $2)`, [userId, transactionId]);

});

app.post('/transaction/:id/:transactionId/:oldTransactionId', async (req, res) => {
  console.log(req.params.id);
  console.log(req.params.transactionId);
  console.log(req.params.oldTransactionId);
  const oldTransactionId = req.params.oldTransactionId;
  console.log("//////////////////////////////");
  let t_id = req.params.transactionId;
  if (t_id === '' || t_id === 'null') {
    console.log("returning");
    return res.status(400).json({
      status: "error",
      message: "Transaction ID cannot be empty",
    });
  }

  const result = await db.query(`SELECT * FROM transaction where transaction_id = $1`, [oldTransactionId]);
  console.log(result.rows[0]);
  const offerId = result.rows[0].offer_id;
  const totalFare = result.rows[0].amount;
  console.log(offerId);
  console.log(totalFare);
  const mode = result.rows[0].mode_of_transaction;
  console.log("////////////" + mode + "//////////////////");

  const res2 = await db.query(`SELECT * FROM insert_transaction($1, $2, $3, $4, $5)`, [req.params.transactionId, mode, offerId, totalFare, req.params.id]);
  console.log(res2.rows);

  // const  

  // const updateTransaction = await db.query(`UPDATE transaction SET transaction_id = $1, received = 1 WHERE user_id = $2 AND transaction_id = $3 RETURNING *`, [req.params.transactionId, req.params.id, req.params.oldTransactionId]);
  // console.log(updateTransaction);
  const updateTicket = await db.query(`UPDATE ticket SET transaction_id = $1, ticket_status = 'confirmed' WHERE user_id = $2 AND transaction_id = $3`, [req.params.transactionId, req.params.id, req.params.oldTransactionId]);
  console.log(updateTicket);
  const del = await db.query(`DELETE FROM transaction where transaction_id = $1`, [req.params.oldTransactionId]);
  console.log(del);
  console.log("///////////DONEEEEE????????????");
  res.status(200).json({
    status: "success",
    data: {
      ticket: updateTicket.rows,
    },
  });
});


app.get("/users/:id/tickets", async (req, res) => {
  try {
    console.log("in tickets?????????")
    const userId = req.params.id;
    const seats_map = {};
    const results = await db.query('SELECT * FROM ticket WHERE user_id = $1', [userId]);
    console.log(userId);
    for (const ticket of results.rows) {
      const seat = await db.query('SELECT seat_number FROM seat WHERE seat_id = $1', [ticket.seat_id]);
      seats_map[ticket.ticket_id] = seat.rows[0].seat_number;
    }
    // console.log(results.rows);  
    // console.log(seats_map);
    // console.log(results.rows);

    const ticket_time_map = {};
    const ticket_trans_map = {};
    for (const ticket of results.rows) {
      const st_id = await db.query(`SELECT station_id from boarding_station where b_station_id = $1`, [ticket.boarding_station_id]);
      const time = await db.query(`SELECT * from schedule sc JOIN seat s ON sc.train_id = s.train_id AND sc.route_id = s.route_id
      WHERE s.seat_id = $1 and sc.station_id = $2;`, [ticket.seat_id, st_id.rows[0].station_id]);
      // console.log(time.rows[0].departure);
      const transactionRes = await db.query('SELECT * FROM transaction JOIN ticket ON transaction.transaction_id = ticket.transaction_id WHERE ticket.ticket_id = $1', [ticket.ticket_id]);
      // console.log(transactionRes.rows[0].mode_of_transaction);
      ticket_time_map[ticket.ticket_id] = time.rows[0].departure;
      ticket_trans_map[ticket.ticket_id] = transactionRes.rows[0].mode_of_transaction;
    }

    const tr = await db.query('SELECT distinct(transaction_id) FROM ticket WHERE user_id = $1', [userId]);
    // console.log(tr.rows);
    const transactionJourneyMap = {};
    const arr = tr.rows.map(row => row.transaction_id);
    // console.log(arr);
    for (const t of arr) {
      const seatIDs = await db.query('SELECT seat_id, boarding_station_id, destination_station_id, ticket_status, date_of_journey FROM ticket where transaction_id = $1', [t]);
      const seat_id_temp = seatIDs.rows[0].seat_id;
      const desSt = seatIDs.rows[0].destination_station_id;
      const boardSt = seatIDs.rows[0].boarding_station_id;
      const tstatus = seatIDs.rows[0].ticket_status;
      const d_o_j = seatIDs.rows[0].date_of_journey;
      
      const seat = await db.query('SELECT train_id, class_id FROM seat WHERE seat_id = $1', [seat_id_temp]);
      // console.log(seat.rows[0].train_id);
      // console.log(seat.rows[0].class_id);
      const trainName = await db.query('SELECT train_name from train WHERE train_id = $1', [seat.rows[0].train_id]);
      const className = await db.query('SELECT class_name from class WHERE class_id = $1', [seat.rows[0].class_id]);
      // console.log(trainName.rows[0].train_name);
      // console.log(className.rows[0].class_name);
      const fromRes = await db.query('SELECT station_name from station JOIN boarding_station ON station.station_id = boarding_station.station_id WHERE boarding_station.b_station_id = $1', [boardSt]);
      const toRes = await db.query('SELECT station_name from station JOIN boarding_station ON station.station_id = boarding_station.station_id WHERE boarding_station.b_station_id = $1', [desSt]);
      const from = fromRes.rows[0].station_name;
      const to = toRes.rows[0].station_name;
      // console.log(from);
      // console.log(to);
      transactionJourneyMap[t] = { trainName: trainName.rows[0].train_name, className: className.rows[0].class_name, from: from, to: to , doj : d_o_j, status: tstatus};
    }
    // console.log(ticket_time_map);
    // console.log(transactionJourneyMap);

    res.status(200).json({
      status: "success",
      data: {
        tickets: results.rows,
        map: seats_map,
        time: ticket_time_map,
        transMode: ticket_trans_map,
        journeyMap: transactionJourneyMap
      },
    });
  } catch (err) {
    console.log(err);
  }
});

app.post("/booking/confirm", async (req, res) => {
  try {
    const { date,
      selectedSeats,
      totalFare,
      selectedStation,
      selectedStation_d,
      selectedOffer,
      discountedFare,
      transactionId,
      userId,
      className,
      trainName,
      route,
      transMode } = req.body;

    console.log(selectedOffer + "+++++++")
    console.log("////" + transMode + "////");
    console.log("******" + selectedSeats + "******" + typeof selectedSeats);
    const selectedSeatsArray = [...selectedSeats];
    // const ticketId = generateTicketId(selectedStation, selectedStation_d, date);
    console.log(date + " " + selectedSeats + " " + totalFare + " " + selectedStation + " " + selectedStation_d + " " + selectedOffer + " " + discountedFare + " " + transactionId + " user: " + userId + " " + route);
    const cnt = selectedSeatsArray.length;
    console.log(cnt);

    const price = totalFare / cnt;
    console.log(price);



    // const insertQuery = `INSERT INTO ticket (user_id, boarding_station_id, destination_station_id , price, transaction_id, seat_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const result1 = await db.query(`SELECT B_STATION_ID FROM BOARDING_STATION WHERE B_STATION_NAME = $1`, [selectedStation]);
    const result2 = await db.query(`SELECT B_STATION_ID FROM BOARDING_STATION WHERE B_STATION_NAME = $1`, [selectedStation_d]);
    const b_station_id = result1.rows[0].b_station_id;
    const d_station_id = result2.rows[0].b_station_id;


    // const result = await db.query(insertQuery, [1, selectedStation, selectedStation_d, price, ]);
    const result4 = await db.query(`SELECT train_id FROM train WHERE train_name = $1 `, [trainName]);
    const train_id = result4.rows[0].train_id;
    const result5 = await db.query(`SELECT class_id FROM class WHERE class_name = $1 `, [className]);
    const class_id = result5.rows[0].class_id;

    console.log("----" + selectedSeatsArray.length + "----")


    const result = await db.query('SELECT * FROM get_station_sequence($1)', [route]);

    const stationIds = result.rows.map(row => row.station_id);

    const startStation = await db.query('SELECT station_id FROM boarding_station WHERE B_STATION_NAME = $1', [selectedStation]);
    const endStation = await db.query('SELECT station_id FROM boarding_station WHERE B_STATION_NAME = $1', [selectedStation_d]);

    const startIndex = stationIds.indexOf(startStation.rows[0].station_id);
    console.log(startIndex + 'haha' + startStation.rows[0].station_id);
    const endIndex = stationIds.indexOf(endStation.rows[0].station_id);
    console.log(endIndex + 'haehe' + endStation.rows[0].station_id);

    const stations = stationIds.slice(startIndex, endIndex + 1);


    console.log(stations + "\\\\\\\\\\\\\\\\\\\\\\");



    // const tickets = [];
    const offerRes = await db.query('SELECT * FROM offer WHERE offer_id = $1', [selectedOffer]);
    const offer_id = offerRes.rows[0].offer_id;
    console.log("transac : " + transactionId + "-----");
    let t_m = transMode;
    let t_id = transactionId;
    if (transactionId === '') {
      t_id = null;
      t_m = 'not paid';
    }
    // const result = await db.query(insertQuery, [userId, b_station_id, d_station_id, price, transactionId, seat_id]);
    const resTransaction = await db.query('SELECT * FROM insert_transaction($1, $2, $3, $4, $5)', [t_id, t_m, offer_id, totalFare, userId]);

    // console.log(resTransaction.rows);
    console.log("------//" + resTransaction.rows[0].transaction_id + "//------");
    const transactionId2 = resTransaction.rows[0].transaction_id;

    for (const seat of selectedSeatsArray) {


      const result3 = await db.query(`SELECT SEAT_ID FROM SEAT WHERE SEAT_NUMBER = $1 AND route_id= $2 AND TRAIN_ID= $3 AND CLASS_ID=$4`, [seat.toString(), route, train_id, class_id]);
      const seat_id_n = result3.rows[0].seat_id;
      // console.log(typeof seat_id_n + '++');

      const result = await db.query('SELECT * from insert_ticket($1, $2, $3, $4, $5, $6, $7, $8, $9)', [userId, b_station_id, d_station_id, price, transactionId2, seat_id_n, route, date, stations]);

    }

    // console.log("-------" + tickets + "-------");

    res.status(200).json({
      status: "success",
      data: {
        // ticket: tickets,
      }
    });
  } catch (error) {
    console.error(error.message);
  }

});


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
    const { trainName, className, routeName, date, from, to, selectedSeats, totalFare, boarding, destination } = req.query;
    const seatsArray = selectedSeats.split(',').map(seat => seat.trim());

    const offers = await db.query(`SELECT * FROM get_eligible_offers($1)`, [seatsArray.length])
    console.log(offers.rows[0]);
    console.log(trainName + " " + className + " " + routeName + " " + date + " " + from + " " + to + " " + seatsArray + " " + totalFare + ' ' + boarding + ' ' + destination);

    res.status(200).json({
      status: "success",
      data: {
        train_name: trainName,
        class_name: className,
        route_name: routeName,
        date: date,
        from: from,
        to: to,
        selected_seats: seatsArray,
        total_fare: totalFare,
        boarding_station: boarding,
        destination_station: destination,
        offers: offers.rows
      },

    });
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




    const query3 = `SELECT * FROM get_station_sequence($1);`


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

    const b_station = await db.query('SELECT b_station_name FROM BOARDING_STATION WHERE STATION_ID = $1', [fromStationId]);


    const d_station = await db.query('SELECT b_station_name FROM BOARDING_STATION WHERE STATION_ID = $1', [toStationId]);




    res.status(200).json({
      status: "success",
      data: {
        available_seats_count: result.rows.length,
        available_seats: availableSeats,
        total_seats: total_seat,
        fare: sendFare,
        train_name: trainName,
        class_name: className,
        route_name: routeName,
        b_station: b_station.rows,
        d_station: d_station.rows
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
    const results = await db.query('SELECT p.user_id, p.first_name, p.last_name, r.review_content, r.rating FROM review r join passenger p on (r.user_id= p.user_id) WHERE r.train_id = $1 AND r.class_id = $2', [trainID, classType]);
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
    const populate = await db.query('Call populate_seat_availability()');
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

    const query3 = `SELECT * FROM get_station_sequence($1);`

    let routeStations = []; // This will hold routeIDs and their stations
    for (const routeID of distinctRouteIDs) {
      const result = await db.query(query3, [routeID]);
      routeStations.push({ routeID: routeID, results: result.rows });
    }
    //console.log("m1");

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
    // console.log("m2");

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


    const jwtToken = jwtGenerator(results.rows[0].user_id);
    console.log(results.rows[0].user_id);
    return res.status(201).json({
      status: "success",
      data: {
        status: "Account created successfully",
        userID: results.rows[0].user_id,
        jwtToken: jwtToken
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


    const userData = user.rows[0];
    // const isOldPasswordValid = await bcrypt.compare(req.body.password, userData.password);


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

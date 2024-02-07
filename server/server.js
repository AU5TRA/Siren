require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");
const jwtGenerator = require("./utils/jwtGenerator");
const bcrypt = require('bcryptjs');
const app = express();

app.use(express.json());
app.use(cors());

/// suggestive search train
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
    const toS = req.query.to;
    console.log(fromS);
    const r1 = await db.query('SELECT station_id FROM station WHERE UPPER(station_name) = $1', [fromS.toUpperCase()]);
    const r2 = await db.query('SELECT station_id FROM station WHERE UPPER(station_name) = $1', [toS.toUpperCase()]);
    console.log(r1.rows[0]);
    const fromStationId = parseInt(r1.rows[0].station_id);
    const toStationId = parseInt(r2.rows[0].station_id);
    console.log(fromStationId);
    console.log(toStationId);
    const query = (`
    SELECT DISTINCT t.train_id, t.train_name
FROM train t
JOIN train_routes tr ON t.train_id = tr.train_id
JOIN route_stations rs_from ON tr.route_id = rs_from.route_id
JOIN route_stations rs_to ON tr.route_id = rs_to.route_id
JOIN station s_from ON rs_from.station_id = s_from.station_id
JOIN station s_to ON rs_to.station_id = s_to.station_id
WHERE s_from.station_id = $1
AND s_to.station_id = $2
AND rs_from.sequence_number < rs_to.sequence_number;
    `);
    const results = await db.query(query, [fromStationId, toStationId]);
    console.log(results);
    console.log('....................');
    const trainIds = results.rows.map(row => row.train_id);
    const trainIdsString = trainIds.join(',');
    const query2 = `SELECT 
    t.train_id, 
    t.train_name, 
    c.class_name, 
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
 ;`;
    const results2 = await db.query(query2, [fromStationId, toStationId]);
    console.log(results2);
    console.log('....................');

    const queryFrom = `SELECT station_name from station
    WHERE LOWER(station_name) LIKE LOWER($1);`



    const queryTo = `SELECT station_name from station
    WHERE LOWER(station_name) LIKE LOWER($1);`




    const fromStation = await db.query(queryFrom, [fromS]);
    console.log(fromStation);
    console.log('....................');

    const toStation = await db.query(queryTo, [toS]);
    console.log(toStation);
    console.log('....................');



    res.status(200).json({
      status: "success",
      data: {
        result: results.rows,  // returns the trains
        result2: results2.rows,  // 
        from: fromStation.rows,
        to: toStation.rows
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
    // const results = await db.query(
    // 'SELECT (SELECT s.station_name FROM station s WHERE s.station_id = q.station_id) AS station_name, q.arrival, q.departure, (SELECT t.train_name from train t where t.train_id= q.train_id) as train_name FROM schedule q WHERE q.train_id = $1 ORDER BY q.sequence',
    // [trainID]
    // );

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
    const phone_number = req.body.phone_number
    const email = req.body.email;
    console.log(phone_number + " " + email);
    //
    if (!email && !phone_number) {
      return res.status(300).json({ status: "email and phone_number cannot both be empty" });
    }
    else if (!email && phone_number) {
      const result1 = await db.query('SELECT * FROM passenger WHERE phone_number = $1', [req.body.phone_number]);

      if (result1.rows.length !== 0) {
        // res.send("user already exists")
        res.status(400).json(
          {
            status: "user already exists",
            "userID": result1.rows[0].user_id
          }
        )
      }
      else {
        const results = await db.query(
          'INSERT INTO passenger (first_name,last_name,email,gender,phone_number,nid_number,date_of_birth,address,birth_registration_number,post_code,password) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
          [req.body.first_name, req.body.last_name, req.body.email, req.body.gender, req.body.phone_number, req.body.nid_number, req.body.date_of_birth, req.body.address, req.body.birth_registration_number, req.body.post_code, req.body.password]
        );
        //console.log("row start");
        const jwtToken = jwtGenerator(results.rows[0].user_id);
        console.log(results.rows[0].user_id);
        return res.json({ jwtToken });

        /*res.status(201).json({
          status: "succes",
          "userID": results.rows[0].user_id,
          
        });*/
      }
    }

    else if (!phone_number && email) {
      const result2 = await db.query('SELECT * FROM passenger WHERE email = $1', [req.body.email]);

      if (result2.rows.length !== 0) {
        res.status(400).json(
          {
            status: "user already exists",
            "userID": result2.rows[0].user_id
          }
        )
      }

      else {
        const results = await db.query(
          'INSERT INTO "user" (first_name,last_name,email,gender,phone_number,nid_number,date_of_birth,address,birth_registration_number,post_code,password) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
          [req.body.first_name, req.body.last_name, req.body.email, req.body.gender, req.body.phone_number, req.body.nid_number, req.body.date_of_birth, req.body.address, req.body.birth_registration_number, req.body.post_code, hashedPassword]
        );
        const jwtToken = jwtGenerator(results.rows[0].user_id);
        console.log(results.rows[0].user_id);
        return res.json({ jwtToken });
        /*res.status(201).json({
          status: "succes",
          "userID": results.rows[0].user_id
        });*/
      }
    }
    else {
      const check = await db.query('SELECT * FROM passenger WHERE email = $1 OR phone_number = $2', [req.body.email, req.body.phone_number]);
      console.log(check);
      if (check.rows.length !== 0) {
        res.status(400).json(
          {
            status: "user already exists",
            "userID": check.rows[0].user_id
          }
        )
      }
      //
      else {
        const results = await db.query(
          'INSERT INTO passenger (first_name,last_name,email,gender,phone_number,nid_number,date_of_birth,address,birth_registration_number,post_code,password) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
          [req.body.first_name, req.body.last_name, req.body.email, req.body.gender, req.body.phone_number, req.body.nid_number, req.body.date_of_birth, req.body.address, req.body.birth_registration_number, req.body.post_code, hashedPassword]
        );
        //console.log("row start");
        console.log(results.rows[0].user_id);
        //console.log("row end");
        res.status(201).json({
          status: "succes",
          "userID": results.rows[0].user_id
        });
      }
    }
  } catch (err) {
    console.log(err);
  }
});


// Update user


app.put("/users/:id/update", async (req, res) => {

  try {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    console.log("here" + req.body.new_password + " here" + req.body.password);
    var hashedPassword = await bcrypt.hash(req.body.new_password, salt);

    const user = await db.query("SELECT * FROM passenger WHERE user_id = $1", [req.params.id]);

    if (!user.rows.length) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = user.rows[0];
    const isOldPasswordValid = await bcrypt.compare(req.body.password, userData.password);

    if (!isOldPasswordValid) {
      console.log("Incorrect password");
      return res.status(401).json({ error: "Invalid old password" });
    }

    if (req.body.new_password === '') {
      hashedPassword = userData.password;
    }

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
    console.error(err);
    res.status(500).json({ error: err.message });
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
    //console.log(req.body.password)
    const results = await db.query("SELECT * FROM passenger WHERE email = $1", [req.body.email]);
    //console.log(results.rows[0])
    const isOldPasswordValid = await bcrypt.compare(req.body.password, results.rows[0].password);
    //console.log(results.rows[0].password);
    if (!isOldPasswordValid) {
      //console.log("Incorrect password");
      return res.status(401).json({ message: "Invalid password" });
    }

    console.log("login successful");
    //console.log(results);
    //const firstNames = results.rows.map(row => row.first_name);
    const jwtToken = jwtGenerator(results.rows[0].user_id);
    console.log(jwtToken);
    //return res.json({ jwtToken });
    res.status(200).json({
      status: "success",
      data: {
        result: results.rows,
        res: { jwtToken }
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

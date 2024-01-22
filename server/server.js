require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");
// const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const app = express();

app.use(express.json());
app.use(cors());


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
    const results = await db.query(
      'SELECT (SELECT s.station_name FROM station s WHERE s.station_id = q.station_id) AS station_name, q.arrival, q.departure FROM schedule q WHERE q.train_id = $1 ORDER BY q.sequence;',
      [trainID]
    );

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
        console.log("row start");
        console.log(results.rows[0].user_id);
        console.log("row end");
        res.status(201).json({
          status: "succes",
          "userID": results.rows[0].user_id
        });
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
        console.log("row start");
        console.log(results.rows[0].user_id);
        console.log("row end");
        res.status(201).json({
          status: "succes",
          "userID": results.rows[0].user_id
        });
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
    const hashedPassword = await bcrypt.hash(req.body.new_password, salt);

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



    const results = await db.query(
      'UPDATE passenger SET address = $1, post_code = $2, phone_number = $3, email = $4, password = $5, date_of_birth = $6, birth_registration_number = $7 WHERE user_id = $8 returning *',
      [
        req.body.address,
        req.body.post_code,
        req.body.phone_number,
        req.body.email,
        hashedPassword,
        req.body.date_of_birth,
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



// Search User
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
  // const saltRounds = 10;
  // const salt = await bcrypt.genSalt(saltRounds);
  //const hashedPassword = await bcrypt.hash(req.body.password, salt);
  try {
    console.log(req.body.password)
    const results = await db.query("SELECT * FROM passenger WHERE email = $1", [req.body.email]);
    console.log(results.rows[0])
    const isOldPasswordValid = await bcrypt.compare(req.body.password, results.rows[0].password);
    console.log(results.rows[0].password);
    if (!isOldPasswordValid) {
      //console.log("Incorrect password");
      return res.status(401).json({ message: "Invalid password" });
    }

    console.log("login successful");
    console.log(results);
    //const firstNames = results.rows.map(row => row.first_name);

    res.status(200).json({
      status: "success",
      data: {
        result: results.rows,
      },
      message:"Login Successful"
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

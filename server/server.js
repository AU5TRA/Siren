require("dotenv").config();
const morgan = require("morgan");
const express = require("express");
const cors = require("cors");

const app = express();
const db = require("./db"); // one dot means current directory
app.use(morgan("tiny"));

app.use(express.json());
app.use(cors());


/*
app.use((req, res, next) => {  // next function
   console.log("middleware lmao");
   next();
});

app.use((req, res, next) =>{
   res.status(404).json({
       status:'fail'
   });
   next();
});  // returned everywhere
*/


// get all birds
app.get("/users", async (req, res) => {
    try {
        const results = await db.query("select * from passenger");
        console.log(results);
        res.status(200).json({ // 404 is for NOT FOUND
            status: "success",
            results: results.rows.length,
            data: {
                passengers: results.rows,
            },

        });
    } catch (error) {
        console.log(error);
    }


});
// http://localhost:4000/api/v1/birds


// GET a bird
app.get("/users/:id", async(req, res) => {
    console.log(req.params.id);
    try {
        const results = await db.query("select * from passenger where user_id= $1", [req.params.id]);
        console.log(results.rows[0]);
        res.status(200).json({
            status: "success",
            data: {
                passengers: results.rows[0],
            }
        });
    } catch (error) {
        console.log(error);
    }
    
});


// create a bird 
app.post("/users", async(req, res) => {
    console.log(req.body);
    console.log("hello2.4");
    try{
        // const results= await db.query("INSERT INTO BIRD (name, color, size) values($1, $2, $3) returning *", [req.body.name, req.body.color, req.body.size]);
        const results= await db.query("INSERT INTO passenger (username, email, nid, gender, phone ) values ($1, $2, $3, $4, $5) returning *", [req.body.username, req.body.email, req.body.nid, req.body.gender, req.body.phone]);
        res.status(201).json({
            status: "success",
            data: {
                passengers: results.rows[0]
            }
        });
    }catch(error){
        console.log(error);
    }
    
});

// update a bird
app.put("/users/:id", async (req, res) => {
    console.log(req.params.id);
    console.log(req.body);
    try{
        const results= await db.query("Update passenger set username= $1, email= $2, nid= $3 , gender= $4, phone= $5, password= $6 where user_id= $7 returning *", [req.body.username, req.body.email, req.body.nid, req.body.gender, req.body.phone, req.body.password, req.params.id]);
        res.status(200).json({
            status: "success",
            data: {
                passengers: results.rows[0]
            }
        });
    }catch(error){
        console.log(error);
    }
    // res.status(200).json({
    //     status: "success",
    //     data: {
    //         bird: "sheikh"
    //     }
    // });

});

// delete a bird
app.delete("/users/:id", async (req, res) => {
    try{
        const results= await db.query("Delete from passenger where user_id= $1", [req.params.id]);
        res.status(200).json({
            status: "success",
        });
    }catch(error){
        console.log(error);
    }
    
});



console.log("hello");
const port = process.env.PORT;  //   || 3001, if port is defined use it, else use the 3001 port
app.listen(port, () => {
    console.log(`server is uppp on port ${port}`);
});
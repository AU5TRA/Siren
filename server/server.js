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


app.listen(3000, ()=>{
    console.log("server is upp on port 3000");
})

// get all birds
app.get("/api/v1/birds", async (req, res) => {
    try {
        const results = await db.query("select * from bird");
        console.log(results);
        res.status(200).json({ // 404 is for NOT FOUND
            status: "success",
            results: results.rows.length,
            data: {
                birds: results.rows,
            },

        });
    } catch (error) {
        console.log(error);
    }


});
// http://localhost:4000/api/v1/birds


// GET a bird
app.get("/api/v1/birds/:birdid", async(req, res) => {
    console.log(req.params.birdid);
    try {
        const results = await db.query("select * from bird where id= $1", [req.params.birdid]);
        console.log(results.rows[0]);
        res.status(200).json({
            status: "success",
            data: {
                bird: results.rows[0],
            }
        });
    } catch (error) {
        console.log(error);
    }
    
});


// create a bird 
app.post("/api/v1/birds", async(req, res) => {
    console.log(req.body);
    try{
        const results= await db.query("INSERT INTO BIRD (name, color, size) values($1, $2, $3) returning *", [req.body.name, req.body.color, req.body.size]);
        res.status(201).json({
            status: "success",
            data: {
                bird: results.rows[0]
            }
        });
    }catch(error){
        console.log(error);
    }
    
});

// update a bird
app.put("/api/v1/birds/:birdid", async (req, res) => {
    console.log(req.params.birdid);
    console.log(req.body);
    try{
        const results= await db.query("Update bird set name= $1, color= $2, size= $3 where id= $4 returning *", [req.body.name, req.body.color, req.body.size, req.params.birdid]);
        res.status(200).json({
            status: "success",
            data: {
                bird: results.rows[0]
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
app.delete("/api/v1/birds/:birdid", async (req, res) => {
    try{
        const results= await db.query("Delete from bird where id= $1", [req.params.birdid]);
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
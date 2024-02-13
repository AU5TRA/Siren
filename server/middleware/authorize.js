const jwt = require("jsonwebtoken");
require("dotenv").config();


module.exports = function(req, res, next) {
  const token = req.header("jwt_token");

  if (!token) {
<<<<<<< HEAD
    console.log("aurthorization denied");
=======
>>>>>>> 881bc7959a99de164279c0afabbb9d961c19994f
    return res.status(403).json({ msg: "authorization denied" });
  }

  // Verify token
  try {
    //it is going to give use the user id (user:{id: user.id})
    const verify = jwt.verify(token, process.env.jwtSecret);
<<<<<<< HEAD
    console.log("aurthorization success");
=======

>>>>>>> 881bc7959a99de164279c0afabbb9d961c19994f
    req.user = verify.user;
    
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
  next();
};
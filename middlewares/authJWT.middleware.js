require('dotenv').config()
const jwt = require("jsonwebtoken");
const User = require('../models/user.model')

module.exports.authenticateToken = (req, res, next) => {
    //Get token from header : Bearer abcxyz
    const authHeader = req.headers["authorization"];

    const token = authHeader && authHeader.split(" ")[1];
    if (token == null)
      return res.status(403).send({
        message: "No token provided!",
      });
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err)
        return res.status(401).send({
          message: "Unauthorized!",
        });
      req.user = user;
      next();
    });
};
module.exports.isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.ROLE === "admin") {
      next();
      return;
    }
    res.status(403).send({
      msg: "Require Admin Role!",
    });
    return;
  } catch (error) {
    res.status(500).json({ error: err.message });
  }
};


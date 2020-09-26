require('dotenv').config()
const express = require('express')
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const User = require('../models/user.model')

const router = express.Router()
router.post('/signup', async (req, res) => {
        try {
          let { email, password, confirmPassword, username } = req.body;
          //console.log(req.body);
          //Validate
          if (!email || !password || !confirmPassword)
            return res
              .status(400)
              .json({ msg: "Not all fields have been entered !" });
          if (password.length < 5)
            return res
              .status(400)
              .json({ msg: "Password needs to be at least 5 charaters long !" });
          if (password !== confirmPassword)
            return res
              .status(400)
              .json({ msg: "Password is not matched with confirm Password !" });
          const existingUser = await User.findOne({ email: email });
          if (existingUser)
            return res
              .status(400)
              .json({ msg: "An account with this email already exists !" });
          if (!username) username = email;

          const salt = await bcrypt.genSalt();
          const hashedPassword = await bcrypt.hash(password, salt);
          const newUser = new User({
            email,
            password: hashedPassword,
            avatarUrl : "https://picsum.photos/200/300",
            username,
            ROLE : "user"
          });
          await newUser.save();
          
          res.status(200).json({
            msg: `Created User with email ${newUser.email}`
          });
        } catch (error) {
          res.status(500).json({ msg: "Register failed !" });
        }
})

router.post("/signin", async (req, res) => {
    try {
      const { email, password } = req.body;
      // validate
      if (!email || !password)
        return res.status(400).json({ msg: "Not all fields have been entered." });
  
      const user = await User.findOne({ email: email });
      if (!user)
        return res
          .status(400)
          .json({ msg: "No account with this email has been registered." });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return res.status(400).json({ msg: "Password is not correct !" });
      //Create and assign token
      const payload = {
        user : user
      }
      const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn : "30m"
      })
      res.status(200).json({
                   user : user,
                  accessToken: accessToken
      })
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  
  module.exports = router
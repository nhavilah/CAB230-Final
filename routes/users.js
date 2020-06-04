require('dotenv').config();
var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

//handles the /user/registration endpoint
//takes ina username and password in the header
router.post("/register", function (req, res, next) {
  //retrieve email and password from req.body
  const email = req.body.email
  const password = req.body.password

  //verify body
  if (!email || !password) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete - email and password needed"
    })
    return
  }
  //check for user if they exist in the database
  const queryUsers = req.db.from("users").select("*").where("email", "=", email)
  queryUsers
    .then((users) => {
      if (users.length > 0) {
        res.status(401).json({
          error: true,
          message: "User already exists!"
        });
        return;
      }

      //if they dont exist insert the user into the database
      const saltRounds = 10
      const hash = bcrypt.hashSync(password, saltRounds)
      return req.db.from("users").insert({ email, hash })

    })
    .then(() => {
      res.status(201).json({
        success: true,
        message: "Successfully created user"
      })
      return;
    })
    .catch((error) => {
      res.status(error.status || 500)
      res.send({ error: true, message: error.message })
    })
})

//this handles the /user/login endpoint
//takes in the username and password in the header
//checks if the user existsin the database
router.post("/login", function (req, res, next) {
  //retrieve email and password from req.body
  const email = req.body.email
  const password = req.body.password

  if (!email || !password) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete - email and password needed"
    });
    return;
  }

  const queryUsers = req.db.from("users").select("*").where("email", "=", email)
  queryUsers
    .then((users) => {
      if (users.length === 0) {
        res.status(401).json({
          error: true,
          message: "User does not exist"
        })
        return
      }

      //compare password hashes
      const user = users[0]
      return bcrypt.compare(password, user.hash)
    })
    .then((match) => {
      if (!match) {
        res.status(401).json({
          error: true,
          message: "Passwords do not match!"
        })
        return
      }
      //create and return JWT token
      const secretKey = process.env.SECRET_KEY;
      const expires_in = 60 * 60 * 24 //1 day
      const exp = Date.now() + expires_in * 1000
      const token = jwt.sign({ email, exp }, secretKey)
      return res.json({ token_type: "Bearer", token, expires_in })
    })
    .catch((error) => {
      res.status(error.status || 500)
      res.send({ error: true, message: error.message })
    })
})
module.exports = router;
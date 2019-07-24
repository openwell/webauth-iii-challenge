const express = require("express");
const db = require("./user-model");
const auth = require("./user-middleware.js");

const router = express.Router();

router.post("/register", auth.validateUser, (req, res) => {
  const { username, password } = req.body;

  const data = {
    username: username,
    password: auth.myBcrypt(password, 10)
  };
  db.createUser(data)
    .then(dbResponse => {
      return res.status(200).json({
        data: dbResponse
      });
    })
    .catch(err => {
      res.status(500).send(err);
    });
});

router.get("/users", auth.restriction, (req, res) => {
  db.getUsers()
    .then(dbResponse => {
      return res.status(200).json({
        data: dbResponse
      });
    })
    .catch(err => {
      res.status(500).send(err);
    });
});

router.post(
  "/login",
  auth.validateUser,
  auth.validateUserPassword,
  (req, res) => {
    res.status(200).json({message: 'Welcome'})
  }
);

router.get("/logout", (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        res.send("you can never leave");
      } else {
        res.send("bye, thanks!");
      }
    });
  } else {
    res.end();
  }
});

module.exports = router;

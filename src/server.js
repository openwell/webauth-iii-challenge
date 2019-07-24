const express = require("express");
const userRoute = require("./user/user-router");
const server = express();
const cors = require("cors");
const session = require("express-session");
const KnexSessionStore = require("connect-session-knex")(session);

server.use(express.json());
server.use(logger);

server.use(
  session({
    name: "sessionId", // name of the cookie
    secret: "keep it secret, keep it long", // we intend to encrypt
    cookie: {
      maxAge: 1000 * 60 * 60,
      secure: false,
      httpOnly: true
    },
    resave: false,
    saveUninitialized: true,
    // extra chunk of config
    store: new KnexSessionStore({
      knex: require("./data/dbConfig"), // configured instance of knex
      tablename: "sessions", // table that will store sessions inside the db, name it anything you want
      sidfieldname: "sid", // column that will hold the session id, name it anything you want
      createtable: true, // if the table does not exist, it will create it automatically
      clearInterval: 1000 * 60 * 60 // time it takes to check for old sessions and remove them from the database to keep it clean and performance
    })
  })
);

server.use(cors());
server.use("/api", userRoute);

server.get("/", (req, res) => {
  res.send(`<h2>Let's write some code!</h2>`);
});

server.all("*", (req, res) => {
  res.status(404).json("Sorry No Such Location");
});

function logger(req, res, next) {
  console.log(req.method, req.url, Date.now());
  next();
}

module.exports = server;

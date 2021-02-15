const db = require("../data/dbConfig");

module.exports = {
  getUsers,
  authUser,
  createUser,
  getByUsername
};

function getUsers() {
  return db("users");
}

function authUser(username) {
  return db("users").where("username", username);
}

function findById(id) {
  return db("users")
    .where({ id })
    .first();
}
function getByUsername(username) {
    return db("users")
      .where({ username })
      .first();
  }

function createUser(data) {
  return db("users")
    .insert(data)
    .then(ids => {
      return findById(ids[0]);
    });
}

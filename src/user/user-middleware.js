const md5 = require("md5");
const db = require("./user-model");
const jwt = require("jsonwebtoken");

function validateUser(req, res, next) {
  const { username, password, department } = req.body;
  if (!req.body) {
    return res.status(400).json({
      message: "missing user data"
    });
  } else if (!username || username.trim().length < 1) {
    return res.status(400).json({
      message: "missing required username field"
    });
  } else if (!password || password.trim().length < 1) {
    return res.status(400).json({
      message: "missing required password field"
    });
  } else if (!department || department.trim().length < 1) {
    return res.status(400).json({
      message: "missing required department field"
    });
  }
  next();
}
async function validateUserPassword(req, res, next) {
  const { username, password } = req.body;
  try {
    let userData = await db.getByUsername(username);
    let compareOutput = compareMyBcrypt(password, userData.password);
    if (!compareOutput) {
      return res.status(401).json({ error: "Incorrect Password" });
    }
    const Encrypted = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + 60 * 60,
        data: userData.id
      },
      process.env.jwtSECRET
    );
    req.session.user = Encrypted;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Incorrect Credentials" });
  }
}

function myBcrypt(
  password,
  cycle = 10,
  salt = new Date().getTime().toString()
) {
  let hashed = md5(salt + password);
  for (let i = 0; i < cycle; i++) {
    hashed = md5(hashed);
  }
  const encodedSalt = Buffer.from(salt).toString("base64");
  const encodedHash = Buffer.from(hashed).toString("base64");
  return `md5$${cycle}$${encodedSalt}$${encodedHash}`;
}

function compareMyBcrypt(rawPassword, naiveBcryptHash) {
  const [, rounds, encodedSalt] = naiveBcryptHash.split("$");
  const salt = Buffer.from(encodedSalt, "base64").toString("ascii");
  return myBcrypt(rawPassword, Number(rounds), salt) === naiveBcryptHash;
}

function restriction(req, res, next) {
  jwt.verify(req.session.user, process.env.jwtSECRET, function(err, decoded) {
    if (err) {
      return res.status(400).json({ message: "No credentials provided" });
    }
    next();
  });
}

module.exports = {
  validateUser,
  compareMyBcrypt,
  myBcrypt,
  validateUserPassword,
  restriction
};

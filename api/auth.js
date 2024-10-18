const express = require("express"); //Express is imported to create a router.
const router = express.Router();
const prisma = require("../prisma"); //Prisma is used for database operations.

// TODO: Import jwt and JWT_SECRET
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

// TODO: createToken
function createToken(id) {
  //takes the users id and the password and returns the message
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: "1d" });
}

router.use(async (req, res, next) => {
  // Grab token from headers only if it exists
  const authHeader = req.headers.authorization; //an HTTP request header that authenticates a user's identity and permissions to access a protected resource on a web server
  const token = authHeader?.slice(7); //slice returns a copy of the array starting at the given index(7) "Bearer <token>"
  if (!token) return next(); //if the credentials aren't given then we are going to require the customers credentials on line 27
  // TODO: Find customer with ID decrypted from the token and attach to the request
  try {
    const { id } = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUniqueOrThrow({
      where: { id },
    });
    req.user = user;
    next();
  } catch (e) {
    next(e);
  }
});
router.post("/register", async (req, res, next) => {
  const { username, password } = req.body; //request body including username in password
  try {
    const user = await prisma.user.register(username, password); //.register is getting the function  from index.js
    const token = createToken(user.id);
    res.status(201).json({ token }); //response thats being sent back
  } catch (e) {
    next(e);
  }
});

router.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.login(username, password); //.login is getting the function  from index.js
    const token = createToken(user.id);
    res.json({ token }); //response thats being sent back
  } catch (e) {
    next(e);
  }
});

/** Checks the request for an authenticated user. */
//middleware that ensures that when there is a route when someone is authenticated then this function will run
//checks that there exists an user that has a authenticate token
function authenticate(req, res, next) {
  if (req.user) {
    next();
  } else {
    next({ status: 401, message: "You must be logged in." });
  }
}

module.exports = {
  router,
  authenticate,
};

const bcrypt = require("bcrypt");

const { PrismaClient } = require("@prisma/client");

//This file constructs the code for the router files
const prisma = new PrismaClient().$extends({
  model: {
    user: {
      // TODO: Add register and login methods
      /**
       * Creates a new customer with the provided credentials.
       * The password is hashed with bcrypt before the customer is saved.
       */
      async register(username, password) {
        // automatically gets stored in the server data
        const hashedPassword = await bcrypt.hash(password, 10); //hash automatically encrypts //bcrypt creates 10 characters/strings to encrypt password
        const user = await prisma.user.create({
          //trying to create a user with the inputed credentials
          data: { username, password: hashedPassword }, //password and emailis being saved as a token
        });
        return user;
      },

      /**
       * Finds the customer with the provided email,
       * as long as the provided password matches what's saved in the database.
       */
      async login(username, password) {
        const user = await prisma.user.findUniqueOrThrow({
          //find a user with the the email given on line 25 (doing this to find if the user has entered a email)
          where: { username },
        });
        const valid = await bcrypt.compare(password, user.password); //Authenticates a inputed password with the hashed pwd that is set up in Register. user.password is a hashed password that comes from line 17
        //storing the hash password--this will turn the inputed password into a hash one (compares the given password to the hashed generated password to validate)

        //if its not valid then error msg will arive
        if (!valid) throw Error("Invalid password");
        return user;
      },
    },
  },
});

module.exports = prisma;

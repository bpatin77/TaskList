const express = require("express");
const router = express.Router();
module.exports = router;
const prisma = require("../prisma");

//this playlist file will need a token since its marked with a lock in the readme
const { authenticate } = require("./auth"); //Authenticate is a middleware function to check if a user is authenticated.
//authenticate is coming from the function at the end of auth.js that checks that there exists an user that has a authenticate token

//sends array of all tasks owned by the logged-in user
router.get("/", authenticate, async (req, res, next) => {
  try {
    //find all the tasks for the auhenticated user,
    const tasks = await prisma.task.findMany({
      //where the owner id is the same as the logged in users id
      where: { ownerId: req.user.id },
    }); //Fetches all tasks owned by the authenticated user (req.user.id).
    res.json(tasks); //If successful, it sends the tasks as a JSON response.
  } catch (e) {
    //If there's an error, it passes the error to the next middleware.
    next(e);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  //only need a name for the request body because done is comming back as true and the owner is connected to the token
  const { name, done } = req.body; //Expects a request body containing name
  try {
    const task = await prisma.task.create({
      data: {
        name,
        done,
        ownerId: req.user.id,
      },
    });
    res.status(201).json(task); //Responds with the created task and a 201 Created status
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", authenticate, async (req, res, next) => {
  const { id } = req.params;
  try {
    const task = await prisma.task.findUniqueOrThrow({
      //where: { id: +id }: This specifies the condition for the query.
      //The id parameter from the request URL is converted to a number using the unary + operator.
      where: { id: +id },
      //include: { tasks: true }: This tells Prisma to also fetch related tasks associated with the playlist
    });
    if (task.ownerId !== req.user.id) {
      //If the task is found, it checks if the authenticated user is the owner. If not, it responds with a 403 Forbidden status.
      return next({ status: 403, message: "You do not own this task." });
    }
    await prisma.task.delete({ where: { id: +id } });
    res.sendStatus(204);
  } catch (e) {
    next(e);
  }
});

router.put("/:id", authenticate, async (req, res, next) => {
  const { id } = req.params;
  const { name, done } = req.body;
  try {
    const task = await prisma.task.findUniqueOrThrow({ where: { id: +id } });
    if (task.ownerId !== req.user.id) {
      return next({ status: 403, message: "You do not own this task." });
    }
    const updatedTask = await prisma.task.update({
      where: { id: +id },
      data: { name, done },
    });
    res.json(updatedTask);
  } catch (e) {
    next(e);
  }
});

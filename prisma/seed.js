const prisma = require("./index");
const { faker } = require("@faker-js/faker");

const seed = async (numTasks = 3) => {
  // Create 3 tracks for 1 user
  const tasks = Array.from({ length: numTasks }, () => ({
    name: faker.internet.displayName(),
  }));
  await prisma.user.create({
    //creating 1 user with a username, password, & 3 tasks
    data: {
      username: "fakeuser",
      password: "password",
      tasks: { connect: tasks }, //tasks on the right of the : comes from line 6
    },
  });
};

seed()
  .then(async () => await prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

const express = require("express");
require("./db/mongoose");
const User = require("./models/user");
const Task = require("./models/task");

const app = express();
const port = process.env.PORT || 5000;
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");

app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => console.log(`Server on port ${port}`));

// const main = async (id) => {
// 	const user = await User.findById(id);
// 	await user.populate('tasks').execPopulate();
// };
// main();

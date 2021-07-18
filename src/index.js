const express = require('express');
require('./db/mongoose');

const app = express();
const port = process.env.PORT || 5000;

const userRouter = require('./routers/user');
const taskRouter = require('./routers/task');

app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => console.log(`Server on port ${port}`));

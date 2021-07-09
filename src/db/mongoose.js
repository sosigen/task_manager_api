const mongoose = require("mongoose");

const connectionURL =
	"mongodb+srv://admin:admin@cluster0.ph4t8.mongodb.net/task_manager_api?retryWrites=true&w=majority";
mongoose.connect(
	connectionURL,
	{
		autoIndex: true,
		useUnifiedTopology: true,
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
	},
	(err, res) => (err ? console.log(err) : console.log("connected!!"))
);

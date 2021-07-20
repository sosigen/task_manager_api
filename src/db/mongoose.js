const mongoose = require('mongoose');

const connectionURL = process.env.MONGODB_URL;
mongoose.connect(
	connectionURL,
	{
		autoIndex: true,
		useUnifiedTopology: true,
		useNewUrlParser: true,
		useCreateIndex: true,
		useFindAndModify: false,
	},
	(err, res) => (err ? console.log(err) : console.log('connected!!'))
);

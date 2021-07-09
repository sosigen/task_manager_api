const mongoose = require("mongoose");

const Task = mongoose.model("Task", {
	description: {
		type: String,
		required: true,
	},
	done: {
		type: Boolean,
		default: false,
	},
});
module.exports = Task;

const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true,
	},
	email: {
		type: String,
		unique: true,
		required: true,
		trim: true,
		lowercase: true,
		validate(value) {
			if (!validator.isEmail(value))
				throw new Error("email address is invalid");
		},
	},
	age: {
		type: Number,
		default: 0,
		validate(value) {
			if (value < 0) throw new Error("age must be positive number");
		},
	},
	password: {
		type: String,
		trim: true,
		required: true,
		minlength: 6,
		validate(value) {
			if (value.toLowerCase().includes("password"))
				throw new Error("password can't include 'password' phrase");
		},
	},
	tokens: [
		{
			token: {
				type: String,
				required: true,
			},
		},
	],
});

userSchema.methods.generateAuthToken = async function () {
	const user = this;
	const token = await jwt.sign(
		{ _id: user._id.toString() },
		"taskManagerApplication"
	);
	user.tokens = user.tokens.concat({ token });
	await user.save();
	return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
	const user = await User.findOne({ email });
	if (!user) throw new Error("unable to login");

	const isPasswordMatching = await bcrypt.compare(password, user.password);
	if (!isPasswordMatching) throw new Error("unable to login");

	return user;
};

//hashig password
userSchema.pre("save", async function (next) {
	const user = this;
	if (user.isModified("password")) {
		user.password = await bcrypt.hash(user.password, 8);
	}
	next();
});

const User = mongoose.model("User", userSchema);
module.exports = User;

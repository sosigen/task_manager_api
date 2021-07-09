const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");
router.use(express.json());

router.post("/users", async (req, res) => {
	const user = new User(req.body);
	try {
		await user.save();
		const token = await user.generateAuthToken();
		res.status(201).send({
			user,
			token,
		});
	} catch (e) {
		console.log(e);
		res.status(400).send(e);
	}
});

router.post("/users/login", async (req, res) => {
	try {
		const user = await User.findByCredentials(
			req.body.email,
			req.body.password
		);
		const token = await user.generateAuthToken();
		res.send({
			user,
			token,
		});
	} catch (e) {
		res.status(400).send();
	}
});

router.post("/users/logout", auth, async (req, res) => {
	try {
		req.user.tokens = req.user.tokens.filter(
			(token) => token.token !== req.token
		);
		await req.user.save();
		res.send();
	} catch (e) {
		res.status(500).send();
	}
});

router.post("/users/logoutAll", auth, async (req, res) => {
	try {
		req.user.tokens = [];
		await req.user.save();
		res.send();
	} catch (e) {
		res.status(500).send();
	}
});

router.get("/users/me", auth, async (req, res) => {
	res.send(req.user);
});

router.get("/users/:userId", async (req, res) => {
	const userId = req.params.userId;
	try {
		const user = await User.findById(userId);
		user ? res.send(user) : res.status(404).send();
	} catch (e) {
		res.status(500).send(e);
	}
});

router.patch("/users/:userId", async (req, res) => {
	const updates = Object.keys(req.body);
	const allowedUpdates = ["name", "email", "age", "password"];
	const isUpadteValid = updates.every((update) =>
		allowedUpdates.includes(update)
	);

	if (!isUpadteValid)
		return res.status(400).send({ error: "invalid update field" });

	const userId = req.params.userId;
	try {
		const user = await User.findById(userId);
		updates.forEach((update) => {
			user[update] = req.body[update];
		});
		await user.save();
		user ? res.send(user) : res.status(404).send();
	} catch (e) {
		console.log(e);
		res.status(500).send(e);
	}
});

router.delete("/users/:userId", async (req, res) => {
	const userId = req.params.userId;
	try {
		const user = await User.findByIdAndDelete(userId);
		user ? res.send(user) : res.status(404).send();
	} catch (e) {
		res.status(500).send(e);
	}
});

module.exports = router;

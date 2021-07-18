const express = require("express");
const router = new express.Router();
const Task = require("../models/task");
const auth = require("../middleware/auth");
router.use(express.json());

router.post("/tasks", auth, async (req, res) => {
	const task = new Task({
		...req.body,
		owner: req.user._id,
	});
	try {
		await task.save();
		res.status(201).send(task);
	} catch (e) {
		res.status(500).send(e);
	}
});

router.get("/tasks", auth, async (req, res) => {
	const match = {};
	if (req.query.done) {
		match.done = req.query.done === "true";
	}
	try {
		await req.user
			.populate({
				path: "tasks",
				match,
			})
			.execPopulate();
		console.log(req.user.tasks);
		res.send(req.user.tasks);
	} catch (e) {
		console.log(e);
		res.status(500).send();
	}
});

router.get("/tasks/:taskId", auth, async (req, res) => {
	const _id = req.params.taskId;
	try {
		// const task = await Task.findById(taskId);
		const task = await Task.findOne({ _id, owner: req.user.id });
		task ? res.send(task) : res.status(404).send();
	} catch (e) {
		res.status(500).send(err);
	}
});

router.patch("/tasks/:taskId", auth, async (req, res) => {
	const updates = Object.keys(req.body);
	const allowedUpdates = ["done", "description"];
	const isUpadteValid = updates.every((update) =>
		allowedUpdates.includes(update)
	);

	if (!isUpadteValid)
		return res.status(400).send({ error: "invalid update field" });

	try {
		const task = await Task.findOne({
			_id: req.params.taskId,
			owner: req.user._id,
		});
		if (!task) return res.status(404).send();
		updates.forEach((update) => {
			task[update] = req.body[update];
		});
		await task.save();
		res.send(task);
	} catch (e) {
		res.status(500).send(e);
	}
});

router.delete("/tasks/:taskId", auth, async (req, res) => {
	const _id = req.params.taskId;
	try {
		const task = await Task.findOneAndDelete({ _id, owner: req.user._id });
		task ? res.send(task) : res.status(404).send();
	} catch (e) {
		res.status(500).send(e);
	}
});

module.exports = router;

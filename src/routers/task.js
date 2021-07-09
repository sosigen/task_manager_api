const express = require("express");
const router = new express.Router();
const Task = require("../models/task");
router.use(express.json());

router.post("/tasks", async (req, res) => {
	const task = new Task(req.body);
	try {
		await task.save();
		res.status(201).send(task);
	} catch (e) {
		res.status(500).send(e);
	}
});

router.get("/tasks", async (req, res) => {
	try {
		const tasks = await Task.find({});
		res.send(tasks);
	} catch (e) {
		res.status(500).send(e);
	}
});

router.get("/tasks/:taskId", async (req, res) => {
	const taskId = req.params.taskId;
	try {
		const task = await Task.findById(taskId);
		task ? res.send(task) : res.status(404).send();
	} catch (e) {
		res.status(500).send(err);
	}
});

router.patch("/tasks/:taskId", async (req, res) => {
	const taskId = req.params.taskId;
	const updates = Object.keys(req.body);
	const allowedUpdates = ["done", "description"];
	const isUpadteValid = updates.every((update) =>
		allowedUpdates.includes(update)
	);

	if (!isUpadteValid)
		return res.status(400).send({ error: "invalid update field" });

	try {
		const task = await Task.findById(taskId);
		updates.forEach((update) => {
			task[update] = req.body[update];
		});
		await task.save();
		task ? res.send(task) : res.status(404).send();
	} catch (e) {
		res.status(500).send(e);
	}
});

router.delete("/tasks/:taskId", async (req, res) => {
	const taskId = req.params.taskId;
	try {
		const task = await Task.findByIdAndDelete(taskId);
		task ? res.send(task) : res.status(404).send();
	} catch (e) {
		res.status(500).send(e);
	}
});

module.exports = router;

const express = require('express');

const router = new express.Router();
const Task = require('../models/task');
const auth = require('../middleware/auth');

router.use(express.json());

router.post('/tasks', auth, async (req, res) => {
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

//	GET /tasks?done=true
//	GET /tasks?limit=10&skip=20
//	GET /tasks?sortBy=createdAt:asc

router.get('/tasks', auth, async (req, res) => {
	const match = {};
	const sort = {};
	if (req.query.done) {
		match.done = req.query.done === 'true';
	}
	if (req.query.sortBy) {
		const [sortField, sortType] = req.query.sortBy.split(':');
		sort[sortField] = sortType === 'asc' ? 1 : -1;
	}
	try {
		await req.user
			.populate({
				path: 'tasks',
				match,
				options: {
					limit: +req.query.limit,
					skip: +req.query.skip,
					sort,
				},
			})
			.execPopulate();
		console.log(req.user.tasks);
		res.send(req.user.tasks);
	} catch (e) {
		console.log(e);
		res.status(500).send();
	}
});

router.get('/tasks/:taskId', auth, async (req, res) => {
	const id = req.params.taskId;
	try {
		// const task = await Task.findById(taskId);
		const task = await Task.findOne({ _id: id, owner: req.user.id });
		return task ? res.send(task) : res.status(404).send();
	} catch (e) {
		return res.status(500).send();
	}
});

router.patch('/tasks/:taskId', auth, async (req, res) => {
	const updates = Object.keys(req.body);
	const allowedUpdates = ['done', 'description'];
	const isUpadteValid = updates.every((update) =>
		allowedUpdates.includes(update)
	);

	if (!isUpadteValid) {
		return res.status(400).send({ error: 'invalid update field' });
	}

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
		return res.send(task);
	} catch (e) {
		return res.status(500).send(e);
	}
});

router.delete('/tasks/:taskId', auth, async (req, res) => {
	const _id = req.params.taskId;
	try {
		const task = await Task.findOneAndDelete({ _id, owner: req.user._id });
		return task ? res.send(task) : res.status(404).send();
	} catch (e) {
		return res.status(500).send(e);
	}
});

module.exports = router;

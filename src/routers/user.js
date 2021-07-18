const express = require('express');
const multer = require('multer');

const upload = multer({
	dest: 'avatars',
	limits: {
		fileSize: 1000000,
	},
	// fileFilter(req, file, cb) {
	// 	if (!file.originalname.match(/\.(doc|docx)$/)) {
	// 	}
	// },
});

const router = new express.Router();
router.use(express.json());

const User = require('../models/user');
const auth = require('../middleware/auth');

router.post('/users', async (req, res) => {
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

router.post('/users/login', async (req, res) => {
	try {
		const user = await User.findByCredentials(
			req.body.email,
			req.body.password
		);
		const token = await user.generateAuthToken();
		return res.send({
			user,
			token,
		});
	} catch (e) {
		return res.status(400).send();
	}
});

router.post('/users/logout', auth, async (req, res) => {
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

router.post('/users/logoutAll', auth, async (req, res) => {
	try {
		req.user.tokens = [];
		await req.user.save();
		res.send();
	} catch (e) {
		res.status(500).send();
	}
});

router.get('/users/me', auth, async (req, res) => {
	res.send(req.user);
});

router.patch('/users/me', auth, async (req, res) => {
	const updates = Object.keys(req.body);
	const allowedUpdates = ['name', 'email', 'age', 'password'];
	const isUpadteValid = updates.every((update) =>
		allowedUpdates.includes(update)
	);

	if (!isUpadteValid) {
		return res.status(400).send({ error: 'invalid update field' });
	}

	try {
		updates.forEach((update) => {
			req.user[update] = req.body[update];
		});
		await req.user.save();
		return res.send(req.user);
	} catch (e) {
		console.log(e);
		return res.status(500).send();
	}
});

router.delete('/users/me', auth, async (req, res) => {
	try {
		await req.user.remove();
		res.send(req.user);
	} catch (e) {
		res.status(500).send(e);
	}
});

router.post('/users/me/avatar', upload.single('avatar'), (req, res) => {
	res.send();
});

module.exports = router;

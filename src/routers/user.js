const express = require('express');
const multer = require('multer');

const upload = multer({
	limits: {
		fileSize: 1000000,
	},
	fileFilter(req, file, cb) {
		if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
			return cb(new Error('only jpg, jpeg, and png formats are valid'));
		}
		return cb(undefined, true);
	},
});

const router = new express.Router();
router.use(express.json());

const sharp = require('sharp');
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
		const user = await User.checkCredentials(req.body.email, req.body.password);
		const token = await user.generateAuthToken();
		return res.send({
			user,
			token,
		});
	} catch (e) {
		console.log(e);
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

router.post(
	'/users/me/avatar',
	auth,
	upload.single('avatar'),
	async (req, res) => {
		const buffer = await sharp(req.file.buffer)
			.resize({
				width: 250,
				height: 250,
			})
			.png()
			.toBuffer();

		req.user.avatar = buffer;
		await req.user.save();
		res.send();
	},
	(error, req, res) => {
		res.status(400).send({ error: error.message });
	}
);

router.delete('/users/me/avatar', auth, async (req, res) => {
	try {
		req.user.avatar = undefined;
		await req.user.save();
		return res.send();
	} catch (e) {
		return res.status(400).send();
	}
});

router.get('/users/:userId/avatar', async (req, res) => {
	try {
		const user = await User.findById(req.params.userId);
		if (!user || !user.avatar) {
			throw new Error();
		}
		res.set('Content-Type', 'image/jpg');
		return res.send(user.avatar);
	} catch (e) {
		return res.status(404).send();
	}
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware');
const { users: controller } = require('../controllers');

router.get('/ping', (req, res) => {
    res.status(200).json({
        msg: 'pong',
        date: new Date()
    });
});

router.get(
    '/users',
    auth,
    controller.getUsers
);

router.get(
    '/user',
    auth,
    controller.getUser
);

router.get(
    '/users/:id',
    auth,
    controller.getUserById
);

router.get(
    '/user/:username',
    auth,
    controller.getUserIdByUsername
);

router.put(
    '/users/:id',
    auth,
    controller.updateUserById
);

router.put(
    '/user/:id',
    auth,
    controller.updateUserIsSharedById
);

router.delete(
    '/users/:id',
    auth,
    controller.deleteUserById
);

router.delete(
    '/users/',
    auth,
    controller.deleteUsersByIds
);
module.exports = router;

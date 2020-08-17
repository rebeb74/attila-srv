const express = require('express');
const router = express.Router();
const { auth } = require('../middleware');
const { tasks: controller } = require('../controllers');

router.post(
    '/tasks',
    auth,
    controller.createTask
);

router.get(
    '/tasks',
    auth,
    controller.getTasks
);

router.get(
    '/tasks/:id',
    auth,
    controller.getTaskById
);

router.put(
    '/tasks/:id',
    auth,
    controller.updateTaskById
);

router.delete(
    '/tasks/:id',
    auth,
    controller.deleteTaskById
);

router.delete(
    '/tasks/',
    auth,
    controller.deleteTasksByIds
);
module.exports = router;

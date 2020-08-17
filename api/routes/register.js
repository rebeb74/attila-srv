const express = require('express');
const router = express.Router();
const { register: controller } = require('../controllers');

router.post(
    '/register',
    controller.register
);
module.exports = router;
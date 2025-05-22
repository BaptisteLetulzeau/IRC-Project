const express = require('express');
const router = express.Router();
const privateMessageController = require('./privateMessage.controller');
const authMiddleware = require('./authMiddleware');

router.post('/send', authMiddleware, privateMessageController.sendMessage);
router.get('/:userId', authMiddleware, privateMessageController.getMessages);
router.put('/markAsRead/:messageId', authMiddleware, privateMessageController.markAsRead);

module.exports = router;
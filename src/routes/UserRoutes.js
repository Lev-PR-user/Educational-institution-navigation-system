const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', UserController.register);
router.post('/login', UserController.login);

router.use(authMiddleware.Protect);
router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);
router.delete('/profile', UserController.deleteProfile);

module.exports = router;
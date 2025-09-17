const express = require('express');
const router = express.Router();
const TeachersController = require('../controllers/TeachersController');
const authMiddleware = require('../middleware/authMiddleware');
const checkAdmin = require('../middleware/checkAdmin');

router.use(authMiddleware.Protect);
router.get('/', TeachersController.getAllTeachers);

router.use(authMiddleware.Protect);
router.use(checkAdmin);
router.post('/', TeachersController.createTeacher);
router.put('/:id', TeachersController.updateTeacher);
router.delete('/:id', TeachersController.deleteTeacher);

module.exports = router;
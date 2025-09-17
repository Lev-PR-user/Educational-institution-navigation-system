const express = require('express');
const router = express.Router();
const AnswersController = require('../controllers/AnswersController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware.Protect);
router.get('/question/:questionId', AnswersController.getAnswersByQuestion);
router.post('/', AnswersController.createAnswer);
router.put('/:id', AnswersController.updateAnswer);
router.patch('/:id/solution', AnswersController.markAsSolution);
router.delete('/:id', AnswersController.deleteAnswer);

module.exports = router;
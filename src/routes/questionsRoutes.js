const express = require('express');
const router = express.Router();
const QuestionsController = require('../controllers/QuestionsController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware.Protect);
router.get('/', QuestionsController.getAllQuestions);
router.get('/:id',  QuestionsController.getQuestionById);
router.post('/', QuestionsController.createQuestion);
router.put('/:id',  QuestionsController.updateQuestion);
router.patch('/:id/status',  QuestionsController.toggleQuestionStatus);
router.delete('/:id', QuestionsController.deleteQuestion);

module.exports = router;
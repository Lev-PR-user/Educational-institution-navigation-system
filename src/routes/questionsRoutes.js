const express = require('express');

function createQuestionsRoutes(questionsController, authMiddleware) {
  const router = express.Router();

  router.use(authMiddleware.Protect);
  
  router.get('/', (req, res) => questionsController.getAllQuestions(req, res));
  router.get('/:id', (req, res) => questionsController.getQuestionById(req, res));
  router.post('/', (req, res) => questionsController.createQuestion(req, res));
  router.put('/update/:id', (req, res) => questionsController.updateQuestion(req, res));
  router.patch('/:id/status', (req, res) => questionsController.toggleQuestionStatus(req, res));
  router.delete('/delete/:id', (req, res) => questionsController.deleteQuestion(req, res));

  return router;
}

module.exports = createQuestionsRoutes;
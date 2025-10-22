const express = require('express');

function createAnswersRoutes(answersController, authMiddleware) {
  const router = express.Router();

  router.use(authMiddleware.Protect);
  
  router.get('/question/:questionId', (req, res) => answersController.getAnswersByQuestion(req, res));
  router.post('/', (req, res) => answersController.createAnswer(req, res));
  router.put('/update/:id', (req, res) => answersController.updateAnswer(req, res));
  router.patch('/:id/solution', (req, res) => answersController.markAsSolution(req, res));
  router.delete('/delete/:id', (req, res) => answersController.deleteAnswer(req, res));

  return router;
}

module.exports = createAnswersRoutes;
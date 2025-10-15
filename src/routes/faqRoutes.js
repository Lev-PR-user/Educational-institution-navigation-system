const express = require('express');

function createFaqRoutes(faqController, authMiddleware, checkAdmin) {
  const router = express.Router();

  // Защищенные маршруты (для всех авторизованных пользователей)
  router.use(authMiddleware.Protect);
  
  router.get('/', (req, res) => faqController.getFaq(req, res));
  router.get('/category/:category', (req, res) => faqController.getFaqByCategory(req, res));
  router.get('/:id', (req, res) => faqController.getFaqById(req, res));

  // Защищенные маршруты только для администраторов
  router.use(checkAdmin);
  router.post('/', (req, res) => faqController.createFaq(req, res));
  router.put('/update/:id', (req, res) => faqController.updateFaq(req, res));
  router.delete('/delete/:id', (req, res) => faqController.deleteFaq(req, res));

  return router;
}

module.exports = createFaqRoutes;
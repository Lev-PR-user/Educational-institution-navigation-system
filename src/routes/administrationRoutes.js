const express = require('express');

function createAdministrationRoutes(administrationController, authMiddleware, checkAdmin) {
  const router = express.Router();

  // Защищенные маршруты (для всех авторизованных пользователей)
  router.use(authMiddleware.Protect);
  
  router.get('/', (req, res) => administrationController.getAllAdministration(req, res));
  router.get('/:id', (req, res) => administrationController.getAdministrationById(req, res));

  // Защищенные маршруты только для администраторов
  router.use(checkAdmin);
  router.post('/', (req, res) => administrationController.createAdministration(req, res));
  router.put('/update/:id', (req, res) => administrationController.updateAdministration(req, res));
  router.delete('/delete/:id', (req, res) => administrationController.deleteAdministration(req, res));

  return router;
}

module.exports = createAdministrationRoutes;
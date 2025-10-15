const express = require('express');

function createUserRoutes(userController, authMiddleware) {
  const router = express.Router();

  // Публичные маршруты
  router.post('/register', (req, res) => userController.register(req, res));
  router.post('/login', (req, res) => userController.login(req, res));

  // Защищенные маршруты
  router.use(authMiddleware.Protect);
  router.get('/profile', (req, res) => userController.getProfile(req, res));
  router.put('/update/profile', (req, res) => userController.updateProfile(req, res));
  router.delete('/delete/profile', (req, res) => userController.deleteProfile(req, res));

  return router;
}

module.exports = createUserRoutes;
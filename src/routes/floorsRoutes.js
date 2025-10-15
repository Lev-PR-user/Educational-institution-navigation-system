const express = require('express');

function createFloorsRoutes(floorsController, authMiddleware, checkAdmin) {
  const router = express.Router();

  // Защищенные маршруты (для всех авторизованных пользователей)
  router.use(authMiddleware.Protect);
  
  router.get('/', (req, res) => floorsController.getAllFloors(req, res));

  // Защищенные маршруты только для администраторов
  router.use(checkAdmin);
  router.post('/', (req, res) => floorsController.createFloor(req, res));
  router.put('/update/:floor_number', (req, res) => floorsController.updateFloor(req, res));
  router.delete('/delete/:floor_number', (req, res) => floorsController.deleteFloor(req, res));

  return router;
}

module.exports = createFloorsRoutes;
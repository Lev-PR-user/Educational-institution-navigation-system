const express = require('express');

function createTeacherRoutes(teachersController, authMiddleware, checkAdmin) {
  const router = express.Router(); // ← ДОБАВЬТЕ ЭТУ СТРОКУ

  // Защищенные маршруты (для всех авторизованных пользователей)
  router.use(authMiddleware.Protect);
  
  router.get('/', (req, res) => teachersController.getTeachers(req, res));
  router.get('/:id', (req, res) => teachersController.getTeacherById(req, res));

  // Защищенные маршруты только для администраторов
  router.use(checkAdmin);
  router.post('/', (req, res) => teachersController.createTeacher(req, res));
  router.put('/update/:id', (req, res) => teachersController.updateTeacher(req, res));
  router.delete('/delete/:id', (req, res) => teachersController.deleteTeacher(req, res));

  return router;
}

module.exports = createTeacherRoutes;
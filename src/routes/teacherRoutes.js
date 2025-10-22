const express = require('express');

function createTeacherRoutes(teachersController, authMiddleware, checkAdmin) {
  const router = express.Router();

  router.use(authMiddleware.Protect);
  
  router.get('/', (req, res) => teachersController.getTeachers(req, res));
  router.get('/:id', (req, res) => teachersController.getTeacherById(req, res));

  router.use(checkAdmin);
  router.post('/', (req, res) => teachersController.createTeacher(req, res));
  router.put('/update/:id', (req, res) => teachersController.updateTeacher(req, res));
  router.delete('/delete/:id', (req, res) => teachersController.deleteTeacher(req, res));

  return router;
}

module.exports = createTeacherRoutes;
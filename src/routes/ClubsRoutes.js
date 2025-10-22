const express = require('express');

function createClubsRoutes(clubsController, authMiddleware, checkAdmin) {
  const router = express.Router();

  router.use(authMiddleware.Protect);
  
  router.get('/', (req, res) => clubsController.getClubs(req, res));
  router.get('/:id', (req, res) => clubsController.getClubById(req, res));

  router.use(checkAdmin);
  router.post('/', (req, res) => clubsController.createClub(req, res));
  router.put('/update/:id', (req, res) => clubsController.updateClub(req, res));
  router.delete('/delete/:id', (req, res) => clubsController.deleteClub(req, res));

  return router;
}

module.exports = createClubsRoutes;
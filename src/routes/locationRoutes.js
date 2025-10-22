const express = require('express');

function createLocationRoutes(locationsController, authMiddleware, checkAdmin) {
  const router = express.Router();

  router.use(authMiddleware.Protect);
  
  router.get('/', (req, res) => locationsController.getAllLocations(req, res));
  router.get('/:id', (req, res) => locationsController.getLocationById(req, res));
  router.get('/floor/:floorNumber', (req, res) => locationsController.getLocationsByFloor(req, res));

  router.use(checkAdmin);
  router.post('/', (req, res) => locationsController.createLocation(req, res));
  router.put('/update/:id', (req, res) => locationsController.updateLocation(req, res));
  router.delete('/delete/:id', (req, res) => locationsController.deleteLocation(req, res));

  return router;
}

module.exports = createLocationRoutes;
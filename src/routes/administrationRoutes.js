const express = require('express');
const router = express.Router();
const AdministrationController = require('../controllers/AdministrationController');
const authMiddleware = require('../middleware/authMiddleware');
const checkAdmin = require('../middleware/checkAdmin');

router.use(authMiddleware.Protect);
router.get('/', AdministrationController.getAllAdministration);

router.use(authMiddleware.Protect);
router.use(checkAdmin);
router.post('/', AdministrationController.createAdministration);
router.put('/:id', AdministrationController.updateAdministration);
router.delete('/:id', AdministrationController.deleteAdministration);

module.exports = router;
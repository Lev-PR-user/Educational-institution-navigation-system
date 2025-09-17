const express = require('express');
const router = express.Router();
const FaqController = require('../controllers/FaqController');
const authMiddleware = require('../middleware/authMiddleware');
const checkAdmin = require('../middleware/checkAdmin');

router.use(authMiddleware.Protect);
router.get('/',  FaqController.getfaq);

router.use(authMiddleware.Protect);
router.use(checkAdmin);
router.post('/', FaqController.createFaq);
router.put('/:id',  FaqController.updateFaq);
router.delete('/:id', FaqController.deleteFaq);

module.exports = router;
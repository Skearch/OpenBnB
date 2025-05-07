const express = require('express');
const router = express.Router();
const authenticationMiddleware = require('../middleware/authenticationMiddleware');
const { listAll, create, listShowcase, update } = require('../controllers/propertyController');

router.get('/listshowcase', listShowcase);
router.get('/listall', listAll);
router.post('/create', authenticationMiddleware('owner'), create);
router.put('/update/:id', authenticationMiddleware('owner'), update);

module.exports = router;
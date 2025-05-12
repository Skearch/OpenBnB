const express = require('express');
const router = express.Router();
const authenticationMiddleware = require('../middleware/authenticationMiddleware');
const { listAll, create, listShowcase, update, remove, getProperty } = require('../controllers/propertyController');

router.get('/listshowcase', listShowcase);
router.get('/listall', listAll);
router.get('/get/:id', authenticationMiddleware('owner'), getProperty);
router.post('/create', authenticationMiddleware('owner'), create);
router.put('/update/:id', authenticationMiddleware('owner'), update);
router.delete('/delete/:id', authenticationMiddleware('owner'), remove);

module.exports = router;
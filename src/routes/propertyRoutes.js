const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer();
const authenticationMiddleware = require('../middleware/authenticationMiddleware');
const { listAll, listShowcase, createProperty, editProperty, deleteProperty } = require('../controllers/propertyController');

router.get('/listall', authenticationMiddleware('owner'), listAll);
router.get('/listshowcase', authenticationMiddleware('owner'), listShowcase);
router.post('/create', authenticationMiddleware('owner'), createProperty);
router.put('/edit/:id', authenticationMiddleware('owner'), upload.fields([
    { name: 'featuredImage', maxCount: 1 },
    { name: 'images', maxCount: 4 },
]), editProperty);
router.delete('/delete/:id', authenticationMiddleware('owner'), deleteProperty);

module.exports = router;
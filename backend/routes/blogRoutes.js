const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const blogController = require('../controllers/blogController');

router.post('/parse', upload.single('document'), blogController.uploadAndParse);

module.exports = router;

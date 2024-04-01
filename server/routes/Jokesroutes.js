const express = require('express');
const router = express.Router();
const JokesControl = require('../controllers/Jokesconllers');

router.get('/', JokesControl.getallcontent);

module.exports = router;

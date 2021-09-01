const express = require('express')
const router = express.Router()
const taxRateController = require('../controllers/taxRateController')
const auth = require('../helper/auth.controller')
const logsApi = require('../helper/logsApi.controller')

router.get('/', logsApi.startlogsApi, auth.authenticateJWT, taxRateController.getAlltaxRates, logsApi.endlogsApi)

module.exports = router

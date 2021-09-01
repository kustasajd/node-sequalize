const express = require('express')
const router = express.Router()
const currenciesController = require('../controllers/currenciesController')
const auth = require('../helper/auth.controller')
const logsApi = require('../helper/logsApi.controller')

router.get('/', logsApi.startlogsApi, auth.authenticateJWT, currenciesController.getAllCurrencies, logsApi.endlogsApi)

module.exports = router

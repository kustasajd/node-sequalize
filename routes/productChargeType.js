const express = require('express')
const router = express.Router()
const productChargeTypeController = require('../controllers/productChargeTypeController')
const auth = require('../helper/auth.controller')
const logsApi = require('../helper/logsApi.controller')

router.get('/', logsApi.startlogsApi, auth.authenticateJWT, productChargeTypeController.getAllProductChargeTypes, logsApi.endlogsApi)

module.exports = router

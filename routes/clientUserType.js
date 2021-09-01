const express = require('express')
const router = express.Router()
const clientUserTypeController = require('../controllers/clientUserTypeController')
const auth = require('../helper/auth.controller')
const logsApi = require('../helper/logsApi.controller')

router.get('/', logsApi.startlogsApi, auth.authenticateJWT, clientUserTypeController.getAllclientUserTypes, logsApi.endlogsApi)

module.exports = router

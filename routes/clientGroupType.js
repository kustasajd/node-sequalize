const express = require('express')
const router = express.Router()
const clientGroupTypeController = require('../controllers/clientGroupTypeController')
const auth = require('../helper/auth.controller')
const logsApi = require('../helper/logsApi.controller')

router.get('/', logsApi.startlogsApi, auth.authenticateJWT, clientGroupTypeController.getAllClientGroupTypes, logsApi.endlogsApi)

module.exports = router

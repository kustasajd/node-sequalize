const express = require('express')
const router = express.Router()
const clientUserController = require('../controllers/clientUserController')
const auth = require('../helper/auth.controller')
const logsApi = require('../helper/logsApi.controller')

router.post('/create', logsApi.startlogsApi, auth.authenticateJWT, clientUserController.create, logsApi.endlogsApi)
router.post('/delete', logsApi.startlogsApi, auth.authenticateJWT, clientUserController.delete, logsApi.logsApi, logsApi.logsChange)
router.get('/users/:clientId', logsApi.startlogsApi, auth.authenticateJWT, clientUserController.getClientUsers, logsApi.endlogsApi)

module.exports = router

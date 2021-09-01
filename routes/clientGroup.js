const express = require('express')
const router = express.Router()
const clientGroupController = require('../controllers/clientGroupController')
const auth = require('../helper/auth.controller')
const logsApi = require('../helper/logsApi.controller')

router.post('/create', logsApi.startlogsApi, auth.authenticateJWT, clientGroupController.create, logsApi.endlogsApi)
router.post('/delete', logsApi.startlogsApi, auth.authenticateJWT, clientGroupController.delete, logsApi.logsApi, logsApi.logsChange)
router.get('/groups/:clientId', logsApi.startlogsApi, auth.authenticateJWT, clientGroupController.getClientGroups, logsApi.endlogsApi)

module.exports = router

const express = require('express')
const router = express.Router()
const clientController = require('../controllers/clientController')
const auth = require('../helper/auth.controller')
const logsApi = require('../helper/logsApi.controller')

router.get('/siteClients/:clientId', logsApi.startlogsApi, auth.authenticateJWT, clientController.getSiteClients, logsApi.endlogsApi)
router.get('/all/:siteId', logsApi.startlogsApi, auth.authenticateJWT, clientController.getAllClients, logsApi.endlogsApi)
router.get('/:clientId', logsApi.startlogsApi, auth.authenticateJWT, clientController.getClient, logsApi.endlogsApi)
router.post('/create', logsApi.startlogsApi, auth.authenticateJWT, clientController.create, logsApi.endlogsApi)
router.put('/:clientId', logsApi.startlogsApi, auth.authenticateJWT, clientController.updateClient, logsApi.logsApi, logsApi.logsChange)

module.exports = router

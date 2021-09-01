const express = require('express')
const router = express.Router()
const reportController = require('../controllers/reportController')
const auth = require('../helper/auth.controller')
const logsApi = require('../helper/logsApi.controller')

router.get('/clients/:siteId', logsApi.startlogsApi, auth.authenticateJWT, reportController.getClients, logsApi.endlogsApi)
router.get('/licences/:siteId', logsApi.startlogsApi, auth.authenticateJWT, reportController.getLicences, logsApi.endlogsApi)
router.get('/zones/:siteId', logsApi.startlogsApi, auth.authenticateJWT, reportController.getZones, logsApi.endlogsApi)

module.exports = router

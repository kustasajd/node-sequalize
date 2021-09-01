const express = require('express')
const router = express.Router()
const floorplanController = require('../controllers/floorplanController')
const auth = require('../helper/auth.controller')
const logsApi = require('../helper/logsApi.controller')

router.get('/:siteId', logsApi.startlogsApi, auth.authenticateJWT, floorplanController.getSite, logsApi.endlogsApi)
router.put('/:siteId', logsApi.startlogsApi, auth.authenticateJWT, floorplanController.updateSite, logsApi.logsApi, logsApi.logsChange)
router.put('/updateSite/:siteId', logsApi.startlogsApi, auth.authenticateJWT, floorplanController.updateSitePolygon, logsApi.logsApi, logsApi.logsChange)

module.exports = router

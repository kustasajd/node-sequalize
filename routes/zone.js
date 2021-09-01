const express = require('express')
const router = express.Router()
const zoneController = require('../controllers/zoneController')
const auth = require('../helper/auth.controller')
const logsApi = require('../helper/logsApi.controller')

router.get('/zoneTypes', logsApi.startlogsApi, auth.authenticateJWT, zoneController.getAllZoneTypes, logsApi.endlogsApi)
router.get('/:siteId/all', logsApi.startlogsApi, auth.authenticateJWT, zoneController.getZonesBySite, logsApi.endlogsApi)
router.get('/:siteZoneId', logsApi.startlogsApi, auth.authenticateJWT, zoneController.getZone, logsApi.endlogsApi)
router.post('/create', logsApi.startlogsApi, auth.authenticateJWT, zoneController.create, logsApi.endlogsApi)
router.put('/:siteZoneId', logsApi.startlogsApi, auth.authenticateJWT, zoneController.updateZone, logsApi.logsApi, logsApi.logsChange)
router.post('/siteZoneRate/create', logsApi.startlogsApi, auth.authenticateJWT, zoneController.createSiteZoneRate, logsApi.endlogsApi)
router.post('/siteZoneRate/delete', logsApi.startlogsApi, auth.authenticateJWT, zoneController.deleteSiteZoneRate, logsApi.endlogsApi)
router.post('/licenceZone/create', logsApi.startlogsApi, auth.authenticateJWT, zoneController.createLicenceZone, logsApi.endlogsApi)
router.get('/licenceZone/:licenceZoneId', logsApi.startlogsApi, auth.authenticateJWT, zoneController.getLicenceZone, logsApi.endlogsApi)
router.put('/licenceZone/:licenceZoneId', logsApi.startlogsApi, auth.authenticateJWT, zoneController.updateLicenceZone, logsApi.logsApi, logsApi.logsChange)
router.delete('/deleteLicenceZone/:licenceZoneId', logsApi.startlogsApi, auth.authenticateJWT, zoneController.deleteLicenceZone, logsApi.logsApi, logsApi.logsChange)

module.exports = router

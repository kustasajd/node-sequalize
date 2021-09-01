const express = require('express')
const router = express.Router()
const chargeController = require('../controllers/chargeController')
const auth = require('../helper/auth.controller')
const logsApi = require('../helper/logsApi.controller')

router.get('/all/:siteId', logsApi.startlogsApi, auth.authenticateJWT, chargeController.getCharges, logsApi.endlogsApi)
router.post('/filtered', logsApi.startlogsApi, auth.authenticateJWT, chargeController.filter, logsApi.endlogsApi)
router.post('/create', logsApi.startlogsApi, auth.authenticateJWT, chargeController.create, logsApi.endlogsApi)
router.get('/:chargeRegisterId', logsApi.startlogsApi, auth.authenticateJWT, chargeController.getCharge, logsApi.endlogsApi)
router.put('/:chargeRegisterId', logsApi.startlogsApi, auth.authenticateJWT, chargeController.update, logsApi.logsApi, logsApi.logsChange)
router.delete('/:chargeRegisterId', logsApi.startlogsApi, auth.authenticateJWT, chargeController.deleteCharge, logsApi.endlogsApi)

module.exports = router

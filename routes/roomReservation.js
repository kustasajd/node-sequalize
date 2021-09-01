const express = require('express')
const router = express.Router()
const roomReservationController = require('../controllers/roomReservationController')
const auth = require('../helper/auth.controller')
const logsApi = require('../helper/logsApi.controller')

router.get('/getAll/:siteId', logsApi.startlogsApi, auth.authenticateJWT, roomReservationController.getAll, logsApi.endlogsApi)
router.get('/:roomReservationId', logsApi.startlogsApi, auth.authenticateJWT, roomReservationController.getDetail, logsApi.endlogsApi)
router.post('/create', logsApi.startlogsApi, auth.authenticateJWT, roomReservationController.create, logsApi.endlogsApi)
router.put('/:roomReservationId', logsApi.startlogsApi, auth.authenticateJWT, roomReservationController.update, logsApi.logsApi, logsApi.logsChange)
router.put('/updateTime/:roomReservationId', logsApi.startlogsApi, auth.authenticateJWT, roomReservationController.updateTime, logsApi.logsApi, logsApi.logsChange)
router.get('/zones/:siteId', logsApi.startlogsApi, auth.authenticateJWT, roomReservationController.getZones, logsApi.endlogsApi)

module.exports = router

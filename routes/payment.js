const express = require('express')
const router = express.Router()
const paymentController = require('../controllers/paymentController')
const auth = require('../helper/auth.controller')
const logsApi = require('../helper/logsApi.controller')

router.get('/paymentTypes', logsApi.startlogsApi, auth.authenticateJWT, paymentController.getPaymentTypes, logsApi.endlogsApi)
router.get('/:siteId/all', logsApi.startlogsApi, auth.authenticateJWT, paymentController.getAllPayments, logsApi.endlogsApi)
router.post('/create', logsApi.startlogsApi, auth.authenticateJWT, paymentController.create, logsApi.endlogsApi)

module.exports = router

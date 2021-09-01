const express = require('express')
const router = express.Router()
const licenceStatusTypeController = require('../controllers/licenceStatusTypeController')
const auth = require('../helper/auth.controller')
const logsApi = require('../helper/logsApi.controller')

router.get('/', logsApi.startlogsApi, auth.authenticateJWT, licenceStatusTypeController.getLicenceStatusType, logsApi.endlogsApi)

module.exports = router

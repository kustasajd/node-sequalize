const express = require('express')
const router = express.Router()
const userRoleTypeController = require('../controllers/userRoleTypeController')
const auth = require('../helper/auth.controller')
const logsApi = require('../helper/logsApi.controller')

router.get('/', logsApi.startlogsApi, auth.authenticateJWT, userRoleTypeController.getAllUserRoleTypes, logsApi.endlogsApi)

module.exports = router

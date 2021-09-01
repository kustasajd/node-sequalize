const express = require('express')
const router = express.Router()
const UserController = require('../controllers/userController')
const auth = require('../helper/auth.controller')
const logsApi = require('../helper/logsApi.controller')

router.post('/authenticate', logsApi.startlogsApi, UserController.authenticate, logsApi.logsApi, logsApi.logsChange)
router.get('/all/:siteId', logsApi.startlogsApi, auth.authenticateJWT, UserController.getAllUsers, logsApi.endlogsApi)
router.get('/:userId', logsApi.startlogsApi, auth.authenticateJWT, UserController.getUser, logsApi.endlogsApi)
router.put('/:userId', logsApi.startlogsApi, auth.authenticateJWT, UserController.updateUser, logsApi.logsApi, logsApi.logsChange)
router.post('/create', logsApi.startlogsApi, auth.authenticateJWT, UserController.create, logsApi.endlogsApi)
router.get('/sites/:userId', logsApi.startlogsApi, auth.authenticateJWT, UserController.getSites, logsApi.endlogsApi)

module.exports = router

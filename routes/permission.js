const express = require('express')
const router = express.Router()
const permissionController = require('../controllers/permissionController')
const auth = require('../helper/auth.controller')
const logsApi = require('../helper/logsApi.controller')

router.get('/', logsApi.startlogsApi, auth.authenticateJWT, permissionController.getAllPermissions, logsApi.endlogsApi)
router.get('/:permissionId', logsApi.startlogsApi, auth.authenticateJWT, permissionController.getPermission, logsApi.endlogsApi)
router.post('/addUserRolePermission', logsApi.startlogsApi, auth.authenticateJWT, permissionController.addUserRolePermission, logsApi.endlogsApi)
router.delete('/deleteUserRolePermission/:userRolePermissionId', logsApi.startlogsApi, auth.authenticateJWT, permissionController.deleteUserRolePermission, logsApi.endlogsApi)

module.exports = router

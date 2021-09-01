const express = require('express')
const router = express.Router()
const productController = require('../controllers/productController')
const auth = require('../helper/auth.controller')
const logsApi = require('../helper/logsApi.controller')

router.post('/create', logsApi.startlogsApi, auth.authenticateJWT, productController.create, logsApi.endlogsApi)
router.get('/', logsApi.startlogsApi, auth.authenticateJWT, productController.getAllProducts, logsApi.endlogsApi)
router.get('/all/:siteId', logsApi.startlogsApi, auth.authenticateJWT, productController.getProductsBySiteId, logsApi.endlogsApi)
router.get('/site/:productId', logsApi.startlogsApi, auth.authenticateJWT, productController.getSiteProducts, logsApi.endlogsApi)
router.get('/:productId', logsApi.startlogsApi, auth.authenticateJWT, productController.getProduct, logsApi.endlogsApi)
router.put('/:productId', logsApi.startlogsApi, auth.authenticateJWT, productController.updateProduct, logsApi.logsApi, logsApi.logsChange)
router.post('/site/create', logsApi.startlogsApi, auth.authenticateJWT, productController.createSite, logsApi.endlogsApi)

module.exports = router

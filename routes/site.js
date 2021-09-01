const express = require('express')
const router = express.Router()
const siteController = require('../controllers/siteController')
const auth = require('../helper/auth.controller')
const logsApi = require('../helper/logsApi.controller')

// site users
router.get('/users/:siteId', logsApi.startlogsApi, auth.authenticateJWT, siteController.getUsersBySite, logsApi.endlogsApi)
router.post('/createUser', logsApi.startlogsApi, auth.authenticateJWT, siteController.createUser, logsApi.endlogsApi)
router.post('/updateUser', logsApi.startlogsApi, auth.authenticateJWT, siteController.updateUser, logsApi.logsApi, logsApi.logsChange)
router.post('/deleteUser', logsApi.startlogsApi, auth.authenticateJWT, siteController.deleteUser, logsApi.logsApi, logsApi.logsChange)
//site clients
router.get('/clients/:siteId', logsApi.startlogsApi, auth.authenticateJWT, siteController.getClientsBySite, logsApi.endlogsApi)
router.post('/createClient', logsApi.startlogsApi, auth.authenticateJWT, siteController.createClient, logsApi.endlogsApi)
router.post('/deleteClient', logsApi.startlogsApi, auth.authenticateJWT, siteController.deleteClient, logsApi.logsApi, logsApi.logsChange)
router.get('/siteClients/:clientId', logsApi.startlogsApi, auth.authenticateJWT, siteController.getSitesByClient, logsApi.endlogsApi)

// siteLicenceTemplates 
router.get('/licenceTemplates/:siteId', logsApi.startlogsApi, auth.authenticateJWT, siteController.getSiteLicenceTemplate, logsApi.endlogsApi)
router.post('/licenceTemplate/detail', logsApi.startlogsApi, auth.authenticateJWT, siteController.getSiteLicenceTemplateDetail, logsApi.endlogsApi)
router.post('/licenceTemplate/create', logsApi.startlogsApi, auth.authenticateJWT, siteController.createSiteLicenceTemplate, logsApi.endlogsApi)
router.post('/licenceTemplate/update', logsApi.startlogsApi, auth.authenticateJWT, siteController.updateSiteLicenceTemplate, logsApi.logsApi, logsApi.logsChange)

// Site Licence Document and Site Licence Product

router.post('/siteLicenceDocuments/create', logsApi.startlogsApi, auth.authenticateJWT, siteController.createSiteLicenceDocument, logsApi.endlogsApi)
router.post('/siteLicenceDocuments/update', logsApi.startlogsApi, auth.authenticateJWT, siteController.updateSiteLicenceDocument, logsApi.logsApi, logsApi.logsChange)
router.get('/siteLicenceDocuments/:siteLicenceDocumentId/detail', logsApi.startlogsApi, auth.authenticateJWT, siteController.siteLicenceDocumentDetail, logsApi.endlogsApi)

router.post('/siteLicenceProducts/create', logsApi.startlogsApi, auth.authenticateJWT, siteController.createSiteLicenceProduct, logsApi.endlogsApi)
router.post('/siteLicenceProducts/update', logsApi.startlogsApi, auth.authenticateJWT, siteController.updateSiteLicenceProduct, logsApi.logsApi, logsApi.logsChange)
router.get('/siteLicenceProducts/:siteLicenceProductId/detail', logsApi.startlogsApi, auth.authenticateJWT, siteController.siteLicenceProductDetail, logsApi.endlogsApi)

//site products
router.get('/products/:siteId', logsApi.startlogsApi, auth.authenticateJWT, siteController.getProductsBySite, logsApi.endlogsApi)
router.get('/:siteId/siteProduct/:siteProductId', logsApi.startlogsApi, auth.authenticateJWT, siteController.getSiteProductById, logsApi.endlogsApi)
router.get('/:siteId/siteProductPricing/:siteProductPricingId', logsApi.startlogsApi, auth.authenticateJWT, siteController.getSiteProductPricingDetail, logsApi.endlogsApi)
router.post('/productPricing', logsApi.startlogsApi, auth.authenticateJWT, siteController.getSiteProductPricing, logsApi.endlogsApi)
router.post('/createProduct', logsApi.startlogsApi, auth.authenticateJWT, siteController.createProduct, logsApi.endlogsApi)
router.post('/createProductPricing', logsApi.startlogsApi, auth.authenticateJWT, siteController.createProductPricing, logsApi.endlogsApi)
router.put('/updateProductPricing/:siteProductPricingId', logsApi.startlogsApi, auth.authenticateJWT, siteController.updateProductPricing, logsApi.logsApi, logsApi.logsChange)

//basic
router.post('/create', logsApi.startlogsApi, auth.authenticateJWT, siteController.create, logsApi.endlogsApi)
router.get('/', logsApi.startlogsApi, auth.authenticateJWT, siteController.getAllSites, logsApi.endlogsApi)
router.get('/:siteId', logsApi.startlogsApi, auth.authenticateJWT, siteController.getSite, logsApi.endlogsApi)
router.get('/logo/:siteId', logsApi.startlogsApi, auth.authenticateJWT, siteController.getSiteLogo, logsApi.endlogsApi)
router.put('/:siteId', logsApi.startlogsApi, auth.authenticateJWT, siteController.updateSite, logsApi.logsApi, logsApi.logsChange)


module.exports = router

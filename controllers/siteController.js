require('dotenv').config()
const db = require('../db')

const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");

const account = process.env.STORAGE_NAME;
const accountKey = process.env.STORAGE_KEY;
const containerName = process.env.CONTAINER_NAME;
const containerProfileImageName = process.env.CONTAINER_PROFILE_IMAGE;

const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
const blobServiceClient = new BlobServiceClient(
  `https://${account}.blob.core.windows.net`,
  sharedKeyCredential
);

const Site = db.models.site
const SiteUser = db.models.siteUser
const SiteClient = db.models.siteClient
const ProductChargeType = db.models.productChargeType
const TaxRate = db.models.taxRate
const Product = db.models.product
const Currency = db.models.currency
const User = db.models.user
const UserRoleType = db.models.userRoleType
const Client = db.models.client
const SiteLicenceTemplate = db.models.siteLicenceTemplate
const SiteLicenceProduct = db.models.siteLicenceProduct
const SiteLicenceDocument = db.models.siteLicenceDocument
const LicenceType = db.models.licenceType
const SiteProduct = db.models.siteProduct
const SiteProductPricing = db.models.siteProductPricing
const ClientUser = db.models.clientUser
const Invoice = db.models.invoice
const Payment = db.models.payment
const ChargeRegister = db.models.chargeRegister
const Licence = db.models.licence
const LicenceZone = db.models.licenceZone
const SiteZone = db.models.siteZone
const ZoneType = db.models.zoneType
const LicenceProductType = db.models.licenceProductType

const siteController = {
  create: async (req, res, next) => {
    try {
      const { brandName, addressStreet, currencyId } = req.body

      if (!brandName) {
        res.status(400).json({ message: 'brand name is required' })
        next()
        return
      }

      if (!addressStreet) {
        res.status(400).json({ message: 'Address Street is required' })
        next()
        return
      }

      if (!currencyId) {
        res.status(400).json({ message: 'currencyId is required' })
        next()
        return
      }

      const site = await Site.findOne({ where: { brandName: brandName } })
      if (site) {
        res.status(400).json({ message: 'Site Aleady Exist' })
        next()
        return
      }

      let newSite = new Site()

      newSite.brandName = brandName
      newSite.addressStreet = addressStreet
      newSite.currencyId = currencyId

      await newSite.save()

      res.status(200).json({
        site: newSite
      })
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  getAllSites: async (req, res, next) => {
    const sites = await Site.findAll({
      attributes: ['siteId', 'currencyId', 'brandName', 'addressStreet', 'logoUrl'],
      include: [{ model: Currency }, { model: SiteUser, where: { active: true } }, {model: SiteClient, where: { active: true }}]
    })
    let i = 0
    sites.forEach(async(site) => {
      let blobName = site.dataValues.logoUrl
      const containerClient = blobServiceClient.getContainerClient(containerProfileImageName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      
      const downloadBlockBlobResponse = await blockBlobClient.download(0);
      let buffer = await siteController.streamToBuffer(downloadBlockBlobResponse.readableStreamBody)
      if (buffer.toString('base64').includes("data:image/")) {
        site.dataValues.logoUrl = buffer.toString('base64')
      } else {
        site.dataValues.logoUrl = `data:image/png;base64,${buffer.toString('base64')}`
      }
      i++
      if (i === sites.length) res.status(201).json(sites)
    })
    next()
  },

  getSite: async (req, res, next) => {
    try {
      let siteId = req.params.siteId
      const site = await Site.findOne({
        where: { siteId: siteId },
        attributes: ['siteId', 'currencyId', 'brandName', 'addressStreet', 'logoUrl'],
        include: [{ model: Currency }]
      })
      let blobName = site.dataValues.logoUrl
      const containerClient = blobServiceClient.getContainerClient(containerProfileImageName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      
      const downloadBlockBlobResponse = await blockBlobClient.download(0);
      let buffer = await siteController.streamToBuffer(downloadBlockBlobResponse.readableStreamBody)
      if (buffer.toString('base64').includes("data:image/")) {
        site.dataValues.logoUrl = buffer.toString('base64')
      } else {
        site.dataValues.logoUrl = `data:image/png;base64,${buffer.toString('base64')}`
      }
      res.status(201).json(site)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  getSiteLogo: async (req, res, next) => {
    try {
      let siteId = req.params.siteId
      const site = await Site.findOne({
        where: { siteId: siteId },
        attributes: ['siteId', 'currencyId', 'brandName', 'addressStreet', 'logoUrl'],
      })
      let blobName = site.dataValues.logoUrl
      let logoBase64
      const containerClient = blobServiceClient.getContainerClient(containerProfileImageName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      
      const downloadBlockBlobResponse = await blockBlobClient.download(0);
      let buffer = await siteController.streamToBuffer(downloadBlockBlobResponse.readableStreamBody)
      if (buffer.toString('base64').includes("data:image/")) {
        logoBase64 = buffer.toString('base64')
      } else {
        logoBase64 = `data:image/png;base64,${buffer.toString('base64')}`
      }
      res.status(201).json(logoBase64)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  updateSite: async (req, res, next) => {
    let siteId = req.params.siteId
    req.oldValue = await Site.findOne({ where: { siteId: siteId } })
    req.tableName = 'dbo.sites'
    await Site.update(req.body, { where: { siteId: siteId } })
    res.status(201).json(req.body)
    req.newValue = await Site.findOne({ where: { siteId: siteId } })
    next()
  },

  // site users
  createUser: async (req, res, next) => {
    try {
      const { siteId, userId, userRoleTypeId } = req.body

      if (!siteId) {
        res.status(400).json({ message: 'siteId is required' })
        next()
        return
      }

      if (!userId) {
        res.status(400).json({ message: 'userId is required' })
        next()
        return
      }

      let siteUser = await SiteUser.findOne({
        where: { siteId: siteId, userId: userId, active: true }
      })
      if (siteUser) {
        res.status(400).json({ message: 'Aleady Exist' })
        next()
        return
      } else {
        let newSiteUser = new SiteUser()

        newSiteUser.siteId = siteId
        newSiteUser.userId = userId
        newSiteUser.userRoleTypeId = userRoleTypeId ? userRoleTypeId : 1
        newSiteUser.active = true
        newSiteUser.addedByUserId = req.user.userId
  
        await newSiteUser.save()

        siteUser = await SiteUser.findOne({
          where: { siteUserId: newSiteUser.siteUserId },
          attributes: ['siteUserId', 'siteId', 'userId', 'addedByUserId'],
          include: [{ model: User }, {model: Site}, { model: UserRoleType }]
        })
  
        res.status(200).json(siteUser)
      }
      
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  updateUser: async (req, res, next) => {
    try {
      const { siteUserId, userRoleTypeId } = req.body
      if (!siteUserId) {
        res.status(400).json({ message: 'siteUserId is required' })
        next()
        return
      }

      if (!userRoleTypeId) {
        res.status(400).json({ message: 'userRoleTypeId is required' })
        next()
        return
      }
      req.oldValue = await SiteUser.findOne({ where: { siteUserId: siteUserId } })
      req.tableName = 'dbo.siteUsers'
      const siteUser = await SiteUser.update(
        { userRoleTypeId: userRoleTypeId },
        { where: { siteUserId: siteUserId } }
      )
      res.status(200).json(siteUser)
      req.newValue = await SiteUser.findOne({ where: { siteUserId: siteUserId } })
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  deleteUser: async function (req, res, next) {
    const { siteId, userId } = req.body
    if (!siteId) {
      res.status(400).json({ message: 'siteId is required' })
      next()
      return
    }
    if (!userId) {
      res.status(400).json({ message: 'userId is required' })
      next()
      return
    }
    try {
      req.oldValue = await SiteUser.findOne({ where: { siteId: siteId, userId: userId } })
      req.tableName = 'dbo.siteUsers'
      await SiteUser.update(
        { active: false },
        { where: { siteId: siteId, userId: userId } }
      )
      const siteUser = await SiteUser.findOne({
        where: { siteId: siteId, userId: userId }
      })
      res.status(201).json(siteUser)
      req.newValue = siteUser
    } catch (err) {
      res.status(400).json({
        message: err.message
      })
    }
    next()
  },

  getUsersBySite: async (req, res, next) => {
    try {
      let siteId = req.params.siteId
      let users = []
      const siteUsers = await SiteUser.findAll({
        where: { siteId: siteId, active: true },
        attributes: ['siteUserId', 'siteId', 'userId', 'addedByUserId'],
        include: [{ model: User }, {model: Site}, { model: UserRoleType }]
      })
      await Promise.all(siteUsers.map(async(siteUser) => {
        if (siteUser.user && siteUser.user.profileImg) {
          let blobName = siteUser.user.profileImg
          const containerClient = blobServiceClient.getContainerClient(containerProfileImageName);
          const blockBlobClient = containerClient.getBlockBlobClient(blobName);
          
          const downloadBlockBlobResponse = await blockBlobClient.download(0);
          let buffer = await siteController.streamToBuffer(downloadBlockBlobResponse.readableStreamBody)
          siteUser.user.profileImg = buffer.toString()
        }
        if (siteUser.user) users.push(siteUser)
      }));
      res.status(201).json(users)
      next()
    } catch (err) {
      res.status(400).json({ message: err.message })
      next()
    }
  },

  streamToBuffer: async(readableStream) => {
    return new Promise((resolve, reject) => {
      const chunks = [];
      readableStream.on("data", (data) => {
        chunks.push(data instanceof Buffer ? data : Buffer.from(data));
      });
      readableStream.on("end", () => {
        resolve(Buffer.concat(chunks));
      });
      readableStream.on("error", reject);
    });
  },

  //site client
  getClientsBySite: async (req, res, next) => {
    try {
      let siteId = req.params.siteId
      const siteClients = await SiteClient.findAll({
        where: { siteId: siteId, active: true },
        attributes: ['siteClientId', 'siteId', 'clientId'],
        include: [
          {
            model: Client,
            include: [
              { model: ClientUser },
              {
                model: Licence,
                include: [
                  {
                    model: LicenceZone,
                    include: [
                      { model: SiteZone, include: [{ model: ZoneType }] }
                    ]
                  }
                ]
              },
              {
                model: Invoice,
                include: [
                  { model: Payment },
                  { model: ChargeRegister, where: { siteId: siteId } }
                ]
              }
            ]
          }
        ]
      })
      siteClients.forEach(client => {
        client.dataValues.client.licences = client.dataValues.client.licences.filter(licence => { return licence.active === true })
        client.dataValues.client.licences.forEach(licence=>{
          licence.dataValues.licenceZones = licence.dataValues.licenceZones.filter(licenceZone => { return licenceZone.active === true })
        })
      });
      res.status(201).json(siteClients)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  getSitesByClient: async (req, res, next) => {
    try {
      let clientId = req.params.clientId
      const siteClients = await SiteClient.findAll({
        where: { clientId: clientId, active: true },
        attributes: ['siteClientId', 'siteId', 'clientId'],
        include: [{ model: Site }]
      })
      res.status(201).json(siteClients)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  deleteClient: async function (req, res, next) {
    const { siteId, clientId } = req.body
    if (!siteId) {
      res.status(400).json({ message: 'siteId is required' })
      next()
      return
    }
    if (!clientId) {
      res.status(400).json({ message: 'clientId is required' })
      next()
      return
    }
    try {
      req.oldValue = await SiteClient.findOne({ where: { siteId: siteId, clientId: clientId } })
      req.tableName = 'dbo.siteClients'
      await SiteClient.update(
        { active: false },
        { where: { siteId: siteId, clientId: clientId } }
      )
      const siteClient = await SiteClient.findOne({
        where: { siteId: siteId, clientId: clientId }
      })
      res.status(201).json(siteClient)
      req.newValue = siteClient
    } catch (err) {
      res.status(400).json({
        message: err.message
      })
    }
    next()
  },

  createClient: async (req, res, next) => {
    try {
      const { siteId, clientId } = req.body

      if (!siteId) {
        res.status(400).json({ message: 'siteId is required' })
        next()
        return
      }

      if (!clientId) {
        res.status(400).json({ message: 'clientId is required' })
        next()
        return
      }

      const siteClient = await SiteClient.findOne({
        where: { siteId: siteId, clientId: clientId, active: true }
      })
      if (siteClient) {
        res.status(400).json({ message: 'Site Client Aleady Exist' })
        next()
        return
      } else {
        let newSiteClient = new SiteClient()

        newSiteClient.siteId = siteId
        newSiteClient.clientId = clientId
        newSiteClient.active = true
  
        await newSiteClient.save()
  
        res.status(200).json({
          siteClient: newSiteClient
        })
      }
      
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  // siteLicenceTemplates 
  getSiteLicenceTemplate: async (req, res, next) => {
    try {
      let siteId = req.params.siteId
      const siteLicenceTemplates = await SiteLicenceTemplate.findAll({
        where: { siteId: siteId, active: true },
        attributes: ['siteLicenceTemplateId', 'licenceTypeId', 'name', 'invoicingDay', 'paymentTermsDaysFromInvoice'],
        include: [{ model: Site }, { model: LicenceType }, { model: SiteLicenceDocument }, { model: SiteLicenceProduct }]
      })
      res.status(201).json(siteLicenceTemplates)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  getSiteLicenceTemplateDetail: async (req, res, next) => {
    const { siteId, siteLicenceTemplateId } = req.body
    if (!siteId) {
      res.status(400).json({ message: 'siteId is required' })
      next()
      return
    }

    if (!siteLicenceTemplateId) {
      res.status(400).json({ message: 'siteLicenceTemplateId is required' })
      next()
      return
    }
    try {
      
      const siteLicenceTemplate = await SiteLicenceTemplate.findOne(
        {
          attributes: ['siteLicenceTemplateId', 'name', 'active', 'invoicingDay', 'paymentTermsDaysFromInvoice'],
          include: [{ model: Site, include: [{model: Currency}] }, { model: LicenceType }, { model: SiteLicenceDocument }, { model: SiteLicenceProduct, include: [{ model: LicenceProductType }, {model: SiteProductPricing, include: [{model: SiteProduct, include:[{model: Product}]}] }] }],
          where: { siteId: siteId, siteLicenceTemplateId: siteLicenceTemplateId, active: true }
        }
      )

      res.status(201).json(siteLicenceTemplate)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },
  createSiteLicenceTemplate: async (req, res, next) => {
    const { siteId, licenceTypeId, name, active, invoicingDay, paymentTermsDaysFromInvoice } = req.body

    if (!siteId) {
      res.status(400).json({ message: 'siteId is required' })
      next()
      return
    }

    if (!licenceTypeId) {
      res.status(400).json({ message: 'licenceTypeId is required' })
      next()
      return
    }

    if (!invoicingDay) {
      res.status(400).json({ message: 'invoicingDay is required' })
      next()
      return
    }

    if (!paymentTermsDaysFromInvoice) {
      res.status(400).json({ message: 'paymentTermsDaysFromInvoice is required' })
      next()
      return
    }

    try {
      let newSiteLicenceTemplate = new SiteLicenceTemplate()

      newSiteLicenceTemplate.siteId = siteId
      newSiteLicenceTemplate.licenceTypeId = licenceTypeId
      newSiteLicenceTemplate.name = name
      newSiteLicenceTemplate.active = active
      newSiteLicenceTemplate.invoicingDay = invoicingDay
      newSiteLicenceTemplate.paymentTermsDaysFromInvoice = paymentTermsDaysFromInvoice

      await newSiteLicenceTemplate.save()

      res.status(200).json(newSiteLicenceTemplate)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },
  updateSiteLicenceTemplate: async (req, res, next) => {
    const { siteId, licenceTypeId, siteLicenceTemplateId, active, name, invoicingDay, paymentTermsDaysFromInvoice } = req.body

    if (!siteLicenceTemplateId) {
      res.status(400).json({ message: 'siteLicenceTemplateId is required' })
      next()
      return
    }

    if (!siteId) {
      res.status(400).json({ message: 'siteId is required' })
      next()
      return
    }

    if (!licenceTypeId) {
      res.status(400).json({ message: 'licenceTypeId is required' })
      next()
      return
    }

    if (!invoicingDay) {
      res.status(400).json({ message: 'invoicingDay is required' })
      next()
      return
    }

    if (!paymentTermsDaysFromInvoice) {
      res.status(400).json({ message: 'paymentTermsDaysFromInvoice is required' })
      next()
      return
    }

    try {
      req.oldValue = await SiteLicenceTemplate.findOne({ where: { siteLicenceTemplateId: siteLicenceTemplateId } })
      req.tableName = 'dbo.siteLicenceTemplates'
      let siteLicenceTemplate = await SiteLicenceTemplate.update(
        { siteId: siteId, licenceTypeId: licenceTypeId, active: active, name: name, invoicingDay: invoicingDay, paymentTermsDaysFromInvoice: paymentTermsDaysFromInvoice },
        { where: { siteLicenceTemplateId: siteLicenceTemplateId } }
      )
      res.status(200).json(siteLicenceTemplate)
      req.newValue = await SiteLicenceTemplate.findOne({ where: { siteLicenceTemplateId: siteLicenceTemplateId } })
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  // siteLicenceDocuments  

  createSiteLicenceDocument: async (req, res, next) => {
    const { siteLicenceTemplateId, name, description, docUrl, isDocuSign } = req.body   

    if (!siteLicenceTemplateId) {
      res.status(400).json({ message: 'siteLicenceTemplateId is required' })
      next()
      return
    }

    if (!name) {
      res.status(400).json({ message: 'name is required' })
      next()
      return
    }

    let blobName
    if (docUrl) {
      const {content, title} = docUrl;
      blobName = 'template-' + siteLicenceTemplateId + '-' + title.slice(0, -4) + '-' + new Date().getTime() + '.pdf';
      const containerClient = blobServiceClient.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const uploadBlobResponse = await blockBlobClient.upload(content, Buffer.byteLength(content));
      console.log(`Upload block blob ${blobName} successfully`, uploadBlobResponse.requestId);
    }
    try {
      
      if (docUrl && isDocuSign === true) {
        req.template = {}
        const siteLicenceTemplate = await SiteLicenceTemplate.findOne({
          attributes: ['siteLicenceTemplateId', 'name'],
          include: [{ model: Site }],
          where: { siteLicenceTemplateId: siteLicenceTemplateId }
        })
        
        req.template.siteLicenceTemplateId = siteLicenceTemplateId
        req.template.name = name
        req.template.description = description
        req.template.docUrl = blobName
        req.template.isDocuSign = true
        req.template.docuSignTemplateRef = null
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const downloadBlockBlobResponse = await blockBlobClient.download(0);
        let buffer = await siteController.streamToBuffer(downloadBlockBlobResponse.readableStreamBody)
        req.template.title = docUrl.title
        req.template.emailSubject = `Please Sign - ${name} - ${siteLicenceTemplate.site.brandName}`
        req.template.docB64 = buffer.toString('base64')
        req.template.dsUserId = siteLicenceTemplate.site.dsUserId
        req.template.dsApiAccountId = siteLicenceTemplate.site.dsApiAccountId
        req.template.dsIntegrationId = siteLicenceTemplate.site.dsIntegrationId

        req.dsAuth.createTemplate(req, res)
      } else if(isDocuSign === false) {
        let newSiteLicenceDocument = new SiteLicenceDocument()
        newSiteLicenceDocument.siteLicenceTemplateId = siteLicenceTemplateId
        newSiteLicenceDocument.name = name
        newSiteLicenceDocument.description = description
        newSiteLicenceDocument.docUrl = blobName
        newSiteLicenceDocument.isDocuSign = isDocuSign
        newSiteLicenceDocument.docuSignTemplateRef = null    
        await newSiteLicenceDocument.save()
        res.status(200).json(newSiteLicenceDocument)
        next()
      }
    } catch (err) {
      res.status(400).json({ message: err.message })
    }    
    
  },

  updateSiteLicenceDocument: async (req, res, next) => {
    const { siteLicenceDocumentId, siteLicenceTemplateId, name, description, docUrl, isDocuSign, docuSignTemplateRef } = req.body

    let blobName
    if (docUrl) {
      const {content, title} = docUrl;
      blobName = new Date().getTime() + '-' + title;
  
      const containerClient = blobServiceClient.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const uploadBlobResponse = await blockBlobClient.upload(content, Buffer.byteLength(content));
      console.log(`Upload block blob ${blobName} successfully`, uploadBlobResponse.requestId);
    }

    if (!siteLicenceDocumentId) {
      res.status(400).json({ message: 'siteLicenceDocumentId is required' })
      next()
      return
    }

    if (!siteLicenceTemplateId) {
      res.status(400).json({ message: 'siteLicenceTemplateId is required' })
      next()
      return
    }

    if (!name) {
      res.status(400).json({ message: 'name is required' })
      next()
      return
    }
    let query = blobName ? { siteLicenceTemplateId: siteLicenceTemplateId, name: name, description: description, docUrl: blobName, isDocuSign: isDocuSign, docuSignTemplateRef: docuSignTemplateRef } : { siteLicenceTemplateId: siteLicenceTemplateId, name: name, description: description, isDocuSign: isDocuSign, docuSignTemplateRef: docuSignTemplateRef }
    try {
      req.oldValue = await SiteLicenceDocument.findOne({ where: { siteLicenceDocumentId: siteLicenceDocumentId } })
      req.tableName = 'dbo.siteLicenceDocuments'
      let siteLicenceDocument = await SiteLicenceDocument.update(
        query,
        { where: { siteLicenceDocumentId: siteLicenceDocumentId } }
      )
      res.status(200).json(siteLicenceDocument)
      req.newValue = await SiteLicenceDocument.findOne({ where: { siteLicenceDocumentId: siteLicenceDocumentId } })
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  siteLicenceDocumentDetail: async (req, res, next) => {
    try {
      let siteLicenceDocumentId = req.params.siteLicenceDocumentId
      let siteLicenceDocument = await SiteLicenceDocument.findOne({
        where: { siteLicenceDocumentId: siteLicenceDocumentId },
        attributes: ['siteLicenceDocumentId', 'siteLicenceTemplateId', 'name', 'description', 'docUrl', 'isDocuSign', 'docuSignTemplateRef'],
        include: []
      })
      if (siteLicenceDocument.docUrl) {
        let blobName = siteLicenceDocument.docUrl
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const downloadBlockBlobResponse = await blockBlobClient.download(0);
        let buffer = await siteController.streamToBuffer(downloadBlockBlobResponse.readableStreamBody)
        siteLicenceDocument.docUrl = buffer.toString()
      }
      res.status(201).json(siteLicenceDocument)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  // siteLicenceProducts

  createSiteLicenceProduct: async (req, res, next) => {
    const { siteLicenceTemplateId, siteProductPricingId, overridePrice, paidInAdvance, licenceProductTypeId } = req.body

    if (!siteLicenceTemplateId) {
      res.status(400).json({ message: 'siteLicenceTemplateId is required' })
      next()
      return
    }

    if (!siteProductPricingId) {
      res.status(400).json({ message: 'siteProductPricingId is required' })
      next()
      return
    }

    if (!paidInAdvance) {
      res.status(400).json({ message: 'paidInAdvance is required' })
      next()
      return
    }

    if (!licenceProductTypeId) {
      res.status(400).json({ message: 'licenceProductTypeId is required' })
      next()
      return
    }

    try {
      let newSiteLicenceProduct = new SiteLicenceProduct()

      newSiteLicenceProduct.siteLicenceTemplateId = siteLicenceTemplateId
      newSiteLicenceProduct.siteProductPricingId = siteProductPricingId
      newSiteLicenceProduct.overridePrice = overridePrice
      newSiteLicenceProduct.paidInAdvance = paidInAdvance
      newSiteLicenceProduct.licenceProductTypeId = licenceProductTypeId

      await newSiteLicenceProduct.save()

      res.status(200).json(newSiteLicenceProduct)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  updateSiteLicenceProduct: async (req, res, next) => {
    const { siteLicenceProductId, siteLicenceTemplateId, siteProductPricingId, overridePrice, paidInAdvance, licenceProductTypeId } = req.body

    if (!siteLicenceProductId) {
      res.status(400).json({ message: 'siteLicenceProductId is required' })
      next()
      return
    }

    if (!siteLicenceTemplateId) {
      res.status(400).json({ message: 'siteLicenceTemplateId is required' })
      next()
      return
    }

    if (!siteProductPricingId) {
      res.status(400).json({ message: 'siteProductPricingId is required' })
      next()
      return
    }

    if (!paidInAdvance) {
      res.status(400).json({ message: 'paidInAdvance is required' })
      next()
      return
    }

    if (!licenceProductTypeId) {
      res.status(400).json({ message: 'licenceProductTypeId is required' })
      next()
      return
    }

    try {
      req.oldValue = await SiteLicenceProduct.findOne({ where: { siteLicenceProductId: siteLicenceProductId } })
      req.tableName = 'dbo.siteLicenceProducts'
      let siteLicenceProduct = await SiteLicenceProduct.update(
        { siteLicenceTemplateId: siteLicenceTemplateId, siteProductPricingId: siteProductPricingId, overridePrice: overridePrice, paidInAdvance: paidInAdvance, licenceProductTypeId: licenceProductTypeId },
        { where: { siteLicenceProductId: siteLicenceProductId } }
      )
      res.status(200).json(siteLicenceProduct)
      req.newValue = await SiteLicenceProduct.findOne({ where: { siteLicenceProductId: siteLicenceProductId } })
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  siteLicenceProductDetail: async (req, res, next) => {
    try {
      let siteLicenceProductId = req.params.siteLicenceProductId
      const siteLicenceProduct = await SiteLicenceProduct.findOne({
        where: { siteLicenceProductId: siteLicenceProductId },
        attributes: ['siteLicenceProductId', 'siteLicenceTemplateId', 'siteProductPricingId', 'overridePrice', 'paidInAdvance', 'licenceProductTypeId'],
        include: [{model: SiteProductPricing}]
      })

      res.status(201).json(siteLicenceProduct)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  }, 
  
  
  //site products
  getProductsBySite: async (req, res, next) => {
    try {
      let siteId = req.params.siteId
      const siteProducts = await SiteProduct.findAll({
        where: { siteId: siteId, active: true },
        attributes: ['siteProductId'],
        include: [{model: Product}, { model: SiteProductPricing, include: [{ model: ProductChargeType }, { model: TaxRate }] }]
      })
      res.status(201).json(siteProducts)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  getSiteProductById: async (req, res, next) => {
    try {
      const siteId = req.params.siteId
      const siteProductId = req.params.siteProductId
      const siteProduct = await SiteProduct.findOne(
        {
          where: { siteProductId: siteProductId, siteId: siteId, active: true },
          attributes: ['siteProductId'],
          include: [{ model: Site }, {model: Product}]
        })
      res.status(201).json(siteProduct)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  getSiteProductPricingDetail: async (req, res, next) => {
    try {
      const siteProductPricingId = req.params.siteProductPricingId
      const siteProductPricing = await SiteProductPricing.findOne(
        {
          where: { siteProductPricingId: siteProductPricingId },
          attributes: ['siteProductPricingId', 'siteProductId', 'productChargeTypeId', 'baseRate', 'taxRateId', 'optionName'],
          include: [
            { model: SiteProduct, include: [{model: Site}, {model: Product}] }
          ]
        })
      res.status(201).json(siteProductPricing)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  getSiteProductPricing: async (req, res, next) => {
    try {
      const { siteId, siteProductId } = req.body

      if (!siteId) {
        res.status(400).json({ message: 'siteId is required' })
        next()
        return
      }

      if (!siteProductId) {
        res.status(400).json({ message: 'siteProductId is required' })
        next()
        return
      }

      const query = siteProductId ? {siteProductId: siteProductId} : {}
      let results = [];
      const siteProductPricing = await SiteProductPricing.findAll({
        where: query,
        attributes: ['siteProductPricingId', 'baseRate', 'optionName'],
        include: [{ model: SiteProduct, include: [{model: Product}] }, { model: ProductChargeType }, { model: TaxRate }]
      })
      siteProductPricing.forEach(element => {
        if (element.siteProduct.siteId === parseInt(siteId)) {
          results.push(element)
        }
      });
      res.status(201).json(results)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },
  createProduct: async (req, res, next) => {
    try {
      const { siteId, productId, taxRateId, productChargeTypeId, baseRate } = req.body
     
      if (!siteId) {
        res.status(400).json({ message: 'siteId is required' })
        next()
        return
      }

      if (!productId) {
        res.status(400).json({ message: 'productId is required' })
        next()
        return
      }

      if (!taxRateId) {
        res.status(400).json({ message: 'taxRateId is required' })
        next()
        return
      }

      if (!productChargeTypeId) {
        res.status(400).json({ message: 'productChargeTypeId is required' })
        next()
        return
      }

      let siteProduct = await SiteProduct.findOne({
        where: { siteId: siteId, productId: productId, active: true }
      })
      if (siteProduct) {
        res.status(400).json({ message: 'Aleady Exist' })
        next()
        return
      } else {
        let newSiteProduct = new SiteProduct()

        newSiteProduct.siteId = siteId
        newSiteProduct.productId = productId
        newSiteProduct.active = true
  
        siteProduct = await newSiteProduct.save()

        let newSiteProductPricing = new SiteProductPricing
        newSiteProductPricing.siteProductId = siteProduct.siteProductId
        newSiteProductPricing.productChargeTypeId = productChargeTypeId
        newSiteProductPricing.baseRate = parseFloat(baseRate)
        newSiteProductPricing.taxRateId = taxRateId

        await newSiteProductPricing.save()
        res.status(200).json(newSiteProduct)
      }
      
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },
  createProductPricing: async (req, res, next) => {
    try {
      const { siteProductId, taxRateId, productChargeTypeId, baseRate, optionName } = req.body
     
      if (!siteProductId) {
        res.status(400).json({ message: 'siteProductId is required' })
        next()
        return
      }

      if (!taxRateId) {
        res.status(400).json({ message: 'taxRateId is required' })
        next()
        return
      }

      if (!productChargeTypeId) {
        res.status(400).json({ message: 'productChargeTypeId is required' })
        next()
        return
      }

      if (!baseRate) {
        res.status(400).json({ message: 'baseRate is required' })
        next()
        return
      }

      let newSiteProductPricing = new SiteProductPricing
      newSiteProductPricing.siteProductId = siteProductId
      newSiteProductPricing.productChargeTypeId = productChargeTypeId
      newSiteProductPricing.baseRate = parseFloat(baseRate)
      newSiteProductPricing.taxRateId = taxRateId
      newSiteProductPricing.optionName = optionName

      await newSiteProductPricing.save()
      res.status(200).json(newSiteProductPricing)
      
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },
  updateProductPricing: async (req, res, next) => {
    try {
      const { siteProductId, taxRateId, productChargeTypeId, baseRate } = req.body
     
      if (!siteProductId) {
        res.status(400).json({ message: 'siteProductId is required' })
        next()
        return
      }

      if (!taxRateId) {
        res.status(400).json({ message: 'taxRateId is required' })
        next()
        return
      }

      if (!productChargeTypeId) {
        res.status(400).json({ message: 'productChargeTypeId is required' })
        next()
        return
      }

      if (!baseRate) {
        res.status(400).json({ message: 'baseRate is required' })
        next()
        return
      }

      let siteProductPricingId = req.params.siteProductPricingId
      req.oldValue = await SiteProductPricing.findOne({ where: { siteProductPricingId: siteProductPricingId } })
      req.tableName = 'dbo.siteProductPricing'
      await SiteProductPricing.update(req.body, { where: { siteProductPricingId: siteProductPricingId } })
      res.status(201).json(req.body)
      req.newValue = await SiteProductPricing.findOne({ where: { siteProductPricingId: siteProductPricingId } })
      next()
      
    } catch (err) {
      res.status(400).json({ message: err.message })
      next()
    }
  },
}

module.exports = siteController

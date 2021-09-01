require('dotenv').config()
const db = require('../db')
const removeDuplicates = require('../helper/removeDuplicates')

const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");
const account = process.env.STORAGE_NAME;
const accountKey = process.env.STORAGE_KEY;
const containerName = process.env.CONTAINER_LICENCE;
const siteLicenceDocumentcontainerName = process.env.CONTAINER_NAME;
const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
const blobServiceClient = new BlobServiceClient(
  `https://${account}.blob.core.windows.net`,
  sharedKeyCredential
);

const Blob = require('node-blob');

const Licence = db.models.licence
const LicenceProduct = db.models.licenceProduct
const LicenceDocument = db.models.licenceDocument
const LicenceType = db.models.licenceType
const Client = db.models.client
const Site = db.models.site
const Export = db.models.export
const ProductChargeType = db.models.productChargeType
const Product = db.models.product
const LicenceZone = db.models.licenceZone
const SiteZone = db.models.siteZone
const ZoneType = db.models.zoneType
const LicenceProductType = db.models.licenceProductType
const ChargeRegister = db.models.chargeRegister
const TaxRate = db.models.taxRate
const LicenceStatusType = db.models.licenceStatusType
const LicenceStatusHistory = db.models.licenceStatusHistory
const User = db.models.user
const SiteLicenceTemplate = db.models.siteLicenceTemplate
const SiteLicenceDocument = db.models.siteLicenceDocument
const SiteLicenceProduct = db.models.siteLicenceProduct
const SiteProductPricing = db.models.siteProductPricing
const SiteProduct = db.models.siteProduct
const DsHistory = db.models.dsHistory

const licenceController = {

  getSiteLicences: async (req, res, next) => {
    try {
      let siteId = req.params.siteId
      const siteLicences = await Licence.findAll({
        where: { siteId: siteId, active: true },
        attributes: ['licenceId', 'licenceTypeId', 'licenceStatusTypeId', 'clientId', 'siteId', 'createDate', 'createdByUserId', 'licenceStart', 'validUntil', 'invoicingDay', 'paymentTermsDaysFromInvoice', 'furnitureNote', 'terminationDate'],
        include: [
          { model: LicenceProduct },
          { model: LicenceDocument },
          { model: LicenceType },
          { model: Client, attributes: ['tradingName', 'clientId'] },
          { model: LicenceZone, include: [{ model: SiteZone, include: [{ model: ZoneType }] }] },
          { model: LicenceStatusType }
        ]
      })   
      siteLicences.forEach(licence => {
        licence.dataValues.licenceProducts = licence.dataValues.licenceProducts.filter(item => { return item.active === true })
      });        
      res.status(201).json(siteLicences)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  getZones: async (req, res, next) => {
    try {
      const siteId = req.params.siteId
      const zones = await SiteZone.findAll({
        where: { siteId: siteId },
        attributes: ['siteZoneId', 'buildingLevel', 'friendlyName', 'squareMeters', 'zoneTypeId', 'exclusive', 'availableForClients', 'workstations'],
        include: [{ model: ZoneType }]
      })
      res.status(201).json(zones)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  getLicence: async (req, res, next) => {
    try {
      let licenceId = req.params.licenceId
      const licence = await Licence.findOne({
        where: { licenceId: licenceId },
        attributes: ['licenceId', 'licenceStatusTypeId', 'createDate', 'createdByUserId', 'licenceStart', 'validUntil', 'notes', 'active', 'invoicingDay', 'paymentTermsDaysFromInvoice', 'furnitureNote', 'clientId', 'siteId', 'licenceTypeId'],
        include: [
          {
            model: LicenceProduct,
            include: [
              { model: TaxRate },
              {
                model: Product,
                include: [
                  { model: ChargeRegister, include: [{ model: TaxRate }] }
                ]
              },
              { model: ProductChargeType },
              { model: LicenceProductType }
            ]
          },
          { model: LicenceDocument },
          { model: LicenceType },
          { model: Client },
          {
            model: LicenceZone,
            include: [
              { model: TaxRate },
              { model: ProductChargeType },
              { model: SiteZone, include: [{ model: ZoneType }] }
            ]
          },
          { model: LicenceStatusType },
        ]
      })

      licence.dataValues.licenceProducts = licence.dataValues.licenceProducts.filter(item => { return item.active === true })

      res.status(201).json(licence)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  getHistory: async (req, res, next) => {
    try {
      let licenceId = req.params.licenceId
      const licenceStatusHistories = await LicenceStatusHistory.findAll({
        where: { licenceId: licenceId },
        attributes: ['timestamp', 'notes'],
        include: [{ model: LicenceStatusType }, { model: User }]
      })

      res.status(201).json(licenceStatusHistories)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  create: async (req, res, next) => {    
    try {
      const { clientId, siteId, licenceTypeId, licenceStatusTypeId, notes, invoicingDay, paymentTermsDaysFromInvoice, furnitureNote, validUntil, licenceStart, siteLicenceTemplateId  } = req.body

      if (!clientId) {
        res.status(400).json({ message: 'clientId is required' })
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

      if (!licenceStatusTypeId) {
        res.status(400).json({ message: 'licenceStatusTypeId is required' })
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

      // create new licence
      let newLicence = new Licence()
      newLicence.licenceTypeId = licenceTypeId
      newLicence.licenceStatusTypeId = licenceStatusTypeId
      newLicence.siteId = siteId
      newLicence.clientId = clientId
      newLicence.createdByUserId = req.user.userId
      newLicence.licenceStart = licenceStart
      newLicence.validUntil = validUntil
      newLicence.notes = notes
      newLicence.furnitureNote = furnitureNote
      newLicence.invoicingDay = invoicingDay
      newLicence.paymentTermsDaysFromInvoice = paymentTermsDaysFromInvoice
      newLicence.active = true
      await newLicence.save()

      //save status history
      let newLicenceStatusHistory = new LicenceStatusHistory()
      newLicenceStatusHistory.licenceId = newLicence.licenceId
      newLicenceStatusHistory.licenceStatusTypeId = licenceStatusTypeId
      newLicenceStatusHistory.timestamp = new Date()
      newLicenceStatusHistory.userId = req.user.userId
      newLicenceStatusHistory.notes = notes
      await newLicenceStatusHistory.save()
      
      let siteLicenceDocuments = []
      let siteLicenceProducts = []
      const siteLicenceTemplate = await SiteLicenceTemplate.findOne({
        where: { siteLicenceTemplateId: siteLicenceTemplateId },
        attributes: ['siteLicenceTemplateId'],
        include: [{ model: Site }, { model: SiteLicenceDocument }, { model: SiteLicenceProduct, include: [{ model: SiteProductPricing, include: [{ model: SiteProduct }] }] }]
      })
      siteLicenceDocuments = siteLicenceTemplate.dataValues.siteLicenceDocuments
      siteLicenceProducts = siteLicenceTemplate.dataValues.siteLicenceProducts
      
      // Save licence Products
      await Promise.all(siteLicenceProducts.map(async(siteLicenceProduct) => {
        let newLicenceProduct = new LicenceProduct()
        newLicenceProduct.licenceId = newLicence.licenceId
        newLicenceProduct.overridePrice = siteLicenceProduct.overridePrice
        newLicenceProduct.paidInAdvance = siteLicenceProduct.paidInAdvance
        newLicenceProduct.taxRateId = siteLicenceProduct.siteProductPricing.taxRateId
        newLicenceProduct.notes = notes
        newLicenceProduct.productChargeTypeId = siteLicenceProduct.siteProductPricing.productChargeTypeId
        newLicenceProduct.productId = siteLicenceProduct.siteProductPricing.siteProduct.productId
        newLicenceProduct.licenceProductTypeId = 2
        newLicenceProduct.active = true
        await newLicenceProduct.save()
        return newLicenceProduct
      }))
      
      // Save licence Documents
      await Promise.all(siteLicenceDocuments.map(async(siteLicenceDocument) => {
        let newLicenceDocument = new LicenceDocument()
        newLicenceDocument.licenceId = newLicence.licenceId
        newLicenceDocument.name = siteLicenceDocument.name
        newLicenceDocument.description = siteLicenceDocument.description
        let title
        if (siteLicenceDocument.docUrl === null) {
          newLicenceDocument.originalDocUrl = null
        } else {
          if ((siteLicenceDocument.docUrl.split(/-/)).length === 4) {
            title = (siteLicenceDocument.docUrl.split(/-/))[2]
            newLicenceDocument.originalDocUrl = 'licence-' + newLicence.licenceId + '-' + title + '-' + new Date().getTime()
          } else {
            newLicenceDocument.originalDocUrl = siteLicenceDocument.docUrl
          }
          // Document Sign
          if (siteLicenceDocument.isDocuSign === true) {
            newLicenceDocument.isDocuSign = true
            await Licence.update(
              { licenceStatusTypeId: 14 },
              { where: { licenceId: newLicence.licenceId } }
            )
            await LicenceStatusHistory.update(
              { licenceStatusTypeId: 14, notes: newLicenceDocument.name },
              { where: { licenceStatusHistoryId: newLicenceStatusHistory.licenceStatusHistoryId } }
            )
            newLicenceDocument.docuSignDocumentRef = siteLicenceDocument.docuSignTemplateRef
            if (!req.signer) {
              req.signer = {
                email: null,
                fullName: null,
                docs: []
              }
              const user = await User.findOne({  where: { userId: req.user.userId }  })
              req.user.fullName = user.fullName
              req.user.email = user.email
              const client = await Client.findOne({  where: { clientId: clientId }  })
              req.signer.fullName = client.tradingName
              req.signer.email = client.email
              req.signer.primaryContact = client.primaryContact
              req.signer.companyName = client.legalName
              req.signer.dsUserId = siteLicenceTemplate.site.dsUserId
              req.signer.dsApiAccountId = siteLicenceTemplate.site.dsApiAccountId
              req.signer.dsIntegrationId = siteLicenceTemplate.site.dsIntegrationId
            }
            req.signer.docs.push({
              templateId: siteLicenceDocument.docuSignTemplateRef,
              newLicenceDocument: newLicenceDocument
            })
          }
        }
        await newLicenceDocument.save()
        //save document in storage
        if (siteLicenceDocument.docUrl) {
          //get blob from storage
          let blobName = siteLicenceDocument.docUrl
          let containerClient = blobServiceClient.getContainerClient(siteLicenceDocumentcontainerName);
          let blockBlobClient = containerClient.getBlockBlobClient(blobName);
          let downloadBlockBlobResponse = await blockBlobClient.download(0);
          let buffer = await licenceController.streamToBuffer(downloadBlockBlobResponse.readableStreamBody)
          siteLicenceDocument.docUrl = buffer.toString()
          //save licence document in storage
          blobName = newLicenceDocument.originalDocUrl;
          containerClient = blobServiceClient.getContainerClient(containerName);
          blockBlobClient = containerClient.getBlockBlobClient(blobName);
          const uploadBlobResponse = await blockBlobClient.upload(siteLicenceDocument.docUrl, Buffer.byteLength(siteLicenceDocument.docUrl));
          console.log(`Upload block blob ${blobName} successfully`, uploadBlobResponse.requestId);
        }        
      }))  
      if (req.signer && req.signer.docs.length > 0) {
        req.signer.newLicence = newLicence
        await req.dsAuth.createEnvelope(req, res, next)
      } else {
        res.status(200).json(newLicence)
      }      

    } catch (err) {
      console.log(err)
      res.status(400).json({ message: err.message })
    }
    next()
  },

  getDsNotifications: async (req, res) => {
    const { status, envelopeId, recipients, createdDateTime, lastModifiedDateTime, statusChangedDateTime } = req.body
    const licenceDocument = await LicenceDocument.findOne({ where: { docuSignDocumentRef: envelopeId } })
    if (licenceDocument) {
      console.log(status, envelopeId, recipients.signers[0].email, statusChangedDateTime)
      const dsHistory = await DsHistory.findOne({ where: { licenceDocumentId: licenceDocument.licenceDocumentId, status: status } })
      if (dsHistory) {
        return
      } else {
        let newDsHistory = new DsHistory()
        newDsHistory.licenceDocumentId = licenceDocument.licenceDocumentId
        newDsHistory.status = status
        newDsHistory.details = envelopeId
        newDsHistory.timestamp = statusChangedDateTime
        await newDsHistory.save()
        return
      }
    } else {
      return
    }
  },

  update: async (req, res, next) => {
    try {
      const licenceId = req.params.licenceId
      req.oldValue = await Licence.findOne({ where: { licenceId: licenceId } })
      req.tableName = 'dbo.licences'
      await Licence.update(req.body, { where: { licenceId: licenceId } })
      //save status history
      let newLicenceStatusHistory = new LicenceStatusHistory()
      newLicenceStatusHistory.licenceId = licenceId
      newLicenceStatusHistory.licenceStatusTypeId = req.body.licenceStatusTypeId
      newLicenceStatusHistory.timestamp = new Date()
      newLicenceStatusHistory.userId = req.user.userId
      newLicenceStatusHistory.notes = req.body.notes
      await newLicenceStatusHistory.save()

      res.status(201).json(req.body)
      req.newValue = await Licence.findOne({ where: { licenceId: licenceId } })
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  terminate: async (req, res, next) => {
    try {
      const { licenceId, terminationDate,  notes } = req.body
      req.oldValue = await Licence.findOne({ where: { licenceId: licenceId } })
      req.tableName = 'dbo.licences'
      await Licence.update({ terminationDate: terminationDate, licenceStatusTypeId: 12 }, { where: { licenceId: licenceId } })
      //save status history
      let newLicenceStatusHistory = new LicenceStatusHistory()
      newLicenceStatusHistory.licenceId = licenceId
      newLicenceStatusHistory.licenceStatusTypeId = 12
      newLicenceStatusHistory.timestamp = new Date()
      newLicenceStatusHistory.userId = req.user.userId
      newLicenceStatusHistory.notes = notes
      await newLicenceStatusHistory.save()

      req.newValue = await Licence.findOne({ where: { licenceId: licenceId } })
      res.status(201).json(req.newValue)

    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  getLicencesbyClient: async (req, res, next) => {
    try {
      let clientId = req.params.clientId
      const licences = await Licence.findAll({
        where: { clientId: clientId },
        attributes: ['licenceId', 'licenceStatusTypeId', 'createDate', 'createdByUserId', 'licenceStart', 'validUntil', 'notes', 'active', 'invoicingDay', 'paymentTermsDaysFromInvoice', 'furnitureNote'],
        include: [{ model: LicenceProduct, include: [{ model: Product }, {model: ProductChargeType}] }, { model: LicenceDocument }, { model: LicenceType }, { model: Client }, { model: Site }]
      })
      licences.forEach(licence => {
        licence.dataValues.licenceProducts = licence.dataValues.licenceProducts.filter(item => { return item.active === true })
      });
      res.status(201).json(licences)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
  },
  
  exportPdf: async (req, res, next) => {
    const { licenceId, content } = req.body
    let blobName
    blobName = 'licence-' + licenceId + '-' + new Date().getTime() + '.pdf';

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const uploadBlobResponse = await blockBlobClient.upload(content, Buffer.byteLength(content));
    console.log(`Upload block blob ${blobName} successfully`, uploadBlobResponse.requestId);
    try {
      let newExport = new Export()

      newExport.licenceId = licenceId
      newExport.docUrl = blobName
      newExport.exportedByUserId = req.user.userId
      newExport.name = blobName

      await newExport.save()

      res.status(200).json(newExport)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }    
    next()
  },

  getLicenceType: async (req, res, next) => {
    const licenceTypes = await LicenceType.findAll({where: {active: true}})
    res.status(201).json(licenceTypes)
    next()
  },

  getLicenceProductType: async (req, res, next) => {
    const licenceProductTypes = await LicenceProductType.findAll()
    res.status(201).json(licenceProductTypes)
    next()
  },

  createLicenceProduct: async (req, res, next) => {
    const { licenceId, productId, productChargeTypeId, notes, overridePrice, paidInAdvance, taxRateId, licenceProductTypeId } = req.body

    if (!licenceId) {
      res.status(400).json({ message: 'licenceId is required' })
      next()
      return
    }

    if (!productId) {
      res.status(400).json({ message: 'productId is required' })
      next()
      return
    }

    if (!licenceProductTypeId) {
      res.status(400).json({ message: 'licenceProductTypeId is required' })
      next()
      return
    }

    if (!productChargeTypeId) {
      res.status(400).json({ message: 'productChargeTypeId is required' })
      next()
      return
    }

    if (!taxRateId) {
      res.status(400).json({ message: 'taxRateId is required' })
      next()
      return
    }

    try {
      let newLicenceProduct = new LicenceProduct()

      newLicenceProduct.licenceId = licenceId
      newLicenceProduct.productId = productId
      newLicenceProduct.productChargeTypeId = productChargeTypeId
      newLicenceProduct.notes = notes
      newLicenceProduct.overridePrice = overridePrice
      newLicenceProduct.taxRateId = taxRateId
      newLicenceProduct.paidInAdvance = paidInAdvance
      newLicenceProduct.licenceProductTypeId = licenceProductTypeId
      newLicenceProduct.active = true

      await newLicenceProduct.save()

      res.status(200).json(newLicenceProduct)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  updateLicenceProduct: async (req, res, next) => {
    try {
      const licenceProductId = req.params.licenceProductId
      req.oldValue = await LicenceProduct.findOne({ where: { licenceProductId: licenceProductId } })
      req.tableName = 'dbo.licenceProducts'
      await LicenceProduct.update(req.body, { where: { licenceProductId: licenceProductId } })

      res.status(201).json(req.body)
      req.newValue = await LicenceProduct.findOne({ where: { licenceProductId: licenceProductId } })
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  getLicenceProductDetail: async (req, res, next) => {
    try {
      const licenceProductId = req.params.licenceProductId
      let licenceProduct = await LicenceProduct.findOne({
        where: { licenceProductId: licenceProductId },
        attributes: ['licenceProductId', 'licenceId', 'overridePrice', 'taxRateId', 'notes', 'paidInAdvance', 'productChargeTypeId', 'productId', 'licenceProductTypeId'],
        include: []
      })
      res.status(201).json(licenceProduct)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  deleteLicenceProduct: async (req, res, next) => {
    try {
      const licenceProductId = req.params.licenceProductId
      req.oldValue = await LicenceProduct.findOne({ where: { licenceProductId: licenceProductId } })
      req.tableName = 'dbo.licenceProducts'
      await LicenceProduct.update(
        { active: false },
        { where: { licenceProductId: licenceProductId } }
      )
      const licenceProduct = await LicenceProduct.findOne({
        where: { licenceProductId: licenceProductId }
      })
      res.status(201).json(licenceProduct);
      req.newValue = licenceProduct
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  createLicenceDocument: async (req, res, next) => {
    const { licenceId, name, description, docUrl } = req.body
    let blobName
    if (docUrl) {
      const {content, title} = docUrl;
      blobName = new Date().getTime() + '-' + title;
  
      const containerClient = blobServiceClient.getContainerClient(containerName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      const uploadBlobResponse = await blockBlobClient.upload(content, Buffer.byteLength(content));
      console.log(`Upload block blob ${blobName} successfully`, uploadBlobResponse.requestId);
  
    }

    if (!licenceId) {
      res.status(400).json({ message: 'licenceId is required' })
      next()
      return
    }

    if (!name) {
      res.status(400).json({ message: 'name is required' })
      next()
      return
    }
    try {
      let newLicenceDocument = new LicenceDocument()

      newLicenceDocument.licenceId = licenceId
      newLicenceDocument.name = name
      newLicenceDocument.description = description
      newLicenceDocument.originalDocUrl = blobName

      await newLicenceDocument.save()

      res.status(200).json(newLicenceDocument)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }    
    next()
  },

  getLicenceDocumentDetail: async (req, res, next) => {
    try {
      const licenceDocumentId = req.params.licenceDocumentId
      let licenceDocument = await LicenceDocument.findOne({
        where: { licenceDocumentId: licenceDocumentId },
        attributes: ['licenceDocumentId', 'licenceId', 'name', 'description', 'originalDocUrl'],
        include: []
      })
      if (licenceDocument.originalDocUrl) {
        let blobName = licenceDocument.originalDocUrl
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const downloadBlockBlobResponse = await blockBlobClient.download(0);
        let buffer = await licenceController.streamToBuffer(downloadBlockBlobResponse.readableStreamBody)
        licenceDocument.originalDocUrl = buffer.toString()
      }
      res.status(201).json(licenceDocument)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
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

  getLicenceZonesByClient: async (req, res, next) => {
    try {
      const siteId = req.params.siteId
      const clientId = req.params.clientId
      const licences = await Licence.findAll({
        where: { siteId: siteId, clientId: clientId, active: true },
        attributes: ['licenceId', 'licenceTypeId', 'licenceStatusTypeId', 'clientId', 'siteId', 'createDate', 'createdByUserId', 'licenceStart', 'validUntil', 'notes', 'active', 'invoicingDay', 'paymentTermsDaysFromInvoice', 'furnitureNote'],
        include: [
          {
            model: LicenceZone,
            include: [
              { model: ProductChargeType },
              { model: SiteZone },
              { model: TaxRate }
            ]
          },
          {
            model: LicenceProduct,
            include: [
              { model: ProductChargeType },
              { model: Product },
              { model: LicenceProductType },
              { model: TaxRate }
            ]
          },
          { model: LicenceType }
        ]
      })      
      res.status(201).json(licences)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  }, 

}

module.exports = licenceController

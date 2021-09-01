require('dotenv').config()
const db = require('../db')
const moment = require('moment');
const Op = require('sequelize').Op;

const fs = require('fs');
const stream = require('stream');
let pdf = require('html-pdf');
var Zip = require('node-zip');
var newZip = new Zip();

const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");
const account = process.env.STORAGE_NAME;
const accountKey = process.env.STORAGE_KEY;
const containerName = process.env.CONTAINER_INVOICE;
const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
const blobServiceClient = new BlobServiceClient(
  `https://${account}.blob.core.windows.net`,
  sharedKeyCredential
);

const Invoice = db.models.invoice
const Client = db.models.client
const Currency = db.models.currency
const Site = db.models.site
const InvoiceStatusType = db.models.invoiceStatusType
const Licence = db.models.licence
const LicenceType = db.models.licenceType
const User = db.models.user
const ChargeRegister = db.models.chargeRegister
const Product = db.models.product
const SiteClient = db.models.siteClient
const LicenceProduct = db.models.licenceProduct
const LicenceZone = db.models.licenceZone
const InvoiceStatusHistory = db.models.invoiceStatusHistory
const Export = db.models.export
const Payment = db.models.payment
const PaymentType = db.models.paymentType
const ProductChargeType = db.models.productChargeType
const TaxRate = db.models.taxRate
const SiteZone = db.models.siteZone
const SiteProductPricing = db.models.siteProductPricing
const Sequelize = require('sequelize')

const invoiceController = {

  getSiteInvoices: async (req, res, next) => {
    try {
      let siteId = req.params.siteId
      const siteInvoices = await Invoice.findAll({
        where: { siteId: siteId },
        attributes: ['invoiceId', 'dateCreated', 'termsDays', 'dueDate', 'notes', 'periodStart', 'periodEnd', 'totalChargesIncTax', 'totaltax'],
        include: [
          { model: Payment, include: [{ model: PaymentType }] },
          { model: Client, attributes: ['tradingName', 'clientId'] },
          { model: InvoiceStatusType },
          { model: Licence, include: [{ model: LicenceType }] },
          {
            model: ChargeRegister,
            include: [{ model: Product }, { model: ProductChargeType }, { model: TaxRate }, { model: SiteZone }]
          },
        ]
      })           
      res.status(201).json(siteInvoices)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  getFilterdInvoices: async (req, res, next) => {
    try {
      const { siteId, selectedOverdue, selectedZone, selectedLicence, selectedLicenceType  } = req.body
      let siteInvoices = await Invoice.findAll({
        where: { siteId: siteId },
        attributes: ['invoiceId', 'dateCreated', 'termsDays', 'dueDate', 'notes', 'periodStart', 'periodEnd', 'totalChargesIncTax', 'totaltax'],
        include: [
          { model: Payment },
          { model: Client },
          { model: Currency },
          { model: Site },
          { model: InvoiceStatusType },
          { model: Licence, include: [{ model: LicenceType }] },
          {
            model: ChargeRegister,
            include: [{ model: Product }, { model: ProductChargeType }, { model: TaxRate }, { model: SiteZone }]
          },
        ]
      })    
      if (selectedOverdue !== 'all') {
        switch(selectedOverdue) {
          case 'overdue':
            siteInvoices = siteInvoices.filter(item => { return getDaysDiffNum(item.dueDate) < 0 })
            break;
          case '7days':
            siteInvoices = siteInvoices.filter(item => { return getDaysDiffNum(item.dueDate) < 7 })
            break;
          case '14days':
            siteInvoices = siteInvoices.filter(item => { return getDaysDiffNum(item.dueDate) < 14 })
            break;
          case '15+days':
            siteInvoices = siteInvoices.filter(item => { return getDaysDiffNum(item.dueDate) >= 14 })
            break;
        }
      }       
      if (selectedZone !== 'all') {
        switch(selectedZone) {
          case 'withZones':
            siteInvoices = siteInvoices.filter(function(invoice) {
              if (invoice.chargeRegisters.length === 0) {
                return false
              } else {
                invoice.chargeRegisters.forEach(item => {
                  if (item.siteZoneId) {
                    invoice.hasZone = true
                    return
                  }
                })
                if (invoice.hasZone === true) {
                  return true
                } else {
                  return false
                }
              }
            })
            break;
          case 'withoutZones':
            siteInvoices = siteInvoices.filter(function(invoice) {
              if (invoice.chargeRegisters.length === 0) {
                return true
              } else {
                invoice.chargeRegisters.forEach(item => {
                  if (item.siteZoneId) {
                    invoice.hasZone = true
                    return
                  }
                })
                if (invoice.hasZone === true) {
                  return false
                } else {
                  return true
                }
              }
            })
            break;
          
        }
      }       
      if (selectedLicence !== 'all') {
        switch(selectedLicence) {
          case 'withLicence':
            siteInvoices = siteInvoices.filter(invoice => { return invoice.licence })
            break;
          case 'withoutLicence':
            siteInvoices = siteInvoices.filter(invoice => { return !invoice.licence })
            break;
        }
      }       
      if (selectedLicenceType !== 'all') {
        siteInvoices = siteInvoices.filter(invoice => { return invoice.licence && invoice.licence.licenceTypeId === parseInt(selectedLicenceType) })
      }       
      res.status(201).json(siteInvoices)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  create: async (req, res, next) => {
    
    try {
      const { clientId, siteId, currencyId, invoiceStatusTypeId, licenceId, termsDays, notes, periodStart, periodEnd, totalChargesIncTax, totaltax  } = req.body

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

      if (!currencyId) {
        res.status(400).json({ message: 'currencyId is required' })
        next()
        return
      }

      if (!invoiceStatusTypeId) {
        res.status(400).json({ message: 'invoiceStatusTypeId is required' })
        next()
        return
      }

      // create invoice
      let newInvoice = new Invoice()
      newInvoice.clientId = clientId
      newInvoice.siteId = siteId
      newInvoice.currencyId = currencyId
      newInvoice.dateCreated = new Date()
      newInvoice.createdByUserId = req.user.userId
      newInvoice.invoiceStatusTypeId = invoiceStatusTypeId
      newInvoice.licenceId = licenceId
      newInvoice.termsDays = termsDays
      newInvoice.dueDate = moment(moment(newInvoice.dateCreated, 'YYYY-MM-DD hh:mm:ss')).add(newInvoice.termsDays, 'days')
      newInvoice.periodStart = periodStart
      newInvoice.periodEnd = periodEnd
      newInvoice.notes = notes
      newInvoice.notes = totalChargesIncTax
      newInvoice.notes = totaltax

      await newInvoice.save()

      // save invoice status history
      let newInvoiceStatusHistory = new InvoiceStatusHistory()
      newInvoiceStatusHistory.invoiceId = newInvoice.invoiceId
      newInvoiceStatusHistory.invoiceStatusTypeId = invoiceStatusTypeId
      newInvoiceStatusHistory.timestamp = new Date()
      newInvoiceStatusHistory.updatedByUserId = req.user.userId
      await newInvoiceStatusHistory.save()
      
      if (licenceId) {
        let licenceZones = []
        let licenceProducts = []
  
        licenceZones = await LicenceZone.findAll({
          where: { licenceId: newInvoice.licenceId, active: true },
          attributes: ['licenceZoneId', 'licenceId', 'siteZoneId', 'productChargeTypeId', 'rate', 'taxRateId', 'startDate', 'notes'],
          include: [{ model: TaxRate }]
        })
        
        licenceProducts = await LicenceProduct.findAll({
          where: { licenceId: newInvoice.licenceId, active: true },
          attributes: ['licenceProductId', 'licenceId', 'overridePrice', 'taxRateId', 'notes', 'paidInAdvance', 'productChargeTypeId', 'productId', 'licenceProductTypeId'],
          include: [{ model: TaxRate }]
        })
        
        await Promise.all(licenceZones.map(async(licenceZone)=>{
          let newChargeRegister = new ChargeRegister()
          newChargeRegister.clientId = newInvoice.clientId
          newChargeRegister.timestamp = new Date()
          newChargeRegister.productId = 1
          newChargeRegister.productChargeTypeId = licenceZone.productChargeTypeId
          newChargeRegister.paidInAdvance = true
          newChargeRegister.rate = licenceZone.rate
          newChargeRegister.quantity = 1
          newChargeRegister.rateTotal = licenceZone.rate * newChargeRegister.quantity
          newChargeRegister.taxRateId = licenceZone.taxRateId
          newChargeRegister.currencyId = newInvoice.currencyId
          newChargeRegister.siteId = newInvoice.siteId
          newChargeRegister.invoiceId = newInvoice.invoiceId
          newChargeRegister.addedToInvoiceTime = newInvoice.dateCreated
          newChargeRegister.notes = licenceZone.notes
          newChargeRegister.addedByUserId = req.user.userId
          newChargeRegister.siteZoneId = licenceZone.siteZoneId
          await newChargeRegister.save()
          
          newInvoice.totaltax += newChargeRegister.rateTotal * licenceZone.taxRate.taxPercentage/100
          newInvoice.totalChargesIncTax += newChargeRegister.rateTotal * (licenceZone.taxRate.taxPercentage/100 + 1)
          return newChargeRegister
          
        }))
        
        await Promise.all(licenceProducts.map(async(licenceProduct)=>{
          let newChargeRegister = new ChargeRegister()
          newChargeRegister.clientId = newInvoice.clientId
          newChargeRegister.timestamp = new Date()
          newChargeRegister.productId = licenceProduct.productId
          newChargeRegister.licenceProductId = licenceProduct.licenceProductId
          newChargeRegister.productChargeTypeId = licenceProduct.productChargeTypeId
          newChargeRegister.paidInAdvance = licenceProduct.paidInAdvance
          newChargeRegister.rate = licenceProduct.overridePrice
          newChargeRegister.quantity = 1
          newChargeRegister.rateTotal = newChargeRegister.rate * newChargeRegister.quantity
          newChargeRegister.taxRateId = licenceProduct.taxRateId
          newChargeRegister.currencyId = newInvoice.currencyId
          newChargeRegister.siteId = newInvoice.siteId
          newChargeRegister.invoiceId = newInvoice.invoiceId
          newChargeRegister.addedToInvoiceTime = newInvoice.dateCreated
          newChargeRegister.notes = licenceProduct.notes
          newChargeRegister.addedByUserId = req.user.userId
          newChargeRegister.siteZoneId = null
          await newChargeRegister.save()
          
          newInvoice.totaltax += newChargeRegister.rateTotal * licenceProduct.taxRate.taxPercentage/100
          newInvoice.totalChargesIncTax += newChargeRegister.rateTotal * (licenceProduct.taxRate.taxPercentage/100 + 1)
          return newChargeRegister
        }))
  
        await Invoice.update(
          { totaltax: newInvoice.totaltax, totalChargesIncTax: newInvoice.totalChargesIncTax },
          { where: { invoiceId: newInvoice.invoiceId } }
        )
      }     

      res.status(200).json(newInvoice)

    } catch (err) {
      console.log(err)
      res.status(400).json({ message: err.message })
    }
    next()
  },

  deleteInvoice: async (req, res, next) => {
    try {
      const invoiceId = req.params.invoiceId
      const invoice = await Invoice.destroy({ where: { invoiceId: invoiceId } })
      await ChargeRegister.destroy({ where: { invoiceId: invoiceId, siteZoneId: {[Op.ne]: null} } })
      await ChargeRegister.update(
        { invoiceId: null },
        { where: { invoiceId: invoiceId } },
      )
      res.status(201).json(invoice)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  getInvoiceDetail: async (req, res, next) => {
    try {
      let invoiceId = req.params.invoiceId
      const invoice = await Invoice.findOne({
        where: { invoiceId: invoiceId },
        attributes: ['invoiceId', 'clientId', 'dateCreated', 'termsDays', 'dueDate', 'notes', 'periodStart', 'periodEnd', 'totalChargesIncTax', 'totaltax'],
        include: [
          {
            model: InvoiceStatusHistory,
            include: [{ model: InvoiceStatusType }, {model: User}]
          },
          { model: Payment, include: [{ model: PaymentType }] },
          { model: Client },
          { model: Currency },
          { model: Site },
          { model: InvoiceStatusType },
          { model: Licence, include: [{ model: LicenceType }] },
          { model: User },
          {
            model: ChargeRegister,
            include: [{ model: Product }, { model: User }, { model: ProductChargeType }, { model: SiteProductPricing }, { model: TaxRate }, { model: SiteZone }]
          }
        ]
      })      
      res.status(201).json(invoice)
    } catch (err) {
      console.log(err)
      res.status(400).json({ message: err.message })
    }
    next()
  },

  generate: async (req, res, next) => {
    try {
      const { outstandingClients, site } = req.body
      let generatedInvoices = []
      await Promise.all(outstandingClients.map(async client => {
        await Promise.all(client.licences.map(async licence => {
          let licenceZones = []
          let licenceProducts = []

          licenceZones = await LicenceZone.findAll({
            where: { licenceId: licence.licenceId, active: true },
            attributes: [
              'licenceZoneId',
              'licenceId',
              'siteZoneId',
              'productChargeTypeId',
              'rate',
              'taxRateId',
              'startDate',
              'notes'
            ],
            include: [{ model: TaxRate }]
          })

          licenceProducts = await LicenceProduct.findAll({
            where: {
              licenceId: licence.licenceId,
              active: true,
              licenceProductTypeId: 2
            },
            attributes: [
              'licenceProductId',
              'licenceId',
              'overridePrice',
              'taxRateId',
              'notes',
              'paidInAdvance',
              'productChargeTypeId',
              'productId',
              'licenceProductTypeId'
            ],
            include: [{ model: TaxRate }]
          })

          if (licenceZones.length > 0 || licenceProducts.length > 0) {
            // create new invoice
            let newInvoice = new Invoice()
            newInvoice.clientId = client.clientId
            newInvoice.siteId = site.siteId
            newInvoice.currencyId = site.currency.currencyId
            newInvoice.dateCreated = new Date()
            newInvoice.createdByUserId = req.user.userId
            newInvoice.invoiceStatusTypeId = 1
            newInvoice.licenceId = licence.licenceId
            newInvoice.termsDays = licence.paymentTermsDaysFromInvoice
            newInvoice.dueDate = moment(moment(newInvoice.dateCreated, 'YYYY-MM-DD hh:mm:ss')).add(newInvoice.termsDays, 'days')
            newInvoice.notes = licence.notes
            newInvoice.totalChargesIncTax = 0
            newInvoice.totaltax = 0

            await newInvoice.save()
            // save invoice status history
            let newInvoiceStatusHistory = new InvoiceStatusHistory()
            newInvoiceStatusHistory.invoiceId = newInvoice.invoiceId
            newInvoiceStatusHistory.invoiceStatusTypeId = 1
            newInvoiceStatusHistory.timestamp = new Date()
            newInvoiceStatusHistory.updatedByUserId = req.user.userId
            await newInvoiceStatusHistory.save()
            // update charge register
            await ChargeRegister.update(
              { invoiceId: newInvoice.invoiceId },
              { where: { clientId: client.clientId } }
            )
            //create charge register for licence zones and products

            await Promise.all(licenceProducts.map(async licenceProduct => {
              let newChargeRegister = new ChargeRegister()
              newChargeRegister.clientId = client.clientId
              newChargeRegister.timestamp = new Date()
              newChargeRegister.productId = licenceProduct.productId
              newChargeRegister.licenceProductId = licenceProduct.licenceProductId
              newChargeRegister.productChargeTypeId = licenceProduct.productChargeTypeId
              newChargeRegister.paidInAdvance = licenceProduct.paidInAdvance
              newChargeRegister.rate = licenceProduct.overridePrice
              newChargeRegister.quantity = 1
              newChargeRegister.rateTotal = newChargeRegister.rate * newChargeRegister.quantity
              newChargeRegister.taxRateId = licenceProduct.taxRateId
              newChargeRegister.currencyId = newInvoice.currencyId
              newChargeRegister.siteId = newInvoice.siteId
              newChargeRegister.invoiceId = newInvoice.invoiceId
              newChargeRegister.addedToInvoiceTime = newInvoice.dateCreated
              newChargeRegister.notes = licenceProduct.notes
              newChargeRegister.addedByUserId = req.user.userId
              newChargeRegister.siteZoneId = null
              newChargeRegister = await newChargeRegister.save()

              newInvoice.totaltax += (newChargeRegister.rateTotal * licenceProduct.taxRate.taxPercentage) / 100
              newInvoice.totalChargesIncTax += newChargeRegister.rateTotal * (licenceProduct.taxRate.taxPercentage / 100 + 1)
              return newChargeRegister
            }));

            await Promise.all(licenceZones.map(async licenceZone => {
              let newChargeRegister = new ChargeRegister()
              newChargeRegister.clientId = client.clientId
              newChargeRegister.timestamp = new Date()
              newChargeRegister.productId = 1
              newChargeRegister.productChargeTypeId = licenceZone.productChargeTypeId
              newChargeRegister.paidInAdvance = true
              newChargeRegister.rate = licenceZone.rate
              newChargeRegister.quantity = 1
              newChargeRegister.rateTotal = licenceZone.rate * newChargeRegister.quantity
              newChargeRegister.taxRateId = licenceZone.taxRateId
              newChargeRegister.currencyId = newInvoice.currencyId
              newChargeRegister.siteId = newInvoice.siteId
              newChargeRegister.invoiceId = newInvoice.invoiceId
              newChargeRegister.addedToInvoiceTime = newInvoice.dateCreated
              newChargeRegister.notes = licenceZone.notes
              newChargeRegister.addedByUserId = req.user.userId
              newChargeRegister.siteZoneId = licenceZone.siteZoneId
              newChargeRegister = await newChargeRegister.save()

              newInvoice.totaltax += (newChargeRegister.rateTotal * licenceZone.taxRate.taxPercentage) / 100
              newInvoice.totalChargesIncTax += newChargeRegister.rateTotal * (licenceZone.taxRate.taxPercentage / 100 + 1)
              return newChargeRegister
            }))

            newInvoice = await Invoice.update(
              {
                totaltax: newInvoice.totaltax,
                totalChargesIncTax: newInvoice.totalChargesIncTax
              },
              { where: { invoiceId: newInvoice.invoiceId } }
            )

            generatedInvoices.push(newInvoice)
          }

          return true
        }))

        return true
      }))
      res.status(201).json(generatedInvoices)
    } catch (err) {
      console.log(err)
      res.status(400).json({ message: err.message })
    }
    next()
  },

  getOutstandingClients: async (req, res, next) => {
    try {
      const siteId = req.params.siteId
      
      const siteClients = await SiteClient.findAll({
        where: { siteId: siteId, active: true },
        attributes: ['siteClientId', 'siteId', 'clientId'],
        include: [
          {
            model: Client,
            include: [
              {
                model: Licence,
                include: [
                  { model: LicenceProduct, include: [{ model: TaxRate }] },
                  { model: LicenceZone, include: [{ model: TaxRate }] }
                ]
              },
              {
                model: ChargeRegister,
                include: [{ model: TaxRate }, { model: Invoice }, { model: Product }, { model: ProductChargeType }]
              }
            ]
          }
        ]
      })
      let clients = []
      siteClients.forEach(siteClient => {
        siteClient.client.chargeRegisters = siteClient.client.chargeRegisters.filter(chargeRegister => { return chargeRegister.invoiceId === null  })
        if (siteClient.client.licences.length > 0 || siteClient.client.chargeRegisters.length > 0) {
          clients.push(siteClient.client)
        }
      })
      
      res.status(201).json(clients)
    } catch (err) {
      console.log(err)
      res.status(400).json({ message: err.message })
    }
    next()
  },

  getOutStandings: async (req, res, next) => {
    try {
      const siteId = req.params.siteId
      const clientId = req.params.clientId
      const chargeRegister = await ChargeRegister.findAll({
        where: { siteId: siteId, clientId: clientId, invoiceId: null },
        attributes: ['chargeRegisterId', 'clientId', 'timestamp', 'productId', 'rate', 'taxRateId', 'currencyId', 'siteId', 'invoiceId', 'addedToInvoiceTime', 'notes', 'addedByUserId', 'siteZoneId', 'quantity', 'rateTotal', 'productChargeTypeId', 'paidInAdvance'],
        include: [{ model: Client }, { model: Currency }, { model: Site }, { model: Product }, { model: TaxRate }]
      })      
      res.status(201).json(chargeRegister)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  exportPdf: async (req, res, next) => {
    const { invoiceId, content, invoiceName } = req.body
    const blobName = invoiceName
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    const uploadBlobResponse = await blockBlobClient.upload(content, Buffer.byteLength(content));
    console.log(`Upload block blob ${blobName} successfully`, uploadBlobResponse.requestId);
    try {
      let newExport = new Export()
      newExport.invoiceId = invoiceId
      newExport.docUrl = blobName
      newExport.exportedByUserId = req.user.userId
      newExport.name = 'invoice-' + invoiceId + '.pdf'
      await newExport.save()

      // save invoice status history
      let newInvoiceStatusHistory = new InvoiceStatusHistory()
      newInvoiceStatusHistory.invoiceId = invoiceId
      newInvoiceStatusHistory.invoiceStatusTypeId = 3
      newInvoiceStatusHistory.timestamp = new Date()
      newInvoiceStatusHistory.updatedByUserId = req.user.userId
      await newInvoiceStatusHistory.save()

      res.status(200).json(newExport)
    } catch (err) {
      console.log(err)
      res.status(400).json({ message: err.message })
    }    
    next()
  },

  downloadPdf: async (req, res, next) => {
    const { invoiceId, content, title } = req.body
    const htmlheader = fs.readFileSync('templates/htmlheader.txt', 'utf8');
    try {
      const data = htmlheader + content + '</body></html>';
      var options = {
        border: {
          top: '0.5in', // default is 0, units: mm, cm, in, px
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        },
        format: "A4",
        filename: title,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 4 },
      };

      let buffer = await new Promise((resolve, reject) => {
        pdf.create(data, options).toBuffer(function(err, buffer){
            if(err){
              reject(err);
            }
            resolve(buffer);
        })
      });

      const contentBase64 = buffer.toString('base64')

      res.status(201).json(contentBase64)

    } catch (err) {
      console.log(err)
      return res.status(400).json({ message: err.message })
    }
    next()
  },

  exportPdfs: async (req, res, next) => {
    const { pdfs } = req.body
    const htmlheader = fs.readFileSync('templates/htmlheader.txt', 'utf8');
    try {
      await Promise.all(pdfs.map(async (item)=>{
        const invoiceId = item.invoiceId
        const content = item.content
        const blobName = item.title

        const data = htmlheader + content + '</body></html>';
        var options = {
          border: {
            top: '0.5in', // default is 0, units: mm, cm, in, px
            right: '0.5in',
            bottom: '0.5in',
            left: '0.5in'
          },
          format: "A4",
          filename: blobName,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 4 },
        };

        let buffer = await new Promise((resolve, reject) => {
          pdf.create(data, options).toBuffer(function(err, buffer){
              if(err){
                reject(err);
              }
              resolve(buffer);
          })
        });

        const bufferContent = buffer.toString('base64')
        newZip.file(blobName, bufferContent, {base64: true});
        
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const uploadBlobResponse = await blockBlobClient.upload(bufferContent, Buffer.byteLength(bufferContent));
        console.log(`Upload block blob ${blobName} successfully`, uploadBlobResponse.requestId);
        
        let newExport = new Export()
        newExport.invoiceId = invoiceId
        newExport.docUrl = blobName
        newExport.exportedByUserId = req.user.userId
        newExport.name = blobName
        await newExport.save()

      }))
      fs.writeFile(`invoices.zip`, newZip.generate({base64: true, compression:'DEFLATE'}), 'binary', function (error) {
        res.download(`invoices.zip`);
      });
    } catch (err) {
      console.log(err)
      return res.status(400).json({ message: err.message })
    }
    next()
  },

  getInvoicesbyClient: async (req, res, next) => {
    try {
      const siteId = req.params.siteId
      const clientId = req.params.clientId
      const invoice = await Invoice.findAll({
        where: { siteId: siteId, clientId: clientId },
        attributes: ['invoiceId', 'clientId', 'siteId', 'currencyId', 'dateCreated', 'invoiceStatusTypeId', 'licenceId', 'termsDays', 'dueDate', 'createdByUserId', 'notes', 'periodStart', 'periodEnd', 'totalChargesIncTax', 'totaltax'],
        include: [{ model: Payment }, { model: ChargeRegister }, { model: InvoiceStatusType }, { model: Currency }, { model: Licence }]
      })      
      res.status(201).json(invoice)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  getAllInvoiceStatusTypes: async (req, res, next) => {
    const invoiceStatusTypes = await InvoiceStatusType.findAll()
    res.status(201).json(invoiceStatusTypes)
    next()
  },
}

function getDaysDiffNum (date) {
  if (date) {
    const start = moment(new Date()).format("YYYY-MM-DD");
    const end = moment(date).format("YYYY-MM-DD");
    let number = (moment(end).diff(moment(start), 'days'))
    return number
  } else {
    return 0
  }
}

module.exports = invoiceController
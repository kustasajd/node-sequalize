require('dotenv').config()
const db = require('../db')
const Op = require('sequelize').Op;
const ChargeRegister = db.models.chargeRegister
const Client = db.models.client
const Product = db.models.product
const TaxRate = db.models.taxRate
const Currency = db.models.currency
const Site = db.models.site
const Invoice = db.models.invoice
const User = db.models.user
const SiteZone = db.models.siteZone
const ProductChargeType = db.models.productChargeType
const InvoiceStatusHistory = db.models.invoiceStatusHistory
const LicenceProduct = db.models.licenceProduct
const RoomReservation = db.models.roomReservation

const chargeController = {

  getCharges: async (req, res, next) => {
    try {
      let siteId = req.params.siteId
      const charges = await ChargeRegister.findAll({
        where: { siteId: siteId },
        attributes: ['chargeRegisterId', 'timestamp', 'rate', 'addedToInvoiceTime', 'notes', 'quantity', 'rateTotal', 'productChargeTypeId'],
        include: [{ model: Client }, { model: Product }, { model: TaxRate }, { model: Currency }, { model: Site }, { model: Invoice }, { model: User }, { model: SiteZone }]
      })
      
      res.status(201).json(charges)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  filter: async (req, res, next) => {
    const { siteId, clientId, productId, isInvoice } = req.body
    let query = {
      siteId: siteId
    }
    if (clientId) query.clientId = clientId
    if (productId) query.productId = productId
    if (isInvoice === "true" || isInvoice === true) {
      query.invoiceId = {[Op.ne]: null}
    } else if (isInvoice === "false" || isInvoice === false) {
      query.invoiceId = null
    }
    try {
      const charges = await ChargeRegister.findAll({
        where: query,
        attributes: ['chargeRegisterId', 'timestamp', 'rate', 'addedToInvoiceTime', 'notes' ,'quantity', 'rateTotal', 'productChargeTypeId', 'licenceProductId', 'siteZoneId', 'clientId'],
        include: [{model: ProductChargeType}, { model: Client, attributes: ['tradingName', 'clientId'] }, { model: Product }, { model: TaxRate }, { model: Invoice }, { model: User, attributes: ['fullName'] }, { model: SiteZone }, { model: LicenceProduct }, { model: RoomReservation }]
      })
      
      res.status(201).json(charges)
    } catch (err) {
      console.log(err)
      res.status(400).json({ message: err.message })
    }
    next()
  },

  create: async (req, res, next) => {
    
    try {
      const { clientId, productId, rate, taxRateId, currencyId, siteId, invoiceId, addedToInvoiceTime, notes, siteZoneId, quantity, rateTotal, productChargeTypeId, timestamp  } = req.body
      if (!clientId) {
        res.status(400).json({ message: 'clientId is required' })
        next()
        return
      }

      if (!productId) {
        res.status(400).json({ message: 'productId is required' })
        next()
        return
      }

      if (!rate) {
        res.status(400).json({ message: 'rate is required' })
        next()
        return
      }

      if (!taxRateId) {
        res.status(400).json({ message: 'taxRateId is required' })
        next()
        return
      }

      if (!currencyId) {
        res.status(400).json({ message: 'currencyId is required' })
        next()
        return
      }

      if (!siteId) {
        res.status(400).json({ message: 'siteId is required' })
        next()
        return
      }

      if (!quantity) {
        res.status(400).json({ message: 'quantity is required' })
        next()
        return
      }

      if (!timestamp) {
        res.status(400).json({ message: 'timestamp is required' })
        next()
        return
      }

      let newChargeRegister = new ChargeRegister()
      newChargeRegister.clientId = clientId
      newChargeRegister.productId = productId
      newChargeRegister.rate = rate
      newChargeRegister.taxRateId = taxRateId
      newChargeRegister.addedByUserId = req.user.userId
      newChargeRegister.currencyId = currencyId
      newChargeRegister.siteId = siteId
      newChargeRegister.invoiceId = invoiceId
      newChargeRegister.addedToInvoiceTime = addedToInvoiceTime
      newChargeRegister.notes = notes
      newChargeRegister.siteZoneId = siteZoneId
      newChargeRegister.quantity = quantity
      newChargeRegister.rateTotal = rateTotal
      newChargeRegister.productChargeTypeId = productChargeTypeId
      newChargeRegister.timestamp = timestamp

      await newChargeRegister.save()

      res.status(201).json(newChargeRegister)

    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  getCharge: async (req, res, next) => {
    try {
      let chargeRegisterId = req.params.chargeRegisterId
      const chargeRegister = await ChargeRegister.findOne({
        where: { chargeRegisterId: chargeRegisterId },
        attributes: ['chargeRegisterId', 'clientId', 'timestamp', 'productId', 'productChargeTypeId', 'paidInAdvance', 'rate', 'quantity', 'rateTotal', 'taxRateId', 'currencyId', 'siteId', 'invoiceId', 'addedToInvoiceTime', 'notes', 'addedByUserId', 'siteZoneId'],
        include: [],
      })
      res.status(201).json(chargeRegister)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  update: async (req, res, next) => {
    try {
      const chargeRegisterId = req.params.chargeRegisterId
      const { invoiceStatusTypeId, invoiceId  } = req.body
      req.oldValue = await ChargeRegister.findOne({ where: { chargeRegisterId: chargeRegisterId } })
      req.tableName = 'dbo.chargeRegister'
      await ChargeRegister.update(req.body, { where: { chargeRegisterId: chargeRegisterId } })

      if (invoiceStatusTypeId && invoiceId) {
        //save status history
        let newInvoiceStatusHistory = new InvoiceStatusHistory()
        newInvoiceStatusHistory.invoiceId = invoiceId
        newInvoiceStatusHistory.invoiceStatusTypeId = invoiceStatusTypeId
        newInvoiceStatusHistory.timestamp = new Date()
        newInvoiceStatusHistory.updatedByUserId = req.user.userId
        await newInvoiceStatusHistory.save()
      }

      res.status(201).json(req.body)
      req.newValue = await ChargeRegister.findOne({ where: { chargeRegisterId: chargeRegisterId } })
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  deleteCharge: async (req, res, next) => {
    try {
      const chargeRegisterId = req.params.chargeRegisterId
      const chargeRegister = await ChargeRegister.destroy({ where: { chargeRegisterId: chargeRegisterId } })

      res.status(201).json(chargeRegister)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },
}

module.exports = chargeController

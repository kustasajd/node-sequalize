require('dotenv').config()
const db = require('../db')
const removeDuplicates = require('../helper/removeDuplicates')
const Payment = db.models.payment
const PaymentType = db.models.paymentType
const Invoice = db.models.invoice
const User = db.models.user
const Client = db.models.client
const Site = db.models.site
const Currency = db.models.currency
const SiteClient = db.models.siteClient

const paymentController = {
  getAllPayments: async (req, res, next) => {
    const siteId = req.params.siteId
    let payments = []
    const siteClients = await SiteClient.findAll({
      where: { siteId: siteId, active: true },
      attributes: ['siteClientId'],
      include: [
        {
          model: Client,
          include: [
            {
              model: Payment,
              include: [
                { model: PaymentType },
                { model: Invoice },
                { model: Client, attributes: ['tradingName', 'clientId'] },
                { model: User, attributes: ['fullName']},
                { model: Currency }
              ]
            }
          ]
        }
      ]
    })
    siteClients.forEach(siteClient => {
      siteClient.dataValues.client.payments.forEach(payment => {
        if (parseInt(payment.siteId) === parseInt(siteId)) {
          payments.push(payment.dataValues)
        }
      })
    })
    payments = removeDuplicates.removeDuplicates(payments, 'paymentId')
    res.status(201).json(payments)
    next()
  },

  create: async (req, res, next) => {
    const { paymentTypeId, invoiceId, amount, siteId, clientId, currencyId } = req.body

    if (!paymentTypeId) {
      res.status(400).json({ message: 'paymentTypeId is required' })
      next()
      return
    }

    if (!amount) {
      res.status(400).json({ message: 'amount is required' })
      next()
      return
    }
    try {
      let newPayment = new Payment()

      newPayment.paymentTypeId = paymentTypeId
      newPayment.invoiceId = invoiceId
      newPayment.amount = amount
      newPayment.siteId = siteId
      newPayment.clientId = clientId
      newPayment.currencyId = currencyId
      newPayment.addedByUserId = req.user.userId
      await newPayment.save()

      res.status(200).json(newPayment)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  getPaymentTypes: async (req, res, next) => {
    const paymentTypes = await PaymentType.findAll()
    res.status(201).json(paymentTypes)
    next()
  }
}

module.exports = paymentController

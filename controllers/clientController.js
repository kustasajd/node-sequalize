require('dotenv').config()
const db = require('../db')
const Client = db.models.client
const Site = db.models.site
const Licence = db.models.licence
const LicenceProduct = db.models.licenceProduct
const LicenceDocument = db.models.licenceDocument
const LicenceType = db.models.licenceType

const SiteClient = db.models.siteClient
const Currency = db.models.currency
const ClientUser = db.models.clientUser

const clientController = {

  getAllClients: async (req, res, next) => {
    try {
      let siteId = req.params.siteId
      let clients = []
      const siteClients = await SiteClient.findAll({
        where: { siteId: siteId, active: true },
        attributes: ['siteClientId', 'siteId', 'clientId'],
        include: [
          { model: Client }
        ]
      })
      siteClients.forEach(client => {
        clients.push(client.dataValues.client)
      });
      res.status(201).json(clients)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  getClient: async (req, res, next) => {
    try {
      let clientId = req.params.clientId
      const client = await Client.findOne({
        where: { clientId: clientId },
        attributes: ['clientId', 'tradingName', 'legalName', 'primaryContact', 'email', 'phone', 'mobile', 'website', 'profilePic', 'abn', 'openingBalance'],
        include: [{ model: Licence, include: [{ model: LicenceProduct }, { model: LicenceDocument }, { model: Site }, { model: LicenceType }] }],
      })
      client.dataValues.licences.forEach(licence => {
        licence.dataValues.licenceProducts = licence.dataValues.licenceProducts.filter(licenceProduct => { return licenceProduct.active === true })
      });
      res.status(201).json(client)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  updateClient: async (req, res, next) => {

    try {
      let clientId = req.params.clientId      

      req.oldValue = await Client.findOne({ where: { clientId: clientId } })
      req.tableName = 'dbo.clients'

      await Client.update(req.body,
        { where: { clientId: clientId } }
      )

      res.status(201).json(req.body)
      req.newValue = await Client.findOne({ where: { clientId: clientId } })
      
    } catch (err) {
      res.status(400).json({ message: err.message })
    }

    next()
  },

  create: async (req, res, next) => {
    try {
      const { tradingName, legalName, primaryContact, email, phone, mobile, website, siteId, abn, openingBalance  } = req.body

      if (!tradingName) {
        res.status(400).json({ message: 'tradingName name is required' })
        next()
        return
      }

      if (!email) {
        res.status(400).json({ message: 'Email is required' })
        next()
        return
      }

      if (!siteId) {
        res.status(400).json({ message: 'siteId is required' })
        next()
        return
      }

      let client = await Client.findOne({ where: { tradingName: tradingName, email: email } })
      if (client) {
        res.status(400).json({ message: 'Client Aleady Exist' })
        next()
        return
      }

      let newClient = new Client()
      newClient.tradingName = tradingName
      newClient.legalName = legalName
      newClient.primaryContact = primaryContact
      newClient.openingBalance = openingBalance
      newClient.email = email
      newClient.phone = phone
      newClient.mobile = mobile
      newClient.website = website
      newClient.profilePic = null
      newClient.abn = abn

      client = await newClient.save()

      let newSiteClient = new SiteClient()
      newSiteClient.siteId = siteId
      newSiteClient.clientId = client.clientId
      newSiteClient.active = true;

      await newSiteClient.save()

      res.status(201).json(newClient)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },  

  getSiteClients: async (req, res, next) => {
    try {
      let clientId = req.params.clientId
      const siteClient = await SiteClient.findAll({
        where: { clientId: clientId, active: true },
        attributes: ['siteClientId', 'clientId', 'active'],
        include: [{ model: Site, include: [{model: Currency}] }]
      })      
      res.status(201).json(siteClient)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },
}

module.exports = clientController

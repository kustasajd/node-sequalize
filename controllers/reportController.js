require('dotenv').config()
const db = require('../db')
const Client = db.models.client
const SiteClient = db.models.siteClient
const Licence = db.models.licence
const LicenceType = db.models.licenceType
const LicenceStatusType = db.models.licenceStatusType
const SiteZone = db.models.siteZone
const LicenceZone = db.models.licenceZone
const TaxRate = db.models.taxRate

const reportController = {

  getClients: async (req, res, next) => {
    try {
      let siteId = req.params.siteId
      let clients = []
      const siteClients = await SiteClient.findAll({
        where: { siteId: siteId, active: true },
        attributes: ['siteClientId', 'siteId', 'clientId'],
        include: [
          { model: Client, attributes: ['tradingName', 'clientId'], include: [{ model: Licence }] }
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

  getLicences: async (req, res, next) => {
    try {
      let siteId = req.params.siteId
      const siteLicences = await Licence.findAll({
        where: { siteId: siteId, active: true },
        attributes: ['licenceId', 'licenceTypeId', 'licenceStatusTypeId', 'clientId', 'siteId', 'createDate', 'createdByUserId', 'licenceStart', 'validUntil', 'invoicingDay', 'paymentTermsDaysFromInvoice', 'furnitureNote', 'terminationDate'],
        include: [
          { model: LicenceType },
          { model: LicenceStatusType }
        ]
      })   
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
        include: [
          { model: LicenceZone, include: [{ model: TaxRate }, { model: Licence }] }
        ]
      })
      zones.forEach(siteZone => {
        siteZone.dataValues.licenceZones = siteZone.dataValues.licenceZones.filter(item => {
          return item.active === true
        })
      });
      res.status(201).json(zones)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

}

module.exports = reportController

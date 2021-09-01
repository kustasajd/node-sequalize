require('dotenv').config()
const db = require('../db')
const SiteZone = db.models.siteZone
const Site = db.models.site
const Client = db.models.client
const ZoneType = db.models.zoneType
const SiteZoneRate = db.models.siteZoneRate
const ProductChargeType = db.models.productChargeType
const Currency = db.models.currency
const LicenceZone = db.models.licenceZone
const Licence = db.models.licence
const TaxRate = db.models.taxRate
const LicenceProduct = db.models.licenceProduct

const zoneController = {

  getZonesBySite: async (req, res, next) => {
    try {
      const siteId = req.params.siteId
      const zones = await SiteZone.findAll({
        where: { siteId: siteId },
        attributes: ['siteZoneId', 'buildingLevel', 'friendlyName', 'squareMeters', 'zoneTypeId', 'exclusive', 'availableForClients', 'workstations'],
        include: [
          { model: Site, attributes: ['siteId', 'brandName'], include: [{ model: Currency }] },
          { model: ZoneType },
          { model: SiteZoneRate, include: [{ model: ProductChargeType }, { model: TaxRate }] },
          { model: LicenceZone, include: [{ model: TaxRate }, { model: Licence, include: [{ model: Client }] }] }
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

  getZone: async (req, res, next) => {
    try {
      let siteZoneId = req.params.siteZoneId
      const zone = await SiteZone.findOne({
        where: { siteZoneId: siteZoneId },
        attributes: ['siteZoneId', 'buildingLevel', 'friendlyName', 'squareMeters', 'zoneTypeId', 'exclusive', 'availableForClients', 'workstations', 'floorplanPolygon', 'floorplanPosition'],
        include: [
          { model: Site, include: [{ model: Currency }] },
          { model: ZoneType },
          { model: SiteZoneRate, include: [{ model: ProductChargeType }, { model: TaxRate }] },
          { model: LicenceZone, include: [{ model: Licence, include: [{ model: Client }] }] }
        ]
      })
      res.status(201).json(zone)
      next()
    } catch (err) {
      res.status(400).json({ message: err.message })
      next()
    }
  },

  updateZone: async (req, res, next) => {

    try {
      let siteZoneId = req.params.siteZoneId      

      req.oldValue = await SiteZone.findOne({ where: { siteZoneId: siteZoneId } })
      req.tableName = 'dbo.siteZones'

      await SiteZone.update(req.body,
        { where: { siteZoneId: siteZoneId } }
      )

      res.status(201).json(req.body)
      req.newValue = await SiteZone.findOne({ where: { siteZoneId: siteZoneId } })
      next()
    } catch (err) {
      res.status(400).json({ message: err.message })
      next()
    }
  },

  getAllZoneTypes: async (req, res, next) => {
    try {
      const zoneTypes = await ZoneType.findAll()
      res.status(201).json(zoneTypes)
    } catch (err) {
      console.log(err)
      res.status(400).json({ message: err.message })
    }
    next()
  },

  create: async (req, res, next) => {
    try {
      
      const { siteId, zoneTypeId, buildingLevel, friendlyName, squareMeters, siteZoneRates, exclusive, availableForClients, workstations } = req.body

      if (!siteId) {
        res.status(400).json({ message: 'siteId is required' })
        next()
        return
      }

      if (!zoneTypeId) {
        res.status(400).json({ message: 'zoneTypeId is required' })
        next()
        return
      }

      if (!workstations) {
        res.status(400).json({ message: 'workstations is required' })
        next()
        return
      }

      let newSiteZone = new SiteZone()

      newSiteZone.siteId = siteId
      newSiteZone.zoneTypeId = zoneTypeId
      newSiteZone.buildingLevel = buildingLevel
      newSiteZone.friendlyName = friendlyName
      newSiteZone.squareMeters = squareMeters
      newSiteZone.exclusive = exclusive
      newSiteZone.availableForClients = availableForClients
      newSiteZone.workstations = workstations
      newSiteZone = await newSiteZone.save()
      
      if (siteZoneRates.length>0) {
        await siteZoneRates.forEach(async(item) => {
          let newSiteZoneRate = new SiteZoneRate();
          newSiteZoneRate.siteZoneId = newSiteZone.siteZoneId
          newSiteZoneRate.productChargeTypeId = item.productChargeType.productChargeTypeId
          newSiteZoneRate.taxRateId = item.taxRate.taxRateId
          newSiteZoneRate.rackRate = item.rackRate
          newSiteZoneRate = await newSiteZoneRate.save()
        });
      }
      res.status(200).json(newSiteZone)
      next()
    } catch (err) {
      res.status(400).json({ message: err.message })
      next()
    }
  },

  createSiteZoneRate: async (req, res, next) => {
    try {
      const { siteZoneId, productChargeTypeId, rackRate, taxRateId } = req.body

      if (!siteZoneId) {
        res.status(400).json({ message: 'siteZoneId is required' })
        next()
        return
      }

      if (!productChargeTypeId) {
        res.status(400).json({ message: 'productChargeTypeId is required' })
        next()
        return
      }

      if (!rackRate) {
        res.status(400).json({ message: 'rackRate is required' })
        next()
        return
      }

      if (!taxRateId) {
        res.status(400).json({ message: 'taxRateId is required' })
        next()
        return
      }

      let newSiteZoneRate = new SiteZoneRate();
      newSiteZoneRate.siteZoneId = siteZoneId
      newSiteZoneRate.productChargeTypeId = productChargeTypeId
      newSiteZoneRate.rackRate = rackRate
      newSiteZoneRate.taxRateId = taxRateId
      newSiteZoneRate = await newSiteZoneRate.save()
      newSiteZoneRate = await SiteZoneRate.findOne({
        where: { siteZoneRateId: newSiteZoneRate.siteZoneRateId },
        attributes: ['siteZoneRateId', 'siteZoneId', 'productChargeTypeId', 'rackRate', 'taxRateId'],
        include: [{ model: ProductChargeType }, { model: TaxRate }]
      })
      res.status(200).json(newSiteZoneRate)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  deleteSiteZoneRate: async (req, res, next) => {
    try {
      const { siteZoneRateId } = req.body

      if (!siteZoneRateId) {
        res.status(400).json({ message: 'siteZoneRateId is required' })
        next()
        return
      }
      await SiteZoneRate.destroy({where: {siteZoneRateId: siteZoneRateId}})
      res.status(200).json(req.body)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  createLicenceZone: async (req, res, next) => {
    try {
      const { siteZoneId, productChargeTypeId, licenceId, rate, notes, taxRateId, isSelected, startDate, securityDepositPrice, securityDepositNote } = req.body

      if (!licenceId) {
        res.status(400).json({ message: 'licenceId is required' })
        next()
        return
      }

      if (!siteZoneId) {
        res.status(400).json({ message: 'siteZoneId is required' })
        next()
        return
      }

      if (!productChargeTypeId) {
        res.status(400).json({ message: 'productChargeTypeId is required' })
        next()
        return
      }

      if (!rate) {
        res.status(400).json({ message: 'rate is required' })
        next()
        return
      }
      let newLicenceZone = new LicenceZone();
      newLicenceZone.licenceId = licenceId
      newLicenceZone.siteZoneId = siteZoneId
      newLicenceZone.productChargeTypeId = productChargeTypeId
      newLicenceZone.rate = rate
      newLicenceZone.taxRateId = taxRateId
      newLicenceZone.notes = notes
      newLicenceZone.active = true
      newLicenceZone.startDate = startDate
      newLicenceZone = await newLicenceZone.save()

      if (isSelected === true) {
        let newLicenceProduct  = new LicenceProduct();
        newLicenceProduct.licenceId = licenceId
        newLicenceProduct.overridePrice = securityDepositPrice
        newLicenceProduct.taxRateId = 1
        newLicenceProduct.notes = securityDepositNote
        newLicenceProduct.paidInAdvance = true
        newLicenceProduct.productChargeTypeId = 1
        newLicenceProduct.productId = 1
        newLicenceProduct.licenceProductTypeId = 3
        newLicenceProduct.active = true
        newLicenceProduct = await newLicenceProduct.save()
      }

      res.status(200).json(newLicenceZone)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  getLicenceZone: async (req, res, next) => {
    try {
      let licenceZoneId = req.params.licenceZoneId
      const licenceZone = await LicenceZone.findOne({
        where: { licenceZoneId: licenceZoneId },
        attributes: ['licenceZoneId', 'licenceId', 'siteZoneId', 'productChargeTypeId', 'rate', 'taxRateId', 'startDate', 'notes'],
        // include: [
          
        // ]
      })
      res.status(201).json(licenceZone)
      next()
    } catch (err) {
      res.status(400).json({ message: err.message })
      next()
    }
  },

  updateLicenceZone: async (req, res, next) => {

    try {
      let licenceZoneId = req.params.licenceZoneId      

      req.oldValue = await LicenceZone.findOne({ where: { licenceZoneId: licenceZoneId } })
      req.tableName = 'dbo.licenceZones'

      await LicenceZone.update(req.body,
        { where: { licenceZoneId: licenceZoneId } }
      )

      res.status(201).json(req.body)
      req.newValue = await LicenceZone.findOne({ where: { licenceZoneId: licenceZoneId } })
      next()
    } catch (err) {
      res.status(400).json({ message: err.message })
      next()
    }
  },

  deleteLicenceZone: async (req, res, next) => {
    try {
      const licenceZoneId = req.params.licenceZoneId
      req.oldValue = await LicenceZone.findOne({ where: { licenceZoneId: licenceZoneId } })
      req.tableName = 'dbo.licenceZones'
      await LicenceZone.update(
        { active: false },
        { where: { licenceZoneId: licenceZoneId } }
      )
      const licenceZone = await LicenceZone.findOne({
        where: { licenceZoneId: licenceZoneId }
      })
      res.status(201).json(licenceZone);
      req.newValue = licenceZone
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },
}

module.exports = zoneController
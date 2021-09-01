require('dotenv').config()
const db = require('../db')

const Site = db.models.site
const SiteZone = db.models.siteZone
const LicenceZone = db.models.licenceZone
const Licence = db.models.licence
const Client = db.models.client
const Currency = db.models.currency

const floorplanController = {
  getSite: async (req, res, next) => {
    try {
      let siteId = req.params.siteId
      const site = await Site.findOne({
        where: { siteId: siteId },
        attributes: ['siteId', 'currencyId', 'brandName', 'floorplanPolygons'],
        include: [{ model: Currency }, { model: SiteZone, include: [{ model: LicenceZone, include: [{ model: Licence, include: [{ model: Client }] }] }] }]
      })
      site.siteZones.forEach(siteZone => {
        siteZone.licenceZones = siteZone.licenceZones.filter(item => { return item.active === true })
      });
      res.status(201).json(site)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  updateSite: async (req, res, next) => {
    let siteId = req.params.siteId
    req.oldValue = await Site.findOne({ where: { siteId: siteId } })
    req.tableName = 'dbo.sites'
    await Site.update(
      { floorplanPolygons: req.body.floorplanPolygons },
      { where: { siteId: siteId } }
    )
    if (req.body.siteZones && req.body.siteZones.length>0) {
      await Promise.all(req.body.siteZones.map(async siteZone => {
        if (siteZone.floorplanPolygon && siteZone.floorplanPosition) {
          await SiteZone.update(
            { floorplanPolygon: siteZone.floorplanPolygon, floorplanPosition: siteZone.floorplanPosition},
            { where: { siteZoneId: siteZone.siteZoneId } }
          )
        }
      }))
    }
    res.status(201).json(req.body)
    req.newValue = await Site.findOne({ where: { siteId: siteId } })
    next()
  },

  updateSitePolygon: async (req, res, next) => {
    let siteId = req.params.siteId
    req.oldValue = await Site.findOne({ where: { siteId: siteId } })
    req.tableName = 'dbo.sites'
    await Site.update(
      { floorplanPolygons: req.body.floorplanPolygons },
      { where: { siteId: siteId } }
    )
    res.status(201).json(req.body.floorplanPolygons)
    req.newValue = await Site.findOne({ where: { siteId: siteId } })
    next()
  }
}

module.exports = floorplanController

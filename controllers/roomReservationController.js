require('dotenv').config()
const db = require('../db')
const moment = require('moment');
const RoomReservation = db.models.roomReservation
const SiteZone = db.models.siteZone
const Client = db.models.client
const TaxRate = db.models.taxRate
const ChargeRegister = db.models.chargeRegister
const Site = db.models.site
const ZoneType = db.models.zoneType
const ProductChargeType = db.models.productChargeType
const Product = db.models.product
const SiteZoneRate = db.models.siteZoneRate
const Currency = db.models.currency


const roomReservationController = {

  getAll: async (req, res, next) => {
    try {
      const siteId = req.params.siteId  
      const roomReservations = await RoomReservation.findAll({
        attributes: ['roomReservationId', 'siteZoneId', 'clientId', 'timeStart', 'timeEnd', 'addedByUserId', 'addedTime', 'chargeRegisterId'],
        include: [{ model: SiteZone, where: {siteId: siteId}, include: [{ model: ZoneType }] }, { model: Client, attributes: ['clientId', 'tradingName'] }, { model: ChargeRegister }]
      })
      res.status(201).json(roomReservations)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  getDetail: async (req, res, next) => {
    try {
      const roomReservationId = req.params.roomReservationId
      const roomReservation = await RoomReservation.findOne({
        where: { roomReservationId: roomReservationId },
        attributes: ['roomReservationId', 'siteZoneId', 'clientId', 'timeStart', 'timeEnd', 'addedByUserId', 'addedTime', 'chargeRegisterId'],
        include: [{ model: SiteZone, include: [{ model: Site, attributes: ['brandName'] }] }, { model: Client, attributes: ['clientId', 'tradingName'] }, { model: ChargeRegister, include: [{ model: ProductChargeType }, { model: Product }] }]
      })
      res.status(201).json(roomReservation)
    } catch (err) {
      console.log(err)
      res.status(400).json({ message: err.message })
    }
    next()
  },

  update: async (req, res, next) => {

    try {
      const roomReservationId = req.params.roomReservationId      
      const { siteZoneId, clientId, timeStart, timeEnd, productChargeTypeId, quantity, rateTotal, productId, taxRateId, chargeRegisterId  } = req.body
      req.oldValue = await RoomReservation.findOne({ where: { roomReservationId: roomReservationId } })
      req.tableName = 'dbo.roomReservations'

      await ChargeRegister.update({
        clientId: clientId,
        productId: productId,
        rate: rateTotal/quantity,
        taxRateId: taxRateId,
        siteZoneId: siteZoneId,
        quantity: quantity,
        rateTotal: rateTotal,
        productChargeTypeId: productChargeTypeId,
        timestamp: new Date()
      },
        { where: { chargeRegisterId: chargeRegisterId } }
      )


      await RoomReservation.update({
        siteZoneId: siteZoneId,
        clientId: clientId,
        timeStart: timeStart,
        timeEnd: timeEnd,
        chargeRegisterId: chargeRegisterId,
        addedByUserId: req.user.userId
      },
        { where: { roomReservationId: roomReservationId } }
      )

      res.status(201).json(req.body)
      req.newValue = await RoomReservation.findOne({ where: { roomReservationId: roomReservationId } })
      
    } catch (err) {
      console.log(err)
      res.status(400).json({ message: err.message })
    }

    next()
  },

  updateTime: async (req, res, next) => {
    try {
      const roomReservationId = req.params.roomReservationId      
      const { timeStart, timeEnd  } = req.body
      req.oldValue = await RoomReservation.findOne({ where: { roomReservationId: roomReservationId } })
      req.tableName = 'dbo.roomReservations'
      await RoomReservation.update({
        timeStart: timeStart,
        timeEnd: timeEnd
      },
        { where: { roomReservationId: roomReservationId } }
      )
      let startTime = new Date(timeStart)
      let endTime = new Date(timeEnd)
      let diffMins = moment(endTime, 'HH').diff(moment(startTime, 'HH'), "minutes");
      startTime = new Date(req.oldValue.timeStart)
      endTime = new Date(req.oldValue.timeEnd)
      const oldDiffMins = moment(endTime, 'HH').diff(moment(startTime, 'HH'), "minutes");
      if (diffMins !== oldDiffMins) {
        const roomReservation = await RoomReservation.findOne({
          where: { roomReservationId: roomReservationId },
          attributes: ['roomReservationId', 'siteZoneId', 'clientId', 'timeStart', 'timeEnd', 'addedByUserId', 'addedTime', 'chargeRegisterId'],
          include: [{ model: ChargeRegister }]
        })
        quantity = diffMins/60
        await ChargeRegister.update({
          quantity: quantity,
          rateTotal: roomReservation.chargeRegister.rate * quantity
        },
          { where: { chargeRegisterId: roomReservation.chargeRegister.chargeRegisterId } }
        )
      }
      req.newValue = await RoomReservation.findOne({ where: { roomReservationId: roomReservationId } })
      res.status(201).json(req.newValue)
    } catch (err) {
      console.log(err)
      res.status(400).json({ message: err.message })
    }
    next()
  },

  create: async (req, res, next) => {
    try {
      const { siteZoneId, clientId, timeStart, timeEnd, productChargeTypeId, siteId, currencyId, quantity, rateTotal, productId, taxRateId  } = req.body

      if (!siteZoneId) {
        res.status(400).json({ message: 'siteZoneId is required' })
        next()
        return
      }

      if (!clientId) {
        res.status(400).json({ message: 'clientId is required' })
        next()
        return
      }

      if (!timeStart) {
        res.status(400).json({ message: 'timeStart is required' })
        next()
        return
      }

      if (!timeEnd) {
        res.status(400).json({ message: 'timeEnd is required' })
        next()
        return
      }

      let newChargeRegister = new ChargeRegister()
      newChargeRegister.clientId = clientId
      newChargeRegister.productId = productId
      newChargeRegister.rate = rateTotal/quantity
      newChargeRegister.taxRateId = taxRateId
      newChargeRegister.addedByUserId = req.user.userId
      newChargeRegister.currencyId = currencyId
      newChargeRegister.siteId = siteId
      newChargeRegister.invoiceId = null
      newChargeRegister.addedToInvoiceTime = null
      newChargeRegister.notes = null
      newChargeRegister.siteZoneId = siteZoneId
      newChargeRegister.quantity = quantity
      newChargeRegister.rateTotal = rateTotal
      newChargeRegister.productChargeTypeId = productChargeTypeId
      newChargeRegister.timestamp = new Date()

      newChargeRegister = await newChargeRegister.save()      

      let newRoomReservation = new RoomReservation()
      newRoomReservation.siteZoneId = siteZoneId
      newRoomReservation.clientId = clientId
      newRoomReservation.timeStart = timeStart
      newRoomReservation.timeEnd = timeEnd
      newRoomReservation.addedTime = new Date()
      newRoomReservation.chargeRegisterId = newChargeRegister.chargeRegisterId
      newRoomReservation.addedByUserId = req.user.userId

      newRoomReservation = await newRoomReservation.save()

      res.status(201).json(newRoomReservation)
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
          { model: Site, attributes: ['currencyId', 'brandName'], include: [{ model: Currency }] },
          { model: SiteZoneRate, include: [{ model: ProductChargeType }, { model: TaxRate }] },
          { model: ZoneType }
        ]
      })
      res.status(201).json(zones)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },
}

module.exports = roomReservationController

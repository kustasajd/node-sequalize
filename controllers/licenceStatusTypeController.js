require('dotenv').config()
const db = require('../db')
const LicenceStatusType = db.models.licenceStatusType

const licenceStatusTypeController = {

  getLicenceStatusType: async (req, res, next) => {
    const licenceStatusTypes = await LicenceStatusType.findAll()
    res.status(201).json(licenceStatusTypes)
    next()
  }

}

module.exports = licenceStatusTypeController

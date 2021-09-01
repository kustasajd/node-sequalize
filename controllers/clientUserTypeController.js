require('dotenv').config()
const db = require('../db')
const ClientUserType = db.models.clientUserType

const clientUserTypeController = {

  getAllclientUserTypes: async (req, res, next) => {
    const clientUserTypes = await ClientUserType.findAll()
    res.status(201).json(clientUserTypes)
    next()
  },

}

module.exports = clientUserTypeController

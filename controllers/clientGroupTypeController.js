require('dotenv').config()
const db = require('../db')
const ClientGroupType = db.models.clientGroupType

const clientGroupTypeController = {

  getAllClientGroupTypes: async (req, res, next) => {
    const clientGroupTypes = await ClientGroupType.findAll()
    res.status(201).json(clientGroupTypes)
    next()
  },

}

module.exports = clientGroupTypeController

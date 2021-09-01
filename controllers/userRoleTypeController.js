require('dotenv').config()
const db = require('../db')

const UserRoleType = db.models.userRoleType

const userRoleTypeController = {

  getAllUserRoleTypes: async (req, res, next) => {
    const userRoleTypes = await UserRoleType.findAll()
    res.status(201).json(userRoleTypes)
    next()
  },

}

module.exports = userRoleTypeController

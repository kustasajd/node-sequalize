require('dotenv').config()
const db = require('../db')
const ProductChargeType = db.models.productChargeType

const productChargeTypeController = {

  getAllProductChargeTypes: async (req, res, next) => {
    const productChargeTypes = await ProductChargeType.findAll()
    res.status(201).json(productChargeTypes)
    next()
  },

}

module.exports = productChargeTypeController

require('dotenv').config()
const db = require('../db')
const TaxRate = db.models.taxRate

const taxRateController = {

  getAlltaxRates: async (req, res, next) => {
    const taxRates = await TaxRate.findAll()
    res.status(201).json(taxRates)
    next()
  },

}

module.exports = taxRateController

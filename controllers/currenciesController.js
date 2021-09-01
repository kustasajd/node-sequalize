require('dotenv').config()
const db = require('../db')
const Currency = db.models.currency

const currencyController = {

  getAllCurrencies: async (req, res, next) => {
    const currencies = await Currency.findAll()
    res.status(201).json(currencies)
    next()
  },

}

module.exports = currencyController

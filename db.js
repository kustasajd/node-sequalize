require('dotenv').config()
const debug = require('util').debuglog('dbimport')

const models = require(__dirname + '/models')
const Sequelize = require('sequelize')

Sequelize.DATE.prototype._stringify = function _stringify(date, options) {
  date = this._applyTimezone(date, options);

  // Z here means current timezone, _not_ UTC
  // return date.format('YYYY-MM-DD HH:mm:ss.SSS Z');
  return date.format('YYYY-MM-DD HH:mm:ss.SSS');
};

const db = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'mssql',
  logging: false,
  dialectOptions: {
    useUTC: false //for reading from database
  },
})

let model

for (var modelName in models) {
  debug('Importing model "%s" from location "%s"', modelName, models[modelName])
  model = require(models[modelName])(db, Sequelize) //db.import(models[modelName]);

  db.models[model.name] = model
}

for (model in db.models) {
  debug('Defining associations for model "%s" (%s)', model, db.models[model])
  if (typeof db.models[model].associate === 'function') {
    db.models[model].associate(db.models)
  }
}

module.exports = db

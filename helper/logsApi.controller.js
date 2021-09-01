const db = require('../db')
const LogsApi = db.models.logsApi
const LogsChange = db.models.logsChange
const moment = require('moment')

module.exports = {
  startlogsApi: (req, res, next) => {
    req.startTime = new Date()
    next()
  },

  endlogsApi: async (req, res, next) => {
    let newLogsApi = new LogsApi()
    newLogsApi.path = req.baseUrl + req.path
    newLogsApi.resStatusCode = res.statusCode
    newLogsApi.method = req.method
    newLogsApi.resTime = new Date() - req.startTime
    newLogsApi.userId = req.user && req.user.userId ? req.user.userId : null

    await newLogsApi.save()
  },

  logsApi: async (req, res, next) => {
    let newLogsApi = new LogsApi()
    newLogsApi.path = req.baseUrl + req.path
    newLogsApi.resStatusCode = res.statusCode
    newLogsApi.method = req.method
    newLogsApi.resTime = new Date() - req.startTime
    newLogsApi.userId = req.user && req.user.userId ? req.user.userId : null

    await newLogsApi.save()
    next()
  },

  logsChange: async (req, res, next) => {
    if (res.statusCode === 201 || res.statusCode === 200) {
      const oldValue = Object.entries(
        req.oldValue.dataValues ? req.oldValue.dataValues : req.oldValue
      )
      const newValue = Object.entries(
        req.newValue.dataValues ? req.newValue.dataValues : req.newValue
      )
      const keys = Object.keys(newValue)
      let changedFields = []
      keys.forEach((key, i) => {
        if (
          oldValue[i][1] instanceof Date &&
          !isNaN(oldValue[i][1].valueOf()) &&
          newValue[i][1] instanceof Date &&
          !isNaN(newValue[i][1].valueOf())
        ) {
          if (
            moment(oldValue[i][1]).format('YYYY-MM-DD hh:mm:ss') !==
            moment(newValue[i][1]).format('YYYY-MM-DD hh:mm:ss')
          ) {
            changedFields.push(oldValue[i])
          }
        } else {
          if (oldValue[i][1] !== newValue[i][1]) changedFields.push(oldValue[i])
        }
      })
      if (changedFields.length > 0) {
        changedFields.forEach(async item => {
          let newLogsChange = new LogsChange()
          newLogsChange.tableName = req.tableName
          newLogsChange.referenceId = oldValue[0][1]
          newLogsChange.columnName = item[0]
          newLogsChange.changedByUserId =
            req.user && req.user.userId ? req.user.userId : null

          if (item[1] instanceof Date && !isNaN(item[1].valueOf())) {
            newLogsChange.oldValue = moment(item[1]).format(
              'YYYY-MM-DD hh:mm:ss'
            )
          } else {
            newLogsChange.oldValue = item[1] ? item[1].toString() : null
          }
          await newLogsChange.save()
        })
      }
    }
  }
}

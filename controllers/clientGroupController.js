require('dotenv').config()
const db = require('../db')
const ClientGroup = db.models.clientGroup
const ClientGroupType = db.models.clientGroupType
const User = db.models.user

const clientGroupController = {

  create: async (req, res, next) => {
    try {
      const { clientGroupTypeId, clientId } = req.body

      if (!clientGroupTypeId) {
        res.status(400).json({ message: 'clientGroupTypeId is required' })
        next()
        return
      }

      if (!clientId) {
        res.status(400).json({ message: 'clientId is required' })
        next()
        return
      }

      const clientGroup = await ClientGroup.findOne({ where: { clientGroupTypeId: clientGroupTypeId, clientId: clientId, active: true } })
      if (clientGroup) {
        res.status(400).json({ message: 'Aleady Exist' })
        next()
        return
      } else {
        let newClientGroup = new ClientGroup()
        newClientGroup.clientGroupTypeId = clientGroupTypeId
        newClientGroup.clientId = clientId
        newClientGroup.addedByUserId = req.user.userId
        newClientGroup.active = true
  
        await newClientGroup.save()
  
        res.status(200).json({
          clientGroup: newClientGroup
        })
      }      
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  getClientGroups: async (req, res, next) => {
    try {
      let clientId = req.params.clientId
      const clientGroups = await ClientGroup.findAll({
        where: { clientId: clientId, active: true },
        attributes: ['clientGroupId', 'clientGroupTypeId', 'clientId', 'addedByUserId', 'active', 'dateAdded'],
        include: [{ model: ClientGroupType }, { model: User }]
      })   
      res.status(201).json(clientGroups)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },
  
  delete: async function (req, res, next) {
    const { clientGroupTypeId, clientId } = req.body
    if (!clientGroupTypeId) {
      res.status(400).json({ message: 'clientGroupTypeId is required' })
      next()
      return
    }
    if (!clientId) {
      res.status(400).json({ message: 'clientId is required' })
      next()
      return
    }
    try {
      req.oldValue = await ClientGroup.findOne({ where: { clientGroupTypeId: clientGroupTypeId, clientId: clientId } })
      req.tableName = 'dbo.clientGroups'
      await ClientGroup.update(
        { active: false },
        { where: { clientGroupTypeId: clientGroupTypeId, clientId: clientId } }
      )
      const clientGroup = await ClientGroup.findOne({
        where: { clientGroupTypeId: clientGroupTypeId, clientId: clientId }
      })
      res.status(201).json(clientGroup);
      req.newValue = clientGroup
    } catch (err) {
      res.status(400).json({
        message: err.message
      });
    }
    next()
  }
}

module.exports = clientGroupController

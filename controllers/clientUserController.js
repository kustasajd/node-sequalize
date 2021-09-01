require('dotenv').config()
const db = require('../db')
const ClientUser = db.models.clientUser
const User = db.models.user
const ClientUserType = db.models.clientUserType

const clientUserController = {

  create: async (req, res, next) => {
    
    try {
      const { clientUserTypeId, clientId, email, fullName, notes } = req.body
      
      if (!email) {
        res.status(400).json({ message: 'email is required' })
        next()
        return
      }

      if (!clientId) {
        res.status(400).json({ message: 'clientId is required' })
        next()
        return
      }

      if (!clientUserTypeId) {
        res.status(400).json({ message: 'clientUserTypeId is required' })
        next()
        return
      }

      let user = await User.findOne({ where: { email: email } })
      if (user) {
        res.status(400).json({ message: 'User already exists with that email address' })
        next()
        return
      }

      let newUser = new User()
      newUser.fullName = fullName
      newUser.email = email

      user = await newUser.save()

      let newClientUser = new ClientUser()
      newClientUser.clientUserTypeId = clientUserTypeId
      newClientUser.userId = user.userId
      newClientUser.clientId = clientId
      newClientUser.addedByUserId = req.user.userId
      newClientUser.active = true
      newClientUser.notes = notes

      const clientUser = await newClientUser.save()

      res.status(201).json(clientUser)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  getClientUsers: async (req, res, next) => {
    try {
      let clientId = req.params.clientId
      const clientUsers = await ClientUser.findAll({
        where: { clientId: clientId, active: true },
        attributes: ['clientUserId', 'clientUserTypeId', 'clientId', 'addedByUserId', 'dateAdded', 'userId', 'notes'],
        include: [{ model: User }, {model: ClientUserType}]
      })
      await Promise.all(clientUsers.map(async user => {
        user.dataValues.addedByUser = await User.findOne({
          where: { userId: user.addedByUserId }
        })
      }))
      res.status(201).json(clientUsers)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },
  delete: async function (req, res, next) {
    const { userId, clientId } = req.body
    if (!userId) {
      res.status(400).json({ message: 'userId is required' })
      next()
      return
    }
    if (!clientId) {
      res.status(400).json({ message: 'clientId is required' })
      next()
      return
    }
    try {
      req.oldValue = await ClientUser.findOne({ where: { userId: userId, clientId: clientId } })
      req.tableName = 'dbo.clientUsers'
      await ClientUser.update(
        { active: false },
        { where: { userId: userId, clientId: clientId } }
      )
      const clientUser = await ClientUser.findOne({
        where: { userId: userId, clientId: clientId }
      })
      res.status(201).json(clientUser);
      req.newValue = clientUser
    } catch (err) {
      res.status(400).json({
        message: err.message
      });
    }
    next()
  }
}

module.exports = clientUserController

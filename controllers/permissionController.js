require('dotenv').config()
const db = require('../db')
const Permission = db.models.permission
const UserRolePermission = db.models.userRolePermission
const UserRoleType = db.models.userRoleType

const permissionController = {

  getAllPermissions: async (req, res, next) => {
    const permissions = await Permission.findAll(
      {
        attributes: ['permissionId', 'name'],
        include: [{ model: UserRolePermission, include: [{ model: UserRoleType }] }],
        where: {}
      }
    )
    res.status(201).json(permissions)
    next()
  },

  getPermission: async (req, res, next) => {
    try {
      const permissionId = req.params.permissionId
      const permission = await Permission.findOne(
        {
          attributes: ['permissionId', 'name'],
          include: [{ model: UserRolePermission, include: [{ model: UserRoleType }] }],
          where: { permissionId: permissionId }
        }
      )

      res.status(201).json(permission)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  addUserRolePermission: async (req, res, next) => {
    const { permissionId, userRoleTypeId } = req.body

    if (!permissionId) {
      res.status(400).json({ message: 'permissionId is required' })
      next()
      return
    }

    if (!userRoleTypeId) {
      res.status(400).json({ message: 'userRoleTypeId is required' })
      next()
      return
    }

    const userRolePermission = await UserRolePermission.findOne({ where: { permissionId: permissionId, userRoleTypeId: userRoleTypeId } })
    if (userRolePermission) {
      res.status(400).json({ message: 'UserRolePermission Aleady Exist' })
      next()
      return
    }

    let newUserRolePermission = new UserRolePermission()

    newUserRolePermission.permissionId = permissionId
    newUserRolePermission.userRoleTypeId = userRoleTypeId

    newUserRolePermission = await newUserRolePermission.save()

    newUserRolePermission = await UserRolePermission.findOne(
      {
        attributes: ['userRolePermissionId', 'userRoleTypeId', 'permissionId'],
        include: [{ model: UserRoleType }, { model: Permission }],
        where: { userRolePermissionId: newUserRolePermission.userRolePermissionId }
      }
    )

    res.status(200).json(newUserRolePermission)
    next()
  },

  deleteUserRolePermission: async (req, res, next) => {
    try {
      const userRolePermissionId = req.params.userRolePermissionId
      const userRolePermission = await UserRolePermission.destroy({ where: { userRolePermissionId: userRolePermissionId } })

      res.status(201).json(userRolePermission)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

}

module.exports = permissionController

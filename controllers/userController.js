require('dotenv').config()
const db = require('../db')
const DATABASE_URL = process.env.DATABASE_URL
const User = db.models.user
const SiteUser = db.models.siteUser
const ClientUser = db.models.clientUser
const Site = db.models.site
const UserRoleType = db.models.userRoleType
const Currency = db.models.currency
const Permission = db.models.permission
const UserRolePermission = db.models.userRolePermission
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const accessTokenSecret = process.env.accessTokenSecret

const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");

const account = process.env.STORAGE_NAME;
const accountKey = process.env.STORAGE_KEY;
const containerProfileImageName = process.env.CONTAINER_PROFILE_IMAGE;

const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);
const blobServiceClient = new BlobServiceClient(
  `https://${account}.blob.core.windows.net`,
  sharedKeyCredential
);

const userController = {
  authenticate: async (req, res, next) => {
    try {
      const { email, password, lastLogin } = req.body
      let user = await User.findOne({ where: { email: email } })
      if (!user) {
        res.status(400).json({ message: 'User Not Found' })
        next()
        return
      }

      req.oldValue = user
      req.tableName = 'dbo.users'
      await User.update({lastLogin: new Date(lastLogin)},
        { where: { userId: user.userId } }
      )
      
      req.newValue = await User.findOne({ where: { userId: user.userId } })

      if (bcrypt.compareSync(password, user.password)) {
        // Passwords match
        const accessToken = jwt.sign(
          { userId: user.userId }, 
          accessTokenSecret, 
          {
            expiresIn: '2d' // expires in 2 days
          }
        )
        user = await User.findOne(
        {
          where: { email: email },
          attributes: ['userId', 'fullName', 'email', 'profilePic', 'profileImg', 'position', 'lastLogin'],
          include: [{ model: SiteUser, where: {active: true}, include: [{ model: Site, include: [{ model: Currency }] }, { model: UserRoleType, include: [{ model: UserRolePermission, include: [{ model: Permission }] }] }] }]
        })
        if (user.profileImg) {
          let blobName = user.profileImg
          const containerClient = blobServiceClient.getContainerClient(containerProfileImageName);
          const blockBlobClient = containerClient.getBlockBlobClient(blobName);
          const downloadBlockBlobResponse = await blockBlobClient.download(0);
          let buffer = await userController.streamToBuffer(downloadBlockBlobResponse.readableStreamBody)
          user.profileImg = buffer.toString()
        }
        if (user.siteUsers.length === 1 && user.siteUsers[0].site.logoUrl) {
          let blobName = user.siteUsers[0].site.logoUrl
          const containerClient = blobServiceClient.getContainerClient(containerProfileImageName);
          const blockBlobClient = containerClient.getBlockBlobClient(blobName);
          
          const downloadBlockBlobResponse = await blockBlobClient.download(0);
          let buffer = await userController.streamToBuffer(downloadBlockBlobResponse.readableStreamBody)
          if (buffer.toString('base64').includes("data:image/")) {
            user.siteUsers[0].site.logoUrl = buffer.toString('base64')
          } else {
            user.siteUsers[0].site.logoUrl = `data:image/png;base64,${buffer.toString('base64')}`
          }
        }
        const isTestDB = DATABASE_URL.includes('akara_staging')
        res.status(200).json({
          token: accessToken,
          user,
          isTestDB
        })
        
      } else {
        // Passwords don't match
        res.status(400).json({ message: 'Email or password incorrect' })
      }
    } catch (err) {
      console.log(err)
      res.status(400).json({ message: err.message })
    }
    next()
  },

  streamToBuffer: async(readableStream) => {
    return new Promise((resolve, reject) => {
      const chunks = [];
      readableStream.on("data", (data) => {
        chunks.push(data instanceof Buffer ? data : Buffer.from(data));
      });
      readableStream.on("end", () => {
        resolve(Buffer.concat(chunks));
      });
      readableStream.on("error", reject);
    });
  },

  getAllUsers: async (req, res, next) => {
    try {
      let siteId = req.params.siteId
      const siteUsers = await SiteUser.findAll({
        where: { siteId: siteId, active: true },
        attributes: ['siteUserId', 'userId'],
        include: [{ model: User, attributes: ['userId', 'fullName'] }, { model: UserRoleType }]
      })
      let users = []
      siteUsers.forEach(siteUser => {
        if (siteUser.user) users.push(siteUser)
      })
      res.status(201).json(users)
      next()
    } catch (err) {
      res.status(400).json({ message: err.message })
      next()
    }
  },

  getUser: async (req, res, next) => {
    try {
      let userId = req.params.userId
      const user = await User.findOne({  where: { userId: userId }  })
      if (user.profileImg) {
        let blobName = user.profileImg
        const containerClient = blobServiceClient.getContainerClient(containerProfileImageName);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        
        const downloadBlockBlobResponse = await blockBlobClient.download(0);
        let buffer = await userController.streamToBuffer(downloadBlockBlobResponse.readableStreamBody)
        user.profileImg = buffer.toString()
      }
      res.status(201).json(user)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  updateUser: async (req, res, next) => {
    const { profileImg } = req.body
    let blobName
    if (profileImg) {
      const content = profileImg;
      blobName = new Date().getTime() + '.png';
      req.body.profileImg = blobName
      const containerClient = blobServiceClient.getContainerClient(containerProfileImageName);
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.upload(content, Buffer.byteLength(content));
    }
    try {
      let userId = req.params.userId
      req.oldValue = await User.findOne({ where: { userId: userId } })
      req.tableName = 'dbo.users'
      await User.update(req.body,
        { where: { userId: userId } }
      )
      if (profileImg) req.body.profileImg = profileImg
      res.status(201).json(req.body)
      req.newValue = await User.findOne({ where: { userId: userId } })
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  create: async (req, res, next) => {
    try {
      const { fullName, profilePic, email, password, siteId, userRoleTypeId, clientUserTypeId, clientId } = req.body

      if (!fullName) {
        res.status(400).json({ message: 'fullName name is required' })
        next()
        return
      }

      if (!email) {
        res.status(400).json({ message: 'Email is required' })
        next()
        return
      }

      if (!password) {
        res.status(400).json({ message: 'Password is required' })
        next()
        return
      }

      if (!siteId) {
        res.status(400).json({ message: 'siteId is required' })
        next()
        return
      }

      if (!userRoleTypeId) {
        res.status(400).json({ message: 'userRoleTypeId is required' })
        next()
        return
      }

      let user = await User.findOne({ where: { email: email } })
      if (user) {
        res.status(400).json({ message: 'User Aleady Exist' })
        next()
        return
      }

      let newUser = new User()
      newUser.fullName = fullName
      newUser.profilePic = profilePic
      newUser.email = email
      newUser.password = bcrypt.hashSync(password, 10)

      user = await newUser.save()

      let newSiteUser = new SiteUser()
      newSiteUser.siteId = siteId
      newSiteUser.addedByUserId = req.user.userId
      newSiteUser.userId = user.userId
      newSiteUser.active = true;
      newSiteUser.userRoleTypeId = userRoleTypeId;

      await newSiteUser.save()

      if (clientUserTypeId && clientId) {
        let newClientUser = new ClientUser();
        newClientUser.clientUserTypeId = clientUserTypeId;
        newClientUser.clientId = clientId;
        newClientUser.addedByUserId = req.user.userId;
        newClientUser.userId = user.userId;
        newClientUser.active = true;
        await newClientUser.save()
      }

      res.status(200).json(newUser)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },  
  getSites: async (req, res, next) => {
    try {
      let userId = req.params.userId
      const user = await User.findOne(
        {
          where: { userId: userId },
          attributes: ['userId', 'fullName', 'email'],
          include: [{ model: SiteUser, where: {active: true}, include: [{ model: Site, include: [{ model: Currency }] }, { model: UserRoleType, include: [{ model: UserRolePermission, include: [{ model: Permission }] }] }] }]
        })
      let i = 0
      user.dataValues.siteUsers.forEach(async(siteUser) => {
        let blobName = siteUser.dataValues.site.logoUrl
        const containerClient = blobServiceClient.getContainerClient(containerProfileImageName);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        
        const downloadBlockBlobResponse = await blockBlobClient.download(0);
        let buffer = await userController.streamToBuffer(downloadBlockBlobResponse.readableStreamBody)
        if (buffer.toString('base64').includes("data:image/")) {
          siteUser.dataValues.site.logoUrl = buffer.toString('base64')
        } else {
          siteUser.dataValues.site.logoUrl = `data:image/png;base64,${buffer.toString('base64')}`
        }
        i++
        if (i === user.dataValues.siteUsers.length) res.status(201).json(user)
      })
      
    } catch (err) {
      console.log(err)
      res.status(400).json({ message: err.message })
    }
    next()
  },
}

module.exports = userController

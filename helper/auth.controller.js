require('dotenv').config()

const jwt = require('jsonwebtoken')

const accessTokenSecret = process.env.accessTokenSecret
const DATABASE_URL = process.env.DATABASE_URL
module.exports = {
  authenticateJWT: (req, res, next) => {
    const authHeader = req.headers.authorization

    if (authHeader) {
      const token = authHeader.split(' ')[1]

      jwt.verify(token, accessTokenSecret, (err, user) => {
        if (err) {
          return res.status(403).json({ message: 'Token expired' })
        }
        req.user = user
        req.dbUrl = DATABASE_URL
        next()
      })
    } else {
      // res.sendStatus(401)
      res.status(401).json({ message: "Unauthorized" })
    }
  }
}

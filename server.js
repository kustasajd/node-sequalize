const express = require('express')
const cors = require('cors')
let app = express()
const bodyParser = require('body-parser')

const db = require('./db')
db.sync()

const DsJwtAuth = require('./helper/docuSign/DSJwtAuth')
const dsConfig = require('./dsconfig/index').config
const session = require('express-session')
const MemoryStore = require('memorystore')(session)
const max_session_min = 180

app.use(session({
  secret: dsConfig.sessionSecret,
  name: 'ds-launcher-session',
  cookie: { maxAge: max_session_min * 60000 },
  saveUninitialized: true,
  resave: true,
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  })
}))

app.use(async (req, res, next) => {
  req.dsAuthJwt = new DsJwtAuth(req);
  req.dsAuth = req.dsAuthJwt;
  next()
})

app.use(cors())
app.use(bodyParser.json({ limit: '200mb' }))
app.use(
  bodyParser.urlencoded({
    limit: '200mb',
    extended: true,
    parameterLimit: 1000000
  })
)
app.use(express.json())

//user
const userRouter = require('./routes/user')
const userRoleTypeRouter = require('./routes/userRoleType')
const clientUserTypeRouter = require('./routes/clientUserType')

//client
const clientRouter = require('./routes/client')
const clientGroupTypeRouter = require('./routes/clientGroupType')
const clientGroupRouter = require('./routes/clientGroup')
const clientUserRouter = require('./routes/clientUser')

//site
const siteRouter = require('./routes/site')
const currencyRouter = require('./routes/currency')

//product
const productRouter = require('./routes/product')

//licence
const licenceRouter = require('./routes/licence')
const licenceStatusTypeRouter = require('./routes/licenceStatusType')

//Tax Rates and Product Charge Types
const taxRateRouter = require('./routes/taxRate')
const productChargeTypeRouter = require('./routes/productChargeType')

//Invoice
const invoiceRouter = require('./routes/invoice')
//Zone
const zoneRouter = require('./routes/zone')
//Charge Register
const chargeRegisterRouter = require('./routes/chargeRegister')
//Permission
const permissionRouter = require('./routes/permission')
//Payment
const paymentRouter = require('./routes/payment')
//floorplan
const floorplanRouter = require('./routes/floorplan')
//floorplan
const roomReservationRouter = require('./routes/roomReservation')
//report
const reportRouter = require('./routes/report')

// --------------------------------------------------------------------------------------
//user
app.use('/users', userRouter)
app.use('/userRoleTypes', userRoleTypeRouter)
app.use('/clientUserTypes', clientUserTypeRouter)

//client
app.use('/clients', clientRouter)
app.use('/clientGroupTypes', clientGroupTypeRouter)
app.use('/clientGroups', clientGroupRouter)
app.use('/clientUsers', clientUserRouter)

//site
app.use('/sites', siteRouter)
app.use('/currencies', currencyRouter)

//product
app.use('/products', productRouter)

//licence
app.use('/licences', licenceRouter)
app.use('/licenceStatusTypes', licenceStatusTypeRouter)

//Tax Rates and Product Charge Types
app.use('/taxRates', taxRateRouter)
app.use('/productChargeTypes', productChargeTypeRouter)

//Invoice
app.use('/invoices', invoiceRouter)
//Zone
app.use('/zones', zoneRouter)
//Charge Register
app.use('/charges', chargeRegisterRouter)
//Payment
app.use('/payments', paymentRouter)

//Permissions
app.use('/permissions', permissionRouter)

//floorplan
app.use('/floorplans', floorplanRouter)

//roomReservation
app.use('/roomReservations', roomReservationRouter)
//report
app.use('/reports', reportRouter)

const PORT = parseInt(process.env.PORT, 10)

app.listen(PORT, () => console.log(`listening on port ${PORT}`))

module.exports = app

const request = require('supertest')
const app = require('../server')

describe('Routes', () => {
  let token
  it('authenticate', (done) => {
    request(app)
      .post('/users/authenticate')
      .set('Content-Type', 'application/json')
      .send({
        email: 'alex@test.com',
        password: 'password'
      })
      .end((err, res) => {
        expect(res.statusCode).toEqual(200)
        expect(res.body).toHaveProperty('token')
        token = res.body.token
        done()
      })
  }, 20000)

  // User API
  describe('User API', () => {

    it('authenticate', async () => {
      let res = await request(app)
        .post('/users/authenticate')
        .set('Content-Type', 'application/json')
        .send({
          email: 'alex@test.com',
          password: 'password'
        })

      expect(res.statusCode).toEqual(200)
      expect(res.body).toHaveProperty('token')

      res = await request(app)
        .post('/users/authenticate')
        .set('Content-Type', 'application/json')
        .send({
          email: 'test@test.com',
          password: 'test'
        })

      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/users/authenticate')
        .set('Content-Type', 'application/json')
        .send({})

      expect(res.statusCode).toEqual(400)
    }, 20000)

    it('register', async () => {
      let res = await request(app)
        .post('/users/register')
        .set('Content-Type', 'application/json')
        .send({
          email: 'brent@proxi.studio',
          password: 'password',
          firstName: 'firstName',
          lastName: 'lastName'
        })

      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/users/register')
        .set('Content-Type', 'application/json')
        .send({})

      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/users/register')
        .set('Content-Type', 'application/json')
        .send({
          email: null,
          password: 'password',
          firstName: 'firstName',
          lastName: 'lastName'
        })

      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/users/register')
        .set('Content-Type', 'application/json')
        .send({
          email: 'brent@proxi.studio',
          password: null,
          firstName: 'firstName',
          lastName: 'lastName'
        })

      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/users/register')
        .set('Content-Type', 'application/json')
        .send({
          email: 'brent@proxi.studio',
          password: 'password',
          firstName: null,
          lastName: 'lastName'
        })

      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/users/register')
        .set('Content-Type', 'application/json')
        .send({
          email: 'brent@proxi.studio',
          password: 'password',
          firstName: 'firstName',
          lastName: null
        })

      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/users/register')
        .set('Content-Type', 'application/json')
        .send({
          email: null,
          password: null,
          firstName: null,
          lastName: null
        })

      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/users/register')
        .set('Content-Type', 'application/json')
        .send({
          email: 'brent@proxi.studio',
          password: 'password',
          firstName: 'firstName',
          lastName: 'lastName'
        })
      expect(res.statusCode).toEqual(400)

    }, 20000)

    it('should show all users', async () => {


      let res = await request(app)
        .get('/users')
      expect(res.statusCode).toEqual(401)

      res = await request(app)
        .get('/users')
        .set('Authorization', token) 
      expect(res.statusCode).toEqual(403)

      res = await request(app)
        .get('/users')
        .set('Authorization', 'Bearer ' + token) 
      expect(res.statusCode).toEqual(201)

    }, 20000)

    it('should show user', async () => {
      let res = await request(app)
        .get('/users/1')
        .set('Authorization', 'Bearer ' + token) 
      expect(res.statusCode).toEqual(201)
      expect(res.body).toHaveProperty('userId')

      res = await request(app)
        .get('/users/userId')
        .set('Authorization', 'Bearer ' + token) 
      expect(res.statusCode).toEqual(400)

    }, 20000)

    it('should update user', async () => {
      let res = await request(app)
        .put('/users/userId')
        .set('Authorization', 'Bearer ' + token) 
      expect(res.statusCode).toEqual(201)

    }, 20000)

    it('should create user', async () => {
      let res = await request(app)
        .post('/users/create')
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json')
        .send({
          email: 'brent@proxi.studio',
          password: 'password',
          fullName: 'fullName',
          userRoleTypeId: 'userRoleTypeId',
          clientUserTypeId: 'clientUserTypeId',
          clientId: 'clientId'
        })
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/users/create')
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json')
        .send({})

      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/users/create')
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json')
        .send({
          email: null,
          password: 'password',
          fullName: 'fullName',
          userRoleTypeId: 'userRoleTypeId',
          clientUserTypeId: 'clientUserTypeId',
          clientId: 'clientId'
        })

      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/users/create')
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json')
        .send({
          email: 'brent@proxi.studio',
          password: null,
          fullName: 'fullName',
          userRoleTypeId: 'userRoleTypeId',
          clientUserTypeId: 'clientUserTypeId',
          clientId: 'clientId'
        })

      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/users/create')
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json')
        .send({
          email: 'brent@proxi.studio',
          password: 'password',
          fullName: null,
          userRoleTypeId: 'userRoleTypeId',
          clientUserTypeId: 'clientUserTypeId',
          clientId: 'clientId'
        })

      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/users/create')
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json')
        .send({
          email: 'brent@proxi.studio',
          password: 'password',
          fullName: 'fullName',
          userRoleTypeId: null,
          clientUserTypeId: 'clientUserTypeId',
          clientId: 'clientId'
        })

      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/users/create')
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json')
        .send({
          email: null,
          password: null,
          fullName: null,
          userRoleTypeId: null,
          clientUserTypeId: 'clientUserTypeId',
          clientId: 'clientId'
        })

      expect(res.statusCode).toEqual(400)

    }, 20000)

  })

  // User Role Type API
  describe('User Role Type API', () => {

    it('should show all user role types', (done) => {
      request(app)
        .get('/userRoleTypes')
        .set('Authorization', 'Bearer ' + token) 
        .end((err, res) => {
          expect(res.statusCode).toEqual(201)
          done()
        })
    }, 20000)

  })

  // Client User Type API
  describe('Client User Type API', () => {

    it('should show all client user types', (done) => {
      request(app)
        .get('/clientUserTypes')
        .set('Authorization', 'Bearer ' + token)
        .end((err, res) => {
          expect(res.statusCode).toEqual(201)
          done()
        })
    }, 20000)

  })

  // Clients API
  describe('Clients API', () => {

    it('should show all clients', (done) => {
      request(app)
        .get('/clients')
        .set('Authorization', 'Bearer ' + token)
        .end((err, res) => {
          expect(res.statusCode).toEqual(201)
          done()
        })
    }, 20000)

    it('should show all site clients', async () => {
      let res = await request(app)
        .get('/clients/siteClients/1')
        .set('Authorization', 'Bearer ' + token)
      expect(res.statusCode).toEqual(201)
      res = await request(app)
        .get('/clients/siteClients/clientId')
        .set('Authorization', 'Bearer ' + token)
      expect(res.statusCode).toEqual(400)
    }, 20000)

    it('should show client detail', async () => {
      let res = await request(app)
        .get('/clients/3')
        .set('Authorization', 'Bearer ' + token)

      expect(res.statusCode).toEqual(201)
      expect(res.body).toHaveProperty('clientId')

      res = await request(app)
        .get('/clients/clientId')
        .set('Authorization', 'Bearer ' + token)

      expect(res.statusCode).toEqual(400)

    }, 20000)

    it('should update client', (done) => {
      request(app)
        .put('/clients/clientId')
        .set('Authorization', 'Bearer ' + token)
        .end((err, res) => {
          expect(res.statusCode).toEqual(201)
          done()
        })
    }, 20000)

  })

  // Client Group Types

  describe('Client Group Types API', () => {

    it('should show all clientGroupTypes', (done) => {
      request(app)
        .get('/clientGroupTypes')
        .set('Authorization', 'Bearer ' + token)
        .end((err, res) => {
          expect(res.statusCode).toEqual(201)
          done()
        })
    }, 20000)

  })

  // Client Groups

  describe('Client Group API', () => {

    it('should show clientGroups', async () => {
      let res = await request(app)
        .get('/clientGroups/groups/3')
        .set('Authorization', 'Bearer ' + token)

      expect(res.statusCode).toEqual(201)

      res = await request(app)
        .get('/clientGroups/groups/clientId')
        .set('Authorization', 'Bearer ' + token)

      expect(res.statusCode).toEqual(400)

    }, 20000)

    it('should create clientGroup', async () => {
      let res = await request(app)
        .post('/clientGroups/create')
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json')
        .send({
          clientGroupTypeId: 'clientGroupTypeId',
          clientId: null
        })
      expect(res.statusCode).toEqual(400)
      res = await request(app)
        .post('/clientGroups/create')
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json')
        .send({
          clientGroupTypeId: null,
          clientId: 'clientId'
        })
      expect(res.statusCode).toEqual(400)
      res = await request(app)
        .post('/clientGroups/create')
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json')
        .send({
          clientGroupTypeId: 'clientGroupTypeId',
          clientId: 'clientId'
        })
      expect(res.statusCode).toEqual(400)
      res = await request(app)
        .post('/clientGroups/create')
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json')
        .send({
          clientGroupTypeId: null,
          clientId: null
        })
      expect(res.statusCode).toEqual(400)
    }, 20000)

    it('should delete clientGroup', async () => {
      let res = await request(app)
        .post('/clientGroups/delete')
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json')
        .send({
          clientGroupTypeId: 'clientGroupTypeId',
          clientId: null
        })
      expect(res.statusCode).toEqual(400)
      res = await request(app)
        .post('/clientGroups/delete')
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json')
        .send({
          clientGroupTypeId: null,
          clientId: 'clientId'
        })
      expect(res.statusCode).toEqual(400)
      res = await request(app)
        .post('/clientGroups/delete')
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json')
        .send({
          clientGroupTypeId: null,
          clientId: null
        })
      expect(res.statusCode).toEqual(400)
      res = await request(app)
        .post('/clientGroups/delete')
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json')
        .send({
          clientGroupTypeId: 'clientGroupTypeId',
          clientId: 'clientId'
        })
      expect(res.statusCode).toEqual(400)
    }, 20000)

  })

  // Client Users

  describe('Client User API', () => {

    it('should show clientUsers', async () => {
      let res = await request(app)
        .get('/clientUsers/users/3')
        .set('Authorization', 'Bearer ' + token)

      expect(res.statusCode).toEqual(201)

      res = await request(app)
        .get('/clientUsers/users/clientId')
        .set('Authorization', 'Bearer ' + token)

      expect(res.statusCode).toEqual(400)

    }, 20000)

    it('should create clientUser', async () => {
      let res = await request(app)
        .post('/clientUsers/create')
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json')
        .send({
          userEmail: 'userEmail',
          clientId: null
        })
      expect(res.statusCode).toEqual(400)
      res = await request(app)
        .post('/clientUsers/create')
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json')
        .send({
          userEmail: null,
          clientId: 'clientId'
        })
      expect(res.statusCode).toEqual(400)
      res = await request(app)
        .post('/clientUsers/create')
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json')
        .send({
          userEmail: 'userEmail',
          clientId: 'clientId'
        })
      expect(res.statusCode).toEqual(400)
      res = await request(app)
        .post('/clientUsers/create')
        .set('Content-Type', 'application/json')
        .set('Authorization', 'Bearer ' + token)
        .send({
          userEmail: null,
          clientId: null
        })
      expect(res.statusCode).toEqual(400)
    }, 20000)

    it('should delete clientGroup', async () => {
      let res = await request(app)
        .post('/clientUsers/delete')
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json')
        .send({
          userId: 'userId',
          clientId: null
        })
      expect(res.statusCode).toEqual(400)
      res = await request(app)
        .post('/clientUsers/delete')
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json')
        .send({
          userId: null,
          clientId: 'clientId'
        })
      expect(res.statusCode).toEqual(400)
      res = await request(app)
        .post('/clientUsers/delete')
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json')
        .send({
          userId: null,
          clientId: null
        })
      expect(res.statusCode).toEqual(400)
      res = await request(app)
        .post('/clientUsers/delete')
        .set('Authorization', 'Bearer ' + token)
        .set('Content-Type', 'application/json')
        .send({
          userId: 'userId',
          clientId: 'clientId'
        })
      expect(res.statusCode).toEqual(400)
    }, 20000)

  })

  // User Currency API
  describe('User Currency API', () => {

    it('should show all currencies', (done) => {
      request(app)
        .get('/currencies')
        .set('Authorization', 'Bearer ' + token) 
        .end((err, res) => {
          expect(res.statusCode).toEqual(201)
          done()
        })
    }, 20000)

  })

  // Licence

  describe('Licences API', () => {
    it('should show licence', async () => {
      let res = await request(app)
        .get('/licences/1')
        .set('Authorization', 'Bearer ' + token) 
      expect(res.statusCode).toEqual(201)
      if (res.body) expect(res.body).toHaveProperty('licenceId')

      res = await request(app)
        .get('/licences/licenceId')
        .set('Authorization', 'Bearer ' + token) 
      expect(res.statusCode).toEqual(400)

    }, 20000)

    it('should create licence', async () => {
      let res = await request(app)
        .post('/licences/create')
        .send({
          clientId: 'clientId',
          siteId: 'siteId',
          licenceTypeId: 'licenceTypeId',
          licenceStatusTypeId: 'licenceStatusTypeId',
          notes: 'notes'
        })
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/licences/create')
        .send({
          clientId: null,
          siteId: null,
          licenceTypeId: null,
          licenceStatusTypeId: null,
          notes: null
        })
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/licences/create')
        .send({
          clientId: null,
          siteId: 'siteId',
          licenceTypeId: 'licenceTypeId',
          licenceStatusTypeId: 'licenceStatusTypeId',
          notes: 'notes'
        })
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
      expect(res.statusCode).toEqual(400)


      res = await request(app)
        .post('/licences/create')
        .send({
          clientId: 'clientId',
          siteId: null,
          licenceTypeId: 'licenceTypeId',
          licenceStatusTypeId: 'licenceStatusTypeId',
          notes: 'notes'
        })
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
      expect(res.statusCode).toEqual(400)


      res = await request(app)
        .post('/licences/create')
        .send({
          clientId: 'clientId',
          siteId: 'siteId',
          licenceTypeId: null,
          licenceStatusTypeId: 'licenceStatusTypeId',
          notes: 'notes'
        })
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
      expect(res.statusCode).toEqual(400)


      res = await request(app)
        .post('/licences/create')
        .send({
          clientId: 'clientId',
          siteId: 'siteId',
          licenceTypeId: 'licenceTypeId',
          licenceStatusTypeId: null,
          notes: 'notes'
        })
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
      expect(res.statusCode).toEqual(400)

    }, 20000)
  })

  // Licence Status Types

  describe('Licence Status Types API', () => {

    it('should show all licenceStatusTypes', (done) => {
      request(app)
        .get('/licenceStatusTypes')
        .set('Authorization', 'Bearer ' + token) 
        .end((err, res) => {
          expect(res.statusCode).toEqual(201)
          done()
        })
    }, 20000)

  })

  // Tax Rates

  describe('Tax Rates API', () => {

    it('should show all taxRates', (done) => {
      request(app)
        .get('/taxRates')
        .set('Authorization', 'Bearer ' + token) 
        .end((err, res) => {
          expect(res.statusCode).toEqual(201)
          done()
        })
    }, 20000)

  })

  // Product Charge Types

  describe('Product Charge Types API', () => {

    it('should show all productChargeTypes', (done) => {
      request(app)
        .get('/productChargeTypes')
        .set('Authorization', 'Bearer ' + token) 
        .end((err, res) => {
          expect(res.statusCode).toEqual(201)
          done()
        })
    }, 20000)

  })

  // Product

  describe('Product API', () => {

    it('should create product', async () => {
      let res = await request(app)
        .post('/products/create')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({
          name: null,
          description: 'description',
          icon: 'icon'
        })
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/products/create')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({
          name: 'Office rental',
          description: 'description',
          icon: 'icon'
        })
      expect(res.statusCode).toEqual(400)

    }, 20000)

    it('should show all products', (done) => {
      request(app)
        .get('/products')
        .set('Authorization', 'Bearer ' + token) 
        .end((err, res) => {
          expect(res.statusCode).toEqual(201)
          done()
        })
    }, 20000)

    it('should show all getSiteProducts', async () => {
      let res = await request(app)
        .get('/products/site/1')
        .set('Authorization', 'Bearer ' + token) 
      expect(res.statusCode).toEqual(201)

      res = await request(app)
        .get('/products/site/productId')
        .set('Authorization', 'Bearer ' + token) 
      expect(res.statusCode).toEqual(400)

    }, 20000)

    it('should show product detail', async () => {
      let res = await request(app)
        .get('/products/1')
        .set('Authorization', 'Bearer ' + token) 
      expect(res.statusCode).toEqual(201)

      res = await request(app)
        .get('/products/productId')
        .set('Authorization', 'Bearer ' + token) 
      expect(res.statusCode).toEqual(400)

    }, 20000)

    it('should update product', async () => {
      let res = await request(app)
        .put('/products/1')
        .set('Authorization', 'Bearer ' + token) 
      expect(res.statusCode).toEqual(201)
    }, 20000)

    it('should create site product', async () => {
      let res = await request(app)
        .post('/products/site/create')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({
          siteId: null,
          productId: 'productId'
        })
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/products/site/create')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({
          siteId: 'siteId',
          productId: null
        })
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/products/site/create')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({
          siteId: null,
          productId: null
        })
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/products/site/create')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({})
      expect(res.statusCode).toEqual(400)

    }, 20000)

  })

  // Site
  describe('Site API', () => {

    // basic
    it('should create site', async () => {
      let res = await request(app)
        .post('/sites/create')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({
          brandName: 'Melbourne Queens Road',
          addressStreet: 'addressStreet',
          currencyId: 'currencyId'
        })
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/create')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({
          brandName: null,
          addressStreet: 'addressStreet',
          currencyId: 'currencyId'
        })
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/create')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({
          brandName: 'brandName',
          addressStreet: null,
          currencyId: 'currencyId'
        })
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/create')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({
          brandName: 'brandName',
          addressStreet: 'addressStreet',
          currencyId: null
        })
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/create')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({
          brandName: null,
          addressStreet: null,
          currencyId: null
        })
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/create')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({})
      expect(res.statusCode).toEqual(400)

    }, 20000)

    it('should show all sites', (done) => {
      request(app)
        .get('/sites')
        .set('Authorization', 'Bearer ' + token) 
        .end((err, res) => {
          expect(res.statusCode).toEqual(201)
          done()
        })
    }, 20000)

    it('should show site detail', async () => {
      let res = await request(app)
        .get('/sites/1')
        .set('Authorization', 'Bearer ' + token) 
      expect(res.statusCode).toEqual(201)

      res = await request(app)
        .get('/sites/productId')
        .set('Authorization', 'Bearer ' + token) 
      expect(res.statusCode).toEqual(400)

    }, 20000)

    it('should update site', async () => {
      let res = await request(app)
        .put('/sites/1')
        .set('Authorization', 'Bearer ' + token) 
      expect(res.statusCode).toEqual(201)
    }, 20000)

    // site users
    it('should show all site users', async () => {
      let res = await request(app)
        .get('/sites/users/1')
        .set('Authorization', 'Bearer ' + token) 
      expect(res.statusCode).toEqual(201)

      res = await request(app)
        .get('/sites/users/siteId')
        .set('Authorization', 'Bearer ' + token) 
      expect(res.statusCode).toEqual(400)
    }, 20000)

    it('should create site user', async () => {
      let res = await request(app)
        .post('/sites/createUser')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({
          siteId: null,
          userId: 'userId',
          userRoleTypeId: 'userRoleTypeId'
        })
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/createUser')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({
          siteId: 'siteId',
          userId: null,
          userRoleTypeId: 'userRoleTypeId'
        })
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/createUser')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({
          siteId: null,
          userId: null,
          userRoleTypeId: 'userRoleTypeId'
        })
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/createUser')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({})
      expect(res.statusCode).toEqual(400)

    }, 20000)

    it('should update site user', async () => {
      let res = await request(app)
        .post('/sites/updateUser')
        .send({
          siteUserId: null,
          userRoleTypeId: 'userRoleTypeId',
        })
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/updateUser')
        .send({
          siteUserId: 'siteUserId',
          userRoleTypeId: null,
        })
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/updateUser')
        .send({
          siteUserId: null,
          userRoleTypeId: null,
        })
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/updateUser')
        .send({})
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
      expect(res.statusCode).toEqual(400)

    }, 20000)

    it('should delete site user', async () => {
      let res = await request(app)
        .post('/sites/deleteUser')
        .send({
          siteId: null,
          userId: 'userId',
        })
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/deleteUser')
        .send({
          siteId: 'siteId',
          userId: null,
        })
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/deleteUser')
        .send({
          siteId: null,
          userId: null,
        })
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/deleteUser')
        .send({})
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
      expect(res.statusCode).toEqual(400)

    }, 20000)

    // site clients

    it('should show all site clients', async () => {
      let res = await request(app)
        .get('/sites/clients/1')
        .set('Authorization', 'Bearer ' + token) 
      expect(res.statusCode).toEqual(201)

      res = await request(app)
        .get('/sites/clients/siteId')
        .set('Authorization', 'Bearer ' + token) 
      expect(res.statusCode).toEqual(400)
    }, 20000)

    it('should create site client', async () => {
      let res = await request(app)
        .post('/sites/createClient')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({
          siteId: null,
          clientId: 'clientId'
        })
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/createClient')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({
          siteId: 'siteId',
          clientId: null
        })
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/createClient')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({
          siteId: null,
          clientId: null
        })
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/createClient')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({})
      expect(res.statusCode).toEqual(400)

    }, 20000)

    it('should delete site client', async () => {
      let res = await request(app)
        .post('/sites/deleteClient')
        .send({
          siteId: null,
          clientId: 'clientId',
        })
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/deleteClient')
        .send({
          siteId: 'siteId',
          clientId: null,
        })
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/deleteClient')
        .send({
          siteId: null,
          clientId: null,
        })
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/deleteClient')
        .send({})
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
      expect(res.statusCode).toEqual(400)

    }, 20000)

    it('should show SitesByClient', async () => {
      let res = await request(app)
        .get('/sites/siteClients/1')
        .set('Authorization', 'Bearer ' + token) 
      expect(res.statusCode).toEqual(201)

      res = await request(app)
        .get('/sites/siteClients/clientId')
        .set('Authorization', 'Bearer ' + token) 
      expect(res.statusCode).toEqual(400)
    }, 20000)

    // siteLicenceTemplates

    it('should show SiteLicenceTemplate', async () => {
      let res = await request(app)
        .get('/sites/licenceTemplates/1')
        .set('Authorization', 'Bearer ' + token) 
      expect(res.statusCode).toEqual(201)

      res = await request(app)
        .get('/sites/licenceTemplates/siteId')
        .set('Authorization', 'Bearer ' + token) 
      expect(res.statusCode).toEqual(400)
    }, 20000)

    it('should show SiteLicenceTemplateDetail', async () => {
      let res = await request(app)
        .post('/sites/licenceTemplate/detail')
        .send({
          siteId: 1,
          siteLicenceTemplateId: 1
        })
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
      expect(res.statusCode).toEqual(201)
      if (res.body) expect(res.body).toHaveProperty('siteLicenceTemplateId')

      res = await request(app)
        .post('/sites/licenceTemplate/detail')
        .send({
          siteId: null,
          siteLicenceTemplateId: null
        })
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/licenceTemplate/detail')
        .send({
          siteId: 'siteId',
          siteLicenceTemplateId: null
        })
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/licenceTemplate/detail')
        .send({
          siteId: null,
          siteLicenceTemplateId: 'siteLicenceTemplateId'
        })
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/licenceTemplate/detail')
        .send({})
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
      expect(res.statusCode).toEqual(400)

    }, 20000)

    //site products

    it('should show productsBySite', async () => {
      let res = await request(app)
        .get('/sites/products/1')
        .set('Authorization', 'Bearer ' + token) 
      expect(res.statusCode).toEqual(201)

      res = await request(app)
        .get('/sites/products/siteId')
        .set('Authorization', 'Bearer ' + token) 
      expect(res.statusCode).toEqual(400)
    }, 20000)

    it('should show siteProductById', async () => {
      let res = await request(app)
        .get('/sites/1/siteProduct/1')
        .set('Authorization', 'Bearer ' + token) 
      expect(res.statusCode).toEqual(201)

      res = await request(app)
        .get('/sites/siteId/siteProduct/siteProductId')
        .set('Authorization', 'Bearer ' + token) 
      expect(res.statusCode).toEqual(400)
    }, 20000)

    it('should show productPricing', async () => {
      let res = await request(app)
        .post('/sites/productPricing')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({
          siteId: null,
          siteProductId: null
        })
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/productPricing')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({
          siteId: null,
          siteProductId: 'siteProductId'
        })
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/productPricing')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({
          siteId: 'siteId',
          siteProductId: null
        })
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/productPricing')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({})
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/productPricing')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({
          siteId: 1,
          siteProductId: 1
        })
      expect(res.statusCode).toEqual(201)

    }, 20000)

    it('should create site product', async () => {
      let res = await request(app)
        .post('/sites/createProduct')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({
          siteId: null,
          productId: null,
          taxRateId: null,
          productChargeTypeId: null,
          baseRate: null
        })
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/createProduct')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({
          siteId: 'siteId',
          productId: 'productId',
          taxRateId: 'taxRateId',
          productChargeTypeId: 'productChargeTypeId',
          baseRate: 'baseRate'
        })
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/createProduct')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({
          siteId: null,
          productId: 'productId',
          taxRateId: 'taxRateId',
          productChargeTypeId: 'productChargeTypeId',
          baseRate: 'baseRate'
        })
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/createProduct')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({
          siteId: 'siteId',
          productId: null,
          taxRateId: 'taxRateId',
          productChargeTypeId: 'productChargeTypeId',
          baseRate: 'baseRate'
        })
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/createProduct')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({
          siteId: 'siteId',
          productId: 'productId',
          taxRateId: null,
          productChargeTypeId: 'productChargeTypeId',
          baseRate: 'baseRate'
        })
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/createProduct')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({
          siteId: 'siteId',
          productId: 'productId',
          taxRateId: 'taxRateId',
          productChargeTypeId: null,
          baseRate: 'baseRate'
        })
      expect(res.statusCode).toEqual(400)

    }, 20000)

    it('should create site product pricing', async () => {
      let res = await request(app)
        .post('/sites/createProductPricing')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({
          siteProductId: null,
          taxRateId: null,
          productChargeTypeId: null,
          baseRate: null
        })
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/createProductPricing')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({
          siteProductId: 'siteProductId',
          taxRateId: 'taxRateId',
          productChargeTypeId: 'productChargeTypeId',
          baseRate: 'baseRate'
        })
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/createProductPricing')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({
          siteProductId: null,
          taxRateId: 'taxRateId',
          productChargeTypeId: 'productChargeTypeId',
          baseRate: 'baseRate'
        })
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/createProductPricing')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({
          siteProductId: 'siteProductId',
          taxRateId: null,
          productChargeTypeId: 'productChargeTypeId',
          baseRate: 'baseRate'
        })
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/createProductPricing')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({
          siteProductId: 'siteProductId',
          taxRateId: 'taxRateId',
          productChargeTypeId: null,
          baseRate: 'baseRate'
        })
      expect(res.statusCode).toEqual(400)

      res = await request(app)
        .post('/sites/createProductPricing')
        .set('Authorization', 'Bearer ' + token) 
        .set('Content-Type', 'application/json')
        .send({
          siteProductId: 'siteProductId',
          taxRateId: 'taxRateId',
          productChargeTypeId: 'productChargeTypeId',
          baseRate: null
        })
      expect(res.statusCode).toEqual(400)     

    }, 20000)

  })

})
require('dotenv').config()
const db = require('../db')
const Product = db.models.product
const SiteProduct = db.models.siteProduct
const Site = db.models.site

const productController = {
  create: async (req, res, next) => {
    const { name, description, icon } = req.body

    if (!name) {
      res.status(400).json({ message: 'name is required' })
      next()
      return
    }

    const product = await Product.findOne({ where: { name: name } })
    if (product) {
      res.status(400).json({ message: 'Product Aleady Exist' })
      next()
      return
    }

    let newProduct = new Product()

    newProduct.name = name
    newProduct.description = description
    newProduct.icon = icon

    await newProduct.save()

    res.status(200).json(newProduct)
    next()
  },

  getAllProducts: async (req, res, next) => {
    const products = await Product.findAll({
      attributes: ['productId', 'name', 'description', 'icon'],
      include: [{ model: SiteProduct }]
    })
    res.status(201).json(products)
    next()
  },

  getProductsBySiteId: async (req, res, next) => {
    try {
      let siteId = req.params.siteId
      const siteProducts = await SiteProduct.findAll({
        where: { siteId: siteId, active: true },
        attributes: ['siteProductId'],
        include: [{model: Product}]
      })
      res.status(201).json(siteProducts)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  getSiteProducts: async (req, res, next) => {
    try {
      let productId = req.params.productId
      const siteProducts = await SiteProduct.findAll({
        where: { productId: productId, active: true },
        attributes: ['siteProductId', 'productId', 'siteId'],
        include: [{ model: Product }, { model: Site }]
      })
      res.status(201).json(siteProducts)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  getProduct: async (req, res, next) => {
    try {
      let productId = req.params.productId
      const product = await Product.findOne({ where: { productId: productId } })

      res.status(201).json(product)
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },

  updateProduct: async (req, res, next) => {
    try {
      let productId = req.params.productId
      req.oldValue = await Product.findOne({ where: { productId: productId } })
      req.tableName = 'dbo.products'
      await Product.update(req.body, { where: { productId: productId } })
      res.status(201).json(req.body)
      req.newValue = await Product.findOne({ where: { productId: productId } })
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },
  createSite: async (req, res, next) => {
    try {
      const { siteId, productId } = req.body

      if (!siteId) {
        res.status(400).json({ message: 'siteId is required' })
        next()
        return
      }

      if (!productId) {
        res.status(400).json({ message: 'productId is required' })
        next()
        return
      }

      const siteProduct = await SiteProduct.findOne({ where: { siteId: siteId, productId: productId, active: true } })
      if (siteProduct) {
        res.status(400).json({ message: 'Aleady Exist' })
        next()
        return
      } else {
        let newSiteProduct = new SiteProduct()

        newSiteProduct.siteId = siteId
        newSiteProduct.productId = productId
  
        await newSiteProduct.save()
  
        res.status(200).json({siteProduct: newSiteProduct})
      }
    } catch (err) {
      res.status(400).json({ message: err.message })
    }
    next()
  },
}

module.exports = productController

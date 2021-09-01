module.exports = (sequelize, Sequelize) => {
  const SiteProduct = sequelize.define("siteProduct", {
    siteProductId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    siteId: {
      type: Sequelize.INTEGER,
      required: true
    },
    productId: {
      type: Sequelize.INTEGER,
      required: true
    },
    active: {
      type: Sequelize.BOOLEAN,
      required: true
    }
  }, {
    timestamps: false
  });

  SiteProduct.associate = function (models) {
    this.belongsTo(models.product, {
        foreignKey: 'productId'
    });
    this.belongsTo(models.site, {
      foreignKey: 'siteId'
    });    
    this.hasMany(models.siteProductPricing, {
      foreignKey: 'siteProductId'
    });
  };

  return SiteProduct;
};

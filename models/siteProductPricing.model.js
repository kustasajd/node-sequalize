module.exports = (sequelize, Sequelize) => {
  const SiteProductPricing = sequelize.define("siteProductPricing", {
    siteProductPricingId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    siteProductId: {
      type: Sequelize.INTEGER,
      required: true
    },
    productChargeTypeId: {
      type: Sequelize.INTEGER,
      required: true
    },
    baseRate: {
      type: Sequelize.DECIMAL,
      required: true
    },
    taxRateId: {
      type: Sequelize.INTEGER,
      default: 1,
      required: true
    },
    optionName: {
      type: Sequelize.STRING
    }
  }, {
    timestamps: false,
    freezeTableName: true
  });
 
  SiteProductPricing.associate = function (models) {
    this.belongsTo(models.siteProduct, {
      foreignKey: 'siteProductId'
    });
    this.belongsTo(models.productChargeType, {
      foreignKey: 'productChargeTypeId'
    });
    this.belongsTo(models.taxRate, {
      foreignKey: 'taxRateId'
    });
  };

  return SiteProductPricing;
};

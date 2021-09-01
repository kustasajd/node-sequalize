module.exports = (sequelize, Sequelize) => {
  const SiteLicenceProduct = sequelize.define("siteLicenceProduct", {
    siteLicenceProductId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    siteLicenceTemplateId: {
      type: Sequelize.INTEGER,
      required: true
    },
    siteProductPricingId: {
      type: Sequelize.INTEGER,
      required: true
    },
    overridePrice: {
      type: Sequelize.DECIMAL
    },
    paidInAdvance: {
      type: Sequelize.BOOLEAN,
      required: true
    },
    licenceProductTypeId: {
      type: Sequelize.INTEGER,
      required: true
    }
  }, {
    timestamps: false
  });

  SiteLicenceProduct.associate = function (models) {
    this.belongsTo(models.siteProductPricing, {
      foreignKey: 'siteProductPricingId'
    });
    this.belongsTo(models.licenceProductType, {
      foreignKey: 'licenceProductTypeId'
    });
  };

  return SiteLicenceProduct;
};

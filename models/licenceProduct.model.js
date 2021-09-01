module.exports = (sequelize, Sequelize) => {
  const LicenceProduct = sequelize.define("licenceProduct", {
    licenceProductId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    licenceId: {
      type: Sequelize.INTEGER,
      required: true
    },    
    overridePrice: {
      type: Sequelize.DECIMAL
    },
    taxRateId: {
      type: Sequelize.INTEGER,
      required: true
    },
    notes: {
      type: Sequelize.STRING,
    },
    paidInAdvance: {
      type: Sequelize.BOOLEAN,
      required: true
    },
    productChargeTypeId: {
      type: Sequelize.INTEGER,
      required: true
    },
    productId: {
      type: Sequelize.INTEGER,
      required: true
    },
    licenceProductTypeId: {
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

  LicenceProduct.associate = function (models) {
    this.belongsTo(models.productChargeType, {
      foreignKey: 'productChargeTypeId'
    });
    this.belongsTo(models.product, {
      foreignKey: 'productId'
    });
    this.belongsTo(models.licence, {
      foreignKey: 'licenceId'
    });
    this.belongsTo(models.licenceProductType, {
      foreignKey: 'licenceProductTypeId'
    });
    this.belongsTo(models.taxRate, {
      foreignKey: 'taxRateId'
    });
  };

  return LicenceProduct;
};
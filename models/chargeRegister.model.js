module.exports = (sequelize, Sequelize) => {
  const ChargeRegister = sequelize.define("chargeRegister", {
    chargeRegisterId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    clientId: {
      type: Sequelize.INTEGER,
      required: true
    },
    timestamp: {
      type: Sequelize.DATE,
      default: Sequelize.fn('GETDATE'),
      required: true
    },
    productId: {
      type: Sequelize.INTEGER,
      required: true
    },
    productChargeTypeId: {
      type: Sequelize.INTEGER
    },
    siteProductPricingId: {
      type: Sequelize.INTEGER
    },
    paidInAdvance: {
      type: Sequelize.BOOLEAN,
      required: true,
      default: true
    },
    rate: {
      type: Sequelize.DECIMAL,
      required: true
    },
    quantity: {
      type: Sequelize.DECIMAL,
      required: true,
      default: 1
    },
    rateTotal: {
      type: Sequelize.DECIMAL
    },
    taxRateId: {
      type: Sequelize.INTEGER,
      required: true
    },
    currencyId: {
      type: Sequelize.INTEGER,
      required: true
    },
    siteId: {
      type: Sequelize.INTEGER,
    },
    invoiceId: {
      type: Sequelize.INTEGER,
    },
    addedToInvoiceTime: {
      type: Sequelize.DATE
    },
    notes: {
      type: Sequelize.STRING,
    },
    addedByUserId: {
      type: Sequelize.INTEGER,
      required: true
    },
    siteZoneId: {
      type: Sequelize.INTEGER
    },
    licenceProductId: {
      type: Sequelize.INTEGER
    }
  }, {
    timestamps: false,
    freezeTableName: true
  });

  ChargeRegister.associate = function (models) {
    this.belongsTo(models.client, {
      foreignKey: 'clientId'
    });
    this.belongsTo(models.site, {
      foreignKey: 'siteId'
    });  
    this.belongsTo(models.currency, {
      foreignKey: 'currencyId'
    });
    this.belongsTo(models.product, {
      foreignKey: 'productId'
    });
    this.belongsTo(models.taxRate, {
      foreignKey: 'taxRateId'
    });
    this.belongsTo(models.user, {
      foreignKey: 'addedByUserId'
    });
    this.belongsTo(models.invoice, {
      foreignKey: 'invoiceId'
    });
    this.belongsTo(models.user, {
      foreignKey: 'addedByUserId'
    });
    this.belongsTo(models.siteZone, {
      foreignKey: 'siteZoneId'
    });
    this.belongsTo(models.productChargeType, {
      foreignKey: 'productChargeTypeId'
    })
    this.belongsTo(models.licenceProduct, {
      foreignKey: 'licenceProductId'
    })
    this.belongsTo(models.siteProductPricing, {
      foreignKey: 'siteProductPricingId'
    })
    this.hasMany(models.roomReservation, {
      foreignKey: 'chargeRegisterId'
    });
  };
 

  return ChargeRegister;
};

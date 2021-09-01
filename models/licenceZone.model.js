module.exports = (sequelize, Sequelize) => {
  const LicenceZone = sequelize.define("licenceZone", {
    licenceZoneId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    licenceId: {
      type: Sequelize.INTEGER,
      required: true
    },
    siteZoneId: {
      type: Sequelize.INTEGER,
      required: true
    },
    productChargeTypeId: {
      type: Sequelize.INTEGER,
      required: true
    },
    rate: {
      type: Sequelize.DECIMAL,
      required: true
    },
    taxRateId: {
      type: Sequelize.INTEGER,
      required: true
    },
    startDate: {
      type: Sequelize.DATE,
      default: Sequelize.fn('GETDATE'),
      required: true
    },
    notes: {
      type: Sequelize.STRING,
    },
    active: {
      type: Sequelize.BOOLEAN,
      required: true
    },
  }, {
    timestamps: false
  });

  LicenceZone.associate = function (models) {
    this.belongsTo(models.licence, {
      foreignKey: 'licenceId'
    });
    this.belongsTo(models.siteZone, {
      foreignKey: 'siteZoneId'
    });  
    this.belongsTo(models.productChargeType, {
      foreignKey: 'productChargeTypeId'
    });
    this.belongsTo(models.taxRate, {
      foreignKey: 'taxRateId'
    });  
  };
 
  return LicenceZone;
};

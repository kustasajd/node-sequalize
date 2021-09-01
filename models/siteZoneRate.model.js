module.exports = (sequelize, Sequelize) => {
  const SiteZoneRate = sequelize.define("siteZoneRate", {
    siteZoneRateId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    siteZoneId: {
      type: Sequelize.INTEGER,
      required: true
    },
    productChargeTypeId: {
      type: Sequelize.INTEGER,
      required: true
    },
    rackRate: {
      type: Sequelize.DECIMAL,
      required: true
    },
    taxRateId: {
      type: Sequelize.DECIMAL,
      required: true
    }
  }, {
    timestamps: false
  });

  SiteZoneRate.associate = function (models) {
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

  return SiteZoneRate;
};
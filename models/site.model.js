module.exports = (sequelize, Sequelize) => {
  const Site = sequelize.define("site", {
    siteId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    brandName: {
      type: Sequelize.STRING
    },
    legalName: {
      type: Sequelize.STRING
    },
    addressStreet: {
      type: Sequelize.STRING
    },
    abn: {
      type: Sequelize.STRING
    },
    phone: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    logoUrl: {
      type: Sequelize.STRING
    },
    currencyId: {
      type: Sequelize.INTEGER
    },
    dsUserId: {
      type: Sequelize.STRING
    },
    dsApiAccountId: {
      type: Sequelize.STRING
    },
    dsIntegrationId: {
      type: Sequelize.STRING
    },
    floorplanPolygons: {
      type: Sequelize.STRING
    }
  }, {
    timestamps: false
  });

  Site.associate = function (models) {
    this.belongsTo(models.currency, {
        foreignKey: 'currencyId'
    });
    this.hasMany(models.siteUser, {
      foreignKey: 'siteId'
    });
    this.hasMany(models.siteClient, {
      foreignKey: 'siteId'
    });
    this.hasMany(models.siteZone, {
      foreignKey: 'siteId'
    });
  };

  return Site;
};
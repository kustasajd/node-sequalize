module.exports = (sequelize, Sequelize) => {
  const SiteZone = sequelize.define("siteZone", {
    siteZoneId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    siteId: {
      type: Sequelize.INTEGER,
      required: true
    },
    zoneTypeId: {
      type: Sequelize.INTEGER,
      required: true
    },
    buildingLevel: {
      type: Sequelize.INTEGER
    },
    friendlyName: {
      type: Sequelize.STRING
    },
    squareMeters: {
      type: Sequelize.FLOAT
    },
    exclusive: {
      type: Sequelize.BOOLEAN
    },
    availableForClients: {
      type: Sequelize.BOOLEAN
    },
    workstations: {
      type: Sequelize.INTEGER,
      required: true
    },
    floorplanPolygon: {
      type: Sequelize.STRING
    },
    floorplanPosition: {
      type: Sequelize.STRING
    }
  }, {
    timestamps: false
  });

  SiteZone.associate = function (models) {
    this.belongsTo(models.site, {
      foreignKey: 'siteId'
    });
    this.belongsTo(models.zoneType, {
      foreignKey: 'zoneTypeId'
    });
    this.hasMany(models.siteZoneRate, {
      foreignKey: 'siteZoneId'
    });
    this.hasMany(models.licenceZone, {
      foreignKey: 'siteZoneId'
    });
  };

  return SiteZone;
};
module.exports = (sequelize, Sequelize) => {
  const SiteClient = sequelize.define("siteClient", {
    siteClientId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    siteId: {
      type: Sequelize.INTEGER,
      required: true
    },
    clientId: {
      type: Sequelize.INTEGER,
      required: true
    },
    active: {
      type: Sequelize.BOOLEAN,
      required: true
    },
  }, {
    timestamps: false
  });

  SiteClient.associate = function (models) {
    this.belongsTo(models.client, {
        foreignKey: 'clientId',
    });
    this.belongsTo(models.site, {
      foreignKey: 'siteId',
    });
  };

  return SiteClient;
};

module.exports = (sequelize, Sequelize) => {
  const SiteUser = sequelize.define("siteUser", {
    siteUserId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    siteId: {
      type: Sequelize.INTEGER,
      required: true
    },
    addedByUserId: {
      type: Sequelize.INTEGER,
      required: true
    },
    userId: {
      type: Sequelize.INTEGER,
      required: true
    },
    active: {
      type: Sequelize.BOOLEAN,
      required: true
    },
    userRoleTypeId: {
      type: Sequelize.INTEGER,
      default: 1,
      required: true
    },
  }, {
    timestamps: false
  });

  SiteUser.associate = function (models) {
    this.belongsTo(models.user, {
        foreignKey: 'userId',
    });
    this.belongsTo(models.userRoleType, {
      foreignKey: 'userRoleTypeId',
    });
    this.belongsTo(models.site, {
      foreignKey: 'siteId',
    });
  };

  return SiteUser;
};

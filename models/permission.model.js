module.exports = (sequelize, Sequelize) => {
  const Permission = sequelize.define("permission", {
    permissionId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING
    },
  }, {
    timestamps: false
  });

  Permission.associate = function (models) {
    this.hasMany(models.userRolePermission, {
      foreignKey: 'permissionId'
    });
  };

  return Permission;
};

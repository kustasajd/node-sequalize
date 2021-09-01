module.exports = (sequelize, Sequelize) => {
  const UserRolePermission = sequelize.define("userRolePermission", {
    userRolePermissionId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userRoleTypeId: {
      type: Sequelize.INTEGER,
      required: true
    },
    permissionId: {
      type: Sequelize.INTEGER,
      required: true
    },
  }, {
    timestamps: false
  });

  UserRolePermission.associate = function (models) {
    this.belongsTo(models.permission, {
        foreignKey: 'permissionId',
    });
    this.belongsTo(models.userRoleType, {
      foreignKey: 'userRoleTypeId',
    });
  };

  return UserRolePermission;
};

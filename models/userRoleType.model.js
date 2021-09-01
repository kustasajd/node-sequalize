module.exports = (sequelize, Sequelize) => {
  const UserRoleType = sequelize.define("userRoleType", {
    userRoleTypeId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      required: true
    },
    description: {
      type: Sequelize.STRING
    },
  }, {
    timestamps: false
  });

  UserRoleType.associate = function (models) {
    this.hasMany(models.userRolePermission, {
      foreignKey: 'userRoleTypeId'
    });
  };

  return UserRoleType;
};

module.exports = (sequelize, Sequelize) => {
  const ClientGroup = sequelize.define("clientGroup", {
    clientGroupId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    clientGroupTypeId: {
      type: Sequelize.INTEGER,
      required: true
    },
    clientId: {
      type: Sequelize.INTEGER,
      required: true
    },
    addedByUserId: {
      type: Sequelize.INTEGER,
      required: true
    },
    active: {
      type: Sequelize.BOOLEAN,
      required: true
    },
    dateAdded: {
      type: Sequelize.DATE,
      default: Sequelize.fn('GETDATE'),
      required: true
    },
  }, {
    timestamps: false
  });

  ClientGroup.associate = function (models) {
    this.belongsTo(models.clientGroupType, {
        foreignKey: 'clientGroupTypeId',
    });
    this.belongsTo(models.user, {
      foreignKey: 'addedByUserId',
    });
  };

  return ClientGroup;
};

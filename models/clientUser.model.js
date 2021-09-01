module.exports = (sequelize, Sequelize) => {
  const ClientUser = sequelize.define(
    'clientUser',
    {
      clientUserId: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      clientUserTypeId: {
        type: Sequelize.INTEGER,
        default: 1,
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
      userId: {
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
      notes: {
        type: Sequelize.STRING,
      },
    },
    {
      timestamps: false
    }
  )

  ClientUser.associate = function (models) {
    this.belongsTo(models.user, {
      foreignKey: 'addedByUserId'
    })
    this.belongsTo(models.user, {
      foreignKey: 'userId'
    })
    this.belongsTo(models.clientUserType, {
      foreignKey: 'clientUserTypeId'
    })
  }

  return ClientUser
}

module.exports = (sequelize, Sequelize) => {
  const LicenceStatusHistory = sequelize.define("licenceStatusHistory", {
    licenceStatusHistoryId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    licenceId: {
      type: Sequelize.INTEGER,
      required: true
    },
    licenceStatusTypeId: {
      type: Sequelize.INTEGER,
      required: true
    },
    timestamp: {
      type: Sequelize.DATE,
      default: Sequelize.fn('GETDATE'),
      required: true
    },
    userId: {
      type: Sequelize.INTEGER
    },
    notes: {
      type: Sequelize.STRING
    },
  }, {
    timestamps: false,
    freezeTableName: true
  });

  LicenceStatusHistory.associate = function (models) {
    this.belongsTo(models.licence, {
      foreignKey: 'licenceId'
    });
    this.belongsTo(models.licenceStatusType, {
      foreignKey: 'licenceStatusTypeId'
    });  
    this.belongsTo(models.user, {
      foreignKey: 'userId'
    });  
  };
 
  return LicenceStatusHistory;
};

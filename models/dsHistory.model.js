module.exports = (sequelize, Sequelize) => {
  const DsHistory = sequelize.define("dsHistory", {
    dsHistoryId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    licenceDocumentId: {
      type: Sequelize.INTEGER,
      required: true
    },
    status: {
      type: Sequelize.STRING
    },
    details: {
      type: Sequelize.STRING
    },
    timestamp: {
      type: Sequelize.DATE,
      default: Sequelize.fn('GETDATE'),
      required: true
    }
  }, {
    timestamps: false,
    freezeTableName: true
  });

  DsHistory.associate = function (models) {
    this.belongsTo(models.licenceDocument, {
      foreignKey: 'licenceDocumentId'
    });
  };
 
  return DsHistory;
};

module.exports = (sequelize, Sequelize) => {
  const InvoiceStatusHistory = sequelize.define("invoiceStatusHistory", {
    invoiceStatusHistoryId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    invoiceId: {
      type: Sequelize.INTEGER,
      required: true
    },
    invoiceStatusTypeId: {
      type: Sequelize.INTEGER,
      required: true
    },
    timestamp: {
      type: Sequelize.DATE,
      default: Sequelize.fn('GETDATE'),
      required: true
    },
    updatedByUserId: {
      type: Sequelize.INTEGER
    }
  }, {
    timestamps: false,
    freezeTableName: true
  });

  InvoiceStatusHistory.associate = function (models) {
    this.belongsTo(models.invoice, {
      foreignKey: 'invoiceId'
    });
    this.belongsTo(models.invoiceStatusType, {
      foreignKey: 'invoiceStatusTypeId'
    });  
    this.belongsTo(models.user, {
      foreignKey: 'updatedByUserId'
    });  
  };
 
  return InvoiceStatusHistory;
};

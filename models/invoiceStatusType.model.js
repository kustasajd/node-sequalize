module.exports = (sequelize, Sequelize) => {
  const InvoiceStatusType = sequelize.define("invoiceStatusType", {
    invoiceStatusTypeId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    status: {
      type: Sequelize.STRING,
      required: true
    },
    color: {
      type: Sequelize.STRING,
      required: true
    },
  }, {
    timestamps: false
  });
 
  return InvoiceStatusType;
};

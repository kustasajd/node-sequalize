module.exports = (sequelize, Sequelize) => {
  const PaymentType = sequelize.define("paymentType", {
    paymentTypeId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    type: {
      type: Sequelize.STRING,
      required: true
    },
  }, {
    timestamps: false
  });

  return PaymentType;
};

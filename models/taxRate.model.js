module.exports = (sequelize, Sequelize) => {
  const TaxRate = sequelize.define("taxRate", {
    taxRateId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    tax: {
      type: Sequelize.STRING,
      required: true
    },
    description: {
      type: Sequelize.STRING
    },
    taxPercentage: {
      type: Sequelize.FLOAT,
      required: true
    },
  }, {
    timestamps: false
    }
  );  

  return TaxRate;
};

module.exports = (sequelize, Sequelize) => {
  const ProductChargeType = sequelize.define("productChargeType", {
    productChargeTypeId: {
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
    }
  );  

  return ProductChargeType;
};

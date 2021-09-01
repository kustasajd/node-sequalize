module.exports = (sequelize, Sequelize) => {
  const Currency = sequelize.define("currency", {
    currencyId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING
    },
    symbol: {
      type: Sequelize.STRING
    },
    abbreviation: {
      type: Sequelize.STRING
    },
  }, {
    timestamps: false
  });

  return Currency;
};

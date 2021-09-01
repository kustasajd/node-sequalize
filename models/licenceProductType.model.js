module.exports = (sequelize, Sequelize) => {
  const LicenceProductType = sequelize.define("licenceProductType", {
    licenceProductTypeId: {
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

  return LicenceProductType;
};

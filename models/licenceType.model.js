module.exports = (sequelize, Sequelize) => {
  const LicenceType = sequelize.define("licenceType", {
    licenceTypeId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      required: true
    },
    description: {
      type: Sequelize.STRING
    },
    active: {
      type: Sequelize.BOOLEAN,
      required: true
    },
  }, {
    timestamps: false
  });

  return LicenceType;
};

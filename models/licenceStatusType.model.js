module.exports = (sequelize, Sequelize) => {
  const LicenceStatusType = sequelize.define("licenceStatusType", {
    licenceStatusTypeId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
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

  return LicenceStatusType;
};

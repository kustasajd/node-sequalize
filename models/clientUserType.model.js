module.exports = (sequelize, Sequelize) => {
  const ClientUserType = sequelize.define("clientUserType", {
    clientUserTypeId: {
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
  }, {
    timestamps: false
  });

  return ClientUserType;
};

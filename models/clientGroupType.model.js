module.exports = (sequelize, Sequelize) => {
  const ClientGroupType = sequelize.define("clientGroupType", {
    clientGroupTypeId: {
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

  return ClientGroupType;
};

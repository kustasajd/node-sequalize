module.exports = (sequelize, Sequelize) => {
  const ZoneType = sequelize.define("zoneType", {
    zoneTypeId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      required: true
    },
  }, {
    timestamps: false
  });

  return ZoneType;
};

module.exports = (sequelize, Sequelize) => {
  const LogsChange = sequelize.define("logsChange", {
    logsChangeId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    tableName: {
      type: Sequelize.STRING,
    },
    referenceId: {
      type: Sequelize.INTEGER
    },
    columnName: {
      type: Sequelize.STRING
    },
    changedByUserId: {
      type: Sequelize.INTEGER
    },
    oldValue: {
      type: Sequelize.STRING
    },
    timestamp: {
      type: Sequelize.DATE,
      default: Sequelize.fn('GETDATE'),
      required: true
    }
  }, {
    timestamps: false
  });

  return LogsChange;
};

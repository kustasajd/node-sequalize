module.exports = (sequelize, Sequelize) => {
  const LogsApi = sequelize.define("logsApi", {
    logApiId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    path: {
      type: Sequelize.STRING,
    },
    userId: {
      type: Sequelize.STRING,
    },
    resStatusCode: {
      type: Sequelize.INTEGER,
    },
    resTime: {
      type: Sequelize.INTEGER,
    },
    method: {
      type: Sequelize.STRING,
    }
  }, {
    timestamps: false,
    freezeTableName: true
  });
 
  return LogsApi;
};

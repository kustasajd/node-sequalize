module.exports = (sequelize, Sequelize) => {
  const Export = sequelize.define("export", {
    exportId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      required: true
    },
    docUrl: {
      type: Sequelize.STRING
    },
    exportedByUserId: {
      type: Sequelize.INTEGER,
      required: true
    },
    timestamp: {
      type: Sequelize.DATE,
      default: Sequelize.fn('GETDATE'),
      required: true
    },
    invoiceId: {
      type: Sequelize.INTEGER
    },
    licenceId: {
      type: Sequelize.INTEGER
    }
  }, {
    timestamps: false
  });

  Export.associate = function (models) {
    this.belongsTo(models.licence, {
      foreignKey: 'licenceId'
    });
  };

  return Export;
};

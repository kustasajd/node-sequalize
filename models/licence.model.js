module.exports = (sequelize, Sequelize) => {
  const Licence = sequelize.define("licence", {
    licenceId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    licenceTypeId: {
      type: Sequelize.INTEGER,
      required: true
    },
    licenceStatusTypeId: {
      type: Sequelize.INTEGER,
      required: true
    },
    clientId: {
      type: Sequelize.INTEGER,
      required: true
    },
    siteId: {
      type: Sequelize.INTEGER,
      required: true
    },
    createDate: {
      type: Sequelize.DATE,
      default: Sequelize.fn('GETDATE'),
      required: true
    },
    createdByUserId: {
      type: Sequelize.INTEGER,
      required: true
    },
    licenceStart: {
      type: Sequelize.DATE
    },
    validUntil: {
      type: Sequelize.DATE
    },
    notes: {
      type: Sequelize.STRING,
    },
    active: {
      type: Sequelize.BOOLEAN,
      required: true
    },
    invoicingDay: {
      type: Sequelize.INTEGER,
      required: true
    },
    paymentTermsDaysFromInvoice: {
      type: Sequelize.INTEGER,
      required: true
    },
    furnitureNote: {
      type: Sequelize.STRING,
    },
    terminationDate: {
      type: Sequelize.DATE,
    }
  }, {
    timestamps: false
  });

  Licence.associate = function (models) {
    this.hasMany(models.licenceProduct, {
      foreignKey: 'licenceId'
    });    
    this.hasMany(models.licenceDocument, {
      foreignKey: 'licenceId'
    });
    this.hasMany(models.licenceZone, {
      foreignKey: 'licenceId'
    });
    this.hasMany(models.licenceStatusHistory, {
      foreignKey: 'licenceId'
    });
    this.belongsTo(models.licenceType, {
      foreignKey: 'licenceTypeId'
    });
    this.belongsTo(models.site, {
      foreignKey: 'siteId'
    });  
    this.belongsTo(models.client, {
      foreignKey: 'clientId'
    });
    this.belongsTo(models.licenceStatusType, {
      foreignKey: 'licenceStatusTypeId'
    });
    this.hasMany(models.export, {
      foreignKey: 'licenceId'
    });
  };

  return Licence;
};

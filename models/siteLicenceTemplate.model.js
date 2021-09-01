module.exports = (sequelize, Sequelize) => {
  const SiteLicenceTemplate = sequelize.define("siteLicenceTemplate", {
    siteLicenceTemplateId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    siteId: {
      type: Sequelize.INTEGER,
      required: true
    },
    licenceTypeId: {
      type: Sequelize.INTEGER,
      required: true
    },
    active: {
      type: Sequelize.BOOLEAN,
      required: true
    },
    name: {
      type: Sequelize.STRING
    },
    invoicingDay: {
      type: Sequelize.INTEGER,
      required: true
    },
    paymentTermsDaysFromInvoice: {
      type: Sequelize.INTEGER,
      required: true
    }
  }, {
    timestamps: false
  });

  SiteLicenceTemplate.associate = function (models) {
    this.belongsTo(models.licenceType, {
        foreignKey: 'licenceTypeId'
    });
    this.belongsTo(models.site, {
      foreignKey: 'siteId'
    });
    this.hasMany(models.siteLicenceDocument, {
      foreignKey: 'siteLicenceTemplateId'
    });
    this.hasMany(models.siteLicenceProduct, {
      foreignKey: 'siteLicenceTemplateId'
    });
  };

  return SiteLicenceTemplate;
};

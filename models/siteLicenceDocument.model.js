module.exports = (sequelize, Sequelize) => {
  const SiteLicenceDocument = sequelize.define("siteLicenceDocument", {
    siteLicenceDocumentId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    siteLicenceTemplateId: {
      type: Sequelize.INTEGER,
      required: true
    },
    name: {
      type: Sequelize.STRING,
      required: true
    },
    description: {
      type: Sequelize.STRING
    },
    docUrl: {
      type: Sequelize.STRING
    },
    isDocuSign: {
      type: Sequelize.BOOLEAN,
      require: true,
      default: false
    },
    docuSignTemplateRef: {
      type: Sequelize.STRING
    },
  }, {
    timestamps: false
  });

  return SiteLicenceDocument;
};

module.exports = (sequelize, Sequelize) => {
  const LicenceDocument = sequelize.define("licenceDocument", {
    licenceDocumentId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    licenceId: {
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
    originalDocUrl: {
      type: Sequelize.STRING
    },
    returnedDocUrl: {
      type: Sequelize.STRING
    },
    needSend: {
      type: Sequelize.BOOLEAN
    },
    needSign: {
      type: Sequelize.BOOLEAN
    },
    needCounterSign: {
      type: Sequelize.BOOLEAN
    },
    sent: {
      type: Sequelize.BOOLEAN
    },
    signed: {
      type: Sequelize.BOOLEAN
    },
    counterSigned: {
      type: Sequelize.BOOLEAN
    },
    isDocuSign: {
      type: Sequelize.BOOLEAN,
      require: true,
      default: false
    },
    docuSignDocumentRef: {
      type: Sequelize.STRING
    },
  }, {
    timestamps: false
  });

  return LicenceDocument;
};

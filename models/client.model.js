module.exports = (sequelize, Sequelize) => {
  const Client = sequelize.define("client", {
    clientId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    tradingName: {
      type: Sequelize.STRING,
      required: true
    },
    legalName: {
      type: Sequelize.STRING
    },
    primaryContact: {
      type: Sequelize.STRING
    },
    email: {
      type: Sequelize.STRING
    },
    phone: {
      type: Sequelize.STRING
    },
    mobile: {
      type: Sequelize.STRING
    },
    website: {
      type: Sequelize.STRING
    },
    profilePic: {
      type: Sequelize.STRING
    },
    abn: {
      type: Sequelize.STRING
    },
    openingBalance: {
      type: Sequelize.DECIMAL,
      required: true,
      default: 0
    },
  }, {
    timestamps: false
  });

  Client.associate = function (models) {
    this.hasMany(models.clientUser, {
      foreignKey: 'clientId'
    });
    this.hasMany(models.licence, {
      foreignKey: 'clientId'
    });
    this.hasMany(models.chargeRegister, {
      foreignKey: 'clientId'
    });
    this.hasMany(models.invoice, {
      foreignKey: 'clientId'
    });
    this.hasMany(models.payment, {
      foreignKey: 'clientId'
    });
  };

  return Client;
};
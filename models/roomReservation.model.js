module.exports = (sequelize, Sequelize) => {
  const RoomReservation = sequelize.define("roomReservation", {
    roomReservationId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    siteZoneId: {
      type: Sequelize.INTEGER,
      required: true
    },
    clientId: {
      type: Sequelize.INTEGER,
      required: true
    },
    timeStart: {
      type: Sequelize.DATE,
      default: Sequelize.fn('GETDATE'),
      required: true
    },
    timeEnd: {
      type: Sequelize.DATE,
      default: Sequelize.fn('GETDATE'),
      required: true
    },
    addedByUserId: {
      type: Sequelize.INTEGER,
      required: true
    },
    addedTime: {
      type: Sequelize.DATE
    },
    chargeRegisterId: {
      type: Sequelize.INTEGER
    },
  }, {
    timestamps: false
  });

  RoomReservation.associate = function (models) {
    this.belongsTo(models.siteZone, {
      foreignKey: 'siteZoneId'
    });
    this.belongsTo(models.client, {
      foreignKey: 'clientId'
    });
    this.belongsTo(models.user, {
      foreignKey: 'addedByUserId'
    });
    this.belongsTo(models.chargeRegister, {
      foreignKey: 'chargeRegisterId'
    });
  };

  return RoomReservation;
};
module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define("user", {
    userId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    fullName: {
      type: Sequelize.STRING,
      required: true
    },
    email: {
      type: Sequelize.STRING
    },
    password: {
      type: Sequelize.STRING
    },
    profilePic: {
      type: Sequelize.STRING
    },
    profileImg: {
      type: Sequelize.STRING
    },
    position: {
      type: Sequelize.STRING
    },
    lastLogin: {
      type: Sequelize.DATE
    }
  }, {
    timestamps: false
  });

  User.associate = function (models) {
    this.hasMany(models.siteUser, {
      foreignKey: 'userId'
    });
  };

  return User;
};

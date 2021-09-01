module.exports = (sequelize, Sequelize) => {
  const Product = sequelize.define("product", {
    productId: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      required: true
    },
    description: {
      type: Sequelize.STRING
    },
    icon: {
      type: Sequelize.STRING
    },
  }, {
    timestamps: false
  });  

  Product.associate = function (models) {
    this.hasMany(models.siteProduct, {
      foreignKey: 'productId'
    });
    this.hasMany(models.chargeRegister, {
      foreignKey: 'productId'
    });
  };

  return Product;
};

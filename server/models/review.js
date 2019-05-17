module.exports = (sequelize, Sequelize) => {
  class Review extends Sequelize.Model { }
  Review.init({
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    body: {
      type: Sequelize.STRING,
      allowNull: false
    },
    point:{
      type: Sequelize.GEOMETRY('POINT', 4326)
    }

  }, {
    sequelize,
    modelName: 'reviews',
    timestamps: true,
    freezeTableName: true
  })
  return Review
}

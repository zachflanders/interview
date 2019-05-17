const Sequelize = require('sequelize');
const dotenv = require("dotenv");
const ReviewModel = require('./review');


dotenv.config()
//Connect to Database
const sequelize = new Sequelize(process.env.DATABASE , process.env.USERNAME, process.env.PASSWORD, {
  host: process.env.HOSTURL,
  dialect: 'postgres',
  ssl: false,
  dialectOptions: {
    ssl: false
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const Review = ReviewModel(sequelize, Sequelize);

sequelize
  .authenticate()
  .then(() => {
    console.log('Connected to database.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

  let sync = ()=>{
    sequelize
    .sync()
    .then(() => {
      console.log(`Database & tables created!`)
    })
  }

  //check to see if POSTGIS is installed, install it if not, and then sync
  sequelize
  .query("SELECT * FROM pg_available_extensions where name='postgis';")
  .then((results)=>{
    let installed = results[0][0].installed_version
    if(installed){
      sync()
    }
    else{
      sequelize.query("CREATE EXTENSION postgis;")
      .then(sync())
    }
  });




  module.exports = {Review, sequelize};

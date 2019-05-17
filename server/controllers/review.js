const {Review, sequelize}  = require('../models');
const axios =require('axios');


exports.getReviews = (req, res) =>{
  console.log("params: ",req.query);
  var bounds = req.query.bounds;
  var query = `SELECT title, body, point, "createdAt" FROM public."reviews" WHERE ST_Contains(ST_MakeEnvelope(${bounds[0]},${bounds[1]},${bounds[2]}, ${bounds[3]}, 4326), point) ORDER BY random() ASC LIMIT 50;`
  sequelize.query(query).then(data => {
    res.send({
      data,
    })
  })
};

exports.createReview = (req, res) =>{
  let review = req.body.review;
  //Check if they geocoded on the client, only geocode on server if coordinates are not given
  console.log(review.coordinates);
  if(review.coordinates === undefined || review.coordinates.length == 0){
    console.log('no coords');
    axios.get(`https://nominatim.openstreetmap.org/search/${review.address}?format=json&addressdetails=1&limit=1`)
    .then((response)=>{
        //I would want to add some error handling here.
        let coordinates = [Number(response.data[0].lon), Number(response.data[0].lat)];
        review.point = {type:'Point'}
        review.point.coordinates = coordinates;
        review.point.crs = { type: 'name', properties: { name: 'EPSG:4326'}};
        console.log(review.point)
        Review.create(review).then(results => {
          res.status(200).send({
            message: results
          })});
    })
  }
  else{
    review.point = {type:'Point'}
    review.point.coordinates = review.coordinates;
    review.point.crs = { type: 'name', properties: { name: 'EPSG:4326'}};
    console.log(review.point)
    Review.create(review).then(results => {
      res.status(200).send({
        message: results
      })});
  }


};

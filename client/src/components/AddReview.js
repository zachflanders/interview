import React from 'react';
import './AddReview.css'

import axios from 'axios';

//Material-UI Imports
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Snackbar from '@material-ui/core/Snackbar';


//OpenLayers Imports
import Map from 'ol/Map';
import {fromLonLat} from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import View from 'ol/View';
import Zoom from 'ol/control/Zoom';
import XYZ from 'ol/source/XYZ';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import CircleStyle from 'ol/style/Circle';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';
import GeoJSON from 'ol/format/GeoJSON';

let basemapLayers = [];
let map = {};
let source = new VectorSource();
let layer = new VectorLayer({
  source: source,
  style: new Style({
    image:
      new CircleStyle({
        radius: 8,
        stroke: new Stroke({
          color:'#eeeeee',
          width: 1
        }),
        fill: new Fill({
          color: '#2980b9'
        })
      })
  })
});
var writer = new GeoJSON();

class AddReview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '',
      body:'',
      address:'',
      coordinates: [],
      point: {},
      showMessage: false,
      message: ''
    };
    this.searchAddress = this.searchAddress.bind(this);
  }

  closeMessage = () => {
    this.setState({message: false, showMessage: false});
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  searchAddress = () => {
    //I'm uisng the open source nominatim geocoder here.  It is still pretty bad, but I'm a big OSM and opensource nerd, so there you go.
    axios.get(`https://nominatim.openstreetmap.org/search/${this.state.address}?format=json&addressdetails=1&limit=1`)
    .then((response)=>{
        //clear the point from the previous search (if it exists)
        source.clear();
        //if the address is not found display a message to the user
        if(response.data === undefined || response.data.length == 0){
          this.setState({message:'Address not found.', showMessage: true});
        }
        else{
          //save the coordinates in an array
          let coordinates = [Number(response.data[0].lon), Number(response.data[0].lat)];
          //set the coordinates in the state of the component
          this.setState({coordinates: coordinates})
          //set the map centered on the coordinate
          map.setView(new View({
            center: fromLonLat(coordinates),
            zoom: 18,
            maxZoom: 20,
            minZoom: 12
          }));
          //create a feature and add to the map
          let feature = new Feature(new Point(fromLonLat(coordinates)))
          source.addFeature(feature);
          //Create the feature in a geojson format and set the state of the component
          this.setState({point:writer.writeFeatures(source.getFeatures())});
        }

    })
  }
  submit = (event) =>{
    event.preventDefault();
    const {address, title, body, coordinates, point} = this.state;
    const review = {
      address,
      title,
      body,
      coordinates,
      point
    };
    console.log(`${process.env.REACT_APP_API_URL}/api/review/add`);
    axios.post(`${process.env.REACT_APP_API_URL}/api/review/add`, {review:review})
    .then((response)=>{
      this.setState({
        title: '',
        body:'',
        address:'',
        coordinates: [],
        point: {}
      })
      this.setState({message:'Review sucessfully saved.', showMessage: true});
    })
  }

  render(){
    return(
      <div id='AddReview' >
        <Card id='addForm'>
          <CardContent>
            <h3>Add Review</h3>
            <form noValidate autoComplete="off">
              <div style={{display:'flex'}}>
                <TextField
                  id="address"
                  label="Address"
                  className='formInput'
                  fullWidth
                  value={this.state.address}
                  onChange={this.handleChange('address')}
                  margin="normal"
                />
                <Button
                  onClick={this.searchAddress}
                >Find</Button>
              </div>
              <div id='addReviewMap' />
              <TextField
                id="title"
                label="Title"
                className='formInput'
                fullWidth
                value={this.state.title}
                onChange={this.handleChange('title')}
                margin="normal"
              />
              <TextField
                id="body"
                label="Review"
                multiline
                rowsMax="4"
                value={this.state.body}
                onChange={this.handleChange('body')}
                className='formInput'
                fullWidth
                margin="normal"
              />
            </form>
            <Button
              type='submit'
              variant='contained'
              color='primary'
              onClick={this.submit}
            >
             Submit
            </Button>
          </CardContent>
        </Card>
        <Snackbar
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          open={this.state.showMessage}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">{this.state.message}</span>}
          autoHideDuration = {2000}
          onClose={()=>this.closeMessage()}
          />
      </div>
    )
  }
  componentDidMount(){
    basemapLayers.push(new TileLayer({
      source: new XYZ({url: 'http://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png'})

    }));
    map = new Map({
        target: 'addReviewMap',
        layers: basemapLayers.concat(layer),
        view: new View({
          center: fromLonLat([-94.586002,39.104693]),
          zoom: 14,
          maxZoom: 20,
          minZoom: 12
        }),
        controls: [
          new Zoom({
            className: 'zoom-control'
          })
        ]
      });

  }
}

export default AddReview;

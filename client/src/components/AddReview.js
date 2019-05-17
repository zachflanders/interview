import React from 'react';
import './AddReview.css'

import axios from 'axios';

//Material-UI Imports
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

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
      point: {}
    };
    this.searchAddress = this.searchAddress.bind(this);
  }

  handleChange = name => event => {
    this.setState({ [name]: event.target.value });
  };

  searchAddress = () => {
    axios.get(`https://nominatim.openstreetmap.org/search/${this.state.address}?format=json&addressdetails=1&limit=1`)
    .then((response)=>{
        //I would want to add some error handling here.
        let coordinates = [Number(response.data[0].lon), Number(response.data[0].lat)];
        this.setState({coordinates: coordinates})
        map.setView(new View({
          center: fromLonLat(coordinates),
          zoom: 18,
          maxZoom: 20,
          minZoom: 12
        }));
        let feature = new Feature(new Point(fromLonLat(coordinates)))
        source.addFeature(feature);
        this.setState({point:writer.writeFeatures(source.getFeatures())});
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
    console.log(review);
    axios.post(`${process.env.REACT_APP_API_URL}/api/review/add`, {review:review})
    .then((response)=>{
      console.log(response);
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
              <div id='map' />
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
      </div>
    )
  }
  componentDidMount(){
    basemapLayers.push(new TileLayer({
      source: new XYZ({url: 'http://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png'})

    }));
    map = new Map({
        target: 'map',
        layers: basemapLayers.concat(layer),
        controls: [
          new Zoom({
            className: 'zoom-control'
          })
        ]
      });

  }
}

export default AddReview;

import React from 'react';
import Sidebar from './Sidebar';
import './ViewReviews.css'

import axios from 'axios';

//Openloads imports
import 'ol/ol.css';
import Map from 'ol/Map';
import {fromLonLat} from 'ol/proj';
import {transformExtent} from 'ol/proj';
import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import View from 'ol/View';
import Zoom from 'ol/control/Zoom';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import CircleStyle from 'ol/style/Circle';
import Point from 'ol/geom/Point';
import Feature from 'ol/Feature';

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
          color:'#fefefe',
          width: 2
        }),
        fill: new Fill({
          color: '#2980b9'
        })
      })
  })
});

class ViewReviews extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      reviews:{}
    };
  }
  reloadResults(){
    let bounds = transformExtent(map.getView().calculateExtent(map.getSize()),'EPSG:3857','EPSG:4326');
    axios.get(`${process.env.REACT_APP_API_URL}/api/reviews`, {
      params: {
        bounds
      }
    })
    .then(res=>{
      source.clear();
      this.setState({reviews:res.data.data[0]})
      res.data.data[0].forEach(feature=>{
        let point = new Feature(new Point(fromLonLat(feature.point.coordinates)))
        source.addFeature(point);
      })

    })

  }
  render(){
    return(
      <div id='ViewReviews'>
        <div id='map' style={{flexGrow: 1}} />
        <Sidebar
          reviews={this.state.reviews}
        />
      </div>
    )
  }
  componentDidMount(){
    basemapLayers.push(new TileLayer({
      source: new TileWMS({
        //I am hosting a geoserver instance to serve my own maps
        url: 'http://ec2-34-214-28-139.us-west-2.compute.amazonaws.com/geoserver/wms',
        params: {'LAYERS': 'Mapalize:KC-Basemap-Light', 'TILED': true},
        serverType: 'geoserver',
        transition: 0
      })
    }));

    //Set up the map on component load
    map = new Map({
        target: 'map',
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

      //Refresh map on move, kind of like airbnb or zillow.
      map.on('moveend', function(){
        this.reloadResults();
      }.bind(this));

      //get the bounds of current map extent and send to API
      let bounds = transformExtent(map.getView().calculateExtent(map.getSize()),'EPSG:3857','EPSG:4326');
      axios.get(`${process.env.REACT_APP_API_URL}/api/reviews`, {
        params: {
          bounds
        }
      })
      .then(res=>{
        console.log(res);
        this.setState({reviews:res.data.data[0]})
        res.data.data[0].forEach(feature=>{
          let point = new Feature(new Point(fromLonLat(feature.point.coordinates)))
          source.addFeature(point);
        })

      })

  }
}

export default ViewReviews;

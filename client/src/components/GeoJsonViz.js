import React from 'react';
import './ViewReviews.css'
import kcTracts from '../assets/kc-tract.json'
import kcNeighborhoods from '../assets/kc-neighborhoods.json'

//Openloads imports
import 'ol/ol.css';
import Map from 'ol/Map';
import GeoJSON from 'ol/format/GeoJSON.js';
import {fromLonLat} from 'ol/proj';

import TileLayer from 'ol/layer/Tile';
import TileWMS from 'ol/source/TileWMS';
import View from 'ol/View';
import Zoom from 'ol/control/Zoom';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Stroke from 'ol/style/Stroke';
import Fill from 'ol/style/Fill';
import Select from 'ol/interaction/Select.js';
import Overlay from 'ol/Overlay';
import {click, pointermove} from 'ol/events/condition.js';

import centerOfMass from '@turf/center-of-mass';

import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';

import * as d3 from 'd3'

import './GeoJsonViz.css';

const writer = new GeoJSON();

let basemapLayers = [];

let source = new VectorSource({
  features: (writer).readFeatures(kcTracts, {dataProjection:'EPSG:4326', featureProjection:'EPSG:3857'} )
});

let layer = new VectorLayer({
  source: source,
  style: new Style({
      stroke: new Stroke({
        color: '#3498db',
        width: 1
      }),
      fill: new Fill({
        color: 'rgba(52, 152, 219, 0.4)'
      })
    })
});

class GeoJsonViz extends React.Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  renderChart(data){

    //Note, I used 'https://blog.risingstack.com/d3-js-tutorial-bar-charts-with-javascript/' as a guide.
    this.setState({chartInit: true});
    console.log(data);
    const margin = 35;
    const width = 300 - 2 * margin;
    const height = 200 - 2 * margin;
    const svg = d3.select('svg');
    svg.selectAll("*").remove();
    const chart = svg.append('g')
      .attr('transform', `translate(${margin}, ${margin})`);
      const yScale = d3.scaleLinear()
      .range([height, 0])
      .domain([0 ,d3.max(data, function(d){return d.value})]);
      chart.append('g')
      .call(d3.axisLeft(yScale));

      const xScale = d3.scaleBand()
      .range([0, width])
      .domain(data.map((s) => s.mode))
      .padding(0.2)

  chart.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale));

    chart.selectAll()
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (s) => xScale(s.mode))
      .attr('y', (s) => yScale(s.value))
      .attr('height', (s) => height - yScale(s.value))
      .attr('width', xScale.bandwidth())
      .attr('class', 'bar');

    svg.append('text')
        .attr('x', width / 2 + margin)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .text('Commuting Patterns')
  }

  switchMaps(layer){
    console.log(layer);
    if(layer === 'neighborhoods'){
      source.clear();
      source.addFeatures((writer).readFeatures(kcNeighborhoods, {dataProjection:'EPSG:4326', featureProjection:'EPSG:3857'}))

    }
    else{
      source.clear();
      source.addFeatures((writer).readFeatures(kcTracts, {dataProjection:'EPSG:4326', featureProjection:'EPSG:3857'}))

    }
  }

  render(){
    return(

      <div id='gejsonMapViz'>
        <Paper id='switcher' >
          <Button onClick={()=>this.switchMaps('tracts')}>View Census Tracts</Button><br />
          <Button onClick={()=>this.switchMaps('neighborhoods')}>View Neighborhoods</Button>
        </Paper>

        <div id='geojsonMap' />

        <Paper id='popover' >
          <svg />
          <div className='arrow'></div>
        </Paper>
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

    //setting up overlay
    let overlay = new Overlay({
      autoPan: true,
      autoPanAnimation: {
        duration: 250
      }
    });
    let container = document.getElementById('popover');
    overlay.setElement(container);

    //Set up the map on component load
    let map = new Map({
        target: 'geojsonMap',
        layers: basemapLayers.concat(layer),
        overlays: [overlay],
        view: new View({
          center: fromLonLat([-94.586002,39.104693]),
          zoom: 14,
          maxZoom: 20,
          minZoom: 12,
          //I would probably prefer to reproject the geojson files into EPSG:3857 because this makes the map look distorted
        }),
        controls: [
          new Zoom({
            className: 'zoom-control'
          })
        ]
      });

      //change cursor when hovering over feature
      map.on('pointermove', function(e) {
        var pixel = map.getEventPixel(e.originalEvent);
        var hit = map.hasFeatureAtPixel(pixel);
        document.getElementById(map.getTarget()).style.cursor = hit ? 'pointer' : '';
      });


      //select features
      var select = new Select({
        condition: pointermove,
        layers: [layer],
        style:new Style({
            stroke: new Stroke({
              color: 'rgba(41, 128, 185,1.0)',
              width: 2
            }),
            fill: new Fill({
              color: 'rgba(41, 128, 185,0.4)'
            })
          })
      });
      map.addInteraction(select);
      select.on('select', function(e) {
        console.log(e);
        var selectedFeature = e.selected[0];
        if(selectedFeature){
          console.log(e.selected[0].getProperties())
          console.log(e.selected[0].getProperties().geometry);

          //convert to turf.js line to use centroid function
          let turfCentroid = centerOfMass(writer.writeFeatureObject(selectedFeature));
          //convert back to openlayers line
          let olCentroid = writer.readFeature(turfCentroid);
          //get Coordinate
          let coordinate = olCentroid.getGeometry().getCoordinates();
          //set Overlay to centroid
          overlay.setPosition(coordinate);
          let properties = selectedFeature.getProperties()
          let data = [
            {
              mode: "drove alone",
              value: properties["pop-commute-drive_alone"]
            },
            {
              mode: "carpool",
              value:properties["pop-commute-drive_carpool"]
            },
            {
              mode: "transit",
              value:properties["pop-commute-public_transit"]
            },
            {
              mode: "walk",
              value:properties["pop-commute-walk"]
            }];
            this.renderChart(data);
        }
        else{
          console.log(e, 'nothing selected');
          overlay.setPosition(undefined);
        }
      }.bind(this));
  }
}

export default GeoJsonViz;

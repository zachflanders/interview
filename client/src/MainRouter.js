import React from 'react';
import {Route, Switch} from 'react-router-dom';
import Nav from './components/Nav';
import ViewReviews from './components/ViewReviews';
import AddReview from './components/AddReview'
import GeoJsonViz from './components/GeoJsonViz'



const MainRouter = () => (
  <div id='App'>
    <Nav />
    <Switch>
      <Route exact path='/' component={ViewReviews}></Route>
      <Route exact path='/reviews' component={ViewReviews}></Route>
      <Route exact path='/review/add' component={AddReview}></Route>
      <Route exact path='/geojson' component={GeoJsonViz}></Route>
    </Switch>
  </div>
)

export default MainRouter;

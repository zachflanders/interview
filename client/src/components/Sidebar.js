import React from 'react';
import './Sidebar.css';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

class Sidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render(){
    let cards;
    //if there are reviews, loop over the reviews and create cards.
    if(!isEmpty(this.props.reviews)){
      cards = this.props.reviews.map(review=>{
        return (
          <Card style={{marginBottom:'20px'}}>
            <CardContent>
              <h4>{review.title}</h4>
              <p>{review.body}</p>
            </CardContent>
          </Card>
        )
      })
    }
    return(
        <div id='sidebar'>
          {cards}
        </div>
    )
  }

}

export default Sidebar;

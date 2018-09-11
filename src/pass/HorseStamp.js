import React, { Component } from 'react';
import './HorseStamp.css';
import horseStamp from '../horseStamp.svg';

class HorseStamp extends Component {

    render() {
        return (
            <section className="horseico-circle" style={{backgroundColor: "orange"}}>
                <img height="90%" width="auto" src={this.props.horseStamp}/>
            </section>
        )
    }
}


export default HorseStamp;
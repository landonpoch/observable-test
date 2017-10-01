import * as React from 'react';
import './App.css';
import getRibbon, { Tile as ITile } from './csl';
import { map } from 'lodash';

const logo = require('./logo.svg');

class Tile extends React.Component {
  public props: { tile: ITile };
  public state: { currentProgress: number | undefined; isOnNow: boolean; };
  constructor(props: { tile: ITile }) {
    super(props);
    const rightNow = new Date().getTime();
    const startTime = props.tile.startTime.getTime();
    const endTime = props.tile.endTime.getTime();
    const isOnNow = startTime < rightNow && rightNow < endTime;
    const currentProgress = isOnNow ? (rightNow - startTime) / (endTime - startTime) : undefined;
    this.state = { currentProgress, isOnNow };

    // Observables
    this.props.tile.isOnNow.subscribe(val => { this.setState({ isOnNow: val }); });
    this.props.tile.currentProgress.subscribe(val => { this.setState({ currentProgress: val }); });
  }
  render() {
    return (
      <div className="tile">
        <div className="image-container">
          <img src={this.props.tile.thumbnail} />
          {this.state.isOnNow && this.state.currentProgress ? 
            <div 
              className="progress-indicator" 
              style={{'width': ((this.state.currentProgress * 100).toFixed(2) + '%')}}
            /> : undefined}
          {this.state.isOnNow ?
            <div className="on-now-div"><span className="on-now">On Now</span></div> : undefined}
        </div>
        <div className="tile-metadata">
          {this.props.tile.title}<br />
          {this.props.tile.startTime.toLocaleTimeString()}
        </div>
      </div>
    );
  }
}

class Ribbon extends React.Component {
  public state: { title: string, tiles: ITile[] };
  constructor(props: {}) {
    super(props);
    const ribbon = getRibbon();
    this.state = { title: ribbon.title, tiles: ribbon.initialTiles };

    // Observable
    ribbon.tiles.subscribe(val => { this.setState({ tiles: val }); });
  }
  render() {
    return (
      <div>
        <span className="ribbon-title">{this.state.title}</span>
        <div className="ribbon">{map(this.state.tiles, t => <Tile key={t.id} tile={t} />)}</div>
      </div>
    );
  }
}

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to a rediculous demo of observables</h2>
        </div>
        <div className="App-intro">
          <Ribbon />
        </div>
      </div>
    );
  }
}

export default App;

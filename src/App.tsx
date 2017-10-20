import * as React from 'react';
import './App.css';
import getRibbon, { Tile as ITile, Ribbon as IRibbon } from './csl';
import { map } from 'lodash';
import { IDisposable } from 'rx';

const logo = require('./logo.svg');

class Tile extends React.Component {
  public props: { tile: ITile };
  public state: { currentProgress: number | undefined; isOnNow: boolean; };
  private onNowSub: IDisposable;
  private progressSub: IDisposable;
  constructor(props: { tile: ITile }) {
    super(props);
  }

  public componentWillMount() {
    const rightNow = new Date().getTime();
    const startTime = this.props.tile.startTime.getTime();
    const endTime = this.props.tile.endTime.getTime();
    const isOnNow = startTime < rightNow && rightNow < endTime;
    const currentProgress = isOnNow ? (rightNow - startTime) / (endTime - startTime) : undefined;
    this.setState({ currentProgress, isOnNow });
    
    // Observables
    this.onNowSub = this.props.tile.isOnNow.subscribe(val => { this.setState({ isOnNow: val }); });
    this.progressSub = this.props.tile.currentProgress.subscribe(val => { this.setState({ currentProgress: val }); });
  }

  public componentWillUnmount() {
    this.onNowSub.dispose();
    this.progressSub.dispose();
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
  private ribbon: IRibbon;
  private tilesSub: IDisposable;
  constructor(props: {}) {
    super(props);
    this.ribbon = getRibbon();
  }

  public componentWillMount() {
    this.setState({ title: this.ribbon.title });
    
    // Observable
    this.tilesSub = this.ribbon.tiles.subscribe(val => { this.setState({ tiles: val }); });
  }

  public componentWillUnmount() {
    this.tilesSub.dispose();
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
          <h2>Observables Demo</h2>
        </div>
        <div className="App-intro">
          <Ribbon />
        </div>
      </div>
    );
  }
}

export default App;

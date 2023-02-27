import './App.css';

import openHatSound from "./Kit 6 - Electro/CYCdh_ElecK03-OpHat.wav";
import closedHatSound from "./Kit 6 - Electro/CYCdh_ElecK03-ClHat.wav";
import clapSound from "./Kit 6 - Electro/CYCdh_ElecK03-Clap01.wav";
import kickSound from "./Kit 6 - Electro/CYCdh_ElecK03-Kick01.wav";

import React, {useState} from "react";
import * as Tone from 'tone';

// ============== FIREBASE SETUP ==============

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCvJokSSeiu12SMlM6--9ARiKnNegfCy2g",
  authDomain: "simpledrummachine-45fcf.firebaseapp.com",
  projectId: "simpledrummachine-45fcf",
  storageBucket: "simpledrummachine-45fcf.appspot.com",
  messagingSenderId: "875224897502",
  appId: "1:875224897502:web:dc3dcccc050ac7bda7af4f",
  measurementId: "G-X378HJQ5ZL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// ============== END FIREBASE SETUP ==============

const openHatPlayer = new Tone.Player(openHatSound).toDestination();
const closedHatPlayer = new Tone.Player(closedHatSound).toDestination();
const clapPlayer = new Tone.Player(clapSound).toDestination();
const kickPlayer = new Tone.Player(kickSound).toDestination();

function StepBlock(props) {

  let numberText = <p>{props.index + 1}</p>;

  if(props.index % 4 !== 0) {
    numberText = '';
  }

  let classNames = "StepBlock";

  if(props.enabled) {
    classNames += " enabled";
  }

  if(props.blockIndexCounter === props.index) {
    classNames += " active";
  }

  return (<div className={classNames} onClick={props.toggleCallback}>
    {numberText}
  </div>);
}

function StepBlockRow(props) {

  const blocks = props[1].map((value, index) =>
    <div key={index}>
      {StepBlock(
        { enabled : value, 
          toggleCallback : 
          () => { 
            props[2](props[3], index); 
          },
          index : index,
          blockIndexCounter : props[4]
        })
      } 
    </div>
  );

  return (
  <div className="StepBlockRow">
    <div className="InstrumentTitle">
      {props[0]}
    </div>
    {blocks}
  </div>);
}

function StepSequencer(props) {

  const instruments = props['instruments'].map((instrument, index) =>
    <div key={instrument[0]}>{StepBlockRow([instrument[0], instrument[1], props.toggleCallback, index, props.blockIndexCounter])}</div>
  );

  return (<div className="Sequencer">
    {instruments}
  </div>);
}

class App extends React.Component {
  constructor(props) {
    super(props);

    this.audioLoop = this.audioLoop.bind(this);
    this.toggleInstrumentBlock = this.toggleInstrumentBlock.bind(this);

    this.state = {
      instruments : [
        ['Open Hat', Array(16).fill(false)],
        ['Closed Hat', Array(16).fill(false)],
        ['Clap', Array(16).fill(false)],
        ['Kick', Array(16).fill(false)]
      ],
      toggleCallback : this.toggleInstrumentBlock,
      playing: false,
      blockIndexCounter : 0
    };
  }

  audioLoop() {
  
    let blockIndexCounter = 0
    const loopA = new Tone.Loop(time => {
      this.state.instruments.forEach(instrument => {
        if(instrument[1][blockIndexCounter] === true) {
          if(instrument[0] === 'Open Hat') {
            openHatPlayer.start(time);
          }

          if(instrument[0] === 'Closed Hat') {
            closedHatPlayer.start(time);
          }

          if(instrument[0] === 'Clap') {
            clapPlayer.start(time);
          }

          if(instrument[0] === 'Kick') {
            kickPlayer.start(time);
          }
        }
      });

      blockIndexCounter = (blockIndexCounter + 1) % 16;
      this.setState({'blockIndexCounter' : blockIndexCounter});

    }, "16n").start(0);

    Tone.Transport.start();
    Tone.Transport.bpm.rampTo(120, 0.5);
  }

  toggleInstrumentBlock(instrument_index, block_index) {

    let stateCopy = JSON.parse(JSON.stringify(this.state))

    stateCopy['instruments'][instrument_index][1][block_index] = !stateCopy['instruments'][instrument_index][1][block_index];

    if(!stateCopy['playing']) {
      openHatPlayer.start();
      stateCopy['playing'] = true;
      this.audioLoop();
    }

    this.setState(stateCopy);
  }

  render() {
    return (
      <div className="App">
        <h1>
          Simple Drum Machine

          <a href="https://mnursey.github.io" target="_blank" className="author">
            by mnursey
          </a>
        </h1>
        
        {StepSequencer(this.state)}
      </div>
    );
  }
}

export default App;

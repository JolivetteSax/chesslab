import React, { Component } from "react";
import Timer from "react-compound-timer";

class TimerComp extends Component {
  render() {
    return (
      <div className="Timer">
        <Timer initialTime={0}>
          {({ start, resume, pause, stop, reset }) => (
            <React.Fragment>
              <div className="clock">
                Hours: <Timer.Hours />
                <br />
                Minutes: <Timer.Minutes />
                <br />
                Seconds: <Timer.Seconds />
              </div>
              <br />
              <div>
                <button onClick={start}>Start</button>
                <button onClick={pause}>Pause</button>
                <button onClick={resume}>Resume</button>
                <button onClick={stop}>Stop</button>
                <button onClick={reset}>Reset</button>
              </div>
            </React.Fragment>
          )}
        </Timer>
      </div>
    );
  }
}

export default TimerComp;

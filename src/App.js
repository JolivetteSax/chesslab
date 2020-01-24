import React from 'react';
import './App.css';

export default class App extends React.Component {
  constructor(){
    super();
    this.select = this.select.bind(this);
    this.boardRefs = {};
    this.state = {
      selected: null,
      rows : [ 
        ['WQ' , '-'],
        ['BK' , '-']
      ]
    };
  }

  select(ev){
    let value = ev.currentTarget.innerHTML;
    let id = ev.currentTarget.id;
    let reactRef = this.boardRefs[id];

    if(id === this.state.selected){
      reactRef.classList.remove('cell-selected');
      this.setState({selected: null});
    }
    else if(this.state.selected){
      let prevRef = this.boardRefs[this.state.selected];
      prevRef.classList.remove('cell-selected');

      let row1 = this.state.selected.charCodeAt(0) - 65;
      let col1 = this.state.selected.charCodeAt(1) - 49;
      
      let row2 = id.charCodeAt(0) - 65;
      let col2 = id.charCodeAt(1) - 49;
      
      let rows = this.state.rows;

      rows[row2][col2] = rows[row1][col1]
      rows[row1][col1] = value;

      this.setState({selected: null, rows});
    }
    else{
      reactRef.classList.add('cell-selected');
      this.setState({selected: id});;
    }
  }

  render() {
    return (
      <div className="App">
        <div className="App-body">
          <div>
            <div className="cell" id="A1" ref={ref => this.boardRefs.A1 = ref} onClick={this.select}> 
              {this.state.rows[0][0]} 
            </div>

            <div 
              className="cell" 
              id="A2" 
              ref={ref => this.boardRefs.A2 = ref} 
              onClick={this.select}> 

              {this.state.rows[0][1]} 

            </div>
          </div>
          <div>
            <div className="cell" id="B1" ref={ref => this.boardRefs.B1 = ref} onClick={this.select}> {this.state.rows[1][0]} </div>
            <div className="cell" id="B2" ref={ref => this.boardRefs.B2 = ref} onClick={this.select}> {this.state.rows[1][1]} </div>
          </div>

        <div style={{margin:20}}>&nbsp;</div>
        {!this.state.selected &&
          <div> - </div>
        }
        {this.state.selected &&
          <div>
            {this.state.selected} -> 
          </div>
        }
 
        </div>


      </div>
    );
  }
}


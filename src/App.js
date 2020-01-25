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
    value = value.replace(/ /g, '');

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

      let initiator = rows[row1][col1];
      console.log('Initator: ' + initiator);
      console.log('target: ' + value);
      if(value !== '-'){
        let targetColor = value[0];
        let initiatorColor = initiator[0];
        if(targetColor === initiatorColor){ //invalid move
          return;
        }
      }

      rows[row2][col2] = rows[row1][col1];
      rows[row1][col1] = '-';

      this.setState({selected: null, rows});
    }
    else if(value === '-'){
      return;
    }
    else {
      reactRef.classList.add('cell-selected');
      this.setState({selected: id});;
    }
  }

  render() {

    const Cell = (props) => {
      let id = String.fromCharCode(65 + props.rownum) + String.fromCharCode(49 + props.colnum);
      return (
        <div className='cell' id={id} ref={ref => this.boardRefs[id] = ref} onClick={this.select}>{props.col}</div>
      );
    };

    return (
      <div className="App">
        <div className="App-body">
          {this.state.rows.map((row, rownum) =>
            <div>
              {row.map((col, colnum) => 
                <Cell rownum={rownum} colnum={colnum} col={col}/>
              )}
            </div>
          )}
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


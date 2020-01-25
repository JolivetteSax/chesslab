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
        ['BR' , 'BN', 'BB', 'BK', 'BQ', 'BB', 'BN', 'BR'],
        ['BP' , 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['-' , '-', '-', '-', '-', '-', '-', '-'],
        ['-' , '-', '-', '-', '-', '-', '-', '-'],
        ['-' , '-', '-', '-', '-', '-', '-', '-'],
        ['-' , '-', '-', '-', '-', '-', '-', '-'],
        ['WP' , 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR' , 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR'],
      ]
    };
  }

  getId(row, col){
    return String.fromCharCode(65 + col) + String.fromCharCode((7-row) + 49) ;
  }

  decodePosition(id){
    let col = id.charCodeAt(0) - 65;
    let row = 7-(id.charCodeAt(1) - 49);
    return [row, col];
  }

  select(ev){
    let value = ev.currentTarget.innerHTML;
    value = value.replace(/ /g, '');

    let id = ev.currentTarget.id;

    if(id === this.state.selected){
      this.setState({selected: null});
    }
    else if(this.state.selected){
      let [row1, col1] = this.decodePosition(this.state.selected);
      let [row2, col2] = this.decodePosition(id);

      //console.log('From: ' + row1 + '/' + col1); 
      //console.log('  to: ' + row2 + '/' + col2); 

      let rows = this.state.rows;

      let initiator = rows[row1][col1];

      //console.log('Initator: ' + initiator);
      //console.log('target: ' + value);

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
      this.setState({selected: id});
    }
  }


  render() {
    const Cell = (props) => {
      let id = this.getId(props.rownum, props.colnum);
      let classList = 'cell';

      if(id === this.state.selected){
        classList = 'cell cell-selected';
      }

      return (
        <div className={classList} id={id} ref={ref => this.boardRefs[id] = ref} onClick={this.select}>{props.col}</div>
      );
    };

    return (
      <div className="App">
        <div className="App-body">
          {this.state.rows.map((row, rownum) =>
            <div key={"row_" + rownum}>
              {row.map((col, colnum) => 
                <Cell key={"col_" + colnum} rownum={rownum} colnum={colnum} col={col}/>
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


import React from 'react';
import './App.css';
import Piece from './components/Piece';

export default class App extends React.Component {
  constructor(){
    super();
    this.select = this.select.bind(this);
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
    let rows = this.state.rows;

    let id = ev.currentTarget.id;
    let [row2, col2] = this.decodePosition(id);
    let target = rows[row2][col2];

    if(id === this.state.selected){
      this.setState({selected: null});
    }
    else if(this.state.selected){
      let [row1, col1] = this.decodePosition(this.state.selected);

      let initiator = rows[row1][col1];

      if(target !== '-'){
        let targetColor = target[0];
        let initiatorColor = initiator[0];
        if(targetColor === initiatorColor){ //invalid move
          return;
        }
      }

      rows[row2][col2] = rows[row1][col1];
      rows[row1][col1] = '-';

      this.setState({selected: null, rows});
    }
    else if(target === '-'){
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
        classList += ' cell-selected';
      }
      let sqNum = (props.rownum * 7 ) + props.colnum;
      if((sqNum % 2) === 0){
        classList += ' cell-dark';
      }
      else{
        classList += ' cell-light';
      }

      return (
        <div 
           className={classList} 
           id={id} 
           onClick={this.select}
        >
          <Piece code={props.piece}/>
        </div>
      );
    };

    return (
      <div className="App">
        <div className="App-body">
          {this.state.rows.map((row, rownum) =>
            <div key={"row_" + rownum}>
              {row.map((col, colnum) => 
                <Cell key={"col_" + colnum} rownum={rownum} colnum={colnum} piece={col}/>
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


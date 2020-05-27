import React from 'react';
import './App.css';
import Piece from './components/Piece';
import lo from 'lodash';
import chess from './lib/chess';

export default class App extends React.Component {
  constructor(){
    super();
    this.select = this.select.bind(this);
    this.playHistory = this.playHistory.bind(this);
    this.renameAlt = this.renameAlt.bind(this);
    this.reloadAlt = this.reloadAlt.bind(this);
    this.removeAlt = this.removeAlt.bind(this);
    this.lib = new chess();
    this.startingBoard = [
        ['BR', 'BN', 'BB', 'BQ', 'BK', 'BB', 'BN', 'BR'],
        ['BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP', 'BP'],
        ['-',  '-',  '-',  '-',  '-',  '-',  '-',  '-' ],
        ['-',  '-',  '-',  '-',  '-',  '-',  '-',  '-' ],
        ['-',  '-',  '-',  '-',  '-',  '-',  '-',  '-' ],
        ['-',  '-',  '-',  '-',  '-',  '-',  '-',  '-' ],
        ['WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP', 'WP'],
        ['WR', 'WN', 'WB', 'WQ', 'WK', 'WB', 'WN', 'WR'],
    ];

    this.state = {
      selected: null,
      history: [],
      alternatives: [],
      rows : lo.cloneDeep(this.startingBoard),
      moves: [],
      threats: [],
      whiteMove: true,
      check: false,
      mate: false,
      currentMove: -1,  // move counter
      enPassantAvail: false, // holds state
      enP_pieces: [], // pieces capable of enpassant capture
    };
  }

  removeAlt(ev){
    let index = ev.currentTarget.attributes.index.value;
    let alternatives = this.state.alternatives;
    alternatives.splice(index, 1);
    this.setState({alternatives});
  }

  reloadAlt(ev){
    // TODO detect the current game and save as an alt
    // display title?
    let index = ev.currentTarget.attributes.index.value;
    let alternatives = this.state.alternatives;
    let alt = alternatives[index];
    let history = lo.cloneDeep(alt.history);
    let currentTarget = {attributes: {mark: {value: history.length-1}}};
    // react won't setState immediately, so a callback must be used
    this.setState({history}, () => {
      this.playHistory({currentTarget});
    });
  }

  renameAlt(ev){
    let index = ev.currentTarget.attributes.index.value;
    let alternatives = this.state.alternatives;
    let alt = alternatives[index];
    let newName = prompt('Enter new name: ', alt.name);
    alt.name = newName;
    this.setState({alternatives});
  }

  playHistory(ev){
    let mark = ev.currentTarget.attributes.mark.value;
    let whiteMove = true;
    let rows = lo.cloneDeep(this.startingBoard);
    let currentMove = -1;
    for(let i = 0; i <= mark; i++){
      let move = this.state.history[i];
      rows = this.executeMove(rows, move.from, move.to);
      whiteMove = !whiteMove;
      currentMove = i;
    }
    const threats = this.lib.getThreatMatrix(rows);
    const check = this.lib.isKingCheck((whiteMove ? 'W': 'B'), rows);
    let mate = false;
    if(check){
      mate = this.lib.isCheckMate((whiteMove ? 'W': 'B'), rows);
    }

    this.setState({rows, currentMove, threats, selected:null, moves: [], whiteMove, check, mate});
  }

  getId(row, col){
    return String.fromCharCode(65 + col) + String.fromCharCode((7-row) + 49) ;
  }

  decodePosition(id){
    let col = id.charCodeAt(0) - 65;
    let row = 7-(id.charCodeAt(1) - 49);
    return [row, col];
  }

  executeMove(rows, from, to){
    let [row1, col1] = this.decodePosition(from);
    let [row2, col2] = this.decodePosition(to);

    rows[row2][col2] = rows[row1][col1];
    rows[row1][col1] = '-';
    if(rows[row2][col2][1] === 'P'
       && (row2 === 0 || row2 === 7)){
       const newPiece = rows[row2][col2][0] + 'Q'
       rows[row2][col2] = newPiece;
    }
    return rows;
  }

  select(ev){
    let rows = this.state.rows;
    let history = this.state.history;
    let id = ev.currentTarget.id;
    let [row2, col2] = this.decodePosition(id);
    let target = rows[row2][col2];
    let specialMove = false

    // Selected piece is selected again, "putting a piece back"
    if(id === this.state.selected){
      this.setState({selected: null, moves: []});
    }
    else if(this.state.selected){ // Piece selected, checking move
      let [row1, col1] = this.decodePosition(this.state.selected);

      let initiator = rows[row1][col1];
      // if not empty space, validate that move isn't onto initiator color
      if(target !== '-'){
        let targetColor = target[0];
        let initiatorColor = initiator[0];
        if(targetColor === initiatorColor){ //invalid move
          return;
        }
      }

      if(initiator[1] === 'P' && this.state.enPassantAvail) {
        console.log("Enpassant Detected in Select Move Loop")
        // Loop and find if initiator is empoweredPawn
        for(const coords of this.state.enP_pieces){
          console.log(coords)
          if([row1,col1] === coords) {
            specialMove = true;
          }
        }
      }
      /*
      if(this.state.enPassantAvail && initiator[1] === 'P') {
        let enP_pieces = this.state.enPassantAvail[1];
        let specialMove = {type: 'enP', pieces: enp_pieces }
      }
      */

      // TODO: add in check for castle move, and then define special move
      // Probably going to have to special move handling later when that happens


      let moveList = this.lib.getMoveList(rows, initiator, row1, col1, specialMove);
      moveList = this.lib.limitValidMoves(rows, initiator, row1, col1, moveList);
      let found = false;
      for(const move of moveList){
        if(move[0] === row2 && move[1] === col2){
          found = true;
          break;
        }
      }
      if(!found){ // move not on movelist
        return;
      }

      // Commence making the move!
      let move = { from: this.state.selected, to: id};
      const alternatives = this.state.alternatives;
      if(this.state.currentMove < (history.length -1)){
        alternatives.push({
          name: '' + history.length + 'moves',
          history: lo.cloneDeep(history)
        });
        history = history.slice(0, this.state.currentMove + 1);
      }
      history.push(move);
      rows = this.executeMove(rows, move.from, move.to);
      const threats = this.lib.getThreatMatrix(rows);
      const whiteMove = !this.state.whiteMove;
      const check = this.lib.isKingCheck((whiteMove ? 'W': 'B'), rows);

      const enP_components = this.lib.enPassantCheck(rows,move,initiator);
      const enP_pieces = enP_components[1];
      const enPassantAvail = enP_components[0];

      let mate = false;
      if(check){
        mate = this.lib.isCheckMate((whiteMove ? 'W': 'B'), rows);
      }
      let currentMove = history.length - 1;
      this.setState({selected: null, currentMove, rows, moves: [], threats, history, whiteMove, check, mate, alternatives, enPassantAvail, enP_pieces});
    }
    else if(target === '-'){ // Selecting an empty space
      return;
    }
    else { // First selection of a piece, validate player turn
      if((this.state.whiteMove && target[0] === 'W')
        || ((!this.state.whiteMove) && target[0] === 'B')){

        if(this.state.enPassantAvail && target[1] === 'P') {
          specialMove = true;
        }
        let moves = this.lib.getMoveList(this.state.rows, target, row2, col2, specialMove);
        moves = this.lib.limitValidMoves(this.state.rows, target, row2, col2, moves);
        this.setState({selected: id, moves});
      }
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
      for(let move of this.state.moves){
        if(move[0] === props.rownum && move[1] === props.colnum){
          classList += ' cell-target';
        }
      }
      let threatCount = 0;
      if(props.piece !== '-' && this.state.threats[props.rownum]){
        if(this.state.threats[props.rownum][props.colnum]){
          threatCount = this.state.threats[props.rownum][props.colnum];
        }
      }
      return (
        <div
           className={classList}
           id={id}
           onClick={this.select}
        >
          <Piece code={props.piece}/>
          {(threatCount>0) &&
            <div>{threatCount}</div>
          }
        </div>
      );
    };

    const columns = [ '-', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    return (
      <div>
        <div style={{marginLeft:200}}>
            &nbsp;
            {this.state.alternatives.length > 0 &&
              <span>Alternative sequences: </span>
            }
            {this.state.alternatives.map((alt, altno) =>
              <span key={'alt_'+altno}><b> &nbsp; &lt; {alt.name}
                &#x5b;
                <span className='App-link' index={altno} onClick={this.renameAlt}>&#x2699;</span>
                |
                <span className='App-link'  index={altno} onClick={this.reloadAlt}>&#x2023;</span>
                |
                <span className='App-link'  index={altno} onClick={this.removeAlt}>x</span>
                &#x5d;
                &gt; </b> &nbsp;
              </span>
            )}
        </div>

      <div className="App">

       <div className="App-sidebar">
          History:
          <div>
              <hr/>
              <div
                mark={-1}
                onClick={this.playHistory}
              >
                -. &nbsp;
                open
                {(-1 === this.state.currentMove) &&
                  <span>&#10004;</span>
                }
                <hr/>
              </div>

            {this.state.history.map((move, moveno) =>
              <div
                key={"move_" + moveno}
                mark={moveno}
                onClick={this.playHistory}
              >
                {moveno + 1}. &nbsp;
                {move.from} -> {move.to} &nbsp;
                {(moveno === this.state.currentMove) &&
                  <span>&#10004;</span>
                }
                <hr/>
              </div>
            )}
          </div>
        </div>
        <div className="App-body">
          <div>
            {columns.map((label) =>
              <div key={'label_'+label} className="cell cell-info">{label}</div>
            )}
          </div>
          {this.state.rows.map((row, rownum) =>
            <div key={"row_" + rownum}>
              <div className="cell cell-info">{8-rownum}</div>
              {row.map((col, colnum) =>
                <Cell
                  key={"r_" + rownum + "c_" + colnum}
                  rownum={rownum}
                  colnum={colnum}
                  piece={col}
                />
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

          <div>
            {this.state.whiteMove? "white": "black"} to move
            {this.state.check &&
              <span> - check</span>
            }
            {this.state.mate &&
              <span>mate</span>
            }

          </div>

        </div>
      </div>
      </div>
    );
  }
}

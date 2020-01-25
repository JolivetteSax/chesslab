import React from 'react';
import {
  FaChessBishop,
  FaChessKnight,
  FaChessQueen,
  FaChessKing,
  FaChessRook,
  FaChessPawn,
  FaQuestion,
 } from 'react-icons/fa';

export default class Piece extends React.Component {

  render() {
    let color = this.props.code[0];
    if(color === '-'){
      return <span/>;
    }

    let piece = this.props.code[1];
    let style = {};
    if (color === 'B') {
      style = {color:'black'};
    }

    if(piece === 'P'){
      return <FaChessPawn style={style}/>;
    }
    if(piece === 'N'){
      return <FaChessKnight style={style}/>;
    }
    if(piece === 'R'){
      return <FaChessRook style={style}/>;
    }
    if(piece === 'B'){
      return <FaChessBishop style={style}/>;
    }
    if(piece === 'Q'){
      return <FaChessQueen style={style}/>;
    }
    if(piece === 'K'){
      return <FaChessKing style={style}/>;
    }

    return <FaQuestion />;


  };

}


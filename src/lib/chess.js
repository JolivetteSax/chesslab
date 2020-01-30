
export default class chess {
  getPawnMoveList(rows, piece, x, y){
    const colorMultiple = (piece[0] === 'B' ? 1 : -1);
    const moves = [];
    let movex = x;
    let movey = y;
    movex = movex + (colorMultiple);
    if(rows[movex][movey] === '-'){
       moves.push([movex,movey]);
    }
    if(x === 1 || x === 6){
      movex = movex + (colorMultiple);
      if(movex >= 0 && movex <= 7){
        if(rows[movex][movey] === '-'){
          moves.push([movex,movey]);
        }
      }
    }
    movex = x;
    movey = y;
    movex = movex + (colorMultiple);
    if(movey + 1 <= 7){
      movey += 1;
      let target = rows[movex][movey];
      if(target !== '-' && target[0] !== piece[0]){
        moves.push([movex, movey]);
      }
    }
    movey = y;
    if(movey - 1 >= 0){
      movey -= 1;
      let target = rows[movex][movey];
      if(target !== '-' && target[0] !== piece[0]){
        moves.push([movex, movey]);
      }
    }
    return moves;
  }
  getRookMoveList(rows, piece, x, y){
    const moves = [];
    let movex = x;
    let movey = y;
    while(++movex < 8){
      let target = rows[movex][movey];
      if(target !== '-'){
        if(target[0] !== piece[0]){
          moves.push([movex, movey]);
        }
        break;
      }
      moves.push([movex, movey]);
    }

    movex = x;
    movey = y;
    while(--movex > -1){
      let target = rows[movex][movey];
      if(target !== '-'){
        if(target[0] !== piece[0]){
          moves.push([movex, movey]);
        }
        break;
      }
      moves.push([movex, movey]);
    }
 
    movex = x;
    movey = y;
    while(++movey < 8){
      let target = rows[movex][movey];
      if(target !== '-'){
        if(target[0] !== piece[0]){
          moves.push([movex, movey]);
        }
        break;
      }
      moves.push([movex, movey]);
    }
    movex = x;
    movey = y;
    while(--movey > -1){
      let target = rows[movex][movey];
      if(target !== '-'){
        if(target[0] !== piece[0]){
          moves.push([movex, movey]);
        }
        break;
      }
      moves.push([movex, movey]);
    }
 
    return moves;
  }

  getKnightMoveList(rows, piece, x, y){
    const moves = [];
    let movex = x;
    let movey = y;
    movex = movex -2;
    if(movex > -1){
      if(movey - 1 > -1){
        movey--;
        let target = rows[movex][movey];
        if(target === '-' || target[0] !== piece[0]){
          moves.push([movex, movey]);
        }
      }
    }
    // TODO: This is getting kinda tedious tonight..
    return moves; 
  }

  getBishopMoveList(rows, piece, x, y){
    const moves = [];
    let movex = x;
    let movey = y;
    while(++movex < 8 && ++movey < 8 ){
      let target = rows[movex][movey];
      if(target !== '-'){
        if(target[0] !== piece[0]){
          moves.push([movex, movey]);
        }
        break;
      }
      moves.push([movex, movey]);
    }
    movex = x;
    movey = y;
    while(--movex > -1 && ++movey < 8 ){
      let target = rows[movex][movey];
      if(target !== '-'){
        if(target[0] !== piece[0]){
          moves.push([movex, movey]);
        }
        break;
      }
      moves.push([movex, movey]);
    }

    movex = x;
    movey = y;
    while(--movex > -1 && --movey > -1 ){
      let target = rows[movex][movey];
      if(target !== '-'){
        if(target[0] !== piece[0]){
          moves.push([movex, movey]);
        }
        break;
      }
      moves.push([movex, movey]);
    }

    movex = x;
    movey = y;
    while(++movex < 8 && --movey > -1 ){
      let target = rows[movex][movey];
      if(target !== '-'){
        if(target[0] !== piece[0]){
          moves.push([movex, movey]);
        }
        break;
      }
      moves.push([movex, movey]);
    }

    return moves;
  }

  getMoveList(rows, piece, x, y){
    let moves;
    switch(piece[1]){
      case 'P':
        moves = this.getPawnMoveList(rows, piece, x, y);
        break;
      case 'R':
        moves = this.getRookMoveList(rows, piece, x, y);
        break;
      case 'B':
        moves = this.getBishopMoveList(rows, piece, x, y);
        break;
      case 'N':
        moves = this.getKnightMoveList(rows, piece, x, y);
        break;
      case 'Q':
        moves = this.getRookMoveList(rows, piece, x, y);
        moves = moves.concat(this.getBishopMoveList(rows, piece, x, y));
        break;
      default:
        moves = [];
        break;
    }
    return moves;
  }

  getThreatMatrix(rows){
  }

}

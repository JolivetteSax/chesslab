import lo from 'lodash';

export default class chess {
  getPawnMoveList(rows, piece, x, y, enPassantAvail){
    // TODO: need to add en-passant
    // Add default to getPawnMoveList, en_passant_poss = false
    const colorMultiple = (piece[0] === 'B' ? 1 : -1);
    const moves = [];
    let movex = x;
    let movey = y;
    movex = movex + (colorMultiple);

    // en passant move
    if(enPassantAvail[0]){
      console.log("We made it")
    }

    // Move forward one space, if empty and not off board
    if(movex > -1 && movex < 8){
      if(rows[movex][movey] === '-'){
        moves.push([movex,movey]);
      }
    }

    // Also move forward one space if on starting pawn row
    if(x === 1 || x === 6){
      movex = movex + (colorMultiple);
      if(movex > -1 && movex < 8){
        if(rows[movex][movey] === '-'){
          moves.push([movex,movey]);
        }
      }
    }

    movex = x;
    movey = y;
    movex = movex + (colorMultiple);
    if(movex < 0 || movex > 7){
      return moves;
    }

    if(movey + 1 <= 7){ // Capture Instance
      movey += 1;
      let target = rows[movex][movey];
      if(target !== '-' && target[0] !== piece[0]){
        moves.push([movex, movey]);
      }
    }
    movey = y;
    if(movey - 1 >= 0){ // Capture Instance
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
    let movex, movey;

    movex = x;
    movey = y;
    movex = movex -2;
    if(movex > -1){
      if(movey - 1 > -1){
        movey--;
        let target = rows[movex][movey];
        if(target === '-' || target[0] !== piece[0]){
          moves.push([movex, movey]);
        }
      }
      movey = y
      if(movey + 1 < 8){
        movey++;
        let target = rows[movex][movey];
        if(target === '-' || target[0] !== piece[0]){
          moves.push([movex, movey]);
        }
      }

    }

    movex = x;
    movey = y;
    movex = movex + 2;
    if(movex < 8){
      if(movey - 1 > -1){
        movey--;
        let target = rows[movex][movey];
        if(target === '-' || target[0] !== piece[0]){
          moves.push([movex, movey]);
        }
      }
      movey = y
      if(movey + 1 < 8){
        movey++;
        let target = rows[movex][movey];
        if(target === '-' || target[0] !== piece[0]){
          moves.push([movex, movey]);
        }
      }
    }

    movex = x;
    movey = y;
    movex++;
    if(movex < 8){
      if(movey - 2 > -1){
        movey -= 2;
        let target = rows[movex][movey];
        if(target === '-' || target[0] !== piece[0]){
          moves.push([movex, movey]);
        }
      }
      movey = y
      if(movey + 2 < 8){
        movey += 2;
        let target = rows[movex][movey];
        if(target === '-' || target[0] !== piece[0]){
          moves.push([movex, movey]);
        }
      }
    }

    movex = x;
    movey = y;
    movex--;
    if(movex > -1){
      if(movey - 2 > -1){
        movey -= 2;
        let target = rows[movex][movey];
        if(target === '-' || target[0] !== piece[0]){
          moves.push([movex, movey]);
        }
      }
      movey = y
      if(movey + 2 < 8){
        movey += 2;
        let target = rows[movex][movey];
        if(target === '-' || target[0] !== piece[0]){
          moves.push([movex, movey]);
        }
      }
    }

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

  getKingMoveList(rows, piece, x, y){
    const moves = [];
    let movex, movey;

    movex = x;
    movey = y;
    movex = movex - 1;
    if(movex > -1){
      let target = rows[movex][movey];
      if(target === '-' || target[0] !== piece[0]){
        moves.push([movex, movey]);
      }

      if(movey - 1 > -1){
        movey--;
        let target = rows[movex][movey];
        if(target === '-' || target[0] !== piece[0]){
          moves.push([movex, movey]);
        }
      }
      movey = y
      if(movey + 1 < 8){
        movey++;
        let target = rows[movex][movey];
        if(target === '-' || target[0] !== piece[0]){
          moves.push([movex, movey]);
        }
      }

    }

    movex = x;
    movey = y;
    movex = movex + 1;
    if(movex < 8){
      let target = rows[movex][movey];
      if(target === '-' || target[0] !== piece[0]){
        moves.push([movex, movey]);
      }

      if(movey - 1 > -1){
        movey--;
        let target = rows[movex][movey];
        if(target === '-' || target[0] !== piece[0]){
          moves.push([movex, movey]);
        }
      }
      movey = y
      if(movey + 1 < 8){
        movey++;
        let target = rows[movex][movey];
        if(target === '-' || target[0] !== piece[0]){
          moves.push([movex, movey]);
        }
      }
    }

    movex = x;
    movey = y;
    if(movey - 1 > -1){
      movey -= 1;
      let target = rows[movex][movey];
      if(target === '-' || target[0] !== piece[0]){
        moves.push([movex, movey]);
      }
    }
    movey = y
    if(movey + 1 < 8){
      movey += 1;
      let target = rows[movex][movey];
      if(target === '-' || target[0] !== piece[0]){
        moves.push([movex, movey]);
      }
    }
    // TODO need to add castle on kingside and queenside
    // in order to offer this feature need to detect "check" threat
    return moves;
  }


  getMoveList(rows, piece, x, y, specialMove = false){
    let moves;
    switch(piece[1]){
      case 'P':
        moves = this.getPawnMoveList(rows, piece, x, y, specialMove);
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
      case 'K':
        moves = this.getKingMoveList(rows, piece, x, y);
        break;
      default:
        moves = [];
        break;
    }
    return moves;
  }

  // This function cannot be part of "getMoveList" due to a paradox
  // https://www.chess.com/forum/view/general/why-cant-a-king-take-a-pawn-or-other-piece-if-that-piece-cannot-legally-move
  // The paradox is resolved by the fact that "capturing" the king can be
  // "invalid" in that it leaves the other player open to capture, because theoretically
  // the first king will have lost. Otherwise the stack overflows from the recursion.
  // This function therefore MUST be called in conjunction with getMoveList externally
  limitValidMoves(rows, piece, x, y, moves){
    const validMoves = [];
    for(const move of moves){
      const testRows = lo.cloneDeep(rows);
      testRows[move[0]][move[1]] = piece;
      testRows[x][y] = '-';
      if(!this.isKingCheck(piece[0], testRows)){
        validMoves.push(move);
      }
    }
    return validMoves;
  }

  isKingCheck(color, rows){
    const threats = this.getThreatMatrix(rows);
    for(let x=0;x<8;x++){
      for(let y=0;y<8;y++){
        if(rows[x][y][0] === color
            && rows[x][y][1] === 'K'){
          if(threats[x][y] > 0){
            return true;
          }
          else{
            return false;
          }
        }
      }
    }
    return false; // technically, could be a pathological setup
  }

  // This function checks if enPassant will be possible on next turn
  // Also returns the specific move that is possible for the enlightened pawn
  enPassantCheck(rows, move, piece){
    /*
    console.log(piece)
    console.log(move)
    console.log(rows)
    */

    // Not necessary to proceed if not a pawn Move
    if(piece[1] !== 'P') {
      return false;

    } else { // check if two space move is used
      if(Math.abs(move.from[1].charCodeAt() - move.to[1].charCodeAt()) === 2){
        // Check pieces to left and to right
        // position within array
        const [arrayPosX,arrayPosY] = [7- (move.to.charCodeAt(1) - 49), move.to.charCodeAt(0) - 65]; // set as x,y. Check decode position in App.js
        const vulnerablePawn = [arrayPosX,arrayPosY];
        const adjacents = {left: rows[arrayPosX][arrayPosY-1], right: rows[arrayPosX][arrayPosY+1]};

        // Narrow down capture scenario more
        if(piece[0] === 'W' && (adjacents.left === 'BP' || adjacents.right === 'BP')) {
          return true;
        }
        else if(piece[0] === 'B' && (adjacents.left === 'WP' || adjacents.right === 'WP')) {

          const empoweredPawns = [];

          if(adjacents.left === 'WP'){
            empoweredPawns.push([arrayPosX, arrayPosY-1]);
          }

          if(adjacents.right === 'WP'){
            empoweredPawns.push([arrayPosX, arrayPosY+1]);
          }

          return [true, empoweredPawns, vulnerablePawn];
        } else { // no surrounding pieces to take vulnerable pawn
          return false;
        }
      } else { // pawn didn't move two spaces
        return false;
      }
    }
  }

  getThreatMatrix(rows){
    const threats = [];
    let allMoves = [];
    for(let x=0;x<8;x++){
      const threatRow = [];
      for(let y=0;y<8;y++){
        threatRow.push(0);
        const piece = rows[x][y];
        if(piece !== '-'){
          const moves = this.getMoveList(rows, piece, x, y);
          allMoves = allMoves.concat(moves);
        }
      }
      threats.push(threatRow);
    }

    for(const move of allMoves){
      threats[move[0]][move[1]]++;
    }

    return threats;
  }

  isCheckMate(color, rows){
    for(let x=0;x<8;x++){
      for(let y=0;y<8;y++){
        const piece = rows[x][y];
        if(piece[0] === color){
          let moves = this.getMoveList(rows, piece, x, y);
          moves = this.limitValidMoves(rows, piece, x, y, moves);
          if(moves.length > 0){
            return false;
          }
        }
      }
    }
    return true;
  }

}

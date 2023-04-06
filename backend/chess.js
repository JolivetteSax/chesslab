const lo = require('lodash');
const md5 = require('md5');


module.exports = class Chess {

 constructor(){
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
      rows : lo.cloneDeep(this.startingBoard),
      moves: [],
      threats: [],
      whiteMove: true,
      check: false,
      mate: false,
      currentMove: -1,  // move counter
      enPassantAvail: false, // holds state
      enP_pieces: [], // pieces capable of enpassant capture
      vulnerablePawn: [-1,-1], // in enpassant scenario, the pawn in danger
    };
  }
   castleKingside(){
     let row1 = 7;
     let row2 = 7;
     let col1 = 4;
     let col2 = 6;
     if(!this.state.whiteMove){
       row1 = 0;
       row2 = 0;
     }
     this.executeMove(this.state.rows, [row1, col1], [row2, col2], false);
     this.state.whiteMove = !this.state.whiteMove;
     
     col1 = 7;
     col2 = 5;
     this.executeMove(this.state.rows, [row1, col1], [row2, col2], false);
   }

   castleQueenside(){
     let row1 = 7;
     let row2 = 7;
     let col1 = 4;
     let col2 = 2;
     if(!this.state.whiteMove){
       row1 = 0;
       row2 = 0;
     }
     this.executeMove(this.state.rows, [row1, col1], [row2, col2], false);
     this.state.whiteMove = !this.state.whiteMove;
     
     col1 = 0;
     col2 = 3;
     this.executeMove(this.state.rows, [row1, col1], [row2, col2], false);
   }


   execute(algebra) {
     let color = (this.state.whiteMove ? 'W' : 'B');
     if(algebra === 'O-O' || algebra === 'O-O-O'){
       if(algebra === 'O-O'){
         this.castleKingside();
       }
       else{
         this.castleQueenside();
       }
       return;
     }
     let promote = 'Q';
     let figure = undefined;
     let file = undefined;
     let rank = undefined;

     let destination = '';
     let unpack = [...algebra];
     destination = unpack.pop();
     if(destination === '#'){ // checkmate move
       destination = unpack.pop();
     }
     if(destination === '+'){ // check
       destination = unpack.pop();
     }

     if(unpack.slice(-1) === '='){
       promote = destination;
       unpack.pop();
       destination = unpack.pop();
     }

     destination = unpack.pop() + destination;

     if(unpack.length >= 1){
       let letter = unpack.shift();
       if(letter === letter.toUpperCase()){
         figure = letter;
       }
       else{
         file = letter;
       }
     }

     if(!figure){
       figure = 'P';
     }
     if(unpack.length >= 1){
       file = unpack.shift();
       if(file === 'x'){
         file = undefined;
       }
     }
     if(unpack.length >= 1){
       rank = unpack.shift();
       if(rank === 'x'){
         rank = undefined;
       }
     }
     
     if(file){
       file = file.toUpperCase();
       file = file.charCodeAt(0) - 65;
     }
     if(rank){
       rank = rank.toUpperCase();
       rank = 7-(rank.charCodeAt(0) - 49);
     }
     let [row2, col2] = this.decodePosition(destination);

     let row1, col1;
     let allMoves = [];
     outer : for(let x=0;x<8;x++){
       if(rank != undefined && rank !== x){
         continue outer;
       }
       inner: for(let y=0;y<8;y++){
         if(file != undefined && file !== y){
           continue inner;
         }
         const piece = this.state.rows[x][y];
         if(piece !== '-' && piece[0] === color){
           if(figure && piece[1] != figure){
             continue inner;
           }
           const moves = this.getMoveList(this.state.rows, piece, x, y);
           for(let move of moves){
             if(move[0] == row2 && move[1] == col2){
               // found
               [row1, col1] = [x, y];
               break outer;
             }
           }
         }
       }
     }
     if(row1 === undefined){
       throw "Illegal move: " + algebra;
     }
     //console.log('Decoded as %i,%i - %i,%i', row1, col1, row2, col2);
     this.executeMove(this.state.rows, [row1, col1], [row2, col2], false);
   }

   printBoard(){
     if(this.state.whiteMove){
       console.log('White to move');
     }
     else{
       console.log('Black to move');
     }
     let row;
     for(let x = 0; x< 8; x++){
       row = '';
       for(let y = 0; y<8; y++){
         let piece = this.state.rows[x][y];
	 if(piece === '-'){
           piece = '--'
         }
         row += ' ' + piece;
       }
       console.log(row);
     }
   }
   getStateHash(){
     let str = this.state.rows.flat(1).join('');
     return md5(str);
   }

   decodePosition(id){
     id = id.toUpperCase();
     let col = id.charCodeAt(0) - 65;
     let row = 7-(id.charCodeAt(1) - 49);
     return [row, col];
   }

   executeMove(rows, from, to,specialMove){
    let [row1, col1] = from;
    let [row2, col2] = to;

    rows[row2][col2] = rows[row1][col1];
    rows[row1][col1] = '-';

    if(this.state.enPassantAvail && specialMove) {
      rows[this.state.vulnerablePawn[0]][this.state.vulnerablePawn[1]] = '-';
    }
    // Pawn Promotion
    // Technically allowed to promote to Knight, Rook, or Bishop as well
    if(rows[row2][col2][1] === 'P'
       && (row2 === 0 || row2 === 7)){
       const newPiece = rows[row2][col2][0] + 'Q'
       rows[row2][col2] = newPiece;
    }

    this.state.whiteMove = !this.state.whiteMove;

    return rows;
  }

  getPawnMoveList(rows, piece, x, y, enPassantAvail){
    // TODO: need to add en-passant
    // Add default to getPawnMoveList, en_passant_poss = false
    const colorMultiple = (piece[0] === 'B' ? 1 : -1);
    const moves = [];
    let movex = x;
    let movey = y;
    movex = movex + (colorMultiple);

    // en passant move
    // The vulnerable pawn coords are accessible in enPassantAvail[1]
    if(enPassantAvail[0]){
      let enPassCaptureMove = [enPassantAvail[1][0] + (colorMultiple),enPassantAvail[1][1]];
      moves.push(enPassCaptureMove);
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
          const empoweredPawns = [];

          if(adjacents.left === 'BP'){
            empoweredPawns.push([arrayPosX, arrayPosY-1]);
          }

          if(adjacents.right === 'BP'){
            empoweredPawns.push([arrayPosX, arrayPosY+1]);
          }

          return [true, empoweredPawns, vulnerablePawn];
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
          return [false, [], []];
        }
      } else { // pawn didn't move two spaces
        return [false, [], []];
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

};

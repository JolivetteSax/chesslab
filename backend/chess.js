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
      enPassant: undefined,
      promotion: 'Q',
      check: false,
      mate: false,
      currentMove: -1,  // move counter
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
     this.executeMove(this.state.rows, [row1, col1], [row2, col2]);
     this.state.whiteMove = !this.state.whiteMove;
     
     col1 = 7;
     col2 = 5;
     this.executeMove(this.state.rows, [row1, col1], [row2, col2]);
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
     this.executeMove(this.state.rows, [row1, col1], [row2, col2]);
     this.state.whiteMove = !this.state.whiteMove;
     
     col1 = 0;
     col2 = 3;
     this.executeMove(this.state.rows, [row1, col1], [row2, col2]);
   }


   execute(algebra) {
     //console.log('Alg: ' + algebra);
     let color = (this.state.whiteMove ? 'W' : 'B');
     if(algebra.endsWith('+') || algebra.endsWith('#')){
       algebra = algebra.substr(0, algebra.length - 1);
     }
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

     //console.log('dest: ' + destination);
     let slice = unpack.slice(-1).join();
     //console.log('slice: "' + slice + '"');
     if(slice === '='){
       //console.log('Promotion');
       promote = destination;
       unpack.pop();
       destination = unpack.pop();
     }
     this.state.promotion = promote;

     destination = unpack.pop() + destination;
     //console.log('destination: ' + destination);
     //console.log("unpack: " + unpack.join());
     if(unpack.length >= 1){
       let letter = unpack.shift();
       if(letter === letter.toUpperCase()){
         figure = letter;
         //console.log('figure is: ' + figure);
       }
       else{
         file = letter;
         //console.log('File is: ' + file);
       }
     }

     if(!figure){
       figure = 'P';
     }

     if(unpack.length >= 1 && file == undefined){
       file = unpack.shift();
       if(file === 'x'){
         file = undefined;
       }
     }
     if(file != undefined){
       // need to check if the file is ommitted and a rank is spec'd
       if(file.match(/[1-8]/)){
         rank = file;
         file = undefined;
       }
     }
     if(unpack.length >= 1 && rank == undefined){
       rank = unpack.shift();
       if(rank === 'x'){
         rank = undefined;
       }
       else{
         //console.log('rank is: ' + rank);
       }
     }
     
     if(file !== undefined){
       file = file.toUpperCase();
       file = file.charCodeAt(0) - 65;
       //console.log('File decoded as: ' + file);
     }
     if(rank !== undefined){
       rank = rank.toUpperCase();
       rank = 7-(rank.charCodeAt(0) - 49);
       //console.log('Rank decoded as: ' + rank);
     }
     let [row2, col2] = this.decodePosition(destination);
     //console.log('target decoded x: %i, %i', row2, col2);
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
           let moves = this.getMoveList(this.state.rows, piece, x, y);
           moves = this.limitValidMoves(this.state.rows, piece, x, y, moves);
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
     this.executeMove(this.state.rows, [row1, col1], [row2, col2]);
   }
   
   getBoardString(){
     let str = '';
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
       str += row + '\n';
     }
     return str;
   }

   printBoard(){
     if(this.state.whiteMove){
       console.log('White to move');
     }
     else{
       console.log('Black to move');
     }
     this.printRows();
   }

   printRows(rows = this.state.rows){
     console.log();
     let row;
     for(let x = 0; x< 8; x++){
       row = '';
       for(let y = 0; y<8; y++){
         let piece = rows[x][y];
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

   getWhiteBoardHash(){
     // allows comparison of boards per player
     let board = lo.cloneDeep(this.state.rows);

     for(let x = 0; x< 8; x++){
       for(let y = 0; y<8; y++){
         let piece = board[x][y];

         if(piece !== '-'){
           if(piece[0] === 'B'){
             piece = '-'
           }
         }
         board[x][y] = piece;
       }
     }
     return md5(board.flat(1).join(''));
   }

   getBlackBoardHash(){
     //TODO flip & mirror board to white? Not sure
      let board = lo.cloneDeep(this.state.rows);

     for(let x = 0; x< 8; x++){
       for(let y = 0; y<8; y++){
         let piece = board[x][y];

         if(piece !== '-'){
           if(piece[0] === 'W'){
             piece = '-'
           }
         }
         board[x][y] = piece;
       }
     }
     return md5(board.flat(1).join(''));
    
   }

   getAltHashes(){
     let flipped = lo.cloneDeep(this.state.rows);

     for(let x = 0; x< 4; x++){
       for(let y = 0; y<8; y++){
         let piece = flipped[x][y];
         let mirror = flipped[7-x][y];

         if(piece !== '-'){
           piece = (piece[0] === 'W' ? 'B' : 'W') + piece[1];
         }
         if(mirror !== '-'){
           mirror = (mirror[0] === 'W' ? 'B' : 'W') + mirror[1];
         }

         flipped[x][y] = mirror;
         flipped[7-x][y] = piece;
       }
     }

     let mirrored = lo.cloneDeep(this.state.rows);
     for(let x = 0; x< 8; x++){
       for(let y = 0; y<4; y++){
         let piece = mirrored[x][y];
         let mirror = mirrored[x][7-y];
         mirrored[x][y] = mirror;
         mirrored[x][7-y] = piece;
       }
     }

     let both = lo.cloneDeep(flipped);
     for(let x = 0; x< 8; x++){
       for(let y = 0; y<4; y++){
         let piece = both[x][y];
         let mirror = both[x][7-y];
         both[x][y] = mirror;
         both[x][7-y] = piece;
       }
     }
     
     let str1 = flipped.flat(1).join('');
     let str2 = mirrored.flat(1).join('');
     let str3 = both.flat(1).join('');
     //this.printRows(mirrored);
     return [md5(str1), md5(str2), md5(str3)];
   }

   decodePosition(id){
     id = id.toUpperCase();
     let col = id.charCodeAt(0) - 65;
     let row = 7-(id.charCodeAt(1) - 49);
     return [row, col];
   }

   executeMove(rows, from, to){
    let [row1, col1] = from;
    let [row2, col2] = to;

    let targetSquare = rows[row2][col2];

    rows[row2][col2] = rows[row1][col1];
    rows[row1][col1] = '-';

    // Pawn shenanigans
    if(rows[row2][col2][1] === 'P'){
       if (row2 === 0 || row2 === 7){ // this is a promotion either way
         const newPiece = rows[row2][col2][0] + this.state.promotion;
         rows[row2][col2] = newPiece;
         this.state.promotion = 'Q'; // reset default...
       }
       let delta_x = row2 - row1;
       let delta_y = col2 - col1;
       if(delta_x < 0){
         delta_x = delta_x * -1;
       }
       if(delta_y < 0){
         delta_y = delta_y * -1;
       }

       // check for diagonal to empty square
       // if so, capture of the pass pawn on adjacent square 
       if(targetSquare === '-' && delta_x === 1 && delta_y === 1){
         //console.log('En passant capture: ' + rows[row1][col2]);
         //console.log('target SQ: ' + targetSquare);
         if(this.state.whiteMove){
           if(rows[row1][col2] === 'BP' && row2 === 2){
             rows[row1][col2] = '-';
           }
         }
         else{
           if(rows[row1][col2] === 'WP' && row2 === 5){
             rows[row1][col2] = '-';
           }
         }
       }
       // clearing the flag used to generate possible moves
       this.state.enPassant = undefined;


       if(delta_x === 2){// double move, set enPassant y-col value
         this.state.enPassant = col1;
       }

    }

    this.state.whiteMove = !this.state.whiteMove;

    return rows;
  }

  getPawnMoveList(rows, piece, x, y){
    const colorMultiple = (piece[0] === 'B' ? 1 : -1);
    const moves = [];
    let movex = x;
    let movey = y;
    movex = movex + (colorMultiple);

    // Move forward one space, if empty and not off board
    if(movex > -1 && movex < 8){
      if(rows[movex][movey] === '-'){
        moves.push([movex,movey]);
      }
    }

    if(rows[movex][movey] === '-'){ // only if the preceeding space was clear
      // Also move forward one space if on starting pawn row
      if(x === 1 || x === 6){
        movex = movex + (colorMultiple);
        if(movex > -1 && movex < 8){
          if(rows[movex][movey] === '-'){
            moves.push([movex,movey]);
          }
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
      if(target !== '-'){
        if(target[0] !== piece[0]){
          moves.push([movex, movey]);
        }
      }
      else{
        if(this.state.enPassant === movey){
          if(this.state.whiteMove && movex === 2){
            moves.push([movex, movey]);
          }
          if((!this.state.whiteMove) && movex === 5){
            moves.push([movex, movey]);
          }
        }
      }
    }
    movey = y;
    if(movey - 1 >= 0){ // Capture Instance
      movey -= 1;
      let target = rows[movex][movey];
      if(target !== '-'){
        if(target[0] !== piece[0]){
          moves.push([movex, movey]);
        }
      }
      else{
        if(this.state.enPassant === movey){
          if(this.state.whiteMove && movex === 2){
            moves.push([movex, movey]);
          }
          if((!this.state.whiteMove) && movex === 5){
            moves.push([movex, movey]);
          }
        }
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
    const threats = this.getThreatMatrix(rows, color);
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

  getThreatMatrix(rows, color){
    const threats = [];
    let allMoves = [];
    for(let x=0;x<8;x++){
      const threatRow = [];
      for(let y=0;y<8;y++){
        threatRow.push(0);
        const piece = rows[x][y];
        if(piece !== '-' && piece[0] !== color){
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

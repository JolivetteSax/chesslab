const fs = require('fs');

const pgnParser = require('pgn-parser');
const Chess = require('./chess');

console.log('loading ' + process.argv[2]);
const pgn = fs.readFileSync(process.argv[2]).toString();
// accumulator
let game = '';
// result listing
let games = [];
// state
let headers = true;

for(let line of pgn.split('\n')){
  let moves = line.indexOf('[') !== 0;
  if(headers && moves){
    headers = false;
  }
  if(!headers && !moves){
    try {
      games.push(pgnParser.parse(game));
    } catch (error) {
      console.log(error);
      console.log(game);
    }
    headers = true;
    game = '';
  }
  game += ' ' + line;
}
if(!headers){
  games.push(pgnParser.parse(game));
}
console.log(games.length);

let count = 0;
game_loop: for(let obj of games){
  //console.log(obj);
  let chess = new Chess();
  console.log();
  console.log('************************');
  console.log('Game# ' + (count++));
  console.log(obj[0].headers);
  let number = 0;
  for (let move of obj[0].moves){
    if(move.move_number){
      number = move.move_number;
//      console.log("move: " + number);
    }

    try{
      chess.execute(move.move);
//      console.log(move.move);
//      chess.printBoard();
    }
    catch (error){
      console.log('Invalid: ' + number + ' - '  + move.move);
      chess.printBoard();
      continue game_loop;
    }
  }

  chess.printBoard();
}

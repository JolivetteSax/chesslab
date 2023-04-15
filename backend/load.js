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
states = {};
boards = {};
meta = {};
alts = {};
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
      //console.log("move: " + number);
    }

    try{
      chess.execute(move.move);
      //console.log(move.move);
      //chess.printBoard();
      if(number > 25){
        hash = chess.getStateHash();
        if(states.hasOwnProperty(hash)){
          states[hash]++;
        }
        else{
          states[hash] = 0;
          boards[hash] = chess.getBoardString();
        }
        let hashes = chess.getAltHashes();
        for(const altHash of hashes){
          if(alts.hasOwnProperty(altHash)){
            primary = alts[altHash];
            if(primary !== hash){ // otherwise we're already matching
              console.log('Alt match %s -> %s', altHash, primary);
              states[primary]++;
            }
          }
          else{
            alts[altHash] = hash;
          }
        }
      }
    }
    catch (error){
      console.log(error);
      console.log('Invalid: ' + number + ' - '  + move.move);
      chess.printBoard();
      continue game_loop;
    }
  }

  chess.printBoard();
}
listing = [];
for(const hash in states){
  count = states[hash];
  if(count > 0){
    listing.push({hash, count});
  }
}

listing = listing.sort((a, b) => {
  if(a.count === b.count) 
    return 0;
  if(a.count < b.count)
    return 1;
  return -1;
});

for(const pair of listing){
  let [hash, count] = Object.values(pair);
  let board = boards[hash];
  console.log("State: %s -> %i", hash, count)
  console.log(board);
}

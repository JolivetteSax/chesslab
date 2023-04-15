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
  let chess = new Chess();
  // the parser kicks it out as an array
  const headers = obj[0].headers;
  const moves = obj[0].moves;
  count++;
  //console.log();
  //console.log('************************');
  //console.log('Game# ' + count);
  //console.log(headers);

  let info = `Match ${count}.`;
  for(const header of headers){
    if(header.name === 'Date' || header.name === 'Round'){
      info += ' ' + header.value;
    }
    else if(header.name === 'White' || header.name === 'Black'){
      info += ' ' + header.value;
    }
  }
  let number = 0;
  let currentHashes = {};
  move_loop: for (let move of moves){
    if(move.move_number){
      number = move.move_number;
      //console.log("move: " + number);
    }

    try{
      chess.execute(move.move);
      //console.log(move.move);
      //chess.printBoard();
    }
    catch (error){
      console.log(error);
      console.log('Invalid: ' + number + ' - '  + move.move);
      chess.printBoard();
      continue game_loop;
    }
    if(number > 10){
      hash = chess.getStateHash();
      // ignore matches within the same game...
      if(currentHashes.hasOwnProperty(hash)){
        continue move_loop;
      }
      else{
        currentHashes[hash] = true;
      }
      if(states.hasOwnProperty(hash)){
        states[hash]++;
        meta[hash].push(info);
      }
      else {
        states[hash] = 0;
        boards[hash] = chess.getBoardString();
        meta[hash] = [info];
      }
      let hashes = chess.getAltHashes();
      let mirrorPrimaries = {}; // if it matches in order, it'll match later mirrors
      alt_loop: for(const altHash of hashes){
        if(alts.hasOwnProperty(altHash)){
          primary = alts[altHash];
          if(mirrorPrimaries.hasOwnProperty(primary)){
            continue alt_loop;
          }
          mirrorPrimaries[primary] = true;
          if(primary === hash){ // otherwise we're already matching this exactly
                                // so obviously the alts will match too
            continue alt_loop;
          }
          //console.log('Alt match %s -> %s', altHash, primary);
          states[primary]++;
          meta[primary].push(info+' (Mirrored)');
        }
        else{
          alts[altHash] = hash;
        }
      }
    }
 
  }

  //chess.printBoard();
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
  let infoList = meta[hash];
  console.log("State: %s -> %i", hash, count);
  console.log(board);
  console.log(infoList);
}

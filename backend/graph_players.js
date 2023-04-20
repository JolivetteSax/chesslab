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
players = {};
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
  let whitePlayer = "white";
  let blackPlayer = "black";

  let info = `Match ${count}.`;
  for(const header of headers){
    if(header.name === 'Date' || header.name === 'Round'){
      info += ' ' + header.value;
    }
    else if(header.name === 'White' || header.name === 'Black'){
      if(header.name === 'White'){
        whitePlayer = header.value;
      }
      else if(header.name === "Black"){
        blackPlayer = header.value;
      }
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
      weight = number * number;
      // ignore matches within the same game...
      if(currentHashes.hasOwnProperty(hash)){
        continue move_loop;
      }
      else{
        currentHashes[hash] = true;
      }
      if(states.hasOwnProperty(hash)){
        states[hash]++; // plus the move_number to weight it?
        meta[hash].push(info);
        players[hash].push({white: whitePlayer, black:blackPlayer, weight});
      }
      else {
        states[hash] = 0;
        boards[hash] = chess.getBoardString();
        meta[hash] = [info];
        players[hash] = [{white: whitePlayer, black:blackPlayer, weight}];
      }


      // TODO XXX - needs to not run concurrently, or misordered matches are missed.
      let hashes = chess.getAltHashes();
      hashes.push(chess.getBlackBoardHash());
      hashes.push(chess.getWhiteBoardHash());

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
          players[primary].push({white: whitePlayer, black:blackPlayer, weight});
          meta[primary].push(info);
          //console.log("AltMatch");
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
  else{
    delete players[hash];
  }
}
/*
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
*/

let nodes = [];
let edges = [];
let names = {};
let max = 0;

//TODO: flipping and mirroring from alts
for(const hash in players){
  let listing = players[hash];
  for(const source of listing){
    max = source.weight > max ? source.weight : max;
    names[source.white] = true;
    names[source.black] = true;
    for(const target of listing){
      // another analysis would only look at matches, to see repetative players
      if(source.white !== target.white){
        edges.push({source: source.white, target: target.white, weight: source.weight});
      }
      if(source.black !== target.black){
        edges.push({source: source.black, target: target.black, weight: source.weight});
      }
    }
  }
}
console.log('{"nodes": [');
for(const name of Object.keys(names)){
  console.log('{"data": { "id": "%s", "name": "%s"}},', name, name);
}
console.log('],');
console.log('"edges": [');
for(const edge of edges){
  let weight = edge.weight / max;
  console.log('{"data": { "source": "%s", "target": "%s", "weight": %f}},', edge.source, edge.target, weight);
}
console.log(']}');

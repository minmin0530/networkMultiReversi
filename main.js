var userHash = {};
var watchingNumber = 0;

var startNewGameFlag = [false, false, false];//false;
var startNewGameNumber = 0;
var startNewGameTurn = [0,0,0];
var indexArrayNewGame = [];
var turnCountNewGame = 0;



var startMiddleOfGameFlag = [false, false, false];//false;
var startMiddleOfGameNumber = 0;
var startMiddleOfGameTurn = [0,0,0];
var socketID = [];
var indexArray = [];
var intervalCount0 = 0;
var intervalCount1 = 0;
var turnCount = 0;

var playerMaxNumber = 0;
var currentPlayerNumber = 0;
var initFieldMessage = '';
var aiTurn = [];
var aiTurnIndex = 0;
var aiStartFlag = false;
var joinFieldFlag = [];
var io;
var field = [];
var turn = [];

var xx = 0;
var yy = 0;

var xxx = 8;
var yyy = 8;

class AI {
  ai0() {
    ++intervalCount0;
    if (intervalCount0 >= 5) {
      intervalCount0 = 0;
  
      for (var v = 0; v < startMiddleOfGameNumber; ++v) {
        if (turnCount >= 1 && startMiddleOfGameFlag[indexArray[v]]) {
              var dd = {
                'startMiddleOfGame': true,
                'startMiddleOfGameTurn': startMiddleOfGameTurn[indexArray[v]]
              };
              io.sockets.connected[socketID[indexArray[v]]].emit("startMiddleOfGame", {value: dd});      
        }
      }
      if (turnCount < 2) {
          field[0][yy][xx] = turnCount;
          xx += 1;
          if (xx >= 8) {
            xx = 0;
            yy += 1;
            if (yy >= 8) {
              yy = 0;
            }
          }
          ++turnCount;
          if (turnCount >= 2 + startMiddleOfGameNumber) {
            turnCount = 0;
          }
        var d = {
            'x':xx,
            'y':yy,
            'turn':turnCount,
            'max':2,
            'field':field[0],
            'fieldNumber':0
        };
  
        io.sockets.emit("put", {value:d});
      }
    }
  }

  ai1() {
    ++intervalCount1;
    if (intervalCount1 >= 4) {
      intervalCount1 = 0;

//      for (var v = 0; v < startNewGameNumber; ++v) {
//        if (turnCountNewGame == 0 && startNewGameFlag[indexArrayNewGame[v]]) {
//              var dd = {
//                'startNewGame': true,
//                'startNewGameTurn': startNewGameTurn[indexArrayNewGame[v]]
//              };
//              io.sockets.connected[socketID[indexArrayNewGame[v]]].emit("startNewGame", {value: dd});      
//        }
//      }
    
//    console.log("startNewGameTurn" + startNewGameTurn[indexArrayNewGame[turnCountNewGame]] );
//    console.log("aiTurn" + aiTurn[aiTurnIndex]);
      if (startNewGameTurn[indexArrayNewGame[turnCountNewGame]] == aiTurn[aiTurnIndex]) {
        ++aiTurnIndex;
        if (aiTurnIndex >= aiTurn.length) {
          aiTurnIndex = 0;
        }
        field[1][yyy - 1][xxx - 1] = startNewGameTurn[indexArrayNewGame[turnCountNewGame]];
        ++turnCountNewGame;
        if (turnCountNewGame > currentPlayerNumber) {
          turnCountNewGame = 0;
        }
        var d = {
          'x':xxx,
          'y':yyy,
          'turn':turnCountNewGame,
          'max':2,
          'field':field[1],
          'fieldNumber':1
        };
        xxx -= 1;
        if (xxx <= 1) {
          xxx = 8;
          yyy -= 1;
          if (yyy <= 1) {
            yyy = 8;
          }
        }
        io.sockets.emit("put", {value:d});
      }
    }
  }
}

var ai = new AI();

class Main {
  constructor() {
    for (var v = 0; v < 3; ++v) {
      var arrayY = [];
      for (var y = 0; y < 8; ++y) {
        var arrayX = [];
        for (var x = 0; x < 8; ++x) {
          arrayX.push(-1);
        }
        arrayY.push(arrayX);
      }
      field.push(arrayY);
      joinFieldFlag.push(0);
      turn.push(0);
    }
    setInterval(this.mainLoop, 1000);
  }

  io_sockets(io_) {
    io = io_;
    
    io.sockets.on("connection", function (socket) {
  
      var name = watchingNumber;
      userHash[socket.id] = name;
      socketID.push( socket.id );
      var getNameData = {
        'name': name,
        'field': field
      };
      io.sockets.emit("getName", {value: getNameData});
      ++watchingNumber;

      socket.on("startNewGame", function (data) {
	if (data.value.middleOfGame == 1) {
          joinFieldFlag[data.value.fieldNumber] = 1;
	}
        for (var v = 0; v < startNewGameNumber; ++v) {
          if (turnCountNewGame == 0 && startNewGameFlag[indexArrayNewGame[v]]) {
                var dd = {
                  'startNewGame': true,
                  'startNewGameTurn': startNewGameTurn[indexArrayNewGame[v]]
                };
//              console.log(v);
//              console.log(indexArrayNewGame[v]);
//              console.log(socketID[indexArrayNewGame[v]]);
                io.sockets.connected[socketID[indexArrayNewGame[v]]].emit("startNewGame", {value: dd});
            aiStartFlag = true;
          }
        }
      });
      socket.on("startMiddleOfGame", function (data) {
        indexArray.push(data.value);
        startNewGameFlag[data.value] = true;
        startNewGameTurn[data.value] = startNewGameNumber;
        ++startNewGameNumber;
        ++currentPlayerNumber;
        var dd = {
          'startNewGame': true,
          'startNewGameTurn': startNewGameTurn[indexArrayNewGame[data.value]],
	  'currentPlayerNumber': currentPlayerNumber
        };
	console.log('value' + data.value);
	console.log('indexArray' + indexArrayNewGame[data.value]);
	console.log('socketID' + socketID[indexArrayNewGame[data.value]]);
        io.sockets.connected[socketID[indexArrayNewGame[data.value]]].emit("startNewGame", {value: dd});
      });
    
      socket.on("decidePlayerMaxNumber", function (data) {
        indexArrayNewGame.push(data.value.myName);
        startNewGameFlag[data.value.myName] = true;
        startNewGameTurn[data.value.myName] = startNewGameNumber;
        console.log(startNewGameTurn[data.value]);
        ++startNewGameNumber;
        initFieldMessage += data.value.myName;
        playerMaxNumber = data.value.max;
        io.sockets.emit("decidePlayerMaxNumber", {value: data.value.max});
      });
        
      socket.on("joinExistingGroup", function (data) {
        currentPlayerNumber = data.value.current;
        startNewGameFlag[data.value.myName] = true;
        startNewGameTurn[data.value.myName] = startNewGameNumber;
          console.log("jointurnCountNewGame"+data.value.myName);
          console.log("joinstartNewGameTurn"+startNewGameTurn[indexArrayNewGame[data.value.myName]]);
        ++startNewGameNumber;
        var data = {
          'fieldNumber': data.value.fieldNumber,
          'myName': data.value.myName,
          'max': playerMaxNumber,
          'initFieldMessage': initFieldMessage
        }
        io.sockets.emit("joinExistingGroup2", {value: data});
      });
      socket.on("howManyPlayers", function(data) {
	if (joinFieldFlag[data.value.fieldNumber]) {
          indexArrayNewGame.push(data.value.myName);
//          console.log(data.value);
//          console.log(indexArrayNewGame[data.value]);
//          console.log(socketID[indexArrayNewGame[data.value]]);
          io.sockets.connected[socketID[indexArrayNewGame[data.value.myName]]].emit(
             "currentPlayersNumber", {value: currentPlayerNumber});
	} else {
          io.sockets.connected[socketID[data.value.myName]].emit(
             "canNotJoinField");
	  
	}
      });
      socket.on("addAI", function (data) {
        indexArrayNewGame.push(data.value.turn);
        currentPlayerNumber = data.value.turn;
        aiTurn.push( data.value.turn);
   //     startNewGameFlag[data.value.myName] = true;
        startNewGameTurn[data.value.turn] = startNewGameNumber;
          console.log("addturnCountNewGame"+data.value.turn);
          console.log("addstartNewGameTurn"+startNewGameTurn[indexArrayNewGame[data.value.turn]]);
        ++startNewGameNumber;
        ++watchingNumber;
        socketID.push( 0 );
        io.sockets.emit("addAI", {value: data.value.turn});
      });
      socket.on("playingGame", function (name) {
        if (userHash[socket.id] == name) {
          var msg = name + "が入室しました";
          userHash[socket.id] = name;
          io.sockets.emit("publish1", {value: msg});
        }
      });
      socket.on("watchingGame", function (name) {
        if (userHash[socket.id] == name) {
          var msg = name + "が入室しました";
          userHash[socket.id] = name;
          io.sockets.emit("publish2", {value: msg});
        }
      });
    
      // メッセージ送信カスタムイベント
      socket.on("publish1", function (data) {
        io.sockets.emit("publish1", {value:data.value});
      });
      socket.on("publish2", function (data) {
        io.sockets.emit("publish2", {value:data.value});
      });
      socket.on("put", function (data) {
          field[data.value.fieldNumber][data.value.y][data.value.x] = data.value.turn;
          data.value.turn += 1;
          turnCountNewGame = data.value.turn;
//          console.log("aiTurn"+aiTurn);
          console.log("turnCountNewGame"+turnCountNewGame);
          console.log("startNewGameTurn"+startNewGameTurn[indexArrayNewGame[turnCountNewGame]]);
          if (data.value.turn > currentPlayerNumber) {
            data.value.turn = 0;  
            turnCount = 0;
          }
          var d = {
            'x':data.value.x,
            'y':data.value.y,
            'turn':data.value.turn,
            'max':playerMaxNumber,
            'field':field[data.value.fieldNumber],
            'fieldNumber':data.value.fieldNumber
          };
          io.sockets.emit("put", {value:d});
          intervalCount0 = 0;
          intervalCount1 = 0;
      });
      socket.on("disconnect", function () {
        if (userHash[socket.id]) {
          var msg = userHash[socket.id] + "が退出しました";
          delete userHash[socket.id];
          io.sockets.emit("publish1", {value: msg});
          io.sockets.emit("publish2", {value: msg});
        }
      });
    });
  }

  mainLoop() {
    ai.ai0();
    if (aiStartFlag) {
      ai.ai1();
    }
  }    
}

module.exports = Main;

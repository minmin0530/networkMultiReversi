var field = [];
var turn = [];
var once = true;
var fs = require("fs");
var server = require("http").createServer(function(req, res) {
  res.writeHead(200, {"Content-Type":"text/html"});
  var output = fs.readFileSync("./index.html", "utf-8");
  res.end(output);
  if (once) {
    once = false;
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
      turn.push(0);
    }
    setInterval(ai0, 1000);
//    setTimeout(ai1, 4000);
  }
}).listen(8080);
var io = require("socket.io").listen(server);

// ユーザ管理ハッシュ
var userHash = {};
var watchingNumber = 0;
var startMiddleOfGameFlag = [false, false, false];//false;
var startMiddleOfGameNumber = 0;
var startMiddleOfGameTurn = [0,0,0];
var socketID = [0,0,0];
// 2.イベントの定義
io.sockets.on("connection", function (socket) {

  // 接続開始カスタムイベント(接続元ユーザを保存し、他ユーザへ通知)
    var name = watchingNumber;
    userHash[socket.id] = name;
    socketID[watchingNumber] = socket.id;
    var getNameData = {
      'name': name,
      'field': field
    };
    io.sockets.emit("getName", {value: getNameData});
    ++watchingNumber;
  socket.on("startMiddleOfGame", function () {
    startMiddleOfGameFlag[startMiddleOfGameNumber] = true;
    startMiddleOfGameTurn[startMiddleOfGameNumber] = 1 + startMiddleOfGameNumber;
    ++startMiddleOfGameNumber;
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
//    if (data.value.turn >= 2) {
  //    field[0][data.value.y][data.value.x] = data.value.turn;
      var d = {
        'x':data.value.x,
        'y':data.value.y,
        'turn':data.value.turn,
        'max':2,
        'field':field[0],
        'fieldNumber':0
      };
      io.sockets.emit("put", {value:d});
      intervalCount = 0;
      if (turn[0] >= 1 + startMiddleOfGameNumber) {
        turn[0] = 0;
//        setTimeout(ai0, 5000);
      }
//    }
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

var xx = 0;
var yy = 0;
var startMiddleOfGameOnceFlag = true;
var intervalCount = 0;
function ai0() {
  ++intervalCount;
  if (intervalCount >= 5) {
    intervalCount = 0;
  console.log(turn[0]);
  if (turn[0] != 2 + startMiddleOfGameNumber) {
    if (turn[0] < 2) {
      field[0][yy][xx] = turn[0];
      xx += 1;
      if (xx >= 8) {
        xx = 0;
        yy += 1;
        if (yy >= 8) {
          yy = 0;
        }
      }
    }
    var d = {
        'x':xx,
        'y':yy,
        'turn':turn[0],
        'max':2,
        'field':field[0],
        'fieldNumber':0
    };
    if (turn[0] < 2 + startMiddleOfGameNumber) {
      ++turn[0];
    }
      //プレイヤーそれぞれに、それぞれのGameNumberを渡したい
    if (startMiddleOfGameNumber >= 1 && startMiddleOfGameFlag[startMiddleOfGameNumber - 1]) {
      if (turn[0] == 1 + startMiddleOfGameNumber) {
        startMiddleOfGameOnceFlag = false;
        var dd = {
          'startMiddleOfGame': true,
          'startMiddleOfGameTurn': startMiddleOfGameTurn[startMiddleOfGameNumber - 1]
        };
        io.sockets.emit("startMiddleOfGame", {value: dd});
      }

      if (turn[0] >= 3 + startMiddleOfGameNumber) { turn[0] = 0; }
    } else {
      if (turn[0] >= 2 + startMiddleOfGameNumber) { turn[0] = 0; }
    }
    console.log(socketID[0]);   
    if (turn[0] < 2 + startMiddleOfGameNumber) {
        io.sockets.connected[socketID[0]].emit("put", {value:d});
//        io.to(socketID[0]).emit("put", {value:d});
//      io.sockets.emit("put", {value:d});
    }
//    if (turn[0] < 3) {
//      setTimeout(ai0, 5000);
//    }
  }
  }
}
var xxx = 8;
var yyy = 8;
function ai1() {
    setTimeout(ai1, 4000);
    field[1][yyy - 1][xxx - 1] = turn[1];
    var d = {
        'x':xxx,
        'y':yyy,
        'turn':turn[1],
        'max':2,
        'field':field[1],
        'fieldNumber':1
    };
    ++turn[1];
    if (turn[1] >= 3) { turn[1] = 0; }
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
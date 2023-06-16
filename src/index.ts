const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
  },
});

const PORT = 8000;

interface Room {
  roomId: string;
  ownerId: string;
  users: {
    userId: string;
    username: string;
  }[];
}

const rooms: Room[] = [];
// クライアントから受信するリクエストはreq_
// クライアントに送信するレスポンスはres_

// クライアントと通信
io.on("connection", (socket: any) => {
  console.log("connect start");

  // 部屋作成リクエスト
  socket.on("req_createRoom", (data: any) => {
    // 部屋作成処理
    const room = createRoom(data.userId, data.username); // 適切な部屋作成の処理を実装してください
    // クライアントに送信
    // 特定の userId にのみ送信
    rooms.push(room);
    console.log(rooms);
    const res_createRoom = data.userId;
    socket.emit(res_createRoom, room);
  });

  // 部屋参加リクエスト
  socket.on("req_joinRoom", (data: any) => {
    console.log(data);
    // 部屋参加処理
    const room = joinRoom(data.userId, data.username, data.roomId);
    // クライアントに送信
    // 特定の userId にのみ送信
    const res_joinRoom = data.roomId;
    socket.emit(res_joinRoom, room);
  });

  socket.on("disconnect", () => {
    console.log("disconnect");
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const createRoom = (userId: string, username: string) => {
  const roomId = generateUUID();
  const room = {
    roomId,
    ownerId: userId,
    users: [
      {
        userId: userId,
        username: username,
      },
    ],
  };
  return room;
};

const joinRoom = (userId: string, username: string, roomId: string) => {
  console.log(rooms);
  const room = rooms.find((room) => room.roomId === roomId);
  console.log(room);
  if (!room) {
    const error = {
      message: "Room not found",
    };
    return error;
  }
  room.users.push({
    userId,
    username,
  });
  return room;
};

const generateUUID = (): string => {
  // 実際のUUID生成ロジックに置き換えるか、ライブラリを使用する
  // ここでは単純にランダムな文字列を生成して返す例を示している
  return Math.random().toString(36).substr(2, 9);
};

import { algorithm_problems } from "./algorithm_problems";
import { shuffleArray } from "./utils/shuffleArray";
import { generateUUID } from "./utils/generateUUID";
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: true,
  },
});

const PORT = 8000;

type Room = {
  roomId: string;
  ownerId: string;
  users: {
    userId: string;
    username: string;
  }[];
};

type Game = {
  roomId: string;
  difficulty: string;
  readingTime: number;
  codingTime: number;
  turn: 1;
  users: {
    userId: string;
    username: string;
    phase: "read" | "code";
    problem: string;
    answerCheck: boolean;
    answer: [];
  }[];
};

const rooms: Room[] = [];
const games: Game[] = [];
// クライアントから受信するリクエストはreq_
// クライアントに送信するレスポンスはres_

// クライアントと通信
io.on("connection", (socket: any) => {
  console.log("connect start");

  // 部屋作成リクエスト
  socket.on("req_createRoom", (data: any) => {
    // 部屋作成処理
    const room = createRoom(data.userId, data.username);
    // クライアントに送信
    // 特定の userId にのみ送信
    rooms.push(room);
    console.log(rooms);
    const res_createRoom = data.userId;
    io.emit(res_createRoom, room);
  });

  // 部屋参加リクエスト
  socket.on("req_joinRoom", (data: any) => {
    // 部屋参加処理
    const room = joinRoom(data.userId, data.username, data.roomId);
    // クライアントに送信
    const res_joinRoom = data.roomId;
    io.emit(res_joinRoom, room);
  });

  socket.on("disconnect", () => {
    console.log("disconnect");
  });

  // ゲーム開始リクエスト
  socket.on("req_startGame", (data: any) => {
    // ゲーム開始処理
    const game = startGame(
      data.roomId,
      data.difficulty,
      data.readingTime,
      data.codingTime
    );
    // クライアントに送信
    const res_startGame = data.roomId;
    io.emit(res_startGame, game);
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
  const room = rooms.find((room) => room.roomId === roomId);
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

const startGame = (
  roomId: string,
  difficulty: string,
  readingTime: number,
  codingTime: number
) => {
  const room = rooms.find((room) => room.roomId === roomId);
  if (!room) {
    const error = {
      message: "Room not found",
    };
    return error;
  }
  const shuffledUsers = shuffleArray(room.users);
  const shuffled_algorithm_problems = shuffleArray(algorithm_problems);
  const game: Game = {
    roomId: roomId,
    difficulty: difficulty,
    readingTime: readingTime,
    codingTime: codingTime,
    turn: 1,
    users: shuffledUsers.map((user, index) => {
      return {
        userId: user.userId,
        username: user.username,
        phase: "code",
        problem: shuffled_algorithm_problems[index],
        answerCheck: false,
        answer: [],
      };
    }),
  };

  return game;
};

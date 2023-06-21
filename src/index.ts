import { algorithm_problems } from "./algorithm_problems";
import { shuffleArray } from "./utils/shuffleArray";
import { generateUUID } from "./utils/generateUUID";
import {
  ReqAnswer,
  ReqCreateRoom,
  ReqJoinRoom,
  ReqStartGame,
} from "./types/requests";
import { Socket } from "socket.io";
import { Game, Room } from "./types/sockets";
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
const capacity = 5;

const rooms: Room[] = [];
const games: Game[] = [];
// クライアントから受信するリクエストはreq_
// クライアントに送信するレスポンスはres_

// クライアントと通信
io.on("connection", (socket: Socket) => {
  console.log("connect start");

  // 部屋作成リクエスト
  socket.on("req_createRoom", (data: ReqCreateRoom) => {
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
  socket.on("req_joinRoom", (data: ReqJoinRoom) => {
    // 参加上限を5人としてそれ以上の時は入れないようにする
    const room = rooms.find((room) => room.roomId === data.roomId);
    if (!room) {
      const error = {
        message: "Room not found",
      };
      return error;
    }
    if (room.users.length >= capacity) {
      const error = {
        message: "Room is full",
      };
      return error;
    } else {
      // 部屋参加処理
      const room = joinRoom(data.userId, data.username, data.roomId);
      // クライアントに送信
      const res_joinRoom = data.roomId;
      io.emit(res_joinRoom, room);
    }
  });

  socket.on("disconnect", () => {
    console.log("disconnect");
  });

  // ゲーム開始リクエスト
  socket.on("req_startGame", (data: ReqStartGame) => {
    // ゲーム開始処理
    const game = startGame(
      data.roomId,
      data.difficulty,
      data.readingTime,
      data.codingTime
    );
    if (typeof game === "object" && !("message" in game)) {
      games.push(game);
    }
    // クライアントに送信
    const res_startGame = `res_gameStart_${data.roomId}`;
    io.emit(res_startGame, game);
  });

  // 回答リクエスト
  //   socket.on("req_answer", (data: ReqAnswer) => {
  //     // 回答処理
  //     const game = answerGame(
  //       data.roomId,
  //       data.userId,
  //       data.answerCode,
  //       data.language
  //     );
  //     // roomIdが一致するgamesの中のgameを更新
  //     if (typeof game === "object" && !("message" in game)) {
  //       const index = games.findIndex((game) => game.roomId === data.roomId);
  //       games[index] = game;
  //     }
  //     // クライアントに送信
  //     const res_answer = `res_answer_${data.roomId}`;
  //     io.emit(res_answer, game);
  //   });
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
    phase: "code",
    users: shuffledUsers.map((user) => {
      return {
        userId: user.userId,
        username: user.username,
        isAnswered: false,
      };
    }),
    problems: shuffledUsers.map((user, index) => {
      return {
        problemId: index.toString(),
        problem: shuffled_algorithm_problems[index],
        answers: [],
      };
    }),
  };
  return game;
};

// const answerGame = (
//   roomId: string,
//   userId: string,
//   answerCode: string,
//   language: string
// ) => {
//   const game = games.find((game) => game.roomId === roomId);
//   if (!game) {
//     const error = {
//       message: "Game not found",
//     };
//     return error;
//   }
//   const user = game.users.find((user) => user.userId === userId);
//   if (!user) {
//     const error = {
//       message: "User not found",
//     };
//     return error;
//   }
//   user.answerCheck = true;
//   user.answers[game.turn - 1].answerCode = answerCode;
//   user.answers[game.turn - 1].language = language;
//   // 全員が回答した処理
//   if (game.users.every((user) => user.answerCheck)) {
//     // turnを+1して、answerCheckをfalseにして、phaseをread or codeにする
//     game.turn += 1;
//     game.users.forEach((user) => {
//       user.answerCheck = false;
//     });
//     if (game.phase === "read") {
//       game.phase = "code";
//     } else {
//       game.phase = "read";
//     }
//     // 最後のターンの処理
//     if (game.turn > game.users.length) {
//       // phaseをendにする
//       game.phase = "end";
//     }
//     return game;
//   }
//   return game;
// };

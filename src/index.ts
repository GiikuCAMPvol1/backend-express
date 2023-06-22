import { algorithm_problems } from "./algorithm_problems";
import { shuffleArray } from "./utils/shuffleArray";
import { generateUUID } from "./utils/generateUUID";
import {
  ReqAnswer,
  ReqAnswerCode,
  ReqAnswerRead,
  ReqCreateRoom,
  ReqJoinRoom,
  ReqStartGame,
  ReqUpdateResult,
} from "./types/requests";
import { Socket } from "socket.io";
import { Game, Room } from "./types/sockets";
import { getProblemsByDifficulty } from "./utils/getProblemsByDifficulty";
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
  socket.on("req_answer", (data: ReqAnswer) => {
    // 回答処理
    const game = answerGame(data);
    // roomIdが一致するgamesの中のgameを更新
    if (typeof game === "object" && !("message" in game)) {
      const index = games.findIndex((game) => game.roomId === data.roomId);
      games[index] = game;
    }
    // クライアントに送信
    const res_answer = `res_answer_${data.roomId}`;
    io.emit(res_answer, game);
  });

  // 結果画面更新リクエスト
  socket.on("req_updateResult", (data: ReqUpdateResult) => {
    // 結果画面更新処理
    const game = updateResult(data);
    // roomIdが一致するgamesの中のgameを更新
    if (typeof game === "object" && !("message" in game)) {
      const index = games.findIndex((game) => game.roomId === data.roomId);
      games[index] = game;
      // ターン数がユーザー数以下の時のみ結果画面を更新する
      if (game.turn <= game.users.length) {
        // クライアントに送信
        const res_updateResult = `res_updateResult_${data.roomId}`;
        io.emit(res_updateResult, game);
      }
    }
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

  const problems = getProblemsByDifficulty(algorithm_problems, difficulty);
  const shuffled_algorithm_problems = shuffleArray(problems);

  const game: Game = {
    roomId: roomId,
    difficulty: difficulty,
    readingTime: readingTime,
    codingTime: codingTime,
    turn: 1,
    phase: "code",
    users: shuffledUsers.map((user, index) => {
      return {
        userId: user.userId,
        username: user.username,
        problemId: index,
        isAnswered: false,
      };
    }),
    problems: shuffledUsers.map((user, index) => {
      return {
        problemId: index,
        problem: shuffled_algorithm_problems[index],
        answers: [
          {
            type: "read",
            userId: "-1",
            readAnswer: shuffled_algorithm_problems[index],
            problemId: index,
          },
        ],
      };
    }),
  };
  return game;
};

const answerGame = (data: ReqAnswer) => {
  const roomId = data.roomId;
  const game = games.find((game) => game.roomId === roomId);
  if (!game) {
    const error = {
      message: "Game not found",
    };
    return error;
  }
  const userId = data.userId;
  const user = game.users.find((user) => user.userId === userId);
  if (!user) {
    const error = {
      message: "User not found",
    };
    return error;
  }
  user.isAnswered = true;
  const problem = game.problems.find(
    (problem) => problem.problemId === data.problemId
  );
  if (!problem) return;
  if (data.type === "code") {
    const answer = {
      type: "code",
      userId: userId,
      codeAnswer: data.codeAnswer,
      language: data.language,
    } as ReqAnswerCode;
    problem.answers.push(answer);
  } else if (data.type === "read") {
    const answer = {
      type: data.type,
      userId: userId,
      readAnswer: data.readAnswer,
    } as ReqAnswerRead;
    problem.answers.push(answer);
  }

  if (game.users.find((user) => user.isAnswered === false) !== undefined) {
    //まだ全員が回答しきっていない場合
    return game;
  }
  for (const user of game.users) {
    user.isAnswered = false;
    user.problemId = (user.problemId + 1) % game.users.length;
  }
  game.turn++;
  if (game.turn > game.users.length) {
    game.phase = "end";
    game.turn = 1;
    return game;
  }
  game.phase = game.phase === "read" ? "code" : "read";
  return game;
};

const updateResult = (data: ReqUpdateResult) => {
  const roomId = data.roomId;
  const game = games.find((game) => game.roomId === roomId);
  if (!game) {
    const error = {
      message: "Game not found",
    };
    return error;
  }
  game.turn++;
  return game;
};

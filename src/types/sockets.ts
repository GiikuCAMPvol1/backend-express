import { ReqAnswerRead, ReqAnswerCode } from "./requests";

export type Room = {
  roomId: string;
  ownerId: string;
  users: {
    userId: string;
    username: string;
  }[];
};

export type Game = {
  roomId: string;
  difficulty: string;
  readingTime: number;
  codingTime: number;
  turn: number;
  phase: "read" | "code" | "end";
  users: {
    userId: string;
    username: string;
    problemId: number;
    isAnswered: boolean;
  }[];
  problems: {
    problemId: number;
    problem: string;
    answers: (ReqAnswerRead | ReqAnswerCode)[];
  }[];
};

export type ReqCreateRoom = {
  userId: string;
  username: string;
};

export type ReqJoinRoom = {
  roomId: string;
  userId: string;
  username: string;
};

export type ReqStartGame = {
  roomId: string;
  difficulty: string;
  readingTime: number;
  codingTime: number;
};

export type ReqAnswer = (ReqAnswerRead | ReqAnswerCode) & {
  roomId: string;
};

export type ReqAnswerRead = {
  type: "read";
  userId: string;
  readAnswer: string;
  problemId: number;
};

export type ReqAnswerCode = {
  type: "code";
  userId: string;
  codeAnswer: string;
  language: string;
  problemId: number;
};

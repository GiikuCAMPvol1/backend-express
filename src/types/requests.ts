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

export type ReqAnswer =
  | {
      type: "read";
      roomId: string;
      userId: string;
      readAnswer: string;
    }
  | {
      type: "code";
      roomId: string;
      userId: string;
      codeAnswer: string;
      language: string;
    };

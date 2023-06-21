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
    isAnswered: boolean;
  }[];
  problems: {
    problemId: string;
    problem: string;
    answers: (
      | {
          type: "read";
          userId: string;
          answerRead: string;
        }
      | {
          type: "code";
          userId: string;
          answerCode: string;
          language: string;
        }
    )[];
  }[];
};

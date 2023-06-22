import { AlgorithmProblems } from "../types/algorithmProblems";

export const getProblemsByDifficulty = (
  algorithm_problems: AlgorithmProblems,
  difficulty: string
): string[] => {
  if (
    difficulty === "easy" ||
    difficulty === "normal" ||
    difficulty === "hard"
  ) {
    return algorithm_problems[difficulty];
  } else {
    return [];
  }
};

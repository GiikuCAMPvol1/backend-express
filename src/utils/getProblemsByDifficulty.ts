import { AlgorithmProblems } from "../types/algorithmProblems";

export const getProblemsByDifficulty = (
  algorithm_problems: AlgorithmProblems,
  difficulty: "easy" | "normal" | "hard"
): string[] => {
  return algorithm_problems[difficulty];
};

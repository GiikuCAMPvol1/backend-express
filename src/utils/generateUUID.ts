export const generateUUID = (): string => {
  // 実際のUUID生成ロジックに置き換えるか、ライブラリを使用する
  // ここでは単純にランダムな文字列を生成して返す例を示している
  return Math.random().toString(36).substr(2, 9);
};

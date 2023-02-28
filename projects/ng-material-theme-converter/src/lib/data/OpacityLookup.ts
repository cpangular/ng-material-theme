const opacityMap = [
  [[0.02], [0.04]],
  [[0.02], [0.08]],
  [[0.06], [0.12]],
  [[0.12], [0.24]],
  [[0.24], [0.38]],
  [[0.42], [0.4]],
  [[0.65], [0.87]],
];

// export function getTintLevel(opacity: number, darkMode: boolean): TintLevel | undefined {
//   for (let i = 0; i < tintMap.length; i++) {
//     const mode = tintMap[i];
//     const lvl = mode[darkMode ? 1 : 0];
//     console.log('-------------', lvl)
//     if (lvl.includes(opacity)) {
//       return tintLevels[i];
//     }
//     return undefined;
//   }
// }

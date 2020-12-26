export default function findAllLevels(features) {
  const levels = [];
  for (let i = 0; i < features.length; i++) {
    const feature = features[i];
    if (feature.properties.class === 'level') {
      continue;
    }
    const level = feature.properties.level;
    if (level === undefined || level === null) {
      continue;
    }
    let subLevelArray = level.split(";");
    let subLevels = subLevelArray;

    if (subLevels.length === 2 && Math.abs(subLevels[1] - subLevels[0]) > 1) {
      subLevels = Array(Math.abs(subLevelArray[1] - subLevelArray[0]) + 1).fill().map((v, k) => (Math.min(subLevelArray[0], subLevelArray[1]) + k).toString())
    }
    for (let j = 0; j < subLevels.length; j++) {
      const subLevel = subLevels[j];
      if (!levels.includes(subLevel) && !isNaN(subLevel) && subLevel) {
        levels.push(subLevel);
      }
    }
  }
  return levels.sort((a, b) => a - b).reverse();
}

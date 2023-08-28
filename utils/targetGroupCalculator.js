exports.getValidNeighbors = num => {
  return [num - 2, num - 1, num, num + 1, num + 2].filter(
    x => x >= 1 && x <= 6,
  );
};

exports.getTargetGroups = (r, g, b) => {
  const rValues = exports.getValidNeighbors(r);
  const gValues = exports.getValidNeighbors(g);
  const bValues = exports.getValidNeighbors(b);

  let groups = [];

  for (let i = 0; i < rValues.length; i++) {
    for (let j = 0; j < gValues.length; j++) {
      for (let k = 0; k < bValues.length; k++) {
        groups.push(
          parseInt(
            rValues[i].toString() +
              gValues[j].toString() +
              bValues[k].toString(),
          ),
        );
      }
    }
  }

  return groups;
};

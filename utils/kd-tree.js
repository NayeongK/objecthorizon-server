function buildKDTree(points, depth = 0) {
  if (!points.length) return null;

  const k = points[0].length;
  const axis = depth % k;

  points.sort((a, b) => a[axis] - b[axis]);
  const median = Math.floor(points.length / 2);

  const node = {
    point: points[median],
    left: buildKDTree(points.slice(0, median), depth + 1),
    right: buildKDTree(points.slice(median + 1), depth + 1),
    axis: axis,
  };

  return node;
}

function distanceSquared(pointA, pointB) {
  let distance = 0;
  for (let i = 0; i < pointA.length; i++) {
    distance += (pointA[i] - pointB[i]) ** 2;
  }
  return distance;
}

function closestPoint(node, point, best = null) {
  if (node === null) return best;

  const d = distanceSquared(node.point, point);
  const dx = node.point[node.axis] - point[node.axis];
  let bestPoint = best;

  if (best === null || d < distanceSquared(best, point)) {
    bestPoint = node.point;
  }

  if (dx > 0) {
    bestPoint = closestPoint(node.left, point, bestPoint);
  } else {
    bestPoint = closestPoint(node.right, point, bestPoint);
  }

  if (dx ** 2 < distanceSquared(bestPoint, point)) {
    if (dx > 0) {
      bestPoint = closestPoint(node.right, point, bestPoint);
    } else {
      bestPoint = closestPoint(node.left, point, bestPoint);
    }
  }

  return bestPoint;
}

module.exports = {
  buildKDTree,
  distanceSquared,
  closestPoint,
};

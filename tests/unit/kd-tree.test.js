const {
  buildKDTree,
  distanceSquared,
  closestPoint,
} = require("../../utils/kd-tree");

describe("buildKDTree", () => {
  it("should build a KD tree", () => {
    const points = [
      [2, 3],
      [5, 4],
      [9, 6],
      [4, 7],
      [8, 1],
    ];
    const kdTree = buildKDTree(points);

    function isValidKDTree(node, depth = 0, k = 2) {
      if (node === null) {
        return true;
      }

      const axis = depth % k;
      let valid = true;

      if (node.left) {
        valid = valid && node.left.point[axis] <= node.point[axis];
        valid = valid && isValidKDTree(node.left, depth + 1, k);
      }

      if (node.right) {
        valid = valid && node.right.point[axis] > node.point[axis];
        valid = valid && isValidKDTree(node.right, depth + 1, k);
      }

      return valid;
    }

    expect(isValidKDTree(kdTree)).toBe(true);
  });
});

describe("distanceSquared", () => {
  it("should calculate the squared distance between two points", () => {
    const pointA = [1, 2];
    const pointB = [4, 6];
    const result = distanceSquared(pointA, pointB);

    expect(result).toBe(25);
  });
});

describe("closestPoint", () => {
  it("should find the closest point in the KD tree", () => {
    const points = [
      [2, 3],
      [5, 4],
      [9, 6],
      [4, 6],
      [8, 1],
    ];
    const kdTree = buildKDTree(points);
    const targetPoint = [3, 5];
    const closest = closestPoint(kdTree, targetPoint);

    expect(closest).toEqual([4, 6]);
  });
});

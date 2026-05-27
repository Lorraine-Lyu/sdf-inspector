/** Convert a 6D continuous rotation (first two columns of R, stacked) to a 3x3
 *  rotation matrix, then to XYZ Euler angles in radians. Mirrors the inverse
 *  of `engine.model.rotation_utils.euler_to_rotation_matrix` used by training,
 *  so the displayed Euler matches what the dataset originally specified. */
export function rotation6dToEulerRad(rot6d: number[] | undefined): [number, number, number] {
  if (!rot6d || rot6d.length < 6) return [0, 0, 0];
  const a1 = [rot6d[0], rot6d[1], rot6d[2]];
  const a2 = [rot6d[3], rot6d[4], rot6d[5]];

  const n1 = Math.hypot(a1[0], a1[1], a1[2]) + 1e-8;
  const e1 = [a1[0] / n1, a1[1] / n1, a1[2] / n1];

  const dot = a2[0] * e1[0] + a2[1] * e1[1] + a2[2] * e1[2];
  const u2 = [a2[0] - dot * e1[0], a2[1] - dot * e1[1], a2[2] - dot * e1[2]];
  const n2 = Math.hypot(u2[0], u2[1], u2[2]) + 1e-8;
  const e2 = [u2[0] / n2, u2[1] / n2, u2[2] / n2];

  const e3 = [
    e1[1] * e2[2] - e1[2] * e2[1],
    e1[2] * e2[0] - e1[0] * e2[2],
    e1[0] * e2[1] - e1[1] * e2[0],
  ];

  // R = [e1 | e2 | e3]; R[r][c] indexed by row, column.
  const R = [
    [e1[0], e2[0], e3[0]],
    [e1[1], e2[1], e3[1]],
    [e1[2], e2[2], e3[2]],
  ];

  const sy = Math.sqrt(R[0][0] ** 2 + R[1][0] ** 2);
  let rx: number, ry: number, rz: number;
  if (sy > 1e-6) {
    rx = Math.atan2(R[2][1], R[2][2]);
    ry = Math.atan2(-R[2][0], sy);
    rz = Math.atan2(R[1][0], R[0][0]);
  } else {
    rx = Math.atan2(-R[1][2], R[1][1]);
    ry = Math.atan2(-R[2][0], sy);
    rz = 0;
  }
  return [rx, ry, rz];
}

export function rotation6dToEulerDeg(rot6d: number[] | undefined): [number, number, number] {
  const [rx, ry, rz] = rotation6dToEulerRad(rot6d);
  const k = 180 / Math.PI;
  return [rx * k, ry * k, rz * k];
}

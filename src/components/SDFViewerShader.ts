export const VERTEX_SHADER = `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

export function buildFragmentShader(sdfGlsl: string): string {
  return `
precision highp float;

uniform vec3 uCameraPos;
uniform vec3 uCameraTarget;
uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uMaterialColor;

${sdfGlsl}

float raymarch(vec3 ro, vec3 rd) {
  float t = 0.0;
  for (int i = 0; i < 128; i++) {
    vec3 p = ro + rd * t;
    float d = sceneSDF(p);
    if (d < 0.001) return t;
    t += d;
    if (t > 20.0) break;
  }
  return -1.0;
}

vec3 estimateNormal(vec3 p) {
  float e = 0.0005;
  return normalize(vec3(
    sceneSDF(p + vec3(e, 0.0, 0.0)) - sceneSDF(p - vec3(e, 0.0, 0.0)),
    sceneSDF(p + vec3(0.0, e, 0.0)) - sceneSDF(p - vec3(0.0, e, 0.0)),
    sceneSDF(p + vec3(0.0, 0.0, e)) - sceneSDF(p - vec3(0.0, 0.0, e))
  ));
}

vec3 shade(vec3 p, vec3 normal, vec3 viewDir) {
  vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
  vec3 halfDir = normalize(lightDir + viewDir);

  float diffuse = max(dot(normal, lightDir), 0.0);
  float specular = pow(max(dot(normal, halfDir), 0.0), 32.0);
  float ambient = 0.15;

  vec3 color = uMaterialColor * (ambient + diffuse * 0.7) + vec3(1.0) * specular * 0.3;
  return color;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uResolution) / uResolution.y;

  vec3 ro = uCameraPos;
  vec3 forward = normalize(uCameraTarget - uCameraPos);
  vec3 right = normalize(cross(forward, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(right, forward);
  vec3 rd = normalize(forward + uv.x * right + uv.y * up);

  float t = raymarch(ro, rd);

  if (t > 0.0) {
    vec3 p = ro + rd * t;
    vec3 normal = estimateNormal(p);
    vec3 color = shade(p, normal, -rd);
    color = pow(color, vec3(1.0 / 2.2));
    gl_FragColor = vec4(color, 1.0);
  } else {
    float grad = 0.5 + 0.5 * rd.y;
    vec3 bg = mix(vec3(0.1), vec3(0.2), grad);
    gl_FragColor = vec4(bg, 1.0);
  }
}
`;
}

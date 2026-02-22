// Custom type declarations for gl-matrix to fix TS1540 errors
// gl-matrix 3.4.3 uses deprecated 'module' keyword in its .d.ts
declare module 'gl-matrix' {
  export type vec2 = Float32Array;
  export type vec3 = Float32Array;
  export type vec4 = Float32Array;
  export type mat2 = Float32Array;
  export type mat2d = Float32Array;
  export type mat3 = Float32Array;
  export type mat4 = Float32Array;
  export type quat = Float32Array;
  export type quat2 = Float32Array;
}

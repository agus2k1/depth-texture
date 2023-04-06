const vertexShader = /* glsl */ `
  #include <packing>
  varying vec2 vUv;
  uniform float cameraNear;
  uniform float cameraFar;
  uniform sampler2D depthInfo;
  uniform sampler2D ttt;

  float readDepth( sampler2D depthSampler, vec2 coord ) {
		float fragCoordZ = texture2D( depthSampler, coord ).x;
		float viewZ = perspectiveDepthToViewZ( fragCoordZ, cameraNear, cameraFar );
		return viewZToOrthographicDepth( viewZ, cameraNear, cameraFar );
	}

  void main() {
    vUv = uv;

    float depth = readDepth( depthInfo, vUv );
    vec3 pos = position;
    pos.z += depth;

    vec4 mvPosition = modelViewMatrix * vec4( pos, 1. );
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export default vertexShader;

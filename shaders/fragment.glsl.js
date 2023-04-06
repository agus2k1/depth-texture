const fragmentShader = /* glsl */ `
    #include <packing>
    varying vec2 vUv;
    varying vec2 vUv1;
    varying float vDepth;
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
        float depth = readDepth( depthInfo, vUv1 );

        float toMix = smoothstep(0.2, 1., vDepth);

        gl_FragColor.rgb = mix(vec3(1, 0.9, 0.235), vec3(0., 0.001, 0.242), toMix);
		gl_FragColor.a = 1.0;
    }
`;

export default fragmentShader;

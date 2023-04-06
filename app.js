import './main.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import fragment from './shaders/fragment.glsl.js';
import vertex from './shaders/vertex.glsl.js';
import model from './models/face.glb';

export default class Sketch {
  constructor() {
    this.scene = new THREE.Scene();
    this.postScene = new THREE.Scene();
    this.container = document.getElementById('container');
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(this.width, this.height);
    // this.renderer.setClearColor(0xeeeeee, 1);
    this.renderer.useLegacyLights = true;
    // this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      0.01,
      5
    );

    this.postCamera = new THREE.PerspectiveCamera(
      70,
      window.innerWidth / window.innerHeight,
      2,
      4
    );

    this.camera.position.set(0, 0, 2);
    this.postCamera.position.set(0, 0, 2);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.time = 0;

    this.loadModel();
    this.addMesh();
    this.setupResize();
    // this.resize();
    this.render();
  }

  setupResize() {
    window.addEventListener('resize', this.resize.bind(this));
  }

  resize() {
    this.width = this.container.offsetWidth;
    this.height = this.container.offsetHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;

    // image cover
    this.imageAspect = 853 / 1280;
    let a1;
    let a2;
    if (this.height / this.width > this.imageAspect) {
      a1 = (this.width / this.height) * this.imageAspect;
      a2 = 1;
    } else {
      a1 = 1;
      a2 = this.height / this.width / this.imageAspect;
    }

    this.material.uniforms.resolution.value.x = this.width;
    this.material.uniforms.resolution.value.y = this.height;
    this.material.uniforms.resolution.value.z = a1;
    this.material.uniforms.resolution.value.w = a2;

    // optional - cover with quad
    const distance = this.camera.position.z;
    const height = 1;
    this.camera.fov = 2 * (180 / Math.PI) * Math.atan(height / (2 * distance));

    // if (w/h > 1)
    // if (this.width / this.height > 1) {
    //   this.plane.scale.x = this.camera.aspect;
    // } else {
    //   this.plane.scale.y = 1 / this.camera.aspect;
    // }

    this.camera.updateProjectionMatrix();
  }

  loadModel() {
    this.loader = new GLTFLoader();
    this.loader.load(model, (gltf) => {
      let scale = 0.1;
      this.model = gltf.scene.children[0];
      this.model.scale.set(scale * 1.8, scale, scale);
      this.model.position.set(0, 0, -1.5);

      this.model.traverse((obj) => {
        if (obj.isMesh) {
          obj.material = new THREE.MeshBasicMaterial({
            color: 0x000000,
          });
        }
      });

      this.scene.add(this.model);
    });
  }

  addMesh() {
    this.material = new THREE.ShaderMaterial({
      extensions: {
        derivatives: '#extension GL_OES_standard_derivatives : enable',
      },
      uniforms: {
        time: { value: 0 },
        resolution: { value: new THREE.Vector4() },
        cameraNear: { value: this.postCamera.near },
        cameraFar: { value: this.postCamera.far },
        depthInfo: { value: null },
        ttt: { value: 0 },
      },
      fragmentShader: fragment,
      vertexShader: vertex,
      // side: THREE.DoubleSide,
      // wireframe: true,
    });
    this.geometry = new THREE.PlaneGeometry(2, 2, 200, 200);

    this.plane = new THREE.Mesh(this.geometry, this.material);
    // this.plane.position.set(0, 0, 2);
    // this.scene.add(this.plane);

    // Lines
    for (let i = 0; i <= 100; i++) {
      this.lineGeometry = new THREE.PlaneGeometry(2, 0.005, 300, 1);

      let y = [];
      let length = this.geometry.attributes.position.array.length;

      for (let j = 0; j < length / 3; j++) {
        y.push(i / 100);
      }

      this.lineGeometry.setAttribute(
        'y',
        new THREE.BufferAttribute(new Float32Array(y), 1)
      );

      this.lineMesh = new THREE.Mesh(this.lineGeometry, this.material);
      this.lineMesh.position.y = (i - 50) / 50;
      this.scene.add(this.lineMesh);
    }

    // Texture
    this.target = new THREE.WebGLRenderTarget(this.width, this.height);
    // this.target.texture.format = THREE.RGBAFormat;
    this.target.texture.minFilter = THREE.NearestFilter;
    this.target.texture.magFilter = THREE.NearestFilter;
    this.target.texture.generateMipmaps = false;
    this.target.stencilBuffer = false;
    this.target.depthTexture = new THREE.DepthTexture();
    this.target.depthTexture.format = THREE.DepthFormat;
    this.target.depthTexture.type = THREE.UnsignedShortType;
  }

  render() {
    this.time += 0.5;
    this.material.uniforms.time.value = this.time;
    window.requestAnimationFrame(this.render.bind(this));

    if (this.model) {
      this.model.position.z = -1.6 + 0.2 * Math.sin(this.time / 50);
      this.model.rotation.z = -0.1 + 0.2 * Math.sin(this.time / 50);
    }

    // render scene into target
    this.renderer.setRenderTarget(this.target);
    this.renderer.render(this.scene, this.postCamera);

    this.material.uniforms.ttt.value = this.target.texture;
    this.material.uniforms.depthInfo.value = this.target.depthTexture;

    this.renderer.setRenderTarget(null);
    this.renderer.clear();
    this.renderer.render(this.scene, this.camera);
  }
}

new Sketch();

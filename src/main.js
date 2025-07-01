import { Engine, Scene, Vector3, HemisphericLight, MeshBuilder, UniversalCamera, VirtualJoystick, Vector2 } from "@babylonjs/core";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import "/src/style.css"
import { detectInputDevices } from "/src/utils.js"

const CAMERA_SMOOTHNESS = 0.3;
const CAMERA_ROTATION_SPEED = 0.01;
const CAMERA_MOVE_SPEED = 0.05;

window.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("renderCanvas");
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);

  const camera = new UniversalCamera("cam", new Vector3(0, 1, 0), scene);
  //camera.attachControl(canvas, true);
  camera.speed = (1-CAMERA_SMOOTHNESS)*2;
  camera.keysUp.push(87); // W
  camera.keysDown.push(83); // S
  camera.keysLeft.push(65); // A
  camera.keysRight.push(68); // D
  camera.inertia = CAMERA_SMOOTHNESS;
  camera.angularSensibility = 1000;
  camera.angularSensibility += camera.angularSensibility * CAMERA_SMOOTHNESS;

  const leftJoystick = new VirtualJoystick(true, { color: '#ffffff' });
  const lastTouch = new Vector2(0, 0);
  const inputDevice = detectInputDevices();

  canvas.addEventListener("click", () => {
    if (document.pointerLockElement !== canvas) {
      canvas.requestPointerLock();
      canvas.requestFullscreen();
    }
  });

  canvas.addEventListener("touchstart", () => {
    if (document.pointerLockElement !== canvas) {
      canvas.requestFullscreen();
    }
  });

  document.addEventListener("pointerlockchange", () => {
    const isLocked = document.pointerLockElement === canvas;
    camera.attachControl(canvas, isLocked);
  });

  const light = new HemisphericLight("light", new Vector3(1,1,0), scene);
  const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);
  sphere.position.y = 1;
  MeshBuilder.CreateGround("ground", { width: 50, height: 50}, scene);

  window.addEventListener("keydown", (ev) => {
    if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.key === 'I') {
      scene.debugLayer.isVisible() ? scene.debugLayer.hide() : scene.debugLayer.show();
    }
  });

  document.addEventListener("touchstart", event => {
    lastTouch.x = event.touches[0].clientX;
    lastTouch.y = event.touches[0].clientY;
  });

  document.addEventListener("touchmove", event => {
    camera.cameraRotation.y += (event.touches[0].clientX-lastTouch.x) / window.innerWidth * CAMERA_ROTATION_SPEED * 150;
    lastTouch.x = event.touches[0].clientX;
    camera.cameraRotation.x += (event.touches[0].clientY-lastTouch.y) / window.innerWidth * CAMERA_ROTATION_SPEED * 150;
    lastTouch.y = event.touches[0].clientY;
  });

  function update() {
    scene.render()
    if (leftJoystick.pressed) {
      camera.cameraDirection.x += leftJoystick.deltaPosition.x * CAMERA_MOVE_SPEED;
      camera.cameraDirection.z += leftJoystick.deltaPosition.y * CAMERA_MOVE_SPEED;
    }
  }

  engine.runRenderLoop(() => {
    update();
  });
  window.addEventListener("resize", () => engine.resize());
});
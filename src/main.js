import { Engine, Scene, Vector3, HemisphericLight, MeshBuilder, UniversalCamera, VirtualJoystick, Vector2, Quaternion, StandardMaterial, Color3, DirectionalLight, ShadowGenerator, CascadedShadowGenerator } from "@babylonjs/core";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import "/src/style.css"
import { detectInputDevices } from "/src/utils.js"
import HavokPhysics from "@babylonjs/havok";
import { HavokPlugin, PhysicsShapeType, PhysicsAggregate } from "@babylonjs/core/Physics";

const CAMERA_ROTATION_SPEED = 0.003;
const CAMERA_MOVE_SPEED = 500;

window.addEventListener("DOMContentLoaded", () => {
  createScene().then(() => {});
});

async function createScene() {
  const canvas = document.getElementById("renderCanvas");
  const inputDevice = detectInputDevices();
  const engine = new Engine(canvas, true);
  const scene = new Scene(engine);
  
  const havok = await HavokPhysics({
    locateFile: (path) => `node_modules/@babylonjs/havok/lib/esm/${path}`
  });
  const hk = new HavokPlugin(true, havok);
  scene.enablePhysics(new Vector3(0, -9.8, 0), hk);

  const camera = new UniversalCamera("cam", new Vector3(0, 1, 0), scene);
  camera.speed = 0;

  let cameraPitch = 0;
  let cameraYaw = 0;

  const pressedKeys = {};

  const leftJoystick = new VirtualJoystick(true, { color: '#ffffff' });
  if (inputDevice.primaryInput !== 'touch') {
    leftJoystick.setJoystickColor('transparent');
    leftJoystick.releaseCanvas();
  }

  let isRotatingTouch = false;
  const lastRotateTouch = new Vector2();

  canvas.addEventListener("click", () => {
    if (document.pointerLockElement !== canvas) {
      canvas.requestFullscreen();
      canvas.requestPointerLock();
    }
  });

  document.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement === canvas) {
      canvas.requestPointerLock();
    }
  });

  function onMouseMove(e) {
    const sensitivity = 0.002;
    cameraYaw += e.movementX * sensitivity;
    cameraPitch += e.movementY * sensitivity;
    cameraPitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraPitch));
  }

  document.addEventListener("pointerlockchange", () => {
    if (document.pointerLockElement === canvas) {
      document.addEventListener("mousemove", onMouseMove, false);
    } else {
      document.removeEventListener("mousemove", onMouseMove, false);
    }
  });

  const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
  light.intensity = 0.3;
  const dirLight = new DirectionalLight("dirLight", new Vector3(-1, -2, -1), scene);
  dirLight.position = new Vector3(10, 20, 10);
  const shadowGen = new CascadedShadowGenerator(4096, dirLight, true, camera);
  shadowGen.lambda = 0.7;
  shadowGen.autoCalcDepthBounds = true;
  shadowGen.usePercentageCloserFiltering = true;
  shadowGen.filteringQuality = ShadowGenerator.QUALITY_HIGH;
  shadowGen.bias = 0.0005;
  shadowGen.normalBias = 0.005;
  shadowGen.setDarkness(0.5);

  camera.minZ = 0.5;
  camera.maxZ = 500;

  const redMat = new StandardMaterial("redMat", scene);
  redMat.diffuseColor = new Color3(1, 0, 0);
  const greenMat = new StandardMaterial("greenMat", scene);
  greenMat.diffuseColor = new Color3(0, 1, 0);
  const sphere = MeshBuilder.CreateSphere("sphere", { diameter: 1 }, scene);
  sphere.receiveShadows = true;
  sphere.material = redMat;
  sphere.position.x = 5;
  sphere.position.y = 4;
  shadowGen.addShadowCaster(sphere);
  const cube = MeshBuilder.CreateBox("cube", { size: 1 }, scene);
  cube.receiveShadows = true;
  cube.material = greenMat;
  cube.position.x = 5;
  cube.position.y = 2;
  const cube2 = MeshBuilder.CreateBox("cube2", { size: 1 }, scene);
  cube2.receiveShadows = true;
  cube2.material = greenMat;
  cube2.position.x = 5;
  cube2.position.y = 1;
  const cube3 = MeshBuilder.CreateBox("cube3", { size: 1 }, scene);
  cube3.receiveShadows = true;
  cube3.material = greenMat;
  cube3.position.x = 5;
  cube3.position.y = 3;
  const cube4 = MeshBuilder.CreateBox("cube4", { size: 1 }, scene);
  cube4.receiveShadows = true;
  cube4.material = greenMat;
  cube4.position.x = 4;
  cube4.position.y = 1;
  const cube5 = MeshBuilder.CreateBox("cube5", { size: 1 }, scene);
  cube5.receiveShadows = true;
  cube5.material = greenMat;
  cube5.position.x = 6;
  cube5.position.y = 1;
  shadowGen.addShadowCaster(cube);
  shadowGen.addShadowCaster(cube2);
  shadowGen.addShadowCaster(cube3);
  shadowGen.addShadowCaster(cube4);
  shadowGen.addShadowCaster(cube5);
  for (let i = 0; i < 50; i++) {
    const box = MeshBuilder.CreateBox(`box${i}`, { size: 0.5 }, scene);
    box.position.x = Math.random() * 20 - 10;
    box.position.y = Math.random() * 10 + 1;
    box.position.z = Math.random() * 20 - 10;
    box.receiveShadows = true;
    box.material = greenMat;
    shadowGen.addShadowCaster(box);
    new PhysicsAggregate(box, PhysicsShapeType.BOX, { mass: 1, restitution: 0.75 }, scene);
  }
  const ground = MeshBuilder.CreateGround("ground", { width: 50, height: 50 }, scene);
  ground.receiveShadows = true;
  const sphereAggregate = new PhysicsAggregate(sphere, PhysicsShapeType.SPHERE, { mass: 1, restitution: 0.75 }, scene);
  new PhysicsAggregate(cube, PhysicsShapeType.BOX, { mass: 1, restitution: 0.75 }, scene);
  new PhysicsAggregate(cube2, PhysicsShapeType.BOX, { mass: 1, restitution: 0.75 }, scene);
  new PhysicsAggregate(cube3, PhysicsShapeType.BOX, { mass: 1, restitution: 0.75 }, scene);
  new PhysicsAggregate(cube4, PhysicsShapeType.BOX, { mass: 1, restitution: 0.75 }, scene);
  new PhysicsAggregate(cube5, PhysicsShapeType.BOX, { mass: 1, restitution: 0.75 }, scene);
  const groundAggregate = new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, scene);

  const playerMesh = MeshBuilder.CreateCapsule("player", { radius: 0.5, height: 2 }, scene);
  playerMesh.position.y = 1;
  shadowGen.addShadowCaster(playerMesh);
  const playerAggregate = new PhysicsAggregate(playerMesh, PhysicsShapeType.CAPSULE, { mass: 1, restitution: 0.2 }, scene);
  playerAggregate.body.disablePreStep = false;

  scene.onBeforePhysicsObservable.add(() => {
    const rotation = playerMesh.rotationQuaternion;
    if (rotation) {
      const euler = rotation.toEulerAngles();
      euler.x = 0;
      euler.z = 0;
      playerMesh.rotationQuaternion = Quaternion.FromEulerAngles(euler.x, euler.y, euler.z);
    }
  playerAggregate.body.setAngularVelocity(Vector3.Zero());
});

  camera.parent = playerMesh;
  camera.position = new Vector3(0, 0.5, 0);

  document.addEventListener("touchstart", event => {
    if (document.fullscreenElement != canvas) {
      canvas.requestFullscreen();
    }
    for (let touch of event.touches) {
      if (touch.clientX > window.innerWidth * 0.7) {
        isRotatingTouch = true;
        lastRotateTouch.x = touch.clientX;
        lastRotateTouch.y = touch.clientY;
      }
    }
  });

  document.addEventListener("touchmove", event => {
    for (let touch of event.touches) {
      if (isRotatingTouch) {
        const deltaX = touch.clientX - lastRotateTouch.x;
        const deltaY = touch.clientY - lastRotateTouch.y;

        cameraYaw += deltaX * CAMERA_ROTATION_SPEED;
        cameraPitch += deltaY * CAMERA_ROTATION_SPEED;
        cameraPitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraPitch));

        lastRotateTouch.x = touch.clientX;
        lastRotateTouch.y = touch.clientY;
      }
    }
  });

  document.addEventListener("touchend", event => {
    isRotatingTouch = false;
  });

  document.addEventListener("keydown", event => {
    pressedKeys[event.code] = true;
    if (event.code == "KeyF") {
      playerAggregate.body.applyImpulse(new Vector3(0, 5, 0), playerAggregate.body.getObjectCenterWorld());
    }
  });

  document.addEventListener("keyup", event => {
    pressedKeys[event.code] = false;
  });

  function update() {
    const angle = cameraYaw;
    const inputX = leftJoystick.deltaPosition.x * leftJoystick.pressed + (pressedKeys["KeyD"] ? 1 : (pressedKeys["KeyA"] ? -1 : 0));
    const inputY = leftJoystick.deltaPosition.y * leftJoystick.pressed + (pressedKeys["KeyW"] ? 1 : (pressedKeys["KeyS"] ? -1 : 0));

    const forward = new Vector3(Math.sin(angle), 0, Math.cos(angle));
    const right = new Vector3(Math.sin(angle + Math.PI / 2), 0, Math.cos(angle + Math.PI / 2));
    const moveDir = forward.scale(inputY).add(right.scale(inputX)).normalize().scale(CAMERA_MOVE_SPEED * 0.01);

    if (!moveDir.equals(Vector3.Zero())) {
      playerAggregate.body.setLinearVelocity(
        new Vector3(moveDir.x, playerAggregate.body.getLinearVelocity().y, moveDir.z)
      );
    } else {
      const vel = playerAggregate.body.getLinearVelocity();
      playerAggregate.body.setLinearVelocity(new Vector3(vel.x * 0.9, vel.y, vel.z * 0.9));
    }

    camera.rotation.y = cameraYaw;
    camera.rotation.x = cameraPitch;
    camera.rotation.z = 0;

    scene.render();
  }

  engine.runRenderLoop(update);
  window.addEventListener("resize", () => engine.resize());
}
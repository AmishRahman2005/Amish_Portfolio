import * as THREE from "three";
import { DRACOLoader, GLTF, GLTFLoader } from "three-stdlib";
import { setCharTimeline, setAllTimeline } from "../../utils/GsapScroll";
import { decryptFile } from "./decrypt";

function addSpecsToCharacter(character: THREE.Object3D, scene: THREE.Scene) {
  const headBone = character.getObjectByName("spine006");
  const eyesMesh = character.getObjectByName("EYEs001") as THREE.Mesh | undefined;

  if (!headBone || !eyesMesh) {
    console.warn("Could not find head bone (spine006) or eyes mesh (EYEs001) to mount specs.");
    return;
  }

  // Set proportional dimensions for the Wayfarer glasses
  const eyeWidth = 1.25;
  const lensRadius = eyeWidth * 0.28;
  const bridgeWidth = eyeWidth * 0.22;
  const eyeDistance = eyeWidth * 0.72;

  const R = lensRadius;
  const D = eyeDistance;

  // Safe frame outer contour coordinates (Wayfarer style: winged corners)
  const botY = -R * 1.25;
  const midY = -R * 0.1;
  const wingX = D / 2 + R * 1.4;
  const wingY = R * 1.3;
  const outerBotX = D / 2 + R * 1.05;
  const innerBotX = D / 2 - R * 0.7;
  const bridgeTopY = R * 1.0;

  // Create Outer Frame Shape (Counter-Clockwise)
  const frameShape = new THREE.Shape();
  frameShape.moveTo(-wingX, wingY);
  frameShape.lineTo(-wingX * 0.96, R * 0.3);
  frameShape.quadraticCurveTo(-outerBotX, botY * 1.15, -(outerBotX - R * 0.25), botY);
  frameShape.quadraticCurveTo(-D/2, botY * 1.1, -innerBotX, botY * 0.65);
  frameShape.quadraticCurveTo(-bridgeWidth/2, midY - R*0.15, -bridgeWidth/2, midY);
  frameShape.quadraticCurveTo(0, midY + R * 0.12, bridgeWidth/2, midY);
  frameShape.quadraticCurveTo(bridgeWidth/2, midY - R*0.15, innerBotX, botY * 0.65);
  frameShape.quadraticCurveTo(D/2, botY * 1.1, outerBotX - R * 0.25, botY);
  frameShape.quadraticCurveTo(outerBotX, botY * 1.15, wingX * 0.96, R * 0.3);
  frameShape.lineTo(wingX, wingY);
  frameShape.quadraticCurveTo(D/2, bridgeTopY * 1.1, bridgeWidth/2, bridgeTopY);
  frameShape.quadraticCurveTo(0, bridgeTopY * 0.96, -bridgeWidth/2, bridgeTopY);
  frameShape.quadraticCurveTo(-D/2, bridgeTopY * 1.1, -wingX, wingY);

  // Left & Right Lens Cutout Paths (Clockwise to subtract as holes)
  const rX = R * 0.85;
  const rY = R * 0.75;
  const lcY = -R * 0.25; // Lowered lens center to prevent top brow overlap
  const rcY = -R * 0.25;

  // Left Lens Hole (Clockwise)
  const leftLensPath = new THREE.Path();
  const lcX = -D / 2;
  leftLensPath.moveTo(lcX - rX * 0.75, lcY + rY * 0.8);
  leftLensPath.lineTo(lcX + rX * 0.75, lcY + rY * 0.85);
  leftLensPath.quadraticCurveTo(lcX + rX * 0.85, lcY + rY * 0.45, lcX + rX * 0.75, lcY - rY * 0.3);
  leftLensPath.quadraticCurveTo(lcX + rX * 0.55, lcY - rY * 0.9, lcX - rX * 0.1, lcY - rY * 0.95);
  leftLensPath.quadraticCurveTo(lcX - rX * 0.65, lcY - rY * 0.95, lcX - rX * 0.85, lcY - rY * 0.1);
  leftLensPath.quadraticCurveTo(lcX - rX * 0.95, lcY + rY * 0.45, lcX - rX * 0.75, lcY + rY * 0.8);
  frameShape.holes.push(leftLensPath);

  // Right Lens Hole (Clockwise)
  const rightLensPath = new THREE.Path();
  const rcX = D / 2;
  rightLensPath.moveTo(rcX - rX * 0.75, rcY + rY * 0.8);
  rightLensPath.lineTo(rcX + rX * 0.75, rcY + rY * 0.85);
  rightLensPath.quadraticCurveTo(rcX + rX * 0.85, rcY + rY * 0.45, rcX + rX * 0.75, rcY - rY * 0.3);
  rightLensPath.quadraticCurveTo(rcX + rX * 0.55, rcY - rY * 0.9, rcX - rX * 0.1, rcY - rY * 0.95);
  rightLensPath.quadraticCurveTo(rcX - rX * 0.65, rcY - rY * 0.95, rcX - rX * 0.85, rcY - rY * 0.1);
  rightLensPath.quadraticCurveTo(rcX - rX * 0.95, rcY + rY * 0.45, rcX - rX * 0.75, rcY + rY * 0.8);
  frameShape.holes.push(rightLensPath);

  // Create Glasses Group
  const specsGroup = new THREE.Group();
  specsGroup.name = "specs";

  // Materials
  const frameMat = new THREE.MeshStandardMaterial({
    color: 0x161616, // Matte Acetate Black
    roughness: 0.25,
    metalness: 0.1
  });

  const lensMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.15,
    roughness: 0.05,
    metalness: 0.9,
    side: THREE.DoubleSide
  });

  const metalMat = new THREE.MeshStandardMaterial({
    color: 0xdddddd, // Silver Corner Rivet
    metalness: 0.95,
    roughness: 0.08
  });

  // 3. Extrude the Wayfarer Frame
  const frameThickness = eyeWidth * 0.045;
  const bevelSize = eyeWidth * 0.005;
  const extrudeSettings = {
    depth: frameThickness,
    bevelEnabled: true,
    bevelSegments: 4,
    steps: 1,
    bevelSize: bevelSize,
    bevelThickness: eyeWidth * 0.006
  };
  const frameGeom = new THREE.ExtrudeGeometry(frameShape, extrudeSettings);
  frameGeom.translate(0, 0, frameThickness / 2);
  const frameMesh = new THREE.Mesh(frameGeom, frameMat);
  frameMesh.name = "frameMesh";
  specsGroup.add(frameMesh);

  // 4. Extrude Lenses
  const lensExtrudeSettings = {
    depth: eyeWidth * 0.005,
    bevelEnabled: false
  };
  const leftLensGeom = new THREE.ExtrudeGeometry(new THREE.Shape(leftLensPath.getPoints()), lensExtrudeSettings);
  leftLensGeom.translate(0, 0, lensExtrudeSettings.depth / 2);
  const leftLensMesh = new THREE.Mesh(leftLensGeom, lensMat);
  leftLensMesh.name = "leftLensMesh";
  specsGroup.add(leftLensMesh);

  const rightLensGeom = new THREE.ExtrudeGeometry(new THREE.Shape(rightLensPath.getPoints()), lensExtrudeSettings);
  rightLensGeom.translate(0, 0, lensExtrudeSettings.depth / 2);
  const rightLensMesh = new THREE.Mesh(rightLensGeom, lensMat);
  rightLensMesh.name = "rightLensMesh";
  specsGroup.add(rightLensMesh);

  // 5. Add Silver Metal Rivets on Wing Corners
  const rivetGeom = new THREE.CylinderGeometry(eyeWidth * 0.007, eyeWidth * 0.007, eyeWidth * 0.035, 16);
  rivetGeom.rotateZ(Math.PI / 2);
  rivetGeom.scale(1, 0.4, 1);

  const leftRivet = new THREE.Mesh(rivetGeom, metalMat);
  leftRivet.name = "leftRivet";
  leftRivet.position.set(-wingX + R * 0.16, wingY - R * 0.12, -(frameThickness / 2 + bevelSize));
  leftRivet.rotation.z = 0.05;
  specsGroup.add(leftRivet);

  const rightRivet = new THREE.Mesh(rivetGeom, metalMat);
  rightRivet.name = "rightRivet";
  rightRivet.position.set(wingX - R * 0.16, wingY - R * 0.12, -(frameThickness / 2 + bevelSize));
  rightRivet.rotation.z = -0.05;
  specsGroup.add(rightRivet);

  // 6. Temple Arms (extending backwards)
  const armLength = eyeWidth * 1.15;

  const createTempleArm = (isLeft: boolean) => {
    const armGroup = new THREE.Group();

    // Straight temple segment
    const straightLength = armLength * 0.75;
    const straightGeom = new THREE.BoxGeometry(eyeWidth * 0.02, eyeWidth * 0.045, straightLength);
    straightGeom.translate(0, 0, straightLength / 2);
    const straight = new THREE.Mesh(straightGeom, frameMat);
    straight.name = "straight";
    armGroup.add(straight);

    // Ear hook segment (curved down)
    const hookLength = armLength * 0.35;
    const hookGeom = new THREE.BoxGeometry(eyeWidth * 0.02, eyeWidth * 0.035, hookLength);
    hookGeom.rotateX(-Math.PI / 3.8);
    hookGeom.translate(0, -hookLength * 0.22, straightLength + hookLength * 0.3);
    const hook = new THREE.Mesh(hookGeom, frameMat);
    hook.name = "hook";
    armGroup.add(hook);

    // Silver hinge rivet on arm side
    const armRivetGeom = new THREE.CylinderGeometry(eyeWidth * 0.005, eyeWidth * 0.005, eyeWidth * 0.015, 12);
    armRivetGeom.rotateX(Math.PI / 2);
    armRivetGeom.scale(0.4, 1, 1);
    const armRivet = new THREE.Mesh(armRivetGeom, metalMat);
    armRivet.name = "armRivet";
    armRivet.position.set(isLeft ? -eyeWidth * 0.011 : eyeWidth * 0.011, 0, eyeWidth * 0.04);
    armGroup.add(armRivet);

    return armGroup;
  };

  const leftArm = createTempleArm(true);
  leftArm.name = "leftArm";
  leftArm.position.set(-wingX + eyeWidth * 0.025, wingY - R * 0.12, frameThickness / 2);
  leftArm.rotation.y = -0.06;
  specsGroup.add(leftArm);

  const rightArm = createTempleArm(false);
  rightArm.name = "rightArm";
  rightArm.position.set(wingX - eyeWidth * 0.025, wingY - R * 0.12, frameThickness / 2);
  rightArm.rotation.y = 0.06;
  specsGroup.add(rightArm);

  // Add the specs directly to the root scene
  scene.add(specsGroup);
}

const setCharacter = (
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.PerspectiveCamera
) => {
  const loader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  loader.setDRACOLoader(dracoLoader);

  const loadCharacter = () => {
    return new Promise<GLTF | null>(async (resolve, reject) => {
      try {
        const encryptedBlob = await decryptFile(
          "/models/character.enc",
          "Character3D#@"
        );
        const blobUrl = URL.createObjectURL(new Blob([encryptedBlob]));

        let character: THREE.Object3D;
        loader.load(
          blobUrl,
          async (gltf) => {
            character = gltf.scene;
            await renderer.compileAsync(character, camera, scene);
            character.traverse((child: any) => {
              if (child.isMesh) {
                const mesh = child as THREE.Mesh;
                child.castShadow = false;
                child.receiveShadow = false;
                mesh.frustumCulled = true;

                // Color the BODYSHIRT to match the site's accent purple theme
                if (child.name === "BODYSHIRT" && mesh.material) {
                  mesh.material = (mesh.material as THREE.Material).clone();
                  const mat = mesh.material as any;
                  if (mat.color) {
                    mat.color.set("#8b5cf6"); // Vibrant Violet Purple
                  }
                  if (mat.roughness !== undefined) mat.roughness = 0.5;
                  if (mat.metalness !== undefined) mat.metalness = 0.1;
                }

                if (mesh.material && !Array.isArray(mesh.material)) {
                  (mesh.material as THREE.ShaderMaterial).precision = 'mediump';
                }
              }
            });

            // Mount procedurally generated glasses to the scene
            addSpecsToCharacter(character, scene);

            resolve(gltf);
            setCharTimeline(character, camera);
            setAllTimeline();
            character!.getObjectByName("footR")!.position.y = 3.36;
            character!.getObjectByName("footL")!.position.y = 3.36;
            dracoLoader.dispose();
          },
          undefined,
          (error) => {
            console.error("Error loading GLTF model:", error);
            reject(error);
          }
        );
      } catch (err) {
        reject(err);
        console.error(err);
      }
    });
  };

  return { loadCharacter };
};

export default setCharacter;

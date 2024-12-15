import * as THREE from "three";
import init from "./init.js";
import { GLTFLoader } from "three/examples/jsm/Addons.js";
import * as lil from "lil-gui";

const { scene, canvas, sizes, camera, renderer, controls } = init();

const clock = new THREE.Clock();
var delta = null;
var elapsedTime = null;

var guiEnabled = false
var gui = false;
if(guiEnabled){
    gui = new lil.GUI();
}

let mixer = false;
const load = (modelName) => {
    let realUrl = "./src/models/" + modelName + "/scene.gltf";
    loader.load(
        realUrl,
        (gltf) => {
            const model = gltf.scene;
            model.position.y = -0.01;
            if(guiEnabled){
                const guiFolder = gui.addFolder(modelName);
                guiFolder.add(model.position, "x", -10, 10, 0.01);
                guiFolder.add(model.position, "y", -10, 10, 0.01);
                guiFolder.add(model.position, "z", -10, 10, 0.01);
            }
            model.scale.set(0.9, 0.9, 0.9)
            scene.add(model);
            mixer = new THREE.AnimationMixer(model);
            const action = mixer.clipAction(gltf.animations[0]);
            action.play();
            controls.target = new THREE.Vector3(
                model.position.x,
                model.position.y+1,
                model.position.z
            );
            console.log('Successfully loaded "' + realUrl + '"', gltf);
        },
        (event) => {
            console.log('Loading "' + realUrl + '"...');
        },
        (err) => {
            console.log('Loading "' + realUrl + '" error: ', err);
        }
    );
    return mixer;
};

//
// ==========Default Cube============
//
camera.position.x = 2;
camera.position.y = 1;
camera.position.z = 3;

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10, 100, 100),
    new THREE.MeshStandardMaterial({
        color: "#333333",
        metalness: 0,
        roughness: 0.5,
        wireframe: true
    })
);
floor.rotation.x = -Math.PI * 0.5;
scene.add(floor);

const hemiLight = new THREE.HemisphereLight("#fff", "#fff", 1);
hemiLight.position.y = 50;

scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight("#fff", 1);
const dirLight2 = new THREE.DirectionalLight("#fff", 0.5);
dirLight.position.set(-8, 12, 8);
dirLight2.position.set(8, 12, -8);
dirLight.castShadow = true;
dirLight2.castShadow = true;
dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
dirLight2.shadow.mapSize = new THREE.Vector2(1024, 1024);
scene.add(dirLight);
scene.add(dirLight2);

const loader = new GLTFLoader();
load("toyota_chaser_tourerv");
//
// ==================================
//

const tick = () => {
    delta = clock.getDelta();
    elapsedTime = clock.getElapsedTime();

    if (mixer) {
        mixer.update(delta);
    }

    controls.update();
    renderer.render(scene, camera);
    window.requestAnimationFrame(tick);
};

tick();
console.log("Sucessful ticks starting");

window.addEventListener("resize", (e) => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
    renderer.setSize(sizes.width, sizes.height);
});

const rayCaster = new THREE.Raycaster();
const handleClick = (e) => {
    const pointer = new THREE.Vector2();

    pointer.x = (e.clientX / sizes.width) * 2 - 1;
    pointer.y = -((e.clientY / sizes.height) * 2 - 1);

    rayCaster.setFromCamera(pointer, camera);
    const intersections = rayCaster.intersectObjects(scene.children);
    //
    // Your code for mouse clicks on objects here
    //
};

canvas.addEventListener("click", handleClick);

//
// Uncomment code below to enable double click full screen
//

// canvas.addEventListener("dblclick", (e) => {
//     document.fullscreenElement
//         ? document.exitFullscreen()
//         : canvas.requestFullscreen();
// });

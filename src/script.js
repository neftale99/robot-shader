import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js'
import CustomShaderMaterial from 'three-custom-shader-material/vanilla'
import GUI from 'lil-gui'
import gsap from 'gsap'
import robotVertexShader from './Shaders/Robot/vertex.glsl'
import robotFragmentShader from './Shaders/Robot/fragment.glsl'
import overlayVertexShader from './Shaders/Overlay/vertex.glsl'
import overlayFragmentShader from './Shaders/Overlay/fragment.glsl'


/**
 * Loaders
 */
// Loading
const loaderElement = document.querySelector('.loading')
const loadingManager = new THREE.LoadingManager(
    // Loaded
    () => {
        gsap.delayedCall(1, () => {

            loaderElement.style.display = 'none'

            gsap.to(
                overlayMaterial.uniforms.uAlpha, 
                { duration: 1.5, value: 0, delay: 0.5 }
            )

            window.setTimeout(() => {
                initGUI()
            }, 1000)
        })
    },
    // Progress
    (itemUrl, itemsLoaded, itemsTotal) => 
    {
        loaderElement.style.display = 'block'
    }
)

const rgbeLoader = new RGBELoader(loadingManager)
const dracoLoader = new DRACOLoader(loadingManager)
dracoLoader.setDecoderPath('./draco/')
const gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.setDRACOLoader(dracoLoader)

/**
 * Base
 */
// Debug
const debugObject = {}

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Overlay
 */
const overlayGeometry = new THREE.PlaneGeometry(2, 2, 1, 1)
const overlayMaterial = new THREE.ShaderMaterial({
    vertexShader: overlayVertexShader,
    fragmentShader: overlayFragmentShader,
    uniforms: {
        uAlpha: new THREE.Uniform(1)
    },
    transparent: true,
    depthWrite: false,
})
const overlay = new THREE.Mesh(overlayGeometry, overlayMaterial)
scene.add(overlay)

/**
 * Environment map
 */
rgbeLoader.load('./Environment/belfast_sunset_puresky_2k.hdr', (environmentMap) =>
{
    environmentMap.mapping = THREE.EquirectangularReflectionMapping

    scene.background = environmentMap
    scene.backgroundBlurriness = 0.4
    scene.environment = environmentMap
})

/**
 * Sliced model
 */
// Geometry
const geometry = new THREE.IcosahedronGeometry(2.5, 5) 

// Material
const uniforms = {
    uSliceStart: new THREE.Uniform(1.75),
    uSliceArc: new THREE.Uniform(1.25)
}

const patchMap = {
    csm_Slice:
    {
        '#include <colorspace_fragment>': 
        `
            #include <colorspace_fragment>
                
            if(!gl_FrontFacing)
                gl_FragColor = vec4(0.8, 0.8, 0.8, 1.0);
        `
    }
}

// Robot1
const materialRobot1 = new THREE.MeshPhysicalMaterial({ 
    metalness: 1,
    roughness: 0.311594,
    color: '#690000',
    transparent: false,
    wireframe: false,
})

// Robot2
const materialRobot2 = new THREE.MeshPhysicalMaterial({ 
    metalness: 1,
    roughness: 0.4,
    color: '#adab00',
    transparent: false,
    wireframe: false,
})

// Robot3
const materialRobot3 = new THREE.MeshPhysicalMaterial({ 
    metalness: 1,
    roughness: 0.09,
    color: '#cecece',
    transparent: false,
    wireframe: false,
})

// Screws
const materialScrews = new THREE.MeshPhysicalMaterial({ 
    metalness: 1,
    roughness: 0.09,
    color: '#000000',
    transparent: false,
    wireframe: false,
})

// BaseRobot
const materialBaseRobotic = new THREE.MeshPhysicalMaterial({ 
    metalness: 1,
    roughness: 0.5,
    color: '#a7a7a7',
    transparent: false,
    wireframe: false,
})

// Wire
const materialWire = new THREE.MeshPhysicalMaterial({ 
    metalness: 0.406,
    roughness: 0.659,
    color: '#000000',
    transparent: false,
    wireframe: false,
})

// WireElectronic
const materialWireElectronic = new THREE.MeshPhysicalMaterial({ 
    metalness: 0.768,
    roughness: 0.500,
    color: '#454545',
    transparent: false,
    wireframe: false,
})

// BaseElectronic
const materialBaseElectronic = new THREE.MeshPhysicalMaterial({ 
    metalness: 0.754,
    roughness: 0.674,
    color: '#002e38',
    transparent: false,
    wireframe: false,
})

// BaseComponent
const materialBaseComponent = new THREE.MeshPhysicalMaterial({ 
    metalness: 1,
    roughness: 0.355,
    color: '#6d6c6c',
    transparent: false,
    wireframe: false,
})

// Electronic1
const materialElectronic1 = new THREE.MeshPhysicalMaterial({ 
    metalness: 1,
    roughness: 0.362,
    color: '#620000',
    transmission: 0.151,
    ior: 1.15,
    thickness: 1.4,
    transparent: true,
    wireframe: false,
})

// Electronic2
const materialElectronic2 = new THREE.MeshPhysicalMaterial({ 
    metalness: 0,
    roughness: 0,
    color: '#005856',
    transmission: 0.921,
    ior: 1.150,
    thickness: 0,
    transparent: true,
    wireframe: false,
})


const materialRobot = new CustomShaderMaterial({
    // CSM
    baseMaterial: THREE.MeshPhysicalMaterial,
    vertexShader: robotVertexShader,
    fragmentShader: robotFragmentShader,
    uniforms: uniforms,
    patchMap: patchMap,
    side: THREE.DoubleSide,
    silent: true,

    // MeshStandarMaterial
    metalness: 1,
    roughness: 0.28,
    envMapIntensity: 0.5,
    color: '#000000',
    transmission: 0.199,
    ior: 1.242,
    thickness: 1.263,
})

const depthMaterialRobot = new CustomShaderMaterial({
    // CSM
    baseMaterial: THREE.MeshDepthMaterial,
    vertexShader: robotVertexShader,
    fragmentShader: robotFragmentShader,
    uniforms: uniforms,
    patchMap: patchMap,
    side: THREE.DoubleSide,
    silent: true,

    // MeshDepthMaterial
    depthPacking: THREE.RGBADepthPacking
})

// Model
let robot1
let robot2
let robot3
let screws
let screwsRobot
let baseRobotic
let wire
let wireElectronic
let baseElectronic
let baseComponent
let electronic1
let electronic2

gltfLoader.load('./Model/RoboticArm.glb',(gltf) => 
{
    const robot = gltf.scene
    robot.position.set(0, - 2, 0)
    robot.rotation.y = Math.PI * 0.2
    robot.scale.set(1.2, 1.2, 1.2)

    robot.traverse((child) =>
    {
        if(child.isMesh)
        {
            if(child.name === 'Base')
            {
                child.material = materialRobot
                child.customDepthMaterial = depthMaterialRobot
            }
            else 
            {
                robot1 =  robot.children.find((child) => child.name === 'Robot1')
                robot1.material = materialRobot1

                robot2 =  robot.children.find((child) => child.name === 'Robot2')
                robot2.material = materialRobot2

                robot3 =  robot.children.find((child) => child.name === 'Robot3')
                robot3.material = materialRobot3

                baseRobotic =  robot.children.find((child) => child.name === 'BaseRobot')
                baseRobotic.material = materialBaseRobotic

                wire =  robot.children.find((child) => child.name === 'Wire')
                wire.material = materialWire

                wireElectronic =  robot.children.find((child) => child.name === 'WE')
                wireElectronic.material = materialWireElectronic

                baseElectronic =  robot.children.find((child) => child.name === 'BaseElectronic')
                baseElectronic.material = materialBaseElectronic

                baseComponent =  robot.children.find((child) => child.name === 'BaseElectronicComponent')
                baseComponent.material = materialBaseComponent

                electronic1 =  robot.children.find((child) => child.name === 'Electronic1')
                electronic1.material = materialElectronic1

                electronic2 =  robot.children.find((child) => child.name === 'Electronic2')
                electronic2.material = materialElectronic2

                screws =  robot.children.find((child) => child.name === 'Screws')
                screws.material = materialScrews

                screwsRobot =  robot.children.find((child) => child.name === 'ScrewsRobot')
                screwsRobot.material = materialScrews
            }
        } 

        child.castShadow = true
        child.receiveShadow = true
    })

    // folderRobot.add(electronic1.material, 'metalness', 0.0, 1, 0.001)
    // folderRobot.add(electronic1.material, 'roughness', 0.0, 1, 0.001)
    // folderRobot.add(electronic1.material, 'transmission', 0, 1, 0.001)
    // folderRobot.add(electronic1.material, 'ior', 0, 2, 0.001)
    // folderRobot.add(electronic1.material, 'thickness', 0, 10, 0.001)

    scene.add(robot)
})

function initGUI()
{
    const gui = new GUI()

    const planeFolder = gui.addFolder('Plane')
    planeFolder.close()
    planeFolder.add(plane.material, 'metalness', 0.0, 1, 0.001)
    planeFolder.add(plane.material, 'roughness', 0.0, 1, 0.001)
    planeFolder.add(plane.material, 'transmission', 0, 1, 0.001)
    planeFolder.add(plane.material, 'ior', 0, 2, 0.001)
    planeFolder.add(plane.material, 'thickness', 0, 10, 0.001)
    planeFolder.addColor(plane.material, 'color')

    // Model tweak base
    const folderBase = gui.addFolder('Base Circuit')
    folderBase.add(uniforms.uSliceStart, 'value')
        .min(-Math.PI).max(Math.PI).step(0.001)
        .name('Slice Start')
    folderBase.add(uniforms.uSliceArc, 'value')
        .min(0).max(Math.PI * 2).step(0.001)
        .name('Slice Arc')

    const folderRobot = gui.addFolder('Robot')
    folderRobot.addColor(robot1.material, 'color').name('Metal 1')
    folderRobot.addColor(robot2.material, 'color').name('Metal 2')
    folderRobot.addColor(robot3.material, 'color').name('Metal 3')
    folderRobot.addColor(electronic2.material, 'color').name('Circuit 1')
    folderRobot.addColor(electronic1.material, 'color').name('Circuit 2') 
}


/**
 * Plane
 */
const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10, 10),
    new THREE.MeshPhysicalMaterial({ 
        metalness: 0,
        roughness: 1,
        color: '#4d4d4d',
        transmission: 0.459,
        ior: 1.291,
        thickness: 3.282,
        transparent: true,
        wireframe: false,
    })
)
plane.receiveShadow = true
plane.position.x = - 5
plane.position.y = - 2
plane.position.z = - 5
plane.lookAt(new THREE.Vector3(0, 0, 0))
scene.add(plane)

/**
 * Lights
 */
const directionalLight = new THREE.DirectionalLight('#ffffff', 5)
directionalLight.position.set(10, 2.747, 6.802)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.near = 0.1
directionalLight.shadow.camera.far = 30
directionalLight.shadow.normalBias = 0.05
directionalLight.shadow.camera.top = 8
directionalLight.shadow.camera.right = 8
directionalLight.shadow.camera.bottom = -8
directionalLight.shadow.camera.left = -8
scene.add(directionalLight)

// gui.add(directionalLight.position, 'x', -10, 10, 0.001)
// gui.add(directionalLight.position, 'y', -10, 10, 0.001)
// gui.add(directionalLight.position, 'z', -10, 10, 0.001)
// gui.addColor(directionalLight, 'color')
// gui.add(directionalLight, 'intensity', 0, 10)

// const helper = new THREE.DirectionalLightHelper(directionalLight, 2)
// scene.add(helper)
// const shadowHelper = new THREE.CameraHelper(directionalLight.shadow.camera)
// scene.add(shadowHelper)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
    pixelRatio: Math.min(window.devicePixelRatio, 2)
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    sizes.pixelRatio = Math.min(window.devicePixelRatio, 2)

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(sizes.pixelRatio)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.set(-5, 5, 12)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.0
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(sizes.pixelRatio)

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
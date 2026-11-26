import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sky, PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import "./game.css";

const CHUNK_SIZE = 80;
const VIEW_DISTANCE = 2;

const PLAYER_HEIGHT = 1.7;
const PLAYER_RADIUS = 0.42;

const WALK_SPEED = 5.5;
const RUN_SPEED = 8.2;
const ACCELERATION = 18;
const FRICTION = 12;
const LOOK_SENSITIVITY = 0.003;

const ROAD_SPACING = 240;
const ROAD_WIDTH = 8;
const ROAD_HEIGHT = 0.08;

const WATER = {
  x: 35,
  z: -25,
  radius: 14,
  shoreRadius: 19
};

const chunkCache = new Map();

function random(seed) {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function hash(x, z, seed = 0) {
  return random(x * 374761 + z * 668265 + seed * 982451);
}

function distance(x1, z1, x2, z2) {
  return Math.hypot(x1 - x2, z1 - z2);
}

function isRoad(x, z) {
  const roadX = Math.abs(
    x - Math.round(x / ROAD_SPACING) * ROAD_SPACING
  );

  const roadZ = Math.abs(
    z - Math.round(z / ROAD_SPACING) * ROAD_SPACING
  );

  return (
    roadX < ROAD_WIDTH / 2 + 4 ||
    roadZ < ROAD_WIDTH / 2 + 4
  );
}

function isWaterArea(x, z) {
  return (
    distance(x, z, WATER.x, WATER.z) <
    WATER.shoreRadius + 3
  );
}

function isSpawnArea(x, z) {
  return Math.abs(x) < 20 && Math.abs(z) < 20;
}

function createChunk(cx, cz) {
  const objects = [];
  const columns = Math.ceil(CHUNK_SIZE / 12);

  for (let ix = 0; ix < columns; ix++) {
    for (let iz = 0; iz < columns; iz++) {
      const seedX = cx * 1000 + ix;
      const seedZ = cz * 1000 + iz;

      const x =
        cx * CHUNK_SIZE +
        ix * 12 +
        5 +
        (hash(seedX, seedZ, 1) - 0.5) * 5;

      const z =
        cz * CHUNK_SIZE +
        iz * 12 +
        5 +
        (hash(seedX, seedZ, 2) - 0.5) * 5;

      const density = hash(seedX, seedZ, 3);

      if (density < 0.25) continue;
      if (isRoad(x, z)) continue;
      if (isWaterArea(x, z)) continue;
      if (isSpawnArea(x, z)) continue;

      const scale = 0.8 + hash(seedX, seedZ, 4) * 0.45;

      objects.push({
        type: "tree",
        x,
        z,
        scale
      });
    }
  }

  if (cx === 0 && cz === 0) {
    const buildings = [
      { x: 15, z: -15, height: 8, color: "#b9b4a6" },
      { x: -15, z: -15, height: 6, color: "#c6c0b1" },
      { x: 15, z: 15, height: 10, color: "#9faeac" },
      { x: -15, z: 15, height: 7, color: "#b8a995" }
    ];

    buildings.forEach((building) => {
      objects.push({
        type: "building",
        ...building
      });
    });
  }

  return objects;
}

function getChunkObjects(cx, cz) {
  const key = `${cx}:${cz}`;

  if (!chunkCache.has(key)) {
    chunkCache.set(key, createChunk(cx, cz));
  }

  return chunkCache.get(key);
}

function getNearbyObstacles(x, z) {
  const result = [];

  const minX = Math.floor((x - 5) / CHUNK_SIZE);
  const maxX = Math.floor((x + 5) / CHUNK_SIZE);
  const minZ = Math.floor((z - 5) / CHUNK_SIZE);
  const maxZ = Math.floor((z + 5) / CHUNK_SIZE);

  for (let cx = minX; cx <= maxX; cx++) {
    for (let cz = minZ; cz <= maxZ; cz++) {
      const objects = getChunkObjects(cx, cz);

      for (const object of objects) {
        const radius =
          object.type === "tree"
            ? 0.85 * object.scale
            : 3.5;

        if (
          Math.abs(object.x - x) < radius + 5 &&
          Math.abs(object.z - z) < radius + 5
        ) {
          result.push({
            x: object.x,
            z: object.z,
            radius
          });
        }
      }
    }
  }

  return result;
}

function collidesWithNearby(x, z) {
  const obstacles = getNearbyObstacles(x, z);

  for (const obstacle of obstacles) {
    const dx = x - obstacle.x;
    const dz = z - obstacle.z;

    if (
      dx * dx + dz * dz <
      (obstacle.radius + PLAYER_RADIUS) ** 2
    ) {
      return true;
    }
  }

  return false;
}

/* الأشجار: نظام مستقل لكل Chunk */
function Trees({ objects }) {
  const trunks = useRef(null);
  const leavesA = useRef(null);
  const leavesB = useRef(null);

  const treeObjects = useMemo(
    () => objects.filter((item) => item.type === "tree"),
    [objects]
  );

  useEffect(() => {
    if (
      !trunks.current ||
      !leavesA.current ||
      !leavesB.current
    ) {
      return;
    }

    const dummy = new THREE.Object3D();

    treeObjects.forEach((tree, index) => {
      const { x, z, scale } = tree;

      dummy.position.set(x, 1.1 * scale, z);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      trunks.current.setMatrixAt(index, dummy.matrix);

      dummy.position.set(x, 2.35 * scale, z);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      leavesA.current.setMatrixAt(index, dummy.matrix);

      dummy.position.set(x, 3.25 * scale, z);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      leavesB.current.setMatrixAt(index, dummy.matrix);
    });

    trunks.current.instanceMatrix.needsUpdate = true;
    leavesA.current.instanceMatrix.needsUpdate = true;
    leavesB.current.instanceMatrix.needsUpdate = true;

    trunks.current.computeBoundingSphere();
    leavesA.current.computeBoundingSphere();
    leavesB.current.computeBoundingSphere();
  }, [treeObjects]);

  if (!treeObjects.length) return null;

  return (
    <>
      <instancedMesh
        ref={trunks}
        args={[undefined, undefined, treeObjects.length]}
        frustumCulled={false}
      >
        <cylinderGeometry args={[0.13, 0.2, 2.2, 7]} />
        <meshStandardMaterial color="#59402d" roughness={1} />
      </instancedMesh>

      <instancedMesh
        ref={leavesA}
        args={[undefined, undefined, treeObjects.length]}
        frustumCulled={false}
      >
        <coneGeometry args={[1.05, 2.2, 7]} />
        <meshStandardMaterial color="#245c37" roughness={0.95} />
      </instancedMesh>

      <instancedMesh
        ref={leavesB}
        args={[undefined, undefined, treeObjects.length]}
        frustumCulled={false}
      >
        <coneGeometry args={[0.72, 1.7, 7]} />
        <meshStandardMaterial color="#347447" roughness={0.95} />
      </instancedMesh>
    </>
  );
}

/* المباني: مستقلة عن تحميل الأشجار */
const BUILDINGS = [
  { x: 15, z: -15, height: 8, color: "#b9b4a6" },
  { x: -15, z: -15, height: 6, color: "#c6c0b1" },
  { x: 15, z: 15, height: 10, color: "#9faeac" },
  { x: -15, z: 15, height: 7, color: "#b8a995" }
];

function Building({ position, height, color }) {
  return (
    <group position={position} frustumCulled={false}>
      <mesh
        position={[0, height / 2, 0]}
        castShadow
        frustumCulled={false}
      >
        <boxGeometry args={[5, height, 5]} />
        <meshStandardMaterial color={color} roughness={0.88} />
      </mesh>

      {Array.from({
        length: Math.floor(height / 2)
      }).map((_, index) => (
        <mesh
          key={index}
          frustumCulled={false}
          position={[2.51, 1.2 + index * 2, 0]}
        >
          <boxGeometry args={[0.04, 0.8, 0.9]} />
          <meshStandardMaterial color="#91bdc1" roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function BuildingSystem() {
  return (
    <group>
      {BUILDINGS.map((building, index) => (
        <Building
          key={index}
          position={[building.x, 0, building.z]}
          height={building.height}
          color={building.color}
        />
      ))}
    </group>
  );
}

/* شبكة الطرق: مستقلة عن مكوّن Chunk */
function RoadTile({ cx, cz }) {
  const minX = cx * CHUNK_SIZE;
  const minZ = cz * CHUNK_SIZE;

  const maxX = minX + CHUNK_SIZE;
  const maxZ = minZ + CHUNK_SIZE;

  const verticalRoads = [];
  const horizontalRoads = [];

  const firstRoadX =
    Math.ceil(minX / ROAD_SPACING) * ROAD_SPACING;

  const firstRoadZ =
    Math.ceil(minZ / ROAD_SPACING) * ROAD_SPACING;

  for (let x = firstRoadX; x < maxX; x += ROAD_SPACING) {
    verticalRoads.push(x);
  }

  for (let z = firstRoadZ; z < maxZ; z += ROAD_SPACING) {
    horizontalRoads.push(z);
  }

  return (
    <group>
      {verticalRoads.map((x) => (
        <mesh
          key={`v-${x}`}
          position={[x, ROAD_HEIGHT / 2, minZ + CHUNK_SIZE / 2]}
          frustumCulled={false}
        >
          <boxGeometry args={[ROAD_WIDTH, ROAD_HEIGHT, CHUNK_SIZE]} />
          <meshStandardMaterial
            color="#353a39"
            roughness={0.98}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {horizontalRoads.map((z) => (
        <mesh
          key={`h-${z}`}
          position={[minX + CHUNK_SIZE / 2, ROAD_HEIGHT / 2, z]}
          frustumCulled={false}
        >
          <boxGeometry args={[CHUNK_SIZE, ROAD_HEIGHT, ROAD_WIDTH]} />
          <meshStandardMaterial
            color="#353a39"
            roughness={0.98}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

function RoadNetwork({ center }) {
  const tiles = useMemo(() => {
    const result = [];

    for (let x = -VIEW_DISTANCE; x <= VIEW_DISTANCE; x++) {
      for (let z = -VIEW_DISTANCE; z <= VIEW_DISTANCE; z++) {
        result.push({
          cx: center.x + x,
          cz: center.z + z
        });
      }
    }

    return result;
  }, [center]);

  return (
    <group>
      {tiles.map(({ cx, cz }) => (
        <RoadTile key={`${cx}:${cz}`} cx={cx} cz={cz} />
      ))}
    </group>
  );
}

/* البحيرة: عنصر ثابت مستقل */
function Water() {
  return (
    <group
      position={[WATER.x, 0, WATER.z]}
      frustumCulled={false}
    >
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.015, 0]}
        frustumCulled={false}
      >
        <circleGeometry args={[WATER.shoreRadius, 64]} />
        <meshStandardMaterial
          color="#b7a77e"
          roughness={1}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.04, 0]}
        frustumCulled={false}
      >
        <circleGeometry args={[WATER.radius, 64]} />
        <meshPhysicalMaterial
          color="#07516d"
          roughness={0.22}
          metalness={0.12}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/* تحميل الأشجار فقط عبر Chunks */
function NatureWorld({ center }) {
  const chunks = useMemo(() => {
    const result = [];

    for (let x = -VIEW_DISTANCE; x <= VIEW_DISTANCE; x++) {
      for (let z = -VIEW_DISTANCE; z <= VIEW_DISTANCE; z++) {
        result.push({
          cx: center.x + x,
          cz: center.z + z
        });
      }
    }

    return result;
  }, [center]);

  return (
    <>
      {chunks.map(({ cx, cz }) => (
        <NatureChunk key={`${cx}:${cz}`} cx={cx} cz={cz} />
      ))}
    </>
  );
}

function NatureChunk({ cx, cz }) {
  const objects = useMemo(
    () => getChunkObjects(cx, cz),
    [cx, cz]
  );

  return <Trees objects={objects} />;
}

/* العالم */
function World({ center }) {
  return (
    <>
      <ambientLight intensity={0.65} />

      <directionalLight
        position={[80, 100, 40]}
        intensity={1.35}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-camera-near={1}
        shadow-camera-far={180}
      />

      <Sky
        distance={450000}
        sunPosition={[100, 35, 100]}
      />

      <fog
        attach="fog"
        args={["#a9c2c7", 500, 1200]}
      />

      {/* أرضية العالم */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.06, 0]}
        frustumCulled={false}
      >
        <planeGeometry args={[100000, 100000]} />
        <meshStandardMaterial
          color="#52734a"
          roughness={1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* عناصر مستقلة عن Chunks */}
      <RoadNetwork center={center} />
      <Water />
      <BuildingSystem />

      {/* الطبيعة فقط تستخدم Chunks */}
      <NatureWorld center={center} />
    </>
  );
}

/* حركة اللاعب */
function PlayerController({
  joystick,
  onChunkChange,
  cameraRef
}) {
  const keys = useRef({});
  const velocity = useRef(new THREE.Vector3());

  const position = useRef(
    new THREE.Vector3(0, PLAYER_HEIGHT, 8)
  );

  const forward = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());
  const input = useRef(new THREE.Vector3());

  useEffect(() => {
    const down = (event) => {
      keys.current[event.code] = true;
    };

    const up = (event) => {
      keys.current[event.code] = false;
    };

    const clear = () => {
      keys.current = {};
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, []);

  useFrame(({ camera }, delta) => {
    const dt = Math.min(delta, 0.04);

    camera.getWorldDirection(forward.current);
    forward.current.y = 0;
    forward.current.normalize();

    right.current.set(
      -forward.current.z,
      0,
      forward.current.x
    );

    let forwardInput = -joystick.y;
    let sideInput = joystick.x;

    if (keys.current.KeyW || keys.current.ArrowUp) {
      forwardInput += 1;
    }

    if (keys.current.KeyS || keys.current.ArrowDown) {
      forwardInput -= 1;
    }

    if (keys.current.KeyD || keys.current.ArrowRight) {
      sideInput += 1;
    }

    if (keys.current.KeyA || keys.current.ArrowLeft) {
      sideInput -= 1;
    }

    input.current.set(0, 0, 0);
    input.current.addScaledVector(forward.current, forwardInput);
    input.current.addScaledVector(right.current, sideInput);

    if (input.current.lengthSq() > 1) {
      input.current.normalize();
    }

    const running =
      keys.current.ShiftLeft || keys.current.ShiftRight;

    const maxSpeed = running ? RUN_SPEED : WALK_SPEED;

    const targetX = input.current.x * maxSpeed;
    const targetZ = input.current.z * maxSpeed;

    velocity.current.x = THREE.MathUtils.damp(
      velocity.current.x,
      targetX,
      input.current.lengthSq() > 0 ? ACCELERATION : FRICTION,
      dt
    );

    velocity.current.z = THREE.MathUtils.damp(
      velocity.current.z,
      targetZ,
      input.current.lengthSq() > 0 ? ACCELERATION : FRICTION,
      dt
    );

    const current = position.current;

    const nextX = current.x + velocity.current.x * dt;
    const nextZ = current.z + velocity.current.z * dt;

    const insideWater = (x, z) =>
      distance(x, z, WATER.x, WATER.z) <
      WATER.radius - PLAYER_RADIUS;

    if (
      !collidesWithNearby(nextX, current.z) &&
      !insideWater(nextX, current.z)
    ) {
      current.x = nextX;
    } else {
      velocity.current.x = 0;
    }

    if (
      !collidesWithNearby(current.x, nextZ) &&
      !insideWater(current.x, nextZ)
    ) {
      current.z = nextZ;
    } else {
      velocity.current.z = 0;
    }

    current.y = PLAYER_HEIGHT;

    camera.position.copy(current);
    cameraRef.current = camera;

    const cx = Math.floor(current.x / CHUNK_SIZE);
    const cz = Math.floor(current.z / CHUNK_SIZE);

    onChunkChange(cx, cz);
  });

  return null;
}

/* تحريك الكاميرا باللمس */
function MobileCameraLook({ cameraRef }) {
  const touch = useRef(null);

  const down = (event) => {
    touch.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const move = (event) => {
    if (!touch.current || !cameraRef.current) return;
    if (touch.current.id !== event.pointerId) return;

    const dx = event.clientX - touch.current.x;
    const dy = event.clientY - touch.current.y;

    touch.current.x = event.clientX;
    touch.current.y = event.clientY;

    const camera = cameraRef.current;

    camera.rotation.order = "YXZ";
    camera.rotation.y -= dx * LOOK_SENSITIVITY;
    camera.rotation.x -= dy * LOOK_SENSITIVITY;

    camera.rotation.x = THREE.MathUtils.clamp(
      camera.rotation.x,
      -1.35,
      1.35
    );
  };

  const up = (event) => {
    if (touch.current?.id === event.pointerId) {
      touch.current = null;
    }
  };

  return (
    <div
      className="camera-touch-area"
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
    />
  );
}

/* عصا التحكم */
function MobileJoystick({ onChange }) {
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const baseRef = useRef(null);
  const pointer = useRef(null);

  const update = (event) => {
    const rect = baseRef.current.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const max = rect.width * 0.32;

    let dx = event.clientX - centerX;
    let dy = event.clientY - centerY;

    const length = Math.hypot(dx, dy);

    if (length > max) {
      dx = (dx / length) * max;
      dy = (dy / length) * max;
    }

    setKnob({ x: dx, y: dy });
    onChange({ x: dx / max, y: dy / max });
  };

  const down = (event) => {
    pointer.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    update(event);
  };

  const move = (event) => {
    if (pointer.current === event.pointerId) {
      update(event);
    }
  };

  const up = (event) => {
    if (pointer.current !== event.pointerId) return;

    pointer.current = null;
    setKnob({ x: 0, y: 0 });
    onChange({ x: 0, y: 0 });
  };

  return (
    <div
      ref={baseRef}
      className="mobile-joystick"
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
    >
      <div className="joystick-base">
        <div
          className="joystick-knob"
          style={{
            transform: `translate(${knob.x}px, ${knob.y}px)`
          }}
        />
      </div>
    </div>
  );
}

/* تشغيل اللعبة */
export default function Game() {
  const [center, setCenter] = useState({
    x: 0,
    z: 0
  });

  const [joystick, setJoystick] = useState({
    x: 0,
    y: 0
  });

  const [mobile, setMobile] = useState(false);

  const cameraRef = useRef(null);
  const lastChunk = useRef({ x: 0, z: 0 });

  useEffect(() => {
    const check = () => {
      setMobile(
        window.matchMedia("(pointer: coarse)").matches ||
        window.innerWidth <= 900
      );
    };

    check();
    window.addEventListener("resize", check);

    return () => {
      window.removeEventListener("resize", check);
    };
  }, []);

  const handleChunkChange = (x, z) => {
    if (
      x === lastChunk.current.x &&
      z === lastChunk.current.z
    ) {
      return;
    }

    lastChunk.current = { x, z };
    setCenter({ x, z });
  };

  return (
    <div className="game-screen">
      <Canvas
        shadows
        camera={{
          position: [0, PLAYER_HEIGHT, 8],
          fov: 68,
          near: 0.1,
          far: 1400
        }}
        dpr={[1, 1.2]}
        gl={{
          antialias: false,
          powerPreference: "high-performance"
        }}
      >
        <World center={center} />

        <PlayerController
          joystick={joystick}
          cameraRef={cameraRef}
          onChunkChange={handleChunkChange}
        />

        {!mobile && <PointerLockControls />}
      </Canvas>

      {mobile && (
        <>
          <MobileCameraLook cameraRef={cameraRef} />
          <MobileJoystick onChange={setJoystick} />
        </>
      )}
    </div>
  );
}

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sky, PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import "./game.css";

const CHUNK_SIZE = 80;
const VIEW_DISTANCE = 2;

const PLAYER_HEIGHT = 1.7;
const PLAYER_RADIUS = 0.42;

const WALK_SPEED = 4.2;
const RUN_SPEED = 6.2;
const ACCELERATION = 13;
const FRICTION = 10;
const LOOK_SENSITIVITY = 0.003;

const ROAD_SPACING = 240;
const ROAD_WIDTH = 8;

const WATER = {
  x: 35,
  z: -25,
  radius: 14,
  shoreRadius: 19
};

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
    roadX < ROAD_WIDTH / 2 + 3 ||
    roadZ < ROAD_WIDTH / 2 + 3
  );
}

function isWaterArea(x, z) {
  return (
    distance(x, z, WATER.x, WATER.z) <
    WATER.shoreRadius + 2
  );
}

function isSpawnArea(x, z) {
  return Math.abs(x) < 18 && Math.abs(z) < 18;
}

/* توزيع الأشجار بنقاط متباعدة وثابتة */
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

  /* مباني البداية */
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

function Tree({ position, scale }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.13, 0.2, 2.2, 8]} />
        <meshStandardMaterial
          color="#59402d"
          roughness={1}
        />
      </mesh>

      <mesh position={[0, 2.35, 0]} castShadow>
        <coneGeometry args={[1.05, 2.2, 9]} />
        <meshStandardMaterial
          color="#245c37"
          roughness={0.95}
        />
      </mesh>

      <mesh position={[0, 3.25, 0]} castShadow>
        <coneGeometry args={[0.72, 1.7, 9]} />
        <meshStandardMaterial
          color="#347447"
          roughness={0.95}
        />
      </mesh>
    </group>
  );
}

function Building({ position, height, color }) {
  return (
    <group position={position}>
      <mesh
        position={[0, height / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[5, height, 5]} />
        <meshStandardMaterial
          color={color}
          roughness={0.88}
        />
      </mesh>

      {Array.from({
        length: Math.floor(height / 2)
      }).map((_, index) => (
        <mesh
          key={index}
          position={[2.51, 1.2 + index * 2, 0]}
        >
          <boxGeometry args={[0.04, 0.8, 0.9]} />
          <meshStandardMaterial
            color="#91bdc1"
            roughness={0.3}
          />
        </mesh>
      ))}
    </group>
  );
}

function Chunk({ cx, cz, obstacles }) {
  const objects = useMemo(
    () => createChunk(cx, cz),
    [cx, cz]
  );

  useEffect(() => {
    const added = objects.map((object) => ({
      x: object.x,
      z: object.z,
      radius:
        object.type === "tree"
          ? 0.85 * object.scale
          : 3.5,
      height:
        object.type === "tree"
          ? 4.5 * object.scale
          : object.height
    }));

    obstacles.current.push(...added);

    return () => {
      const removed = new Set(added);

      obstacles.current = obstacles.current.filter(
        (item) => !removed.has(item)
      );
    };
  }, [objects, obstacles]);

  return (
    <group>
      {objects.map((object, index) =>
        object.type === "tree" ? (
          <Tree
            key={index}
            position={[object.x, 0, object.z]}
            scale={object.scale}
          />
        ) : (
          <Building
            key={index}
            position={[object.x, 0, object.z]}
            height={object.height}
            color={object.color}
          />
        )
      )}
    </group>
  );
}

function Roads({ playerPosition }) {
  const centerX = Math.round(
    playerPosition.x / ROAD_SPACING
  );

  const centerZ = Math.round(
    playerPosition.z / ROAD_SPACING
  );

  const roads = [];

  for (let i = -3; i <= 3; i++) {
    const x = (centerX + i) * ROAD_SPACING;
    const z = (centerZ + i) * ROAD_SPACING;

    roads.push(
      <mesh
        key={`x-${x}`}
        position={[x, 0.005, playerPosition.z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[ROAD_WIDTH, 1200]} />
        <meshStandardMaterial
          color="#353a39"
          roughness={0.98}
        />
      </mesh>
    );

    roads.push(
      <mesh
        key={`z-${z}`}
        position={[playerPosition.x, 0.006, z]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[1200, ROAD_WIDTH]} />
        <meshStandardMaterial
          color="#353a39"
          roughness={0.98}
        />
      </mesh>
    );
  }

  return <>{roads}</>;
}

function Water() {
  return (
    <group position={[WATER.x, 0, WATER.z]}>
      {/* الشاطئ */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.015, 0]}
      >
        <circleGeometry
          args={[WATER.shoreRadius, 64]}
        />
        <meshStandardMaterial
          color="#b7a77e"
          roughness={1}
        />
      </mesh>

      {/* المياه */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.04, 0]}
      >
        <circleGeometry
          args={[WATER.radius, 64]}
        />
        <meshPhysicalMaterial
          color="#07516d"
          roughness={0.22}
          metalness={0.12}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
        />
      </mesh>
    </group>
  );
}

function World({ playerPosition, obstacles }) {
  const centerX = Math.floor(
    playerPosition.x / CHUNK_SIZE
  );

  const centerZ = Math.floor(
    playerPosition.z / CHUNK_SIZE
  );

  const chunks = [];

  for (
    let x = -VIEW_DISTANCE;
    x <= VIEW_DISTANCE;
    x++
  ) {
    for (
      let z = -VIEW_DISTANCE;
      z <= VIEW_DISTANCE;
      z++
    ) {
      chunks.push({
        cx: centerX + x,
        cz: centerZ + z
      });
    }
  }

  return (
    <>
      <ambientLight intensity={0.65} />

      <directionalLight
        position={[80, 100, 40]}
        intensity={1.45}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <Sky
        distance={450000}
        sunPosition={[100, 35, 100]}
      />

      <fog
        attach="fog"
        args={["#a9c2c7", 110, 330]}
      />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.06, 0]}
        receiveShadow
      >
        <planeGeometry args={[100000, 100000]} />
        <meshStandardMaterial
          color="#52734a"
          roughness={1}
        />
      </mesh>

      <Roads playerPosition={playerPosition} />

      <Water />

      {chunks.map(({ cx, cz }) => (
        <Chunk
          key={`${cx}:${cz}`}
          cx={cx}
          cz={cz}
          obstacles={obstacles}
        />
      ))}
    </>
  );
}

function PlayerController({
  joystick,
  obstacles,
  onPositionChange,
  cameraRef
}) {
  const keys = useRef({});
  const velocity = useRef(
    new THREE.Vector3(0, 0, 0)
  );

  const position = useRef(
    new THREE.Vector3(0, PLAYER_HEIGHT, 8)
  );

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

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3(
      -forward.z,
      0,
      forward.x
    );

    let forwardInput = -joystick.y;
    let sideInput = joystick.x;

    if (keys.current.KeyW || keys.current.ArrowUp)
      forwardInput += 1;

    if (keys.current.KeyS || keys.current.ArrowDown)
      forwardInput -= 1;

    if (keys.current.KeyD || keys.current.ArrowRight)
      sideInput += 1;

    if (keys.current.KeyA || keys.current.ArrowLeft)
      sideInput -= 1;

    const input = new THREE.Vector3()
      .addScaledVector(forward, forwardInput)
      .addScaledVector(right, sideInput);

    if (input.lengthSq() > 1) input.normalize();

    const running = keys.current.ShiftLeft ||
      keys.current.ShiftRight;

    const maxSpeed = running ? RUN_SPEED : WALK_SPEED;

    const targetVelocity = input.multiplyScalar(maxSpeed);

    velocity.current.x = THREE.MathUtils.damp(
      velocity.current.x,
      targetVelocity.x,
      input.lengthSq() > 0 ? ACCELERATION : FRICTION,
      dt
    );

    velocity.current.z = THREE.MathUtils.damp(
      velocity.current.z,
      targetVelocity.z,
      input.lengthSq() > 0 ? ACCELERATION : FRICTION,
      dt
    );

    const current = position.current;

    const nextX = current.x + velocity.current.x * dt;
    const nextZ = current.z + velocity.current.z * dt;

    const collides = (x, z) =>
      obstacles.current.some((obstacle) => {
        const dx = x - obstacle.x;
        const dz = z - obstacle.z;

        return (
          Math.hypot(dx, dz) <
          obstacle.radius + PLAYER_RADIUS
        );
      });

    const insideWater = (x, z) =>
      distance(x, z, WATER.x, WATER.z) <
      WATER.radius - PLAYER_RADIUS;

    if (!collides(nextX, current.z) &&
        !insideWater(nextX, current.z)) {
      current.x = nextX;
    } else {
      velocity.current.x = 0;
    }

    if (!collides(current.x, nextZ) &&
        !insideWater(current.x, nextZ)) {
      current.z = nextZ;
    } else {
      velocity.current.z = 0;
    }

    current.y = PLAYER_HEIGHT;

    camera.position.copy(current);
    cameraRef.current = camera;

    onPositionChange({
      x: current.x,
      z: current.z
    });
  });

  return null;
}

function MobileCameraLook({ cameraRef }) {
  const touch = useRef(null);

  const down = (event) => {
    touch.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY
    };

    event.currentTarget.setPointerCapture(
      event.pointerId
    );
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

function MobileJoystick({ onChange }) {
  const [knob, setKnob] = useState({
    x: 0,
    y: 0
  });

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

    onChange({
      x: dx / max,
      y: dy / max
    });
  };

  const down = (event) => {
    pointer.current = event.pointerId;

    event.currentTarget.setPointerCapture(
      event.pointerId
    );

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

export default function Game() {
  const [position, setPosition] = useState({
    x: 0,
    z: 8
  });

  const [joystick, setJoystick] = useState({
    x: 0,
    y: 0
  });

  const [mobile, setMobile] = useState(false);

  const obstacles = useRef([]);
  const cameraRef = useRef(null);

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

  return (
    <div className="game-screen">
      <Canvas
        shadows
        camera={{
          position: [0, PLAYER_HEIGHT, 8],
          fov: 68,
          near: 0.1,
          far: 450
        }}
        dpr={[1, 1.25]}
        gl={{
          antialias: false,
          powerPreference: "high-performance"
        }}
      >
        <World
          playerPosition={position}
          obstacles={obstacles}
        />

        <PlayerController
          joystick={joystick}
          obstacles={obstacles}
          cameraRef={cameraRef}
          onPositionChange={setPosition}
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

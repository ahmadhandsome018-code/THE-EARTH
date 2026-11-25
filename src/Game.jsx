import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sky, PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import "./game.css";

const CHUNK_SIZE = 80;
const VIEW_DISTANCE = 2;
const PLAYER_HEIGHT = 1.7;
const PLAYER_RADIUS = 0.42;
const MOVE_SPEED = 7;
const LOOK_SENSITIVITY = 0.004;

const ROAD_WIDTH = 9;
const ROAD_CLEARANCE = 9;
const TREE_CELL_SIZE = 15;

const LAKE = {
  x: 35,
  z: -25,
  radius: 15,
  shoreRadius: 19
};

function hash(a, b, seed = 0) {
  const value = Math.sin(a * 127.1 + b * 311.7 + seed * 74.7) * 43758.5453;
  return value - Math.floor(value);
}

function distanceToGridRoad(value) {
  const nearest = Math.round(value / CHUNK_SIZE) * CHUNK_SIZE;
  return Math.abs(value - nearest);
}

function isRoad(x, z, extra = 0) {
  return (
    distanceToGridRoad(x) < ROAD_WIDTH / 2 + extra ||
    distanceToGridRoad(z) < ROAD_WIDTH / 2 + extra
  );
}

function isLakeArea(x, z) {
  return Math.hypot(x - LAKE.x, z - LAKE.z) < LAKE.shoreRadius;
}

function isTownArea(x, z) {
  return Math.abs(x) < 35 && Math.abs(z) < 35;
}

function Tree({ position, scale = 1, variant = 0 }) {
  const crownColor = variant === 0 ? "#285b3c" : "#356b43";
  const trunkColor = variant === 0 ? "#63462f" : "#73513a";

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.13, 0.21, 2.1, 9]} />
        <meshStandardMaterial color={trunkColor} roughness={1} />
      </mesh>

      <mesh position={[0, 2.25, 0]} castShadow>
        <coneGeometry args={[1.05, 2.2, 9]} />
        <meshStandardMaterial color={crownColor} roughness={0.96} />
      </mesh>

      <mesh position={[0, 3.1, 0]} castShadow>
        <coneGeometry args={[0.72, 1.65, 9]} />
        <meshStandardMaterial
          color={variant === 0 ? "#36794a" : "#477f50"}
          roughness={0.96}
        />
      </mesh>
    </group>
  );
}

function Building({ position, height, color }) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, height, 5]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>

      {Array.from({ length: Math.floor(height / 2) }).map((_, i) => (
        <mesh key={i} position={[2.51, 1.2 + i * 2, 0]}>
          <boxGeometry args={[0.04, 0.8, 0.9]} />
          <meshStandardMaterial
            color="#8bb8bd"
            roughness={0.35}
            metalness={0.1}
          />
        </mesh>
      ))}
    </group>
  );
}

/*
  توزيع الأشجار على شبكة مكانية ثابتة.
  كل خلية لها موقع عشوائي محسوب من إحداثياتها،
  لذلك لا يتغير التوزيع عند إعادة تحميل المنطقة.
*/
function createChunk(cx, cz) {
  const objects = [];

  const startCellX = Math.floor((cx * CHUNK_SIZE) / TREE_CELL_SIZE) - 1;
  const endCellX = Math.ceil(((cx + 1) * CHUNK_SIZE) / TREE_CELL_SIZE) + 1;

  const startCellZ = Math.floor((cz * CHUNK_SIZE) / TREE_CELL_SIZE) - 1;
  const endCellZ = Math.ceil(((cz + 1) * CHUNK_SIZE) / TREE_CELL_SIZE) + 1;

  for (let gx = startCellX; gx <= endCellX; gx++) {
    for (let gz = startCellZ; gz <= endCellZ; gz++) {
      const x =
        gx * TREE_CELL_SIZE +
        2 +
        hash(gx, gz, 1) * (TREE_CELL_SIZE - 4);

      const z =
        gz * TREE_CELL_SIZE +
        2 +
        hash(gx, gz, 2) * (TREE_CELL_SIZE - 4);

      const belongsToChunk =
        Math.floor(x / CHUNK_SIZE) === cx &&
        Math.floor(z / CHUNK_SIZE) === cz;

      if (!belongsToChunk) continue;

      // الطرق ومداخلها مناطق خالية من الأشجار.
      if (isRoad(x, z, ROAD_CLEARANCE)) continue;

      // لا أشجار داخل البحيرة أو شاطئها.
      if (isLakeArea(x, z)) continue;

      // مساحة مفتوحة حول مركز المدينة والمباني.
      if (isTownArea(x, z)) continue;

      // بعض الخلايا تظل مساحات عشبية مفتوحة.
      const density = hash(gx, gz, 5);
      if (density < 0.27) continue;

      objects.push({
        type: "tree",
        x,
        z,
        scale: 0.85 + hash(gx, gz, 3) * 0.28,
        variant: hash(gx, gz, 4) > 0.5 ? 1 : 0
      });
    }
  }

  if (cx === 0 && cz === 0) {
    objects.push(
      { type: "building", x: 13, z: -13, height: 8, color: "#b8ad9b" },
      { type: "building", x: -13, z: -13, height: 6, color: "#c9c0b1" },
      { type: "building", x: 13, z: 13, height: 10, color: "#aab9b8" },
      { type: "building", x: -13, z: 13, height: 7, color: "#b9aa98" }
    );
  }

  return objects;
}

function Chunk({ cx, cz, obstacles }) {
  const objects = useMemo(() => createChunk(cx, cz), [cx, cz]);

  useEffect(() => {
    const added = objects.map((object) => ({
      x: object.x,
      z: object.z,
      radius: object.type === "tree" ? 0.75 * object.scale : 3.5,
      height: object.type === "tree" ? 4.5 * object.scale : object.height
    }));

    obstacles.current.push(...added);

    return () => {
      const removed = new Set(added);
      obstacles.current = obstacles.current.filter((item) => !removed.has(item));
    };
  }, [objects, obstacles]);

  return (
    <group>
      {objects.map((object, index) =>
        object.type === "tree" ? (
          <Tree
            key={`${object.x}:${object.z}`}
            position={[object.x, 0, object.z]}
            scale={object.scale}
            variant={object.variant}
          />
        ) : (
          <Building
            key={`building-${index}`}
            position={[object.x, 0, object.z]}
            height={object.height}
            color={object.color}
          />
        )
      )}
    </group>
  );
}

function Roads() {
  const roads = useMemo(() => {
    const result = [];

    for (let i = -60; i <= 60; i++) {
      const offset = i * CHUNK_SIZE;

      result.push(
        { x: offset, z: 0, width: ROAD_WIDTH, depth: 10000 },
        { x: 0, z: offset, width: 10000, depth: ROAD_WIDTH }
      );
    }

    return result;
  }, []);

  return (
    <group>
      {roads.map((road, index) => (
        <mesh
          key={index}
          position={[road.x, 0.015, road.z]}
          rotation={[-Math.PI / 2, 0, 0]}
          receiveShadow
        >
          <planeGeometry args={[road.width, road.depth]} />
          <meshStandardMaterial color="#343b3c" roughness={0.96} />
        </mesh>
      ))}
    </group>
  );
}

function Lake() {
  return (
    <group position={[LAKE.x, 0, LAKE.z]}>
      {/* الشاطئ */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.005, 0]}
        receiveShadow
      >
        <circleGeometry args={[LAKE.shoreRadius, 96]} />
        <meshStandardMaterial color="#b7a77e" roughness={1} />
      </mesh>

      {/* المياه */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.045, 0]}
      >
        <circleGeometry args={[LAKE.radius, 96]} />
        <meshPhysicalMaterial
          color="#07516b"
          roughness={0.2}
          metalness={0.12}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
        />
      </mesh>
    </group>
  );
}

function World({ playerPosition, obstacles }) {
  const chunks = useMemo(() => {
    const centerX = Math.floor(playerPosition.x / CHUNK_SIZE);
    const centerZ = Math.floor(playerPosition.z / CHUNK_SIZE);
    const result = [];

    for (let x = -VIEW_DISTANCE; x <= VIEW_DISTANCE; x++) {
      for (let z = -VIEW_DISTANCE; z <= VIEW_DISTANCE; z++) {
        result.push({
          cx: centerX + x,
          cz: centerZ + z
        });
      }
    }

    return result;
  }, [
    Math.floor(playerPosition.x / CHUNK_SIZE),
    Math.floor(playerPosition.z / CHUNK_SIZE)
  ]);

  return (
    <>
      <color attach="background" args={["#9eb6bd"]} />

      <ambientLight intensity={0.65} />

      <directionalLight
        position={[40, 65, 25]}
        intensity={1.65}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <Sky distance={450000} sunPosition={[100, 35, 100]} />

      <fog attach="fog" args={["#a9c2c5", 115, 310]} />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.06, 0]}
        receiveShadow
      >
        <planeGeometry args={[10000, 10000]} />
        <meshStandardMaterial color="#52784c" roughness={1} />
      </mesh>

      <Roads />
      <Lake />

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
  onPositionChange,
  obstacles,
  cameraRef
}) {
  const keys = useRef({});
  const position = useRef(new THREE.Vector3(0, PLAYER_HEIGHT, 8));

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
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();

    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    right.set(-forward.z, 0, forward.x);

    let forwardInput = -joystick.y;
    let sideInput = joystick.x;

    if (keys.current.KeyW || keys.current.ArrowUp) forwardInput += 1;
    if (keys.current.KeyS || keys.current.ArrowDown) forwardInput -= 1;
    if (keys.current.KeyD || keys.current.ArrowRight) sideInput += 1;
    if (keys.current.KeyA || keys.current.ArrowLeft) sideInput -= 1;

    const movement = new THREE.Vector3()
      .addScaledVector(forward, forwardInput)
      .addScaledVector(right, sideInput);

    if (movement.lengthSq() > 1) movement.normalize();

    movement.multiplyScalar(MOVE_SPEED * Math.min(delta, 0.04));

    const current = position.current;
    const nextX = current.x + movement.x;
    const nextZ = current.z + movement.z;

    const collides = (x, z) =>
      obstacles.current.some((obstacle) => {
        const dx = x - obstacle.x;
        const dz = z - obstacle.z;
        return Math.hypot(dx, dz) < obstacle.radius + PLAYER_RADIUS;
      });

    if (!collides(nextX, current.z)) current.x = nextX;
    if (!collides(current.x, nextZ)) current.z = nextZ;

    // منع دخول البحيرة والشاطئ.
    const lakeDistance = Math.hypot(
      current.x - LAKE.x,
      current.z - LAKE.z
    );

    if (lakeDistance < LAKE.shoreRadius + PLAYER_RADIUS) {
      const angle = Math.atan2(
        current.z - LAKE.z,
        current.x - LAKE.x
      );

      current.x = LAKE.x + Math.cos(angle) * (LAKE.shoreRadius + PLAYER_RADIUS);
      current.z = LAKE.z + Math.sin(angle) * (LAKE.shoreRadius + PLAYER_RADIUS);
    }

    current.y = PLAYER_HEIGHT;

    camera.position.copy(current);
    cameraRef.current = camera;

    onPositionChange({
      x: Math.round(current.x),
      z: Math.round(current.z)
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
      -1.4,
      1.4
    );
  };

  const up = (event) => {
    if (touch.current?.id === event.pointerId) touch.current = null;
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
    const distance = Math.hypot(dx, dy);

    if (distance > max) {
      dx = (dx / distance) * max;
      dy = (dy / distance) * max;
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
    if (pointer.current === event.pointerId) update(event);
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
          style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
        />
      </div>
    </div>
  );
}

export default function Game() {
  const [position, setPosition] = useState({ x: 0, z: 8 });
  const [joystick, setJoystick] = useState({ x: 0, y: 0 });
  const [showHelp, setShowHelp] = useState(true);
  const [mobile, setMobile] = useState(false);

  const obstacles = useRef([]);
  const cameraRef = useRef(null);

  useEffect(() => {
    const check = () =>
      setMobile(
        window.matchMedia("(pointer: coarse)").matches ||
        window.innerWidth <= 900
      );

    check();
    window.addEventListener("resize", check);

    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="game-screen">
      <Canvas
        shadows
        camera={{
          position: [0, PLAYER_HEIGHT, 8],
          fov: 72,
          near: 0.1,
          far: 600
        }}
        dpr={[1, 1.5]}
      >
        <World playerPosition={position} obstacles={obstacles} />

        <PlayerController
          joystick={joystick}
          obstacles={obstacles}
          cameraRef={cameraRef}
          onPositionChange={setPosition}
        />

        {!mobile && <PointerLockControls />}
      </Canvas>

      {mobile && !showHelp && <MobileCameraLook cameraRef={cameraRef} />}

      {mobile && !showHelp && (
        <MobileJoystick onChange={setJoystick} />
      )}

      <header className="earth-hud">
        <div className="earth-brand">
          <span className="brand-mark">E</span>
          <div>
            <strong>THE EARTH</strong>
            <small>WORLD SYSTEM / 001</small>
          </div>
        </div>

        <div className="earth-location">
          <span>LOCAL POSITION</span>
          <strong>{position.x} / {position.z}</strong>
        </div>

        <button
          className="earth-help-button"
          onClick={() => setShowHelp(!showHelp)}
          aria-label="مساعدة"
        >
          ?
        </button>
      </header>

      <div className="earth-status">
        <span className="status-dot" />
        <span>WORLD 001</span>
        <span>EXPLORATION</span>
      </div>

      {showHelp && (
        <div className="earth-intro">
          <div className="intro-index">FIELD ACCESS / 001</div>
          <h1>اكتشف العالم.</h1>
          <p>
            مساحة مفتوحة تنتظرك. تحرك بحرية واستكشف محيطك.
          </p>

          <div className="intro-controls">
            {mobile ? "العصا للحركة — اسحب الشاشة للنظر" : "W A S D للحركة — الماوس للنظر"}
          </div>

          <button onClick={() => setShowHelp(false)}>
            دخول العالم <span>↗</span>
          </button>
        </div>
      )}

      <footer className="earth-footer">
        <span>COORDINATES / {position.x}, {position.z}</span>
        <span>THE EARTH — OPEN WORLD</span>
      </footer>
    </div>
  );
}

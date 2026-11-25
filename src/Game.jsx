import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sky, PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import "./game.css";

const CHUNK_SIZE = 80;
const VIEW_DISTANCE = 2;
const PLAYER_HEIGHT = 1.7;
const PLAYER_RADIUS = 0.42;
const MOVE_SPEED = 7;
const LOOK_SENSITIVITY = 0.004;

function seededRandom(x, z, seed = 0) {
  const value = Math.sin(x * 127.1 + z * 311.7 + seed * 74.7) * 43758.5453;
  return value - Math.floor(value);
}

function Tree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.24, 2, 8]} />
        <meshStandardMaterial color="#60452d" />
      </mesh>

      <mesh position={[0, 2.25, 0]} castShadow>
        <coneGeometry args={[1.1, 2.3, 9]} />
        <meshStandardMaterial color="#176b38" roughness={0.9} />
      </mesh>

      <mesh position={[0, 3.1, 0]} castShadow>
        <coneGeometry args={[0.75, 1.8, 9]} />
        <meshStandardMaterial color="#25834a" roughness={0.9} />
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
            color="#8bd8e8"
            roughness={0.2}
            metalness={0.15}
          />
        </mesh>
      ))}
    </group>
  );
}

/* إنشاء محتوى المناطق بطريقة ثابتة */
function createChunk(cx, cz) {
  const objects = [];

  for (let i = 0; i < 22; i++) {
    const seed = cx * 100 + cz * 200 + i;
    const x = cx * CHUNK_SIZE + seededRandom(seed, i) * CHUNK_SIZE;
    const z = cz * CHUNK_SIZE + seededRandom(i, seed, 3) * CHUNK_SIZE;

    const nearRoad =
      Math.abs(x) % 80 < 9 ||
      Math.abs(z) % 80 < 9;

    if (nearRoad) continue;

    const chance = seededRandom(x, z, 8);

    if (chance > 0.22) {
      objects.push({
        type: "tree",
        x,
        z,
        scale: 0.8 + seededRandom(z, x, 2) * 0.5
      });
    }
  }

  if (cx === 0 && cz === 0) {
    objects.push(
      { type: "building", x: 13, z: -13, height: 8, color: "#c5b79c" },
      { type: "building", x: -13, z: -13, height: 6, color: "#d1c7b5" },
      { type: "building", x: 13, z: 13, height: 10, color: "#b8c5c5" },
      { type: "building", x: -13, z: 13, height: 7, color: "#c6b6a4" }
    );
  }

  return objects;
}

function Chunk({ cx, cz, obstacles }) {
  const objects = useMemo(() => createChunk(cx, cz), [cx, cz]);

  useEffect(() => {
    objects.forEach((object) => {
      if (object.type === "tree") {
        obstacles.current.push({
          x: object.x,
          z: object.z,
          radius: 0.8 * object.scale,
          height: 4.5 * object.scale
        });
      } else {
        obstacles.current.push({
          x: object.x,
          z: object.z,
          radius: 3.5,
          height: object.height
        });
      }
    });

    return () => {
      const positions = new Set(
        objects.map((o) => `${o.x},${o.z}`)
      );

      obstacles.current = obstacles.current.filter(
        (o) => !positions.has(`${o.x},${o.z}`)
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

/* منطقة مياه تجريبية */
function Water() {
  const waterRef = useRef(null);

  useFrame(({ clock }) => {
    if (waterRef.current) {
      waterRef.current.material.uniformsNeedUpdate = true;
      waterRef.current.position.y = 0.08 + Math.sin(clock.elapsedTime * 1.2) * 0.025;
    }
  });

  return (
    <mesh
      ref={waterRef}
      position={[35, 0.08, -25]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <circleGeometry args={[13, 64]} />
      <meshPhysicalMaterial
        color="#087b9a"
        roughness={0.16}
        metalness={0.15}
        clearcoat={0.8}
        clearcoatRoughness={0.15}
      />
    </mesh>
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
      <ambientLight intensity={0.7} />

      <directionalLight
        position={[30, 50, 20]}
        intensity={1.8}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <Sky
        distance={450000}
        sunPosition={[100, 30, 100]}
      />

      <fog attach="fog" args={["#b8d5d5", 100, 260]} />

      {/* أرض كبيرة قابلة للاستكشاف */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.05, 0]}
        receiveShadow
      >
        <planeGeometry args={[10000, 10000]} />
        <meshStandardMaterial color="#547b4b" roughness={1} />
      </mesh>

      {/* شبكة الطرق */}
      {Array.from({ length: 120 }, (_, i) => {
        const offset = (i - 60) * CHUNK_SIZE;

        return (
          <React.Fragment key={i}>
            <mesh
              position={[offset, 0.01, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[9, 10000]} />
              <meshStandardMaterial color="#343a3c" roughness={0.95} />
            </mesh>

            <mesh
              position={[0, 0.012, offset]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[10000, 9]} />
              <meshStandardMaterial color="#343a3c" roughness={0.95} />
            </mesh>
          </React.Fragment>
        );
      })}

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
        const distance = Math.sqrt(dx * dx + dz * dz);

        return distance < obstacle.radius + PLAYER_RADIUS;
      });

    /* منع دخول الأشجار والمباني */
    if (!collides(nextX, current.z)) current.x = nextX;
    if (!collides(current.x, nextZ)) current.z = nextZ;

    /* منع دخول منطقة الماء التجريبية */
    const waterDistance = Math.hypot(
      current.x - 35,
      current.z + 25
    );

    if (waterDistance < 13.5) {
      current.x = camera.position.x;
      current.z = camera.position.z;
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

function MobileCameraLook({ cameraRef, enabled }) {
  const touch = useRef(null);

  if (!enabled) return null;

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
      -1.45,
      1.45
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
      dx = dx / distance * max;
      dy = dy / distance * max;
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
          fov: 75,
          near: 0.1,
          far: 500
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

      {mobile && !showHelp && (
        <>
          <MobileCameraLook cameraRef={cameraRef} enabled />
          <MobileJoystick onChange={setJoystick} />
        </>
      )}

      <div className="game-topbar">
        <div className="game-logo">THE EARTH</div>

        <div className="game-coordinates">
          X: {position.x} | Z: {position.z}
        </div>

        <button onClick={() => setShowHelp(!showHelp)}>?</button>
      </div>

      {showHelp && (
        <div className="game-help">
          <strong>مرحبًا بك في THE EARTH</strong>

          {mobile ? (
            <>
              <p>العصا أسفل اليسار للحركة.</p>
              <p>اسحب إصبعك على يمين الشاشة لتغيير اتجاه النظر.</p>
            </>
          ) : (
            <>
              <p>W A S D للحركة.</p>
              <p>استخدم الماوس للنظر حولك.</p>
            </>
          )}

          <button onClick={() => setShowHelp(false)}>
            دخول العالم
          </button>
        </div>
      )}

      <div className="game-bottom">
        <span>WORLD PROTOTYPE</span>
        <span>EXPLORATION MODE</span>
      </div>
    </div>
  );
}

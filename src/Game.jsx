import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sky, PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import "./game.css";

const CHUNK_SIZE = 80;
const VIEW_DISTANCE = 2;
const PLAYER_HEIGHT = 1.7;
const PLAYER_RADIUS = 0.48;
const MOVE_SPEED = 7;
const LOOK_SENSITIVITY = 0.0035;

const LAKE = { x: 35, z: -25, radius: 16 };
const ROAD_WIDTH = 7;

function random2(x, z, seed = 0) {
  const value = Math.sin(x * 127.1 + z * 311.7 + seed * 74.7) * 43758.5453;
  return value - Math.floor(value);
}

function distance2(x1, z1, x2, z2) {
  return Math.hypot(x1 - x2, z1 - z2);
}

function isWater(x, z, margin = 0) {
  return distance2(x, z, LAKE.x, LAKE.z) < LAKE.radius + margin;
}

function isRoad(x, z) {
  const localX = ((x % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;
  const localZ = ((z % CHUNK_SIZE) + CHUNK_SIZE) % CHUNK_SIZE;

  return (
    localX < ROAD_WIDTH ||
    localX > CHUNK_SIZE - ROAD_WIDTH ||
    localZ < ROAD_WIDTH ||
    localZ > CHUNK_SIZE - ROAD_WIDTH
  );
}

function terrainHeight(x, z) {
  return (
    Math.sin(x * 0.018) * 0.45 +
    Math.cos(z * 0.021) * 0.35 +
    Math.sin((x + z) * 0.012) * 0.25
  );
}

function Tree({ position, scale = 1, variant = 0 }) {
  const colors = ["#174d32", "#205f3b", "#286d43", "#16452f"];
  const leafColor = colors[variant % colors.length];

  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1.15, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.23, 2.3, 7]} />
        <meshStandardMaterial color="#59402b" roughness={1} />
      </mesh>

      <mesh position={[0, 2.45, 0]} castShadow>
        <coneGeometry args={[1.05, 2.25, 8]} />
        <meshStandardMaterial color={leafColor} roughness={0.95} />
      </mesh>

      <mesh position={[0, 3.25, 0]} castShadow>
        <coneGeometry args={[0.72, 1.8, 8]} />
        <meshStandardMaterial
          color={new THREE.Color(leafColor).multiplyScalar(1.2)}
          roughness={0.95}
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

      {Array.from({ length: Math.max(1, Math.floor(height / 2)) }).map(
        (_, i) => (
          <mesh key={i} position={[2.51, 1.2 + i * 2, 0]}>
            <boxGeometry args={[0.04, 0.8, 0.9]} />
            <meshStandardMaterial
              color="#9bcbd0"
              emissive="#23434a"
              emissiveIntensity={0.15}
              roughness={0.3}
            />
          </mesh>
        )
      )}
    </group>
  );
}

/*
 * توزيع الأشجار:
 * - كل شجرة لها خلية مستقلة.
 * - يتم استخدام إحداثيات ثابتة حتى لا يتغير العالم عند إعادة التحميل.
 * - لا توضع الأشجار داخل المياه أو الطرق أو بالقرب من المباني.
 */
function createChunk(cx, cz) {
  const objects = [];
  const occupied = [];

  const cellSize = 13;
  const cells = Math.floor(CHUNK_SIZE / cellSize);

  for (let gx = 0; gx < cells; gx++) {
    for (let gz = 0; gz < cells; gz++) {
      const seedX = cx * 1000 + gx;
      const seedZ = cz * 1000 + gz;

      const x =
        cx * CHUNK_SIZE +
        gx * cellSize +
        3 +
        random2(seedX, seedZ, 1) * 7;

      const z =
        cz * CHUNK_SIZE +
        gz * cellSize +
        3 +
        random2(seedZ, seedX, 2) * 7;

      if (isRoad(x, z)) continue;
      if (isWater(x, z, 5)) continue;

      // منطقة المباني المركزية
      if (Math.abs(x) < 25 && Math.abs(z) < 25) continue;

      // مجموعات نباتية طبيعية بدل توزيع متساوٍ بالكامل
      const cluster = random2(
        Math.floor(x / 35),
        Math.floor(z / 35),
        9
      );

      const chance = random2(seedX, seedZ, 4);

      if (cluster < 0.17 || chance < 0.38) continue;

      let tooClose = false;

      for (const item of occupied) {
        if (distance2(x, z, item.x, item.z) < 9) {
          tooClose = true;
          break;
        }
      }

      if (tooClose) continue;

      occupied.push({ x, z });

      objects.push({
        type: "tree",
        x,
        z,
        scale: 0.85 + random2(seedZ, seedX, 7) * 0.35,
        variant: Math.floor(random2(seedX, seedZ, 8) * 4)
      });
    }
  }

  if (cx === 0 && cz === 0) {
    objects.push(
      { type: "building", x: 18, z: 18, height: 8, color: "#b8aa91" },
      { type: "building", x: -18, z: 18, height: 6, color: "#c9c0ad" },
      { type: "building", x: 18, z: -18, height: 10, color: "#aebfc0" },
      { type: "building", x: -18, z: -18, height: 7, color: "#c4b39f" }
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
      radius: object.type === "tree" ? 0.75 * object.scale : 3.6,
      height: object.type === "tree" ? 4.5 * object.scale : object.height
    }));

    obstacles.current.push(...added);

    return () => {
      const removeSet = new Set(added);
      obstacles.current = obstacles.current.filter(
        (item) => !removeSet.has(item)
      );
    };
  }, [objects, obstacles]);

  return (
    <group>
      {objects.map((object, index) =>
        object.type === "tree" ? (
          <Tree
            key={index}
            position={[
              object.x,
              terrainHeight(object.x, object.z),
              object.z
            ]}
            scale={object.scale}
            variant={object.variant}
          />
        ) : (
          <Building
            key={index}
            position={[
              object.x,
              terrainHeight(object.x, object.z),
              object.z
            ]}
            height={object.height}
            color={object.color}
          />
        )
      )}
    </group>
  );
}

function GroundChunk({ cx, cz }) {
  const position = [cx * CHUNK_SIZE + CHUNK_SIZE / 2, -0.08, cz * CHUNK_SIZE + CHUNK_SIZE / 2];

  return (
    <mesh
      position={position}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[CHUNK_SIZE, CHUNK_SIZE, 16, 16]} />
      <meshStandardMaterial
        color="#527b4d"
        roughness={1}
        metalness={0}
      />
    </mesh>
  );
}

function Water() {
  const waterRef = useRef(null);

  useFrame(({ clock }) => {
    if (waterRef.current) {
      waterRef.current.position.y =
        -0.025 + Math.sin(clock.elapsedTime * 0.8) * 0.018;
    }
  });

  return (
    <group position={[LAKE.x, 0, LAKE.z]}>
      {/* حافة الشاطئ */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.035, 0]}
      >
        <circleGeometry args={[LAKE.radius + 2.2, 80]} />
        <meshStandardMaterial color="#b7a77e" roughness={1} />
      </mesh>

      {/* المياه */}
      <mesh
        ref={waterRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
      >
        <circleGeometry args={[LAKE.radius, 80]} />
        <meshPhysicalMaterial
          color="#146b83"
          roughness={0.2}
          metalness={0.12}
          clearcoat={0.9}
          clearcoatRoughness={0.12}
        />
      </mesh>
    </group>
  );
}

function Road({ cx, cz }) {
  return (
    <group position={[cx * CHUNK_SIZE, 0, cz * CHUNK_SIZE]}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[CHUNK_SIZE / 2, -0.035, CHUNK_SIZE / 2]}
      >
        <planeGeometry args={[ROAD_WIDTH, CHUNK_SIZE]} />
        <meshStandardMaterial color="#343b3b" roughness={0.95} />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[CHUNK_SIZE / 2, -0.034, CHUNK_SIZE / 2]}
      >
        <planeGeometry args={[CHUNK_SIZE, ROAD_WIDTH]} />
        <meshStandardMaterial color="#343b3b" roughness={0.95} />
      </mesh>
    </group>
  );
}

function World({ playerPosition, obstacles }) {
  const centerX = Math.floor(playerPosition.x / CHUNK_SIZE);
  const centerZ = Math.floor(playerPosition.z / CHUNK_SIZE);

  const chunks = useMemo(() => {
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
  }, [centerX, centerZ]);

  return (
    <>
      <ambientLight intensity={0.62} />

      <directionalLight
        position={[35, 60, 25]}
        intensity={1.55}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <hemisphereLight
        skyColor="#c4e1ed"
        groundColor="#43543b"
        intensity={0.45}
      />

      <Sky distance={450000} sunPosition={[100, 35, 80]} />

      <fog attach="fog" args={["#b8d0d3", 130, 330]} />

      {chunks.map(({ cx, cz }) => (
        <React.Fragment key={`${cx}:${cz}`}>
          <GroundChunk cx={cx} cz={cz} />
          <Road cx={cx} cz={cz} />
          <Chunk cx={cx} cz={cz} obstacles={obstacles} />
        </React.Fragment>
      ))}

      <Water />
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
  const lastUpdate = useRef(0);

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
        return (
          distance2(x, z, obstacle.x, obstacle.z) <
          obstacle.radius + PLAYER_RADIUS
        );
      });

    // تصادم منفصل للمحورين حتى يستطيع اللاعب التحرك بمحاذاة العوائق
    if (!collides(nextX, current.z) && !isWater(nextX, current.z, 0.8)) {
      current.x = nextX;
    }

    if (!collides(current.x, nextZ) && !isWater(current.x, nextZ, 0.8)) {
      current.z = nextZ;
    }

    current.y = PLAYER_HEIGHT + terrainHeight(current.x, current.z);

    camera.position.copy(current);
    cameraRef.current = camera;

    if (Date.now() - lastUpdate.current > 100) {
      lastUpdate.current = Date.now();

      onPositionChange({
        x: Math.round(current.x),
        z: Math.round(current.z)
      });
    }
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
      -1.4,
      1.4
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
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const baseRef = useRef(null);
  const pointer = useRef(null);

  const update = (event) => {
    if (!baseRef.current) return;

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
    const check = () => {
      setMobile(
        window.matchMedia("(pointer: coarse)").matches ||
        window.innerWidth <= 900
      );
    };

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
        gl={{ antialias: true, powerPreference: "high-performance" }}
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

      <header className="game-topbar">
        <div className="brand-mark">
          <span className="brand-symbol">E</span>
          <div>
            <div className="game-logo">THE EARTH</div>
            <small>WORLD SYSTEM / 001</small>
          </div>
        </div>

        <div className="game-coordinate-panel">
          <span>LOCAL POSITION</span>
          <strong>{String(position.x).padStart(4, "0")} / {String(position.z).padStart(4, "0")}</strong>
        </div>

        <button
          className="help-button"
          onClick={() => setShowHelp(!showHelp)}
          aria-label="المساعدة"
        >
          ?
        </button>
      </header>

      <div className="world-status">
        <span className="status-dot" />
        <span>WORLD ONLINE</span>
        <span className="status-divider">/</span>
        <span>EXPLORATION</span>
      </div>

      {showHelp && (
        <div className="game-help">
          <div className="help-eyebrow">THE EARTH / FIRST ACCESS</div>
          <strong>العالم مفتوح أمامك.</strong>

          {mobile ? (
            <>
              <p>استخدم عصا الحركة للتنقل.</p>
              <p>اسحب في الجهة اليمنى لتغيير اتجاه الكاميرا.</p>
            </>
          ) : (
            <>
              <p>W A S D للحركة.</p>
              <p>حرّك الماوس للنظر حولك، واضغط ESC لتحرير المؤشر.</p>
            </>
          )}

          <button onClick={() => setShowHelp(false)}>
            ابدأ الاستكشاف <span>↗</span>
          </button>
        </div>
      )}

      <footer className="game-bottom">
        <span>THE EARTH — OPEN WORLD PROJECT</span>
        <span>COORDINATES {position.x}, {position.z}</span>
      </footer>
    </div>
  );
}

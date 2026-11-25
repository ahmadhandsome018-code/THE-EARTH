import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Sky, PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import "./game.css";

const isMobileDevice = () =>
  typeof window !== "undefined" &&
  (window.matchMedia("(pointer: coarse)").matches ||
    window.innerWidth <= 900);

function Tree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.23, 2, 8]} />
        <meshStandardMaterial color="#60452d" />
      </mesh>

      <mesh position={[0, 2.35, 0]} castShadow>
        <coneGeometry args={[1.05, 2.4, 8]} />
        <meshStandardMaterial color="#245c38" roughness={1} />
      </mesh>

      <mesh position={[0, 3.1, 0]} castShadow>
        <coneGeometry args={[0.72, 1.8, 8]} />
        <meshStandardMaterial color="#327447" roughness={1} />
      </mesh>
    </group>
  );
}

function Building({ position, color = "#c8b9a0", height = 5 }) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[4, height, 4]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>

      {Array.from({ length: Math.floor(height / 1.5) }).map((_, i) => (
        <group key={i}>
          <mesh position={[2.01, 1 + i * 1.5, 0.8]}>
            <boxGeometry args={[0.04, 0.65, 0.65]} />
            <meshStandardMaterial
              color="#8ac8d8"
              metalness={0.2}
              roughness={0.25}
            />
          </mesh>

          <mesh position={[2.01, 1 + i * 1.5, -0.8]}>
            <boxGeometry args={[0.04, 0.65, 0.65]} />
            <meshStandardMaterial
              color="#8ac8d8"
              metalness={0.2}
              roughness={0.25}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* مواقع ثابتة للأشجار لتجنب إعادة توزيعها عند كل تحديث */
const TREE_POSITIONS = [];

for (let x = -42; x <= 42; x += 7) {
  for (let z = -42; z <= 42; z += 7) {
    const nearRoad = Math.abs(x) < 7 || Math.abs(z) < 7;

    const value = Math.abs(
      Math.sin(x * 12.9898 + z * 78.233) * 43758.5453
    ) % 1;

    if (!nearRoad && value > 0.35) {
      TREE_POSITIONS.push({
        position: [x, 0, z],
        scale: 0.8 + (TREE_POSITIONS.length % 4) * 0.1
      });
    }
  }
}

function World() {
  return (
    <>
      <ambientLight intensity={0.65} />

      <directionalLight
        position={[30, 40, 20]}
        intensity={2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <Sky
        distance={450000}
        sunPosition={[100, 30, 100]}
        inclination={0.5}
        azimuth={0.25}
      />

      <fog attach="fog" args={["#b8d5d5", 45, 150]} />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        position={[0, -0.03, 0]}
      >
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial color="#547b4b" roughness={1} />
      </mesh>

      {/* الطرق */}
      <mesh
        position={[0, 0.025, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[9, 300]} />
        <meshStandardMaterial color="#343a3c" roughness={0.95} />
      </mesh>

      <mesh
        position={[0, 0.03, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[300, 9]} />
        <meshStandardMaterial color="#343a3c" roughness={0.95} />
      </mesh>

      {/* المباني */}
      <Building position={[12, 0, -12]} height={8} color="#c5b79c" />
      <Building position={[-13, 0, -13]} height={6} color="#d1c7b5" />
      <Building position={[13, 0, 13]} height={10} color="#b8c5c5" />
      <Building position={[-13, 0, 13]} height={7} color="#c6b6a4" />

      {/* المياه */}
      <mesh
        position={[35, 0.08, -25]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[13, 48]} />
        <meshStandardMaterial
          color="#087b9a"
          roughness={0.25}
          metalness={0.15}
        />
      </mesh>

      {/* الأشجار */}
      {TREE_POSITIONS.map((tree, index) => (
        <Tree
          key={index}
          position={tree.position}
          scale={tree.scale}
        />
      ))}
    </>
  );
}

/* التحكم في حركة اللاعب */
function PlayerController({ joystick, onPositionChange }) {
  const keys = useRef({});
  const velocity = useRef(new THREE.Vector3());

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

    velocity.current.set(0, 0, 0);

    velocity.current.addScaledVector(forward, forwardInput);
    velocity.current.addScaledVector(right, sideInput);

    if (velocity.current.lengthSq() > 1) {
      velocity.current.normalize();
    }

    const speed = 7;

    camera.position.addScaledVector(
      velocity.current,
      speed * Math.min(delta, 0.05)
    );

    camera.position.y = 1.7;

    onPositionChange({
      x: Math.round(camera.position.x),
      z: Math.round(camera.position.z)
    });
  });

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

  return null;
}

/* تحكم الكاميرا بالسحب على الهاتف */
function CameraTouchControl({ cameraRef, active }) {
  const touch = useRef(null);

  const sensitivity = 0.004;

  const handleDown = (event) => {
    if (!active) return;

    touch.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleMove = (event) => {
    if (!touch.current || !cameraRef.current) return;
    if (touch.current.id !== event.pointerId) return;

    const dx = event.clientX - touch.current.x;
    const dy = event.clientY - touch.current.y;

    touch.current.x = event.clientX;
    touch.current.y = event.clientY;

    const camera = cameraRef.current;

    camera.rotation.order = "YXZ";

    camera.rotation.y -= dx * sensitivity;
    camera.rotation.x -= dy * sensitivity;

    camera.rotation.x = THREE.MathUtils.clamp(
      camera.rotation.x,
      -Math.PI / 2 + 0.05,
      Math.PI / 2 - 0.05
    );
  };

  const handleUp = (event) => {
    if (touch.current?.id === event.pointerId) {
      touch.current = null;
    }
  };

  if (!active) return null;

  return (
    <div
      className="camera-touch-area"
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
    />
  );
}

/* عصا التحكم */
function MobileJoystick({ onChange }) {
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const activePointer = useRef(null);
  const baseRef = useRef(null);

  const updateJoystick = (event) => {
    if (!baseRef.current) return;

    const rect = baseRef.current.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const maxDistance = rect.width * 0.32;

    let dx = event.clientX - centerX;
    let dy = event.clientY - centerY;

    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > maxDistance) {
      dx = (dx / distance) * maxDistance;
      dy = (dy / distance) * maxDistance;
    }

    const x = dx / maxDistance;
    const y = dy / maxDistance;

    setKnob({ x: dx, y: dy });
    onChange({ x, y });
  };

  const handleDown = (event) => {
    activePointer.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateJoystick(event);
  };

  const handleMove = (event) => {
    if (activePointer.current !== event.pointerId) return;
    updateJoystick(event);
  };

  const handleUp = (event) => {
    if (activePointer.current !== event.pointerId) return;

    activePointer.current = null;
    setKnob({ x: 0, y: 0 });
    onChange({ x: 0, y: 0 });
  };

  return (
    <div
      ref={baseRef}
      className="mobile-joystick"
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={handleUp}
      onPointerCancel={handleUp}
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
  const [position, setPosition] = useState({ x: 0, z: 8 });
  const [showHelp, setShowHelp] = useState(true);
  const [mobile, setMobile] = useState(isMobileDevice);
  const [joystick, setJoystick] = useState({ x: 0, y: 0 });

  const cameraRef = useRef(null);

  useEffect(() => {
    const updateDevice = () => setMobile(isMobileDevice());

    window.addEventListener("resize", updateDevice);

    return () => window.removeEventListener("resize", updateDevice);
  }, []);

  return (
    <div className="game-screen">
      <Canvas
        shadows
        camera={{
          position: [0, 1.7, 8],
          fov: 75,
          near: 0.1,
          far: 300
        }}
        dpr={[1, 1.5]}
        onCreated={({ camera }) => {
          cameraRef.current = camera;
          camera.rotation.order = "YXZ";
        }}
      >
        <World />

        <PlayerController
          joystick={joystick}
          onPositionChange={setPosition}
        />

        {!mobile && <PointerLockControls />}
      </Canvas>

      {mobile && (
        <>
          <CameraTouchControl
            cameraRef={cameraRef}
            active={!showHelp}
          />

          {!showHelp && (
            <MobileJoystick onChange={setJoystick} />
          )}
        </>
      )}

      <div className="game-topbar">
        <div className="game-logo">THE EARTH</div>

        <div className="game-coordinates">
          X: {position.x} | Z: {position.z}
        </div>

        <button onClick={() => setShowHelp(!showHelp)}>
          ?
        </button>
      </div>

      {showHelp && (
        <div className="game-help">
          <strong>مرحبًا بك في العالم</strong>

          {mobile ? (
            <>
              <p>استخدم العصا أسفل اليسار للتحرك.</p>
              <p>اسحب إصبعك على الشاشة لتغيير اتجاه النظر.</p>
            </>
          ) : (
            <>
              <p>W A S D للتحرك.</p>
              <p>حرّك الماوس لتغيير اتجاه النظر.</p>
              <p>اضغط على الشاشة لتفعيل التحكم بالماوس.</p>
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

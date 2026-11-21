import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sky, PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import "./game.css";

function Tree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.16, 0.23, 2, 8]} />
        <meshStandardMaterial color="#60452d" />
      </mesh>

      <mesh position={[0, 2.35, 0]}>
        <coneGeometry args={[1.05, 2.4, 8]} />
        <meshStandardMaterial color="#245c38" roughness={1} />
      </mesh>

      <mesh position={[0, 3.1, 0]}>
        <coneGeometry args={[0.72, 1.8, 8]} />
        <meshStandardMaterial color="#327447" roughness={1} />
      </mesh>
    </group>
  );
}

function Building({ position, color = "#c8b9a0", height = 5 }) {
  return (
    <group position={position}>
      <mesh position={[0, height / 2, 0]}>
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

function World() {
  const trees = useMemo(() => {
    const result = [];

    for (let x = -35; x <= 35; x += 7) {
      for (let z = -35; z <= 35; z += 7) {
        const nearRoad = Math.abs(x) < 7 || Math.abs(z) < 7;

        const seed = Math.abs(
          Math.sin(x * 12.9898 + z * 78.233) * 43758.5453
        ) % 1;

        if (!nearRoad && seed > 0.35) {
          result.push({
            position: [x, 0, z],
            scale: 0.8 + (result.length % 4) * 0.1
          });
        }
      }
    }

    return result;
  }, []);

  return (
    <>
      <ambientLight intensity={0.55} />

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

      <fog attach="fog" args={["#b8d5d5", 45, 120]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#547b4b" roughness={1} />
      </mesh>

      <mesh
        position={[0, 0.025, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[9, 200]} />
        <meshStandardMaterial color="#343a3c" roughness={0.95} />
      </mesh>

      <mesh
        position={[0, 0.03, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[200, 9]} />
        <meshStandardMaterial color="#343a3c" roughness={0.95} />
      </mesh>

      <Building position={[12, 0, -12]} height={8} color="#c5b79c" />
      <Building position={[-13, 0, -13]} height={6} color="#d1c7b5" />
      <Building position={[13, 0, 13]} height={10} color="#b8c5c5" />
      <Building position={[-13, 0, 13]} height={7} color="#c6b6a4" />

      <mesh
        position={[35, 0.08, -25]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[13, 48]} />
        <meshStandardMaterial
          color="#287f9a"
          roughness={0.2}
          metalness={0.25}
        />
      </mesh>

      {trees.map((tree, index) => (
        <Tree
          key={index}
          position={tree.position}
          scale={tree.scale}
        />
      ))}
    </>
  );
}

function PlayerController({
  onPositionChange,
  mobileInput,
  enabled
}) {
  const keys = useRef({});
  const lastPosition = useRef({ x: 0, z: 8 });

  useEffect(() => {
    const down = (event) => {
      if (
        ["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.code)
      ) {
        event.preventDefault();
        keys.current[event.code] = true;
      }
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
    if (!enabled) return;

    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();

    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    right.crossVectors(forward, camera.up).normalize();

    const movement = new THREE.Vector3(0, 0, 0);

    if (keys.current.KeyW || keys.current.ArrowUp) {
      movement.add(forward);
    }

    if (keys.current.KeyS || keys.current.ArrowDown) {
      movement.sub(forward);
    }

    if (keys.current.KeyD || keys.current.ArrowRight) {
      movement.sub(right);
    }

    if (keys.current.KeyA || keys.current.ArrowLeft) {
      movement.add(right);
    }

    movement.x += mobileInput.x;
    movement.z += mobileInput.y;

    if (movement.lengthSq() > 0) {
      movement.normalize();

      camera.position.addScaledVector(
        movement,
        7 * Math.min(delta, 0.05)
      );
    }

    camera.position.y = 1.7;

    const current = {
      x: Math.round(camera.position.x),
      z: Math.round(camera.position.z)
    };

    if (
      current.x !== lastPosition.current.x ||
      current.z !== lastPosition.current.z
    ) {
      lastPosition.current = current;
      onPositionChange(current);
    }
  });

  return null;
}

function MobileJoystick({ onMove }) {
  const [active, setActive] = useState(false);
  const [stick, setStick] = useState({ x: 0, y: 0 });
  const origin = useRef(null);

  const update = (event) => {
    if (!origin.current) return;

    const dx = event.clientX - origin.current.x;
    const dy = event.clientY - origin.current.y;

    const distance = Math.min(45, Math.hypot(dx, dy));
    const angle = Math.atan2(dy, dx);

    const x = Math.cos(angle) * distance / 45;
    const y = Math.sin(angle) * distance / 45;

    setStick({ x, y });
    onMove({ x, y });
  };

  const stop = () => {
    origin.current = null;
    setActive(false);
    setStick({ x: 0, y: 0 });
    onMove({ x: 0, y: 0 });
  };

  return (
    <div
      className="mobile-joystick"
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        origin.current = {
          x: event.clientX,
          y: event.clientY
        };
        setActive(true);
        update(event);
      }}
      onPointerMove={(event) => {
        if (active) update(event);
      }}
      onPointerUp={stop}
      onPointerCancel={stop}
    >
      <div className="joystick-base">
        <div
          className="joystick-knob"
          style={{
            transform: `translate(${stick.x * 25}px, ${stick.y * 25}px)`
          }}
        />
      </div>
    </div>
  );
}

export default function Game() {
  const [position, setPosition] = useState({ x: 0, z: 8 });
  const [showHelp, setShowHelp] = useState(true);
  const [started, setStarted] = useState(false);
  const [mobileInput, setMobileInput] = useState({ x: 0, y: 0 });

  const isMobile = useMemo(
    () => window.matchMedia("(pointer: coarse)").matches,
    []
  );

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
      >
        <World />

        <PlayerController
          onPositionChange={setPosition}
          mobileInput={mobileInput}
          enabled={started}
        />

        {!isMobile && started && <PointerLockControls />}
      </Canvas>

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
          <p>أنت الآن في مرحلة التأسيس.</p>
          <p>اضغط دخول العالم لبدء التجربة.</p>

          {!isMobile && (
            <>
              <p>W A S D للتحرك</p>
              <p>حرّك الماوس لتغيير اتجاه النظر.</p>
            </>
          )}

          {isMobile && (
            <p>استخدم عصا التحكم للتحرك.</p>
          )}

          <button
            onClick={() => {
              setStarted(true);
              setShowHelp(false);
            }}
          >
            دخول العالم
          </button>
        </div>
      )}

      {started && isMobile && (
        <MobileJoystick onMove={setMobileInput} />
      )}

      <div className="game-bottom">
        <span>WORLD PROTOTYPE</span>
        <span>EXPLORATION MODE</span>
      </div>
    </div>
  );
}

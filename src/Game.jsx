import React, { useRef, useState } from "react";
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

function PlayerController({ onPositionChange }) {
  const keys = useRef({});
  const velocity = useRef(new THREE.Vector3());
  const [direction, setDirection] = useState(0);

  React.useEffect(() => {
    const down = (e) => {
      keys.current[e.code] = true;
    };

    const up = (e) => {
      keys.current[e.code] = false;
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame(({ camera }, delta) => {
    const speed = 8;
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();

    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    right.crossVectors(forward, camera.up).normalize();

    velocity.current.set(0, 0, 0);

    if (keys.current.KeyW || keys.current.ArrowUp) {
      velocity.current.add(forward);
    }

    if (keys.current.KeyS || keys.current.ArrowDown) {
      velocity.current.sub(forward);
    }

    if (keys.current.KeyD || keys.current.ArrowRight) {
      velocity.current.sub(right);
    }

    if (keys.current.KeyA || keys.current.ArrowLeft) {
      velocity.current.add(right);
    }

    if (velocity.current.lengthSq() > 0) {
      velocity.current.normalize();
      camera.position.addScaledVector(
        velocity.current,
        speed * Math.min(delta, 0.05)
      );
    }

    camera.position.y = 1.7;

    if (onPositionChange) {
      onPositionChange({
        x: Math.round(camera.position.x),
        z: Math.round(camera.position.z)
      });
    }
  });

  return null;
}

function World() {
  const trees = [];

  for (let x = -35; x <= 35; x += 7) {
    for (let z = -35; z <= 35; z += 7) {
      const nearRoad = Math.abs(x) < 7 || Math.abs(z) < 7;

      if (!nearRoad && Math.random() > 0.35) {
        trees.push([x, 0, z]);
      }
    }
  }

  return (
    <>
      <ambientLight intensity={0.55} />

      <directionalLight
        position={[30, 40, 20]}
        intensity={2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
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

      {/* Main road */}
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

      {/* Buildings */}
      <Building position={[12, 0, -12]} height={8} color="#c5b79c" />
      <Building position={[-13, 0, -13]} height={6} color="#d1c7b5" />
      <Building position={[13, 0, 13]} height={10} color="#b8c5c5" />
      <Building position={[-13, 0, 13]} height={7} color="#c6b6a4" />

      {/* Water area */}
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

      {trees.map((position, index) => (
        <Tree key={index} position={position} scale={0.8 + (index % 4) * 0.1} />
      ))}
    </>
  );
}

export default function Game() {
  const [position, setPosition] = useState({ x: 0, z: 0 });
  const [showHelp, setShowHelp] = useState(true);

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
        <PlayerController onPositionChange={setPosition} />
        <PointerLockControls />
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
          <p>W A S D للتحرك</p>
          <p>حرّك الماوس لتغيير اتجاه النظر</p>
          <p>اضغط على الشاشة لبدء التحكم بالماوس</p>
          <button onClick={() => setShowHelp(false)}>
            فهمت
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

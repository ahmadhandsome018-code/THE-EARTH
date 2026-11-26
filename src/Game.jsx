import React, { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sky, PointerLockControls } from "@react-three/drei";
import * as THREE from "three";
import "./game.css";

/* THE EARTH – starter district revision */
const CHUNK_SIZE = 80;
const VIEW_DISTANCE = 2;
const BUILDING_VIEW_DISTANCE = 1;
const PLAYER_HEIGHT = 1.7;
const PLAYER_RADIUS = 0.42;
const WALK_SPEED = 5.2;
const RUN_SPEED = 8.0;
const ACCELERATION = 16;
const FRICTION = 11;
const LOOK_SENSITIVITY = 0.003;
const ROAD_SPACING = CHUNK_SIZE;
const ROAD_WIDTH = 12;
const SIDEWALK_WIDTH = 2.4;
const SIDEWALK_OFFSET = ROAD_WIDTH / 2 + SIDEWALK_WIDTH / 2;
const PARK_CHUNK = { x: 1, z: 1 };
const WATER = { x: 120, z: 120, radius: 17, shoreRadius: 23, xScale: 1.3 };
const START_POSITION = new THREE.Vector3(0, PLAYER_HEIGHT, 14);
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

function ellipseDistance(x, z, cx, cz) {
  return Math.hypot((x - cx) / WATER.xScale, z - cz);
}

function isRoadArea(x, z) {
  const roadX = Math.abs(
    x - Math.round(x / ROAD_SPACING) * ROAD_SPACING
  );

  const roadZ = Math.abs(
    z - Math.round(z / ROAD_SPACING) * ROAD_SPACING
  );

  return (
    roadX < ROAD_WIDTH / 2 + SIDEWALK_WIDTH + 1 ||
    roadZ < ROAD_WIDTH / 2 + SIDEWALK_WIDTH + 1
  );
}

function isWaterArea(x, z) {
  return (
    ellipseDistance(x, z, WATER.x, WATER.z) <
    WATER.shoreRadius + 4
  );
}

function makeBuilding(cx, cz, ix, iz) {
  const baseX = cx * CHUNK_SIZE;
  const baseZ = cz * CHUNK_SIZE;

  const seedX = cx * 17 + ix;
  const seedZ = cz * 19 + iz;

  const width =
    12 + Math.round(hash(seedX, seedZ, 1) * 3);

  const depth =
    12 + Math.round(hash(seedX, seedZ, 2) * 4);

  const height =
    8 + Math.round(hash(seedX, seedZ, 3) * 13);

  const palette = [
    "#c8c1b2",
    "#b8c2be",
    "#c7b7a4",
    "#b9b3a6",
    "#aeb9b8",
    "#c8c9c2"
  ];

  const color =
    palette[
      Math.floor(hash(seedX, seedZ, 4) * palette.length)
    ];

  return {
    type: "building",
    id: `building-${cx}-${cz}-${ix}-${iz}`,
    x: baseX + (ix === 0 ? 22 : 58),
    z: baseZ + (iz === 0 ? 22 : 58),
    width,
    depth,
    height,
    color,
    style: Math.floor(hash(seedX, seedZ, 5) * 3)
  };
}

/* Each 80m city block has four planned plots and a landscaped inner courtyard.
   The park block (1,1) is reserved for the lake and walking paths. */

function createChunk(cx, cz) {
  const objects = [];
  const isParkBlock =
    cx === PARK_CHUNK.x && cz === PARK_CHUNK.z;

  if (!isParkBlock) {
    for (let ix = 0; ix < 2; ix++) {
      for (let iz = 0; iz < 2; iz++) {
        objects.push(makeBuilding(cx, cz, ix, iz));
      }
    }

    // Deliberately planted trees in the open courtyard.
    const centerX = cx * CHUNK_SIZE + CHUNK_SIZE / 2;
    const centerZ = cz * CHUNK_SIZE + CHUNK_SIZE / 2;

    const grove = [
      [-7, -6],
      [7, -6],
      [-7, 6],
      [7, 6],
      [0, 0]
    ];

    grove.forEach(([ox, oz], index) => {
      const x = centerX + ox;
      const z = centerZ + oz;

      if (!isRoadArea(x, z) && !isWaterArea(x, z)) {
        objects.push({
          type: "tree",
          x,
          z,
          scale: 0.9 + hash(cx, cz, index + 11) * 0.25
        });
      }
    });
  } else {
    // Lakeside park trees.
    const parkTrees = [
      [88, 91],
      [96, 84],
      [110, 86],
      [137, 88],
      [150, 96],
      [91, 119],
      [91, 139],
      [111, 153],
      [137, 150],
      [151, 132],
      [151, 111],
      [132, 88],
      [105, 145],
      [145, 145]
    ];

    parkTrees.forEach(([x, z], index) => {
      if (!isWaterArea(x, z) && !isRoadArea(x, z)) {
        objects.push({
          type: "tree",
          x,
          z,
          scale: 0.95 + hash(cx, cz, index + 30) * 0.3
        });
      }
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

/* Collision shapes use the same data used to draw each building. */

function getNearbyObstacles(x, z) {
  const result = [];
  const searchRadius = 14;

  const minX = Math.floor(
    (x - searchRadius) / CHUNK_SIZE
  );

  const maxX = Math.floor(
    (x + searchRadius) / CHUNK_SIZE
  );

  const minZ = Math.floor(
    (z - searchRadius) / CHUNK_SIZE
  );

  const maxZ = Math.floor(
    (z + searchRadius) / CHUNK_SIZE
  );

  for (let cx = minX; cx <= maxX; cx++) {
    for (let cz = minZ; cz <= maxZ; cz++) {
      for (const object of getChunkObjects(cx, cz)) {
        if (object.type === "building") {
          result.push({
            type: "building",
            x: object.x,
            z: object.z,
            halfWidth: object.width / 2,
            halfDepth: object.depth / 2
          });
        } else if (object.type === "tree") {
          result.push({
            type: "tree",
            x: object.x,
            z: object.z,
            radius: 0.82 * object.scale
          });
        }
      }
    }
  }

  return result;
}

function collidesWithNearby(x, z) {
  for (const obstacle of getNearbyObstacles(x, z)) {
    if (obstacle.type === "building") {
      const closestX = THREE.MathUtils.clamp(
        x,
        obstacle.x - obstacle.halfWidth,
        obstacle.x + obstacle.halfWidth
      );

      const closestZ = THREE.MathUtils.clamp(
        z,
        obstacle.z - obstacle.halfDepth,
        obstacle.z + obstacle.halfDepth
      );

      const dx = x - closestX;
      const dz = z - closestZ;

      if (
        dx * dx + dz * dz <
        PLAYER_RADIUS * PLAYER_RADIUS
      ) {
        return true;
      }
    } else {
      const dx = x - obstacle.x;
      const dz = z - obstacle.z;

      if (
        dx * dx + dz * dz <
        (obstacle.radius + PLAYER_RADIUS) ** 2
      ) {
        return true;
      }
    }
  }

  return false;
}

/* Shared facade texture. */

function createFacadeTexture() {
  if (typeof document === "undefined") return null;

  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;

  const context = canvas.getContext("2d");

  context.fillStyle = "#d6d0c4";
  context.fillRect(0, 0, 256, 256);

  context.fillStyle = "#a9a69e";
  context.fillRect(0, 0, 256, 12);
  context.fillRect(0, 244, 256, 12);

  const columns = 4;
  const rows = 5;
  const cellW = 256 / columns;
  const cellH = 232 / rows;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const x = col * cellW + 13;
      const y = row * cellH + 11;

      context.fillStyle = "#788f96";
      context.fillRect(
        x,
        y,
        cellW - 26,
        cellH - 18
      );

      context.fillStyle = "rgba(221,238,235,0.55)";
      context.fillRect(
        x + 4,
        y + 4,
        3,
        cellH - 27
      );

      context.fillStyle = "#e9e3d8";
      context.fillRect(
        x - 2,
        y + cellH - 21,
        cellW - 22,
        4
      );
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  return texture;
}

const FACADE_TEXTURE = createFacadeTexture();

/* Trees are instanced per chunk. */

function Trees({ objects }) {
  const trunks = useRef(null);
  const leavesA = useRef(null);
  const leavesB = useRef(null);

  const trees = useMemo(
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

    trees.forEach((tree, index) => {
      dummy.position.set(
        tree.x,
        1.05 * tree.scale,
        tree.z
      );

      dummy.scale.setScalar(tree.scale);
      dummy.updateMatrix();

      trunks.current.setMatrixAt(index, dummy.matrix);

      dummy.position.set(
        tree.x,
        2.35 * tree.scale,
        tree.z
      );

      dummy.updateMatrix();
      leavesA.current.setMatrixAt(index, dummy.matrix);

      dummy.position.set(
        tree.x,
        3.15 * tree.scale,
        tree.z
      );

      dummy.scale.setScalar(tree.scale * 0.82);
      dummy.updateMatrix();

      leavesB.current.setMatrixAt(index, dummy.matrix);
    });

    trunks.current.instanceMatrix.needsUpdate = true;
    leavesA.current.instanceMatrix.needsUpdate = true;
    leavesB.current.instanceMatrix.needsUpdate = true;

    trunks.current.computeBoundingSphere();
    leavesA.current.computeBoundingSphere();
    leavesB.current.computeBoundingSphere();
  }, [trees]);

  if (!trees.length) return null;

  return (
    <>
      <instancedMesh
        ref={trunks}
        args={[undefined, undefined, trees.length]}
        frustumCulled={false}
      >
        <cylinderGeometry args={[0.13, 0.19, 2.1, 7]} />
        <meshStandardMaterial
          color="#59412e"
          roughness={1}
        />
      </instancedMesh>

      <instancedMesh
        ref={leavesA}
        args={[undefined, undefined, trees.length]}
        frustumCulled={false}
      >
        <coneGeometry args={[1.05, 2.3, 7]} />
        <meshStandardMaterial
          color="#285c39"
          roughness={0.95}
        />
      </instancedMesh>

      <instancedMesh
        ref={leavesB}
        args={[undefined, undefined, trees.length]}
        frustumCulled={false}
      >
        <coneGeometry args={[0.78, 1.8, 7]} />
        <meshStandardMaterial
          color="#39764a"
          roughness={0.95}
        />
      </instancedMesh>
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

function NatureWorld({ center }) {
  const chunks = useMemo(() => {
    const result = [];

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
        <NatureChunk
          key={`nature-${cx}-${cz}`}
          cx={cx}
          cz={cz}
        />
      ))}
    </>
  );
}

/* Buildings with visible windows, base and roof edge. */

function Building({ building }) {
  const {
    x,
    z,
    width,
    depth,
    height,
    color,
    style
  } = building;

  const windowColor =
    style === 1
      ? "#425f69"
      : style === 2
      ? "#657f83"
      : "#526e78";

  return (
    <group position={[x, 0, z]}>
      <mesh
        position={[0, height / 2, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          map={FACADE_TEXTURE || undefined}
          color={color}
          roughness={0.88}
        />
      </mesh>

      <mesh position={[0, 0.28, 0]}>
        <boxGeometry
          args={[
            width + 0.25,
            0.45,
            depth + 0.25
          ]}
        />
        <meshStandardMaterial
          color="#8d8d83"
          roughness={1}
        />
      </mesh>

      <mesh
        position={[0, height + 0.16, 0]}
        castShadow
      >
        <boxGeometry
          args={[
            width + 0.55,
            0.32,
            depth + 0.55
          ]}
        />
        <meshStandardMaterial
          color={
            style === 2
              ? "#777d7b"
              : "#a8a69e"
          }
          roughness={0.9}
        />
      </mesh>

      <mesh position={[0, 1.15, -depth / 2 - 0.065]}>
        <boxGeometry args={[1.65, 2.3, 0.12]} />
        <meshStandardMaterial
          color={windowColor}
          roughness={0.28}
          metalness={0.12}
        />
      </mesh>

      <mesh position={[0, 2.42, -depth / 2 - 0.2]}>
        <boxGeometry args={[2.35, 0.16, 0.48]} />
        <meshStandardMaterial
          color="#a69e8d"
          roughness={0.85}
        />
      </mesh>
    </group>
  );
}

function BuildingChunk({ cx, cz }) {
  const buildings = useMemo(
    () =>
      getChunkObjects(cx, cz).filter(
        (item) => item.type === "building"
      ),
    [cx, cz]
  );

  return (
    <>
      {buildings.map((building) => (
        <Building
          key={building.id}
          building={building}
        />
      ))}
    </>
  );
}

function BuildingWorld({ center }) {
  const chunks = useMemo(() => {
    const result = [];

    for (
      let x = -BUILDING_VIEW_DISTANCE;
      x <= BUILDING_VIEW_DISTANCE;
      x++
    ) {
      for (
        let z = -BUILDING_VIEW_DISTANCE;
        z <= BUILDING_VIEW_DISTANCE;
        z++
      ) {
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
        <BuildingChunk
          key={`buildings-${cx}-${cz}`}
          cx={cx}
          cz={cz}
        />
      ))}
    </>
  );
}

/* Roads, sidewalks and markings. */

function RoadTile({ cx, cz }) {
  const minX = cx * CHUNK_SIZE;
  const minZ = cz * CHUNK_SIZE;
  const sideOffset = SIDEWALK_OFFSET;

  const dashPositions = Array.from(
    { length: 7 },
    (_, index) => minZ + 7 + index * 11
  );

  const dashPositionsX = Array.from(
    { length: 7 },
    (_, index) => minX + 7 + index * 11
  );

  return (
    <group>
      <mesh
        position={[
          minX,
          0.035,
          minZ + CHUNK_SIZE / 2
        ]}
      >
        <boxGeometry
          args={[ROAD_WIDTH, 0.09, CHUNK_SIZE]}
        />
        <meshStandardMaterial
          color="#303635"
          roughness={0.98}
        />
      </mesh>

      <mesh
        position={[
          minX + CHUNK_SIZE / 2,
          0.035,
          minZ
        ]}
      >
        <boxGeometry
          args={[CHUNK_SIZE, 0.09, ROAD_WIDTH]}
        />
        <meshStandardMaterial
          color="#303635"
          roughness={0.98}
        />
      </mesh>

      {[-1, 1].map((side) => (
        <React.Fragment key={`side-${side}`}>
          <mesh
            position={[
              minX + side * sideOffset,
              0.07,
              minZ + CHUNK_SIZE / 2
            ]}
          >
            <boxGeometry
              args={[
                SIDEWALK_WIDTH,
                0.16,
                CHUNK_SIZE
              ]}
            />
            <meshStandardMaterial
              color="#a7a69d"
              roughness={1}
            />
          </mesh>

          <mesh
            position={[
              minX + CHUNK_SIZE / 2,
              0.07,
              minZ + side * sideOffset
            ]}
          >
            <boxGeometry
              args={[
                CHUNK_SIZE,
                0.16,
                SIDEWALK_WIDTH
              ]}
            />
            <meshStandardMaterial
              color="#a7a69d"
              roughness={1}
            />
          </mesh>
        </React.Fragment>
      ))}

      {dashPositions.map((z) => (
        <mesh
          key={`dash-v-${z}`}
          position={[minX, 0.087, z]}
        >
          <boxGeometry args={[0.16, 0.015, 4.2]} />
          <meshBasicMaterial color="#d8d6c8" />
        </mesh>
      ))}

      {dashPositionsX.map((x) => (
        <mesh
          key={`dash-h-${x}`}
          position={[x, 0.087, minZ]}
        >
          <boxGeometry args={[4.2, 0.015, 0.16]} />
          <meshBasicMaterial color="#d8d6c8" />
        </mesh>
      ))}
    </group>
  );
}

function RoadNetwork({ center }) {
  const tiles = useMemo(() => {
    const result = [];

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
      {tiles.map(({ cx, cz }) => (
        <RoadTile
          key={`road-${cx}-${cz}`}
          cx={cx}
          cz={cz}
        />
      ))}
    </>
  );
}

/* Park lake. */

function Water() {
  return (
    <group
      position={[WATER.x, 0, WATER.z]}
      scale={[WATER.xScale, 1, 1]}
    >
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.012, 0]}
      >
        <circleGeometry
          args={[WATER.shoreRadius, 72]}
        />
        <meshStandardMaterial
          color="#b9ad8d"
          roughness={1}
        />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.035, 0]}
      >
        <circleGeometry
          args={[WATER.radius, 72]}
        />
        <meshPhysicalMaterial
          color="#17647a"
          roughness={0.19}
          metalness={0.08}
          clearcoat={0.85}
          clearcoatRoughness={0.18}
        />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.045, 0]}
      >
        <ringGeometry
          args={[
            WATER.radius - 0.35,
            WATER.radius - 0.12,
            72
          ]}
        />
        <meshBasicMaterial
          color="#8bb8b2"
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

function ParkPaths() {
  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[120, 0.025, 88]}
      >
        <planeGeometry args={[5, 31]} />
        <meshStandardMaterial
          color="#c4bda9"
          roughness={1}
        />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[120, 0.025, 152]}
      >
        <planeGeometry args={[5, 16]} />
        <meshStandardMaterial
          color="#c4bda9"
          roughness={1}
        />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[91, 0.025, 120]}
      >
        <planeGeometry args={[18, 4]} />
        <meshStandardMaterial
          color="#c4bda9"
          roughness={1}
        />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[149, 0.025, 120]}
      >
        <planeGeometry args={[18, 4]} />
        <meshStandardMaterial
          color="#c4bda9"
          roughness={1}
        />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[120, 0.035, 82]}
      >
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial
          color="#c4bda9"
          roughness={1}
        />
      </mesh>
    </group>
  );
}

function GroundSystem({ center }) {
  const tiles = useMemo(() => {
    const result = [];

    for (
      let x = -VIEW_DISTANCE - 1;
      x <= VIEW_DISTANCE + 1;
      x++
    ) {
      for (
        let z = -VIEW_DISTANCE - 1;
        z <= VIEW_DISTANCE + 1;
        z++
      ) {
        result.push({
          x: center.x + x,
          z: center.z + z
        });
      }
    }

    return result;
  }, [center]);

  return (
    <group>
      {tiles.map(({ x, z }) => (
        <mesh
          key={`ground-${x}-${z}`}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[
            x * CHUNK_SIZE + CHUNK_SIZE / 2,
            -0.12,
            z * CHUNK_SIZE + CHUNK_SIZE / 2
          ]}
        >
          <planeGeometry
            args={[CHUNK_SIZE, CHUNK_SIZE]}
          />
          <meshStandardMaterial
            color="#58764a"
            roughness={1}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

function World({ center }) {
  return (
    <>
      <ambientLight intensity={0.72} />

      <hemisphereLight
        skyColor="#d9e9f2"
        groundColor="#59634b"
        intensity={0.55}
      />

      <directionalLight
        position={[70, 100, 35]}
        intensity={1.25}
        castShadow
        shadow-mapSize-width={768}
        shadow-mapSize-height={768}
        shadow-camera-near={1}
        shadow-camera-far={220}
      />

      <Sky
        distance={450000}
        sunPosition={[100, 35, 100]}
      />

      <fog
        attach="fog"
        args={["#a9c2c7", 240, 620]}
      />

      <GroundSystem center={center} />
      <RoadNetwork center={center} />
      <ParkPaths />
      <Water />
      <BuildingWorld center={center} />
      <NatureWorld center={center} />
    </>
  );
}

/* Player movement: horizontal collision, gravity, jump and grounded camera motion. */

function PlayerController({
  joystick,
  onChunkChange,
  cameraRef,
  jumpRequest
}) {
  const keys = useRef({});
  const velocity = useRef(new THREE.Vector3());
  const position = useRef(START_POSITION.clone());
  const forward = useRef(new THREE.Vector3());
  const right = useRef(new THREE.Vector3());
  const input = useRef(new THREE.Vector3());

  const verticalVelocity = useRef(0);
  const grounded = useRef(true);
  const bobPhase = useRef(0);
  const landingDip = useRef(0);

  useEffect(() => {
    const down = (event) => {
      if (
        [
          "Space",
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight"
        ].includes(event.code)
      ) {
        event.preventDefault();
      }

      if (
        event.code === "Space" &&
        !keys.current.Space
      ) {
        jumpRequest.current = true;
      }

      keys.current[event.code] = true;
    };

    const up = (event) => {
      keys.current[event.code] = false;
    };

    const clear = () => {
      keys.current = {};
    };

    window.addEventListener(
      "keydown",
      down,
      { passive: false }
    );

    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }, [jumpRequest]);

  useFrame(({ camera }, delta) => {
    const dt = Math.min(delta, 0.035);

    camera.getWorldDirection(forward.current);
    forward.current.y = 0;

    if (forward.current.lengthSq() > 0) {
      forward.current.normalize();
    }

    right.current.set(
      -forward.current.z,
      0,
      forward.current.x
    );

    let forwardInput = -joystick.y;
    let sideInput = joystick.x;

    if (
      keys.current.KeyW ||
      keys.current.ArrowUp
    ) {
      forwardInput += 1;
    }

    if (
      keys.current.KeyS ||
      keys.current.ArrowDown
    ) {
      forwardInput -= 1;
    }

    if (
      keys.current.KeyD ||
      keys.current.ArrowRight
    ) {
      sideInput += 1;
    }

    if (
      keys.current.KeyA ||
      keys.current.ArrowLeft
    ) {
      sideInput -= 1;
    }

    input.current
      .set(0, 0, 0)
      .addScaledVector(
        forward.current,
        forwardInput
      )
      .addScaledVector(
        right.current,
        sideInput
      );

    if (input.current.lengthSq() > 1) {
      input.current.normalize();
    }

    const running =
      keys.current.ShiftLeft ||
      keys.current.ShiftRight;

    const maxSpeed = running
      ? RUN_SPEED
      : WALK_SPEED;

    const hasInput =
      input.current.lengthSq() > 0.001;

    const targetX =
      input.current.x * maxSpeed;

    const targetZ =
      input.current.z * maxSpeed;

    velocity.current.x = THREE.MathUtils.damp(
      velocity.current.x,
      targetX,
      hasInput ? ACCELERATION : FRICTION,
      dt
    );

    velocity.current.z = THREE.MathUtils.damp(
      velocity.current.z,
      targetZ,
      hasInput ? ACCELERATION : FRICTION,
      dt
    );

    const current = position.current;

    const nextX =
      current.x + velocity.current.x * dt;

    const nextZ =
      current.z + velocity.current.z * dt;

    const insideWater = (x, z) =>
      ellipseDistance(
        x,
        z,
        WATER.x,
        WATER.z
      ) < WATER.radius - PLAYER_RADIUS;

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

    // Jump initiation.
    if (
      jumpRequest.current &&
      grounded.current
    ) {
      verticalVelocity.current = 7.1;
      grounded.current = false;
      jumpRequest.current = false;
    } else if (
      jumpRequest.current &&
      !grounded.current
    ) {
      jumpRequest.current = false;
    }

    // Gravity and landing.
    if (!grounded.current) {
      verticalVelocity.current -= 19.5 * dt;
      current.y += verticalVelocity.current * dt;

      if (current.y <= PLAYER_HEIGHT) {
        current.y = PLAYER_HEIGHT;
        verticalVelocity.current = 0;
        grounded.current = true;
        landingDip.current = 0.12;
      }
    }

    const horizontalSpeed = Math.hypot(
      velocity.current.x,
      velocity.current.z
    );

    if (
      grounded.current &&
      horizontalSpeed > 0.25
    ) {
      bobPhase.current += dt * (running ? 13 : 10);
    }

    const bob = grounded.current
      ? Math.sin(bobPhase.current) *
        Math.min(horizontalSpeed / RUN_SPEED, 1) *
        0.035
      : 0;

    landingDip.current = Math.max(
      0,
      landingDip.current - dt * 0.8
    );

    camera.position.set(
      current.x,
      current.y + bob - landingDip.current,
      current.z
    );

    cameraRef.current = camera;

    const cx = Math.floor(
      current.x / CHUNK_SIZE
    );

    const cz = Math.floor(
      current.z / CHUNK_SIZE
    );

    onChunkChange(cx, cz);
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
    if (
      !touch.current ||
      !cameraRef.current ||
      touch.current.id !== event.pointerId
    ) {
      return;
    }

    const dx =
      event.clientX - touch.current.x;

    const dy =
      event.clientY - touch.current.y;

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
    if (
      touch.current?.id === event.pointerId
    ) {
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
    if (!baseRef.current) return;

    const rect =
      baseRef.current.getBoundingClientRect();

    const max = rect.width * 0.32;

    let dx =
      event.clientX -
      (rect.left + rect.width / 2);

    let dy =
      event.clientY -
      (rect.top + rect.height / 2);

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
    if (pointer.current !== event.pointerId) {
      return;
    }

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
  const jumpRequest = useRef(false);

  const lastChunk = useRef({
    x: 0,
    z: 0
  });

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
          position: [0, PLAYER_HEIGHT, 14],
          fov: 70,
          near: 0.1,
          far: 650
        }}
        dpr={[1, 1.25]}
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
          jumpRequest={jumpRequest}
        />

        {!mobile && <PointerLockControls />}
      </Canvas>

      {mobile && (
        <>
          <MobileCameraLook
            cameraRef={cameraRef}
          />

          <MobileJoystick
            onChange={setJoystick}
          />

          <button
            className="jump-button"
            type="button"
            onClick={() => {
              jumpRequest.current = true;
            }}
            aria-label="Jump"
          >
            <span className="jump-arrow">↑</span>
            <span className="jump-label">قفز</span>
          </button>
        </>
      )}

      {!mobile && (
        <div className="desktop-hint">
          W A S D للحركة · Shift للجري · Space للقفز · حرّك الماوس للنظر
        </div>
      )}
    </div>
  );
}

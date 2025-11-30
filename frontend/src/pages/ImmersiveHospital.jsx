import React, { useMemo, useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, useGLTF } from '@react-three/drei';
import { useNavigate, useParams } from 'react-router-dom';

function RoomModel({ url, scale = 1, onClick }) {
  const gltf = useGLTF(url);
  return <primitive object={gltf.scene} scale={scale} onClick={onClick} />;
}

function RoomBox({ position, color = 'orange', name, id }) {
  const navigate = useNavigate();
  const [modelAvailable, setModelAvailable] = useState(false);
  // default model path: public/models/room.glb or public/models/{id}.glb
  const modelUrl = `/models/${id || 'room'}.glb`;

  useEffect(() => {
    let mounted = true;
    // Check if model exists (HEAD request). If not, fallback to box.
    fetch(modelUrl, { method: 'HEAD' })
      .then((res) => {
        if (mounted && res.ok) setModelAvailable(true);
      })
      .catch(() => {
        if (mounted) setModelAvailable(false);
      });
    return () => { mounted = false; };
  }, [modelUrl]);

  const handleClick = (e) => {
    e.stopPropagation();
    navigate(`/rooms/${id}`);
  };

  // If model exists, render it inside Suspense; otherwise render a simple box fallback
  return (
    <group position={position}>
      {modelAvailable ? (
        <Suspense fallback={(
          <mesh>
            <boxGeometry args={[2.4, 1.6, 2.4]} />
            <meshStandardMaterial color={color} />
          </mesh>
        )}>
          <RoomModel url={modelUrl} scale={1} onClick={handleClick} />
          <Html position={[0, 1.1, 0]} distanceFactor={6} center>
            <div style={{
              background: 'rgba(255,255,255,0.9)',
              padding: '6px 10px',
              borderRadius: 8,
              fontSize: 12,
              boxShadow: '0 8px 20px rgba(0,0,0,0.12)'
            }}>{name}</div>
          </Html>
        </Suspense>
      ) : (
        <mesh onClick={handleClick} castShadow receiveShadow>
          <boxGeometry args={[2.4, 1.6, 2.4]} />
          <meshStandardMaterial color={color} />
          <Html position={[0, 1.1, 0]} distanceFactor={6} center>
            <div style={{
              background: 'rgba(255,255,255,0.9)',
              padding: '6px 10px',
              borderRadius: 8,
              fontSize: 12,
              boxShadow: '0 8px 20px rgba(0,0,0,0.12)'
            }}>{name}</div>
          </Html>
        </mesh>
      )}
    </group>
  );
}

export default function ImmersiveHospital() {
  const params = useParams();
  const tenantId = params.tenantId || 'demo-hospital';

  // simple layout of rooms - in a real app you'd fetch floor plan and rooms
  const rooms = useMemo(() => [
    { id: `room-reception-${tenantId}`, name: 'Reception', pos: [-4, 0.8, 0], color: '#60A5FA' },
    { id: `room-opd-${tenantId}`, name: 'OPD', pos: [-1.2, 0.8, -0], color: '#34D399' },
    { id: `room-doctor-${tenantId}`, name: 'Doctor Room', pos: [1.8, 0.8, -0], color: '#F97316' },
    { id: `room-pharmacy-${tenantId}`, name: 'Pharmacy', pos: [4.3, 0.8, 0], color: '#A78BFA' },
  ], [tenantId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-3xl font-bold mb-4">Enter the Hospital (Immersive)</h2>
        <p className="text-gray-600 mb-6">Click any room to open its page. If a GLTF model is available in <code>/public/models</code> it will be used; otherwise a fallback box is shown.</p>

        <div style={{ height: 560, borderRadius: 12, overflow: 'hidden', boxShadow: '0 20px 50px rgba(2,6,23,0.08)' }}>
          <Canvas shadows camera={{ position: [0, 6, 10], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow />

            {/* floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[30, 20]} />
              <meshStandardMaterial color="#F8FAFC" />
            </mesh>

            {/* simple wall background */}
            <mesh position={[0, 2.2, -6]}>
              <boxGeometry args={[30, 6, 0.2]} />
              <meshStandardMaterial color="#EEF2FF" />
            </mesh>

            {rooms.map((r) => (
              <RoomBox key={r.id} id={r.id} name={r.name} position={r.pos} color={r.color} />
            ))}

            <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
          </Canvas>
        </div>

        <div className="mt-6 text-sm text-gray-500">Tip: use mouse/touch to orbit, zoom and pan. Click a room to open its page.</div>
      </div>
    </div>
  );
}

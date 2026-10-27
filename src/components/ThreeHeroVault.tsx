import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  ShieldCheck, 
  RotateCw, 
  Sparkles, 
  Maximize2,
  CheckCircle2,
  Lock,
  Layers
} from 'lucide-react';

interface ThreeHeroVaultProps {
  activeCount: number;
  totalDepositAmount: number;
}

export const ThreeHeroVault: React.FC<ThreeHeroVaultProps> = ({
  activeCount,
  totalDepositAmount
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [activeNodeIndex, setActiveNodeIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(true);

  const nodeLabels = [
    { title: 'AICTE Joint Lien', value: 'Mandatory Sec. 10(k)', color: '#009999' },
    { title: 'Scheduled Bank Escrow', value: 'SBI / PNB / Canara', color: '#008080' },
    { title: '8-Year Lock-in Term', value: 'Automated Maturity Alert', color: '#d97706' },
    { title: 'Biometric Dual Sanction', value: 'Supervisory Clearance', color: '#7c3aed' },
  ];

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Dimensions
    const width = container.clientWidth || 380;
    const height = container.clientHeight || 420;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // Group to contain all objects for global mouse tilt & rotation
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x009999, 3.5);
    dirLight1.position.set(5, 8, 6);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x40E0D0, 2.0);
    dirLight2.position.set(-6, -4, 4);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x00ffff, 3.0, 20);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // 1. Central Core: High-tech Security Vault Icosahedron
    const coreGeometry = new THREE.IcosahedronGeometry(1.2, 1);
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x009999,
      emissive: 0x003333,
      emissiveIntensity: 0.6,
      roughness: 0.12,
      metalness: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      wireframe: false,
    });
    const coreMesh = new THREE.Mesh(coreGeometry, coreMaterial);
    mainGroup.add(coreMesh);

    // Wireframe cage over the core
    const wireGeometry = new THREE.IcosahedronGeometry(1.24, 1);
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0x40E0D0,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const wireMesh = new THREE.Mesh(wireGeometry, wireMaterial);
    mainGroup.add(wireMesh);

    // 2. Gyroscopic Rotating Rings (Kochi Metro signature teal)
    const ring1Geo = new THREE.TorusGeometry(1.9, 0.035, 16, 100);
    const ring1Mat = new THREE.MeshStandardMaterial({
      color: 0x009999,
      metalness: 0.95,
      roughness: 0.1,
      emissive: 0x004444,
      emissiveIntensity: 0.5
    });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    ring1.rotation.x = Math.PI / 3;
    mainGroup.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(2.35, 0.025, 16, 100);
    const ring2Mat = new THREE.MeshStandardMaterial({
      color: 0x2dd4bf,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x003333,
      emissiveIntensity: 0.4
    });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.y = Math.PI / 4;
    mainGroup.add(ring2);

    const ring3Geo = new THREE.TorusGeometry(2.75, 0.02, 16, 100);
    const ring3Mat = new THREE.MeshStandardMaterial({
      color: 0x008080,
      metalness: 0.85,
      roughness: 0.25
    });
    const ring3 = new THREE.Mesh(ring3Geo, ring3Mat);
    ring3.rotation.x = -Math.PI / 4;
    ring3.rotation.z = Math.PI / 6;
    mainGroup.add(ring3);

    // 3. Orbiting Data Nodes
    const nodeGroup = new THREE.Group();
    mainGroup.add(nodeGroup);

    const nodesCount = 4;
    const nodes: THREE.Mesh[] = [];
    const nodeAngles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];

    for (let i = 0; i < nodesCount; i++) {
      const nodeGeo = new THREE.SphereGeometry(0.14, 16, 16);
      const nodeMat = new THREE.MeshStandardMaterial({
        color: i === 0 ? 0x009999 : i === 1 ? 0x2dd4bf : i === 2 ? 0xf59e0b : 0xa855f7,
        emissive: i === 0 ? 0x005555 : i === 1 ? 0x004444 : i === 2 ? 0x78350f : 0x581c87,
        emissiveIntensity: 0.8,
        metalness: 0.8,
        roughness: 0.2
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.x = Math.cos(nodeAngles[i]) * 2.35;
      nodeMesh.position.y = Math.sin(nodeAngles[i]) * 1.6;
      nodeMesh.position.z = Math.sin(nodeAngles[i] * 2) * 0.8;
      nodeGroup.add(nodeMesh);
      nodes.push(nodeMesh);
    }

    // 4. Ambient Constellation Particles
    const particleCount = 280;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleScales = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      const radius = 2.0 + Math.random() * 2.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);
      particleScales[i] = Math.random();
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x009999,
      size: 0.05,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    mainGroup.add(particleSystem);

    // Mouse Interaction Tracking
    let targetRotationX = 0;
    let targetRotationY = 0;
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      if (!isDragging) {
        targetRotationY = mouseX * 0.45;
        targetRotationX = -mouseY * 0.35;
      } else {
        const deltaX = e.clientX - previousMouseX;
        const deltaY = e.clientY - previousMouseY;
        mainGroup.rotation.y += deltaX * 0.01;
        mainGroup.rotation.x += deltaY * 0.01;
        previousMouseX = e.clientX;
        previousMouseY = e.clientY;
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth auto-rotation & mouse damping
      if (!isDragging) {
        mainGroup.rotation.y += (targetRotationY - mainGroup.rotation.y) * 0.05;
        mainGroup.rotation.x += (targetRotationX - mainGroup.rotation.x) * 0.05;
      }

      // Continuous ambient rotation
      coreMesh.rotation.y = elapsedTime * 0.25;
      coreMesh.rotation.x = elapsedTime * 0.15;
      wireMesh.rotation.y = -elapsedTime * 0.2;

      // Rings spin on dynamic axes
      ring1.rotation.z = elapsedTime * 0.3;
      ring2.rotation.x = -elapsedTime * 0.25;
      ring3.rotation.y = elapsedTime * 0.2;

      // Floating particles breathe
      particleSystem.rotation.y = -elapsedTime * 0.08;

      // Orbiting nodes position update
      nodes.forEach((node, i) => {
        const currentAngle = nodeAngles[i] + elapsedTime * 0.4;
        node.position.x = Math.cos(currentAngle) * 2.35;
        node.position.y = Math.sin(currentAngle) * 1.6;
        node.position.z = Math.sin(currentAngle * 1.5) * 0.9;
      });

      // Pulse lighting
      pointLight.intensity = 2.5 + Math.sin(elapsedTime * 2) * 0.8;

      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);

      // Dispose Three.js resources
      coreGeometry.dispose();
      coreMaterial.dispose();
      wireGeometry.dispose();
      wireMaterial.dispose();
      ring1Geo.dispose();
      ring1Mat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      ring3Geo.dispose();
      ring3Mat.dispose();
      particleGeo.dispose();
      particleMat.dispose();

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div 
      className="relative w-full max-w-md mx-auto min-h-[460px] sm:min-h-[480px] rounded-3xl bg-white border border-slate-200/90 shadow-sm p-5 flex flex-col justify-between overflow-hidden group select-none text-slate-900"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-teal-500/5 via-transparent to-transparent pointer-events-none" />

      {/* Top Header Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200/80 text-teal-700 flex items-center justify-center shadow-xs">
            <Lock className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <span className="text-xs font-heading font-bold text-slate-900 block leading-tight">
              3D Collateral Vault
            </span>
            <span className="text-[10px] text-teal-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
              WebGL Interactive
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-teal-50 text-teal-700 border border-teal-200/80">
            {activeCount} Active FDRs
          </span>
        </div>
      </div>

      {/* Three.js Canvas Container */}
      <div 
        ref={mountRef} 
        className="relative w-full h-[240px] sm:h-[260px] cursor-grab active:cursor-grabbing flex items-center justify-center my-auto touch-pan-y"
        title="Click & drag to rotate 3D vault in any direction"
      />

      {/* Interactive Bottom Control & Status Chips */}
      <div className="relative z-10 space-y-2 pt-1 border-t border-slate-200">
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <RotateCw className="w-3.5 h-3.5 text-teal-600 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Interactive 360° Drag & Hover</span>
          </div>
          <span className="font-mono font-bold text-slate-900">
            ₹{(totalDepositAmount / 10000000).toFixed(1)} Cr Collateral
          </span>
        </div>

        {/* Node quick selector */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          {nodeLabels.map((node, i) => (
            <button
              key={i}
              onClick={() => setActiveNodeIndex(i)}
              className={`px-2.5 py-1.5 rounded-xl text-left border text-[10px] transition flex items-center justify-between ${
                activeNodeIndex === i
                  ? 'bg-teal-50 border-teal-500/50 text-teal-800 font-bold shadow-xs'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div className="truncate mr-1">
                <span className="block font-heading truncate text-slate-900">{node.title}</span>
                <span className="block text-[9px] text-slate-500 font-mono truncate">{node.value}</span>
              </div>
              <span 
                className="w-1.5 h-1.5 rounded-full shrink-0" 
                style={{ backgroundColor: node.color }} 
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThreeHeroVault;

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCw, ShieldCheck, Sparkles, Award } from 'lucide-react';

interface ThreeStatutoryCoinProps {
  referenceNumber: string;
  institutionName: string;
  amount: number;
}

export const ThreeStatutoryCoin: React.FC<ThreeStatutoryCoinProps> = ({
  referenceNumber,
  institutionName,
  amount
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const autoRotateRef = useRef(autoRotate);
  autoRotateRef.current = autoRotate;

  const formatLakhs = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 260;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 5.2);

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.appendChild(renderer.domElement);

    // Coin Group
    const coinGroup = new THREE.Group();
    scene.add(coinGroup);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 3.0);
    keyLight.position.set(4, 5, 6);
    scene.add(keyLight);

    const tealRimLight = new THREE.DirectionalLight(0x009999, 4.0);
    tealRimLight.position.set(-5, -4, 3);
    scene.add(tealRimLight);

    const goldFillLight = new THREE.DirectionalLight(0xf59e0b, 2.5);
    goldFillLight.position.set(0, -5, -4);
    scene.add(goldFillLight);

    // Procedural texture for Coin Faces
    const createFaceTexture = (isFront: boolean) => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      if (!ctx) return new THREE.CanvasTexture(canvas);

      // Background metallic circle
      const bgGrad = ctx.createRadialGradient(256, 256, 50, 256, 256, 256);
      bgGrad.addColorStop(0, '#009999');
      bgGrad.addColorStop(0.7, '#006666');
      bgGrad.addColorStop(1, '#004d4d');
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.arc(256, 256, 250, 0, Math.PI * 2);
      ctx.fill();

      // Outer golden gear rim
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 14;
      ctx.stroke();

      ctx.strokeStyle = '#fcd34d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(256, 256, 235, 0, Math.PI * 2);
      ctx.stroke();

      // Circular text along rim
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px "Manrope", sans-serif';
      ctx.textAlign = 'center';

      if (isFront) {
        ctx.fillText('ALL INDIA COUNCIL FOR TECHNICAL EDUCATION', 256, 54);
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 15px "Inter", monospace';
        ctx.fillText('STATUTORY JOINT LIEN MANDATE', 256, 80);

        // Center emblem shield
        ctx.beginPath();
        ctx.arc(256, 256, 120, 0, Math.PI * 2);
        ctx.fillStyle = '#004d4d';
        ctx.fill();
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 6;
        ctx.stroke();

        // Star / Seal Center
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 44px "Manrope", sans-serif';
        ctx.fillText('AICTE', 256, 245);
        ctx.font = 'bold 20px "Inter", sans-serif';
        ctx.fillStyle = '#6ee7b7';
        ctx.fillText('JOINT LIEN', 256, 280);

        ctx.fillStyle = '#ffffff';
        ctx.font = '14px "Inter", sans-serif';
        ctx.fillText('SEC. 10(k) STATUTE', 256, 450);
        ctx.fillText('OFFICIAL COLLATERAL', 256, 475);
      } else {
        ctx.fillText('SCHEDULED BANK COLLATERAL ESCROW', 256, 55);
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 14px "Inter", monospace';
        ctx.fillText('FINTRACK SECURE RECORD', 256, 82);

        // Center Box
        ctx.beginPath();
        ctx.arc(256, 256, 115, 0, Math.PI * 2);
        ctx.fillStyle = '#003333';
        ctx.fill();
        ctx.strokeStyle = '#2dd4bf';
        ctx.lineWidth = 4;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px "Inter", sans-serif';
        ctx.fillText('ESCROW VERIFIED', 256, 230);
        ctx.fillStyle = '#2dd4bf';
        ctx.font = 'bold 26px "Manrope", sans-serif';
        ctx.fillText('ACTIVE', 256, 265);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px "Inter", monospace';
        ctx.fillText(referenceNumber.slice(0, 16), 256, 295);

        ctx.fillStyle = '#fef08a';
        ctx.font = '14px "Inter", sans-serif';
        ctx.fillText('AUTHORIZED BY COMPETENT AUTHORITY', 256, 465);
      }

      return new THREE.CanvasTexture(canvas);
    };

    const frontTex = createFaceTexture(true);
    const backTex = createFaceTexture(false);

    // Materials
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      metalness: 0.95,
      roughness: 0.15,
      bumpScale: 0.05
    });

    const frontMaterial = new THREE.MeshStandardMaterial({
      map: frontTex,
      metalness: 0.75,
      roughness: 0.22,
    });

    const backMaterial = new THREE.MeshStandardMaterial({
      map: backTex,
      metalness: 0.75,
      roughness: 0.22,
    });

    // Coin Cylinder: materials [edge, front (top), back (bottom)]
    const coinGeometry = new THREE.CylinderGeometry(1.65, 1.65, 0.14, 64);
    const coinMaterials = [edgeMaterial, frontMaterial, backMaterial];
    const coinMesh = new THREE.Mesh(coinGeometry, coinMaterials);
    coinMesh.rotation.x = Math.PI / 2;
    coinGroup.add(coinMesh);

    // Outer Torus Rim for high-end chamfer
    const rimGeo = new THREE.TorusGeometry(1.67, 0.045, 16, 64);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.1
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    coinGroup.add(rimMesh);

    // Floating Halo Ring
    const haloGeo = new THREE.TorusGeometry(2.1, 0.015, 16, 80);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x009999,
      transparent: true,
      opacity: 0.5
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    haloMesh.rotation.x = Math.PI / 3;
    coinGroup.add(haloMesh);

    // Orbit Controls / Mouse drag
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      coinGroup.rotation.y += dx * 0.015;
      coinGroup.rotation.x += dy * 0.015;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (autoRotateRef.current && !isDragging) {
        coinGroup.rotation.y += delta * 0.8;
        coinGroup.rotation.x = Math.sin(clock.getElapsedTime() * 0.8) * 0.2;
      }

      haloMesh.rotation.z += delta * 0.4;

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);

      coinGeometry.dispose();
      rimGeo.dispose();
      haloGeo.dispose();
      edgeMaterial.dispose();
      frontMaterial.dispose();
      backMaterial.dispose();
      rimMat.dispose();
      haloMat.dispose();
      frontTex.dispose();
      backTex.dispose();

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [referenceNumber]);

  return (
    <div className="rounded-2xl bg-white p-4 text-slate-900 border border-slate-200/90 shadow-sm space-y-3">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-xs">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-heading font-bold text-slate-900 block">
              3D Statutory Joint-Lien Medallion
            </span>
            <span className="text-[10px] text-teal-700 font-semibold block">
              AICTE Regulation §10(k) Official Seal
            </span>
          </div>
        </div>

        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-2.5 py-1 rounded-full text-[10px] font-semibold flex items-center gap-1 border transition ${
            autoRotate 
              ? 'bg-teal-50 border-teal-200 text-teal-700' 
              : 'bg-slate-100 border-slate-200 text-slate-600'
          }`}
          title="Toggle Auto-Spin"
        >
          <RotateCw className={`w-3 h-3 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
          <span>{autoRotate ? 'Spinning' : 'Manual 360°'}</span>
        </button>
      </div>

      {/* Three.js Canvas Container */}
      <div
        ref={mountRef}
        className="w-full h-[220px] cursor-grab active:cursor-grabbing flex items-center justify-center select-none"
        title="Click and drag to rotate the Statutory Seal in 3D"
      />

      {/* Caption info */}
      <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500 border-t border-slate-100">
        <span className="flex items-center gap-1 text-emerald-700 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Lien Verified • Dual Signoff</span>
        </span>
        <span className="font-mono text-teal-700 font-bold">
          {formatLakhs(amount)}
        </span>
      </div>
    </div>
  );
};

export default ThreeStatutoryCoin;

'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

const PAGE_SIZE = 9;
const TOTAL_SLOTS = 150;

export default function ArchivePage() {
  const [exhibits, setExhibits] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [selectedExhibit, setSelectedExhibit] = useState<any | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [sceneReady, setSceneReady] = useState(false);
  const touchStartX = useRef<number>(0);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const storyRef = useRef<HTMLDivElement>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const frameRef = useRef<number>(0);
  const scrollYRef = useRef<number>(0);
  const targetScrollRef = useRef<number>(0);
  const artworkMeshesRef = useRef<any[]>([]);
  const raycasterRef = useRef<any>(null);
  const mouseRef = useRef<any>(null);

  const fetchTotalCount = useCallback(async () => {
    const { count } = await supabase.from('exhibits').select('*', { count: 'exact', head: true }).eq('is_approved', true);
    if (count !== null) setTotalCount(count);
  }, []);
  useEffect(() => { fetchTotalCount(); }, [fetchTotalCount]);

  const fetchExhibits = useCallback(async (pageNum: number) => {
    const from = pageNum * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from('exhibits').select('*').eq('is_approved', true)
      .order('created_at', { ascending: false }).range(from, to);
    if (!error && data) {
      setExhibits((prev) => [...prev, ...data]);
      if (data.length < PAGE_SIZE) setHasMore(false);
    }
  }, []);
  useEffect(() => { fetchExhibits(page); }, [page, fetchExhibits]);

  // Build Three.js scene once exhibits are loaded
  useEffect(() => {
    if (exhibits.length === 0 || !mountRef.current) return;
    if (sceneRef.current) return; // already built

    let THREE: any;

    const init = async () => {
      THREE = await import('three');

      const W = mountRef.current!.clientWidth;
      const H = mountRef.current!.clientHeight;

      // Renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setSize(W, H);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ReinhardToneMapping;
      renderer.toneMappingExposure = 1.2;
      mountRef.current!.appendChild(renderer.domElement);
      rendererRef.current = renderer;

      // Scene
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0x120f0e);
      scene.fog = new THREE.Fog(0x120f0e, 18, 35);
      sceneRef.current = scene;

      // Camera
      const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
      camera.position.set(0, 0, 6);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;

      // Raycaster for click detection
      raycasterRef.current = new THREE.Raycaster();
      mouseRef.current = new THREE.Vector2();

      // ── MATERIALS ──
      const wallMat = new THREE.MeshLambertMaterial({ color: 0x1a1614 });
      const floorMat = new THREE.MeshLambertMaterial({ color: 0x0f0d0c });
      const ceilMat = new THREE.MeshLambertMaterial({ color: 0x111010 });

      // Room dimensions
      const ROOM_W = 28;
      const ROOM_H = 6;
      const ROOM_D = 60; // long corridor

      // Back wall
      const backWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W, ROOM_H), wallMat);
      backWall.position.set(0, 0, -ROOM_D / 2);
      scene.add(backWall);

      // Left wall
      const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_D, ROOM_H), wallMat);
      leftWall.rotation.y = Math.PI / 2;
      leftWall.position.set(-ROOM_W / 2, 0, 0);
      scene.add(leftWall);

      // Right wall
      const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_D, ROOM_H), wallMat);
      rightWall.rotation.y = -Math.PI / 2;
      rightWall.position.set(ROOM_W / 2, 0, 0);
      scene.add(rightWall);

      // Floor
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W, ROOM_D), floorMat);
      floor.rotation.x = -Math.PI / 2;
      floor.position.set(0, -ROOM_H / 2, 0);
      floor.receiveShadow = true;
      scene.add(floor);

      // Ceiling
      const ceil = new THREE.Mesh(new THREE.PlaneGeometry(ROOM_W, ROOM_D), ceilMat);
      ceil.rotation.x = Math.PI / 2;
      ceil.position.set(0, ROOM_H / 2, 0);
      scene.add(ceil);

      // Wainscoting line on back wall
      const wainGeo = new THREE.PlaneGeometry(ROOM_W, 0.03);
      const wainMat = new THREE.MeshBasicMaterial({ color: 0x2a2420 });
      const wain = new THREE.Mesh(wainGeo, wainMat);
      wain.position.set(0, -1.5, -ROOM_D / 2 + 0.01);
      scene.add(wain);

      // Ambient light — very dim
      const ambient = new THREE.AmbientLight(0xfff4d2, 0.08);
      scene.add(ambient);

      // ── ARTWORKS ──
      const COLS = 3;
      const xPositions = [-7, 0, 7];
      const artMeshes: any[] = [];

      for (let i = 0; i < exhibits.length; i++) {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const x = xPositions[col];
        const z = -2 - row * 8; // each row 8 units deep
        const y = 0.5;

        const exhibit = exhibits[i];

        // Spotlight for this artwork
        const spot = new THREE.SpotLight(0xfff4d2, 3.5, 14, Math.PI / 7, 0.4, 1.5);
        spot.position.set(x, ROOM_H / 2 - 0.1, z + 1.5);
        spot.target.position.set(x, y, z - 0.5);
        spot.castShadow = true;
        spot.shadow.mapSize.set(512, 512);
        scene.add(spot);
        scene.add(spot.target);

        // Spot light bulb visual
        const bulbGeo = new THREE.SphereGeometry(0.06, 8, 8);
        const bulbMat = new THREE.MeshBasicMaterial({ color: 0xfff4d2 });
        const bulb = new THREE.Mesh(bulbGeo, bulbMat);
        bulb.position.copy(spot.position);
        scene.add(bulb);

        // Frame group
        const group = new THREE.Group();
        group.position.set(x, y, z);
        group.userData = { exhibit, index: i };

        // Outer frame (dark wood)
        const frameSize = 3.0;
        const frameBorder = 0.12;
        const frameGeo = new THREE.BoxGeometry(frameSize + frameBorder * 2, frameSize + frameBorder * 2, 0.08);
        const frameMat = new THREE.MeshLambertMaterial({ color: 0x2a1e14 });
        const frameMesh = new THREE.Mesh(frameGeo, frameMat);
        frameMesh.castShadow = true;
        frameMesh.receiveShadow = true;
        group.add(frameMesh);

        // Mat (white passepartout)
        const matSize = frameSize + 0.06;
        const matGeo = new THREE.BoxGeometry(matSize, matSize, 0.05);
        const matMaterial = new THREE.MeshLambertMaterial({ color: 0xede8e0 });
        const matMesh = new THREE.Mesh(matGeo, matMaterial);
        matMesh.position.z = 0.02;
        group.add(matMesh);

        // Image plane — load texture
        const loader = new THREE.TextureLoader();
        loader.load(
          exhibit.image_url,
          (texture: any) => {
            texture.colorSpace = THREE.SRGBColorSpace;
            const imgGeo = new THREE.PlaneGeometry(frameSize - 0.12, frameSize - 0.12);
            const imgMat = new THREE.MeshLambertMaterial({ map: texture });
            const imgMesh = new THREE.Mesh(imgGeo, imgMat);
            imgMesh.position.z = 0.055;
            group.add(imgMesh);
          },
          undefined,
          () => {
            // fallback plain dark rectangle
            const imgGeo = new THREE.PlaneGeometry(frameSize - 0.12, frameSize - 0.12);
            const imgMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
            const imgMesh = new THREE.Mesh(imgGeo, imgMat);
            imgMesh.position.z = 0.055;
            group.add(imgMesh);
          }
        );

        // Position group against back wall
        group.position.z = -ROOM_D / 2 + 0.1 + row * 0.001; // all on back wall plane
        // Actually spread along Z for corridor feel
        group.position.z = z - 0.1;

        scene.add(group);
        artMeshes.push(group);
      }

      artworkMeshesRef.current = artMeshes;
      setSceneReady(true);

      // ── ANIMATION LOOP ──
      const animate = () => {
        frameRef.current = requestAnimationFrame(animate);

        // Smooth scroll camera
        scrollYRef.current += (targetScrollRef.current - scrollYRef.current) * 0.06;
        camera.position.z = 6 - scrollYRef.current;
        camera.position.y = 0;

        renderer.render(scene, camera);
      };
      animate();

      // ── RESIZE ──
      const onResize = () => {
        if (!mountRef.current) return;
        const w = mountRef.current.clientWidth;
        const h = mountRef.current.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', onResize);

      // ── SCROLL ──
      const onWheel = (e: WheelEvent) => {
        e.preventDefault();
        targetScrollRef.current = Math.max(0, Math.min(
          targetScrollRef.current + e.deltaY * 0.01,
          exhibits.length > 3 ? Math.ceil(exhibits.length / 3) * 8 - 10 : 0
        ));
      };
      mountRef.current!.addEventListener('wheel', onWheel, { passive: false });

      // ── CLICK ──
      const onClick = (e: MouseEvent) => {
        const rect = mountRef.current!.getBoundingClientRect();
        mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycasterRef.current.setFromCamera(mouseRef.current, camera);
        const intersects = raycasterRef.current.intersectObjects(
          artworkMeshesRef.current.flatMap((g: any) => g.children),
          false
        );
        if (intersects.length > 0) {
          const hit = intersects[0].object;
          const group = hit.parent;
          if (group && group.userData.exhibit) {
            setSelectedExhibit(group.userData.exhibit);
            setSelectedIndex(group.userData.index);
          }
        }
      };
      mountRef.current!.addEventListener('click', onClick);

      // Touch scroll
      let touchY = 0;
      const onTouchStart = (e: TouchEvent) => { touchY = e.touches[0].clientY; };
      const onTouchMove = (e: TouchEvent) => {
        const dy = touchY - e.touches[0].clientY;
        touchY = e.touches[0].clientY;
        targetScrollRef.current = Math.max(0, Math.min(
          targetScrollRef.current + dy * 0.02,
          exhibits.length > 3 ? Math.ceil(exhibits.length / 3) * 8 - 10 : 0
        ));
      };
      mountRef.current!.addEventListener('touchstart', onTouchStart);
      mountRef.current!.addEventListener('touchmove', onTouchMove);
    };

    init();

    return () => {
      cancelAnimationFrame(frameRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.domElement.remove();
      }
      sceneRef.current = null;
      rendererRef.current = null;
    };
  }, [exhibits]);

  // Keyboard nav
  useEffect(() => {
    if (!selectedExhibit) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && selectedIndex < exhibits.length - 1) { setSelectedExhibit(exhibits[selectedIndex + 1]); setSelectedIndex(selectedIndex + 1); }
      else if (e.key === 'ArrowLeft' && selectedIndex > 0) { setSelectedExhibit(exhibits[selectedIndex - 1]); setSelectedIndex(selectedIndex - 1); }
      else if (e.key === 'Escape') setSelectedExhibit(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedExhibit, selectedIndex, exhibits]);

  useEffect(() => {
    if (selectedExhibit && storyRef.current && fadeRef.current) {
      const el = storyRef.current;
      fadeRef.current.style.opacity = el.scrollHeight <= el.clientHeight ? '0' : '1';
    }
  }, [selectedExhibit]);

  const handleShare = async (item: any) => {
    try {
      if (navigator.share) await navigator.share({ title: `Archive of Almost — "${item.title}"`, url: 'https://archiveofalmost.co/archive' });
      else await navigator.clipboard.writeText('https://archiveofalmost.co/archive');
    } catch {}
  };

  return (
    <main className="text-white selection:bg-white selection:text-black" style={{ fontFamily: 'Georgia, serif', backgroundColor: '#0d0b0a' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');
        .cg { font-family: 'Cormorant Garamond', Georgia, serif; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes modalIn {
          0% { opacity: 0; transform: scale(0.96) translateY(12px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .modal-anim { animation: modalIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .fu1 { animation: fadeUp 0.6s ease-out 0.08s forwards; opacity: 0; }
        .fu2 { animation: fadeUp 0.6s ease-out 0.22s forwards; opacity: 0; }
        .fu3 { animation: fadeUp 0.6s ease-out 0.36s forwards; opacity: 0; }
      `}</style>

      {/* TOP BAR */}
      <div className="fixed top-[57px] md:top-[61px] left-0 right-0 z-50 px-6 md:px-10 py-3 flex items-center justify-between"
        style={{ backgroundColor: 'rgba(13,11,10,0.97)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <span className="cg text-[10px] tracking-[0.6em] uppercase italic" style={{ color: '#555' }}>Permanent Collection</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontFamily: 'Georgia', fontSize: '10px', letterSpacing: '0.4em', color: '#333', textTransform: 'uppercase', fontWeight: 700 }}>
            {exhibits.length} <span style={{ color: '#222' }}>/ {TOTAL_SLOTS}</span>
          </span>
          <span style={{ fontFamily: 'Georgia', fontSize: '9px', letterSpacing: '0.35em', color: '#333', textTransform: 'uppercase' }}>
            Scroll to explore ↓
          </span>
        </div>
      </div>

      {/* THREE.JS CANVAS */}
      <div
        ref={mountRef}
        style={{
          width: '100vw',
          height: '100vh',
          cursor: 'crosshair',
          position: 'relative',
          backgroundColor: '#120f0e',
        }}
      >
        {/* Loading state */}
        {!sceneReady && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '16px',
            backgroundColor: '#120f0e',
          }}>
            <p className="cg" style={{ fontSize: '18px', fontStyle: 'italic', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.2em' }}>
              Preparing the gallery…
            </p>
          </div>
        )}

        {/* Scroll hint */}
        {sceneReady && exhibits.length > 3 && (
          <div style={{
            position: 'absolute', bottom: '100px', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
            pointerEvents: 'none',
          }}>
            <span style={{ fontFamily: 'Georgia', fontSize: '9px', letterSpacing: '0.5em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>Scroll</span>
            <div style={{ width: '1px', height: '32px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.2), transparent)' }}></div>
          </div>
        )}

        {/* Click hint */}
        {sceneReady && (
          <div style={{
            position: 'absolute', bottom: '100px', right: '32px',
            pointerEvents: 'none',
          }}>
            <span style={{ fontFamily: 'Georgia', fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.15)' }}>
              Click to view
            </span>
          </div>
        )}
      </div>

      {/* MODAL */}
      {selectedExhibit && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12"
          onClick={() => setSelectedExhibit(null)}
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            const diff = touchStartX.current - e.changedTouches[0].clientX;
            if (diff > 50 && selectedIndex < exhibits.length - 1) { setSelectedExhibit(exhibits[selectedIndex + 1]); setSelectedIndex(selectedIndex + 1); }
            if (diff < -50 && selectedIndex > 0) { setSelectedExhibit(exhibits[selectedIndex - 1]); setSelectedIndex(selectedIndex - 1); }
          }}
        >
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(6,5,4,0.96)', backdropFilter: 'blur(24px)' }}></div>
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '700px', height: '500px', pointerEvents: 'none', background: 'radial-gradient(ellipse 50% 70% at 50% 0%, rgba(255,244,200,0.07) 0%, transparent 70%)' }}></div>

          {selectedIndex > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setSelectedExhibit(exhibits[selectedIndex - 1]); setSelectedIndex(selectedIndex - 1); }}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center transition-all duration-300"
              style={{ border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >←</button>
          )}
          {selectedIndex < exhibits.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); setSelectedExhibit(exhibits[selectedIndex + 1]); setSelectedIndex(selectedIndex + 1); }}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center transition-all duration-300"
              style={{ border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(0,0,0,0.6)', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >→</button>
          )}

          <div className="modal-anim relative w-full max-w-5xl flex flex-col md:flex-row z-10 max-h-[90vh] overflow-y-auto scrollbar-hide"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Framed image */}
            <div className="w-full md:w-[55%] shrink-0" style={{ backgroundColor: '#0f0d0c', padding: '20px' }}>
              <div style={{ background: 'linear-gradient(135deg, #3a2e22 0%, #2a2018 40%, #3a2e22 60%, #221a10 100%)', padding: '6px', boxShadow: '0 16px 50px rgba(0,0,0,0.8)' }}>
                <div style={{ background: '#ede8e0', padding: '8px 8px 20px 8px' }}>
                  <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden' }}>
                    <Image src={selectedExhibit.image_url} alt={selectedExhibit.title} fill unoptimized className="object-cover"
                      style={{ filter: 'saturate(0.82) contrast(1.05)' }} />
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,244,200,0.10) 0%, transparent 60%)' }}></div>
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 40px rgba(0,0,0,0.4)' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="w-full md:w-[45%] flex flex-col justify-between p-6 md:p-10 min-h-[320px]"
              style={{ backgroundColor: '#0c0a09', borderLeft: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'Georgia', fontSize: '9px', letterSpacing: '0.5em', textTransform: 'uppercase', color: '#2e2822', fontWeight: 700 }}>{selectedIndex + 1} / {exhibits.length}</span>
                  <button onClick={() => setSelectedExhibit(null)}
                    style={{ fontFamily: 'Georgia', fontSize: '10px', letterSpacing: '0.5em', textTransform: 'uppercase', color: '#444', fontWeight: 700, cursor: 'pointer', background: 'none', border: 'none' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#444')}
                  >Close ×</button>
                </div>

                <div className="fu1">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                    <span style={{ fontFamily: 'Georgia', fontSize: '9px', letterSpacing: '0.5em', textTransform: 'uppercase', color: '#333', fontWeight: 700 }}>{selectedExhibit.catalog_id}</span>
                    <div style={{ width: '16px', height: '1px', background: '#2a2a2a' }}></div>
                    <span style={{ fontFamily: 'Georgia', fontSize: '9px', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#333', fontWeight: 700 }}>{selectedExhibit.year}</span>
                  </div>
                  <h2 className="cg" style={{ fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 300, fontStyle: 'italic', color: 'rgba(255,255,255,0.9)', lineHeight: 1.2 }}>
                    "{selectedExhibit.title}"
                  </h2>
                </div>

                <div className="fu1" style={{ width: '28px', height: '1px', background: '#1e1e1e' }}></div>

                <div className="fu2" style={{ position: 'relative' }}>
                  <div ref={storyRef} className="scrollbar-hide" style={{ maxHeight: '220px', overflowY: 'auto' }}
                    onScroll={(e) => {
                      const el = e.currentTarget;
                      if (fadeRef.current) fadeRef.current.style.opacity = el.scrollHeight - el.scrollTop <= el.clientHeight + 5 ? '0' : '1';
                    }}>
                    <p className="cg" style={{ fontSize: '15px', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.7, color: 'rgba(255,255,255,0.65)' }}>
                      {selectedExhibit.description}
                    </p>
                  </div>
                  <div ref={fadeRef} style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', background: 'linear-gradient(to top, #0c0a09, transparent)', pointerEvents: 'none', transition: 'opacity 0.3s' }}></div>
                </div>
              </div>

              <div className="fu3" style={{ paddingTop: '20px', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {selectedExhibit.submitter_name && (
                  <p className="cg" style={{ fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', color: '#333', fontStyle: 'italic' }}>— {selectedExhibit.submitter_name}</p>
                )}
                <button onClick={() => handleShare(selectedExhibit)}
                  style={{ width: '100%', padding: '12px', fontFamily: 'Georgia', fontSize: '10px', letterSpacing: '0.45em', textTransform: 'uppercase', fontWeight: 700, color: '#555', border: '1px solid rgba(255,255,255,0.07)', background: 'none', cursor: 'pointer', transition: 'all 0.3s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#555'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
                >Share this object</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-6 md:px-10 py-4 flex items-center justify-between"
        style={{ backgroundColor: 'rgba(13,11,10,0.97)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.22)', animation: 'pulse 2s infinite' }}></div>
          <span style={{ fontFamily: 'Georgia', fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', fontWeight: 700, color: 'rgba(255,255,255,0.22)' }}>
            {totalCount} of {TOTAL_SLOTS} objects archived
          </span>
        </div>
        <a href="/submit"
          style={{ padding: '10px 32px', fontFamily: 'Georgia', fontSize: '10px', letterSpacing: '0.4em', textTransform: 'uppercase', fontWeight: 700, color: 'white', border: '1px solid rgba(255,255,255,0.3)', textDecoration: 'none', transition: 'all 0.3s' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'white'; (e.currentTarget as HTMLElement).style.color = 'black'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
        >Apply</a>
      </div>
    </main>
  );
}

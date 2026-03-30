import { useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PresentationControls, Stage, useGLTF } from "@react-three/drei";
import { motion, useMotionValue, useTransform } from "framer-motion";

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  const ref = useRef<any>();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.y = Math.sin(t / 4) / 4;
      ref.current.position.y = (1 + Math.sin(t / 1.5)) / 10;
    }
  });

  return <primitive ref={ref} object={scene} scale={1.5} />;
}

export function BikeModelViewer({ modelUrl, imageUrl, fallbackMode = false }: { modelUrl?: string | null, imageUrl?: string, fallbackMode?: boolean }) {
  const [error, setError] = useState(false);

  // If no model URL provided or error loading model, show 3D CSS card fallback
  if (!modelUrl || error || fallbackMode) {
    return <CSS3DCard imageUrl={imageUrl} />;
  }

  return (
    <div className="w-full h-[500px] md:h-[600px] bg-muted/10 rounded-xl overflow-hidden relative cursor-grab active:cursor-grabbing border border-border/50">
      <div className="absolute top-4 left-4 z-10 bg-background/50 backdrop-blur-sm px-3 py-1 text-xs uppercase tracking-widest text-muted-foreground border border-border/50 rounded-full">
        Interactive 3D View
      </div>
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 45 }}>
        <color attach="background" args={['#09090b']} />
        <PresentationControls speed={1.5} global zoom={0.5} polar={[-0.1, Math.PI / 4]}>
          <Stage environment="city" intensity={0.6} castShadow={false}>
            {/* Wrap in ErrorBoundary roughly equivalent logic */}
            <Model url={modelUrl} />
          </Stage>
        </PresentationControls>
      </Canvas>
    </div>
  );
}

function CSS3DCard({ imageUrl }: { imageUrl?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <div className="w-full h-[500px] md:h-[600px] perspective-1000 flex items-center justify-center p-8 bg-gradient-to-br from-muted/20 to-background border border-border/50">
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="w-full max-w-md aspect-[4/3] relative rounded-xl transition-all duration-200 ease-out"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center rounded-xl shadow-2xl"
          style={{ 
            backgroundImage: `url(${imageUrl || 'https://images.unsplash.com/photo-1568772585407-9361f9bf3c87?auto=format&fit=crop&q=80'})`,
            transform: "translateZ(50px)"
          }}
        />
        <div 
          className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-xl"
          style={{ transform: "translateZ(51px)" }}
        />
        <div 
          className="absolute bottom-6 left-6 right-6 flex justify-between items-end"
          style={{ transform: "translateZ(80px)" }}
        >
          <div className="text-white">
            <p className="uppercase tracking-widest text-xs opacity-70 mb-1">Preview</p>
            <p className="font-bold text-xl font-sans tracking-tight">Hover to rotate</p>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-primary/50 flex items-center justify-center">
            <span className="text-primary text-xs font-bold">3D</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

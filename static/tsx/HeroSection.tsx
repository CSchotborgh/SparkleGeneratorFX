import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

declare const particlesJS: any;

const backgroundImages = [
  'https://images.unsplash.com/photo-1606167668584-78701c57f13d?q=80&w=2940', // Casino interior
  'https://images.unsplash.com/photo-1595159239125-50dd08c0a43b?q=80&w=2940', // Slot machines
  'https://images.unsplash.com/photo-1629789877555-b29e011097c9?q=80&w=2940'  // Luxury casino
];

export default function HeroSection() {
  const [, setLocation] = useLocation();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Handle background image cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 2500); // Change image every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    particlesJS('particles', {
      particles: {
        number: {
          value: 40,
          density: {
            enable: true,
            value_area: 800
          }
        },
        color: {
          value: '#d946ef'
        },
        shape: {
          type: ["circle", "triangle", "polygon"],
          polygon: {
            sides: 6
          },
          image: [
            {
              src: "data:image/svg+xml;base64," + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 11h4a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1zm8-6h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM6 19h4a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1zm8-6h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1z"/></svg>'),
              width: 32,
              height: 32
            },
            {
              src: "data:image/svg+xml;base64," + btoa('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 6H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1zM7 12h2m4 0h2"/><circle cx="7" cy="16" r="1"/><circle cx="15" cy="16" r="1"/></svg>'),
              width: 32,
              height: 32
            }
          ]
        },
        opacity: {
          value: 0.6,
          random: true
        },
        size: {
          value: 15,
          random: true,
          anim: {
            enable: true,
            speed: 2,
            size_min: 8,
            sync: false
          }
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: '#4f46e5',
          opacity: 0.2,
          width: 1
        },
        move: {
          enable: true,
          speed: 2,
          direction: "none",
          random: true,
          straight: false,
          out_mode: "bounce",
          bounce: false,
          attract: {
            enable: true,
            rotateX: 600,
            rotateY: 1200
          }
        }
      },
      interactivity: {
        detect_on: 'canvas',
        events: {
          onhover: {
            enable: true,
            mode: 'grab'
          },
          resize: true
        }
      },
      retina_detect: true
    });
  }, []);

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentImageIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${backgroundImages[currentImageIndex]}')`,
            filter: 'brightness(0.7)'
          }}
        />
      </AnimatePresence>
      <div 
        className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/80 to-background/95"
      />
      <div id="particles" className="absolute inset-0"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 via-purple-500 to-pink-500">
            Create Amazing Games with Sumochuck Tools
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-foreground/80 max-w-2xl mx-auto">
            Professional game design software for creators of all levels
          </p>
          <div className="flex gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => setLocation("/auth")}
              className="bg-fuchsia-600 hover:bg-fuchsia-700"
            >
              Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => setLocation("/plans")}
            >
              View Plans
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

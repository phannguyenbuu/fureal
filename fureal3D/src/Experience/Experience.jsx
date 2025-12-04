import * as THREE from "three";
import { useSelection, usePointer } from "../stores/selectionStore";
import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import Scene from "./Scene";
import { Canvas } from "@react-three/fiber";
import { Html } from '@react-three/drei';
import { OrthographicCamera, Box, OrbitControls} from "@react-three/drei";
import { Environment } from '@react-three/drei';

import { useToggleRoomStore } from "../stores/toggleRoomStore";
import { useResponsiveStore } from "../stores/useResponsiveStore";
import { useExperienceStore } from "../stores/experienceStore";
import { useThree } from "@react-three/fiber";

import { Button, notification } from 'antd';
import bedroom_furnitures from "./bedroom.json";
import living_furnitures from "./living.json";
import PointSliderWithRotation from "./PointSliderWithRotation";
import { createPortal } from 'react-dom';
import ReactDOM from 'react-dom';

import ModifyControls from "./components/ModifyControl";

import FurnitureModal from "./FunitureModal";

const isMB = () => {
  return window.innerWidth < 768;
}


function SaveScreenshotButton({capture, setCapture}) {
  const { gl, scene, camera } = useThree();

  useEffect(() => {
    if(capture)
    {
      handleSave();
      setCapture(false);
    }
  },[capture]);

  const handleSave = () => {
    gl.render(scene, camera);
    const imgData = gl.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = imgData;
    link.download = 'screenshot.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <></>
  );
}

function NotificationContainer({ children }) {
  const [container, setContainer] = useState(null);

  useEffect(() => {
    setContainer(document.getElementById('portal-root'));
  }, []);

  if (!container) return null;

  return ReactDOM.createPortal(children, container);
}


const Experience = () => {
  const [api, contextHolder] = notification.useNotification();
  const cameraRef = useRef();
  const pointerRef = useRef({ x: 0, y: 0 });
  const { isExperienceReady } = useExperienceStore();
  const {setMessage} =  useSelection();
  const { isMobile } = useResponsiveStore();
  const [capture, setCapture] = useState(false);
  
  const {addedHighlights} = usePointer();

  const { isDarkRoom, setIsBeforeZooming, setIsTransitioning } =
    useToggleRoomStore();

  const cameraPositions = {
    dark: {
      position: [
        12,
        10,
        10,
      ],
    },
    light: {
      position: [3.2, 16.2, 21.6],
    },
  };


  

  const zoomValues = {
    default: isMobile ? 74 : 80,
    animation: isMobile ? 65 : 110,
  };


  useEffect(() => {
    if (!cameraRef.current) return;

    const targetPosition = isDarkRoom
      ? cameraPositions.dark.position
      : cameraPositions.light.position;

    gsap.set(cameraRef.current.position, {
      x: targetPosition[0],
      y: targetPosition[1],
      z: targetPosition[2],
    });
  }, [isExperienceReady]);

  useEffect(() => {
    if (!cameraRef.current) return;

    zoomValues.default = isMobile ? 74 : 135;
    zoomValues.animation = isMobile ? 65 : 110;

    cameraRef.current.zoom = zoomValues.default;
    cameraRef.current.updateProjectionMatrix();
  }, [isMobile]);

  useEffect(() => {
    if (!cameraRef.current) return;

    const targetPosition = isDarkRoom
      ? cameraPositions.dark.position
      : cameraPositions.light.position;

    const t1 = gsap.timeline({
      onComplete: () => {
        setIsTransitioning(false);
      },
    });
    t1.to(cameraRef.current, {
      zoom: zoomValues.animation,
      duration: 1,
      ease: "power3.out",
      onStart: () => {
        setIsTransitioning(true);
        setIsBeforeZooming(true);
      },
      onUpdate: () => {
        cameraRef.current.updateProjectionMatrix();
      },
    })
      .to(cameraRef.current.position, {
        x: targetPosition[0],
        y: targetPosition[1],
        z: targetPosition[2],
        duration: 1.5,
        ease: "power3.out",
      })
      .to(cameraRef.current, {
        zoom: zoomValues.default,
        duration: 1,
        ease: "power3.out",
        onStart: () => {
          setIsBeforeZooming(false);
        },
        onUpdate: () => {
          cameraRef.current.updateProjectionMatrix();
        },
      });
  }, [isDarkRoom]);

  useEffect(() => {
    const onPointerMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;

      pointerRef.current = { x, y };
    };

    const onTouchMove = (e) => {
      if (e.touches.length === 1) {
        pointerRef.current.x =
          (e.touches[0].clientX / window.innerWidth) * 2 - 1;
        pointerRef.current.y =
          -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
      }
    };

    // window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("touchmove", onTouchMove);

    return () => {
      // window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchmove", onTouchMove);
    };
  });

    // Hàm gom nhóm và tính quantity
  function groupFurnitures(furnitures) {
    const grouped = furnitures.reduce((acc, item) => {
      const key = item.name; // hoặc id nếu có
      if (acc[key]) {
        acc[key].quantity += 1;
      } else {
        acc[key] = { ...item, quantity: 1 };
      }
      return acc;
    }, {});

    // Chuyển object thành array
    return Object.values(grouped);
  }


  return (
    <>
    {contextHolder}
      <Canvas style={{ position: "fixed", zIndex: 1, top: 0, left: 0 }} shadows gl={{ preserveDrawingBuffer: true }}>
        <Environment environmentIntensity={1}/>
        
        
        <OrthographicCamera
          ref={cameraRef}
          makeDefault
          position={cameraPositions.dark.position}
          rotation={[
            -0.6, -0.7, -0.4,
          ]}
          zoom={zoomValues.default}
        />
        
        <OrbitControls/>
        <Scene
          camera={cameraRef}
          pointerRef={pointerRef}
          isExperienceReady={isExperienceReady}
        />

          {/* <BoxWithDecal/> */}

        
        {/* <LightGrid pos = {[-0.5, 8, 0.5]} intensity = {10}/> */}
        <SaveScreenshotButton capture={capture} setCapture={setCapture}/>
      </Canvas>

      <NotificationContainer/>

      {/* <div style={{ position: 'fixed', top: 20, gap:5, scale: isMB() ? 0.6 : 1,
          display:'flex', flexDirection:'column',
           left: isMB() ? 20 : 20, color: 'black', zIndex:99 }}>
            <img src="/images/logo-fureal2-1.png" style={{width:150,left:-20,position:'relative'}} alt="Logo" />
          
          <PanelFurnitures key='panel-bedroom' icon='/images/bed.svg' furnitures={bedroom_furnitures} title="PHÒNG NGỦ"/>
          <PanelFurnitures key='panel-living' icon='/images/sofa.svg' furnitures={living_furnitures} title="PHÒNG KHÁCH"/>
          {addedHighlights &&
            <PanelFurnitures key='panel-cart' icon='/images/cart.svg' 
              furnitures={groupFurnitures(addedHighlights.map(el=> el.data))} 
              title="GIỎ HÀNG"/>
          }
      </div> */}

      <FurnitureModal 
        bedroom_furnitures={bedroom_furnitures}
        living_furnitures={living_furnitures}
        addedHighlights={addedHighlights}
        groupFurnitures={groupFurnitures}
        isMB={isMB}
      />

      <div style={{ position: 'fixed', left: 200,  bottom: 50,
           color: 'black', zIndex:99 }}>
          <ModifyControls setCapture={setCapture}/>
      </div>
    </>
  );
};

export default Experience;

import * as THREE from "three";

import React, { useRef, useEffect, useState } from "react";
import gsap from "gsap";
import Scene from "./Scene";
import { Canvas } from "@react-three/fiber";

import { OrthographicCamera, Box, OrbitControls} from "@react-three/drei";
import { Environment } from '@react-three/drei';

import { useToggleRoomStore } from "../stores/toggleRoomStore";
import { useResponsiveStore } from "../stores/useResponsiveStore";
import { useExperienceStore } from "../stores/experienceStore";
import { useThree } from "@react-three/fiber";
import PanelFurnitures from "./PanelFurnitures";
import html2canvas from 'html2canvas';
import CircularButtonGroup from "./CircularButtonGroup";

const Experience = () => {
  const cameraRef = useRef();
  const pointerRef = useRef({ x: 0, y: 0 });
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const { isExperienceReady } = useExperienceStore();
  const {setMessage} =  useSelection();
  const { isMobile } = useResponsiveStore();
  const [capture, setCapture] = useState(false);

  const { isDarkRoom, setIsBeforeZooming, setIsTransitioning } =
    useToggleRoomStore();

  const cameraPositions = {
    dark: {
      position: [
        -7.65,
        6.3,
        8.1,
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

  // useEffect(()=>{
  //   setMessage(`${cameraPositions.dark.position}`);
  // },[cameraPositions.dark.position]);

  return (
    <>
      <Canvas style={{ position: "fixed", zIndex: 1, top: 0, left: 0 }} shadows gl={{ preserveDrawingBuffer: true }}>
        <Environment files="/models/Light Room/rostock_laage_airport_1k.hdr" 
          background={false} 
          environmentIntensity={1}/>
        
        
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

      <div style={{ position: 'fixed', top: 20,  scale: isMB() ? 0.6 : 1,
           left: isMB() ? 20 : 20, color: 'black', zIndex:99 }}>
            <img src="/images/logo-fureal2-1.png" style={{width:150,left:-20,position:'relative'}} alt="Logo" />
          
          <PanelFurnitures/>
      </div>
      <div style={{ position: 'fixed', left: 200,  bottom: 50,
           color: 'black', zIndex:99 }}>
          <ModifyControls setCapture={setCapture}/>
      </div>
    </>
  );
};

export default Experience;
const btnStyle = { width: 60, height: 60, padding: 0, borderRadius:10, border: '1px solid #777' };

import { usePointer, useSelection } from "../stores/selectionStore";

import { Html } from '@react-three/drei';

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

const imgStyle = { width: 30, height: 30 };

function ModifyControls({setCapture}) {
  
  const { rotateLeft, rotateRight,getResult, deletePointerId } = usePointer();
  const {setCurrentLibNodeSelection, currentSelection, message,setMessage } = useSelection();
//   useEffect(() => {
//   console.log("Rotation or Pointer changed", pointer, rotationIndex);
// }, [pointer, rotationIndex]);


  const rotateCW = () => {
    // setRotationIndex((prev) => (prev + 1) % 4);
    // console.log("Rotation",pointer, rotationIndex);
    rotateLeft(currentSelection);
    setMessage(getResult());
  };

  const rotateCCW = () => {
    // setRotationIndex((prev) => (prev + 3) % 4); // -1 mod 4
    // console.log("Rotation",pointer, rotationIndex);
    rotateRight(currentSelection);
    setMessage(getResult());
  };

  const handleSelectMode = () => {
    setCurrentLibNodeSelection(null);
  }

  const handleDelete = () => {
    deletePointerId(currentSelection);
  }

  const actions = [
    {handleSelectMode, label: "Chọn", color: "#d4af37" },
    { label: "Xoay 90", color: "#228B22" },
    { label: "Xoay 90", color: "#1E90FF" },
    { label: "Lưu", color: "#FF4500" },
    { label: "Xóa", color: "#8B4513" }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
      <div style={{marginTop:-50}}>
        <FiveOptionToggle/>
      </div>

      <div style={{width:300, marginRight:50}}>
        {message && message.split('|').map((el)=> <p style={{fontSize:12, lineHeight:'1.2rem'}}>
          {el}
        </p>)}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column'}}>

          <div style={{ display: 'flex', flexDirection: 'row', gap:5}}>
      
          <button style={btnStyle} onClick={() => handleSelectMode()}>
            <img src="/images/select.png" style={imgStyle} alt="Rotation" />
            Chọn
          </button>

          <button style={btnStyle} onClick={() => rotateCW()}>
            <img src="/images/rotation-icon-left.png" style={imgStyle} alt="Rotation" />
            Xoay 90
          </button>

          <button style={btnStyle} onClick={() => rotateCCW()}>
            <img src="/images/rotation-icon.png" style={imgStyle} alt="Rotation-Left" />
            Xoay 90
          </button>

          <button style={btnStyle} onClick={() => setCapture(true)}>
            <img src="/images/save.png" style={imgStyle} alt="Save"/><br/>
            Lưu
          </button>

          <button style={btnStyle} onClick={() => handleDelete()}>
            <img src="/images/delete.png" style={imgStyle} alt="Save"/><br/>
            Xóa
          </button>
          
        </div>
        <span style={{fontSize:10, position:'relative', marginTop:10, whiteSpace:'nowrap'}}>
            {currentSelection? `Đang chọn: [${currentSelection.split('-')[0]}] - Nhấp chuột phải để bỏ chọn`: ``}
          </span>
        <SimpleSlider/>
      </div>
      
    </div>
  );
}


// import React, { useRef } from "react";
// import { Canvas, useThree } from "@react-three/fiber";


export function SimpleSlider() {
  const {directionAxis, setDirectionAxis, getResult, personAge, setPersonAge} = usePointer();
  const {setMessage} = useSelection();
  const [value, setValue] = useState(directionAxis);

  const handleChange = (event) => {
    setValue(parseInt(event.target.value));
  };

  useEffect(()=>{
    setDirectionAxis(value);
  },[value]);

  useEffect(()=>{
    setMessage(getResult());
  },[directionAxis]);


  return (
    <div style={{ width: 200, marginTop: 20 }}>
      <input
        type="range"
        min="1"
        max="360"
        value={value}
        onChange={handleChange}
        style={{ width: "100%" }}
      />
      <div style={{ textAlign: "left", marginTop: 10, whiteSpace:'nowrap', fontSize: 10 }}>
        Hướng phòng: {value}° - Trượt để chỉnh hướng phòng
      </div>
    </div>
  );
}

const isMB = () => {
  return window.innerWidth < 768;
}

// import React, { useState, useEffect } from "react";
import rules from "./rules.json";

const colors = [
  { label: "Kim", color: "#d4af37" },
  { label: "Mộc", color: "#228B22" },
  { label: "Thủy", color: "#1E90FF" },
  { label: "Hỏa", color: "#FF4500" },
  { label: "Thổ", color: "#8B4513" }
];

export function FiveOptionToggle() {
  const { setMessage } = useSelection();
  const [selected, setSelected] = useState("Kim");
  const [hovered, setHovered] = useState(null);
  const { getResult, setPersonAge } = usePointer();

  useEffect(() => {
    if (!rules || !rules[selected]) return;
    setMessage(getResult());
  }, [selected]);

  const handleClick = (label) => {
    setSelected(label);
    setPersonAge(label);
  };

  const handleResultClick = () => {
    setMessage(getResult());
  };

  const angles = 360 / colors.length;
  const radius = 100;
  const center = 120;
  const holeRadius = 40;

  const createSector = (index) => {
    const startAngle = (angles * index) - (angles / 2);
    const endAngle = startAngle + angles;
    const startRad = (Math.PI / 180) * startAngle;
    const endRad = (Math.PI / 180) * endAngle;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const x3 = center + holeRadius * Math.cos(endRad);
    const y3 = center + holeRadius * Math.sin(endRad);
    const x4 = center + holeRadius * Math.cos(startRad);
    const y4 = center + holeRadius * Math.sin(startRad);

    return `
      M ${x1} ${y1}
      A ${radius} ${radius} 0 0 1 ${x2} ${y2}
      L ${x3} ${y3}
      A ${holeRadius} ${holeRadius} 0 0 0 ${x4} ${y4}
      Z
    `;
  };

  return (
    <div style={{ textAlign: 'center', userSelect: 'none' }}>
      

      <svg
        width={center * 2}
        height={center * 2}
        viewBox={`0 0 ${center * 2} ${center * 2}`}
        style={{ cursor: 'pointer' }}
      >
        {colors.map(({ label, color }, i) => {
          const isSelected = label === selected;
          const isHovered = label === hovered;
          const path = createSector(i);
          const angle = (angles * i);
          const rad = (Math.PI / 180) * angle;
          const labelX = center + ((radius + holeRadius) / 2) * Math.cos(rad);
          const labelY = center + ((radius + holeRadius) / 2) * Math.sin(rad);

          return (
            <g
              key={label}
              onClick={() => handleClick(label)}
              onMouseEnter={() => setHovered(label)}
              onMouseLeave={() => setHovered(null)}
              style={{ transition: "all 0.3s" }}
            >
              <path
                d={path}
                fill={isSelected || isHovered ? color : "#eee"}
                stroke={isSelected || isHovered ? color : "#ccc"}
                strokeWidth={isSelected || isHovered ? 3 : 1}
                style={{ transition: "all 0.3s" }}
              />
              <text
                x={labelX}
                y={labelY + 4}
                fill={isSelected || isHovered ? "white" : "black"}
                fontWeight={isSelected || isHovered ? "bold" : "normal"}
                fontSize={14}
                textAnchor="middle"
                pointerEvents="none"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Vòng tròn hole trắng giữa */}
        <circle
          cx={center}
          cy={center}
          r={holeRadius}
          fill={hovered === 'center' || hovered === null ? "white" : "#ddd"}
          style={{ transition: "fill 0.3s" }}
          onMouseEnter={() => setHovered('center')}
          onMouseLeave={() => setHovered(null)}
        />

        {/* Text ở tâm vòng tròn */}
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={hovered === 'center' ? "#007BFF" : "black"}
          fontWeight="bold"
          fontSize={10}
          style={{ userSelect: 'none', pointerEvents: 'none', transition: "fill 0.3s" }}
        >
          {'Mệnh gia chủ'.toUpperCase()}
        </text>
      </svg>
    </div>
  );
}

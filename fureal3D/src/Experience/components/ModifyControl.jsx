import * as THREE from "three";
import { useSelection, usePointer } from "../../stores/selectionStore";
import React, { useRef, useEffect, useState } from "react";
import { notification } from "antd";
import PointSliderWithRotation from "../PointSliderWithRotation";
import rules from "../rules.json";
import Draggable from 'react-draggable';

const btnStyle = { width: 60, height: 60, 
  fontSize:12, cursor:'pointer',
  padding: 0, borderRadius:10, border: '1px solid #777' };


function ModifyControls() {
  const {roomWidth, roomHeight, roomLength, setRoomWidth, setRoomLength, setRoomHeight} = usePointer();
  const { rotateLeft, rotateRight,getResult, deletePointerId } = usePointer();
  const {setCurrentLibNodeSelection, currentSelection, message,setMessage } = useSelection();
  const {addedHighlights, setAddedHighlights, saveJson,loadJson} = usePointer();
  const imgStyle = { width: 30, height: 30 };

  useEffect(()=> {loadJson()},[]);
  const [api, contextHolder] = notification.useNotification();


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

  useEffect(()=>{
    if(!message) return;

    message.split('|').forEach(el => {
      api.success({
        message: el,
      });
    });
    
  },[message]);

  const handleSelectMode = () => {
    // api.success({
    //   message: 'Success',
    //   description: 'Fetch successful!',
    // });
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

  const nodeRef = useRef(null);

  return (
    <>
    {contextHolder}
    <Draggable nodeRef={nodeRef} handle=".drag-handle">
        
    <div ref={nodeRef} style={{ display: 'flex', flexDirection: 'row', gap: 10, backgroundColor:'#999', borderRadius:20 }}>
      <div className="drag-handle" style={{width:50, cursor: 'move'}}></div>
      {/* <div style={{marginTop:0}}> */}
        <FiveOptionToggle/>
      {/* </div> */}

      {/* <div style={{width:300, marginRight:50}}>
        {message && message.split('|').map((el)=> <p style={{fontSize:12, lineHeight:'1.2rem'}}>
          {el}
        </p>)}
      </div> */}

      <div style={{ display: 'flex', flexDirection: 'column', padding:20}}>

          <div style={{ display: 'flex', flexDirection: 'row', gap:5}}>
      
          <button style={btnStyle} onClick={() => handleSelectMode()}>
            <img src="/images/select.png" style={imgStyle} alt="Rotation" />
            <p>Chọn</p>
          </button>

          <button style={btnStyle} onClick={() => rotateCW()}>
            <img src="/images/rotation-icon-left.png" style={imgStyle} alt="Rotation" />
            <p>Xoay 90</p>
          </button>

          <button style={btnStyle} onClick={() => rotateCCW()}>
            <img src="/images/rotation-icon.png" style={imgStyle} alt="Rotation-Left" />
            <p>Xoay 90</p>
          </button>

          <button style={btnStyle} onClick={saveJson}>
            <img src="/images/save.png" style={imgStyle} alt="Save"/><br/>
            <p>Lưu</p>
          </button>

          <button style={btnStyle} onClick={loadJson}>
            <img src="/images/load.png" style={imgStyle} alt="Load"/><br/>
            <p>Tải data</p>
          </button>

          <button style={btnStyle} onClick={() => handleDelete()}>
            <img src="/images/delete.png" style={imgStyle} alt="Save"/><br/>
            <p>Xóa</p>
          </button>
          
        </div>
        <span style={{fontSize:10, position:'relative', marginTop:10, whiteSpace:'nowrap'}}>
            {currentSelection? `Đang chọn: [${currentSelection.split('-')[0]}] - Nhấp chuột phải để bỏ chọn`: ``}
          </span>
        <SimpleSlider/>
        <PointSliderWithRotation/>

        <div style={{display:'flex', direction:'row', gap:10, marginTop: 20}}>
          <p style={{whiteSpace:'nowrap', fontSize: 12}}>Kích thước phòng</p>
          <input style={{fontSize: 12, textAlign:'center'}}
            type="number"
            value={roomWidth}
            onChange={e => setRoomWidth(Number(e.target.value))}
            min={0}       // giá trị nhỏ nhất
            max={100}     // giá trị lớn nhất
            step={1}      // bước nhảy
          />

          <input style={{fontSize: 12, textAlign:'center'}}
            type="number"
            value={roomLength}
            onChange={e => setRoomLength(Number(e.target.value))}
            min={0}       // giá trị nhỏ nhất
            max={100}     // giá trị lớn nhất
            step={1}      // bước nhảy
          />

          <input style={{fontSize: 12, textAlign:'center'}}
            type="number"
            value={roomHeight}
            onChange={e => setRoomHeight(Number(e.target.value))}
            min={0}       // giá trị nhỏ nhất
            max={100}     // giá trị lớn nhất
            step={1}      // bước nhảy
          />
        </div>

      </div>
      
    </div>
    </Draggable>
    </>
  );
}

export default ModifyControls;
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
    <div style={{ width: 200, marginTop: 20, display:'flex', flexDirection:'row', backgroundColor:"#999" }}>
      <input
        type="range"
        min="1"
        max="360"
        value={value}
        onChange={handleChange}
        style={{ width: "100%" }}
      />
      <div style={{ textAlign: "left", marginTop: 10, whiteSpace:'nowrap', fontSize: 10 }}>
        Hướng phòng: {value}°
      </div>
    </div>
  );
}


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

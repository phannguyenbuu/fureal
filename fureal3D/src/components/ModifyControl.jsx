import * as THREE from "three";
import { useSelection, usePointer } from "../stores/selectionStore";

import React, { useRef, useEffect, useState, useCallback } from "react";
// import { notification } from "antd";
import RoomDoorSlider from "./RoomDoorSlider";
import { Modal, Select, Button, Row, Col, Form, Space } from 'antd';
import Draggable from 'react-draggable';

const { Option } = Select;

const btnStyle = { width: 160, height: 60, background:'rgba(255,255,255,0.75)', display:'flex', 
  flexDirection:'row', fontSize:12, cursor:'pointer', whiteSpace:'nowrap'};


function ModifyControls() {
  const {roomWidth, roomHeight, roomLength, setRoomWidth, setRoomLength, setRoomHeight} = usePointer();
  const { rotateLeft, rotateRight,getResult, deletePointerId } = usePointer();
  const {setCurrentLibNodeSelection, currentSelection, message,setMessage } = useSelection();
  const {addedHighlights, setAddedHighlights, saveJson,loadJson} = usePointer();
  const imgStyle = { width: 30, height: 30 };

  useEffect(()=> {loadJson()},[]);
  // const [api, contextHolder] = notification.useNotification();
  const [isRoomStyleVisible, setRoomStyleVisible] = useState(false);

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

  // useEffect(()=>{
  //   if(!message) return;

  //   message.split('|').forEach(el => {
  //     api.success({
  //       message: el,
  //     });
  //   });
    
  // },[message]);

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

  const handleSave = (values) => {
    console.log('Saved:', values); // { wall1: 'walnut_wood', wall2: 'oak_wood', floor: 'white_marble' }
  };

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
    {/* {contextHolder} */}
    <Draggable nodeRef={nodeRef} handle=".drag-handle">
        
    <div ref={nodeRef} style={{position:'fixed', top:300, right:20}}>
      <div className="drag-handle" style={{width:50, cursor: 'move'}}></div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap:2, padding:20}}>

          
      
          {/* <button style={btnStyle} onClick={() => setRoomStyleVisible(true)}>
            <img src="/images/select.png" style={imgStyle} alt="Rotation" />
            <p>Room Style</p>
          </button> */}

          <button style={btnStyle} onClick={() => rotateCW()}>
            <img src="/images/rotation-icon-left.png" style={imgStyle} alt="Rotation" />
            <p>Rotate 90 CW</p>
          </button>

          <button style={btnStyle} onClick={() => rotateCCW()}>
            <img src="/images/rotation-icon.png" style={imgStyle} alt="Rotation-Left" />
            <p>Rotate 90 CCW</p>
          </button>

          {/* <button style={btnStyle} onClick={saveJson}>
            <img src="/images/save.png" style={imgStyle} alt="Save"/><br/>
            <p>Save</p>
          </button>

          <button style={btnStyle} onClick={loadJson}>
            <img src="/images/load.png" style={imgStyle} alt="Load"/><br/>
            <p>Load</p>
          </button>

          <button style={btnStyle} onClick={() => handleDelete()}>
            <img src="/images/delete.png" style={imgStyle} alt="Save"/><br/>
            <p>Delete</p>
          </button> */}

          <button style={btnStyle} onClick={() => handleDelete()}>
            <img src="/images/delete.png" style={imgStyle} alt="Delete"/><br/>
            <p>Delete</p>
          </button>
        

        
      </div>
      
    </div>
    </Draggable>

     {/* <MaterialPanel 
        visible={isRoomStyleVisible}
        onCancel={() => setRoomStyleVisible(false)}
        onSave={handleSave}
      /> */}
    </>
  );
}

export default ModifyControls;
// import React, { useRef } from "react";
// import { Canvas, useThree } from "@react-three/fiber";


export function RoomAxisSlider() {
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
    <div style={{ width: 150, display:'flex', flexDirection:'row' }}>
      <input
        type="range"
        min="1"
        max="360"
        value={value}
        onChange={handleChange}
        style={{ width: "100%" }}
      />
      <div style={{ textAlign: "left", marginTop: 10, whiteSpace:'nowrap', fontSize: 14 }}>
        Axis: {value}°
      </div>
    </div>
  );
}

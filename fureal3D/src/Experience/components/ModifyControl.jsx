import * as THREE from "three";
import { useSelection, usePointer } from "../../stores/selectionStore";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { notification } from "antd";
import PointSliderWithRotation from "../PointSliderWithRotation";
import { Modal, Select, Button, Row, Col, Form, Space } from 'antd';
import rules from "../rules.json";
import Draggable from 'react-draggable';
import { CloseOutlined } from '@ant-design/icons';
import materials from "../../json/materials.json";

const { Option } = Select;

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
      
          <button style={btnStyle} onClick={() => setRoomStyleVisible(true)}>
            <img src="/images/select.png" style={imgStyle} alt="Rotation" />
            <p>Room Style</p>
          </button>

          <button style={btnStyle} onClick={() => rotateCW()}>
            <img src="/images/rotation-icon-left.png" style={imgStyle} alt="Rotation" />
            <p>Rotate 90 CW</p>
          </button>

          <button style={btnStyle} onClick={() => rotateCCW()}>
            <img src="/images/rotation-icon.png" style={imgStyle} alt="Rotation-Left" />
            <p>Rotate 90 CCW</p>
          </button>

          <button style={btnStyle} onClick={saveJson}>
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
          </button>
          
        </div>

        <div style={{display:'flex', direction:'row', gap:10, marginTop: 20}}>
          <p style={{whiteSpace:'nowrap', fontSize: 12}}>Room Size</p>
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

        <span style={{fontSize:10, position:'relative', marginTop:10, whiteSpace:'nowrap'}}>
            {currentSelection? `Selection: [${currentSelection.split('-')[0]}] - Rightclick to clear selection`: ``}
          </span>
        <SimpleSlider/>
        <PointSliderWithRotation/>

        
      </div>
      
    </div>
    </Draggable>

     <MaterialModal 
        visible={isRoomStyleVisible}
        onCancel={() => setRoomStyleVisible(false)}
        onSave={handleSave}
      />
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

const MaterialModal = ({ visible, onCancel, onSave }) => {
  const [form] = Form.useForm();
  const {
    wallType01, wallMtl01, wallType02, wallMtl02, floorMtl,
    setWallType01, setWallMtl01,setWallType02, setWallMtl02, setFloorMtl} = usePointer();

  // Sample data - thay bằng data thật của bạn
  

  const block_types = [{name: 'Wall', type: 'wall'},{name: 'GlassWall', type: 'glasswall'}];

  const onFinish = (values) => {
    console.log('Selected materials:', values);
    onSave?.(values);  // Callback lưu data
    onCancel();
  };

  const handleSave = useCallback((changedValues, allValues) => {
    // console.log('Form changed:', changedValues, 'All values:', allValues);
    console.log('👆 PARENT: Changing mtl S', wallMtl01, wallMtl02, 
      materials.find(el => el.material === allValues.wallMtl01), 
      materials.find(el => el.material === allValues.wallMtl02),);

    // if(allValues?.wallType01)
      setWallType01(block_types.find(el => el.type === allValues?.wallType01));

    // if(allValues?.wallMtl01)
      setWallMtl01(materials.find(el => el.material === allValues?.wallMtl01));

    // if(allValues?.wallType02)
      setWallType02(block_types.find(el => el.type === allValues?.wallType02));

    // if(allValues?.wallMtl02)
      setWallMtl02(materials.find(el => el.material === allValues?.wallMtl02));

    // if(allValues?.floorMtl)
      setFloorMtl(materials.find(el => el.material === allValues?.floorMtl));

    // console.log("Variables", wallType01, wallType02);
    
    onSave?.(allValues);
  }, [setWallType01, setWallMtl01, setWallType02, setWallMtl02, setFloorMtl, onSave]);

  useEffect(() => {
    if (visible) {
      form.resetFields();

      

      form.setFieldsValue({
        wallType01:wallType01?.type,
        wallMtl01:wallMtl01?.material,
        wallType02:wallType02?.type, 
        wallMtl02:wallMtl02?.material,
        floorMtl:floorMtl?.material,
      });
    }
  }, [visible, form]);

  const WALL_CONFIGS = [
    {
      name: 'Wall 1',
      typeField: 'wallType01',
      mtlField: 'wallMtl01',
      typeState: wallType01,
      setType: setWallType01,
      setMtl: setWallMtl01
    },
    {
      name: 'Wall 2', 
      typeField: 'wallType02',
      mtlField: 'wallMtl02',
      typeState: wallType02,
      setType: setWallType02,
      setMtl: setWallMtl02
    }
  ];


  return (
    <Modal
      title="Click to select material"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="save" type="primary" onClick={() => form.submit()}>
          Lưu
        </Button>
      ]}
      width={600}
      closeIcon={<CloseOutlined />}
    >
      <Form form={form} layout="vertical" 
        onFinish={onFinish} onValuesChange={handleSave}>
        <Row gutter={[16, 16]}>
          {/* Wall 1 */}
          {WALL_CONFIGS.map((config, index) => (
            <Col span={24} key={config.name}>
              <Space direction="horizontal">
                {/* Type Select */}
                <Form.Item 
                  name={config.typeField} 
                  label={`${config.name}`} 
                  rules={[{ required: true, message: 'Click to select type!' }]}
                >
                  <Select placeholder={`Select type ${config.name}`} allowClear style={{width:200, height: 80}}>
                    {block_types.map(item => (
                      <Option key={item.type} value={item.type}>
                        {item.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                
                {config.typeState?.type !== "glasswall"  &&
                <Form.Item 
                  name={config.mtlField} 
                  label="Material" 
                  rules={[{ required: true, message: 'Click to select material!' }]}
                >
                  <Select 
                    placeholder={`Click to select material ${config.name}`} 
                    allowClear 
                    style={{width:300, height: 80}}
                  >
                    {materials.map(item => (
                      <Option key={item.material} value={item.material} style={{height:80}}>
                        <Space>
                          <img src={`${item?.map}`} style={{width:80, height: 80}}/>
                          {item.name}
                        </Space>
                      </Option>
                    ))}
                  </Select>
                </Form.Item>}
              </Space>
            </Col>
          ))}


          {/* Floor */}
          <Col span={24}>
            <Form.Item 
              name="floorMtl" 
              label="Floor" 
              rules={[{ required: true, message: 'Click to select material!' }]}
            >
              <Select placeholder="Click to select material Floor" allowClear style={{maxWidth:400, height: 80}}>
                {materials.map(item => (
                  <Option key={item.material} value={item.material} style={{height:80}}>
                    <Space>
                      <img src={`${item?.map}`} style={{width:80, height: 80}}/>
                      {item.name}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};


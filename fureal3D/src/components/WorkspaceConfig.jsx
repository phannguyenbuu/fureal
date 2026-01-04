import React, {useState, useEffect} from 'react';
import './WorkspaceConfig.css';
import { Space } from 'antd';
import MaterialPanel from './MaterialPanel';
import FiveOptionToggle from './FiveOptionToggle';
import RoomDoorSlider from './RoomDoorSlider';
import { RoomAxisSlider } from './ModifyControl';
import RoomSizeSliders from './RoomSizeSliders';
import { CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';
import { useSelection } from '../stores/selectionStore';

const WorkspaceConfig = () => {
  
  const [isRoomStyleVisible, setRoomStyleVisible] = useState(false);
  const handleSave = (values) => {
    console.log('Saved:', values); // { wall1: 'walnut_wood', wall2: 'oak_wood', floor: 'white_marble' }
  };

  return (
    <div className="configurator-container">
      {/* 3D Car Scene - User handles this */}
      <div className="car-3d-container">
        {/* Your 3D scene goes here */}
      </div>

      {/* Top Left Panel */}
      
      {/* Left Bottom Panel */}
      

      <div className="panel panel-top-left">
        <h3>RoomSize</h3>
        <Space direction='vertical'>
          <div style={{marginTop:-40}}>
            <RoomSizeSliders/>
          </div>
          <div style={{marginTop:-30}}>
            <RoomDoorSlider/>
          </div>
        </Space>
      </div>
      

      {/* Middle Bottom Panel */}
      <div className="panel panel-middle-bottom">
        
      </div>

      {/* Top Right Panel */}
      <div className="panel panel-top-right">
        <div className="panel-content">
          <h3>Price</h3>
          <div className="price">$289,000</div>
        </div>
      </div>

      {/* Bottom Right Panel */}
      <div className="panel panel-bottom-right">
        <div className="panel-content">
          <button className="save-btn">Save Config</button>
          <button className="share-btn">Share</button>
        </div>
      </div>

      {/* Middle Top Panel */}
      <div className="panel panel-middle-top">
        <div className="panel-content">
          <h3>Room Material</h3>
          
          {/* <Space direction="vertical" size="middle" style={{ display: 'flex' }}> */}
            
            <MaterialPanel onCancel={() => setRoomStyleVisible(false)} onSave={handleSave}/>
          {/* </Space> */}

        </div>
      </div>


      <FengshuiPanel/>
    </div>

    
  );
};

export default WorkspaceConfig;

const FengshuiPanel = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPanel, setShowPanel] = useState(false);
  const { message } = useSelection();

  useEffect(() => {
    if (message && message.trim()) {
      setShowPanel(true);
      setIsExpanded(true);
    }
  }, [message]);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const formatMessage = (msg) => {
    if (!msg) return '';
    
    return msg
      .split('|')                    // Tách theo |
      .map(line => `• ${line.trim()}`) // Thêm bullet
      .join('\n');                   // Xuống dòng
  };

  return (
    <div className={`panel panel-left-bottom ${isExpanded ? 'expanded' : 'collapsed'} ${showPanel ? 'show' : 'hide'}`}>
      {/* ✅ HEADER LUÔN Ở ĐẦU */}
      <Space direction='horizontal'>        <h3 style={{margin: 0}}>Fengshui</h3>
        <button className="expand-btn" onClick={toggleExpand}>
          {!isExpanded ? <CaretUpOutlined style={{fontSize: '16px'}} /> : <CaretDownOutlined style={{fontSize: '16px'}} />}
        </button>
        </Space>

      
      {/* ✅ TEXTAREA LÊN ĐẦU khi EXPANDED */}
      {isExpanded && (
          <div style={{padding: '0 20px 12px'}}>
            <textarea 
              value={formatMessage(message)}
              readOnly
              style={{
                width: '100%', height: '160px', 
                fontSize: 14, 
                border: 'none', 
                resize: 'none',
                background: 'none',
                lineHeight: '1.5'
              }}
              placeholder="Phong thủy analysis..."
            />
          </div>
      )}

      {/* Controls - luôn hiện */}
      <div className="controls-section">
        <Space direction='vertical' style={{marginTop: -12, width: '100%'}}>
          <FiveOptionToggle />
          <div style={{marginTop: -20}}>
            <RoomAxisSlider />
          </div>
        </Space>
      </div>
    </div>
  );
};

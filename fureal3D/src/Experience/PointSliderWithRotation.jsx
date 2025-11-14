import React, { useState, useEffect } from 'react';
import { usePointer } from '../stores/selectionStore';

function PointSliderWithRotation() {
  const [sliderValue, setSliderValue] = useState(0);
  const {roomWidth, roomLength, roomDoor, setRoomDoor} = usePointer();
  
   useEffect(() => {
    if (roomDoor !== sliderValue) {
      setSliderValue(roomDoor);
    }
  }, [roomDoor]);

  const onSliderChange = (value) => {
    setSliderValue(value);
    setRoomDoor(value);
  };

  return (
    <div style={{ width: 200, position: 'relative', display:'flex' }}>
      <input
        style={{ width: '100%' }}
        type="range"
        min={0}
        max={1}
        step={0.001}
        value={sliderValue}
        onChange={e => onSliderChange(parseFloat(e.target.value))}
      />
      <div style={{ textAlign: "left", marginTop: 10, whiteSpace:'nowrap', fontSize: 10 }}>
        Vị trí cửa đi
      </div>
    </div>
  );
}

export default PointSliderWithRotation;

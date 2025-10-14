import { Canvas } from '@react-three/fiber'
import { AxesHelper } from 'three'
import _3DMainScreen from './_3DMainScreen'
import { useState } from 'react'
import { state } from '../utils/state'
import { useSnapshot } from 'valtio'
import Sidebar from '../components/3d/Sidebar3d'
import BottomToolbar from '../components/3d/BottomToolbar'
import PhongThuyPopup from '../components/3d/PhongThuyPopup'
import NavBar from '../components/NavBar'

export default function _3DCoreScreen() {
  const [models, setModels] = useState([])
  const snap = useSnapshot(state)
  const [popupInfo, setPopupInfo] = useState(null)
  // mấy cái any2 để sau này xoá để chỉnh lại cái đổi room
  const [roomType, setRoomType] = useState('default') // hoặc 'glb'
  const [roomGLB, setRoomGLB] = useState(null) // ví dụ: 'room2.glb'
  // 
  const addModel = (model_name, name) => {
    const newId = Date.now().toString()
    setModels(oldModels => [...oldModels, { model_name: model_name, name: name, id: newId }])
  }

  return (
    <div style={{ backgroundImage: "url('/background/BG1.png')" }}>
      <NavBar />
      <div style={{ display: 'flex', position: 'relative', height: '100vh' }}>
        <Canvas
          shadows
          camera={{ position: [-12, 12, 0] }}
          onPointerMissed={(e) => {
            if (e.button === 0) {
              state.current = null
              setPopupInfo(null) // ← cái này mới giúp tắt popup
            }
          }}
        >
          {/* <primitive object={new AxesHelper(5)} /> */}
          <_3DMainScreen
            models={models}
            setModels={setModels}
            setPopupInfo={setPopupInfo}
            roomType={roomType}
            roomGLB={roomGLB}
          />
        </Canvas>

        <Sidebar addModel={addModel} />
        <BottomToolbar
          setModels={setModels}
          setRoomType={setRoomType}
          setRoomGLB={setRoomGLB}
        />
        {/* popup nằm ngoài canvas */}
        {popupInfo && (
          <PhongThuyPopup
            menh={popupInfo.menh}
            huong={popupInfo.huong}
            nameModel={popupInfo.name}
          />
        )}
      </div>
    </div>
  );

}
import { useSelection, usePointer } from "../stores/selectionStore";
import furnitures from "./furnitures.json";
import * as THREE from "three";

import React, { useMemo, useState, useRef, useEffect } from "react";

import { useFrame, useThree } from "@react-three/fiber";
import { OrthographicCamera, Box, useGLTF, ContactShadows, useTexture, Decal } from '@react-three/drei';

const PointerHighlight = React.forwardRef((
    {id, isMoving, isSelected, pointer, setMovingId, modelFile, rotationIndex }, ref) => {
  const meshRef = ref || React.useRef();
  const [isHovered, setIsHovered] = React.useState(false);
  const {currentSelection, setCurrentSelection} = useSelection();
  const { setPointer } = usePointer();
  // const [isMoving, setIsMoving] = useState(false);
  const {addedHighlights, setAddedHighlights} = usePointer();
  const model = modelFile ? useGLTF(modelFile) : null;
  const decalTexture = useTexture('/models/Light Room/shadow-circle.png');

const onClickHighlight = () => {
  
  console.log('PH', isMoving, id);
  if (isMoving) {
    setMovingId(null);    // dừng di chuyển nếu đang moving
  } else {
    setMovingId(id);
    // setPointer(id);      // bắt đầu di chuyển đối tượng này
    setCurrentSelection(id);
  }
};

  // const onClickHighlight = () => {
  //   if (isMoving) {
  //     // setIsMoving(false);
  //     setPointer(null);   // reset pointer nếu cần
  //   } else {
  //     // Nếu chưa di chuyển thì bắt đầu di chuyển
  //     // setIsMoving(true);
  //     setPointer(id);  // Đưa id hiện tại làm pointer để nhận biết đang di chuyển highlight nào
  //     setCurrentSelection(id); // Cập nhật selection nếu cần
  //   }
  // };

  // const onClickHighlight = () => {
  //   console.log('Selection', addedHighlights);
  //   setIsMoving(prev => {
  //     if (prev) {
  //       setPointer(null); // reset pointer khi dừng
  //       return false;
  //     }
  //     return true;
  //   });
  // };

  // useEffect(() => {
  //   if (!isSelected) {
  //     setIsMoving(false);
  //   }
  // }, [isSelected]);


  const [bboxSize, setBboxSize] = React.useState([1, 1]);

  useEffect(() => {
    if (meshRef.current) {
      const box = new THREE.Box3().setFromObject(meshRef.current);
      const size = new THREE.Vector3();
      box.getSize(size);
      setBboxSize([size.x, size.y]); // Lưu kích thước width, height của group
    }
  }, [model]);

  useFrame(({ pointer, raycaster, camera }) => {
    if (isMoving && meshRef.current) {
      raycaster.setFromCamera(pointer, camera);
      const planeZ = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const intersectPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(planeZ, intersectPoint);

      meshRef.current.position.x = intersectPoint.x;
      meshRef.current.position.z = intersectPoint.z;

      setCurrentSelection(id);
    }
  });

  // // Cập nhật khi pointer thay đổi ngoài frame move
  // useFrame(() => {
  //   if (meshRef.current) {
  //     if (isMoving && pointer && isSelected) {
  //       // meshRef.current.position.set(pointer[0], pointer[1] + 0.05, pointer[2]);
  //     }
  //   }
  // },[pointer]);


  return (
    <group ref={meshRef} rotation={[0, rotationIndex * Math.PI / 2, 0]} 
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
      onClick={onClickHighlight}
      // raycast={(...args) => THREE.Mesh.prototype.raycast.apply(this, args)} // đảm bảo raycast
      >
      
      {model ? (
        Object.values(model.nodes).map((node, index) => (
          node.geometry && (
            <mesh
              key={index}
              geometry={node.geometry}
              material={model.materials[node.material?.name] || model.materials.default}
              position={node.position}
              rotation={node.rotation}
              scale={isHovered ? node.scale.clone().multiplyScalar(1.1) : node.scale}
              material-transparent={true}
              material-opacity={isHovered ? 0.7 : 1}
            />
          )
        ))
      ) : (
        <mesh>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      )}
    </group>
  );
});

export default PointerHighlight;
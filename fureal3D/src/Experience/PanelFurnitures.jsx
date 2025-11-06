import { useSelection, usePointer } from "../stores/selectionStore";
import furnitures from "./furnitures.json";

const imgStyle = {width:100};
const planeZ = 0.001;

function PanelFurnitures() {
  const { currentLibNodeSelection, setCurrentLibNodeSelection } = useSelection();

  return (
    <div style={{ display: "flex", flexDirection: "column", height:'80vh', overflowY:'auto', gap: 10 }}>
      {furnitures.bedroom.map((btn, index) => {
        const isSelected = currentLibNodeSelection?.name === btn.name;

        return (
          <button
            key={index}
            style={{
              width: 120,
              height: 120,
              padding: 0,
              borderRadius: 5,
              border: isSelected ? "4px solid #00a5beff" : "1px solid #666",
              backgroundColor: isSelected ? "#d0ebff" : "white",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => setCurrentLibNodeSelection(btn)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isSelected ? "#a3d9d8ff" : "#efefef";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isSelected ? "#d0ebff" : "white";
            }}
          >
            
            <img src={btn.preview} style={imgStyle} alt={btn.name} />
            {btn.name}
          </button>
        );
      })}
    </div>
  );
}

export default PanelFurnitures;



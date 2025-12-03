from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, JSON

db = SQLAlchemy()

class Material(db.Model):
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False, unique=True)
    material_type = Column(String(50), default='MeshPhysicalMaterial')  # MeshStandard, MeshPhysical...
    
    # MeshPhysicalMaterial properties
    color = Column(Integer, default=0xffffff)
    metalness = Column(Float, default=0.0)
    roughness = Column(Float, default=1.0)
    transmission = Column(Float, default=0.0)
    thickness = Column(Float, default=0.0)
    ior = Column(Float, default=1.5)
    specularIntensity = Column(Float, default=1.0)
    specularColor = Column(Integer, default=0xffffff)
    clearcoat = Column(Float, default=0.0)
    clearcoatRoughness = Column(Float, default=0.0)
    envMapIntensity = Column(Float, default=1.0)
    
    # Common properties
    transparent = Column(Boolean, default=False)
    opacity = Column(Float, default=1.0)
    side = Column(String(20), default='FrontSide')  # FrontSide, BackSide, DoubleSide
    
    # Textures (JSON)
    normalMap = Column(String(255), default='')
    emissiveMap = Column(String(255), default='')
    aoMap = Column(String(255), default='')
    
    # Metadata
    description = Column(Text)
    created_at = Column(String(50))
    
    def tdict(self):
        return {
            'id': self.id,
            'name': self.name,
            'material_type': self.material_type,
            **self.__dict__
        }

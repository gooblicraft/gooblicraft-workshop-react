import React, { useState } from 'react';

const TexturePickerModal = ({ availableTextures = [], currentSelected, onSelect, onClose }) => {
  const [modalSearchQuery, setModalSearchQuery] = useState('');

  const filteredModalTextures = availableTextures.filter(tex => 
    tex.name.toLowerCase().includes(modalSearchQuery.toLowerCase())
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(2, 6, 16, 0.72)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(22, 27, 34, 0.92)',
        border: '1px solid rgba(255, 255, 255, 0.16)',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '760px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.4)',
        overflow: 'hidden',
        color: '#eaf2ff',
        backdropFilter: 'blur(14px)'
      }}>
        {/* Header / Search input */}
        <div style={{ padding: '20px 20px 15px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6, fontSize: '0.9rem' }}>🔍</span>
            <input 
              type="text" 
              placeholder="SEARCH TEXTURES..." 
              value={modalSearchQuery}
              onChange={(e) => setModalSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 38px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid #444c56',
                borderRadius: '10px',
                color: '#fff',
                outline: 'none',
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                fontWeight: 'bold'
              }}
            />
          </div>
        </div>

        {/* Textures Grid */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {availableTextures.length === 0 ? (
            <p style={{ textAlign: 'center', opacity: 0.7, padding: '30px 0' }}>
              No textures found. Please add some .png files in Texture Storage first!
            </p>
          ) : filteredModalTextures.length === 0 ? (
            <p style={{ textAlign: 'center', opacity: 0.7, padding: '30px 0', color: '#cf222e' }}>
              No textures match "{modalSearchQuery}".
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '16px' }}>
              {filteredModalTextures.map((tex, index) => {
                const cleanName = tex.name.replace(/\.[^/.]+$/, "");
                const isSelected = currentSelected === cleanName;

                return (
                  <div 
                    key={index}
                    onClick={() => {
                      onSelect(cleanName);
                      onClose();
                    }}
                    style={{
                      border: isSelected ? '2px solid #7ee787' : '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '14px',
                      padding: '12px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'rgba(126, 231, 135, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '10px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{
                      width: '100%',
                      height: '80px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      overflow: 'hidden',
                      padding: '8px'
                    }}>
                      <img 
                        src={tex.url} 
                        alt={tex.name} 
                        style={{ width: '56px', height: '56px', objectFit: 'contain', imageRendering: 'pixelated' }} 
                      />
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', wordBreak: 'break-all', color: '#7ee787', lineHeight: '1.2' }}>
                      {tex.name}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '15px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', textAlign: 'right', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
          <button 
            onClick={onClose}
            style={{ 
              padding: '8px 20px', 
              fontSize: '0.85rem', 
              backgroundColor: 'rgba(255, 255, 255, 0.08)', 
              border: '1px solid rgba(255, 255, 255, 0.16)', 
              borderRadius: '8px', 
              cursor: 'pointer',
              color: '#eaf2ff',
              fontWeight: 'bold'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TexturePickerModal;
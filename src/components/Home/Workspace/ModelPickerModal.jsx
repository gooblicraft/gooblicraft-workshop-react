import React, { useState } from 'react';

const MiniModelPreview = ({ content }) => {
  try {
    let geos = [];
    if (Array.isArray(content)) {
      geos = content;
    } else if (content?.["minecraft:geometry"]) {
      geos = content["minecraft:geometry"];
    } else if (content?.format_version && content?.['minecraft:geometry']) {
      geos = content['minecraft:geometry'];
    }

    const targetGeo = geos[0] || content;
    const bones = targetGeo?.bones || [];

    if (!bones || bones.length === 0) return null;

    const allCubes = [];
    bones.forEach(bone => {
      if (bone.cubes) {
        bone.cubes.forEach(cube => allCubes.push(cube));
      }
    });

    if (allCubes.length === 0) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    allCubes.forEach(cube => {
      const origin = cube.origin || [0, 0, 0];
      const size = cube.size || [16, 16, 16];
      const x = origin[0];
      const y = origin[1];
      const w = Math.max(size[0], 1);
      const h = Math.max(size[1], 1);

      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x + w > maxX) maxX = x + w;
      if (y + h > maxY) maxY = y + h;
    });

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2; 
    const maxDim = Math.max(maxX - minX, maxY - minY, 24);
    const padding = maxDim * 0.4; 
    const vbSize = maxDim + padding * 2;
    const vbX = centerX - vbSize / 2;
    const vbY = centerY - vbSize / 2 - 15;

    return (
      <svg viewBox={`${vbX} ${vbY} ${vbSize} ${vbSize}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
        <g transform="scale(1, -1)">
          {allCubes.map((cube, i) => {
            const origin = cube.origin || [0, 0, 0];
            const size = cube.size || [16, 16, 16];
            return (
              <rect
                key={i}
                x={origin[0]}
                y={origin[1]}
                width={Math.max(size[0], 1)}
                height={Math.max(size[1], 1)}
                fill="rgba(127, 176, 255, 0.35)"
                stroke="#7fb0ff"
                strokeWidth={vbSize * 0.015}
                rx={vbSize * 0.01}
              />
            );
          })}
        </g>
      </svg>
    );
  } catch (err) {
    return null;
  }
};

const ModelPickerModal = ({ currentSelected, onSelect, onClose }) => {
  const [modalSearchQuery, setModalSearchQuery] = useState('');

  const savedGeometries = (() => {
    const saved = localStorage.getItem('goobli_available_geometries');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  })();

  const searchNeedle = modalSearchQuery.toLowerCase();
  const filteredModels = savedGeometries.filter((geo) => {
    const name = (geo?.name || '').toLowerCase();
    const path = (geo?.path || '').toLowerCase();
    return name.includes(searchNeedle) || path.includes(searchNeedle);
  });

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
        <div style={{ padding: '20px 20px 15px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6, fontSize: '0.9rem' }}>🔍</span>
            <input 
              type="text"
              placeholder="SEARCH MODELS..." 
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

        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {savedGeometries.length === 0 ? (
            <p style={{ textAlign: 'center', opacity: 0.7, padding: '30px 0' }}>
              No models found. Please upload a models folder in Model Storage first!
            </p>
          ) : filteredModels.length === 0 ? (
            <p style={{ textAlign: 'center', opacity: 0.7, padding: '30px 0', color: '#cf222e' }}>
              No models match "{modalSearchQuery}".
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '16px' }}>
              {filteredModels.map((geo, index) => {
                // Tinatanggal ang .geo.json o .json para maging malinis ang display name
                const cleanDisplayName = (geo?.name || 'unnamed_model').replace(/(\.geo)?\.json$/, "");
                const isSelected = currentSelected === cleanDisplayName;

                return (
                  <div 
                    key={index}
                    onClick={() => {
                      onSelect(cleanDisplayName);
                      onClose();
                    }}
                    style={{
                      border: isSelected ? '2px solid #7ee787' : '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '14px',
                      padding: '14px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'rgba(126, 231, 135, 0.1)' : 'rgba(255, 255, 255, 0.04)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#7ee787', wordBreak: 'break-all', lineHeight: '1.2' }}>
                        {cleanDisplayName}
                      </span>
                      <span style={{ fontSize: '0.65rem', background: 'rgba(127, 176, 255, 0.15)', color: '#7fb0ff', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', flexShrink: 0 }}>
                        GEO
                      </span>
                    </div>

                    <div style={{ 
                      width: '100%', 
                      height: '110px', 
                      background: 'rgba(255, 255, 255, 0.03)', 
                      borderRadius: '10px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      overflow: 'hidden',
                      padding: '10px'
                    }}>
                      <MiniModelPreview content={geo.content} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

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

ModelPickerModal.displayName = 'ModelPickerModal';

export default ModelPickerModal;
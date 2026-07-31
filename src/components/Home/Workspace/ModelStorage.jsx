import React, { useState, useEffect, useRef } from 'react';

// Helper component para sa SVG preview: White glass background, light blue icon, at naka-center nang eksakto sa gitna
const ModelSvgPreview = ({ content }) => {
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

    if (!bones || bones.length === 0) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
          No cubes data
        </div>
      );
    }

    const allCubes = [];
    bones.forEach(bone => {
      if (bone.cubes) {
        bone.cubes.forEach(cube => {
          allCubes.push(cube);
        });
      }
    });

    if (allCubes.length === 0) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>
          Empty bone cubes
        </div>
      );
    }

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
            
            const x = origin[0];
            const y = origin[1];
            const w = Math.max(size[0], 1);
            const h = Math.max(size[1], 1);

            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={w}
                height={h}
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
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#cf222e', fontSize: '0.7rem' }}>
        Render error
      </div>
    );
  }
};

const ModelStorage = ({ availableGeometries, setAvailableGeometries }) => {
  const [localAvailableGeometries, setLocalAvailableGeometries] = useState(() => {
    const saved = localStorage.getItem('goobli_available_geometries');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return []; }
    }
    return [];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);
  
  const geometries = availableGeometries ?? localAvailableGeometries;
  
  const updateGeometries = (updater) => {
    const nextState = typeof updater === 'function' ? updater(geometries) : updater;
    
    if (setAvailableGeometries) {
      setAvailableGeometries(nextState);
    }
    setLocalAvailableGeometries(nextState);
    
    try {
      localStorage.setItem('goobli_available_geometries', JSON.stringify(nextState));
    } catch (err) {
      console.warn("Storage quota exceeded or heavy JSON payload.");
      alert("Nag-ka-quota limit ang localStorage. Masyadong malaki o marami ang mga model files.");
    }
  };

  useEffect(() => {
    if (availableGeometries && availableGeometries.length > 0) {
      setLocalAvailableGeometries(availableGeometries);
      try {
        localStorage.setItem('goobli_available_geometries', JSON.stringify(availableGeometries));
      } catch (err) {
        console.warn("Storage quota exceeded.");
      }
    }
  }, [availableGeometries]);

  const handleFolderUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    setLoadingProgress(0);

    const validFiles = Array.from(files).filter(file => {
      const name = file.name.toLowerCase();
      return name.endsWith('.json') && !name.includes('manifest') && !name.includes('pack_icon');
    });

    if (validFiles.length === 0) {
      alert("Walang nakitang JSON files sa napiling folder.");
      setIsLoading(false);
      e.target.value = '';
      return;
    }

    const newGeos = [];
    let processed = 0;

    for (const file of validFiles) {
      try {
        const textContent = await file.text();
        const content = JSON.parse(textContent);
        
        newGeos.push({
          name: file.name,
          path: file.webkitRelativePath || file.name,
          content: content,
        });
      } catch (err) {
        console.error(`Skipped ${file.name}: Invalid JSON`);
      }

      processed++;
      setLoadingProgress(Math.round((processed / validFiles.length) * 100));

      if (processed % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 5));
      }
    }

    await new Promise(resolve => setTimeout(resolve, 30));

    if (newGeos.length > 0) {
      updateGeometries(prev => {
        const existingPaths = new Set(prev.map(g => g.path));
        const uniqueNewGeos = newGeos.filter(g => !existingPaths.has(g.path));
        return [...prev, ...uniqueNewGeos];
      });
    }

    setIsLoading(false);
    e.target.value = '';
  };

  // Function para mag-delete ng specific model gamit ang path o index nito
  const handleDeleteGeo = (targetPath) => {
    updateGeometries(prev => prev.filter(geo => geo.path !== targetPath));
  };

  const filteredGeometries = geometries.filter(geo => 
    geo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    geo.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="workspace-page" style={{ position: 'relative' }}>
      <div className="workspace-shell">
        <div className="workspace-hero" style={{ textAlign: 'center', paddingBottom: '30px', paddingTop: '0px' }}>
          <div>
            <p className="workspace-eyebrow" style={{ letterSpacing: '2px' }}>RESOURCE PACK</p>
            <h2 className="workspace-title">Model Storage Manager</h2>
            <p className="workspace-subtitle">Piliin ang iyong `models/blocks` folder para awtomatikong i-load at i-save ang lahat ng geometry files.</p>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <section className="workspace-panel" style={{ padding: '30px' }}>
            
            <input
              ref={fileInputRef}
              id="model-folder-input"
              type="file"
              webkitdirectory="true"
              directory="true"
              multiple
              style={{ display: 'none' }}
              onChange={handleFolderUpload}
            />

            <div
              style={{
                border: '2px dashed #444c56',
                borderRadius: '16px',
                padding: '40px 20px',
                textAlign: 'center',
                backgroundColor: 'transparent',
                marginBottom: '30px'
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', textTransform: 'uppercase' }}>Link Models Folder</h3>
                <p style={{ opacity: 0.7, marginBottom: '20px' }}>I-click ang button sa ibaba para piliin ang iyong `models` o `models/blocks` folder.</p>
                <button
                  className="workspace-button workspace-button--secondary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                >
                  {isLoading ? `Binabasa ang mga models... (${loadingProgress}%)` : 'Open Models Folder'}
                </button>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', borderBottom: '1px solid #444c56', paddingBottom: '15px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1.2rem', textTransform: 'uppercase', margin: 0 }}>
                    Loaded Models Library ({filteredGeometries.length} {geometries.length !== filteredGeometries.length ? `/ ${geometries.length}` : ''})
                  </h3>
                  {geometries.length > 0 && (
                    <button 
                      onClick={() => updateGeometries([])}
                      style={{ background: 'none', border: 'none', color: '#cf222e', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold' }}
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {geometries.length > 0 && (
                  <div>
                    <input
                      type="text"
                      placeholder="Maghanap ng model name o path..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: '1px solid #444c56',
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none'
                      }}
                    />
                  </div>
                )}
              </div>

              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <p style={{ opacity: 0.8, color: '#7fb0ff', marginBottom: '10px' }}>Pinoproseso ang mga JSON files... {loadingProgress}%</p>
                  <div style={{ width: '50%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', margin: '0 auto', overflow: 'hidden' }}>
                    <div style={{ width: `${loadingProgress}%`, height: '100%', background: '#7fb0ff', transition: 'width 0.2s ease' }}></div>
                  </div>
                </div>
              ) : geometries.length === 0 ? (
                <p style={{ opacity: 0.7, textAlign: 'center', padding: '40px 0' }}>Wala pang nakakabit na model folder o mga JSON files.</p>
              ) : filteredGeometries.length === 0 ? (
                <p style={{ opacity: 0.7, textAlign: 'center', padding: '40px 0' }}>Walang nahanap na model na tumutugma sa "{searchQuery}".</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                  {filteredGeometries.map((geo, index) => {
                    return (
                      <div
                        key={index}
                        style={{
                          position: 'relative',
                          border: '1px solid rgba(255, 255, 255, 0.15)',
                          borderRadius: '14px',
                          padding: '16px',
                          textAlign: 'left',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}
                      >
                        {/* Header ng Card: Green filename, GEO badge, at Delete 'X' button */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#7ee787', wordBreak: 'break-all', lineHeight: '1.2' }}>
                            {geo.name}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                            <span style={{ fontSize: '0.65rem', background: 'rgba(127, 176, 255, 0.15)', color: '#7fb0ff', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                              GEO
                            </span>
                            <button
                              onClick={() => handleDeleteGeo(geo.path)}
                              title="Delete model"
                              style={{
                                background: 'rgba(207, 34, 46, 0.15)',
                                border: '1px solid rgba(207, 34, 46, 0.3)',
                                color: '#ff7b72',
                                width: '20px',
                                height: '20px',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                padding: 0,
                                lineHeight: 1
                              }}
                            >
                              ×
                            </button>
                          </div>
                        </div>

                        {/* MISMONG VISUAL MODEL PREVIEW */}
                        <div style={{ 
                          width: '100%', 
                          height: '130px', 
                          background: 'rgba(0, 0, 0, 0.2)', 
                          borderRadius: '10px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          overflow: 'hidden',
                          padding: '12px'
                        }}>
                          <ModelSvgPreview content={geo.content} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ModelStorage;
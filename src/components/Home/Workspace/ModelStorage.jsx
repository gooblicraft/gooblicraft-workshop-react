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
  const [isDragging, setIsDragging] = useState(false);
  
  const fileInputRef = useRef(null);
  const singleInputRef = useRef(null);
  const [dirHandle, setDirHandle] = useState(null);
  
  const geometries = availableGeometries ?? localAvailableGeometries;
  
  const updateGeometries = async (updater, newAddedGeos = []) => {
    const nextState = typeof updater === 'function' ? updater(geometries) : updater;
    
    if (setAvailableGeometries) {
      setAvailableGeometries(nextState);
    }
    setLocalAvailableGeometries(nextState);
    
    try {
      localStorage.setItem('goobli_available_geometries', JSON.stringify(nextState));
    } catch (err) {
      console.warn("Storage quota exceeded or heavy JSON payload.");
    }

    // Direktang isinusulat sa napiling folder ang mga bagong idinagdag na models
    if (dirHandle && newAddedGeos.length > 0) {
      try {
        for (const geo of newAddedGeos) {
          const fileHandle = await dirHandle.getFileHandle(geo.name, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(JSON.stringify(geo.content, null, 2));
          await writable.close();
        }
      } catch (err) {
        console.error("Hindi maisulat nang direkta sa folder:", err);
        alert("Hindi maisulat nang direkta sa folder. Subukang i-link ulit ang folder.");
      }
    } else if (!dirHandle && newAddedGeos.length > 0) {
      alert("Paalala: Walang naka-link na direktoryo. Nakaimbak lamang ito sa browser storage. Pindutin ang 'Open Blocks Folder' para ma-save sa disk.");
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

  // Recursive function para pasukin ang mga subfolders sa loob ng blocks folder
  const readDirectoryRecursive = async (handle, pathPrefix = '') => {
    let filesList = [];
    for await (const entry of handle.values()) {
      const currentPath = pathPrefix ? `${pathPrefix}/${entry.name}` : entry.name;
      if (entry.kind === 'file') {
        const name = entry.name.toLowerCase();
        if (name.endsWith('.json') && !name.includes('manifest') && !name.includes('pack_icon')) {
          try {
            const file = await entry.getFile();
            const textContent = await file.text();
            const content = JSON.parse(textContent);
            filesList.push({
              name: entry.name,
              path: currentPath,
              content: content
            });
          } catch (err) {
            console.error(`Skipped ${currentPath}: Invalid JSON`);
          }
        }
      } else if (entry.kind === 'directory') {
        // Recursive call para sa mga subfolders
        const subFiles = await readDirectoryRecursive(entry, currentPath);
        filesList = filesList.concat(subFiles);
      }
    }
    return filesList;
  };

  const handlePickDirectory = async () => {
    if (!window.showDirectoryPicker) {
      fileInputRef.current?.click();
      return;
    }

    try {
      setIsLoading(true);
      setLoadingProgress(20);
      
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      setDirHandle(handle);

      setLoadingProgress(50);
      const loadedGeos = await readDirectoryRecursive(handle);

      setLoadingProgress(100);
      if (loadedGeos.length > 0) {
        updateGeometries(prev => {
          const existingPaths = new Set(prev.map(g => g.path));
          const uniqueNewGeos = loadedGeos.filter(g => !existingPaths.has(g.path));
          return [...prev, ...uniqueNewGeos];
        });
      }
      setIsLoading(false);
      alert(`Matagumpay na nai-load ang ${loadedGeos.length} model files (kasama ang mga nasa subfolders)!`);
    } catch (err) {
      setIsLoading(false);
      if (err.name !== 'AbortError') {
        console.error("Error picking directory:", err);
      }
    }
  };

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
    }

    if (newGeos.length > 0) {
      await updateGeometries(prev => {
        const existingPaths = new Set(prev.map(g => g.path));
        const uniqueNewGeos = newGeos.filter(g => !existingPaths.has(g.path));
        return [...prev, ...uniqueNewGeos];
      }, newGeos);
    }

    setIsLoading(false);
    e.target.value = '';
  };

  const handleFilesAddition = async (fileList) => {
    if (!fileList || fileList.length === 0) return;

    const validFiles = Array.from(fileList).filter(file => {
      const name = file.name.toLowerCase();
      return name.endsWith('.json') && !name.includes('manifest') && !name.includes('pack_icon');
    });

    if (validFiles.length === 0) {
      alert("Mangyaring pumili o mag-drop ng mga valid geometry .json files.");
      return;
    }

    setIsLoading(true);
    const newGeos = [];

    for (const file of validFiles) {
      try {
        const textContent = await file.text();
        const content = JSON.parse(textContent);
        newGeos.push({
          name: file.name,
          path: file.name,
          content: content
        });
      } catch (err) {
        console.error(`Hindi nabasa ang ${file.name}`);
      }
    }

    if (newGeos.length > 0) {
      await updateGeometries(prev => {
        const existingPaths = new Set(prev.map(g => g.path));
        const uniqueNewGeos = newGeos.filter(g => !existingPaths.has(g.path));
        return [...prev, ...uniqueNewGeos];
      }, newGeos);
      alert(`Matagumpay na naidagdag at naisave ang ${newGeos.length} model file(s)!`);
    }

    setIsLoading(false);
  };

  const handleDeleteGeo = async (targetPath) => {
    updateGeometries(prev => prev.filter(geo => geo.path !== targetPath));
    
    if (dirHandle) {
      try {
        await dirHandle.removeEntry(targetPath);
      } catch (e) {
        console.warn("Hindi nabura sa disk folder:", e);
      }
    }
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
            <p className="workspace-subtitle">I-link ang iyong `blocks` folder para basahin ang lahat ng models pati ang mga nasa loob ng subfolders.</p>
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

            <input
              ref={singleInputRef}
              type="file"
              accept=".json"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => handleFilesAddition(e.target.files)}
            />

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFilesAddition(e.dataTransfer.files);
              }}
              style={{
                border: isDragging ? '2px dashed #7ee787' : '2px dashed #444c56',
                borderRadius: '16px',
                padding: '40px 20px',
                textAlign: 'center',
                backgroundColor: isDragging ? 'rgba(126, 231, 135, 0.05)' : 'transparent',
                marginBottom: '30px',
                transition: 'all 0.2s ease'
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', textTransform: 'uppercase' }}>Link Blocks Folder o Mag-drop ng Models</h3>
                <p style={{ opacity: 0.7, marginBottom: '20px' }}>Pumili ng iyong `blocks` folder o i-drag and drop dito ang mga bagong geometry `.json` files.</p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    className="workspace-button workspace-button--secondary"
                    onClick={handlePickDirectory}
                    disabled={isLoading}
                  >
                    {isLoading ? `Binabasa... (${loadingProgress}%)` : 'Open Blocks Folder'}
                  </button>
                  <button
                    className="workspace-button workspace-button--primary"
                    onClick={() => singleInputRef.current?.click()}
                    disabled={isLoading}
                  >
                    + Add Model Files
                  </button>
                </div>
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

              {isLoading && geometries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <p style={{ opacity: 0.8, color: '#7fb0ff', marginBottom: '10px' }}>Pinoproseso ang mga JSON files... {loadingProgress}%</p>
                  <div style={{ width: '50%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', margin: '0 auto', overflow: 'hidden' }}>
                    <div style={{ width: `${loadingProgress}%`, height: '100%', background: '#7fb0ff', transition: 'width 0.2s ease' }}></div>
                  </div>
                </div>
              ) : geometries.length === 0 ? (
                <p style={{ opacity: 0.7, textAlign: 'center', padding: '40px 0' }}>Wala pang nakakabit na blocks folder o mga JSON files.</p>
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

                        {/* Path indicator kung nasa loob ng subfolder */}
                        {geo.path.includes('/') && (
                          <span style={{ fontSize: '0.65rem', opacity: 0.6, color: '#c9d1d9', wordBreak: 'break-all', marginTop: '-6px' }}>
                            📁 {geo.path}
                          </span>
                        )}

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

ModelStorage;
export default ModelStorage;
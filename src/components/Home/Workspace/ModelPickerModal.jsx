import React, { useState, useRef, useEffect } from 'react';
import { useModels } from '../../../hooks/ModelContext'; // Ayusin ang path kung saan mo nilagay ang ModelContext

// Helper component para sa SVG preview
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
  const { geometries, setGeometries, dirHandle, setDirHandle } = useModels();
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const folderInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Keyboard Escape listener para mag-close ang modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Centralized update function na nagse-save din sa disk kung may active dirHandle
  const updateGeometries = async (updater, newAddedGeos = []) => {
    const nextState = typeof updater === 'function' ? updater(geometries) : updater;
    setGeometries(nextState);

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
      }
    }
  };

  // Recursive reader para sa Directory Picker
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
            
            if (content?.["minecraft:geometry"] || content?.format_version || Array.isArray(content)) {
              filesList.push({
                name: entry.name,
                path: currentPath,
                content: content
              });
            }
          } catch (err) {
            console.error(`Skipped ${currentPath}: Invalid JSON`);
          }
        }
      } else if (entry.kind === 'directory') {
        const subFiles = await readDirectoryRecursive(entry, currentPath);
        filesList = filesList.concat(subFiles);
      }
    }
    return filesList;
  };

  // Pagbukas ng Parent Directory (Open Models Folder)
  const handlePickDirectory = async () => {
    if (!window.showDirectoryPicker) {
      folderInputRef.current?.click();
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
      
      setGeometries(loadedGeos);
      setIsLoading(false);
      alert(`Matagumpay na nai-load ang ${loadedGeos.length} geometry files mula sa folder!`);
    } catch (err) {
      setIsLoading(false);
      if (err.name !== 'AbortError') {
        console.error("Error picking directory:", err);
      }
    }
  };

  // Pag-add ng manual files o folder upload
  const handleFilesAddition = async (fileList) => {
    if (!dirHandle) {
      alert("Mangyaring i-click muna ang 'Open Models Folder' bago magdagdag ng files.");
      return;
    }
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
          path: file.webkitRelativePath || file.name,
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

  // Pagbura ng Model
  const handleDeleteGeo = async (targetPath, e) => {
    e.stopPropagation();
    await updateGeometries(prev => prev.filter(geo => geo.path !== targetPath));
    
    if (dirHandle) {
      try {
        await dirHandle.removeEntry(targetPath);
      } catch (err) {
        console.warn("Hindi nabura sa disk folder:", err);
      }
    }
  };

  const searchNeedle = modalSearchQuery.toLowerCase();
  const filteredModels = geometries.filter((geo) => {
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
        maxWidth: '850px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.4)',
        overflow: 'hidden',
        color: '#eaf2ff',
        backdropFilter: 'blur(14px)'
      }}>
        
        {/* HEADER / ACTIONS */}
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.02)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
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

            {/* FOLDER PICKER & FILE UPLOAD BUTTONS */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input 
                ref={fileInputRef}
                type="file"
                accept=".json"
                multiple
                style={{ display: 'none' }}
                onChange={(e) => handleFilesAddition(e.target.files)}
              />

              <button
                onClick={handlePickDirectory}
                disabled={isLoading}
                style={{
                  padding: '9px 14px',
                  fontSize: '0.75rem',
                  backgroundColor: 'rgba(127, 176, 255, 0.15)',
                  border: '1px solid #7fb0ff',
                  borderRadius: '8px',
                  color: '#7fb0ff',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {isLoading ? `Loading... (${loadingProgress}%)` : '📂 Open Models Folder'}
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || !dirHandle}
                style={{
                  padding: '9px 14px',
                  fontSize: '0.75rem',
                  backgroundColor: dirHandle ? 'rgba(126, 231, 135, 0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${dirHandle ? '#7ee787' : '#444'}`,
                  borderRadius: '8px',
                  color: dirHandle ? '#7ee787' : '#666',
                  cursor: dirHandle ? 'pointer' : 'not-allowed',
                  fontWeight: 'bold'
                }}
              >
                + Add Model Files
              </button>
            </div>
          </div>

        </div>

        {/* BODY / LIST OF MODELS */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {!dirHandle ? (
            <p style={{ textAlign: 'center', opacity: '0.7', padding: '40px 0' }}>
              Mag-link muna ng <b>resource_pack/models</b> folder bago makapili ng models.
            </p>
          ) : isLoading && geometries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ opacity: 0.8, color: '#7fb0ff' }}>Binabasa ang mga model files... {loadingProgress}%</p>
            </div>
          ) : geometries.length === 0 ? (
            <p style={{ textAlign: 'center', opacity: 0.7, padding: '30px 0' }}>
              Wala pang nakitang models sa napiling folder.
            </p>
          ) : filteredModels.length === 0 ? (
            <p style={{ textAlign: 'center', opacity: 0.7, padding: '30px 0', color: '#cf222e' }}>
              Walang nahanap na model na tumutugma sa "{modalSearchQuery}".
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '16px' }}>
              {filteredModels.map((geo, index) => {
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
                      position: 'relative',
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
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                        <span style={{ fontSize: '0.65rem', background: 'rgba(127, 176, 255, 0.15)', color: '#7fb0ff', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                          GEO
                        </span>
                        <button
                          onClick={(e) => handleDeleteGeo(geo.path, e)}
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

        {/* FOOTER */}
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
            Close (Esc)
          </button>
        </div>

      </div>
    </div>
  );
};

ModelPickerModal.displayName = 'ModelPickerModal';

export default ModelPickerModal;
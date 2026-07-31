import React, { useState, useEffect, useRef } from 'react';

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
  const fileInputRef = useRef(null);
  
  const geometries = availableGeometries ?? localAvailableGeometries;
  
  const updateGeometries = (updater) => {
    if (setAvailableGeometries) {
      setAvailableGeometries(updater);
    } else {
      setLocalAvailableGeometries(prev => {
        const nextState = typeof updater === 'function' ? updater(prev) : updater;
        try {
          localStorage.setItem('goobli_available_geometries', JSON.stringify(nextState));
        } catch (err) {
          console.warn("Storage quota exceeded or heavy JSON payload.");
        }
        return nextState;
      });
    }
  };

  useEffect(() => {
    if (availableGeometries) {
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

    // Basahin ang mga files nang paunti-unti (chunking) para hindi mabulon ang main thread
    for (const file of validFiles) {
      try {
        const textContent = await file.text();
        // I-parse natin para masigurong valid JSON, pero huwag i-store ang buong text kung napakalaki
        const content = JSON.parse(textContent);
        
        newGeos.push({
          name: file.name,
          path: file.webkitRelativePath || file.name,
          content: content,
          // Gumamit tayo ng object reference o pinaikling data kung sakali
        });
      } catch (err) {
        console.error(`Skipped ${file.name}: Invalid JSON`);
      }

      processed++;
      setLoadingProgress(Math.round((processed / validFiles.length) * 100));

      // Mag-yield sa bawat 5 files para makahinga ang UI at hindi mag-gray out
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

  return (
    <div className="workspace-page" style={{ position: 'relative' }}>
      <div className="workspace-shell">
        <div className="workspace-hero" style={{ textAlign: 'center', paddingBottom: '30px', paddingTop: '0px' }}>
          <div>
            <p className="workspace-eyebrow" style={{ letterSpacing: '2px' }}>RESOURCE PACK</p>
            <h2 className="workspace-title">Model Storage Manager</h2>
            <p className="workspace-subtitle">Piliin ang iyong `models/blocks` folder para awtomatikong i-load ang lahat ng geometry files.</p>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #444c56', paddingBottom: '15px', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '1.2rem', textTransform: 'uppercase', margin: 0 }}>
                  Loaded Models Library ({geometries.length})
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

              {isLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <p style={{ opacity: 0.8, color: '#7fb0ff', marginBottom: '10px' }}>Pinoproseso ang mga JSON files... {loadingProgress}%</p>
                  <div style={{ width: '50%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', margin: '0 auto', overflow: 'hidden' }}>
                    <div style={{ width: `${loadingProgress}%`, height: '100%', background: '#7fb0ff', transition: 'width 0.2s ease' }}></div>
                  </div>
                </div>
              ) : geometries.length === 0 ? (
                <p style={{ opacity: 0.7, textAlign: 'center', padding: '40px 0' }}>Wala pang nakakabit na model folder o mga JSON files.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px' }}>
                  {geometries.map((geo, index) => (
                    <div
                      key={index}
                      style={{
                        position: 'relative',
                        border: '1px solid #444c56',
                        borderRadius: '12px',
                        padding: '14px',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#7fb0ff', wordBreak: 'break-all' }}>
                          {geo.name}
                        </span>
                        <span style={{ fontSize: '0.65rem', background: 'rgba(127, 176, 255, 0.15)', color: '#b8d1ff', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                          GEO
                        </span>
                      </div>
                      <span style={{ fontSize: '0.7rem', opacity: 0.5, wordBreak: 'break-all' }}>
                        Path: {geo.path}
                      </span>
                      <span style={{ fontSize: '0.75rem', opacity: 0.7, color: '#7ee787', marginTop: '4px' }}>
                        Identifier: {geo.name.replace(/\.[^/.]+$/, "")}
                      </span>
                    </div>
                  ))}
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
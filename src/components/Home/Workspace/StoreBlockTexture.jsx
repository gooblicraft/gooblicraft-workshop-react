import React, { useState, useCallback } from 'react';

const StoreBlockTexture = () => {
  const [dirHandle, setDirHandle] = useState(null);
  const [textures, setTextures] = useState([]);
  const [isDragging, setIsDragging] = useState(false);

  // 1. Function para pumili ng folder at i-load ang mga textures
  const selectFolder = async () => {
    if (!window.showDirectoryPicker) {
      alert('Your browser does not support folder selection.');
      return;
    }

    try {
      alert("Please select your 'resource_pack/textures/blocks' folder.");
      const handle = await window.showDirectoryPicker({ mode: 'readwrite' });
      setDirHandle(handle);
      await loadTextures(handle);
    } catch (error) {
      if (error && error.name !== 'AbortError') {
        console.error(error);
        alert('Failed to open the folder.');
      }
    }
  };

  // 2. Function para basahin ang lahat ng .png files sa folder
  const loadTextures = async (handle) => {
    const loadedTextures = [];
    try {
      for await (const entry of handle.values()) {
        // Kukunin lang natin ang mga PNG image files
        if (entry.kind === 'file' && entry.name.endsWith('.png')) {
          const file = await entry.getFile();
          // Gumawa ng temporary URL para ma-display natin yung image
          const url = URL.createObjectURL(file);
          loadedTextures.push({ name: entry.name, url });
        }
      }
      setTextures(loadedTextures);
    } catch (error) {
      console.error("Error loading textures:", error);
    }
  };

  // 3. Drag and Drop Handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (dirHandle) setIsDragging(true);
  }, [dirHandle]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (!dirHandle) {
      alert("Please open the textures folder first before dropping files.");
      return;
    }

    const files = Array.from(e.dataTransfer.files).filter(file => file.type === 'image/png');
    
    if (files.length === 0) {
      alert("Please drop valid PNG files only.");
      return;
    }

    try {
      for (const file of files) {
        // Gagawa ng bagong file o i-o-overwrite yung existing sa folder
        const fileHandle = await dirHandle.getFileHandle(file.name, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(file);
        await writable.close();
      }
      
      // I-reload ang listahan ng textures para lumabas agad yung bago
      await loadTextures(dirHandle);
    } catch (error) {
      console.error("Error saving dropped files:", error);
      alert("Failed to save some textures.");
    }
  }, [dirHandle]);

  return (
    <div className="workspace-page">
      <div className="workspace-shell">
        
        {/* HERO SECTION */}
        <div className="workspace-hero" style={{ textAlign: 'center', paddingBottom: '30px' }}>
          <div>
            <p className="workspace-eyebrow" style={{ letterSpacing: '2px' }}>RESOURCE PACK</p>
            <h2 className="workspace-title">Block Texture Manager</h2>
            <p className="workspace-subtitle">View and drop your block textures directly into your add-on folder.</p>
          </div>
        </div>

        {/* MAIN CONTAINER */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <section className="workspace-panel" style={{ padding: '30px' }}>
            
            {/* DRAG AND DROP ZONE */}
            <div 
              style={{
                border: `2px dashed ${isDragging ? '#7ee787' : '#444c56'}`,
                borderRadius: '16px',
                padding: '50px 20px',
                textAlign: 'center',
                backgroundColor: isDragging ? 'rgba(126, 231, 135, 0.1)' : 'transparent',
                transition: 'all 0.3s ease',
                marginBottom: '30px'
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {!dirHandle ? (
                <div>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', textTransform: 'uppercase' }}>No Folder Selected</h3>
                  <p style={{ opacity: 0.7, marginBottom: '20px' }}>Select your `resource_pack/textures/blocks` folder to start viewing and dropping textures.</p>
                  <button className="workspace-button workspace-button--primary" onClick={selectFolder}>
                    Open Textures Folder
                  </button>
                </div>
              ) : (
                <div>
                  <h3 style={{ color: '#7ee787', margin: '0 0 10px 0', fontSize: '1.2rem', textTransform: 'uppercase' }}>Folder Linked!</h3>
                  <p style={{ opacity: 0.7 }}>
                    {isDragging ? 'Drop your PNG files now!' : 'Drag and drop PNG files here to add them to your folder.'}
                  </p>
                </div>
              )}
            </div>

            {/* TEXTURE GALLERY */}
            {dirHandle && (
              <div>
                <h3 style={{ borderBottom: '1px solid #444c56', paddingBottom: '10px', marginBottom: '20px', fontSize: '1.2rem', textTransform: 'uppercase' }}>
                  Texture Library ({textures.length})
                </h3>
                
                {textures.length === 0 ? (
                  <p style={{ opacity: 0.7, textAlign: 'center', padding: '40px 0' }}>No .png files found in this folder yet.</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '20px' }}>
                    {textures.map((tex, index) => (
                      <div key={index} style={{ border: '1px solid #444c56', borderRadius: '12px', padding: '10px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {/* Note: imageRendering: 'pixelated' is applied to keep Minecraft textures crisp! */}
                        <img src={tex.url} alt={tex.name} style={{ width: '64px', height: '64px', objectFit: 'contain', marginBottom: '10px', imageRendering: 'pixelated' }} />
                        <span style={{ fontSize: '0.75rem', opacity: 0.8, wordBreak: 'break-all' }}>{tex.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
          </section>
        </div>
        
      </div>
    </div>
  );
};

export default StoreBlockTexture;
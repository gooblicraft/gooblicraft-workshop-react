import React, { useState, useCallback } from 'react';

const StoreBlockTexture = () => {
  const [dirHandle, setDirHandle] = useState(null);
  const [textures, setTextures] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
        if (entry.kind === 'file' && entry.name.endsWith('.png')) {
          const file = await entry.getFile();
          const url = URL.createObjectURL(file);
          loadedTextures.push({ name: entry.name, url });
        }
      }
      setTextures(loadedTextures);
    } catch (error) {
      console.error("Error loading textures:", error);
    }
  };

  // 3. Function para mag-delete ng file
  const deleteTexture = async (fileName) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${fileName}"?`);
    if (!confirmDelete) return;

    try {
      await dirHandle.removeEntry(fileName);
      await loadTextures(dirHandle);
    } catch (error) {
      console.error("Error deleting file:", error);
      alert(`Failed to delete ${fileName}.`);
    }
  };

  // 4. Drag and Drop Handlers
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
        const fileHandle = await dirHandle.getFileHandle(file.name, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(file);
        await writable.close();
      }
      
      await loadTextures(dirHandle);
    } catch (error) {
      console.error("Error saving dropped files:", error);
      alert("Failed to save some textures.");
    }
  }, [dirHandle]);

  // 5. Logic para i-filter ang mga textures base sa search query
  const filteredTextures = textures.filter(tex => 
    tex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="workspace-page">
      <div className="workspace-shell">
        
        {/* HERO SECTION */}
        <div className="workspace-hero" style={{ textAlign: 'center', paddingBottom: '30px' }}>
          <div>
            <p className="workspace-eyebrow" style={{ letterSpacing: '2px' }}>RESOURCE PACK</p>
            <h2 className="workspace-title">Block Texture Manager</h2>
            <p className="workspace-subtitle">View, drop, and manage your block textures directly into your add-on folder.</p>
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

            {/* TEXTURE GALLERY & SEARCH */}
            {dirHandle && (
              <div>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  borderBottom: '1px solid #444c56', 
                  paddingBottom: '15px', 
                  marginBottom: '20px' 
                }}>
                  <h3 style={{ fontSize: '1.2rem', textTransform: 'uppercase', margin: 0 }}>
                    Texture Library ({filteredTextures.length})
                  </h3>
                  
                  {/* SEARCH BAR - Crystal / Glassmorphism Effect */}
                  <div style={{ position: 'relative', width: '300px' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.8 }}>🔍</span>
                    <input 
                      type="text" 
                      placeholder="SEARCH TEXTURES..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 10px 10px 35px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)', // Semi-transparent
                        backdropFilter: 'blur(10px)', // Crystal blur effect
                        WebkitBackdropFilter: 'blur(10px)', // Para sa Safari
                        border: '1px solid rgba(255, 255, 255, 0.15)', // Light border highlight
                        borderRadius: '8px',
                        color: '#ffffff', // Balik puti ang text
                        outline: 'none',
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' // Dagdag slight shadow for depth
                      }}
                    />
                  </div>
                </div>
                
                {textures.length === 0 ? (
                  <p style={{ opacity: 0.7, textAlign: 'center', padding: '40px 0' }}>No .png files found in this folder yet.</p>
                ) : filteredTextures.length === 0 ? (
                  <p style={{ opacity: 0.7, textAlign: 'center', padding: '40px 0', color: '#da3633' }}>No textures match your search "{searchQuery}".</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '20px' }}>
                    {filteredTextures.map((tex, index) => (
                      <div 
                        key={index} 
                        style={{ 
                          position: 'relative', 
                          border: '1px solid #444c56', 
                          borderRadius: '12px', 
                          padding: '10px', 
                          textAlign: 'center', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center' 
                        }}
                      >
                        {/* DELETE BUTTON (Ekis) */}
                        <button
                          onClick={() => deleteTexture(tex.name)}
                          title="Delete texture"
                          style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            backgroundColor: '#da3633',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
                            transition: 'transform 0.2s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
                          onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                        >
                          ✕
                        </button>

                        <img src={tex.url} alt={tex.name} style={{ width: '64px', height: '64px', objectFit: 'contain', marginBottom: '10px', imageRendering: 'pixelated' }} />
                        <span style={{ fontSize: '0.75rem', opacity: 0.8, wordBreak: 'break-all', color: '#c9d1d9' }}>{tex.name}</span>
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
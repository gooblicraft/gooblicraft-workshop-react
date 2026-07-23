import React, { useState, useCallback, useRef } from 'react';

const StoreBlockTexture = ({ dirHandle, setDirHandle, textures, setTextures }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);

  // Helper para i-generate at i-save ang terrain_texture.json sa textures/ folder
  const saveTerrainTextureJson = async (texturesDirHandle, loadedTextures) => {
    try {
      const textureDataObj = {};
      loadedTextures.forEach(tex => {
        const cleanName = tex.name.replace(/\.[^/.]+$/, "");
        textureDataObj[cleanName] = {
          "textures": [
            {
              "path": `textures/blocks/${cleanName}`
            }
          ]
        };
      });

      const terrainJsonContent = {
        "resource_pack_name": "custom_addon",
        "texture_name": "atlas.terrain",
        "padding": 8,
        "num_mip_levels": 4,
        "texture_data": textureDataObj
      };

      const terrainFileHandle = await texturesDirHandle.getFileHandle('terrain_texture.json', { create: true });
      const writable = await terrainFileHandle.createWritable();
      await writable.write(JSON.stringify(terrainJsonContent, null, 2));
      await writable.close();
    } catch (error) {
      console.error("Error saving terrain_texture.json:", error);
    }
  };

  // 1. Function para pumili ng 'textures' folder
  const selectFolder = async () => {
    if (!window.showDirectoryPicker) {
      alert('Your browser does not support folder selection.');
      return;
    }

    try {
      alert("Please select your 'resource_pack/textures' folder.");
      const texturesHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      const blocksHandle = await texturesHandle.getDirectoryHandle('blocks', { create: true });
      
      setDirHandle(texturesHandle);
      await loadTextures(blocksHandle, texturesHandle);
    } catch (error) {
      if (error && error.name !== 'AbortError') {
        console.error(error);
        alert('Failed to open the folder.');
      }
    }
  };

  // 2. Function para basahin ang mga .png files
  const loadTextures = async (blocksHandle, texturesHandle) => {
    const loadedTextures = [];
    try {
      for await (const entry of blocksHandle.values()) {
        if (entry.kind === 'file' && entry.name.endsWith('.png')) {
          const file = await entry.getFile();
          const url = URL.createObjectURL(file);
          loadedTextures.push({ name: entry.name, url });
        }
      }
      setTextures(loadedTextures);

      if (texturesHandle) {
        await saveTerrainTextureJson(texturesHandle, loadedTextures);
      }
    } catch (error) {
      console.error("Error loading textures:", error);
    }
  };

  // 3. Function para mag-delete ng file
  const deleteTexture = async (fileName) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${fileName}"?`);
    if (!confirmDelete) return;

    try {
      const blocksHandle = await dirHandle.getDirectoryHandle('blocks');
      await blocksHandle.removeEntry(fileName);
      await loadTextures(blocksHandle, dirHandle);
    } catch (error) {
      console.error("Error deleting file:", error);
      alert(`Failed to delete ${fileName}.`);
    }
  };

  // 4. Save files helper para sa Drop at Browse
  const saveFilesToBlocksFolder = async (fileList) => {
    if (!dirHandle) return;

    try {
      const blocksHandle = await dirHandle.getDirectoryHandle('blocks', { create: true });
      for (const file of fileList) {
        const fileHandle = await blocksHandle.getFileHandle(file.name, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(file);
        await writable.close();
      }
      await loadTextures(blocksHandle, dirHandle);
    } catch (error) {
      console.error("Error saving files:", error);
      alert("Failed to save some textures.");
    }
  };

  // 5. Drag and Drop Handlers
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

    await saveFilesToBlocksFolder(files);
  }, [dirHandle]);

  // 6. Click to Browse File Handler
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files).filter(file => file.type === 'image/png');
    if (files.length === 0) return;

    await saveFilesToBlocksFolder(files);
    e.target.value = null; // Reset input
  };

  // 7. Logic para i-filter ang mga textures base sa search query
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
            <p className="workspace-subtitle">View, drop, browse, and manage your block textures directly into your add-on folder.</p>
          </div>
        </div>

        {/* MAIN CONTAINER */}
        <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <section className="workspace-panel" style={{ padding: '30px' }}>
            
            {/* HIDDEN FILE INPUT PARA SA BROWSE BUTTON */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              multiple 
              accept="image/png" 
              style={{ display: 'none' }} 
            />

            {/* DRAG, DROP & BROWSE ZONE */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${isDragging ? '#7ee787' : '#444c56'}`,
                borderRadius: '16px',
                padding: '40px 20px',
                textAlign: 'center',
                backgroundColor: isDragging ? 'rgba(126, 231, 135, 0.1)' : 'transparent',
                transition: 'all 0.3s ease',
                marginBottom: '30px'
              }}
            >
              {!dirHandle ? (
                <div>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', textTransform: 'uppercase' }}>No Folder Selected</h3>
                  <p style={{ opacity: 0.7, marginBottom: '20px' }}>Select your `resource_pack/textures` folder to start managing your textures and terrain mapping.</p>
                  <button className="workspace-button workspace-button--primary" onClick={selectFolder}>
                    Open Textures Folder
                  </button>
                </div>
              ) : (
                <div>
                  <h3 style={{ color: '#7ee787', margin: '0 0 10px 0', fontSize: '1.2rem', textTransform: 'uppercase' }}>Folder Linked!</h3>
                  <p style={{ opacity: 0.7, marginBottom: '20px' }}>
                    {isDragging ? 'Drop your PNG files now!' : 'Drag and drop PNG files here or click browse to upload.'}
                  </p>
                  <button 
                    className="workspace-button workspace-button--secondary" 
                    onClick={() => fileInputRef.current.click()}
                  >
                    Browse PNG Files
                  </button>
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
                  
                  {/* SEARCH BAR */}
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
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        outline: 'none',
                        fontSize: '0.9rem',
                        textTransform: 'uppercase',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </div>
                </div>
                
                {textures.length === 0 ? (
                  <p style={{ opacity: 0.7, textAlign: 'center', padding: '40px 0' }}>No .png files found in the blocks folder yet.</p>
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
                        {/* DELETE BUTTON */}
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
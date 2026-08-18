import React, { useState, useRef, useEffect } from 'react';
import { useTextures } from '../../../hooks/TextureContext'; 

const TexturePickerModal = ({ currentSelected, onSelect, onClose }) => {
  const { textures, setTextures, dirHandle, setDirHandle } = useTextures();
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const saveTerrainTextureJson = async (texturesDirHandle, loadedTextures) => {
    try {
      const textureDataObj = {};
      loadedTextures.forEach(tex => {
        const cleanName = tex.name.replace(/\.[^/.]+$/, "");
        textureDataObj[cleanName] = { "textures": [{ "path": `textures/blocks/${cleanName}` }] };
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
    } catch (error) { console.error("Error saving terrain_texture.json:", error); }
  };

  const loadTextures = async (blocksHandle, texturesHandle) => {
    const loadedTextures = [];
    for await (const entry of blocksHandle.values()) {
      if (entry.kind === 'file' && entry.name.endsWith('.png')) {
        const file = await entry.getFile();
        const url = URL.createObjectURL(file);
        loadedTextures.push({ name: entry.name, url });
      }
    }
    setTextures(loadedTextures);
    return loadedTextures;
  };

  const handlePickDirectory = async () => {
    if (!window.showDirectoryPicker) return;
    try {
      setIsLoading(true);
      setLoadingMessage("Binubuksan ang textures folder...");
      const texturesHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      const blocksHandle = await texturesHandle.getDirectoryHandle('blocks', { create: true });
      
      setDirHandle(texturesHandle);
      const loaded = await loadTextures(blocksHandle, texturesHandle);
      await saveTerrainTextureJson(texturesHandle, loaded);
      setIsLoading(false);
    } catch (error) { setIsLoading(false); if (error.name !== 'AbortError') console.error(error); }
  };

  const handleFilesAddition = async (fileList) => {
    if (!dirHandle) { alert("Please open the textures folder first."); return; }
    
    const filesArray = Array.from(fileList).filter(f => f.type === 'image/png');
    if (filesArray.length === 0) return;

    try {
      setIsLoading(true);
      let processedCount = 0;
      const blocksHandle = await dirHandle.getDirectoryHandle('blocks', { create: true });
      
      for (const file of filesArray) {
        const fileHandle = await blocksHandle.getFileHandle(file.name, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(file);
        await writable.close();
        processedCount++;
        setProgressPercent(Math.round((processedCount / filesArray.length) * 100));
        setLoadingMessage(`Saving textures... ${processedCount}/${filesArray.length}`);
      }

      setLoadingMessage("Updating terrain_texture.json...");
      const loaded = await loadTextures(blocksHandle, dirHandle);
      await saveTerrainTextureJson(dirHandle, loaded);
      
      setIsLoading(false);
    } catch (error) { setIsLoading(false); console.error(error); }
  };

  const deleteTexture = async (fileName, e) => {
    e.stopPropagation();
    try {
      setIsLoading(true);
      const blocksHandle = await dirHandle.getDirectoryHandle('blocks');
      await blocksHandle.removeEntry(fileName);
      const loaded = await loadTextures(blocksHandle, dirHandle);
      await saveTerrainTextureJson(dirHandle, loaded);
      setIsLoading(false);
    } catch (error) { setIsLoading(false); alert(`Failed to delete.`); }
  };

  // SMART SEARCH: Pinapalitan ang space ng underscore (_) para madaling mahanap
  const formattedSearchQuery = modalSearchQuery.trim().toLowerCase().replace(/\s+/g, '_');
  const filteredTextures = textures.filter(t => 
    t.name.toLowerCase().includes(formattedSearchQuery)
  );

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(2, 6, 16, 0.72)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
      
      {/* LOADING OVERLAY */}
      {isLoading && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', padding: '20px' }}>
          <div style={{ width: '80%', maxWidth: '400px', textAlign: 'center' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '12px' }}>{loadingMessage}</p>
            <div style={{ width: '100%', height: '12px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '6px', overflow: 'hidden' }}>
              <div style={{ height: '100%', backgroundColor: '#7ee787', width: `${progressPercent}%`, transition: 'width 0.2s ease-out' }} />
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONTAINER */}
      <div style={{ background: 'rgba(22, 27, 34, 0.92)', border: '1px solid rgba(255, 255, 255, 0.16)', borderRadius: '16px', width: '100%', maxWidth: '850px', maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0, 0, 0, 0.4)', color: '#eaf2ff' }}>
        
        {/* HEADER / SEARCH & UPLOAD BUTTONS */}
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.02)' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <span style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6, fontSize: '0.9rem' }}>🔍</span>
            <input 
              type="text" placeholder="SEARCH TEXTURES..." value={modalSearchQuery}
              onChange={(e) => setModalSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 38px', backgroundColor: 'rgba(0, 0, 0, 0.3)', border: '1px solid #444c56', borderRadius: '10px', color: '#fff', outline: 'none', fontSize: '0.85rem', textTransform: 'uppercase', fontWeight: 'bold' }}
            />
          </div>

          <button 
            onClick={handlePickDirectory} 
            style={{ padding: '10px 16px', backgroundColor: 'rgba(127, 176, 255, 0.15)', border: '1px solid #7fb0ff', color: '#7fb0ff', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
          >
            📂 Open Folder
          </button>

          <button 
            onClick={() => fileInputRef.current.click()} 
            disabled={!dirHandle} 
            style={{ padding: '10px 16px', backgroundColor: dirHandle ? 'rgba(126, 231, 135, 0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${dirHandle ? '#7ee787' : '#444'}`, color: dirHandle ? '#7ee787' : '#666', borderRadius: '10px', cursor: dirHandle ? 'pointer' : 'not-allowed', fontWeight: 'bold', fontSize: '0.8rem' }}
          >
            + Add Files
          </button>
          
          <input ref={fileInputRef} type="file" multiple accept="image/png" style={{ display: 'none' }} onChange={(e) => handleFilesAddition(e.target.files)} />
        </div>

        {/* BODY / TEXTURE GALLERY */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {textures.length === 0 ? (
             <p style={{ textAlign: 'center', opacity: 0.7, padding: '40px 0' }}>
               Mag-link muna ng <b>resource_pack/textures</b> folder o mag-add ng files para makita ang iyong mga textures.
             </p>
          ) : filteredTextures.length === 0 ? (
            <p style={{ textAlign: 'center', opacity: 0.7, padding: '40px 0', color: '#cf222e' }}>
              Walang texture na tumutugma sa "{modalSearchQuery}".
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '16px' }}>
              {filteredTextures.map((tex, index) => {
                 const cleanName = tex.name.replace(/\.[^/.]+$/, "");
                 const isSelected = currentSelected === cleanName;
                 return (
                   <div 
                     key={index} 
                     onClick={() => { onSelect(cleanName); onClose(); }} 
                     style={{ 
                       position: 'relative', 
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
                     {/* PERFECT CIRCLE DELETE BUTTON */}
                     <button 
                       onClick={(e) => deleteTexture(tex.name, e)} 
                       title="Delete Texture"
                       style={{ 
                         position: 'absolute', 
                         top: '-6px', 
                         right: '-6px', 
                         background: '#cf222e', 
                         border: 'none', 
                         borderRadius: '50%', 
                         color: 'white', 
                         cursor: 'pointer', 
                         width: '22px', 
                         height: '22px', 
                         display: 'flex', 
                         alignItems: 'center', 
                         justifyContent: 'center',
                         padding: 0,
                         fontSize: '12px',
                         fontWeight: 'bold',
                         boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                       }}
                     >
                       ✕
                     </button>

                     <div style={{ 
                       width: '100%', 
                       height: '70px', 
                       background: 'rgba(255, 255, 255, 0.03)', 
                       borderRadius: '10px', 
                       display: 'flex', 
                       alignItems: 'center', 
                       justifyContent: 'center',
                       border: '1px solid rgba(255, 255, 255, 0.08)',
                       overflow: 'hidden',
                       padding: '6px'
                     }}>
                       <img src={tex.url} alt={tex.name} style={{ width: '50px', height: '50px', objectFit: 'contain', imageRendering: 'pixelated' }} />
                     </div>

                     {/* FULL NAME DISPLAY (HINDI NA NAGDIDIkit-dikit, NAKAKA-WRAP NA) */}
                     <span 
                       style={{ 
                         fontSize: '0.68rem', 
                         fontWeight: 'bold',
                         color: isSelected ? '#7ee787' : '#c9d1d9', 
                         width: '100%',
                         wordBreak: 'break-word',
                         lineHeight: '1.2'
                       }} 
                       title={tex.name}
                     >
                       {cleanName}
                     </span>
                   </div>
                 );
              })}
            </div>
          )}
        </div>

        {/* FOOTER / CLOSE BUTTON */}
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

export default TexturePickerModal;
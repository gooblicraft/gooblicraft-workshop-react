import React, { useState } from 'react';
import { generateUUID } from '../../../utils/uuid';
import usePackIcon from '../../../hooks/usePackIcon';

const PackGenerator = () => {
  // 1. Initialize state with your exact manifest structure
  const [manifest, setManifest] = useState({
    format_version: 2,
    metadata: {
      authors: ["Gooblicraft"],
    },
    header: {
      name: "My Own Addon Project",
      description: "This is my own addon project",
      min_engine_version: [26, 23],
      uuid: generateUUID(),
      version: [2, 0, 0]
    },
    modules: [
      { type: "resources", uuid: generateUUID(), version: [1, 0, 0] }
    ],
    dependencies: [
      { uuid: generateUUID(), version: [2, 0, 0] }
    ]
  });

  // Regenerate all uuids in the manifest (header, modules, dependencies)
  const regenerateUuids = () => {
    setManifest(prev => {
      const updated = { ...prev };
      updated.header = { ...updated.header, uuid: generateUUID() };
      updated.modules = updated.modules.map(m => ({ ...m, uuid: generateUUID() }));
      updated.dependencies = updated.dependencies.map(d => ({ ...d, uuid: generateUUID() }));
      return updated;
    });
  };

  const sanitizeFolderName = (name) => {
    return name
      .trim()
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\s+/g, ' ')
      .replace(/^\.+/, '')
      .slice(0, 120) || 'addon';
  };

  const createAddonFolderStructure = async () => {
    const addonName = sanitizeFolderName(manifest.header.name);

    if (!window.showDirectoryPicker) {
      alert('Your browser does not support folder creation from the page.');
      return;
    }

    try {
      const rootHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      const addonFolder = await rootHandle.getDirectoryHandle(addonName, { create: true });
      const modelsFolder = await addonFolder.getDirectoryHandle('models', { create: true });
      const texturesFolder = await addonFolder.getDirectoryHandle('textures', { create: true });
      await modelsFolder.getDirectoryHandle('blocks', { create: true });
      await texturesFolder.getDirectoryHandle('blocks', { create: true });
      const terrainTexture = {
        resource_pack_name: manifest.header.name,
        texture_name: 'atlas.terrain',
        padding: 8,
        num_mip_levels: 4,
        texture_data: {
          example_texture1: {
            textures: [{ path: 'textures/blocks/example_texture1' }]
          }
        }
      };
      const terrainTextureHandle = await texturesFolder.getFileHandle('terrain_texture.json', { create: true });
      const terrainTextureWritable = await terrainTextureHandle.createWritable();
      await terrainTextureWritable.write(`${JSON.stringify(terrainTexture, null, 2)}\n`);
      await terrainTextureWritable.close();
      const manifestHandle = await addonFolder.getFileHandle('manifest.json', { create: true });
      const writable = await manifestHandle.createWritable();
      await writable.write(`${JSON.stringify(manifest, null, 2)}\n`);
      await writable.close();
      // write pack_icon.png into addon folder (use uploaded file if present, otherwise fetch preview URL)
      try {
        const iconHandle = await addonFolder.getFileHandle('pack_icon.png', { create: true });
        const iconWritable = await iconHandle.createWritable();
        if (packIconFile) {
          await iconWritable.write(packIconFile);
        } else if (packIconUrl) {
          const res = await fetch(packIconUrl);
          const blob = await res.blob();
          await iconWritable.write(blob);
        }
        await iconWritable.close();
      } catch (e) {
        // ignore icon write errors but notify user
        console.warn('Could not write pack_icon.png', e);
      }
      alert(`Created folder structure inside ${addonName}`);
    } catch (error) {
      if (error && error.name !== 'AbortError') {
        alert('Failed to create the folder structure.');
      }
    }
  };

  // pack icon hook (drag/drop, preview, download)
  const { packIconFile, packIconUrl, handlePackIconFile, onIconDrop, onIconDragOver, downloadPackIcon } = usePackIcon();
  const [showManifest, setShowManifest] = useState(false);

  // 2. The unified updater function
  const handleUpdate = (field, value) => {
    setManifest((prev) => {
      const updated = { ...prev };

      if (field === 'name' || field === 'description') {
        updated.header = { ...updated.header, [field]: value };
      } 
      
      else if (field === 'author') {
        updated.metadata = {
          ...updated.metadata,
          authors: [value]
        };
      } 
      
      else if (field === 'min_engine_version') {
        // Convert dropdown string (e.g. "1.21.90") to integer array [1, 21, 90]
        // If it's a version like "26.23", it maps to [26, 23]
        const versionArray = value.split('.').map(num => parseInt(num, 10) || 0);
        updated.header = { ...updated.header, min_engine_version: versionArray };
      }

      return updated;
    });
  };

  return (
    <div style={{ display: 'flex', gap: '40px', padding: '20px', fontFamily: 'sans-serif' }}>
      
      {/* LEFT SIDE: Your UI inputs */}
      <div style={ showManifest ? { width: '400px', display: 'flex', flexDirection: 'column', gap: '15px' } : { flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>Make Your Own Add-on</h2>
          <button onClick={() => setShowManifest(s => !s)} style={{ padding: '6px 10px' }}>{showManifest ? 'Hide manifest' : 'Show manifest'}</button>
        </div>
        
        <label>
          Addon Name:
          <input 
            type='text' 
            placeholder='Input the Name of Your Addon' 
            value={manifest.header.name}
            onChange={(e) => handleUpdate('name', e.target.value)}
            style={inputStyle}
          />
        </label>

        <label>
          Minimum Minecraft Version:
          <select
            // Join array with dots to match the select option value format
            value={manifest.header.min_engine_version.join('.')}
            onChange={(e) => handleUpdate('min_engine_version', e.target.value)}
            style={inputStyle}
          >
            <option value="26.23">26.23</option>
            <option value="26.20">26.20</option>
            <option value="26.1">26.1</option>
            <option value="26.0">26.0</option>
            <option value="1.21.90">1.21.90</option>
            <option value="1.21.80">1.21.80</option>
            <option value="1.21.70">1.21.70</option>
          </select>
        </label>

        <label>
          Creator Name:
          <input 
            type='text' 
            placeholder='Creator Name' 
            value={manifest.metadata.authors[0] || ''}
            onChange={(e) => handleUpdate('author', e.target.value)}
            style={inputStyle}
          />
        </label>

        <label>
          Addon Description:
          <input 
            type='text' 
            placeholder='Addon Description' 
            value={manifest.header.description}
            onChange={(e) => handleUpdate('description', e.target.value)}
            style={inputStyle}
          />
        </label>

        <div
          onDrop={onIconDrop}
          onDragOver={onIconDragOver}
          style={{ border: '2px dashed #666', padding: '12px', borderRadius: '6px', marginTop: '8px', textAlign: 'center' }}
        >
          <p style={{ margin: 0 }}>Drag & drop a PNG here to set your own icon</p>
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#ccc' }}>or</p>
          <input
            type="file"
            accept="image/png"
            onChange={(e) => handlePackIconFile(e.target.files && e.target.files[0])}
            style={{ marginTop: '8px' }}
          />
          {packIconUrl && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px', justifyContent: 'center' }}>
              <img src={packIconUrl} alt="pack icon preview" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />
            </div>
          )}

        </div>

        <div>
          <button onClick={regenerateUuids} style={{ marginTop: '10px', padding: '8px 12px' }}>Regenerate UUIDs</button>
        </div>

        <div>
          <button onClick={createAddonFolderStructure} style={{ marginTop: '10px', padding: '8px 12px' }}>Create addon folders</button>
        </div>
      </div>

      

      {/* RIGHT SIDE: Live output stream */}
      {showManifest && (
        <div style={{ flex: 1, textAlign: 'left', alignSelf: 'stretch' }}>
          <h2>Live manifest.json</h2>
          <pre style={{ background: '#1e1e1e', color: '#fff', padding: '15px', borderRadius: '5px', overflowX: 'auto', textAlign: 'left', whiteSpace: 'pre', margin: 0 }}>
{JSON.stringify(manifest, null, 2)}
          </pre>
        </div>
      )}

    </div>
  );
};

const inputStyle = {
  display: 'block',
  width: '100%',
  padding: '8px',
  marginTop: '5px',
  boxSizing: 'border-box'
};

export default PackGenerator;

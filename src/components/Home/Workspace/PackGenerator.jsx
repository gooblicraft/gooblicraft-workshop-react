import React, { useState } from 'react';
import { generateUUID } from '../../../utils/uuid';
import usePackIcon from '../../../hooks/usePackIcon';

const createBehaviorPackUuids = () => ({
  header: generateUUID(),
  module: generateUUID(),
});

const createResourceManifest = (behaviorPackHeaderUuid) => ({
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
    { uuid: behaviorPackHeaderUuid, version: [2, 0, 0] }
  ]
});

const createBehaviorManifest = (resourceManifest, behaviorPackUuids) => ({
  format_version: 2,
  metadata: {
    authors: resourceManifest.metadata.authors,
  },
  header: {
    name: resourceManifest.header.name,
    description: resourceManifest.header.description,
    min_engine_version: resourceManifest.header.min_engine_version,
    uuid: behaviorPackUuids.header,
    version: resourceManifest.header.version
  },
  modules: [
    { type: "data", uuid: behaviorPackUuids.module, version: [1, 0, 0] }
  ],
  dependencies: [
    { uuid: resourceManifest.header.uuid, version: resourceManifest.header.version }
  ]
});

const PackGenerator = () => {
  // 1. Initialize state with your exact manifest structure
  const [behaviorPackUuids, setBehaviorPackUuids] = useState(() => createBehaviorPackUuids());
  const [manifest, setManifest] = useState(() => createResourceManifest(behaviorPackUuids.header));

  // Regenerate all uuids in the manifest (header, modules, dependencies)
  const regenerateUuids = () => {
    const nextBehaviorPackUuids = createBehaviorPackUuids();
    setBehaviorPackUuids(nextBehaviorPackUuids);
    setManifest(prev => {
      const updated = { ...prev };
      updated.header = { ...updated.header, uuid: generateUUID() };
      updated.modules = updated.modules.map(m => ({ ...m, uuid: generateUUID() }));
      updated.dependencies = updated.dependencies.map(d => ({
        ...d,
        uuid: nextBehaviorPackUuids.header,
      }));
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
      const resourcePackFolder = await addonFolder.getDirectoryHandle('resource_pack', { create: true });
      const behaviorPackFolder = await addonFolder.getDirectoryHandle('behavior_pack', { create: true });

      const resourceModelsFolder = await resourcePackFolder.getDirectoryHandle('models', { create: true });
      const resourceTexturesFolder = await resourcePackFolder.getDirectoryHandle('textures', { create: true });
      await resourceModelsFolder.getDirectoryHandle('blocks', { create: true });
      await resourceTexturesFolder.getDirectoryHandle('blocks', { create: true });

      await behaviorPackFolder.getDirectoryHandle('blocks', { create: true });

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

      const behaviorManifest = createBehaviorManifest(manifest, behaviorPackUuids);

      const writeJsonFile = async (folderHandle, fileName, data) => {
        const fileHandle = await folderHandle.getFileHandle(fileName, { create: true });
        const fileWritable = await fileHandle.createWritable();
        await fileWritable.write(`${JSON.stringify(data, null, 2)}\n`);
        await fileWritable.close();
      };

      await writeJsonFile(resourcePackFolder, 'terrain_texture.json', terrainTexture);
      await writeJsonFile(resourcePackFolder, 'manifest.json', manifest);
      await writeJsonFile(behaviorPackFolder, 'manifest.json', behaviorManifest);

      const iconSource = packIconFile || (packIconUrl ? await (await fetch(packIconUrl)).blob() : null);

      const writePackIcon = async (folderHandle) => {
        if (!iconSource) return;
        const iconHandle = await folderHandle.getFileHandle('pack_icon.png', { create: true });
        const iconWritable = await iconHandle.createWritable();
        await iconWritable.write(iconSource);
        await iconWritable.close();
      };

      await writePackIcon(resourcePackFolder);
      await writePackIcon(behaviorPackFolder);

      alert(`Created resource and behavior pack folders inside ${addonName}`);
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
          <button onClick={createAddonFolderStructure} style={{ marginTop: '10px', padding: '8px 12px' }}>Create resource and behavior folders</button>
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

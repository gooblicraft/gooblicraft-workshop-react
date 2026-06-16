import React, { useState } from 'react';
import { generateUUID } from '../../../utils/uuid';
import usePackIcon from '../../../hooks/usePackIcon';
import './PackGenerator.css';

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
    <div className="workspace-page">
      <div className="workspace-shell">
        <div className="workspace-hero">
          <div>
            <p className="workspace-eyebrow">Workspace</p>
            <h2 className="workspace-title">Make Your Own Add-on</h2>
            <p className="workspace-subtitle">Create a minimal resource pack and behavior pack setup with a clean Minecraft-style workflow.</p>
          </div>
        </div>

        <div className={showManifest ? 'workspace-grid workspace-grid--with-manifest' : 'workspace-grid'}>
          <section className="workspace-panel">
            <div className="workspace-field-stack">
              <label className="workspace-label">
                Addon Name:
                <input 
                  type='text' 
                  placeholder='Input the Name of Your Addon' 
                  value={manifest.header.name}
                  onChange={(e) => handleUpdate('name', e.target.value)}
                  className="workspace-input"
                />
              </label>

              <label className="workspace-label">
                Minimum Minecraft Version:
                <select
                  // Join array with dots to match the select option value format
                  value={manifest.header.min_engine_version.join('.')}
                  onChange={(e) => handleUpdate('min_engine_version', e.target.value)}
                  className="workspace-input"
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

              <label className="workspace-label">
                Creator Name:
                <input 
                  type='text' 
                  placeholder='Creator Name' 
                  value={manifest.metadata.authors[0] || ''}
                  onChange={(e) => handleUpdate('author', e.target.value)}
                  className="workspace-input"
                />
              </label>

              <label className="workspace-label">
                Addon Description:
                <input 
                  type='text' 
                  placeholder='Addon Description' 
                  value={manifest.header.description}
                  onChange={(e) => handleUpdate('description', e.target.value)}
                  className="workspace-input"
                />
              </label>
            </div>

            <div
              onDrop={onIconDrop}
              onDragOver={onIconDragOver}
              className="workspace-drop-zone"
            >
              <p className="workspace-drop-zone-title">Pack icon</p>
              <p className="workspace-drop-zone-hint">Drop a PNG here or choose a file</p>
              <input
                type="file"
                accept="image/png"
                onChange={(e) => handlePackIconFile(e.target.files && e.target.files[0])}
                className="workspace-file-input"
              />
              {packIconUrl && (
                <div className="workspace-preview-row">
                  <img src={packIconUrl} alt="pack icon preview" className="workspace-preview-image" />
                  <span className="workspace-preview-text">Icon ready</span>
                </div>
              )}
            </div>

            <div className="workspace-actions-row">
              <button onClick={() => setShowManifest(s => !s)} className="workspace-button workspace-button--secondary workspace-button--toggle">
                {showManifest ? 'Hide manifest' : 'Show manifest'}
              </button>
              <button onClick={createAddonFolderStructure} className="workspace-button workspace-button--primary">Create folders</button>
            </div>
          </section>

          {/* RIGHT SIDE: Live output stream */}
          {showManifest && (
            <section className="workspace-preview-panel">
              <div className="workspace-preview-header">
                <h2 className="workspace-preview-heading">Live manifest.json</h2>
                <span className="workspace-preview-badge">JSON preview</span>
              </div>
              <pre className="workspace-manifest-pre">{JSON.stringify(manifest, null, 2)}</pre>
              <div className="workspace-preview-actions">
                <button onClick={regenerateUuids} className="workspace-button workspace-button--secondary">Regenerate UUIDs</button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackGenerator;

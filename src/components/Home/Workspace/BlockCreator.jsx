import React, { useState } from 'react';

const BlockCreator = ({ availableTextures = [] }) => {
  const [blockData, setBlockData] = useState({
    blockId: '',
    blockName: '',
    blockGroupMenu: 'construction',
    blockGroup: '',
    blockTag: '',
    blockDisplayName: '',
    blockGeometry: '',
    blockTexture: '',
    blockRender: 'opaque',
    collisionBox: '',
    selectionBox: ''
  });

  const [showPreview, setShowPreview] = useState(false);
  const [isTextureModalOpen, setIsTextureModalOpen] = useState(false); // Para sa modal/popup state

  const handleUpdate = (field, value) => {
    setBlockData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const parseBoxData = (str, defaultBox) => {
    const dataToParse = str.trim() ? str : defaultBox;
    try {
      return JSON.parse(dataToParse);
    } catch (e) {
      return "Invalid JSON";
    }
  };

  const generateBlockJson = () => {
    const id = blockData.blockId || 'my_addon';
    const name = blockData.blockName || 'custom_block';
    const displayName = blockData.blockDisplayName || 'Custom Block';
    const group = blockData.blockGroup || 'custom_block_group';
    const tag = blockData.blockTag || 'custom_block_tag';
    const geo = blockData.blockGeometry || 'custom_block_geo';
    const tex = blockData.blockTexture || 'custom_block_texture';
    
    const defaultBox = '{\n  "origin": [-8, 0, -8],\n  "size": [16, 16, 16]\n}';

    return {
      "format_version": "1.21.20",
      "minecraft:block": {
        "description": {
          "identifier": `${id}:${name}`,
          "menu_category": {
            "category": blockData.blockGroupMenu,
            "group": `itemGroup.name.${group}`
          },
          "traits": {
            "minecraft:placement_direction": {
              "enabled_states": [
                "minecraft:cardinal_direction"
              ]
            }
          }
        },
        "permutations": [
          {
            "condition": "q.block_state('minecraft:cardinal_direction') == 'north'",
            "components": {
              "minecraft:transformation": { "rotation": [0, 180, 0] }
            }
          },
          {
            "condition": "q.block_state('minecraft:cardinal_direction') == 'south'",
            "components": {
              "minecraft:transformation": { "rotation": [0, 0, 0] }
            }
          },
          {
            "condition": "q.block_state('minecraft:cardinal_direction') == 'east'",
            "components": {
              "minecraft:transformation": { "rotation": [0, 90, 0] }
            }
          },
          {
            "condition": "q.block_state('minecraft:cardinal_direction') == 'west'",
            "components": {
              "minecraft:transformation": { "rotation": [0, -90, 0] }
            }
          }
        ],
        "components": {
          [`tag:${tag}`]: {},
          "minecraft:display_name": displayName,
          "minecraft:geometry": `geometry.${geo}`,
          "minecraft:material_instances": {
            "*": {
              "texture": tex,
              "render_method": blockData.blockRender
            }
          },
          "minecraft:collision_box": parseBoxData(blockData.collisionBox, defaultBox),
          "minecraft:selection_box": parseBoxData(blockData.selectionBox, defaultBox),
          "minecraft:light_dampening": 0,
          "minecraft:light_emission": 0
        }
      }
    };
  };

  const getFormattedJsonString = () => {
    const jsonObj = generateBlockJson();

    const collisionObj = jsonObj["minecraft:block"].components["minecraft:collision_box"];
    const selectionObj = jsonObj["minecraft:block"].components["minecraft:selection_box"];

    jsonObj["minecraft:block"].components["minecraft:collision_box"] = "@@COLLISION_BOX@@";
    jsonObj["minecraft:block"].components["minecraft:selection_box"] = "@@SELECTION_BOX@@";

    let rawStr = JSON.stringify(jsonObj, null, 2);

    const singleLineCollision = JSON.stringify(collisionObj);
    const singleLineSelection = JSON.stringify(selectionObj);

    rawStr = rawStr.replace('"@@COLLISION_BOX@@"', singleLineCollision);
    rawStr = rawStr.replace('"@@SELECTION_BOX@@"', singleLineSelection);
    rawStr = rawStr.replace(/\[\s*([\d\.-]+),\s*([\d\.-]+),\s*([\d\.-]+)\s*\]/g, "[$1, $2, $3]");

    return rawStr;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getFormattedJsonString());
    alert("Block JSON copied to clipboard!");
  };

  const saveBlockFile = async () => {
    if (!window.showDirectoryPicker) {
      alert('Your browser does not support folder selection.');
      return;
    }

    try {
      const rootHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      const bpHandle = await rootHandle.getDirectoryHandle('behavior_pack');
      const blocksHandle = await bpHandle.getDirectoryHandle('blocks', { create: true });
      
      const fileName = `${blockData.blockName || 'custom_block'}.json`;
      const fileHandle = await blocksHandle.getFileHandle(fileName, { create: true });
      
      const writable = await fileHandle.createWritable();
      await writable.write(`${getFormattedJsonString()}\n`);
      await writable.close();
      
      alert(`Successfully saved to behavior_pack/blocks/${fileName}`);
    } catch (error) {
      if (error && error.name !== 'AbortError') {
        console.error(error);
        alert('Failed to save the file.');
      }
    }
  };

  const labelStyle = { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    textAlign: 'center',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    fontSize: '0.8rem',
    marginBottom: '8px'
  };

  // Hanapin ang napiling texture object para maipakita ang preview image sa form
  const selectedTexObj = availableTextures.find(t => t.name.replace(/\.[^/.]+$/, "") === blockData.blockTexture);

  return (
    <div className="workspace-page">
      <div className="workspace-shell">
        
        {/* HERO SECTION */}
        <div className="workspace-hero" style={{ textAlign: 'center', paddingBottom: '30px' }}>
          <div>
            <p className="workspace-eyebrow" style={{ letterSpacing: '2px' }}>WORKSPACE</p>
            <h2 className="workspace-title">Custom Block Generator</h2>
            <p className="workspace-subtitle">Create a minimal resource pack and behavior pack setup with a clean Minecraft-style workflow.</p>
          </div>
        </div>

        {/* MAIN CONTAINER */}
        <div style={{ display: 'flex', gap: '30px', maxWidth: '1400px', margin: '0 auto', width: '100%', alignItems: 'flex-start' }}>
          
          {/* LEFT COLUMN: Input Form */}
          <div style={{ flex: '1', transition: 'flex 0.3s ease', minWidth: '450px' }}>
            <section className="workspace-panel" style={{ padding: '30px' }}>
              
              {/* ROW 1 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <label className="workspace-label" style={labelStyle}>
                  <span style={{ marginBottom: '8px' }}>Block Identifier:</span>
                  <input type='text' className="workspace-input" style={{ width: '100%' }} value={blockData.blockId} onChange={(e) => handleUpdate('blockId', e.target.value)} placeholder="my_addon" />
                </label>

                <label className="workspace-label" style={labelStyle}>
                  <span style={{ marginBottom: '8px' }}>Identifier Name:</span>
                  <input type='text' className="workspace-input" style={{ width: '100%' }} value={blockData.blockName} onChange={(e) => handleUpdate('blockName', e.target.value)} placeholder="custom_block" />
                </label>

                <label className="workspace-label" style={labelStyle}>
                  <span style={{ marginBottom: '8px' }}>Display Name:</span>
                  <input type='text' className="workspace-input" style={{ width: '100%' }} value={blockData.blockDisplayName} onChange={(e) => handleUpdate('blockDisplayName', e.target.value)} placeholder="Custom Block" />
                </label>

                <label className="workspace-label" style={labelStyle}>
                  <span style={{ marginBottom: '8px' }}>Block Tag:</span>
                  <input type='text' className="workspace-input" style={{ width: '100%' }} value={blockData.blockTag} onChange={(e) => handleUpdate('blockTag', e.target.value)} placeholder="custom_block_tag" />
                </label>
              </div>

              {/* ROW 2 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <label className="workspace-label" style={labelStyle}>
                  <span style={{ marginBottom: '8px' }}>Category Menu:</span>
                  <select className="workspace-input" style={{ width: '100%' }} value={blockData.blockGroupMenu} onChange={(e) => handleUpdate('blockGroupMenu', e.target.value)}>
                    <option value="construction">Construction</option>
                    <option value="equipment">Equipment</option>
                    <option value="items">Items</option>
                    <option value="nature">Nature</option>
                  </select>
                </label>

                <label className="workspace-label" style={labelStyle}>
                  <span style={{ marginBottom: '8px' }}>Category Group:</span>
                  <input type='text' className="workspace-input" style={{ width: '100%' }} value={blockData.blockGroup} onChange={(e) => handleUpdate('blockGroup', e.target.value)} placeholder="custom_block_group" />
                </label>

                <label className="workspace-label" style={labelStyle}>
                  <span style={{ marginBottom: '8px' }}>Block Model:</span>
                  <input type='text' className="workspace-input" style={{ width: '100%' }} value={blockData.blockGeometry} onChange={(e) => handleUpdate('blockGeometry', e.target.value)} placeholder="custom_block_geo" />
                </label>

                {/* CARD-STYLE TEXTURE SELECTOR BUTTON / PREVIEW */}
                {/* CARD-STYLE TEXTURE SELECTOR BUTTON / PREVIEW */}
                <label className="workspace-label" style={labelStyle}>
                  <span style={{ marginBottom: '8px' }}>Block Texture:</span>
                  <div 
                    onClick={() => setIsTextureModalOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid #444c56',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      width: '100%',
                      minHeight: '42px'
                    }}
                  >
                    {selectedTexObj ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src={selectedTexObj.url} alt="" style={{ width: '24px', height: '24px', objectFit: 'contain', imageRendering: 'pixelated' }} />
                        <span style={{ fontSize: '0.8rem', color: '#7ee787' }}>{selectedTexObj.name}</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>Select texture...</span>
                    )}
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '2px 8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>Browse</span>
                  </div>
                </label>
              </div>

              {/* ROW 3 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <label className="workspace-label" style={{ ...labelStyle }}>
                  <span style={{ marginBottom: '8px' }}>Render Method:</span>
                  <select className="workspace-input" style={{ width: '100%' }} value={blockData.blockRender} onChange={(e) => handleUpdate('blockRender', e.target.value)}>
                    <option value="opaque">Opaque</option>
                    <option value="alpha_test">Alpha Test</option>
                    <option value="blend">Blend</option>
                    <option value="alpha_test_single_sided">Alpha Single Sided</option>
                  </select>
                </label>
                <div style={{ width: '100%' }}></div>
                <div style={{ width: '100%' }}></div>
                <div style={{ width: '100%' }}></div>
              </div>

              {/* HITBOXES */}
              <div style={{ border: '1px dashed #444c56', borderRadius: '16px', padding: '30px', textAlign: 'center', marginTop: '10px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', textTransform: 'uppercase' }}>Custom Hitboxes</h3>
                <p style={{ opacity: 0.7, fontSize: '0.85rem', marginBottom: '24px' }}>Drop or paste your Blockbench JSON array here.</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                  <label className="workspace-label" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                    <span style={{ marginBottom: '8px', fontWeight: 'bold' }}>Collision Box:</span>
                    <textarea 
                      className="workspace-input"
                      style={{ resize: 'vertical', fontFamily: 'monospace', width: '100%' }} 
                      rows={5} 
                      value={blockData.collisionBox}
                      onChange={(e) => handleUpdate('collisionBox', e.target.value)}
                      placeholder='[{"origin": [-8, 0, -8], "size": [16, 16, 16]}]'
                    />
                  </label>

                  <label className="workspace-label" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                    <span style={{ marginBottom: '8px', fontWeight: 'bold' }}>Selection Box:</span>
                    <textarea 
                      className="workspace-input"
                      style={{ resize: 'vertical', fontFamily: 'monospace', width: '100%' }} 
                      rows={5} 
                      value={blockData.selectionBox}
                      onChange={(e) => handleUpdate('selectionBox', e.target.value)}
                      placeholder='[{"origin": [-8, 0, -8], "size": [16, 16, 16]}]'
                    />
                  </label>
                </div>
              </div>
            </section>

            {/* ACTION BUTTONS */}
            <div className="workspace-actions-row" style={{ marginTop: '20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="workspace-button workspace-button--secondary" onClick={() => setShowPreview(!showPreview)}>
                {showPreview ? 'Hide Manifest' : 'Show Manifest'}
              </button>
              <button className="workspace-button workspace-button--secondary" onClick={copyToClipboard}>
                Copy JSON
              </button>
              <button className="workspace-button workspace-button--primary" onClick={saveBlockFile}>
                Create / Save Block
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Live Preview */}
          {showPreview && (
            <section className="workspace-preview-panel" style={{ flex: '1.8', minWidth: '400px', position: 'sticky', top: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="workspace-preview-header">
                <h2 className="workspace-preview-heading">Live block.json Preview</h2>
                <span className="workspace-preview-badge">JSON</span>
              </div>
              <pre className="workspace-manifest-pre" style={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>
                {getFormattedJsonString()}
              </pre>
            </section>
          )}

        </div>
      </div>

      {/* TEXTURE PICKER MODAL / POP-UP */}
      {isTextureModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#161b22',
            border: '1px solid #444c56',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '700px',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{ padding: '20px', borderBottom: '1px solid #444c56', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', textTransform: 'uppercase' }}>Select Block Texture</h3>
              <button 
                onClick={() => setIsTextureModalOpen(false)}
                style={{ backgroundColor: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body (Card Grid) */}
            <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
              {availableTextures.length === 0 ? (
                <p style={{ textAlign: 'center', opacity: 0.7, padding: '30px 0' }}>
                  No textures found. Please add some .png files in the Texture Storage first!
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '15px' }}>
                  {availableTextures.map((tex, index) => {
                    const cleanName = tex.name.replace(/\.[^/.]+$/, "");
                    const isSelected = blockData.blockTexture === cleanName;

                    return (
                      <div 
                        key={index}
                        onClick={() => {
                          handleUpdate('blockTexture', cleanName);
                          setIsTextureModalOpen(false);
                        }}
                        style={{
                          border: isSelected ? '2px solid #7ee787' : '1px solid #444c56',
                          borderRadius: '12px',
                          padding: '12px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? 'rgba(126, 231, 135, 0.1)' : 'rgba(255, 255, 255, 0.02)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <img 
                          src={tex.url} 
                          alt={tex.name} 
                          style={{ width: '48px', height: '48px', objectFit: 'contain', marginBottom: '8px', imageRendering: 'pixelated' }} 
                        />
                        <span style={{ fontSize: '0.7rem', opacity: 0.8, wordBreak: 'break-all', color: '#c9d1d9' }}>
                          {tex.name}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '15px 20px', borderTop: '1px solid #444c56', textAlign: 'right' }}>
              <button 
                className="workspace-button workspace-button--secondary"
                onClick={() => setIsTextureModalOpen(false)}
                style={{ padding: '6px 16px', fontSize: '0.85rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockCreator;
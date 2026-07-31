import React, { useState } from 'react';

// Texture Picker Modal Component
const TexturePickerModal = ({ availableTextures, blockData, handleUpdate, setIsTextureModalOpen }) => {
  const [modalSearchQuery, setModalSearchQuery] = useState('');

  const filteredModalTextures = availableTextures.filter(tex => 
    tex.name.toLowerCase().includes(modalSearchQuery.toLowerCase())
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #d0d7de',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '700px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        overflow: 'hidden',
        color: '#24292f'
      }}>
        <div style={{ padding: '20px 20px 15px 20px', borderBottom: '1px solid #d0d7de', backgroundColor: '#f6f8fa' }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.6, fontSize: '0.9rem' }}>🔍</span>
            <input 
              type="text" 
              placeholder="SEARCH TEXTURES..." 
              value={modalSearchQuery}
              onChange={(e) => setModalSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px 8px 35px',
                backgroundColor: '#ffffff',
                border: '1px solid #d0d7de',
                borderRadius: '6px',
                color: '#24292f',
                outline: 'none',
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                fontWeight: 'bold'
              }}
            />
          </div>
        </div>

        <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
          {availableTextures.length === 0 ? (
            <p style={{ textAlign: 'center', opacity: 0.7, padding: '30px 0' }}>
              No textures found. Please add some .png files in the Texture Storage first!
            </p>
          ) : filteredModalTextures.length === 0 ? (
            <p style={{ textAlign: 'center', opacity: 0.7, padding: '30px 0', color: '#cf222e' }}>
              No textures match "{modalSearchQuery}".
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '15px' }}>
              {filteredModalTextures.map((tex, index) => {
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
                      border: isSelected ? '2px solid #238636' : '1px solid #d0d7de',
                      borderRadius: '12px',
                      padding: '12px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? 'rgba(35, 134, 54, 0.08)' : '#f6f8fa',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <img 
                      src={tex.url} 
                      alt={tex.name} 
                      style={{ width: '48px', height: '48px', objectFit: 'contain', marginBottom: '8px', imageRendering: 'pixelated' }} 
                    />
                    <span style={{ fontSize: '0.7rem', fontWeight: '500', wordBreak: 'break-all', color: '#24292f' }}>
                      {tex.name}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ padding: '15px 20px', borderTop: '1px solid #d0d7de', textAlign: 'right', backgroundColor: '#f6f8fa' }}>
          <button 
            onClick={() => setIsTextureModalOpen(false)}
            style={{ 
              padding: '8px 20px', 
              fontSize: '0.85rem', 
              backgroundColor: '#ffffff', 
              border: '1px solid #d0d7de', 
              borderRadius: '6px', 
              cursor: 'pointer',
              color: '#24292f',
              fontWeight: 'bold'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Manifest Preview Modal Component (Crystal Translucent Black-Blue & Left-Aligned)
const ManifestModal = ({ getFormattedJsonString, copyToClipboard, setShowPreview }) => {
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
        background: 'rgba(255, 255, 255, 0.08)',
        border: '1px solid rgba(255, 255, 255, 0.16)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '860px',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.35)',
        overflow: 'hidden',
        color: '#eaf2ff',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)'
      }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid rgba(127, 176, 255, 0.16)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
              <p style={{ margin: 0, color: '#7fb0ff', fontSize: '0.72rem', letterSpacing: '0.22em', textTransform: 'uppercase' }}>Workspace</p>
              <h3 style={{ margin: 0, fontSize: '1rem', textTransform: 'uppercase', color: '#f5f9ff', textAlign: 'left' }}>Live block.json Preview</h3>
            </div>
            <span style={{ fontSize: '0.65rem', backgroundColor: 'rgba(47, 120, 255, 0.16)', color: '#b8d1ff', padding: '4px 8px', borderRadius: '999px', fontWeight: 'bold', letterSpacing: '0.08em', textTransform: 'uppercase' }}>JSON</span>
          </div>
          <button 
            onClick={() => setShowPreview(false)}
            style={{ background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.16)', color: '#eaf2ff', fontSize: '1rem', cursor: 'pointer', fontWeight: 'bold', width: '36px', height: '36px', borderRadius: '12px' }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '22px', overflowY: 'auto', flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.03)', textAlign: 'left' }}>
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontSize: '0.8rem', fontFamily: 'monospace', color: '#7fffb9', textAlign: 'left', backgroundColor: 'transparent' }}>
            {getFormattedJsonString()}
          </pre>
        </div>

        <div style={{ padding: '14px 22px', borderTop: '1px solid rgba(127, 176, 255, 0.16)', display: 'flex', justifyContent: 'flex-end', gap: '12px', backgroundColor: 'rgba(255, 255, 255, 0.04)' }}>
          <button 
            onClick={copyToClipboard}
            style={{ padding: '10px 14px', fontSize: '0.82rem', background: 'rgba(255, 255, 255, 0.12)', border: '1px solid rgba(255, 255, 255, 0.18)', borderRadius: '14px', cursor: 'pointer', color: '#eaf2ff', fontWeight: 'bold' }}
          >
            Copy JSON
          </button>
          <button 
            onClick={() => setShowPreview(false)}
            style={{ padding: '10px 14px', fontSize: '0.82rem', background: 'linear-gradient(135deg, #2f78ff 0%, #1a4ed8 100%)', border: 'none', borderRadius: '14px', cursor: 'pointer', color: '#ffffff', fontWeight: 'bold', boxShadow: '0 14px 30px rgba(26, 78, 216, 0.32)' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const RotateAbleBlock = ({ availableTextures = [], onAddBlock, onFormChange }) => {
  const [blockData, setBlockData] = useState({
    blockId: '',
    blockName: '',
    blockGroupMenu: 'items',
    blockDisplayName: '',
    blockGeometry: '',
    blockTexture: '',
    blockRender: 'opaque',
    collisionBox: 'false',
    selectionBox: '{\n  "origin": [-6, 0, -6],\n  "size": [12, 11, 12]\n}'
  });

  const [showPreview, setShowPreview] = useState(false);
  const [isTextureModalOpen, setIsTextureModalOpen] = useState(false);

  const handleUpdate = (field, value) => {
    setBlockData((prev) => ({
      ...prev,
      [field]: value
    }));
    
    if (onFormChange) {
      onFormChange();
    }
  };

  const parseBoxData = (str, defaultBox) => {
    if (str.trim().toLowerCase() === 'false') return false;
    const dataToParse = str.trim() ? str : defaultBox;
    try {
      return JSON.parse(dataToParse);
    } catch (e) {
      return "Invalid JSON";
    }
  };

  const generateBlockJson = () => {
    const id = blockData.blockId || 'my_addon';
    const name = blockData.blockName || 'custom_rotatable_block';
    const displayName = blockData.blockDisplayName || 'Custom Rotatable Block';
    const geo = blockData.blockGeometry || 'custom_block_geo';
    const tex = blockData.blockTexture || 'custom_block_texture';
    
    const defaultSelectionBox = '{\n  "origin": [-6, 0, -6],\n  "size": [12, 11, 12]\n}';

    return {
      "format_version": "1.21.70",
      "minecraft:block": {
        "description": {
          "identifier": `${id}:${name}`,
          "menu_category": {
            "category": blockData.blockGroupMenu
          },
          "traits": {
            "minecraft:placement_direction": {
              "enabled_states": [
                "minecraft:cardinal_direction"
              ]
            }
          },
          "states": {
            "goobli:variant": [0, 1, 2]
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
          },
          {
            "condition": "q.block_state('goobli:variant') == 0",
            "components": {
              "minecraft:geometry": {
                "identifier": `geometry.${geo}`,
                "bone_visibility": {
                  "main": true,
                  "left": false,
                  "right": false
                }
              }
            }
          },
          {
            "condition": "q.block_state('goobli:variant') == 1",
            "components": {
              "minecraft:geometry": {
                "identifier": `geometry.${geo}`,
                "bone_visibility": {
                  "main": false,
                  "left": true,
                  "right": false
                }
              }
            }
          },
          {
            "condition": "q.block_state('goobli:variant') == 2",
            "components": {
              "minecraft:geometry": {
                "identifier": `geometry.${geo}`,
                "bone_visibility": {
                  "main": false,
                  "left": false,
                  "right": true
                }
              }
            }
          }
        ],
        "components": {
          [`tag:${name}`]: {},
          "minecraft:display_name": displayName,
          "minecraft:geometry": {
            "identifier": `geometry.${geo}`,
            "bone_visibility": {
              "main": true,
              "left": false,
              "right": false
            }
          },
          "minecraft:material_instances": {
            "*": {
              "texture": tex,
              "render_method": blockData.blockRender
            }
          },
          "minecraft:collision_box": parseBoxData(blockData.collisionBox, 'false'),
          "minecraft:selection_box": parseBoxData(blockData.selectionBox, defaultSelectionBox),
          "minecraft:light_dampening": 0,
          "minecraft:light_emission": 0,
          "minecraft:custom_components": [
            "goobli:rotate"
          ]
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
    alert("Rotatable Block JSON copied to clipboard!");
  };

  const handleAddToQueue = () => {
    if (!blockData.blockName) {
      alert("Please enter an Identifier Name for the block before adding to queue.");
      return;
    }

    if (onAddBlock) {
      onAddBlock({
        ...blockData,
        fileName: `${blockData.blockName}.json`,
        jsonContent: getFormattedJsonString()
      });
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

  const selectedTexObj = availableTextures.find(t => t.name.replace(/\.[^/.]+$/, "") === blockData.blockTexture);

  return (
    <div className="workspace-page">
      <div className="workspace-shell">
        
        {/* HERO SECTION */}
        <div className="workspace-hero" style={{ textAlign: 'center', paddingBottom: '5px', paddingTop: '0px' }}>
          <div>
            <p className="workspace-eyebrow" style={{ letterSpacing: '2px' }}>WORKSPACE</p>
            <h2 className="workspace-title">Rotatable Block Generator</h2>
          </div>
        </div>

        {/* MAIN CONTAINER */}
        <div style={{ display: 'flex', justifyContent: 'center', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
          
          <div style={{ width: '100%' }}>
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
                  <input type='text' className="workspace-input" style={{ width: '100%' }} value={blockData.blockDisplayName} onChange={(e) => handleUpdate('blockDisplayName', e.target.value)} placeholder="Custom Rotatable Block" />
                </label>
              </div>

              {/* ROW 2 */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
                <label className="workspace-label" style={labelStyle}>
                  <span style={{ marginBottom: '8px' }}>Category Menu:</span>
                  <select className="workspace-input" style={{ width: '100%' }} value={blockData.blockGroupMenu} onChange={(e) => handleUpdate('blockGroupMenu', e.target.value)}>
                    <option value="items">Items</option>
                    <option value="construction">Construction</option>
                    <option value="equipment">Equipment</option>
                    <option value="nature">Nature</option>
                  </select>
                </label>

                <label className="workspace-label" style={{ ...labelStyle, gridColumn: 'span 2' }}>
                  <span style={{ marginBottom: '8px' }}>Block Model:</span>
                  <input type='text' className="workspace-input" style={{ width: '100%' }} value={blockData.blockGeometry} onChange={(e) => handleUpdate('blockGeometry', e.target.value)} placeholder="custom_block_geo" />
                </label>
              </div>

              {/* ROW 3: Block Texture (Span 2) at Render Method (1 Col) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
                <label className="workspace-label" style={{ ...labelStyle, gridColumn: 'span 2' }}>
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
                      minHeight: '42px',
                      boxSizing: 'border-box'
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

                <label className="workspace-label" style={labelStyle}>
                  <span style={{ marginBottom: '8px' }}>Render Method:</span>
                  <select className="workspace-input" style={{ width: '100%' }} value={blockData.blockRender} onChange={(e) => handleUpdate('blockRender', e.target.value)}>
                    <option value="opaque">Opaque</option>
                    <option value="alpha_test">Alpha Test</option>
                    <option value="blend">Blend</option>
                    <option value="alpha_test_single_sided">Alpha Single Sided</option>
                  </select>
                </label>
              </div>

              {/* HITBOXES */}
              <div style={{ border: '1px dashed #444c56', borderRadius: '16px', padding: '30px', textAlign: 'center', marginTop: '10px' }}>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', textTransform: 'uppercase' }}>Custom Hitboxes</h3>
                <p style={{ opacity: 0.7, fontSize: '0.85rem', marginBottom: '24px' }}>Type 'false' or paste your Blockbench JSON array/object here.</p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
                  <label className="workspace-label" style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                    <span style={{ marginBottom: '8px', fontWeight: 'bold' }}>Collision Box:</span>
                    <textarea 
                      className="workspace-input"
                      style={{ resize: 'vertical', fontFamily: 'monospace', width: '100%' }} 
                      rows={5} 
                      value={blockData.collisionBox}
                      onChange={(e) => handleUpdate('collisionBox', e.target.value)}
                      placeholder='false'
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
                      placeholder='{"origin": [-6, 0, -6], "size": [12, 11, 12]}'
                    />
                  </label>
                </div>
              </div>
            </section>

            {/* ACTION BUTTONS */}
            <div className="workspace-actions-row" style={{ marginTop: '20px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="workspace-button workspace-button--secondary" onClick={() => setShowPreview(true)}>
                Show Manifest
              </button>
              <button className="workspace-button workspace-button--secondary" onClick={copyToClipboard}>
                Copy JSON
              </button>
              <button className="workspace-button workspace-button--primary" onClick={handleAddToQueue}>
                Add to Queue
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* TEXTURE PICKER MODAL */}
      {isTextureModalOpen && (
        <TexturePickerModal 
          availableTextures={availableTextures} 
          blockData={blockData} 
          handleUpdate={handleUpdate} 
          setIsTextureModalOpen={setIsTextureModalOpen} 
        />
      )}

      {/* MANIFEST PREVIEW MODAL */}
      {showPreview && (
        <ManifestModal 
          getFormattedJsonString={getFormattedJsonString}
          copyToClipboard={copyToClipboard}
          setShowPreview={setShowPreview}
        />
      )}
    </div>
  );
};

export default RotateAbleBlock;
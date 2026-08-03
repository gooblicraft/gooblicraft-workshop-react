import React, { useState } from 'react';
import ModelPickerModal from '../ModelPickerModal';
import TexturePickerModal from '../TexturePickerModal';

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

const HorizontalBlock1x2 = ({ availableTextures = [], onAddBlock, onFormChange }) => {
  const [blockData, setBlockData] = useState({
    blockId: '',
    blockName: '',
    blockGroupMenu: 'items',
    blockDisplayName: '',
    blockGeometry: '',
    blockTexture: '',
    blockRender: 'opaque',
    materialInstances: [],
    collisionBox: '',
    selectionBox: ''
  });

  const [showPreview, setShowPreview] = useState(false);
  const [isTextureModalOpen, setIsTextureModalOpen] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [activeTextureTarget, setActiveTextureTarget] = useState('default');

  const handleUpdate = (field, value) => {
    setBlockData((prev) => ({
      ...prev,
      [field]: value
    }));
    
    if (onFormChange) {
      onFormChange();
    }
  };

  const handleAddMaterialInstance = () => {
    if (blockData.materialInstances.length >= 10) {
      alert("Maaari lamang magdagdag ng hanggang 10 karagdagang material instances.");
      return;
    }
    const newInstances = [
      ...blockData.materialInstances,
      { materialName: '', texture: '', renderMethod: 'opaque' }
    ];
    handleUpdate('materialInstances', newInstances);
  };

  const handleUpdateMaterialInstance = (index, field, value) => {
    const updated = [...blockData.materialInstances];
    updated[index][field] = value;
    handleUpdate('materialInstances', updated);
  };

  const handleRemoveMaterialInstance = (index) => {
    const updated = blockData.materialInstances.filter((_, i) => i !== index);
    handleUpdate('materialInstances', updated);
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
    const name = blockData.blockName || 'custom_horizontal_block';
    const displayName = blockData.blockDisplayName || 'Custom 1x2 Horizontal Block';
    const geo = blockData.blockGeometry || 'custom_block_geo';
    const tex = blockData.blockTexture || 'custom_block_texture';
    
    const defaultBox = true; // or default boolean/object as needed for horizontal layout

    const materialInstancesObj = {};

    blockData.materialInstances.forEach((inst) => {
      const matName = inst.materialName.trim() || 'material_name';
      materialInstancesObj[matName] = {
        "texture": inst.texture || 'texture_name',
        "render_method": inst.renderMethod || 'opaque'
      };
    });

    materialInstancesObj["*"] = {
      "texture": tex,
      "render_method": blockData.blockRender
    };

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
            "goobli:block_states": [
              "left",
              "right"
            ]
          }
        },
        "permutations": [
          {
            "condition": "q.block_state('minecraft:cardinal_direction') == 'north'",
            "components": {
              "minecraft:transformation": {
                "rotation": [0, 180, 0]
              }
            }
          },
          {
            "condition": "q.block_state('minecraft:cardinal_direction') == 'south'",
            "components": {
              "minecraft:transformation": {
                "rotation": [0, 0, 0]
              }
            }
          },
          {
            "condition": "q.block_state('minecraft:cardinal_direction') == 'east'",
            "components": {
              "minecraft:transformation": {
                "rotation": [0, 90, 0]
              }
            }
          },
          {
            "condition": "q.block_state('minecraft:cardinal_direction') == 'west'",
            "components": {
              "minecraft:transformation": {
                "rotation": [0, -90, 0]
              }
            }
          }
        ],
        "components": {
          "minecraft:display_name": displayName,
          "minecraft:geometry": {
            "identifier": `geometry.${geo}`,
            "bone_visibility": {
              "left": "q.block_state('goobli:block_states') == 'left'",
              "right": "q.block_state('goobli:block_states') == 'right'"
            }
          },
          "minecraft:material_instances": materialInstancesObj,
          "minecraft:item_visual": {
            "geometry": `geometry.${geo}_item`,
            "material_instances": materialInstancesObj
          },
          "minecraft:collision_box": parseBoxData(blockData.collisionBox, defaultBox),
          "minecraft:selection_box": parseBoxData(blockData.selectionBox, defaultBox),
          "minecraft:light_dampening": 0,
          "minecraft:light_emission": 0,
          "minecraft:custom_components": [
            "goobli:place1x2_h"
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

    const singleLineCollision = typeof collisionObj === 'object' ? JSON.stringify(collisionObj) : collisionObj;
    const singleLineSelection = typeof selectionObj === 'object' ? JSON.stringify(selectionObj) : selectionObj;

    rawStr = rawStr.replace('"@@COLLISION_BOX@@"', singleLineCollision);
    rawStr = rawStr.replace('"@@SELECTION_BOX@@"', singleLineSelection);
    rawStr = rawStr.replace(/\[\s*([\d\.-]+),\s*([\d\.-]+),\s*([\d\.-]+)\s*\]/g, "[$1, $2, $3]");

    return rawStr;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getFormattedJsonString());
    alert("1x2 Horizontal Block JSON copied to clipboard!");
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
            <h2 className="workspace-title">1x2 Horizontal Block Generator</h2>
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
                  <input 
                    type='text' 
                    className="workspace-input" 
                    style={{ width: '100%' }} 
                    value={blockData.blockId} 
                    onChange={(e) => {
                        const formattedValue = e.target.value.replace(/\s+/g, '_'); 
                        handleUpdate('blockId', formattedValue);
                    }} 
                    placeholder="my_addon" 
                  />                
                  </label>

                <label className="workspace-label" style={labelStyle}>
                  <span style={{ marginBottom: '8px' }}>Identifier Name:</span>
                  <input 
                    type='text' 
                    className="workspace-input" 
                    style={{ width: '100%' }} 
                    value={blockData.blockName} 
                    onChange={(e) => {
                        const formattedValue = e.target.value.replace(/\s+/g, '_'); 
                        handleUpdate('blockName', formattedValue);
                    }} 
                    placeholder="horizontal_block_1x2" 
                />                
                </label>

                <label className="workspace-label" style={labelStyle}>
                  <span style={{ marginBottom: '8px' }}>Display Name:</span>
                  <input type='text' className="workspace-input" style={{ width: '100%' }} value={blockData.blockDisplayName} onChange={(e) => handleUpdate('blockDisplayName', e.target.value)} placeholder="Custom 1x2 Horizontal Block" />
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
                  <div 
                    onClick={() => setIsModelModalOpen(true)}
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
                    {blockData.blockGeometry ? (
                      <span style={{ fontSize: '0.8rem', color: '#7ee787' }}>{blockData.blockGeometry}</span>
                    ) : (
                      <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>Select model from library...</span>
                    )}
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', padding: '2px 8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>Browse</span>
                  </div>
                </label>
              </div>

              {/* MATERIAL INSTANCES SECTION */}
              <div style={{ border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px', padding: '20px', marginBottom: '24px', backgroundColor: 'transparent' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '0.9rem', color: '#7fb0ff', textTransform: 'uppercase' }}>Material Instances (Textures & Renders)</h3>
                  <button 
                    onClick={handleAddMaterialInstance}
                    style={{ 
                      padding: '6px 12px', 
                      fontSize: '0.75rem', 
                      backgroundColor: 'rgba(126, 231, 135, 0.15)', 
                      border: '1px solid #7ee787', 
                      borderRadius: '6px', 
                      color: '#7ee787', 
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    + Add Material ({blockData.materialInstances.length}/10)
                  </button>
                </div>

                {blockData.materialInstances.map((inst, index) => {
                  const customTexObj = availableTextures.find(t => t.name.replace(/\.[^/.]+$/, "") === inst.texture);

                  return (
                    <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '12px', alignItems: 'center', marginBottom: '12px', backgroundColor: 'transparent', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#fff' }}>
                        <span style={{ marginBottom: '4px' }}>Material Name:</span>
                        <input 
                          type="text" 
                          className="workspace-input" 
                          value={inst.materialName} 
                          onChange={(e) => handleUpdateMaterialInstance(index, 'materialName', e.target.value)} 
                          placeholder="material_name" 
                          style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem' }}
                        />
                      </label>

                      <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#fff' }}>
                        <span style={{ marginBottom: '4px' }}>Texture:</span>
                        <div 
                          onClick={() => {
                            setActiveTextureTarget(index);
                            setIsTextureModalOpen(true);
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '6px 10px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid #444c56',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            minHeight: '32px'
                          }}
                        >
                          {customTexObj ? (
                            <span style={{ fontSize: '0.75rem', color: '#7ee787' }}>{customTexObj.name}</span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>Select texture...</span>
                          )}
                          <span style={{ fontSize: '0.65rem', padding: '1px 6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>Browse</span>
                        </div>
                      </label>

                      <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#fff' }}>
                        <span style={{ marginBottom: '4px' }}>Render Method:</span>
                        <select 
                          className="workspace-input" 
                          style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem' }} 
                          value={inst.renderMethod} 
                          onChange={(e) => handleUpdateMaterialInstance(index, 'renderMethod', e.target.value)}
                        >
                          <option value="opaque">Opaque</option>
                          <option value="alpha_test">Alpha Test</option>
                          <option value="blend">Blend</option>
                          <option value="alpha_test_single_sided">Alpha Single Sided</option>
                        </select>
                      </label>

                      <button 
                        onClick={() => handleRemoveMaterialInstance(index)}
                        style={{ background: 'rgba(215, 58, 73, 0.2)', border: '1px solid #da3633', color: '#ff7b72', width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '16px' }}
                        title="Remove Material"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '12px', alignItems: 'center', backgroundColor: 'rgba(127, 176, 255, 0.05)', padding: '12px', borderRadius: '10px', border: '1px dashed #7fb0ff' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#7fb0ff', textTransform: 'uppercase' }}>
                    * (Default All)
                  </div>

                  <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#fff' }}>
                    <span style={{ marginBottom: '4px' }}>Default Texture:</span>
                    <div 
                      onClick={() => {
                        setActiveTextureTarget('default');
                        setIsTextureModalOpen(true);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '6px 10px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid #444c56',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        minHeight: '32px'
                      }}
                    >
                      {selectedTexObj ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <img src={selectedTexObj.url} alt="" style={{ width: '18px', height: '18px', objectFit: 'contain', imageRendering: 'pixelated' }} />
                          <span style={{ fontSize: '0.75rem', color: '#7ee787' }}>{selectedTexObj.name}</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', opacity: 0.5 }}>Select default texture...</span>
                      )}
                      <span style={{ fontSize: '0.65rem', padding: '1px 6px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '3px' }}>Browse</span>
                    </div>
                  </label>

                  <label style={{ display: 'flex', flexDirection: 'column', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#fff' }}>
                    <span style={{ marginBottom: '4px' }}>Default Render:</span>
                    <select className="workspace-input" style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem' }} value={blockData.blockRender} onChange={(e) => handleUpdate('blockRender', e.target.value)}>
                      <option value="opaque">Opaque</option>
                      <option value="alpha_test">Alpha Test</option>
                      <option value="blend">Blend</option>
                      <option value="alpha_test_single_sided">Alpha Single Sided</option>
                    </select>
                  </label>
                </div>
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

      {/* REUSABLE TEXTURE PICKER MODAL */}
      {isTextureModalOpen && (
        <TexturePickerModal 
          availableTextures={availableTextures} 
          currentSelected={activeTextureTarget === 'default' ? blockData.blockTexture : blockData.materialInstances[activeTextureTarget]?.texture}
          onSelect={(cleanName) => {
            if (activeTextureTarget === 'default') {
              handleUpdate('blockTexture', cleanName);
            } else {
              handleUpdateMaterialInstance(activeTextureTarget, 'texture', cleanName);
            }
          }}
          onClose={() => setIsTextureModalOpen(false)}
        />
      )}

      {/* REUSABLE MODEL PICKER MODAL */}
      {isModelModalOpen && (
        <ModelPickerModal 
          currentSelected={blockData.blockGeometry}
          onSelect={(cleanName) => handleUpdate('blockGeometry', cleanName)}
          onClose={() => setIsModelModalOpen(false)}
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

export default HorizontalBlock1x2;
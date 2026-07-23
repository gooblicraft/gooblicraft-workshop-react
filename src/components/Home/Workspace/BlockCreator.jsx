import React, { useState } from 'react';

const BlockCreator = () => {
  // Initialize state with empty strings so inputs are clear by default
  const [blockData, setBlockData] = useState({
    blockId: '',
    blockName: '',
    blockGroupMenu: 'construction', // Select menus need an initial actual value
    blockGroup: '',
    blockTag: '',
    blockDisplayName: '',
    blockGeometry: '',
    blockTexture: '',
    blockRender: 'opaque', // Select menus need an initial actual value
    collisionBox: '',
    selectionBox: ''
  });

  // Generic update handler for inputs
  const handleUpdate = (field, value) => {
    setBlockData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Helper function to parse the pasted Blockbench JSON safely
  const parseBoxData = (str, defaultBox) => {
    const dataToParse = str.trim() ? str : defaultBox;
    try {
      return JSON.parse(dataToParse);
    } catch (e) {
      return "Invalid JSON";
    }
  };

  // Generate the live JSON object using fallbacks (||) if the user leaves it empty
  const generateBlockJson = () => {
    const id = blockData.blockId || 'my_addon';
    const name = blockData.blockName || 'custom_block';
    const displayName = blockData.blockDisplayName || 'Custom Block';
    const group = blockData.blockGroup || 'custom_block_group';
    const tag = blockData.blockTag || 'custom_block_tag';
    const geo = blockData.blockGeometry || 'custom_block_geo';
    const tex = blockData.blockTexture || 'custom_block_texture';
    
    // Default boxes if textarea is empty
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

  // Custom stringifier that collapses ONLY the collision and selection boxes into single lines
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
      alert("Please select the root folder of your Add-on (the one that contains behavior_pack and resource_pack).");
      const rootHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      
      const bpHandle = await rootHandle.getDirectoryHandle('behavior_pack');
      const blocksHandle = await bpHandle.getDirectoryHandle('blocks', { create: true });
      
      // Use fallback name if input is empty
      const fileName = `${blockData.blockName || 'custom_block'}.json`;
      const fileHandle = await blocksHandle.getFileHandle(fileName, { create: true });
      
      const writable = await fileHandle.createWritable();
      await writable.write(`${getFormattedJsonString()}\n`);
      await writable.close();
      
      alert(`Successfully saved to behavior_pack/blocks/${fileName}`);
    } catch (error) {
      if (error && error.name !== 'AbortError') {
        console.error(error);
        alert('Failed to save the file. Make sure you selected the correct Add-on root folder that contains the "behavior_pack" folder.');
      }
    }
  };

  return (
    <div className="workspace-page">
      <div className="workspace-shell">
        <div className="workspace-hero">
          <div>
            <p className="workspace-eyebrow">Workspace</p>
            <h2 className="workspace-title">Custom Block Generator</h2>
            <p className="workspace-subtitle">Easily generate rotational directional blocks for your Add-on.</p>
          </div>
        </div>

        <div className="workspace-grid workspace-grid--with-manifest">
          {/* LEFT SIDE: Input Form */}
          <section className="workspace-panel">
            <div className="workspace-field-stack">
              <label className="workspace-label">
                Block Identifier:
                <input 
                  type='text' 
                  value={blockData.blockId}
                  onChange={(e) => handleUpdate('blockId', e.target.value)}
                  className="workspace-input"
                  placeholder="my_addon"
                />
              </label>

              <label className="workspace-label">
                Block Identifier Name:
                <input 
                  type='text' 
                  value={blockData.blockName}
                  onChange={(e) => handleUpdate('blockName', e.target.value)}
                  className="workspace-input"
                  placeholder="custom_block"
                />
              </label>

              <label className="workspace-label">
                Display Name:
                <input 
                  type='text' 
                  value={blockData.blockDisplayName}
                  onChange={(e) => handleUpdate('blockDisplayName', e.target.value)}
                  className="workspace-input"
                  placeholder="Custom Block"
                />
              </label>

              <label className="workspace-label">
                Category Menu:
                <select
                  value={blockData.blockGroupMenu}
                  onChange={(e) => handleUpdate('blockGroupMenu', e.target.value)}
                  className="workspace-input"
                >
                  <option value="construction">Construction</option>
                  <option value="equipment">Equipment</option>
                  <option value="items">Items</option>
                  <option value="nature">Nature</option>
                </select>
              </label>

              <label className="workspace-label">
                Category Group:
                <input type='text' 
                  value={blockData.blockGroup}
                  onChange={(e) => handleUpdate('blockGroup', e.target.value)}
                  className="workspace-input"
                  placeholder="custom_block_group" 
                />
              </label>

              <label className="workspace-label">
                Block Tag (blockTag):
                <input 
                  type='text' 
                  value={blockData.blockTag}
                  onChange={(e) => handleUpdate('blockTag', e.target.value)}
                  className="workspace-input"
                  placeholder="custom_block_tag"
                />
              </label>

              <label className="workspace-label">
                Block Model:
                <input 
                  type='text' 
                  value={blockData.blockGeometry}
                  onChange={(e) => handleUpdate('blockGeometry', e.target.value)}
                  className="workspace-input"
                  placeholder="custom_block_geo"
                />
              </label>

              <label className="workspace-label">
                Block Texture:
                <input 
                  type='text' 
                  value={blockData.blockTexture}
                  onChange={(e) => handleUpdate('blockTexture', e.target.value)}
                  className="workspace-input"
                  placeholder="custom_texture"
                />
              </label>

              <label className="workspace-label">
                Render Method (blockRender):
                <select
                  value={blockData.blockRender}
                  onChange={(e) => handleUpdate('blockRender', e.target.value)}
                  className="workspace-input"
                >
                  <option value="opaque">Opaque (Solid)</option>
                  <option value="alpha_test">Alpha Test (Cutout/Glass)</option>
                  <option value="blend">Blend (Translucent/Water)</option>
                  <option value="alpha_test_single_sided">Alpha Test Single Sided (Plants/Crops)</option>
                </select>
              </label>
            </div>

            <hr style={{ border: '1px solid #333', margin: '24px 0' }} />

            <div className="workspace-field-stack">
              <label className="workspace-label">
                Collision Box (Paste Blockbench Array or Object):
                <textarea 
                  value={blockData.collisionBox}
                  onChange={(e) => handleUpdate('collisionBox', e.target.value)}
                  className="workspace-input"
                  rows={4}
                  style={{ resize: 'vertical', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}
                  placeholder='[{"origin": [-8, 0, -8], "size": [16, 16, 16]}]'
                />
              </label>

              <label className="workspace-label">
                Selection Box (Paste Blockbench Array or Object):
                <textarea 
                  value={blockData.selectionBox}
                  onChange={(e) => handleUpdate('selectionBox', e.target.value)}
                  className="workspace-input"
                  rows={4}
                  style={{ resize: 'vertical', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}
                  placeholder='[{"origin": [-8, 0, -8], "size": [16, 16, 16]}]'
                />
              </label>
            </div>
            
            <div className="workspace-actions-row" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button onClick={copyToClipboard} className="workspace-button workspace-button--secondary">
                Copy JSON
              </button>
              <button onClick={saveBlockFile} className="workspace-button workspace-button--primary">
                Save to Behavior Pack
              </button>
            </div>
          </section>

          {/* RIGHT SIDE: Live output stream */}
          <section className="workspace-preview-panel">
            <div className="workspace-preview-header">
              <h2 className="workspace-preview-heading">Live block.json</h2>
              <span className="workspace-preview-badge">JSON preview</span>
            </div>
            <pre className="workspace-manifest-pre">
              {getFormattedJsonString()}
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
};

export default BlockCreator;
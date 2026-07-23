import React, { useState } from 'react';

const BlockCreator = () => {
  // Initialize state for all the user inputs
  const [blockData, setBlockData] = useState({
    blockId: 'my_addon',
    blockName: 'custom_block',
    blockGroup: 'construction',
    blockTag: 'custom_block_tag',
    blockDisplayName: 'Custom Block',
    blockGeometry: 'custom_block_geo',
    blockTexture: 'custom_block_texture',
    blockRender: 'opaque',
    // Defaulting to a standard 16x16x16 box, but users can paste complex arrays here
    collisionBox: '{\n  "origin": [-8, 0, -8],\n  "size": [16, 16, 16]\n}',
    selectionBox: '{\n  "origin": [-8, 0, -8],\n  "size": [16, 16, 16]\n}'
  });

  // Generic update handler for inputs
  const handleUpdate = (field, value) => {
    setBlockData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Helper function to parse the pasted Blockbench JSON safely
  const parseBoxData = (str) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      return "Invalid JSON";
    }
  };

  // Generate the live JSON object
  const generateBlockJson = () => {
    return {
      "format_version": "1.21.20",
      "minecraft:block": {
        "description": {
          "identifier": `${blockData.blockId}:${blockData.blockName}`,
          "menu_category": {
            "category": "construction",
            "group": `itemGroup.name.${blockData.blockGroup}`
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
          // Using bracket notation to create a dynamic object key
          [`tag:${blockData.blockTag}`]: {},
          "minecraft:display_name": blockData.blockDisplayName,
          "minecraft:geometry": `geometry.${blockData.blockGeometry}`,
          "minecraft:material_instances": {
            "*": {
              "texture": blockData.blockTexture,
              "render_method": blockData.blockRender
            }
          },
          "minecraft:collision_box": parseBoxData(blockData.collisionBox),
          "minecraft:selection_box": parseBoxData(blockData.selectionBox),
          "minecraft:light_dampening": 0,
          "minecraft:light_emission": 0
        }
      }
    };
  };

  // NEW: Custom stringifier that collapses ONLY the collision and selection boxes into single lines
  const getFormattedJsonString = () => {
    const jsonObj = generateBlockJson();

    // 1. Temporarily extract the collision and selection boxes
    const collisionObj = jsonObj["minecraft:block"].components["minecraft:collision_box"];
    const selectionObj = jsonObj["minecraft:block"].components["minecraft:selection_box"];

    // 2. Put a placeholder string in their place
    jsonObj["minecraft:block"].components["minecraft:collision_box"] = "@@COLLISION_BOX@@";
    jsonObj["minecraft:block"].components["minecraft:selection_box"] = "@@SELECTION_BOX@@";

    // 3. Stringify the rest of the object normally with nice spacing (null, 2)
    let rawStr = JSON.stringify(jsonObj, null, 2);

    // 4. Stringify the extracted boxes without ANY spacing (producing a single-line string)
    const singleLineCollision = JSON.stringify(collisionObj);
    const singleLineSelection = JSON.stringify(selectionObj);

    // 5. Replace the placeholders with our single-line versions
    rawStr = rawStr.replace('"@@COLLISION_BOX@@"', singleLineCollision);
    rawStr = rawStr.replace('"@@SELECTION_BOX@@"', singleLineSelection);

    // (Optional) Collapse rotation arrays so they look neat too: [0, 180, 0]
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
      
      const fileName = `${blockData.blockName}.json`;
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
                  placeholder="e.g., my_addon"
                />
              </label>

              <label className="workspace-label">
                Block Identifier Name:
                <input 
                  type='text' 
                  value={blockData.blockName}
                  onChange={(e) => handleUpdate('blockName', e.target.value)}
                  className="workspace-input"
                  placeholder="e.g., custom_block"
                />
              </label>

              <label className="workspace-label">
                Display Name:
                <input 
                  type='text' 
                  value={blockData.blockDisplayName}
                  onChange={(e) => handleUpdate('blockDisplayName', e.target.value)}
                  className="workspace-input"
                  placeholder="e.g., Custom Block"
                />
              </label>

              <label className="workspace-label">
                Creative Menu Group:
                <input 
                  type='text' 
                  value={blockData.blockGroup}
                  onChange={(e) => handleUpdate('blockGroup', e.target.value)}
                  className="workspace-input"
                  placeholder="e.g., construction"
                />
              </label>

              <label className="workspace-label">
                Block Tag (blockTag):
                <input 
                  type='text' 
                  value={blockData.blockTag}
                  onChange={(e) => handleUpdate('blockTag', e.target.value)}
                  className="workspace-input"
                  placeholder="e.g., wood, stone, custom"
                />
              </label>

              <label className="workspace-label">
                Block Model:
                <input 
                  type='text' 
                  value={blockData.blockGeometry}
                  onChange={(e) => handleUpdate('blockGeometry', e.target.value)}
                  className="workspace-input"
                  placeholder="e.g., custom_block_geo"
                />
              </label>

              <label className="workspace-label">
                Block Texture:
                <input 
                  type='text' 
                  value={blockData.blockTexture}
                  onChange={(e) => handleUpdate('blockTexture', e.target.value)}
                  className="workspace-input"
                  placeholder="e.g., custom_texture"
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
                  rows={6}
                  style={{ resize: 'vertical', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}
                  placeholder="Paste JSON here..."
                />
              </label>

              <label className="workspace-label">
                Selection Box (Paste Blockbench Array or Object):
                <textarea 
                  value={blockData.selectionBox}
                  onChange={(e) => handleUpdate('selectionBox', e.target.value)}
                  className="workspace-input"
                  rows={6}
                  style={{ resize: 'vertical', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}
                  placeholder="Paste JSON here..."
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
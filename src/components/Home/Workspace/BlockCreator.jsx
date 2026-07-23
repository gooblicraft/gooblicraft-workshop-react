import React, { useState } from 'react';

const BlockCreator = () => {
  // Initialize state for all the user inputs specified in the brackets
  const [blockData, setBlockData] = useState({
    blockId: 'my_addon',
    blockName: 'custom_block',
    blockGroup: 'construction',
    blockTag: 'custom_block_tag',
    blockDisplayName: 'Custom Block',
    blockGeometry: 'custom_block_geo',
    blockTexture: 'custom_block_texture',
    blockRender: 'opaque'
  });

  // Generic update handler for inputs
  const handleUpdate = (field, value) => {
    setBlockData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Generate the live JSON based on the user's input state
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
          "minecraft:collision_box": {
            "origin": [-8, 0, -8],
            "size": [16, 16, 16]
          },
          "minecraft:selection_box": {
            "origin": [-8, 0, -8],
            "size": [16, 16, 16]
          },
          "minecraft:light_dampening": 0,
          "minecraft:light_emission": 0
        }
      }
    };
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(generateBlockJson(), null, 2));
    alert("Block JSON copied to clipboard!");
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
            
            <div className="workspace-actions-row" style={{ marginTop: '20px' }}>
              <button onClick={copyToClipboard} className="workspace-button workspace-button--primary">
                Copy JSON
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
              {JSON.stringify(generateBlockJson(), null, 2)}
            </pre>
          </section>
        </div>
      </div>
    </div>
  );
};

export default BlockCreator;
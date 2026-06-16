import React from 'react';

const BlockCreator = () => {
  return (
    <section className="workspace-page workspace-page--purple">
      <div className="workspace-shell">
        <div className="workspace-hero">
          <div>
            <p className="workspace-eyebrow">Workspace</p>
            <h2 className="workspace-title">Block Creator</h2>
            <p className="workspace-subtitle">
              Temporary block editor screen. This is a placeholder module for designing the
              block workflow before the full creator exists.
            </p>
          </div>
        </div>

        <div className="workspace-panel">
          <div className="workspace-field-stack">
            <label className="workspace-label">
              Block Name:
              <input type="text" className="workspace-input" placeholder="Example Block" />
            </label>

            <label className="workspace-label">
              Texture Reference:
              <input type="text" className="workspace-input" placeholder="textures/blocks/example_block" />
            </label>

            <label className="workspace-label">
              Material Type:
              <select className="workspace-input" defaultValue="stone">
                <option value="stone">Stone</option>
                <option value="wood">Wood</option>
                <option value="metal">Metal</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BlockCreator;
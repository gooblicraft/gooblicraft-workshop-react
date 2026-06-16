import React from 'react';

const EntityCreator = () => {
  return (
    <section className="workspace-page workspace-page--purple">
      <div className="workspace-shell">
        <div className="workspace-hero">
          <div>
            <p className="workspace-eyebrow">Workspace</p>
            <h2 className="workspace-title">Entity Creator</h2>
            <p className="workspace-subtitle">
              Temporary entity creator screen. Use this space to sketch entity metadata and
              keep the future editor flow ready.
            </p>
          </div>
        </div>

        <div className="workspace-panel">
          <div className="workspace-field-stack">
            <label className="workspace-label">
              Entity Name:
              <input type="text" className="workspace-input" placeholder="Example Entity" />
            </label>

            <label className="workspace-label">
              Behavior Type:
              <select className="workspace-input" defaultValue="passive">
                <option value="passive">Passive</option>
                <option value="neutral">Neutral</option>
                <option value="hostile">Hostile</option>
              </select>
            </label>

            <label className="workspace-label">
              Animation Set:
              <input type="text" className="workspace-input" placeholder="animation.entity.example" />
            </label>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EntityCreator;
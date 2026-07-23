import React, { useMemo, useState } from 'react';
import PackGenerator from './PackGenerator';
import BlockCreator from './BlockCreator';
import StoreBlockTexture from './StoreBlockTexture';
import './WorkOptions.css';

const WorkOptions = () => {
  const [selectedTool, setSelectedTool] = useState(null);

  const options = useMemo(
    () => [
      {
        id: 'pack',
        title: 'Pack Generator',
        description: 'Create addon packs, set basic metadata, and generate the starter folder structure.',
        buttonLabel: 'Open pack generator',
        imageLabel: 'Pack generator preview',
        imageStyle: 'work-option-card__image--pack',
      },
      {
        id: 'block',
        title: 'Block Creator',
        description: 'Build a block prototype with a temporary workspace while the full editor is being prepared.',
        buttonLabel: 'Open block creator',
        imageLabel: 'Block creator preview',
        imageStyle: 'work-option-card__image--block',
      },
      {
        id: 'texture',
        title: 'Texture Storage',
        description: 'Draft an texture concept and keep the workflow ready for a future dedicated editor.',
        buttonLabel: 'Open texture creator',
        imageLabel: 'texture creator preview',
        imageStyle: 'work-option-card__image--texture',
      },
    ],
    []
  );

  const renderSelectedTool = () => {
    switch (selectedTool) {
      case 'block':
        return <BlockCreator />;
      case 'texture':
        return <StoreBlockTexture />;
      case 'pack':
        return <PackGenerator />;
      default:
        return (
          <div className="work-options-empty-state">
            <h2 className="work-options-empty-state__title">Pick a workspace tool</h2>
            <p className="work-options-empty-state__text">
              Click the first card to open the pack generator, or choose one of the other cards to load its temporary creator.
            </p>
          </div>
        );
    }
  };
      if (selectedTool) {
        return (
          <div className="work-options-tool-screen">
            <button
              type="button"
              className="work-options-back-button"
              onClick={() => setSelectedTool(null)}
            >
              Back to options
            </button>
            {renderSelectedTool()}
          </div>
        );
      }


  return (
    <div className="work-options-page">
      <section className="work-options-hero">
        <p className="work-options-eyebrow">Workspace</p>
        <h1 className="work-options-title">Let&apos;s get started</h1>
        <p className="work-options-subtitle">
          Choose the tool you want to open. The first card launches the pack generator,
          the second opens the block creator, and the third opens the texture creator.
        </p>
      </section>

      <section className="work-options-grid" aria-label="Workspace options">
        {options.map((option) => {
          const isActive = selectedTool === option.id;

          return (
            <article key={option.id} className={`work-option-card${isActive ? ' work-option-card--active' : ''}`}>
              <div className={`work-option-card__image ${option.imageStyle}`} aria-hidden="true">
                <span className="work-option-card__image-mark" />
              </div>
              <div className="work-option-card__body">
                <h2 className="work-option-card__title">{option.title}</h2>
                <p className="work-option-card__description">{option.description}</p>
                <button
                  type="button"
                  className="work-option-card__button"
                  onClick={() => setSelectedTool(option.id)}
                  aria-label={option.imageLabel}
                >
                  {option.buttonLabel}
                </button>
              </div>
            </article>
          );
        })}
      </section>

      <section className="work-options-content">{renderSelectedTool()}</section>
    </div>
  );
};

export default WorkOptions;
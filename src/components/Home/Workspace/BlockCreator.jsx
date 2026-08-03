import React, { useState, useEffect } from 'react';
import BasicBlock from './Block_options/BasicBlock';
import RotateAbleBlock from './Block_options/RotateAbleBlock';
import VerticalBlock1x2 from './Block_options/VerticalBlock1x2';
import HorizontalBlock1x2 from './Block_options/HorizontalBlock1x2';
import PushableBlock from './Block_options/PushableBlock';
import VerticalBlock2x2 from './Block_options/VerticalBlock2x2';
import HorizontalBlock2x2 from './Block_options/HorizontalBlock2x2';

const BlockCreator = ({ availableTextures = [] }) => {
  const [activeOption, setActiveOption] = useState('basic');
  const [createdBlocks, setCreatedBlocks] = useState([]);
  const [hasUnsavedProgress, setHasUnsavedProgress] = useState(false);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 900);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileQueueOpen, setMobileQueueOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 900;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileMenuOpen(false);
        setMobileQueueOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTabSwitch = (nextOption) => {
    if (activeOption === nextOption) return;

    if (hasUnsavedProgress) {
      const confirmSwitch = window.confirm(
        "Do you want to discontinue your current progress before we proceed?"
      );
      if (!confirmSwitch) return;
    }

    setActiveOption(nextOption);
    setHasUnsavedProgress(false);
    setMobileMenuOpen(false);
  };

  const handleAddBlockToQueue = (blockData, blockType) => {
    const blockName = blockData.blockName || 'custom_block';
    
    if (createdBlocks.some(b => b.blockName === blockName && b.blockType === blockType)) {
      alert(`A ${blockType} block with the identifier name "${blockName}" is already in the queue!`);
      return;
    }
    
    setCreatedBlocks(prev => [...prev, { ...blockData, blockType }]);
    setHasUnsavedProgress(false);
    alert(`Successfully added "${blockName}" to the Block Queue!`);
  };

  const handleRemoveFromQueue = (indexToRemove) => {
    const blockToDelete = createdBlocks[indexToRemove];
    const blockName = blockToDelete?.blockName || 'custom_block';

    const confirmDelete = window.confirm(
      `Are you sure you want to remove "${blockName}" from the queue?`
    );

    if (confirmDelete) {
      setCreatedBlocks(prev => prev.filter((_, index) => index !== indexToRemove));
    }
  };

  const handleClearQueue = () => {
    if (createdBlocks.length === 0) return;
    if (window.confirm("Are you sure you want to clear all queued blocks?")) {
      setCreatedBlocks([]);
    }
  };

  const handleSaveAllBlocks = async () => {
    if (createdBlocks.length === 0) {
      alert("No blocks in the queue to save.");
      return;
    }

    if (!window.showDirectoryPicker) {
      alert('Your browser does not support folder selection.');
      return;
    }

    try {
      alert("Please select your 'behavior_pack' folder (or the folder containing 'blocks').");
      const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      
      let blocksHandle;
      
      try {
        blocksHandle = await dirHandle.getDirectoryHandle('blocks', { create: true });
      } catch (e) {
        const bpHandle = await dirHandle.getDirectoryHandle('behavior_pack', { create: true });
        blocksHandle = await bpHandle.getDirectoryHandle('blocks', { create: true });
      }

      await Promise.all(
        createdBlocks.map(async (block) => {
          const fileName = `${block.blockName || 'custom_block'}.json`;
          const fileHandle = await blocksHandle.getFileHandle(fileName, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(`${block.jsonContent}\n`);
          await writable.close();
        })
      );

      alert(`Successfully saved ${createdBlocks.length} block(s) to behavior_pack/blocks/!`);
      setCreatedBlocks([]);
      setHasUnsavedProgress(false);
    } catch (error) {
      if (error && error.name !== 'AbortError') {
        console.error("Error saving blocks:", error);
        alert('Failed to save blocks. Please check the console for details.');
      }
    }
  };

  const getActiveBlockLabel = () => {
    if (activeOption === 'basic') return 'Basic Block';
    if (activeOption === 'rotatable') return 'Rotatable Block';
    if (activeOption === 'pushable') return 'Pushable Block';
    if (activeOption === 'vertical1x2') return '1x2 Vertical Block';
    if (activeOption === 'vertical2x2') return '2x2 Vertical Block';
    if (activeOption === 'horizontal1x2') return '1x2 Horizontal Block';
    if (activeOption === 'horizontal2x2') return '2x2 Horizontal Block';
    return 'Block Creator';
  };

  return (
    <div className="workspace-page" style={{ 
      display: 'flex', 
      flexDirection: 'column',
      height: 'calc(100vh - 60px)', 
      width: '100%', 
      boxSizing: 'border-box',
      overflow: 'hidden',
      margin: 0,
      padding: 0,
      fontSize: '0.75rem',
      position: 'relative'
    }}>
      
      {/* MOBILE TOP CONTROLS BAR */}
      {isMobile && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#161b22',
          borderBottom: '1px solid #30363d',
          padding: '8px 12px',
          flexShrink: 0,
          zIndex: 10
        }}>
          <button
            onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setMobileQueueOpen(false); }}
            style={{
              padding: '6px 12px',
              backgroundColor: 'rgba(126, 231, 135, 0.1)',
              border: '1px solid #7ee787',
              borderRadius: '6px',
              color: '#7ee787',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.75rem'
            }}
          >
            {mobileMenuOpen ? '✕ Close Menu' : '📂 Block Types'}
          </button>

          <span style={{ color: '#c9d1d9', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.7rem' }}>
            {getActiveBlockLabel()}
          </span>

          <button
            onClick={() => { setMobileQueueOpen(!mobileQueueOpen); setMobileMenuOpen(false); }}
            style={{
              padding: '6px 12px',
              backgroundColor: 'rgba(47, 120, 255, 0.1)',
              border: '1px solid #7fb0ff',
              borderRadius: '6px',
              color: '#7fb0ff',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '0.75rem'
            }}
          >
            {mobileQueueOpen ? '✕ Close Queue' : `📦 Queue (${createdBlocks.length})`}
          </button>
        </div>
      )}

      {/* MAIN BODY CONTAINER */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', width: '100%' }}>
        
        {/* LEFT SIDEBAR: BLOCK TYPES */}
        <div style={{
          width: '180px',
          backgroundColor: isMobile ? '#0d1117' : 'transparent',
          borderRight: '1px solid #30363d',
          padding: '10px 8px',
          display: isMobile && !mobileMenuOpen ? 'none' : 'flex',
          flexDirection: 'column',
          gap: '6px',
          flexShrink: 0,
          position: isMobile ? 'absolute' : 'relative',
          top: 0,
          left: 0,
          height: '100%',
          zIndex: 100,
          boxShadow: isMobile ? '4px 0 15px rgba(0,0,0,0.5)' : 'none'
        }}>
          <p style={{ 
            fontSize: '0.6rem', 
            fontWeight: 'bold', 
            letterSpacing: '1px', 
            color: '#8b949e', 
            marginBottom: '2px',
            paddingLeft: '4px',
            textTransform: 'uppercase' 
          }}>
            Block Types
          </p>

          <button
            onClick={() => handleTabSwitch('basic')}
            style={{
              width: '100%',
              padding: '6px 10px',
              textAlign: 'left',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              borderRadius: '8px',
              cursor: 'pointer',
              border: activeOption === 'basic' ? '1px solid #7ee787' : '1px solid #444c56',
              backgroundColor: activeOption === 'basic' ? 'rgba(126, 231, 135, 0.08)' : 'rgba(255, 255, 255, 0.05)',
              color: activeOption === 'basic' ? '#7ee787' : '#c9d1d9',
              transition: 'all 0.2s ease'
            }}
          >
            Basic Block
          </button>

          <button
            onClick={() => handleTabSwitch('rotatable')}
            style={{
              width: '100%',
              padding: '6px 10px',
              textAlign: 'left',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              borderRadius: '8px',
              cursor: 'pointer',
              border: activeOption === 'rotatable' ? '1px solid #7ee787' : '1px solid #444c56',
              backgroundColor: activeOption === 'rotatable' ? 'rgba(126, 231, 135, 0.08)' : 'rgba(255, 255, 255, 0.05)',
              color: activeOption === 'rotatable' ? '#7ee787' : '#c9d1d9',
              transition: 'all 0.2s ease'
            }}
          >
            Rotatable Block
          </button>

          <button
            onClick={() => handleTabSwitch('pushable')}
            style={{
              width: '100%',
              padding: '6px 10px',
              textAlign: 'left',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              borderRadius: '8px',
              cursor: 'pointer',
              border: activeOption === 'pushable' ? '1px solid #7ee787' : '1px solid #444c56',
              backgroundColor: activeOption === 'pushable' ? 'rgba(126, 231, 135, 0.08)' : 'rgba(255, 255, 255, 0.05)',
              color: activeOption === 'pushable' ? '#7ee787' : '#c9d1d9',
              transition: 'all 0.2s ease'
            }}
          >
            Pushable Block
          </button>

          <button
            onClick={() => handleTabSwitch('vertical1x2')}
            style={{
              width: '100%',
              padding: '6px 10px',
              textAlign: 'left',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              borderRadius: '8px',
              cursor: 'pointer',
              border: activeOption === 'vertical1x2' ? '1px solid #7ee787' : '1px solid #444c56',
              backgroundColor: activeOption === 'vertical1x2' ? 'rgba(126, 231, 135, 0.08)' : 'rgba(255, 255, 255, 0.05)',
              color: activeOption === 'vertical1x2' ? '#7ee787' : '#c9d1d9',
              transition: 'all 0.2s ease'
            }}
          >
            1x2 Vertical Block
          </button>

          <button
            onClick={() => handleTabSwitch('vertical2x2')}
            style={{
              width: '100%',
              padding: '6px 10px',
              textAlign: 'left',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              borderRadius: '8px',
              cursor: 'pointer',
              border: activeOption === 'vertical2x2' ? '1px solid #7ee787' : '1px solid #444c56',
              backgroundColor: activeOption === 'vertical2x2' ? 'rgba(126, 231, 135, 0.08)' : 'rgba(255, 255, 255, 0.05)',
              color: activeOption === 'vertical2x2' ? '#7ee787' : '#c9d1d9',
              transition: 'all 0.2s ease'
            }}
          >
            2x2 Vertical Block
          </button>

          <button
            onClick={() => handleTabSwitch('horizontal1x2')}
            style={{
              width: '100%',
              padding: '6px 10px',
              textAlign: 'left',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              borderRadius: '8px',
              cursor: 'pointer',
              border: activeOption === 'horizontal1x2' ? '1px solid #7ee787' : '1px solid #444c56',
              backgroundColor: activeOption === 'horizontal1x2' ? 'rgba(126, 231, 135, 0.08)' : 'rgba(255, 255, 255, 0.05)',
              color: activeOption === 'horizontal1x2' ? '#7ee787' : '#c9d1d9',
              transition: 'all 0.2s ease'
            }}
          >
            1x2 Horizontal Block
          </button>

          <button
            onClick={() => handleTabSwitch('horizontal2x2')}
            style={{
              width: '100%',
              padding: '6px 10px',
              textAlign: 'left',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              borderRadius: '8px',
              cursor: 'pointer',
              border: activeOption === 'horizontal2x2' ? '1px solid #7ee787' : '1px solid #444c56',
              backgroundColor: activeOption === 'horizontal2x2' ? 'rgba(126, 231, 135, 0.08)' : 'rgba(255, 255, 255, 0.05)',
              color: activeOption === 'horizontal2x2' ? '#7ee787' : '#c9d1d9',
              transition: 'all 0.2s ease'
            }}
          >
            2x2 Horizontal Block
          </button>
        </div>

        {/* MIDDLE CONTENT AREA */}
        <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#0d1117', width: '100%', boxSizing: 'border-box' }}>
          {activeOption === 'basic' && (
            <BasicBlock 
              availableTextures={availableTextures} 
              onAddBlock={(data) => handleAddBlockToQueue(data, 'Basic')}
              onFormChange={() => setHasUnsavedProgress(true)}
            />
          )}
          {activeOption === 'rotatable' && (
            <RotateAbleBlock 
              availableTextures={availableTextures} 
              onAddBlock={(data) => handleAddBlockToQueue(data, 'Rotatable')} 
              onFormChange={() => setHasUnsavedProgress(true)}
            />
          )}
          {activeOption === 'pushable' && (
            <PushableBlock 
              availableTextures={availableTextures} 
              onAddBlock={(data) => handleAddBlockToQueue(data, 'Pushable')} 
              onFormChange={() => setHasUnsavedProgress(true)}
            />
          )}
          {activeOption === 'vertical1x2' && (
            <VerticalBlock1x2 
              availableTextures={availableTextures} 
              onAddBlock={(data) => handleAddBlockToQueue(data, '1x2 Vertical')} 
              onFormChange={() => setHasUnsavedProgress(true)}
            />
          )}
          {activeOption === 'vertical2x2' && (
            <VerticalBlock2x2 
              availableTextures={availableTextures} 
              onAddBlock={(data) => handleAddBlockToQueue(data, '2x2 Vertical')} 
              onFormChange={() => setHasUnsavedProgress(true)}
            />
          )}
          {activeOption === 'horizontal1x2' && (
            <HorizontalBlock1x2 
              availableTextures={availableTextures} 
              onAddBlock={(data) => handleAddBlockToQueue(data, '1x2 Horizontal')} 
              onFormChange={() => setHasUnsavedProgress(true)}
            />
          )}
          {activeOption === 'horizontal2x2' && (
            <HorizontalBlock2x2 
              availableTextures={availableTextures} 
              onAddBlock={(data) => handleAddBlockToQueue(data, '2x2 Horizontal')} 
              onFormChange={() => setHasUnsavedProgress(true)}
            />
          )}
        </div>

        {/* RIGHT SIDEBAR: QUEUE & SAVE ALL */}
        <div style={{
          width: isMobile ? '260px' : '240px',
          backgroundColor: 'rgba(22, 27, 34, 0.95)',
          borderLeft: '1px solid #30363d',
          padding: '10px',
          display: isMobile && !mobileQueueOpen ? 'none' : 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          boxSizing: 'border-box',
          position: isMobile ? 'absolute' : 'relative',
          top: 0,
          right: 0,
          height: '100%',
          zIndex: 100,
          boxShadow: isMobile ? '-4px 0 15px rgba(0,0,0,0.5)' : 'none'
        }}>
          <h3 style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: '8px', color: '#ffffff', borderBottom: '1px solid #30363d', paddingBottom: '6px', marginTop: 0 }}>
            Block Queue ({createdBlocks.length})
          </h3>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
            {createdBlocks.length === 0 ? (
              <p style={{ fontSize: '0.7rem', opacity: 0.5, textAlign: 'center', marginTop: '20px' }}>
                No blocks in queue.
              </p>
            ) : (
              createdBlocks.map((block, index) => (
                <div key={index} style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid #30363d',
                  borderRadius: '5px',
                  padding: '6px 8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <p style={{ margin: '0 0 1px 0', fontSize: '0.75rem', fontWeight: 'bold', color: '#7ee787' }}>
                      {block.blockName || 'custom_block'}
                    </p>
                    <span style={{ fontSize: '0.6rem', opacity: 0.7, backgroundColor: 'rgba(255,255,255,0.08)', padding: '1px 3px', borderRadius: '3px' }}>
                      {block.blockType}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleRemoveFromQueue(index)}
                    style={{ background: 'none', border: 'none', color: '#da3633', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}
                    title="Remove"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          <div style={{ display: 'flex', gap: '6px', paddingTop: '6px', borderTop: '1px solid #30363d' }}>
            <button 
              onClick={handleClearQueue}
              style={{
                flex: 1,
                padding: '6px',
                backgroundColor: '#da3633',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.7rem'
              }}
            >
              Clear
            </button>

            <button 
              onClick={handleSaveAllBlocks}
              style={{
                flex: 1,
                padding: '6px',
                backgroundColor: '#238636',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontSize: '0.7rem'
              }}
            >
              Save All
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};

export default BlockCreator;
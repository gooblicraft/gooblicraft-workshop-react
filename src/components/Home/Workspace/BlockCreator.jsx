import React, { useState } from 'react';
import BasicBlock from './Block_options/BasicBlock';
import RotateAbleBlock from './Block_options/RotateAbleBlock';
import goobliIcon from '../../../assets/goobli_icon.png'; // I-adjust ang path depende sa folder location ng BlockCreator.jsx mo

const BlockCreator = ({ availableTextures = [] }) => {
  const [activeOption, setActiveOption] = useState('menu');

  return (
    <div className="workspace-page">
      <div className="workspace-shell">
        
        {activeOption === 'menu' ? (
          <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center', padding: '40px 20px' }}>
            <p className="workspace-eyebrow" style={{ letterSpacing: '2px' }}>WORKSPACE</p>
            <h2 className="workspace-title" style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Block Creator Hub</h2>
            <p className="workspace-subtitle" style={{ marginBottom: '40px' }}>
              Select a block type below to start generating custom configurations for your Minecraft add-on.
            </p>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '25px',
              justifyContent: 'center'
            }}>
              
              {/* CARD 1: BASIC BLOCK */}
              <div 
                onClick={() => setActiveOption('basic')}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid #444c56',
                  borderRadius: '16px',
                  padding: '24px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#7ee787';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#444c56';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ 
                  width: '100%', 
                  height: '160px', 
                  backgroundColor: 'rgba(0, 0, 0, 0.3)', 
                  borderRadius: '12px', 
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <img 
                    src={goobliIcon} 
                    alt="Basic Block Preview" 
                    style={{ width: '80px', height: '80px', objectFit: 'contain', imageRendering: 'pixelated' }} 
                  />
                </div>

                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#ffffff' }}>Basic Block</h3>
                <p style={{ margin: 0, opacity: 0.7, fontSize: '0.85rem', lineHeight: '1.4' }}>
                  Standard static block configuration with cardinal placement and customizable hitboxes.
                </p>
              </div>

              {/* CARD 2: ROTATABLE BLOCK */}
              <div 
                onClick={() => setActiveOption('rotatable')}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid #444c56',
                  borderRadius: '16px',
                  padding: '24px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#7ee787';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#444c56';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div style={{ 
                  width: '100%', 
                  height: '160px', 
                  backgroundColor: 'rgba(0, 0, 0, 0.3)', 
                  borderRadius: '12px', 
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <img 
                    src={goobliIcon} 
                    alt="Rotatable Block Preview" 
                    style={{ width: '80px', height: '80px', objectFit: 'contain', imageRendering: 'pixelated' }} 
                  />
                </div>

                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#ffffff' }}>Rotatable Block</h3>
                <p style={{ margin: 0, opacity: 0.7, fontSize: '0.85rem', lineHeight: '1.4' }}>
                  Advanced variant-based block supporting custom rotations, bone visibility, and custom components.
                </p>
              </div>

            </div>
          </div>
        ) : (
          
          <div>
            <div style={{ maxWidth: '1400px', margin: '0 auto 20px auto', padding: '0 20px' }}>
              <button 
                onClick={() => setActiveOption('menu')}
                style={{
                  padding: '8px 16px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid #444c56',
                  color: '#c9d1d9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease'
                }}
              >
                ← Back to Block Options
              </button>
            </div>

            {activeOption === 'basic' ? (
              <BasicBlock availableTextures={availableTextures} />
            ) : (
              <RotateAbleBlock availableTextures={availableTextures} />
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default BlockCreator;
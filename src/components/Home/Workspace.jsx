import React from 'react';
import WorkOptions from './Workspace/WorkOptions';

const Workspace = ({ dirHandle, setDirHandle, textures, setTextures }) => {
  return (
    <>
      <WorkOptions 
        dirHandle={dirHandle} 
        setDirHandle={setDirHandle} 
        textures={textures} 
        setTextures={setTextures} 
      />
    </>
  )
}

export default Workspace;
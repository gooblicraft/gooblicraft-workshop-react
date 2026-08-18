import React, { createContext, useState, useContext } from 'react';

const TextureContext = createContext();

export const TextureProvider = ({ children }) => {
  const [textures, setTextures] = useState([]);
  const [dirHandle, setDirHandle] = useState(null);

  return (
    <TextureContext.Provider value={{ textures, setTextures, dirHandle, setDirHandle }}>
      {children}
    </TextureContext.Provider>
  );
};

export const useTextures = () => useContext(TextureContext);
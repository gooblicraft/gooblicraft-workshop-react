import React, { createContext, useState, useContext } from 'react';

const ModelContext = createContext();

export const ModelProvider = ({ children }) => {
  const [geometries, setGeometries] = useState([]);
  const [dirHandle, setDirHandle] = useState(null);

  return (
    <ModelContext.Provider value={{ geometries, setGeometries, dirHandle, setDirHandle }}>
      {children}
    </ModelContext.Provider>
  );
};

export const useModels = () => useContext(ModelContext);
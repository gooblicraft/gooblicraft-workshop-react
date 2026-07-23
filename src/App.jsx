import { useState } from "react";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";

import Home from "./Home";
import About from "./About";
import Contact from "./Contact";
import Navbar from "./Navbar";
import DownloadPacks from "./DownloadPacks";
import Workspace from "./components/Home/Workspace";

function App() {
  // DITO NA NAKALAGAY ANG GLOBAL STATE PARA HINDI MABURA KAHIT LUMIPAT KA NG PAGE
  const [dirHandle, setDirHandle] = useState(null);
  const [textures, setTextures] = useState([]);

  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/downloadpacks" element={<DownloadPacks />} />
          
          {/* IPINAPASA NATIN ANG STATE PAPUNTA SA WORKSPACE / STOREBLOCKTEXTURE */}
          <Route 
            path="/workspace" 
            element={
              <Workspace 
                dirHandle={dirHandle} 
                setDirHandle={setDirHandle} 
                textures={textures} 
                setTextures={setTextures} 
              />
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>     
    </>
  );
}

export default App;
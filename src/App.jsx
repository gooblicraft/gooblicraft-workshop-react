import { BrowserRouter, Routes, Route} from "react-router-dom";

import Home from "./Home";
import About from "./About";
import Contact from "./Contact"
import Navbar from "./Navbar";

function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar/>
        <Routes>
          <Route path="/" element={<Home/>}></Route>
          <Route path="/about" element={<About/>}></Route>
          <Route path="/contact" element={<Contact/>}></Route>
        </Routes>
      </BrowserRouter>      
    </>
  )
}

export default App

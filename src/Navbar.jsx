import React from 'react';
import {Link} from "react-router-dom";
import goobliIcon from './assets/goobli_icon.png';

function Navbar(){
  return (
    <header className='navbar'>
      <div className='branding'>
        <img src={goobliIcon} alt="Goobli's Icon" className="goobli_icon" />
        <h2 className="brand_title">Goobli's Workshop</h2>
      </div>
      <div className='nav_links'>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
      </div>
    </header>
  )
}

export default Navbar
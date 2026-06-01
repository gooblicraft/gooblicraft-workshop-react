import React from 'react'
import { Link } from 'react-router-dom'

const Featured = () => {
    return (
        <div className="featured_bg">
            <div className="featured_content">
                <div className="gooblicraft">
                    <h1>Gooblicraft</h1>
                    <p>Explore my collection of Minecraft Bedrock addons, resource packs and projects. All for free !</p>
                </div>
        
            <div className="goobli_buttons">
                <Link className="dl_btn" to="/downloadpacks">Download Packs</Link>
                <Link className="wf_btn" to="/workspace">Workspace</Link>
            </div>
        
            <div className="scroll_mark"><p>Scroll Down ↓</p></div>
            </div>
        </div>
    )
}

export default Featured
import React from 'react';
import './needKnow.css';
import getAddon from '../../assets/getAddon.svg';
import createAddon from '../../assets/createAddon.svg';
import encounterSmt from '../../assets/encounterSmt.svg';
import suggestSmt from '../../assets/suggestSmt.svg';

const NeedKnow = () => {
  return (
    <div className="need_know">
      <div className="know_about1">
        <div className="get_addons">
          <h1>How to get the add-ons?</h1>
          <p>Just simply download the pack you want and apply it into your Minecraft App.</p>
        </div>

        <div className="get_addon_img">
          <img src={getAddon} alt="Get Addon" />
        </div>
      </div>

      <div className="know_about2">
        <div className="encounter_smt">
          <h1>i encounter something !</h1>
          <p>You can report it on my discord server and file an report.</p>
        </div>

        <div className="get_encounter_img">
            <img src={encounterSmt} alt="Encounter Smt" />
        </div>
      </div>

      <div className="know_about3">
        <div className="create_in_workspace">
          <h1>Create or port addon?</h1>
          <p>Click the workspace if you want to create your own project.</p>
        </div>

        <div className="create_addon_img">
            <img src={createAddon} alt="Create Addon" />
        </div>
      </div>

      <div className="know_about4">
        <div className="suggest_smt">
          <h1>I want to suggest something!</h1>
          <p>Join in my discord server by going to contact page.</p>
        </div>

        <div className="suggest_img">
            <img src={suggestSmt} alt="Suggest Smt" />
        </div>
      </div>
    </div>
  );
};

export default NeedKnow;
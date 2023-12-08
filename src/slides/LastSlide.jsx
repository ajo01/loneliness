import React from "react";
import styles from "./LastSlide.module.css";
import Leanne from "../assets/leanne.svg";
import Amy from "../assets//amy.svg";
import Jorene from "../assets//jorene.svg";
import Jasmine from "../assets//jas.svg";

const LastSlide = () => {
  return (
    <div className="slidePage lastSlide">
      <div id={styles.lastSlide}>
        <div id={styles.lastSlideTitle}>Made with 💛☕️👩🏻‍💻</div>
        <div id={styles.containerRow}>
          <div className="container vertical">
            <img className={styles.img} src={Leanne} alt="leanne" />
            <div>Poh Leanne Kee</div>
          </div>

          <div className="container vertical">
            <img className={styles.img} src={Amy} alt="amy" />
            <div>Amy Jo</div>
          </div>
          <div className="container vertical">
            <img className={styles.img} src={Jorene} alt="jorene" />
            <div className="txt">Jorene Ng</div>
          </div>
          <div className="container vertical">
            <img className={styles.img} src={Jasmine} alt="jasmine" />
            <div>Jasmine Ke</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LastSlide;

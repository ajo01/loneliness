import React from "react";
import styles from "./CreditSlide.module.css";

const CreditSlide = () => {
  return (
    <div className="slidePage">
      <div id={styles.creditSlide}>
        <div className="slideSubTitle">Resources</div>
        <div>
          <div>kurzegast</div>
          <div>emotional first aid</div>
          <div>healthline/mental health hotline</div>
          <div className="spacer">placeholder</div>
        </div>

        <div className="slideSubTitle">Credits</div>
      </div>
    </div>
  );
};

export default CreditSlide;

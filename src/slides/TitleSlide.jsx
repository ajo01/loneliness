import React from "react";
import styles from "./TitleSlide.module.css";
import arrows from "../assets/arrowkeys.svg";
import lonelyBoi from "../assets/animatedBoi.gif";
import Typewriter from 'typewriter-effect';



const TitleSlide = () => {

  return (
    <div className="slidePage">
      <div id={styles.titleIntro}>
        <div
          className={styles.img}>
        <img src={lonelyBoi} alt="loading..." />
        </div>
        
        <div className={styles.titleText}>Loneliness</div>
        
        <div className={styles.txt}>
        <Typewriter 
          options={{
            strings: ['A data visualization on the emotional epidemic that touches us all.'],
            delay:45,
            autoStart: true,
            loop: true,
            pauseFor:7500,
          }}
        />
        </div>
        
          
        <div id={styles.highlightBox}>
        <div className={styles.text}>
        {`65,000+ data points from OSF Home's COVIDiSTRESS Global Survey and Statistics Canada were
          used. You can explore the datasets `}
          <a href="https://osf.io/5ktgm ">here</a>
          {` and `}
          <a href="https://www150.statcan.gc.ca/t1/tbl1/en/tv.action?pid=4510004901">
            here
          </a>
          .
        </div>
          <div id={styles.arrowBox}> 
          <img className={styles.arrowImg} src={arrows} alt="arrows" />
          <div>
            <div className={styles.arrowText}> <b>Quick Tip:</b></div>
            <div className={styles.arrowText}>You can also use arrow keys to navigate this site!</div>
          </div>
         
        </div>
      </div>
    </div>
    </div>
  );
};


export default TitleSlide;

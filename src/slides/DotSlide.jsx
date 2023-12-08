import React from "react";
import styles from "./DotSlide.module.css";
import Typewriter from 'typewriter-effect';



const DotSlide = () => {
  return (
    <div className="slidePage">
      <div id={styles.dotIntro}>
        <div className="slideTitle"> How did loneliness affect</div>
        <div className = "slideTitleGrad"> 
          <Typewriter 
            options={{
              strings: ['people during the pandemic?','those who were isolated?'],
              delay:40,
              deleteSpeed: 'natural',
              autoStart: true,
              loop: true,
              pauseFor:3500,
            }}
          />
        </div>
       
        
        <div className={styles.txt}>
          You might be asking: How is loneliness relevant to me? To partly answer this question, we wanted to take a look into the (very recent and relevant) COVID-19 pandemic and how it relates to loneliness. We looked at two things: covid in relation to isolation, and the distribution of loneliness.
        </div>
        <div className={styles.flex}>
          <div id={styles.highlightBox}>
            <div className={styles.textBlue}>Loneliness Distribution</div>
          </div>
          <div id={styles.highlightBoxYellow}>
            <div className={styles.textYellow}>Loneliness vs. Covid Isolation Level</div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DotSlide;

import React from "react";
import styles from "./ScatterSlide.module.css";
import Typewriter from 'typewriter-effect';

const ScatterSlide = () => {
  return (
    <div className="slidePage">
      <div id={styles.scatterIntro}>
        <div className="slideTitle">How does </div>
        <div className="slideTitleGrad">
        <Typewriter 
           options={{
            strings: ['behaviour', 'introversion','extroversion', 'not touching grass enough'],
            delay:40,
            deleteSpeed: 'natural',
            autoStart: true,
            loop: true,
            pauseFor:3500,
          }}
        />
        </div>
        <div className="slideTitle"> correlate to loneliness?</div>
        <div className={styles.txt}>
          So now that we've seen how isolation and COVID in particular has affected loneliness in the short term, are there any behavioural factors and patterns that could lead
          to loneliness in the long term? Let's take a look with these visualizations:
        </div>
        <div className={styles.flex}>
          <div id={styles.highlightBox}>
            <div className={styles.textBlue}>Introversion vs. Extroversion</div>
          </div>
          <div id={styles.highlightBoxYellow}>
            <div className={styles.textYellow}>Other Interesting Factors</div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ScatterSlide;

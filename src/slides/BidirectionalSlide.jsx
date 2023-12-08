import React from "react";
import styles from "./Bidirectional.module.css";
import Typewriter from 'typewriter-effect';

const BidirectionalSlide = () => {
  return (
    <div className="slidePage">
      <div id={styles.bidirIntro}>
        <div className="slideTitle">Are there people like me who feel lonely?</div>
        <div className="slideTitleGrad">
        <Typewriter 
           options={{
            strings: ['University students.','Retirees.', 'Rural residents.','Immigrants.'],
            delay:40,
            deleteSpeed: 'natural',
            autoStart: true,
            loop: true,
            pauseFor:3500,
          }}
        />
        </div>
  
        <div className={styles.txt}>
          You might ask: Are people who are working less lonely? What about my gender, does that have anything to do with loneliness? We had the same questions, and wanted to see, across different sociological factors,
          if loneliness varied drastically for any particular groups. This next visualization is specifically based on Statistics Canada's database.
        </div>
       
      </div>
    </div>
  );
};

export default BidirectionalSlide;

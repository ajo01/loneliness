import React from "react";
import  { useState, useEffect } from 'react';
import styles from './Typewriter.module.css';

const useTypewriter = (text, speed = 70) => {
    const [displayText, setDisplayText] = useState('');
  
    useEffect(() => {
      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < text.length) {
          setDisplayText(prevText => prevText + text.charAt(i));
          i++;
        } else {
          clearInterval(typingInterval);
        }
      }, speed);
  
      return () => {
        clearInterval(typingInterval);
      };
    }, [text, speed]);
  
    return displayText;
  };

const Typewriter = ({ text, speed }) => {
    const displayText = useTypewriter(text, speed);
  
    return <div className={`${styles.type} ${styles.text}`}
          >{displayText}</div>;
  };
  
  export default Typewriter;
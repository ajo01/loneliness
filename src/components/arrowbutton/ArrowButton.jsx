import React from "react";
import styles from "./ArrowButton.module.css";

const ArrowButton = (clickHandler, alignment, onClick) => {
  if (alignment === "up") {
    return (
      <div
        className={`${styles.arrowBtn} ${styles.up}`}
        onClick={() => {
          onClick();
          clickHandler();
        }}
      >
        <div className={styles.arrow} />
      </div>
    );
  }
  return (
    <div
      className={`${styles.arrowBtn} ${styles.down}`}
      onClick={() => {
        onClick();
        clickHandler();
      }}
    >
      <div className={styles.arrow} />
    </div>
  );
};

export default ArrowButton;

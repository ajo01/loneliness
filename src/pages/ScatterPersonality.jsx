import React, { useEffect, useRef, useState } from "react";
import { Scatterplot } from "../classes/scatterplot";
import "./ScatterPersonality.css";
import {
    avgLineLabel,
    highIntrovert,
    lowIntrovert,
    highExtravert,
    lowExtravert} from "../assets/svg";

const orange = "var(--pointFirst)";
const blue = "var(--pointFifth)";

const ScatterPersonalityPage = ({ data2 }) => {
  const left_svg = useRef(null);
  const right_svg = useRef(null);
  const [leftChart, setLeftChart] = useState(null);
  const [rightChart, setRightChart] = useState(null);
  const [containerWidth, setContainerWidth] = useState(window.innerWidth);
  const [containerHeight, setContainerHeight] = useState(window.innerHeight);

  useEffect(() => {
    const handleResize = () => {
      setContainerWidth(window.innerWidth);
      setContainerHeight(window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (data2) {
      if (!leftChart && left_svg.current) {
        const leftChart = new Scatterplot(left_svg.current, data2, 0.5, "left");
        setLeftChart(leftChart);

        leftChart.updateVis("introvert", containerWidth, containerHeight);
      } else if (leftChart) {
        leftChart.updateVis("introvert", containerWidth, containerHeight);
      }

      if (!rightChart && right_svg.current) {
        const rightChart = new Scatterplot(right_svg.current, data2, 0.5, "right");
        setRightChart(rightChart);

        rightChart.updateVis("extravert", containerWidth, containerHeight);
      } else if (rightChart) {
        rightChart.updateVis("extravert", containerWidth, containerHeight);
      }
    }
  }, [data2, leftChart, rightChart, containerWidth, containerHeight]);

  return (
    <div className="scatterPersonality">
      <div className="heading">
        <div className="left-heading">
          Feelings of Isolation vs. <span style={{ color: blue }}>Introversion</span>
        </div>
        <div className="right-heading">
          Feelings of Isolation vs. <span style={{ color: orange }}>Extraversion</span>
        </div>
      </div>
      <div className="left-vis-container">
          {/*will fix this later*/}
          <div className="label">
              <div dangerouslySetInnerHTML={{ __html: avgLineLabel }} />
          </div>
          <div className="annotations">
              <div className="low-introverted" dangerouslySetInnerHTML={{ __html: lowIntrovert }} />
              <div className="high-introverted" dangerouslySetInnerHTML={{ __html: highIntrovert }} />
          </div>
        <div id="introverted-vis-personality" ref={left_svg} />
        <div className="personality-yLabel">Percentage of responses that were isolated</div>
      </div>
      <div className="right-vis-container">
          <div className="label">
              <div dangerouslySetInnerHTML={{ __html: avgLineLabel }} />
          </div>
          <div className="annotations">
              <div className="low-extraverted" dangerouslySetInnerHTML={{ __html: lowExtravert }} />
              <div className="high-extraverted" dangerouslySetInnerHTML={{ __html: highExtravert }} />
          </div>
        <div id="extraverted-vis-personality" ref={right_svg} />
      </div>

      <div id="scatter-tooltip"/>
    </div>
  );
};

export default ScatterPersonalityPage;

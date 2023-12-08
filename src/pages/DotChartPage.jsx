import React, { useEffect, useRef, useState } from "react";
import { DotChart } from "../classes/dotchart";
import "./DotChartPage.css";

const yellow = "var(--pointThird)";

const DotChartPage = ({ data2 }) => {
  const svg = useRef(null);
  const [chart, setChart] = useState(null);
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
      if (!chart && svg.current) {
        const chart = new DotChart(svg.current, data2);
        setChart(chart);

        chart.updateVis(containerWidth, containerHeight);
      } else if (chart) {
        chart.updateVis(containerWidth, containerHeight);
      }
    }
  }, [data2, chart, containerWidth, containerHeight]);

  return (
    <div className="dotChartPage">
      <div className="heading">
        In the current COVID pandemic (2020), how much do you agree that you feel <span style={{ color: yellow }}>distressed
        over loneliness</span>?
      </div>
      <div id="vis-dot" ref={svg} />
    </div>
  );
};

export default DotChartPage;

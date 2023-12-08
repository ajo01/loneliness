import React, { useEffect, useRef, useState } from "react";
import { Scatterplot } from "../classes/scatterplot";
import "./ScatterPlotPage.css";
import { avgLineLabel } from "../assets/svg";

const orange = "var(--pointSecond)";
const yellow = "var(--pointThird)";
const blue = "var(--pointFourth)";

const ScatterPlotPage = ({ data2 }) => {
  const svg = useRef(null);
  const [chart, setChart] = useState(null);
  const [selectedAttribute, setSelectedAttribute] = useState("inside");
  const [color, setColor] = useState({ color: yellow });
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
        const chart = new Scatterplot(svg.current, data2);
        setChart(chart);

        chart.updateVis(selectedAttribute, containerWidth, containerHeight);
      } else if (chart) {
        chart.updateVis(selectedAttribute, containerWidth, containerHeight);
      }
      if (selectedAttribute === "trust") {
        setColor({ color: blue });
      } else if (selectedAttribute === "inside") {
        setColor({ color: yellow });
      } else {
        setColor({ color: orange });
      }
    }
  }, [data2, chart, selectedAttribute, containerWidth, containerHeight]);

  const handleSelectChange = (e) => {
    setSelectedAttribute(e.target.value);
    e.target.blur();
  };

  return (
    <div className="scatterplotPage">
      <div className="heading">
        Feelings of Isolation vs.
        <select
          className="attributeSelect"
          onChange={handleSelectChange}
          style={color}
        >
          <option value="inside">Time Spent Indoors</option>
          <option value="stress">Feeling Stressed or Nervous</option>
          <option value="trust">Being Trusting of Others</option>
        </select>
      </div>
      <div className="full-scatter-averageLinelabel">
        <div dangerouslySetInnerHTML={{ __html: avgLineLabel }} />
      </div>
      <div className="yLabel">
        Percentage of responses that were feeling isolated
      </div>
      <div id="vis-scatter" ref={svg} />

      <div id="full-scatter-tooltip" />
    </div>
  );
};

export default ScatterPlotPage;

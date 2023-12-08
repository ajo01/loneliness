import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Sankey } from "../classes/sankey";
import "./SankeyDiagramPage.css";

const SankeyDiagramPage = ({ data2 }) => {
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
      const extractCovidDistress = (data2) => {
        return (
          data2
            // We have a weird boogey data -> "1"
            .filter((d) => d.covid.length > 1)
            .map((d) => {
              return {
                covid: d.covid,
                distress: d.distress,
              };
            })
        );
      };

      const filteredData = extractCovidDistress(data2);
      const attributeOrder = {
        "Does not apply to my current situation": 0,
        "Strongly disagree": 1,
        "Disagree": 2,
        "Slightly disagree": 3,
        "Slightly agree": 4,
        "Agree": 5,
        "Strongly agree": 6,
        "Life carries on as usual": 7,
        "Life carries on with minor changes": 8,
        "Isolated": 9,
        "Isolated in medical facility of similar location": 10,
      };

      // Sort by distress
      filteredData.sort((a, b) => {
        const keyA = a.distress;
        const keyB = b.distress;

        if (
          attributeOrder.hasOwnProperty(keyA) &&
          attributeOrder.hasOwnProperty(keyB)
        ) {
          return attributeOrder[keyA] - attributeOrder[keyB];
        } else {
          console.error(`Invalid distress values: ${keyA} or ${keyB}`);
          return 0;
        }
      });

      // Preprocessing data into nodes and links to be sent to d3's sankey function
      const uniqueCovidAttributes = [
        ...new Set(filteredData.map((d) => d.covid)),
      ];
      uniqueCovidAttributes.sort((a, b) => {
        return attributeOrder[a] - attributeOrder[b];
      });
      const uniqueDistressAttributes = [
        ...new Set(filteredData.map((d) => d.distress)),
      ];
      const uniqueNodes = [
        ...new Set([...uniqueCovidAttributes, ...uniqueDistressAttributes]),
      ];
      const uniqueCombinations = [];
      const nodes = d3.map(uniqueNodes, (d) => ({ id: d }));
      const links = [];

      // Get all unique combinations of {covid, distress}
      filteredData.forEach((d) => {
        const combination = {
          covid: d.covid,
          distress: d.distress,
        };

        const isInUniqueCombinations = uniqueCombinations.some(
          (existingCombination) =>
            existingCombination.covid === combination.covid &&
            existingCombination.distress === combination.distress
        );

        if (isInUniqueCombinations === false) {
          uniqueCombinations.push(combination);
        }
      });

      uniqueCombinations.forEach((combo) => {
        const value = filteredData.filter(
          (d) => d.distress === combo.distress && d.covid === combo.covid
        ).length;

        links.push({
          source: combo.distress,
          target: combo.covid,
          value: value,
        });
      });

      if (!chart && svg.current) {
        const chart = new Sankey(
          svg.current,
          filteredData,
          nodes,
          links,
          uniqueCovidAttributes,
          uniqueDistressAttributes,
          attributeOrder
        );
        setChart(chart);

        chart.updateVis(containerWidth, containerHeight);
      } else if (chart) {
        chart.updateVis(containerWidth, containerHeight);
      }
    }
  }, [data2, chart, containerWidth, containerHeight]);

  return (
    <div className="sankeyDiagramPage">
      <div className="heading">
        Loneliness vs. Covid Isolation
      </div>
      <div id="vis-sankey" ref={svg} />
      <div id="sankey-tooltip"></div>
    </div>
  );
};

export default SankeyDiagramPage;

import React, { useEffect, useState } from "react";
import { Barchart } from "../classes/barchart";
import { StackedBarchart } from "../classes/stackedbarchart";
import "./BidirectionalPage.css";

let barchart,
  genderchart,
  educationchart,
  urbanizationchart,
  immigrationchart,
  workchart;
let bardata,
  genderdata,
  educationdata,
  urbanizationdata,
  immigrationdata,
  workdata;
let initialBarData;
let lonelinessSelectionGlobal;
let sociologicalSelectionGlobal;

// filters all data for loneliness (and assigns it appropriately per stacked chart) and then updates the data
export function filterLoneliness() {
  lonelinessSelectionGlobal = barchart.lonelinessSelection;

  genderchart.data = genderdata.filter((d) =>
    lonelinessSelectionGlobal.includes(d.loneliness)
  );
  educationchart.data = educationdata.filter((d) =>
    lonelinessSelectionGlobal.includes(d.loneliness)
  );
  urbanizationchart.data = urbanizationdata.filter((d) =>
    lonelinessSelectionGlobal.includes(d.loneliness)
  );
  immigrationchart.data = immigrationdata.filter((d) =>
    lonelinessSelectionGlobal.includes(d.loneliness)
  );
  workchart.data = workdata.filter((d) =>
    lonelinessSelectionGlobal.includes(d.loneliness)
  );

  genderchart.updateVis();
  educationchart.updateVis();
  urbanizationchart.updateVis();
  immigrationchart.updateVis();
  workchart.updateVis();

  barchart.updateVis();
}

// Function for filtering data for all the sociological categories, updates the data for each chart
export function filterSociological(selection) {
  sociologicalSelectionGlobal = selection;

  genderchart.sociologicalFactorSelection = sociologicalSelectionGlobal;
  educationchart.sociologicalFactorSelection = sociologicalSelectionGlobal;
  urbanizationchart.sociologicalFactorSelection = sociologicalSelectionGlobal;
  immigrationchart.sociologicalFactorSelection = sociologicalSelectionGlobal;
  workchart.sociologicalFactorSelection = sociologicalSelectionGlobal;

  if (
    sociologicalSelectionGlobal.includes("Women") ||
    sociologicalSelectionGlobal.includes("Men")
  ) {
    // Because the gender data structure is a little strange, and inaccurate, we chose an arbritrary category here
    const immigrantdata = bardata.filter(
      (d) => d.value === "Immigrants" || d.value === "Non-immigrants"
    );
    barchart.data = immigrantdata.filter((d) => {
      return sociologicalSelectionGlobal.includes(d.gender);
    });
  } else if (sociologicalSelectionGlobal.length === 0) {
    barchart.data = initialBarData;
  } else {
    barchart.data = bardata.filter((d) =>
      sociologicalSelectionGlobal.includes(d.value)
    );
  }
  barchart.updateVis();

  genderchart.updateVis();
  educationchart.updateVis();
  urbanizationchart.updateVis();
  immigrationchart.updateVis();
  workchart.updateVis();
}

const BidirectionalPage = ({ data1 }) => {
  const [lonelinessSelection, setLonelinessSelection] = useState([
    "Always or often feels lonely",
    "Sometimes feels lonely",
    "Rarely or never feels lonely",
  ]);
  const [sociologicalFactorSelection, setSociologicalFactorSelection] =
    useState([]);

  // useEffect is a hook that allows you to perform effects on components
  // :: for example :: you can fetch data, directly update the DOM, and set timers
  // :: more on this here :: https://www.w3schools.com/react/react_useeffect.asp

  useEffect(() => {
    if (data1) {
      bardata = data1;
      initialBarData = data1.filter((d) => d.gender === "All");

      barchart = new Barchart(
        { parentElement: "#barchart" },
        initialBarData,
        lonelinessSelection,
        setLonelinessSelection
      );
      barchart.updateVis();

      let dataOnlyMenAndWomen = data1.filter((d) => d.gender !== "All");

      // set height for stacked charts
      const chartHeight = 520;

      genderdata = filterObjectsForStack(dataOnlyMenAndWomen, "gender");
      educationdata = filterObjectsForStack(dataOnlyMenAndWomen, "education");
      urbanizationdata = filterObjectsForStack(
        dataOnlyMenAndWomen,
        "urbanization"
      );
      immigrationdata = filterObjectsForStack(
        dataOnlyMenAndWomen,
        "immigration"
      );
      workdata = filterObjectsForStack(dataOnlyMenAndWomen, "work");

      genderchart = new StackedBarchart(
        {
          parentElement: "#gender",
          containerHeight: (2 / 7) * chartHeight,
        },
        genderdata,
        sociologicalFactorSelection,
        setSociologicalFactorSelection
      );
      genderchart.updateVis();

      educationchart = new StackedBarchart(
        {
          parentElement: "#education",
          containerHeight: (3.2 / 7) * chartHeight,
        },
        educationdata,
        sociologicalFactorSelection,
        setSociologicalFactorSelection
      );
      educationchart.updateVis();

      urbanizationchart = new StackedBarchart(
        {
          parentElement: "#urbanization",
          containerHeight: (2 / 7) * chartHeight,
        },
        urbanizationdata,
        sociologicalFactorSelection,
        setSociologicalFactorSelection
      );
      urbanizationchart.updateVis();

      immigrationchart = new StackedBarchart(
        {
          parentElement: "#immigration",
          containerHeight: (2 / 7) * chartHeight,
        },
        immigrationdata,
        sociologicalFactorSelection,
        setSociologicalFactorSelection
      );
      immigrationchart.updateVis();

      workchart = new StackedBarchart(
        {
          parentElement: "#work",
          containerHeight: (2.4 / 7) * chartHeight,
        },
        workdata,
        sociologicalFactorSelection,
        setSociologicalFactorSelection
      );
      workchart.updateVis();

      lonelinessSelectionGlobal = lonelinessSelection;
    }
  }, [data1]);

  // filters data for just gender
  function filterObjectsForStack(data1, graphCategory) {
    // FILTER ALL DATA: should not have "all" gender
    let filteredData = data1;

    // STEP #1: if the graph category isn't age, then filter so that only that category remains
    if (graphCategory !== "gender") {
      filteredData = filteredData.filter((d) => {
        return graphCategory === d.category;
      });
    }

    // STEP #2: make a new list of objects for the stackedbarchart
    const newObjectData = filteredData.map((d) => {
      let newObject;
      // gender special case
      if (graphCategory === "gender") {
        newObject = {
          graphCategory: "gender",
          value: d.gender,
          loneliness: d.loneliness,
          amount: d.amount,
        };
      } else if (graphCategory === d.category) {
        newObject = {
          graphCategory: d.category,
          value: d.value,
          loneliness: d.loneliness,
          amount: d.amount,
        };
      }
      return newObject;
    });
    return newObjectData;
  }

  return (
    <div className="bidirectionalPage">
      <svg id="barchart"></svg>

      <div className="container-centered">
        <div className="container">
          <div className="container left-side">
            <svg id="gender"></svg>
            <svg id="education"></svg>
          </div>

          <div className="container right-side">
            <svg id="urbanization"></svg>
            <svg id="immigration"></svg>
            <svg id="work"></svg>
          </div>
        </div>
      </div>

      <div id="tooltip"></div>
    </div>
  );
};

export default BidirectionalPage;

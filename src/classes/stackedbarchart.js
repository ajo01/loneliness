import * as d3 from "d3";
import { filterSociological } from "../pages/BidirectionalPage";
import { tooltip } from "../assets/svg";

export class StackedBarchart {
  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(
    _config,
    _data,
    _sociologicalFactorSelection,
    setSociologicalFactorSelection
  ) {
    // Configuration object with defaults
    this.config = {
      parentElement: _config.parentElement,
      colorScale: _config.colorScale,
      containerWidth: _config.containerWidth || 600,
      containerHeight: _config.containerHeight || 500,
      margin: _config.margin || {
        top: 60,
        right: 50,
        bottom: 30,
        left: 100,
      },
      tooltipPadding: _config.tooltipPadding || 15,
    };
    this.sociologicalFactorSelection = _sociologicalFactorSelection;
    this.setSociologicalFactorSelection = setSociologicalFactorSelection;

    this.data = _data;
    this.initVis();
  }

  /**
   * Initialize scales/axes and append static elements, such as axis titles
   */
  initVis() {
    let vis = this;

    // Calculate inner chart size. Margin specifies the space around the actual chart.
    vis.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;
    vis.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;

    // Initialize scales and axes

    // Initialize scales
    vis.colorScale = d3
      .scaleOrdinal()
      .range(["#409AF0", "#D4E8FE", "#FFC200"])
      .domain([
        "Always or often feels lonely",
        "Sometimes feels lonely",
        "Rarely or never feels lonely",
      ]);

    // Important: we flip array elements in the y output range to position the rectangles correctly
    vis.xScale = d3.scaleLinear().range([0, vis.width]);

    vis.widthScale = d3.scaleLinear().domain([0, 1]).range([0, vis.width]);

    vis.yScale = d3.scaleBand().range([vis.height, 0]).padding(0.2);

    vis.xAxis = d3
      .axisTop(vis.xScale)
      .tickSize(-vis.height)
      .tickSizeOuter(0)
      .tickPadding(10)
      .tickFormat((d) => d + "%");

    var mapText = {
      Men: "Male",
      Women: "Female",

      "Bachelor's degree or higher": "University",
      "College, CEGEP or other non-university certificate or diploma":
        "College",
      "Apprenticeship or trades certificate or diploma": "Trades",
      "Secondary (high) school diploma or equivalency certificate":
        "High school",
      "No certificate, diploma or degree": "No certificate",

      "Rural areas": "Rural",
      "Urban areas": "Urban",

      Immigrants: "Immigrants",
      "Non-immigrants": "Non-immigrants",

      "Other activity": "Other activity",
      Retired: "Retired",
      "Working at a paid job or business": "Working",
    };

    vis.yAxis = d3
      .axisLeft(vis.yScale)
      .tickSize(0)
      .tickSizeOuter(0)
      .tickPadding(10)
      .tickFormat(
        // adding ... to labels that are too long
        (d, i) => {
          return mapText[d];
        }
      );

    // Define size of SVG drawing area
    vis.svg = d3
      .select(vis.config.parentElement)
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight);

    // SVG Group containing the actual chart; D3 margin convention
    vis.chart = vis.svg
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.margin.left},${vis.config.margin.top})`
      );

    // Append empty x-axis group and move it to the bottom of the chart
    vis.xAxisG = vis.chart.append("g").attr("class", "axis x-axis");

    // Append y-axis group
    vis.yAxisG = vis.chart.append("g").attr("class", "axis y-axis");

    // wrap function for titles that are too long
    vis.yAxisG.selectAll(".tick > text").attr("fill", "#fff");

    // Append category title
    vis.svg
      .append("text")
      .attr("class", "axis-title")
      .attr("x", 100)
      .attr("y", 10)
      .attr("fill", "white")
      .attr("dy", ".71em")
      .attr("text-anchor", "end")
      .text((d) => {
        const str = vis.data[0].graphCategory;
        let result = str.charAt(0).toUpperCase() + str.slice(1);
        return result;
      });

    if (vis.data[0].graphCategory === "gender") {
      vis.svg
        .append("svg")
        .attr("class", "tooltip-icon")
        .attr("x", 110)
        .attr("y", 5)
        .attr("fill", "white")
        .attr("dy", ".71em")
        .attr("text-anchor", "end")
        .attr("opacity", 1)
        .html(tooltip)
        .on("mouseover", function (event, d) {
          d3
            .select("#tooltip")
            .style("display", "block")
            .style("left", event.pageX + vis.config.tooltipPadding + "px")
            // Following code is for adding the tooltip, depending on the data, different tooltips are displayed
            .style("top", event.pageY + vis.config.tooltipPadding + "px").html(`
                  <div class="tooltip-heading"> more info on gender data</div>
                  <div class="tooltip-title"> 🚨 Gender data is not entirely accurate (due to dataset limitations)</div>
                  <div class="tooltip-title"> 🌈 For more detailed data please see StatCan (linked below)</div>
                  `);
        })
        .on("mouseleave", () => {
          d3.select("#tooltip").style("display", "none");
        });
    }
  }

  /**
   * Prepare data and scales before we render it
   */
  updateVis() {
    let vis = this;

    const valueKeys = [
      "Always or often feels lonely",
      "Sometimes feels lonely",
      "Rarely or never feels lonely",
    ];

    // find the totals per key
    const aggregatedDataMap = d3.rollups(
      vis.data,
      (v) => d3.sum(v, (f) => f.amount),
      (d) => d.value,
      (d) => d.loneliness
    );

    // list the total per loneliness category in each key
    const aggregatedTotalMap = d3.rollups(
      vis.data,
      (v) => d3.sum(v, (f) => f.amount),
      (d) => d.value
    );

    // aggregates loneliness levels
    vis.aggregatedData = Array.from(aggregatedDataMap, ([key, loneliness]) => ({
      key: key,
      ...Object.fromEntries(loneliness), // maps each of cities.keys() to each of cities.values()
    }));

    // list the percentages per loneliness category in each key
    vis.percentages = vis.aggregatedData.map(function (d, i) {
      const newObject = {};
      newObject["value"] = d.key;
      newObject["Always or often feels lonely"] =
        (d["Always or often feels lonely"] / aggregatedTotalMap[i][1]) * 100;
      newObject["Sometimes feels lonely"] =
        (d["Sometimes feels lonely"] / aggregatedTotalMap[i][1]) * 100;
      newObject["Rarely or never feels lonely"] =
        (d["Rarely or never feels lonely"] / aggregatedTotalMap[i][1]) * 100;

      return newObject;
    });

    // create stacked data to use for rectangles
    vis.stackedGen = d3.stack().keys(valueKeys);

    // Specificy accessor functions
    vis.colorValue = (d) => d.key;
    vis.xValue = (d) => d.data.value;

    vis.yValue = (d) => d.key;

    // Set the scale input domains
    vis.xScale.domain([0, 100]);
    vis.yScale.domain(
      vis.data.map(function (d) {
        return d.value;
      })
    );

    vis.renderVis();
  }

  /**
   * Bind data to visual elements
   */
  renderVis() {
    let vis = this;

    const barGroup = vis.chart
      .selectAll(".bar-group")
      .data(vis.stackedGen(vis.percentages), (d) => d.key)
      .join("g")
      .attr("class", "bar-group")
      .attr("fill", (d) => vis.colorScale(vis.colorValue(d)))
      .attr("radius", 10);

    // Add rectangles
    barGroup
      .selectAll(".bar")
      .data((d) => d)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d) => vis.xScale(d[0]))
      .attr("width", (d) => {
        // Check if the stacked data has removed this rectangle, and if so, return a width of 0 in updated chart so it doesn't display
        if (isNaN(d[1])) {
          return 0;
        } else {
          const newWidth = vis.xScale(d[1]) - vis.xScale(d[0]);
          return newWidth;
        }
      })
      .attr("stroke", "#fff")
      .attr("stroke-width", 3)
      .attr("stroke-opacity", (d) => {
        let isActive = vis.sociologicalFactorSelection.includes(d.data.value);

        if (isActive) {
          return "100%";
        } else {
          return "0%";
        }
      })
      .attr("height", vis.yScale.bandwidth())
      .attr("y", (d) => {
        return vis.yScale(d.data.value);
      });

    const invisiBars = vis.chart
      .selectAll(".invisiBar")
      .data(vis.percentages, (d) => d.value)
      .join("rect")
      .attr("class", "invisi-bar")
      .attr("fill-opacity", 0)
      .attr("width", vis.width)
      .attr("height", vis.yScale.bandwidth())
      .attr("y", (d) => vis.yScale(d.value));

    invisiBars
      .on("mouseover", function (event, d) {
        if (isNaN(d["Rarely or never feels lonely"])) {
          d3
            .select("#tooltip")
            .style("display", "block")
            .style("left", event.pageX + vis.config.tooltipPadding + "px")
            // Following code is for adding the tooltip, depending on the data, different tooltips are displayed
            .style("top", event.pageY + vis.config.tooltipPadding + "px").html(`
                <div class="tooltip-heading"> category </div>
                <div class="tooltip-title"> 👋 ${d.value}</div>
                <div class="tooltip-spacer"></div>
                <div class="tooltip-heading"> are feeling... </div>
                
                <div class="tooltip-title" > 🤍 ${d[
                  "Sometimes feels lonely"
                ].toFixed(1)}% Sometimes lonely </div>
                <div class="tooltip-title" > 💙 ${d[
                  "Always or often feels lonely"
                ].toFixed(1)}% Always or often lonely </div>

                `);
        } else if (isNaN(d["Sometimes feels lonely"])) {
          d3
            .select("#tooltip")
            .style("display", "block")
            .style("left", event.pageX + vis.config.tooltipPadding + "px")
            .style("top", event.pageY + vis.config.tooltipPadding + "px").html(`
                <div class="tooltip-heading"> category </div>
                <div class="tooltip-title"> 👋 ${d.value}</div>
                <div class="tooltip-spacer"></div>
                <div class="tooltip-heading"> are feeling... </div>
                
                <div class="tooltip-title" > 💛 ${d[
                  "Rarely or never feels lonely"
                ].toFixed(1)}% Rarely or never lonely </div>
                <div class="tooltip-title" > 💙 ${d[
                  "Always or often feels lonely"
                ].toFixed(1)}% Always or often lonely </div>

                `);
        } else if (isNaN(d["Always or often feels lonely"])) {
          d3
            .select("#tooltip")
            .style("display", "block")
            .style("left", event.pageX + vis.config.tooltipPadding + "px")
            .style("top", event.pageY + vis.config.tooltipPadding + "px").html(`
                <div class="tooltip-heading"> category </div>
                <div class="tooltip-title"> 👋 ${d.value}</div>
                <div class="tooltip-spacer"></div>
                <div class="tooltip-heading"> are feeling... </div>
                
                <div class="tooltip-title" > 💛 ${d[
                  "Rarely or never feels lonely"
                ].toFixed(1)}% Rarely or never lonely </div>
                <div class="tooltip-title" > 🤍 ${d[
                  "Sometimes feels lonely"
                ].toFixed(1)}% Sometimes lonely </div>
               
                `);
        } else {
          d3
            .select("#tooltip")
            .style("display", "block")
            .style("left", event.pageX + vis.config.tooltipPadding + "px")
            .style("top", event.pageY + vis.config.tooltipPadding + "px").html(`
                <div class="tooltip-heading"> category </div>
                <div class="tooltip-title"> 👋 ${d.value}</div>
                <div class="tooltip-spacer"></div>
                <div class="tooltip-heading"> are feeling... </div>
                
                <div class="tooltip-title" > 💛 ${d[
                  "Rarely or never feels lonely"
                ].toFixed(1)}% Rarely or never lonely </div>
                <div class="tooltip-title" > 🤍 ${d[
                  "Sometimes feels lonely"
                ].toFixed(1)}% Sometimes lonely </div>
                <div class="tooltip-title" > 💙 ${d[
                  "Always or often feels lonely"
                ].toFixed(1)}% Always or often lonely </div>

                `);
        }
      })

      .on("mouseleave", () => {
        d3.select("#tooltip").style("display", "none");
      })

      .on("click", function (event, d) {
        const isActive = vis.sociologicalFactorSelection.includes(d.value);
        if (isActive) {
          vis.sociologicalFactorSelection = [];
        } else {
          vis.sociologicalFactorSelection = [];
          vis.sociologicalFactorSelection.push(d.value);
        }
        vis.setSociologicalFactorSelection(vis.sociologicalFactorSelection);
        filterSociological(vis.sociologicalFactorSelection);
        d3.select(this).classed("active", !isActive);
      });

    // Update axes
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);
  }
}

import * as d3 from "d3";
import { filterLoneliness } from "../pages/BidirectionalPage";
import {
  happyEmoji,
  avgEmoji,
  lonelyEmoji
} from "../assets/svg";

// adding in template code to edit for the barchart
export class Barchart {
  /**
   * Class constructor with basic chart configuration
   * @param {Object}
   * @param {Array}
   */
  constructor(
    _config,
    _data,
    _lonelinessSelection,
    setLonelinessSelection,
    _sociologicalFactorSelection,
    filterLoneliness
  ) {
    // Configuration object with defaults
    this.config = {
      parentElement: _config.parentElement,
      colorScale: _config.colorScale,
      containerWidth: _config.containerWidth || 1150,
      containerHeight: _config.containerHeight || 180,
      margin: _config.margin || {
        top: 50,
        right: 20,
        bottom: 20,
        left: 60,
      },
      tooltipPadding: _config.tooltipPadding || 15,
    };
    // **
    this.lonelinessSelection = _lonelinessSelection;
    this.sociologicalFactorSelection = _sociologicalFactorSelection;
    this.setSelection = setLonelinessSelection;
    this.filterLoneliness = filterLoneliness;

    // **
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
      // TODO: Update the domain here to fit what the dataset1 provides, and vice versa
      .domain([
        "Always or often feels lonely",
        "Sometimes feels lonely",
        "Rarely or never feels lonely",
      ]);

    // Important: we flip array elements in the y output range to position the rectangles correctly
    vis.xScale = d3
      .scaleBand()
      .range([vis.width / 4 - 15, (3 * vis.width) / 4 - 15])
      .paddingInner(0.2);

    vis.yScale = d3.scaleLinear().range([vis.height, 0]);

    vis.xAxis = d3
      .axisBottom(vis.xScale)
      .tickSize(0)
      .tickPadding(10)
      .ticks([
        "Always or often feels lonely",
        "Sometimes feels lonely",
        "Rarely or never feels lonely",
      ])
      .tickSizeOuter(0);

    vis.yAxis = d3
      .axisLeft(vis.yScale)
      .tickSize(-vis.width)
      .tickPadding(10)
      .tickSizeOuter(0);

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
    vis.xAxisG = vis.chart
      .append("g")
      .attr("class", "axis x-axis")
      .attr("transform", `translate(0,${vis.height})`);

    // Append y-axis group
    vis.yAxisG = vis.chart.append("g").attr("class", "axis y-axis");

    // Append axis title
    vis.svg
      .append("text")
      .attr("class", "axis-title")
      .attr("x", 0)
      .attr("y", 0)
      .attr("fill", "white")
      .attr("dy", ".71em")
      .text("Loneliness Categories");
  }

  /**
   * Prepare data and scales before we render it
   */
  updateVis() {
    let vis = this;

    // Prepare data: count number of trails in each difficulty category
    // i.e. [{ key: 'easy', count: 10 }, {key: 'intermediate', ...

    // Very Lonely == Always or often feels lonely
    // Sometimes Lonely == Sometimes feels lonely
    // Not Lonely == Rarely or never feels lonely

    // aggregate the data to loneliness levels
    const aggregatedDataMap = d3.rollups(
      vis.data,
      (v) => d3.sum(v, (f) => f.amount),
      (d) => d.loneliness
    );
    vis.aggregatedData = Array.from(aggregatedDataMap, ([key, count]) => ({
      key,
      count,
    }));

    vis.orderedKeys = [
      "Always or often feels lonely",
      "Sometimes feels lonely",
      "Rarely or never feels lonely",
    ];
    vis.aggregatedData = vis.aggregatedData.sort((a, b) => {
      return vis.orderedKeys.indexOf(a.key) - vis.orderedKeys.indexOf(b.key);
    });

    // Specificy accessor functions
    vis.colorValue = (d) => d.key;
    vis.xValue = (d) => d.key;

    // the d.count here should be obtained from aggregating the data
    vis.yValue = (d) => d.count;

    // Set the scale input domains
    vis.xScale.domain(vis.aggregatedData.map(vis.xValue));
    vis.yScale.domain([0, d3.max(vis.aggregatedData, vis.yValue)]);

    vis.renderVis();
  }

  /**
   * Bind data to visual elements
   */
  renderVis() {
    let vis = this;

    const barGroup = vis.chart
      .selectAll(".bar-group")
      .data(vis.aggregatedData, vis.xValue)
      .join("g")
      .attr("class", "bar-group")
      .on("click", function (event, d) {
        const isActive = vis.lonelinessSelection.includes(d.key);
      
        if (isActive ) {
          vis.lonelinessSelection = vis.orderedKeys.filter(
            (f) => f !== d.key
          ); // remove the item that used to be selected
          d3.select(this).classed(
            "inactive",
            d3.select(this).classed("inactive")
          );
        } else if (!isActive ) {
          vis.lonelinessSelection = vis.orderedKeys;
          d3.select(this).classed(
            "inactive",
            d3.select(this).classed("inactive")
          );
          d3.select('.point').classed("inactive");
        }
        vis.setSelection(vis.lonelinessSelection);
        filterLoneliness();
        
      })
      .on("mouseover", function (event, d) {
        let tooltipLoneliness;
        let tooltipColor;
        if (d.key === "Rarely or never feels lonely") {
          tooltipLoneliness = "💛 Rarely or never lonely";
          tooltipColor = "orange";
        } else if (d.key === "Always or often feels lonely") {
          tooltipLoneliness = "💙 Always or often lonely";
          tooltipColor = "dark-blue";
        } else {
          tooltipLoneliness = "🤍 Sometimes lonely";
          tooltipColor = "blue";
        }
        d3
          .select("#tooltip")
          .style("display", "block")
          .style("left", event.pageX + vis.config.tooltipPadding + "px")
          .style("top", event.pageY + vis.config.tooltipPadding + "px").html(`
              <div class="tooltip-heading"> number of people </div>
              <div class="tooltip-title"> 👋 ${d.count} people</div>
              <div class="tooltip-spacer"></div>
              <div class="tooltip-heading"> are feeling... </div>
              
              <div class="tooltip-title dynamic-color"> ${tooltipLoneliness}</div>
            `);
      })
      .on("mouseleave", () => {
        d3.select("#tooltip").style("display", "none");
      })

    // Add rectangles
    const bars = barGroup
      .selectAll(".bar")
      .data(d=>[d], vis.xValue)
      .join("rect")
      .attr("class", "bar")
      .attr("fill", (d) => {
        if (!vis.lonelinessSelection.includes(d.key)) {
          return "#404040";
        } else {
          return vis.colorScale(vis.colorValue(d));
        }
      })
      .classed("inactive", (d) => !vis.lonelinessSelection.includes(d.key))
      .attr("x", (d) => vis.xScale(vis.xValue(d)))
      .attr("width", d=> {
        return vis.xScale.bandwidth();
      })
      .attr("height", (d) => vis.height - vis.yScale(vis.yValue(d)))
      .attr("y", (d) => vis.yScale(vis.yValue(d)))
      .attr("rx", 5);
     
      

    // Adding emojis to the barchart
   
    const circles = barGroup
      .selectAll(".circle-point")
      .data(d=>[d], vis.xValue)
      .join("circle")
      .attr("class", "circle-point")
      .classed("inactive", (d) => !vis.lonelinessSelection.includes(d.key))
      .attr("cx", (d) => vis.xScale(vis.xValue(d))+vis.xScale.bandwidth()/2)
      .attr("cy", (d) => vis.yScale(vis.yValue(d))-30)
      .attr("r", 20)
      .attr("fill", (d) => {
        if (!vis.lonelinessSelection.includes(d.key)) {
          return "#404040";
        } else{
          return vis.colorScale(vis.colorValue(d));
        }
        
      });
    
    const emojis = barGroup
      .selectAll(".point")
      .data(d=>[d], vis.xValue)
      .join("svg")
      .attr("class", "point")
      .attr("opacity", (d) => {
        if (!vis.lonelinessSelection.includes(d.key)) {
          return 0.5;
        } else{
          return 1;
        }})
      .attr("x", (d) => vis.xScale(vis.xValue(d))+vis.xScale.bandwidth()/2 -21)
      .attr("y", (d) => vis.yScale(vis.yValue(d))-50)
      .html((d) => {
        console.log(d);
        if (d.key === "Rarely or never feels lonely") { return happyEmoji;}
        if (d.key === "Sometimes feels lonely") {return avgEmoji;}
        if (d.key === "Always or often feels lonely") {return lonelyEmoji;}
      });
    


    // Update axes
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);
  }
}

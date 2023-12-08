import * as d3 from "d3";
import {
  happyEmoji,
  avgEmoji,
  lonelyEmoji,
  axisHappy,
  axisLonely,
} from "../assets/svg";

export class Scatterplot {
  //  class constructor with initial configuration
  constructor(_config, _data, relativeWidth = 1, align = "full") {
    this.config = {
      parentElement: _config.parentElement,
      relativeWidth: relativeWidth,
      align: align,
      tooltipPadding: 15,
      tooltipId: align === "full"? '#full-scatter-tooltip' : '#scatter-tooltip',
      margin: _config.margin || {
        top: 60,
        right: 300,
        bottom: 250,
        left: 300,
      },
    };
    this.attribute = "extravert";
    this.data = _data;
    this.emojiOffset = relativeWidth === 1? 21.25 : 13;
    this.initVis();
  }

  // initialize static chart elements such as axis titles
  initVis() {
    let vis = this;

    // define svg drawing area
    vis.svg = d3.select(vis.config.parentElement).append("svg");

    vis.calculateInitMargins(vis.config.align);

    // position chart according to margin config
    vis.chart = vis.svg
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.margin.left},${vis.config.margin.top})`,
      );

    vis.createScales();
    vis.createAxis();

    vis.setAxisAndChartTitle();
  }

  // prepare data before rendering
  updateVis(attribute, containerWidth, containerHeight) {
    let vis = this;
    vis.attribute = attribute || vis.attribute;
    containerWidth = containerWidth*vis.config.relativeWidth;

    vis.setDimensions(containerWidth, containerHeight);

    // x and y accessors
    vis.xValue = (d) => d[vis.attribute];
    vis.yValue = (d) => d.isolation;

    vis.trustDomain = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    vis.stressDomain = [
      "Very stressed",
      "Fairly stressed",
      "Sometimes stressed",
      "Almost never stressed",
      "Never stressed",
    ];
    vis.insideDomain = [
      "Never indoors",
      "Seldom indoors",
      "Sometimes indoors",
      "Frequently indoors",
      "Mostly indoors",
      "Always indoors",
    ];
    vis.personalityDomain = [
      "Strongly disagree",
      "Disagree",
      "Slightly disagree",
      "Slightly agree",
      "Agree",
      "Strongly agree",
    ]

    vis.xScale.range([0, vis.width]);
    vis.yScale.range([0, vis.height]);

    vis.xAxis.tickSize(-vis.height);
    vis.yAxis.tickSize(-vis.width);

    vis.svg
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight);

    vis.isLonely = (d) =>
      d.isolation === "Very often" ||
      d.isolation === "Fairly often" ||
      d.isolation === "Sometimes";

    if (vis.attribute === "trust") {
      vis.xScale.domain(vis.trustDomain);
    } else if (vis.attribute === "stress") {
      vis.xScale.domain(vis.stressDomain);
    } else if (vis.attribute === "inside") {
      vis.xScale.domain(vis.insideDomain);
    } else {
      vis.xScale.domain(vis.personalityDomain);
    }

    let numPeopleLonely = 0;
    // calculate avg
    vis.data.forEach((d) => {
      if (
        d.isolation === "Very often" ||
        d.isolation === "Often" ||
        d.isolation === "Fairly often" ||
        d.isolation === "Sometimes"
      ) {
        numPeopleLonely++;
      }
    });

    vis.avgPercentageLonely = numPeopleLonely / vis.data.length;

    // for attribute extravert or introvert
    vis.calculateLonelyPercentages(vis.attribute);

    vis.emojiScale = d3.scaleThreshold(
      [51, 71],
      ["happyEmoji", "avgEmoji", "lonelyEmoji"],
    );

    if (vis.attribute === "trust") {
      vis.createTrustLabels();
    } else {
      vis.removeTrustLabels();
    }

    // render chart
    vis.renderVis();
  }

  // bind data to visual elements
  renderVis() {
    let vis = this;

    vis.chart
      .append("linearGradient")
      .attr("id", "line-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", vis.width)
      .attr("y1", vis.height)
      .attr("x2", 0)
      .attr("y2", 0)
      .selectAll("stop")
      .data([
        { offset: "15%", color: "var(--linearGradientFirst)" },
        { offset: "45%", color: "var(--linearGradientSecond)" },
        { offset: "80%", color: "var(--linearGradientThird)" },
        { offset: "100%", color: "var(--linearGradientFourth)" },
      ])
      .enter()
      .append("stop")
      .attr("offset", function (d) {
        return d.offset;
      })
      .attr("stop-color", function (d) {
        return d.color;
      });

    vis.chart
      .selectAll(".avgLine")
      .data([vis.avgPercentageLonely])
      .join("line")
      .attr("class", "avgLine")
      .attr("x1", 0)
      .attr("y1", (d) => vis.yScale(d * 100))
      .attr("x2", vis.width)
      .attr("y2", (d) => vis.yScale(d * 100))
      .attr("fill", "none")
      .attr("stroke", "url(#line-gradient)");

    vis.chart
      .selectAll(".circle-point")
      .data(vis.percentageLonelyByAttribute)
      .join("circle")
      .attr("class", "circle-point")
      .attr("cx", (d, i) => {
        return vis.xScale(vis.xScale.domain()[i]) + vis.xScale.bandwidth() / 2;
      })
      .attr("cy", (d, i) => vis.yScale(d * 100))
      .attr("r", vis.config.relativeWidth === 1? 20 : 15)
      .attr("fill", (d) => {
        return vis.colorScale(d);
      }).on('mouseover', (event, d) => {
      d3.select(vis.config.tooltipId)
          .style('display', 'block')
          .style('left', (event.pageX + vis.config.tooltipPadding) + 'px')
          .style('top', (event.pageY + vis.config.tooltipPadding) + 'px')
          .html(`
          <div class="tooltip-heading"> category </div>
          <div class='tooltip-title'>🗂 ${vis.getPointTitleAndCountObject(vis.attribute, d).title}</div> 
          <div class="tooltip-spacer"></div>
          <div class="tooltip-heading"> number of people </div>
          <div class='tooltip-title'>👋 ${vis.getPointTitleAndCountObject(vis.attribute, d).count + " people"}</div>
 
            `);
    })
        .on('mouseleave', () => {
          d3.select(vis.config.tooltipId).style('display', 'none'); // Don't display description when mouse leaves the area
        });

    // plot points according to data x and y values
    vis.chart
      .selectAll(".point")
      .data(vis.percentageLonelyByAttribute)
      .join("svg")
      .attr("class", "point")
      .attr("x", (d, i) => {
        return vis.xScale(vis.xScale.domain()[i]) + vis.xScale.bandwidth() / 2 - vis.emojiOffset;
      })
      .attr("y", (d) => vis.yScale(d * 100) - vis.emojiOffset)
      .html((d) => {
        let emojiType = vis.emojiScale(d * 100);
        if (emojiType === "happyEmoji") return happyEmoji;
        if (emojiType === "avgEmoji") return avgEmoji;
        if (emojiType === "lonelyEmoji") return lonelyEmoji;
      });

    const yValues = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    vis.chart
      .selectAll(".axis-label-y .tick text")
      .data(yValues)
      .style("fill", (d) => vis.colorTextScale(d));

    vis.xAxis.tickFormat((d) => {
      if (vis.attribute === "trust") {
        return `${d * 10}%`;
      }
      return `${d}`;
    });

    // Update axes
    vis.xAxisG.call(vis.xAxis);
    vis.yAxisG.call(vis.yAxis);

    if (vis.attribute === "trust") {
      /* Note: This has to be called after the axes are updated because we are
      /* directly using the tick lines */
      vis.createTicksForTrustLabels();
    }
  }

  // helper functions

  // Calculate the margins needed for the scatterplot given the alignments
  calculateInitMargins(align) {
    let vis = this;
    // total width margin = 270
    if (align === "left") {
      vis.config.margin.right = 70;
      vis.config.margin.left = 200;
    } else if (align === "right") {
      vis.config.margin.right = 150;
      vis.config.margin.left = 120;
    }
  }

  calculateResponsiveMargins(align) {
    let vis = this;
    if (align === "left" || align === "right") {
      vis.config.margin.top = vis.config.containerHeight * 0.15;
      vis.config.margin.bottom = vis.config.containerHeight * 0.2;
    }
  }

  createScales() {
    let vis = this;
    // initialize linear scale for x axis
    vis.xScale = d3.scaleBand();

    // initialize categorical scale for y axis
    vis.yScale = d3.scaleLinear().domain([100, 0]);

    vis.colorScale = d3
      .scaleLinear()
      .domain([0.3, 0.5, 0.7, 0.9])
      .range(["#FBD24E", "#FEF3C7", "#BDDAFA", "#409AF0"]);

    vis.colorTextScale = d3
      .scaleLinear()
      .domain([100, 66, 33, 0])
      .range(["#FBD24E", "#FEF3C7", "#BDDAFA", "#409AF0"]);
  }

  createAxis() {
    let vis = this;
    // initialize x axis with vertical grid lines
    vis.xAxis = d3.axisTop(vis.xScale).ticks(5).tickPadding(15);

    // initialize y axis with text labels
    vis.yAxis = d3
      .axisLeft(vis.yScale)
      .tickPadding(20)
      .ticks(10)
      .tickFormat((d) => `${d}%`);
  }

  setAxisAndChartTitle() {
    let vis = this;

    // Append x-axis group
    vis.xAxisG = vis.chart.append("g").attr("class", "axis-label axis-label-x");

    // Append y-axis group
    vis.yAxisG = vis.chart.append("g").attr("class", "axis-label axis-label-y");

    vis.axisLonelyContainer = vis.yAxisG
      .append("g")
      .attr("class", "yaxis-lonely");

    vis.axisHappyContainer = vis.yAxisG
      .append("g")
      .attr("class", "yaxis-happy");
  }

  setDimensions(containerWidth, containerHeight)
 {
   let vis = this;
   vis.config.containerWidth = containerWidth;
   vis.config.containerHeight = containerHeight;
   vis.calculateResponsiveMargins(vis.config.align);

   vis.width =
       vis.config.containerWidth -
       vis.config.margin.left -
       vis.config.margin.right;
   vis.height =
       vis.config.containerHeight -
       vis.config.margin.top -
       vis.config.margin.bottom;

   vis.xScale.range([0, vis.width]);
   vis.yScale.range([0, vis.height]);

   vis.xAxis.tickSize(-vis.height);
   vis.yAxis.tickSize(-vis.width);

   if (vis.config.align !== "right") {
     vis.axisLonelyContainer
         .attr("transform", `translate(-106,-20)`)
         .html(axisLonely);

     vis.axisHappyContainer
         .attr("transform", `translate(-106,${vis.height - 20})`)
         .html(axisHappy);
   }

   vis.svg
       .attr("width", vis.config.containerWidth)
       .attr("height", vis.config.containerHeight);
 }

  createTicksForTrustLabels() {
    let vis = this;
    let trustThresholds = [5];

    d3.selectAll(".axis-label-x .tick line")
      .attr("y1", vis.height)
      .attr("y2", function (d) {
        if (trustThresholds.includes(d)) {
          return -70;
        }
        return 0;
      });
  }

  createTrustLabels() {
    let vis = this;
    const trustCategories = {
      0: "Distrustful",
      5: "Trusting",
    };

    vis.trustCategoryLabels = vis.chart
        .selectAll(".trust-label")
        .data(Object.keys(trustCategories).map(Number));

    vis.trustCategoryLabels
        .join("text")
        .attr("class", "trust-label")
        .attr("y", -40)
        .attr("x", (d) => {
          const rangeEnd = vis.xScale(d + 5);
          const rangeStart = vis.xScale(d);
          return ((rangeEnd + rangeStart) / 2) + 50;
        })
        .style("text-anchor", "middle")
        .style("fill", "#A9A9A9")
        .text((d) => trustCategories[d]);
  }

  removeTrustLabels() {
    let vis = this;
    vis.chart.selectAll(".trust-label").remove();
  }

  calculateLonelyPercentages(attribute) {
    let vis = this;
    const insideAttrToInsideDomain = {
      "Strongly disagree": vis.insideDomain[0],
      "Disagree": vis.insideDomain[1],
      "Slightly disagree": vis.insideDomain[2],
      "Slightly agree": vis.insideDomain[3],
      "Agree": vis.insideDomain[4],
      "Strongly agree": vis.insideDomain[5],
    };

    const stressAttrToStressDomain = {
      "Very often": vis.stressDomain[0],
      "Fairly often": vis.stressDomain[1],
      "Sometimes": vis.stressDomain[2],
      "Almost never": vis.stressDomain[3],
      "Never": vis.stressDomain[4],
    };

    if (vis.attribute === "trust") {
      vis.calculateLonelyPercentageEachGroup(attribute);
    } else if (vis.attribute === "stress") {
      vis.calculateLonelyPercentageEachGroup(attribute, stressAttrToStressDomain);
    } else if (vis.attribute === "inside") {
      vis.calculateLonelyPercentageEachGroup(attribute, insideAttrToInsideDomain);
    } else {
      vis.calculateLonelyPercentageEachGroup(attribute);
    }
  }

  calculateLonelyPercentageEachGroup(attribute, domainMapping = null) {
    let vis = this;
    let domain = vis.xScale.domain();

    vis.data.sort(function (a, b) {
      return a[attribute] > b[attribute];
    });

    vis.countsTotalByPersonality = new Array(domain.length).fill(0);
    vis.lonelyCountByAttribute = new Array(domain.length).fill(0);
    vis.percentageLonelyByAttribute = new Array(domain.length).fill(0);

    vis.data.forEach((d) => {
      const domainValue = domainMapping ? domainMapping[d[attribute]] : d[attribute];
      const index = domain.indexOf(domainValue);
      if (index === -1) {
        return;
      }
      vis.countsTotalByPersonality[index]++;

      if (vis.isLonely(d)) {
        vis.lonelyCountByAttribute[index]++;
      }
    });

    vis.percentageLonelyByAttribute.forEach(
      (num, i) =>
        (vis.percentageLonelyByAttribute[i] =
          vis.lonelyCountByAttribute[i] / vis.countsTotalByPersonality[i]),
    );
  }

  getPointTitleAndCountObject(attribute, d) {
    let vis = this;
    let index = vis.percentageLonelyByAttribute.indexOf(d)
    if (attribute === "trust") {
      return {title: (vis.trustDomain[index] * 10) + "%", count: vis.countsTotalByPersonality[index]}
    } else if (attribute === "stress") {
      return {title: vis.stressDomain[index], count: vis.countsTotalByPersonality[index]}
    } else if (attribute === "inside") {
      return {title: vis.insideDomain[index], count: vis.countsTotalByPersonality[index]}
    } else {
      return {title: vis.personalityDomain[index], count: vis.countsTotalByPersonality[index]}
    }
  }
}

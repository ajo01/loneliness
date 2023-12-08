import * as d3 from "d3";
import * as d3Sankey from "d3-sankey";

export class Sankey {
  constructor(
    _config,
    _data,
    _nodes,
    _links,
    _covidAttributes,
    _distressAttributes,
    _attributeOrder,
  ) {
    this.config = {
      parentElement: _config.parentElement,
      containerWidth: window.innerWidth,
      containerHeight: window.innerHeight,
      tooltipPadding: 15,
      margin: { top: 45, right: 170, bottom: 45, left: 170 },
    };
    this.data = _data;
    this.nodesAndLinks = {
      nodes: _nodes,
      links: _links,
    };

    this.covidAttributes = _covidAttributes;
    this.distressAttributes = _distressAttributes;
    this.attributeOrder = _attributeOrder;
    this.initVis();
  }

  initVis() {
    let vis = this;

    vis.svg = d3.select(vis.config.parentElement).append("svg");

    vis.chart = vis.svg
      .append("g")
      .attr(
        "transform",
        `translate(${vis.config.margin.left},${vis.config.margin.top})`,
      );

    vis.covidColorScale = d3
      .scaleOrdinal()
      .domain(d3.range(vis.covidAttributes.length))
      .range(["#FFFFFF", "#C2C2C2", "#6F6F6F", "#3D3D3D"]);

    vis.distressColorScale = d3
      .scaleOrdinal()
      .domain(d3.range(vis.distressAttributes.length))
      .range([
        "#5e5e5d",
        "var(--pointFirst)",
        "var(--pointSecond)",
        "var(--pointThird)",
        "var(--pointFourth)",
        "var(--pointFifth)",
        "var(--pointSixth)",
      ]);
  }

  updateVis(containerWidth, containerHeight) {
    let vis = this;

    vis.setDimensions(containerWidth, containerHeight);

    const nodes = vis.nodesAndLinks.nodes;
    const links = vis.nodesAndLinks.links;

    vis.sankeyChart = d3Sankey
      .sankey()
      .nodeId((d) => d.id)
      .nodeSort((a, b) => {
        return vis.attributeOrder[a.id] - vis.attributeOrder[b.id];
      })
      .nodeWidth(15)
      .nodePadding(10)
      .extent([
        [vis.config.margin.left, vis.config.margin.top],
        [
          Math.min(vis.width, vis.calculateMaxWidth()),
          Math.min(vis.height, vis.calculateMaxHeight()),
        ],
      ])({ nodes, links });

    vis.renderVis();
  }

  renderVis() {
    let vis = this;
    const nodeLabelsMapping = {
      "Strongly disagree" : "Not lonely at all",
      "Disagree" : "A little lonely",
      "Slightly disagree" : "Somewhat lonely",
      "Slightly agree" : "Lonely",
      "Agree" : "Very lonely",
      "Strongly agree" : "Extremely lonely"
    };

    //-----------------------------------------------------------------------------------------------------------------
    // Nodes
    const nodes = vis.chart
      .selectAll(".node")
      .data(vis.sankeyChart.nodes, (d) => d.id);

    const nodesEnter = nodes.enter().append("g").attr("class", "node");

    nodes
      .merge(nodesEnter)
      .selectAll("rect")
      .data((d) => [d])
      .join("rect")
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("width", (d) => d.x1 - d.x0)
      .attr("stroke", (d) => vis.getColorForAttribute(d.id))
      .attr("fill", (d) => vis.getColorForAttribute(d.id))
      .on("mouseover", function (event, d) {
        const attributePercentages =
          vis.getAttributePercentagesForSourceOrTarget(d.id, d.value);
        const tooltip = d3
          .select("#sankey-tooltip")
          .style("opacity", 1)
          .style("display", "block");
        const attributeValue = nodeLabelsMapping.hasOwnProperty(d.id) ? nodeLabelsMapping[d.id] : d.id;

        tooltip.html(`
      <div class="sankey-tooltip-heading">${d.value.toLocaleString()} said ${attributeValue}</div>
      <div class="sankey-tooltip-content"></div>
    `);

        attributePercentages.sort((a, b) => {
          return (
            vis.attributeOrder[a.attribute] - vis.attributeOrder[b.attribute]
          );
        });

        attributePercentages.forEach((d) => {
          const attributeValue = nodeLabelsMapping.hasOwnProperty(d.attribute) ? nodeLabelsMapping[d.attribute] : d.attribute;

          tooltip.select(".sankey-tooltip-content").append("div").html(`
          <div class="sankey-tooltip-square" style="background-color: ${vis.getColorForAttribute(
            d.attribute,
          )}"></div>
          <div class="sankey-tooltip-percentage">${d.percentage.toFixed(1,)}%</div>
          <div class="sankey-tooltip-attribute">${attributeValue}</div>
        `);
        });

        vis.setLinkOpacities(d.id);
      })
      .on("mousemove", (event) => {
        d3.select("#sankey-tooltip")
          .style("left", event.pageX + vis.config.tooltipPadding + "px")
          .style("top", event.pageY + vis.config.tooltipPadding + "px");
      })
      .on("mouseleave", () => {
        d3.select("#sankey-tooltip").style("opacity", 0);
        vis.setLinkOpacities(null);
      })
      .merge(nodes)
      .transition()
      .duration(500);

    nodes.exit().remove();

    //-----------------------------------------------------------------------------------------------------------------
    // Node Labels

    const nodesLabels = vis.chart
      .selectAll(".node-label")
      .data(vis.sankeyChart.nodes, (d) => d.id);

    const nodesLabelsEnter = nodesLabels
      .enter()
      .append("text")
      .attr("class", "node-label");

    nodesLabels
      .merge(nodesLabelsEnter)
      .text((d) => {
        return nodeLabelsMapping.hasOwnProperty(d.id) ? nodeLabelsMapping[d.id] : d.id;
      })
      .attr("fill", "grey")
      .attr("x", (d) => (d.x0 < vis.width / 2 ? d.x1 - 40 : d.x0 + 40))
      .attr("y", (d) => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", (d) => (d.x0 < vis.width / 2 ? "end" : "start"))
      .transition()
      .duration(500);

    nodesLabels.exit().remove();

    //-----------------------------------------------------------------------------------------------------------------
    // Links
    vis.links = vis.chart
      .selectAll(".links")
      .data(vis.sankeyChart.links, (d) => d.id);

    vis.linksEnter = vis.links.enter().append("path").attr("class", "links");

    vis.linksEnter
      .merge(vis.links)
      .attr("d", d3Sankey.sankeyLinkHorizontal())
      .attr("fill", "none")
      .attr("stroke-opacity", 0.6)
      .attr("stroke", (d) => vis.getColorForAttribute(d.source.id))
      .attr("stroke-width", ({ width }) => Math.max(1, width))
      .transition()
      .duration(500);

    vis.links.exit().remove();

    //-----------------------------------------------------------------------------------------------------------------
    // Chart labels

    vis.isolationText = vis.svg
        .selectAll(".isolation-text")
        .data(["Isolation"]);

    vis.isolationText = vis.isolationText
        .join("text")
        .attr("class", "isolation-text")
        .text((d) => d)
        .attr("fill", "white")
        .attr(
            "transform",
            `translate(${Math.min(vis.width, vis.calculateMaxWidth()) + vis.config.margin.left + 20}, 
                        ${vis.config.margin.top - 10})`,
        );

    vis.lonelinessText = vis.svg
        .selectAll(".loneliness-text")
        .data(["Loneliness"]);

    vis.lonelinessText = vis.lonelinessText
        .join("text")
        .attr("class", "loneliness-text")
        .text((d) => d)
        .attr("fill", "white")
        .attr(
            "transform",
            `translate(${vis.config.margin.left + 35}, ${vis.config.margin.top - 10})`,
        );
  }

  //-----------------------------------------------------------------------------------------------------------------
  // Helper Functions
  //-----------------------------------------------------------------------------------------------------------------
  calculateMaxHeight() {
    const MAX_HEIGHT_RATIO = 0.62;
    return MAX_HEIGHT_RATIO * window.innerHeight;
  }

  calculateMaxWidth() {
    const MAX_WIDTH_RATIO = 0.65;
    return MAX_WIDTH_RATIO * window.innerWidth;
  }

  setDimensions(containerWidth, containerHeight) {
    let vis = this;

    vis.config.containerWidth = containerWidth;
    vis.config.containerHeight = containerHeight;

    vis.width =
      vis.config.containerWidth -
      vis.config.margin.left -
      vis.config.margin.right;
    vis.height =
      vis.config.containerHeight -
      vis.config.margin.top -
      vis.config.margin.bottom;

    vis.svg
      .attr("width", vis.config.containerWidth)
      .attr("height", vis.config.containerHeight);
  }

  getColorForAttribute(attribute) {
    let vis = this;
    let isACovidAttribute = vis.covidAttributes.indexOf(attribute) !== -1;
    let isADistressAttribute = vis.distressAttributes.indexOf(attribute) !== -1;
    if (isACovidAttribute) {
      const covidIndex = vis.covidAttributes.indexOf(attribute);
      return vis.covidColorScale(covidIndex);
    }

    if (isADistressAttribute) {
      const distressIndex = vis.distressAttributes.indexOf(attribute);
      return vis.distressColorScale(distressIndex);
    }

    console.error(
      `Attribute ${attribute} does not exist in any color scales, returning Yellow!}`,
    );
    return "yellow";
  }

  getAttributePercentagesForSourceOrTarget(sourceOrTarget, total) {
    let vis = this;
    const linksForSource = vis.getLinksForSource(sourceOrTarget);
    const linksForTarget = vis.getLinksForTarget(sourceOrTarget);

    return linksForSource.length !== 0
      ? vis.getPercentages(linksForSource, total, "source")
      : vis.getPercentages(linksForTarget, total, "target");
  }

  getLinksForSource(source) {
    let vis = this;
    return vis.sankeyChart.links.filter((d) => d.source.id === source);
  }

  getLinksForTarget(target) {
    let vis = this;
    return vis.sankeyChart.links.filter((d) => d.target.id === target);
  }

  getPercentages(links, total, sourceOrTarget) {
    const percentageOfAttributesMap = [];
    links.forEach((d) => {
      const percentage = (d.value / total) * 100;
      const attribute = sourceOrTarget === "source" ? d.target.id : d.source.id;
      percentageOfAttributesMap.push({
        percentage: percentage,
        attribute: attribute,
      });
    });

    return percentageOfAttributesMap;
  }

  setLinkOpacities(sourceId) {
    let vis = this;
    if (sourceId === null) {
      vis.resetLinkOpacities();
      return;
    }

    vis.linksEnter
      .transition()
      .duration(300)
      .style("stroke-opacity", (d) => {
        if (d.source.id === sourceId || d.target.id === sourceId) {
          return 1.0;
        }
        return 0.5;
      });
  }

  resetLinkOpacities() {
    let vis = this;
    vis.linksEnter.transition().duration(300).style("stroke-opacity", 0.6);
  }
}

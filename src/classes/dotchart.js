import * as d3 from "d3";

export class DotChart {
    //  class constructor with initial configuration
    constructor(_config, _data) {
        this.config = {
            parentElement: _config.parentElement,
            containerWidth: 1000,
            containerHeight: 600,
            margin: _config.margin || {
                top: 80,
                right: 100,
                bottom: 100,
                left: 100,
            },
        };
        this.data = _data;
        this.totalDots = 326; // the total number of dots allowed across all categories in the chart
        this.radius = 7.5; // radius of each dot
        this.initVis();
    }

    initVis() {
        let vis = this;
        vis.setDimensions();
        vis.updateVis();
    }

    updateVis(containerWidth, containerHeight) {
        let vis = this;

        vis.config.containerWidth = containerWidth;
        vis.config.containerHeight = containerHeight;
        vis.config.margin.top = vis.config.containerHeight * 0.1;
        vis.config.margin.bottom = vis.config.containerHeight * 0.2;

        // Filter the data to exclude non-meaningful categories
        vis.filteredData = vis.data.filter(function (d) {
            return d.distress !== "Does not apply to my current situation";
        });
        vis.total = vis.filteredData.length;
        // participants in each distress level is counted
        vis.totalPerDistressLevel = d3.rollups(
            vis.filteredData,
            (v) => v.length,
            (d) => d.distress
        );
        const orderedDistress = {
            "Strongly disagree": 6,
            "Disagree": 5,
            "Slightly disagree": 4,
            "Slightly agree": 3,
            "Agree": 2,
            "Strongly agree": 1,
        };

        // TODO: extract this as a helper function
        vis.totalPerDistressLevel.sort((a, b) => {
            const keyA = a[0];
            const keyB = b[0];

            if (
                orderedDistress.hasOwnProperty(keyA) &&
                orderedDistress.hasOwnProperty(keyB)
            ) {
                return orderedDistress[keyA] - orderedDistress[keyB];
            } else {
                console.error(`Invalid distress values: ${keyA} or ${keyB}`);
                return 0;
            }
        });

        vis.renderVis();
    }

    renderVis() {
        let vis = this;
        // set constants used outside of the loop
        const columnHeadingWidth = vis.width / 6;

        // append dot group and translate the placement for each column
        const dots = vis.chart.selectAll(".dots-group")
            .data(vis.totalPerDistressLevel)
            .enter()
            .append("g")
            .attr("class", "dots-group")
            .attr("transform", (d, i) => {
                return "translate(" + columnHeadingWidth * i + "," + 0 + ")";
            });

        // append circles to each column
        dots.selectAll(".dots")
            .data(d => vis.mapDots(d))
            .enter()
            .append("circle")
            .attr("class", "dots")
            .attr("cx", (d, i) => {
                return (i % 5 + 1) * ((columnHeadingWidth - 15) / 5) - 5;
            })
            .attr("cy", (d, i) => {
                const fullRows = Math.floor(i / 5);
                return 80 + fullRows * (vis.radius * 3);
            })
            .attr("r", vis.radius)
            .attr("fill", d => vis.setCircleColour(d[0]) );

        // append column title
        dots.append("text")
            .attr("class", "label")
            .attr("x", 5)
            .attr("y", 0)
            .attr("text-anchor", "start")
            .text(d => d[0]);

        // append column fill
        dots.append("rect")
            .attr("x", 0)
            .attr("y", 10)
            .attr("width", columnHeadingWidth)
            .attr("height", 32)
            .attr("fill", d => vis.setCircleColour(d[0]));

        // append text label for total number of people per column
        dots.append("text")
            .attr("class", "label")
            .attr("x", 5)
            .attr("y", 60)
            .text(d => "Total: " + d[1]);

        vis.setFadedVerticalLines(dots, 0, 10);

        // translate the last line to where the column ends
        let lastLine = vis.chart
            .append("g")
            .attr("opacity", 0.3)
            .attr("transform", "translate(" + columnHeadingWidth * 6 + "," + 0 + ")");

        vis.setFadedVerticalLines(lastLine, 0, 10);
        vis.setPersonsPerCircle();

        return vis.svg.node();
    }

    // helper functions
    setDimensions() {
        let vis = this;

        // calculate inner chart size
        vis.width =
            vis.config.containerWidth -
            vis.config.margin.left -
            vis.config.margin.right;
        vis.height =
            vis.config.containerHeight -
            vis.config.margin.top -
            vis.config.margin.bottom;

        // define svg drawing area
        vis.svg = d3
            .select(vis.config.parentElement)
            .append("svg")
            .attr("width", vis.config.containerWidth)
            .attr("height", vis.config.containerHeight);

        // position chart according to margin config
        vis.chart = vis.svg
            .append("g")
            .attr(
                "transform",
                `translate(${vis.config.margin.left},${vis.config.margin.top})`
            );
    }

    // maps the dots to an array of size of the number of dots per column
    mapDots(d) {
        let vis = this;
        const percentPerLevel = d[1] / vis.total;
        const balls = Math.ceil(percentPerLevel * vis.totalDots);
        return d3.range(balls).map(() => d);
    };

    // sets the colour of the circle according to the level of distress
    setCircleColour(distressLevel) {
        if (distressLevel === "Strongly disagree") {
            return "var(--pointFirst)";
        } else if (distressLevel === "Disagree") {
            return "var(--pointSecond)";
        } else if (distressLevel === "Slightly disagree") {
            return "var(--pointThird)";
        } else if (distressLevel === "Slightly agree") {
            return "var(--pointFourth)";
        } else if (distressLevel === "Agree") {
            return "var(--pointFifth)";
        } else if (distressLevel === "Strongly agree") {
            return "var(--pointSixth)";
        }
    }

    // calculate and add the number of persons represented by each circle
    setPersonsPerCircle() {
        let vis = this;

        const perCircle = vis.chart.selectAll(".perCircle");

        if (perCircle.empty()) {
            const newPerCircle = vis.chart.append("g").attr("class", "perCircle");

            newPerCircle
                .append("circle")
                .attr("class", "dots")
                .attr("cy", -3)
                .attr("r", vis.radius)
                .attr("fill", "#0A60BD");

            newPerCircle
                .append("text")
                .attr("class", "label")
                .attr("y", 0)
                .attr("x", 10)
                .text(d => "= x" + Math.ceil(vis.total / vis.totalDots) + " people");
        } else {
            perCircle.attr("transform", "translate(" + 0 + "," + -vis.config.margin.top / 2 + ")");
        }
    }

    // function to set faded vertical lines
    setFadedVerticalLines(dots, x, y_start) {
        dots
            .append("line")
            .attr("class", "line")
            .attr("x1", x)
            .attr("y1", y_start)
            .attr("x2", x)
            .attr("y2", y_start + 440)
            .style("stroke", "url(#dot-line-gradient)");

        let gradient = dots
            .append("linearGradient")
            .attr("id", "dot-line-gradient")
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", x)
            .attr("y1", y_start)
            .attr("x2", x)
            .attr("y2", y_start + 440);

        gradient
            .append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "white")
            .attr("stop-opacity", 1);

        gradient
            .append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "white")
            .attr("stop-opacity", 0);
    }
}

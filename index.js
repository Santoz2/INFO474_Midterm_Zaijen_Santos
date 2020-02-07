/* Zaijen Santos
   INFO 474
   2/6/2020
   Midterm Javascript
*/

"use strict";
(function () {
    let data = ""
    let svgContainer = ""
    // dimensions for svg
    const measurements = {
        width: 1000,
        height: 500,
        marginAll: 50
    }

    const colors = {
        "Bug": "#4E79A7",
        "Dark": "#A0CBE8",
        "Dragon": "#660066",
        "Electric": "#F28E2B",
        "Fairy": "#ffccff",
        "Fighting": "#59A14F",
        "Fire": "#8CD17D",
        "Flying": "#ccffff",
        "Ghost": "#B6992D",
        "Grass": "#499894",
        "Ground": "#86BCB6",
        "Ice": "#86BCB6",
        "Normal": "#E15759",
        "Poison": "#FF9D9A",
        "Psychic": "#79706E",
        "Rock": "#996633",
        "Steel": "#BAB0AC",
        "Water": "#D37295"
    }

    // load data and append svg to body
    svgContainer = d3.select('#graphContainer').append("svg")
        .attr('width', measurements.width + 500)
        .attr('height', measurements.height);
    d3.csv("pokemon.csv")
        .then((csvData) => data = csvData)
        .then(() => makeScatterPlot())


    function makeScatterPlot() {
        // get arrays of Sp. Def and Total Stats
        let spDef = data.map((row) => parseInt(row["Sp. Def"]))
        let statTotal = data.map((row) => parseFloat(row["Total"]))
        // find range of data
        const limits = findMinMax(spDef, statTotal)
        // create a function to scale x coordinates
        let scaleX = d3.scaleLinear()
            .domain([limits.spDefMin - 5, limits.spDefMax])
            .range([0 + measurements.marginAll, measurements.width - measurements.marginAll])
        // create a function to scale y coordinates
        let scaleY = d3.scaleLinear()
            .domain([limits.statTotalMax, limits.statTotalMin - 0.05])
            .range([0 + measurements.marginAll, measurements.height - measurements.marginAll])

        drawAxes(scaleX, scaleY)

        plotData(scaleX, scaleY)
        const xMapDisplaced = function (d) { return scaleX(+d["Sp. Def"]) + 5000 }
        const xMap = function (d) { return scaleX(+d["Sp. Def"]) }
        d3.select("#generationDropDown").on("change", function (d) {
            var genStatus = d3.select(this).property("value");
            svgContainer.selectAll("circle").style('opacity', 0)
                .attr('cx', xMapDisplaced);
            var legendaryStatus = d3.select("#legendaryDropDown").property("value");
            legendaryHandler(legendaryStatus, genStatus, xMap);
        })

        d3.select("#legendaryDropDown").on("change", function (d) {
            // recover the option that has been chosen
            svgContainer.selectAll("circle").style('opacity', 0)
                .attr('cx', xMapDisplaced);
            var legendaryStatus = d3.select(this).property("value");
            var genStatus = d3.select("#generationDropDown").property("value");
            legendaryHandler(legendaryStatus, genStatus, xMap);
        })

        //Add the Axis Labels
        svgContainer.append("text")
            .attr("transform",
                "translate(" + 500 + " ," +
                (490) + ")")
            .style("text-anchor", "middle")
            .text("Sp. Def");

        svgContainer.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0)
            .attr("x", 0 - 250)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Total");

        //Add the Legend
        svgContainer.append("text")
            .attr("transform",
                "translate(" + 1010 + " ," +
                (30) + ")")
            .style("text-anchor", "middle")
            .style("font-weight", "bold")
            .text("Type 1");
        let count = 0;
        Object.entries(colors).forEach(entry => {
            let key = entry[0];
            let value = entry[1];
            //console.log(key);
            //console.log(value);
            svgContainer.append("rect")
                .attr("x", 1000)
                .attr("y", 45 + count * 20)
                .attr("width", 10)
                .attr("height", 10)
                .style("fill", value)
            svgContainer.append("text")
                .attr("x", 1020)
                .attr("y", 55 + count * 20)
                .text(key)
                .style("font-size", "15px")
                .attr("alignment-baseline", "middle")
            count++;
        })
    }

    function findMinMax(spDef, statTotal) {
        return {
            spDefMin: d3.min(spDef),
            spDefMax: d3.max(spDef),
            statTotalMin: d3.min(statTotal),
            statTotalMax: d3.max(statTotal)
        }
    }

    function drawAxes(scaleX, scaleY) {
        // these are not HTML elements. They're functions!
        let xAxis = d3.axisBottom()
            .scale(scaleX)

        let yAxis = d3.axisLeft()
            .scale(scaleY)

        // append x and y axes to svg
        svgContainer.append('g')
            .attr('transform', 'translate(0,450)')
            .call(xAxis)

        svgContainer.append('g')
            .attr('transform', 'translate(50, 0)')
            .call(yAxis)
    }

    function plotData(scaleX, scaleY) {
        // get scaled x and y coordinates from a datum
        // a datum is just one row of our csv file
        // think of a datum as an object of form:
        // {
        //     "GRE Score": ...,
        //     "Admit": ...,
        //     ...
        // }
        const xMap = function (d) { return scaleX(+d["Sp. Def"]) }
        const yMap = function (d) { return scaleY(+d["Total"]) }

        // Define the div for the tooltip
        var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        const circles = svgContainer.selectAll(".circle")
            .data(data)
            .enter()
            .append('circle')
            .attr('cx', xMap)
            .attr('cy', yMap)
            .attr('r', 3)
            //.attr('aria-label', (d) => d["Name"])
            .attr('class', function (d) {
                var finalClass = "";
                if (d["Legendary"] == "True") {
                    finalClass = "Legendary";
                } else {
                    finalClass = "Normal";
                }
                finalClass = finalClass + " Gen" + d["Generation"];
                return finalClass;
            })
            .attr('fill', function (d) {
                return colors[d["Type 1"]];
            })
            .on("mouseover", function (d) {
                //console.log(this.className.baseVal);
                var legendaryStatus = d3.select("#legendaryDropDown").property("value");
                var genStatus = d3.select("#generationDropDown").property("value");
                var currentLegendary = this.className.baseVal.substring(0, this.className.baseVal.indexOf(' '));
                if (legendaryStatus == "true") {
                    if ((genStatus == "all" && currentLegendary == "Legendary") || this.className.baseVal == "Legendary Gen" + genStatus) {
                        div.transition()
                            .duration(200)
                            .style("opacity", .9);
                        div.html(d["Name"] + "<br/>" + d["Type 1"] + "<br/>" + d["Type 2"])
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                    }
                } else if (legendaryStatus == "false") {
                    if ((genStatus == "all" && currentLegendary == "Normal") || this.className.baseVal == "Normal Gen" + genStatus) {
                        div.transition()
                            .duration(200)
                            .style("opacity", .9);
                        div.html(d["Name"] + "<br/>" + d["Type 1"] + "<br/>" + d["Type 2"])
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                    }
                } else {
                    if (genStatus == "all" || this.className.baseVal == "Legendary Gen" + genStatus || this.className.baseVal == "Normal Gen" + genStatus) {
                        div.transition()
                            .duration(200)
                            .style("opacity", .9);
                        div.html(d["Name"] + "<br/>" + d["Type 1"] + "<br/>" + d["Type 2"])
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                    }
                }
            })
            .on("mouseout", function (d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
    }

    var legendaryValues = ["all", "true", "false"]
    // add the options to the button
    d3.select("#legendaryDropDown")
        .selectAll('myOptions')
        .data(legendaryValues)
        .enter()
        .append('option')
        .text(function (d) { return d; }) // text showed in the menu
        .attr("value", function (d) { return d; });

    var generationValues = ["all", "1", "2", "3", "4", "5", "6"]
    // add the options to the button
    d3.select("#generationDropDown")
        .selectAll('myOptions')
        .data(generationValues)
        .enter()
        .append('option')
        .text(function (d) { return d; }) // text showed in the menu
        .attr("value", function (d) { return d; });

    function legendaryHandler(legendaryStatus, genStatus, xMap) {
        if (legendaryStatus == "true") {
            if (genStatus == "all") {
                svgContainer.selectAll("circle.Legendary").style('opacity', 1).attr('cx', xMap);
            } else {
                svgContainer.selectAll("circle.Legendary").filter(".Gen" + genStatus).style('opacity', 1).attr('cx', xMap);
            }
        } else if (legendaryStatus == "false") {
            if (genStatus == "all") {
                svgContainer.selectAll("circle.Normal").style('opacity', 1).attr('cx', xMap);
            } else {
                svgContainer.selectAll("circle.Normal").filter(".Gen" + genStatus).style('opacity', 1).attr('cx', xMap);
            }
        } else {
            if (genStatus == "all") {
                svgContainer.selectAll("circle").style('opacity', 1).attr('cx', xMap);
            } else {
                svgContainer.selectAll("circle").filter(".Gen" + genStatus).style('opacity', 1).attr('cx', xMap);
            }
        }
    }
})()
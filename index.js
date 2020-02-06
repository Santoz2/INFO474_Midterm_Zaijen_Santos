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
        "Dragon": "#660066",
        "Rock": "#996633",
        "Dark": "#A0CBE8",
        "Electric": "#F28E2B",
        "Fairy": "#ffccff",
        "Fighting": "#59A14F",
        "Fire": "#8CD17D",
        "Ghost": "#B6992D",
        "Grass": "#499894",
        "Ground": "#86BCB6",
        "Ice": "#86BCB6",
        "Normal": "#E15759",
        "Poison": "#FF9D9A",
        "Psychic": "#79706E",
        "Steel": "#BAB0AC",
        "Water": "#D37295",
        "Flying": "#ccffff"
    }

    // load data and append svg to body
    svgContainer = d3.select('#graphContainer').append("svg")
        .attr('width', measurements.width)
        .attr('height', measurements.height);
    d3.csv("pokemon.csv")
        .then((csvData) => data = csvData)
        .then(() => makeScatterPlot())


    function makeScatterPlot() {
        // get arrays of GRE Score and Chance of Admit
        let spDef = data.map((row) => parseInt(row["Sp. Def"]))


        /*

        Similar to
        let spDef = []
        for (let i = 0; I < data.length; i++) {
            spDef.push(data[i])(["GRE Score"])
        }

        */
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
        const xMap = function (d) { return scaleX(+d["Sp. Def"])}
        d3.select("#generationDropDown").on("change", function (d) {
            // recover the option that has been chosen
            //const yMap = function (d) { return scaleY(+d["Total"]) }
            var genStatus = d3.select(this).property("value");
            svgContainer.selectAll("circle").style('opacity', 0)
                .attr('cx', xMapDisplaced);
            var legendaryStatus = d3.select("#legendaryDropDown").property("value");
            /*egendaryHandler(legendaryStatus);
            console.log("Gen" + genStatus);
            */
            /*
            if (legendaryStatus == "true") {
                svgContainer.selectAll("circle.Legendary").filter(".Gen" + genStatus).style('opacity', 1);
            } else if (legendaryStatus == "false") {
                svgContainer.selectAll("circle.Normal").filter(".Gen" + genStatus).style('opacity', 1);
            } else {
                svgContainer.selectAll("circle").filter(".Gen" + genStatus).style('opacity', 1);
            }*/
    
            legendaryHandler(legendaryStatus, genStatus, xMap);
        })

        d3.select("#legendaryDropDown").on("change", function (d) {
            // recover the option that has been chosen
            svgContainer.selectAll("circle").style('opacity', 0);
            var legendaryStatus = d3.select(this).property("value");
            var genStatus = d3.select("#generationDropDown").property("value");
    
            console.log(legendaryStatus, genStatus);
            legendaryHandler(legendaryStatus, genStatus, xMap);
            /*if (legendaryStatus == "true") {
                svgContainer.selectAll("circle.Legendary").filter(".Gen" + genStatus).style('opacity', 1);
            } else if (legendaryStatus == "false") {
                svgContainer.selectAll("circle.Normal").filter(".Gen" + genStatus).style('opacity', 1);
            } else {
                svgContainer.selectAll("circle").filter(".Gen" + genStatus).style('opacity', 1);
            }*/
    
    
            /*
            svgContainer.selectAll("circle").style('opacity', 1);
            legendaryHandler(selectedOption);*/
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
            .attr('aria-label', (d) => d["Name"])
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
                console.log(genStatus);
                var visibleClass = ""
                if (legendaryStatus == "true") {
                    visibleClass = visibleClass + "Legendary Gen" + genStatus
                } else if (legendaryStatus == "false") {
                    visibleClass = visibleClass + "Normal Gen" + genStatus;
                } else {
                    if (genStatus == "all" || this.className.baseVal == "Legendary Gen" + genStatus || this.className.baseVal == "Normal Gen" + genStatus) {
                        div.transition()
                            .duration(200)
                            .style("opacity", .9);
                        div.html(d["Name"] + " " + d["Total"])
                            .style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                    }
                }

                if (genStatus == "all" || this.className.baseVal == "Legendary Gen" + genStatus || this.className.baseVal == "Normal Gen" + genStatus) {
                    div.transition()
                        .duration(200)
                        .style("opacity", .9);
                    div.html(d["Name"] + " " + d["Total"])
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                }
                console.log(visibleClass);
                
            })
            .on("mouseout", function (d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
        /*
        //console.log(data);
        var text = svgContainer.selectAll("text")
            .data(data)
            .enter()
            .append("text");

        //console.log(text);

        var textLabels = text
            .attr("x", xMap)
            .attr("y", yMap)
            .text(function (d) { return d["GRE Score"]; })
            .attr("font-family", "sans-serif")
            .attr("font-size", "20px")
            .attr("fill", "red");
        //#CD0000 Red
        //#4286f4 Blue


        // Define the div for the tooltip
        var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
        */
    }

    //function makeBlue() {
    d3.select("#blueButton").on('click', function () {
        svgContainer.selectAll("circle.Gen1").attr('fill', '#4286f4');
        //attr('fill', '#4286f4')
    })

    d3.select("#redButton").on('click', function () {
        console.log("nani");
        svgContainer.selectAll("circle.Normal").attr('fill', '#CD0000');
        //attr('fill', '#4286f4')
    })
    //}


    var data2 = [0, 0.005, 0.01, 0.015, 0.02, 0.025];

    var sliderSimple = d3
        .sliderBottom()
        .min(d3.min(data2))
        .max(d3.max(data2))
        .width(300)
        .tickFormat(d3.format('.2%'))
        .ticks(5)
        .default(0.015)
        .on('onchange', val => {
            svgContainer.selectAll("circle").attr('r', (d3.format('.2%')(val)));
        });

    var gSimple = d3
        .select('div#slider-simple')
        .append('svg')
        .attr('width', 500)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)');

    gSimple.call(sliderSimple);

    d3.select('p#value-simple').text(d3.format('.2%')(sliderSimple.value()));
    /*var colorButton = d3.select("#colorButton")
        .append('select')
    */

    // Color picker
    var num2hex = rgb => {
        return rgb
            .map(color => {
                let str = color.toString(16);

                if (str.length === 1) {
                    str = '0' + str;
                }

                return str;
            })
            .join('');
    };

    var rgb = [100, 0, 0];
    //var colors = ['red', 'green', 'blue'];

    var gColorPicker = d3
        .select('body')
        .append('svg')
        .attr('width', 600)
        .attr('height', 400)
        .append('g')
        .attr('transform', 'translate(30,30)');

    var box = gColorPicker
        .append('rect')
        .attr('width', 100)
        .attr('height', 100)
        .attr('transform', 'translate(400,0)')
        .attr('fill', `#${num2hex(rgb)}`);

    rgb.forEach((color, i) => {
        var slider = d3
            .sliderBottom()
            .min(0)
            .max(255)
            .step(1)
            .width(300)
            .default(rgb[i])
            .displayValue(false)
            .fill(colors[i])
            .on('onchange', num => {
                rgb[i] = num;
                box.attr('fill', `#${num2hex(rgb)}`);
                d3.selectAll('circle').attr('fill', `#${num2hex(rgb)}`);
                d3.select('p#value-color-picker').text(`#${num2hex(rgb)}`);
            });

        gColorPicker
            .append('g')
            .attr('transform', `translate(30,${60 * i})`)
            .call(slider);
    });

    d3.select('p#value-color-picker').text(`#${num2hex(rgb)}`);

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
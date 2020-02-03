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
            .attr('class', function (d) {
                var finalClass = "";
                if(d["Legendary"] == "True") {
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
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html(d["Name"] + " " + d["Total"])
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
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

})()
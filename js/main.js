// global vars
var season = "";
var team = "";
var year = ""; // default

var x = d3.scale.ordinal().rangePoints([0, 30], 1),
    y = {};

// load csv file and create the chart

d3.queue()
    .defer(d3.csv, "data/teamWinRank.csv")
    .defer(d3.csv, "data/team_season.csv")
    .defer(d3.csv, "data/player2000_2009.csv")
    .await(function(error, dataTeamWinRank, dataTeamSeason, dataPlayers) {
        if (error) {
            console.error('Error: ' + error);
        }
        else {
            //doStuff(file1, file2);
            drawPlots(dataTeamWinRank, dataTeamSeason, dataPlayers);
        }
    });

function drawPlots(dataTeamWinRank, dataTeamSeason, dataPlayers) {

    var colors= d3.scale.ordinal()
        .domain(['ATL', 'BOS', 'CHA','CHI','CHR','CLE','DAL','DEN','DET','GSW','HOU','IND','LAC','LAL','MEM','MIA','MIL','MIN','NJN','NOH','NOO','NYK','OKC','ORL','PHI','PHO','POR','SAC','SAS','SEA','TOR','UTA','VAN'])
        .range(["#4876FF", "#1eff06",  "#FFC1C1", "#2dfefe", "#827c01", "#fe07a6", "#a8879f", "#fcff04", "#c602fe", "#16be61", "#ff9569", "#05b3ff", "#ecffa7", "#3f8670", "#e992ff", "#ffb209", "#e72955", "#83bf02", "#bba67b", "#fe7eb1", "#7570c1", "#85bfd1", "#f97505", "#9f52e9", "#8ffec2", "#dad045", "#b85f60", "#fe4df2", "#75ff6c", "#78a55a", "#ae6a02", "#bebeff", "#ffb3b3"]);

    var color2 = function(d, data) { return colors(d.Team.slice(0,3)); };
    var parcoords = d3.parcoords()("#parcoords")
        .data(dataTeamWinRank)
        .color(color2, dataTeamWinRank)
        .alpha(0.25)
        .composite("darken")
        .mode("queue")
        .render()
        .brushMode("1D-axes"); // enable brushing"#1eff06"
    // create data table, row hover highlighting
    var grid = d3.divgrid();
    d3.select("#grid")
        .datum(dataTeamWinRank.slice(0,20))
        .call(grid)
        .selectAll(".grow")
        .on({
            "mouseover": function(d) { parcoords.highlight([d]) },
            "mouseout": parcoords.unhighlight
        })
        .selectAll(".cell.data") // for hovering on cell events
        .on({
        "mouseover": function(d) { 
            season = $(this).attr("class").split(" ")[0];
            team = this.parentNode.firstChild.innerHTML;
            //console.log($(this));
            gridHighLight($(this));
            //console.log($(this).attr("class").split(" ")[0]);
            //console.log(this.parentNode.firstChild.innerHTML);
            drawTeamDetails(team, season, dataTeamSeason, dataPlayers);
        },
        "mouseout": function(d) {
        // we need to put d here, so $(this) can work.
            gridUnhighLight($(this));
        }
    });

    // update data table on brush event
    parcoords.on("brush", function(d) {
    d3.select("#grid")
        .datum(d.slice(0,20))
        .call(grid)
        .selectAll(".grow")
        .on({
            "mouseover": function(d) { parcoords.highlight([d]) },
            "mouseout": parcoords.unhighlight
        })
        .selectAll(".cell.data") // for hovering on cell events
        .on({
            "mouseover": function(d) { 
                season = $(this).attr("class").split(" ")[0];
                team = this.parentNode.firstChild.innerHTML;
                gridHighLight($(this));
                drawTeamDetails(team, season, dataTeamSeason, dataPlayers);
            },
            "mouseout": function(d) {
                // we need to put d here, so $(this) can work.
                gridUnhighLight($(this));
            }
        });
    });
};



function gridHighLight(cell) {
    cell.addClass("gThisHighlight");

    var col = cell.attr("class").split(" ")[1];
    // colunm
    
    d3.select("#grid")
        .selectAll("."+col)
        .classed("gHighlight",true);

    //row
    cell.parent().children().addClass("gHighlight");

}

function gridUnhighLight(cell) {
    cell.removeClass("gThisHighlight");
    
    var col = cell.attr("class").split(" ")[1];
    // column
    d3.select("#grid")
        .selectAll("."+col)
        .classed("gHighlight",false);

    cell.parent().children().removeClass("gHighlight");
    
}

function drawTeamDetails(team, year, dataTeamSeason, dataPlayers) {
    drawPie(team, year, dataTeamSeason);
    drawBar(team, year, dataTeamSeason);
    getTeamPlayerInfo(team, year, dataPlayers);
}

function drawBar(team, year, data) {
    $('#barTitle').text("Team Efficiency Compared With Other Teams");
    var query = data.filter(function(d) { return d.year == year; })
                    .map(function(d) { 
                        return {
                            team: d.team,
                            effi: +d.effi
                        };
                    });
    var bestWorstTeamEffi = query.filter( 
                                    function(d) {
                                        return d.effi == d3.max(query, function(d) { return d.effi; })
                                        || d.effi == d3.min(query, function(d) { return d.effi; })
                                    });
    var meanEffi = d3.round(d3.mean(query, function(d) { return d.effi; }),2);
    var meanTeamEffi = [{"team": "Mean", "effi": meanEffi}];

    var thisTeamEffi = query.filter(function(d) { return d.team == team; });

    var effiComp = d3.merge([bestWorstTeamEffi, meanTeamEffi, thisTeamEffi]);

    effiComp.sort(function(a,b) {
        return b.effi - a.effi;
    });

    var chart = document.getElementById("barChart"),
        axisMargin = 20,
        margin = 10,
        valueMargin = 4,
        width = chart.offsetWidth,
        height = chart.offsetHeight,
        barHeight = (height-axisMargin-margin*2)* 0.4/effiComp.length,
        barPadding = (height-axisMargin-margin*2)*0.6/effiComp.length,
        effiComp, bar, svg, scale, xAxis, labelWidth = 0;

    max = d3.max(effiComp.map(function(i){ 
        return i.effi;
    }));

    d3.select("#barChart").select("svg").remove();
    svg = d3.select(chart)
            .append("svg")
            .attr("width", width)
            .attr("height", 150);


    bar = svg.selectAll("g")
            .data(effiComp)
            .enter()
            .append("g");

    bar.attr("class", "bar")
        .attr("cx",0)
        .attr("transform", function(d, i) { 
                return "translate(" + margin + "," + (i * (barHeight + barPadding) + barPadding) + ")";
    });

    bar.append("text")
        .attr("class", "barLabel")
        .attr("y", barHeight / 2)
            .attr("dy", ".35em") //vertical align middle
            .text(function(d,i){
            if(i==0)
                return "Best";
            else if(i==3)
                return "Worst";
            else
                return d.team;
            }).each(function() {
            labelWidth = Math.ceil(Math.max(labelWidth, this.getBBox().width));
            });

        scale = d3.scale.linear()
            .domain([0, max])
            .range([0, width - margin*2 - labelWidth]);

            xAxis = d3.svg.axis()
            .scale(scale)
            .tickSize(-height + 2*margin + axisMargin)
            .orient("bottom");

            bar.append("rect")
            .attr("transform", "translate("+labelWidth+", 0)")
            .attr("height", barHeight)
            .attr("width", function(d){
            return scale(d.effi);
            });

        bar.append("text")
            .attr("class", "value")
            .attr("y", barHeight / 2)
            .attr("dx", -valueMargin + labelWidth) //margin right
            .attr("dy", ".35em") //vertical align middle
            .attr("text-anchor", "end")
            .text(function(d){
                return d.team+": "+d.effi;
            })
            .attr("x", function(d){
                var width = this.getBBox().width;
                return Math.max(width + valueMargin, scale(d.effi));
            });

        bar.classed("qTeam", function(d){
            if(d.team==team)
                return true;
            return false;
        });

        svg.insert("g",":first-child")
            .attr("class", "axis")
            .attr("transform", "translate(" + (margin + labelWidth) + ","+ (height - axisMargin - margin)+")")
            .call(xAxis);
}

function drawPie(team, year, data) {
        
        var won = 0;
        var lost = 0;
        //get from csv file
        
        var query = data.map(function(d) { 
                            return {
                                team: d.team,
                                year: d.year,
                                won: d.won,
                                lost: d.lost
                            };
                        })
                        .filter(function(d) { return d.year == year && d.team == team; });
        //console.log(JSON.stringify(query));
        won = parseInt(query[0].won);
        lost = parseInt(query[0].lost);
        
        // change title of pie chart
        $('#TeamH3').text(team+" "+year+" Won/Lost");

        //get team player info for efficiency
        //getTeamPlayerInfo(year, team);
        
        //draw pie chart
        var data = [{ "Result": "Won", "count": won },
                    { "Result": "Lost", "count": lost }]

        var width = 150,
            height = 120,
            radius = Math.min(width, height) / 2;

        var color = d3.scale.ordinal()
            .range(["#FF97CB", "#57BCD9"]);

        var arc = d3.svg.arc()
            .outerRadius(radius)
            .innerRadius(0);

        var pie = d3.layout.pie()
            .sort(null)
            .value(function (d) {
                return d.count;
            });
        d3.select("#pieChart").select("svg").remove();
        var svg = d3.select("#pieChart")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
        
        var g = svg.selectAll(".arc")
            .data(pie(data))
            .enter().append("g")
            .attr("class", "arc");

        g.append("path")
            .attr("d", arc)
            .style("fill", function (d) {
                return color(d.data.Result);
            });

        g.append("text")
            .attr("transform", function (d) {
                return "translate(" + arc.centroid(d) + ")";
            })
            .attr("dy", ".35em")
            .style("text-anchor", "middle")
            .text(function (d) {
                return d.data.Result + ": " + d.data.count;
            });
        
}

function getTeamPlayerInfo(team, year, dataPlayers) {
    // call d3 to get team player info(efficiency)
    // draw efficiency sankey graph
    // draw a table of player's performance
    var query = dataPlayers
                .filter(function(d) { return d.year == year && d.effi <= 250;}) // filter result
                .map(function(d) { // map result
                    return {
                        Player: d.Name,
                        Effi: +d.effi,
                        Pts: +d.pts,
                        GP: +d.gp,
                        Team: d.team
                    };
                });
    scatterplot(query, team);
}



function scatterplot(data, team) {
    var margin = {top: 10, right: 20, bottom: 20, left: 30},
        width = 600 - margin.left - margin.right,
        height = 100 - margin.top - margin.bottom;

    /* 
    * value accessor - returns the value to encode for a given data object.
    * scale - maps value to a visual display encoding, such as a pixel position.
    * map function - maps from data value to display value
    * axis - sets up axis
    */ 

    // setup x 
    var xValue = function(d) { return d.Effi;}, // data -> value
        xScale = d3.scale.linear().range([0, width]), // value -> display
        xMap = function(d) { return xScale(xValue(d));}, // data -> display
        xAxis = d3.svg.axis().scale(xScale).orient("bottom");

    // setup y
    var yValue = function(d) { return d.GP;}, // data -> value
        yScale = d3.scale.linear().range([height, 0]), // value -> display
        yMap = function(d) { return yScale(yValue(d));}, // data -> display
        yAxis = d3.svg.axis().scale(yScale).orient("left");

    // setup fill color
    var cValue = function(d) { 
            if(d.Team == team)
                return d.Team;
            else
                return "else";
        },
        color = d3.scale.ordinal()
                .domain([team,"else"])
                .range(["#4ddbff", "#004d60"]);
    // add the graph canvas to the body of the webpage
    d3.select("#scatter svg").remove();
    d3.selectAll(".tooltip").remove();
    var svg = d3.select("#scatter")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // add the tooltip area to the webpage
    var tooltip = d3.select("#scatter").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // don't want dots overlapping axis, so add in buffer to data domain
    xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
    yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

    // x-axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("font-size", 10)
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "sLabel")
        .attr("x", width)
        .attr("y", -6)
        .attr("font-size", 10)
        .style("text-anchor", "end")
        .text("Efficiency");

    // y-axis
    svg.append("g")
        .attr("class", "y axis")
        .attr("font-size", 10)
        .call(yAxis)
        .append("text")
        .attr("class", "sLabel")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .attr("font-size", 10)
        .style("text-anchor", "end")
        .text("Games Played");

    // draw dots
    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", function(d) { return "dot "+d.Team})
        .attr("r", function(d) {
            if(d.Team == team)
                return 3;
            else
                return 2;
        })
        .attr("cx", xMap)
        .attr("cy", yMap)
        .style("fill", function(d) { return color(cValue(d));})
        .style("opacity", function(d) { 
            if(d.Team == team)
                return 1;
            else
                return .5;
        })
        .on("mouseover", function(d) {
            if(d.Team == team) {
                tooltip.transition()
                    .duration(100)
                    .style("opacity", .9);
                tooltip.html(d.Player + "<br> Effi:" + xValue(d) 
                    + "<br> GP:" + yValue(d) + "<br> Pts:" + d.Pts)
                    .style("left", (d3.mouse(this)[0] + 50) + "px")
                    .style("top", (d3.mouse(this)[1] - 20) + "px");
            }
        })
        .on("mouseout", function(d) {
            if(d.Team == team) {
                tooltip.transition()
                    .duration(100)
                    .style("opacity", 0);
            }
        });

    // draw legend
    var legend = svg.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    // draw legend colored rectangles
    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    // draw legend text
    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .attr("font-size", 10)
        .style("text-anchor", "end")
        .text(function(d) { return d;})
}
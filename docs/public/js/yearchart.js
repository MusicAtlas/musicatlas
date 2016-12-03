/**
 * Created by nishantagarwal on 11/27/16.
 */
/**
 * Constructor for the Year Chart
 *
 */
function YearChart(trackLength,tableChart, scaleSlider, wordCloud) {
    var self = this;

    self.tableChart = tableChart;
    self.trackLength = trackLength;
    self.scaleSlider = scaleSlider;
    self.wordCloud= wordCloud;
    self.numTracks = 0;

    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
YearChart.prototype.init = function(){

    var self = this;
    self.margin = {top: 10, right: 20, bottom: 30, left: 20};
    var divyearChart = d3.select("#year-chart");

    self.colorScale = d3.scaleLinear().range(colorbrewer.Dark2["8"]);

    //Gets access to the div element created for this chart from HTML
    
    self.svgBounds = divyearChart.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.right - self.margin.left;
    self.svgHeight = 110;
    self.svgTextPadding = 30;

    //creates svg element within the div
    self.svg = divyearChart.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight);

};

/**
 * Creates a chart with rectangles representing each year
 */
YearChart.prototype.update = function(year_data){
    var self = this;
    var max_count = d3.max(year_data,function(d,i){
        return parseInt(d.count);
    });

    self.colorScale.domain([max_count,0]);

    year_data.sort(function(a,b){
        return d3.ascending(parseInt(a.year),parseInt(b.year));
    });


    var year_data_map ={};
    var min= year_data[0].year;
    var max = year_data[year_data.length-1].year;

    year_data.forEach(function(d){
        year_data_map[+d.year] = d;
    });


    for (var i =min; i <= max; i++){
        if (year_data_map[i] == undefined){
            year_data_map[i] = {"count":0,"country":year_data[0].country,"country_id":year_data[0].country_id,"year":i};
        }
    }

    year_data =d3.values(year_data_map);

    year_data.sort(function(a,b){
        return d3.ascending(parseInt(a.year),parseInt(b.year));
    });

    self.trackLength.start_year = year_data[0].year;
    self.trackLength.end_year = year_data[year_data.length-1].year;

    self.scaleSlider.start_year = year_data[0].year;
    self.scaleSlider.end_year = year_data[year_data.length-1].year;
    self.scaleSlider.country = year_data[0].country_id;

    self.wordCloud.start_year = year_data[0].year;
    self.wordCloud.end_year = year_data[year_data.length-1].year;
    self.wordCloud.country = year_data[0].country_id;

    var stackedbar = self.svg.selectAll(".yearbar").data(year_data);

    stackedbar.exit().remove();

    stackedbar = stackedbar.enter().append("rect")
        .attr("height",30)
        .attr("y",self.svgHeight/2)
        .classed("yearbar",true)
        .merge(stackedbar);

    var width_till_now = 0;
    var prev = 0;

    stackedbar.attr("x",function(d){
        var w = self.svgWidth/year_data.length;

        if(width_till_now == 0) {
            width_till_now += w;
            return 0;
        }
        else{
            width_till_now += prev ;
            prev = w;
            return width_till_now;
        }
    })
        .attr("width", function(d){
            return (self.svgWidth/year_data.length)-1;
        })
        .style("fill",function(d){
            if(d.count == 0)
                return "lightgrey";
            return self.colorScale(parseInt(d.count));
        });

    var flag = year_data.length > 50 ? 1 : 0;

    var stackedTextGroup = self.svg.selectAll(".yeartext").data([1]);

    stackedTextGroup.exit().remove();

    stackedTextGroup = stackedTextGroup.enter().append("g").classed("yeartext",true).merge(stackedTextGroup);

    stackedTextGroup.attr("transform","translate(0,"+(self.svgHeight/2-10)+")");

    var stackedText = stackedTextGroup.selectAll("text").data(year_data);

    stackedText.exit().remove();

    var width_till_now = 0;
    var prev = 0;

    stackedText = stackedText.enter().append("text").merge(stackedText);

    stackedText.text(function(d,i){
            if(flag){
                if(i%2 == 0)
                    return d.year;
            }
            else{
                return d.year;
            }

        })
        .attr("transform",function() {
            var w = self.svgWidth/year_data.length;

            if(width_till_now == 0) {
                width_till_now += w;
                return "translate("+(w/2)+",0) rotate(-75)";
            }
            else{
                width_till_now += prev ;
                prev = w;
                return "translate("+(width_till_now+(w/2))+",0) rotate(-75)";
            }
        })
        .attr("dy", ".35em")
        .attr("dx","-.65em")
        .style("font-size","10px");


    //http://bl.ocks.org/mbostock/34f08d5e11952a80609169b7917d4172
    function brushed(){
        //on work if there is an event or a selection
        if(!d3.event.sourceEvent) return;
        if(!d3.event.selection) return;
        var s = d3.event.selection;

        var value = 0;
        var prev = 0;
        var selected_year = [];
        for(var j = 0; j<year_data.length; j++){
            var d = year_data[j];
            prev = value;
            value += self.svgWidth/year_data.length;
            if(s[0] <= prev && value <= s[1])
                selected_year.push(d);
        }

        var start_year = selected_year[0].year;
        var end_year = selected_year[selected_year.length-1].year;

        self.trackLength.start_year = start_year;
        self.trackLength.end_year = end_year;

        self.scaleSlider.start_year = start_year;
        self.scaleSlider.end_year = end_year;
        self.scaleSlider.country = year_data[0].country_id;

        self.wordCloud.start_year = start_year;
        self.wordCloud.end_year = end_year;
        self.wordCloud.country = year_data[0].country_id;

        var req1 = "https://db03.cs.utah.edu:8181/api/country_length_per_year_range/"+selected_year[0].country_id+"/"+selected_year[0].year+"/"+selected_year[selected_year.length-1].year;
        var req2 = "https://db03.cs.utah.edu:8181/api/country_track_year_range/"+selected_year[0].country_id+"/"+selected_year[0].year+"/"+selected_year[selected_year.length-1].year+"?limit=1000&offset=0";
        var req3 = "https://db03.cs.utah.edu:8181/api/artist_tags/"+selected_year[0].country_id+"/"+selected_year[0].year+"/"+selected_year[selected_year.length-1].year+"?limit=100&offset=0";

        d3.queue()
            .defer(d3.json,req1)
            .defer(d3.json,req2)
            .defer(d3.json,req3)
            .await(function(error,length_year_range_data,year_range_table_data, cloud_data){
                if(error) throw error;
                self.tableChart.numTracks = year_range_table_data.length;
                self.trackLength.update(length_year_range_data);
                self.tableChart.update(year_range_table_data, selected_year[0].country_id);
                self.scaleSlider.update(cloud_data);
                self.wordCloud.update(cloud_data, d3.max(cloud_data, function(d){return d.count; }) );
            });
    }

    var width = self.svgWidth;
    var height = self.svgHeight;

    var brush = d3.brushX().extent([[0,height/2-10],[width,height/2+40]]).on("end", brushed);

    self.svg.select(".brush").call(brush.move, null);

    self.svg.selectAll(".brush").data([1]).enter().append("g").attr("class", "brush").call(brush);
};

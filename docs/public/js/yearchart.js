/**
 * Created by nishantagarwal on 11/27/16.
 */
/**
 * Constructor for the Year Chart
 *
 */
function YearChart(trackLength,tableChart) {
    var self = this;

    self.tableChart = tableChart;
    self.trackLength = trackLength;

    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
YearChart.prototype.init = function(){

    var self = this;
    self.margin = {top: 10, right: 20, bottom: 30, left: 20};
    var divyearChart = d3.select("#year-chart");

    self.colorScale = d3.scaleLinear().range(colorbrewer.RdBu["11"]);

    //Gets access to the div element created for this chart from HTML
    self.svgBounds = divyearChart.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.right - self.margin.left;
    self.svgHeight = 100;

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

    // console.log(d3.min(year_data,function(d,i){
    //     return parseInt(d);
    // }));
    //
    // console.log(d3.max(year_data,function(d,i){
    //     return parseInt(d);
    // }));

    self.colorScale.domain([0,max_count]);

    year_data.sort(function(a,b){
        return d3.ascending(parseInt(a.year),parseInt(b.year));
    });

    // console.log('year data '+ year_data[0].year);
    // console.log('year data '+ year_data[year_data.length-1].year);

    self.trackLength.start_year = year_data[0].year;
    self.trackLength.end_year = year_data[year_data.length-1].year;

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
            return self.colorScale(parseInt(d.count));
        });


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

        var req1 = "https://db03.cs.utah.edu:8181/api/country_length_per_year_range/"+selected_year[0].country_id+"/"+selected_year[0].year+"/"+selected_year[selected_year.length-1].year;
        var req2 = "https://db03.cs.utah.edu:8181/api/country_track_year_range/"+selected_year[0].country_id+"/"+selected_year[0].year+"/"+selected_year[selected_year.length-1].year;

        d3.queue()
            .defer(d3.json,req1)
            .defer(d3.json,req2)
            .await(function(error,length_year_range_data,year_range_table_data){
                if(error) throw error;

                self.trackLength.update(length_year_range_data);
                self.tableChart.update(year_range_table_data, selected_year[0].country_id);
            });
    }

    var width = self.svgWidth;
    var height = self.svgHeight;

    var brush = d3.brushX().extent([[0,height/2-10],[width,height/2+40]]).on("end", brushed);

    self.svg.select(".brush").call(brush.move, null);

    self.svg.selectAll(".brush").data([1]).enter().append("g").attr("class", "brush").call(brush);
};
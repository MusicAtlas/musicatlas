/**
 * Created by nishantagarwal on 11/29/16.
 */
/**
 * Constructor for the Track Length
 *
 */
function TrackLength(tableChart, wordCloud) {
    var self = this;
    self.tableChart = tableChart;
    self.wordCloud  = wordCloud;

    self.init();
};


/**
 * Initializes the svg elements required for this chart
 */
TrackLength.prototype.init = function(){

    var self = this;
    self.margin = {top: 10, right: 20, bottom: 30, left: 20};
    var divtrackLength = d3.select("#track-length");

    //self.colorScale = d3.scaleLinear().range(colorbrewer.RdBu["11"]);

    //Gets access to the div element created for this chart from HTML
    self.svgBounds = divtrackLength.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.right - self.margin.left;
    self.svgHeight = 50;

    //creates svg element within the div
    self.svg = divtrackLength.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight);

    self.start_year = 0;
    self.end_year = 0;
    self.country = '';
    self.numTracks = 0;
};


/**
 * Creates a chart with circles representing min and max slider
 */
TrackLength.prototype.update = function(length_data){
    var self = this;

    var max = d3.max(length_data,function(d){ return parseFloat(d.max_length); });
    var min = d3.min(length_data,function(d){ return parseFloat(d.min_length); });

    self.min_length = min;
    self.max_length = max;

    self.wordCloud.min_length = min;
    self.wordCloud.max_length = max;

    //https://bl.ocks.org/mbostock/6452972
    self.lengthScale = d3.scaleLinear()
                        .domain([min,max])
                        .range([self.margin.left,self.svgWidth-20])
                        .nice([0.2,1.0]);

    var slider = self.svg.selectAll(".slider").data([1]);

    slider.exit().remove();

    slider = slider.enter().append("g").classed("slider",true).merge(slider);

    slider.attr("transform", "translate(0," + self.svgHeight / 2 + ")");

    var line = slider.selectAll(".length").data([1]);

    line.exit().remove();

    line = line.enter().append("line").classed("length",true).merge(line);

    line.attr("x1", self.lengthScale.range()[0])
        .attr("x2", self.lengthScale.range()[1]);

    var line_inset = slider.selectAll(".length-inset").data([1]);

    line_inset.exit().remove();

    line_inset = line_inset.enter().append("line").classed("length-inset",true).merge(line_inset);

    line_inset.attr("x1", self.lengthScale.range()[0])
        .attr("x2", self.lengthScale.range()[1]);

    var line_overlay = slider.selectAll(".length-overlay").data([1]);

    line_overlay.exit().remove();

    line_overlay = line_overlay.enter().append("line").classed("length-overlay",true).merge(line_overlay);

    line_overlay.attr("x1", self.lengthScale.range()[0])
        .attr("x2", self.lengthScale.range()[1]);

    var handle = slider.selectAll(".track-slider").data([min,max]);

    handle.exit().remove();

    handle = handle.enter().append("circle").classed("track-slider",true).merge(handle);

    handle.attr("cx",function(d){
           return self.lengthScale(d);
        }).attr('id',function (d) {
            if(d == max)
                return 'max';
            return 'min';
        })
        .attr("r", 9)
        .call(d3.drag()
            .on("start drag", function() {
                var selection = d3.select(this);

                self.setpos(selection,self.lengthScale.invert(d3.event.x));

            })
                .on('end', function(){
                    self.wordCloud.min_length = self.min_length;
                    self.wordCloud.max_length = self.max_length;

                    var req = "https://db03.cs.utah.edu:8181/api/country_track_year_range_length/"+self.country+"/"+self.start_year+"/"+self.end_year+"/"+self.min_length+"/"+self.max_length+"?limit=1000&offset=0";

                    d3.json(req,function(error,year_track_table_data){
                        if(error) throw error;

                        self.tableChart.numTracks = year_track_table_data.length;
                        self.tableChart.update(year_track_table_data, self.country);

                    });
                })
        );

    var slider_ticks = slider.selectAll(".ticks").data([1]);

    slider_ticks.exit().remove();

    slider_ticks = slider_ticks.enter().append("g").classed("ticks",true).merge(slider_ticks);

    var ticks = slider_ticks.selectAll("text").data(self.lengthScale.ticks(20));

    ticks.exit().remove();

    ticks = ticks.enter().append("text").merge(ticks);

    ticks.attr("x", self.lengthScale)
        .attr("y",function(d,i){
            if(i%2 == 0)
                return "18";
            return "-13";
        })
        .attr("text-anchor", "middle")
        .attr("font-size","12px")
        .text(function(d) {
            if(Number(d) === d && d % 1 === 0)
                return d;
            return d.toFixed(1);
        });

};


TrackLength.prototype.setpos = function(selection,pos) {
    var self = this;

    selection.attr("cx", self.lengthScale(pos));
    var display = pos.toFixed(2);

    var selectedId = selection['_groups'][0][0].id;

    if(selectedId == 'max'){
        self.max_length = display;
    }else{
        self.min_length = display;
    }
};

/**
 * Created by nishantagarwal on 11/29/16.
 */
/**
 * Constructor for the Track Length
 *
 */
function ScaleSlider() {
    var self = this;

    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
ScaleSlider.prototype.init = function(){

    var self = this;
    self.margin = {top: 10, right: 20, bottom: 30, left: 20};
    var divscaleSlider = d3.select("#scale-slider");

    //self.colorScale = d3.scaleLinear().range(colorbrewer.RdBu["11"]);

    //Gets access to the div element created for this chart from HTML
    self.svgBounds = divscaleSlider.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.right - self.margin.left;
    self.svgHeight = 50;

    //creates svg element within the div
    self.svg = divscaleSlider.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight);

};

/**
 * Creates a chart with circles representing min and max slider
 */
ScaleSlider.prototype.update = function(cloud_data){
    var self = this;

    //console.log(length_data);
    var max = d3.max(cloud_data,function(d){ return parseFloat(d.count); });
    var min = d3.min(cloud_data,function(d){ return parseFloat(d.count); });

    //console.log(max);
    //console.log(min);


    //https://bl.ocks.org/mbostock/6452972
    var lengthScale = d3.scaleLinear()
                        .domain([min,max])
                        .range([self.margin.left,self.svgWidth-20])
                        .clamp(true);

    var slider = self.svg.selectAll(".slider").data([1]);

    slider.exit().remove();

    slider = slider.enter().append("g").classed("slider",true).merge(slider);

    slider.attr("transform", "translate(0," + self.svgHeight / 2 + ")");

    var line = slider.selectAll(".length").data([1]);

    line.exit().remove();

    line = line.enter().append("line").classed("length",true).merge(line);

    line.attr("x1", lengthScale.range()[0])
        .attr("x2", lengthScale.range()[1]);

    var line_inset = slider.selectAll(".length-inset").data([1]);

    line_inset.exit().remove();

    line_inset = line_inset.enter().append("line").classed("length-inset",true).merge(line_inset);

    line_inset.attr("x1", lengthScale.range()[0])
        .attr("x2", lengthScale.range()[1]);

    var line_overlay = slider.selectAll(".length-overlay").data([1]);

    line_overlay.exit().remove();

    line_overlay = line_overlay.enter().append("line").classed("length-overlay",true).merge(line_overlay);

    line_overlay.attr("x1", lengthScale.range()[0])
        .attr("x2", lengthScale.range()[1]);

    var handle = slider.selectAll(".track-slider").data([max]);

    handle.exit().remove();

    handle = handle.enter().append("circle").classed("track-slider",true).merge(handle);

    handle.attr("cx",function(d){
       return lengthScale(d);
    })
        .attr("r", 9)
        .call(d3.drag()
            //.on("start.interrupt", function() { slider.interrupt(); })
            .on("start drag", function() {
                var selection = d3.select(this);

                setpos(selection,lengthScale.invert(d3.event.x));
            }));

    function setpos(selection,pos) {
        selection.attr("cx", lengthScale(pos));
    }

};

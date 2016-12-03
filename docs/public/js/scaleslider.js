/**
 * Created by nishantagarwal on 11/29/16.
 */
/**
 * Constructor for the Track Length
 *
 */
function ScaleSlider(wordCloud) {
    var self = this;
    self.wordCloud = wordCloud;
    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
ScaleSlider.prototype.init = function(){

    var self = this;
    self.margin = {top: 10, right: 20, bottom: 30, left: 20};

    //Gets access to the div element created for this chart from HTML
    var divscaleSlider = d3.select("#scale-slider");
    self.svgBounds = divscaleSlider.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.right - self.margin.left;
    self.svgHeight = 50;

    //creates svg element within the div
    self.svg = divscaleSlider.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight);

};

/**
 * Creates a chart with circle as slider
 */
ScaleSlider.prototype.update = function(cloud_data){
    var self = this;

    //get min and max of artict track count
    var max = d3.max(cloud_data,function(d){ return parseFloat(d.count); });
    var min = d3.min(cloud_data,function(d){ return parseFloat(d.count); });


    //https://bl.ocks.org/mbostock/6452972
    self.lengthScale = d3.scaleLinear()
                        .domain([min,max])
                        .range([self.margin.left,self.svgWidth-20])
                        .clamp(true);

    //create slider layout
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


    //create circle to slide over range
    var handle = slider.selectAll(".track-slider").data([max]);

    handle.exit().remove();

    handle = handle.enter().append("circle").classed("track-slider",true).merge(handle);

    handle.attr("cx",function(d){
       return self.lengthScale(d);
    })
        .attr("r", 9)
        .call(d3.drag()
            //.on("start.interrupt", function() { slider.interrupt(); })
            .on("start drag", function() {
                var selection = d3.select(this);

                self.setpos(selection,self.lengthScale.invert(d3.event.x));
            })
            .on('end', function(){

                self.wordCloud.updateScale( self.pos);

            })
        );

    //create ticks for slider
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
        .text(function(d) { return d; });

};

/**
 * Set position for slider when dragged
 * @param selection
 * @param pos
 */
ScaleSlider.prototype.setpos = function(selection,pos) {
    var self = this;

    selection.attr("cx", self.lengthScale(pos));
    self.pos = pos;

};

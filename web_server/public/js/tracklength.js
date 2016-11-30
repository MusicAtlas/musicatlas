/**
 * Created by nishantagarwal on 11/29/16.
 */
/**
 * Constructor for the Track Length
 *
 */
function TrackLength() {
    var self = this;

    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
TrackLength.prototype.init = function(){

    var self = this;
    self.margin = {top: 10, right: 20, bottom: 30, left: 20};
    var divyearChart = d3.select("#track-length");

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
 * Creates a chart with circles representing min and max slider
 */
TrackLength.prototype.update = function(){
    var self = this;


};

/**
 * Created by deb on 11/30/16.
 */
/**
 * Constructor for the Genre Word Cloud
 *
 */
function GenreWordCloud() {
    var self = this;

    self.init();

};

/**
 * Initializes the svg elements required for this chart
 */
GenreWordCloud.prototype.init = function(){

    var self = this;

    self.margin = {top: 10, right: 20, bottom: 30, left: 20};

    var divWordCloud = d3_v3.select("#genrecloud");
    self.svgBounds = divWordCloud.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.right - self.margin.left;
    self.svgHeight = self.svgBounds.height - self.margin.top - self.margin.bottom;

    self.svg = divWordCloud.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight);

    self.viz = self.svg.append("g").attr("transform", "translate(" + [self.svgWidth >> 1, self.svgHeight >> 1]  + ")");

    self.layout = d3_v3.layout.cloud()
        .timeInterval(Infinity)
        .size([self.svgWidth, self.svgHeight])
        .fontSize(function(d) {
            return self.fontSize(+d.count);
        })
        .text(function(d) {
            return d.genre;
        })
        .rotate(function(d){
            return (~~(Math.random() * 6) - 3) * 0;
        })
        .on("end", function(tags,bounds){
            self.draw(tags,bounds);
        });

};

/**
 * Draw the genre word cloud
 * @param data
 * @param bounds
 */
GenreWordCloud.prototype.draw = function(data, bounds) {
    var self = this;

    //scale for word cloud
    self.fill = d3_v3.scale.category20b();

    self.scale = bounds ? Math.min(
        self.svgWidth / Math.abs(bounds[1].x - self.svgWidth / 2),
        self.svgWidth / Math.abs(bounds[0].x - self.svgWidth / 2),
        self.svgHeight / Math.abs(bounds[1].y - self.svgHeight / 2),
        self.svgHeight / Math.abs(bounds[0].y - self.svgHeight / 2)) / 2 : 1;

    //selection to enter text in layout
    var text = self.viz.selectAll("text")
        .data(data, function(d) {
            if (d.text == undefined) {
                return '';
            }
            return d.text.toLowerCase();
        });


    text.transition()
        .duration(1000)
        .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .style("font-size", function(d) {
            return d.size + "px";
        });
    var textEnter = text.enter().append("text");

    text.exit().remove();


    textEnter.attr("text-anchor", "middle")
        .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .style("font-size", function(d) {
            return d.size + "px";
        })
        .style("opacity", 1e-6)
        .transition()
        .duration(1000)
        .style("opacity", 1);


    text.style("font-family", function(d) {
            return d.font;
        })
        .style("fill", function(d) {
            return self.fill(d.text.toLowerCase());
        })
        .text(function(d) {
            return d.text;
        });

    self.viz.transition().attr("transform", "translate(" + [self.svgWidth >> 1, self.svgHeight >> 1] + ")scale(" + self.scale + ")");


};

/**
 * Creates a chart with rectangles representing each year
 */
GenreWordCloud.prototype.update = function(tags){

    var self = this;
    self.tags = tags;

    self.layout.font('impact').spiral('archimedean');
    self.fontSize = d3_v3.scale["sqrt"]().range([10, 60]);
    if (tags.length){
        self.fontSize.domain([+tags[tags.length - 1].count || 1, +tags[0].count]);
    }
    self.layout.stop().words(tags).start();

};

/**
 * Update scaling factor for word cloud
 * @param max_value
 */
GenreWordCloud.prototype.updateScale = function(max_value){

    var self = this;
    tags = self.tags;

    max_value =Math.ceil(max_value);
    self.layout.font('impact').spiral('archimedean');
    self.fontSize = d3_v3.scale["linear"]().range([10, 60, 5]);
    if (tags.length){
        self.fontSize.domain([+tags[tags.length - 1].count || 10, max_value, +tags[0].count]);
    }
    self.layout.stop().words(tags).start();

};





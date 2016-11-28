/**
 * Created by nishantagarwal on 11/6/16.
 */

/**
 * Constructor for the ChoroplethMap
 *
 * @param
 */
function ChoroplethMap(track_data,world,names){

    var self = this;
    self.track_data = track_data;
    self.init();
    self.world = world;
    self.names = names;

    self.drawMap();
};

/**
 * Initializes the svg elements required for this chart
 */
ChoroplethMap.prototype.init = function(){
    var self = this;
    self.margin = {top:30, right: 20, bottom: 30, left: 50};
    self.colorScale = d3.scaleLog().range(colorbrewer.Spectral["8"]);

    //Gets access to the div element created for this chart from HTML
    var divchoropleth = d3.select("#choropleth");
    self.svgBounds = divchoropleth.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = self.svgBounds.height;

    //creates svg element within the div
    self.svg = divchoropleth.append("svg")
        .attr("viewBox","0 0 "+self.svgWidth+" "+self.svgHeight)
        .classed("svg-content",true)
        .attr("preserveAspectRatio","xMinYMin");

    self.tooltip = divchoropleth.append("div").classed("tooltip",true);
};

ChoroplethMap.prototype.redraw = function() {
    self.svg.select("g").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

ChoroplethMap.prototype.drawMap =  function() {

    var self = this;

    var topmargin = 10;

    var projection = d3.geoEquirectangular()
        .translate([self.svgWidth/2,self.svgHeight/2 + topmargin])
        .scale(self.svgWidth/9);

    //Learnt from example
    //http://bl.ocks.org/mbostock/3734321
    var path = d3.geoPath()
        .projection(projection);

    var graticule = d3.geoGraticule();

    self.svg.append("g")
        .classed("map",true);

    var map = self.svg.select(".map");

     map.append("path")
         .datum(graticule)
         .attr("class", "grat")
         .attr("fill","none")
         .attr("d", path);

    var countries = topojson.object(self.world, self.world.objects.countries).geometries;

    
    for(var i = 0; i<countries.length; i++) {
        if (countries[i].id == 10){
            continue;
        }
        var c = self.names.filter(function(n) {
            return countries[i].id == n.id;
        })[0];

        map.insert("path", ".grat")
            .datum(countries[i])
            .attr("class", "countries")
            .attr("id",function(){
                if(typeof c === "undefined")
                    return "undefined";
                return c.name;
            })
            .attr("d", path)
            .attr("stroke","grey")
            .style("fill","grey")
            .style("fill-opacity","0.5");

    }
};


ChoroplethMap.prototype.colorDomainArray = function(min, max, n) {
    var result = [];
    if (min > max ){
        t = max;
        max = min;
        min = t;
    }
    var range = max - min;
    for (var i=0; i < n; i++){
        result.push(min  + ((range/n)*(i+1)));
    }
    return result;
};


ChoroplethMap.prototype.tooltipText = function(d){
    var html =  "<h3>" + d.name + "</h3>" +
        "<p>Track Count: " + d.count + "</p>";
    return html
};

ChoroplethMap.prototype.buildTooltip = function(d){
    var self = this;
    self.tooltip.transition()
        .duration(200)
        .style("opacity", .9);

    self.tooltip.html( self.tooltipText(d) );
};

ChoroplethMap.prototype.update = function(){
    var self = this;

    var countries =  self.svg.selectAll(".countries");
    var colorMin = d3.min(self.track_data,function(d){ return d.count;});
    var colorMax = d3.max(self.track_data,function(d){ return d.count;});

    var colorDomain = self.colorDomainArray(colorMin,colorMax,8);

    self.colorScale.domain(colorDomain);

    self.track_data.forEach(function(t){

        var name = "#"+t.country.replace(/('|\.|\]|\[| )/g,"\\$1").trim();
        var country = d3.selectAll(name);

        country.style("fill",function(){
            return self.colorScale(t.count);
        })
            .style("fill-opacity","1")
            .on("mouseover",function(){
                self.buildTooltip( {"name": t.country,"count": t.count } )
            })
            .on("mouseout",function(){
                self.tooltip.transition()
                    .duration(3000)
                    .style("opacity", 0);
            })
            .on("click",function(){
                $('#collapseOne').collapse('hide');
            });
        })
};

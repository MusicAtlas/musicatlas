/**
 * Created by nishantagarwal on 11/6/16.
 */

/**
 * Constructor for the ChoroplethMap
 *
 * @param
 */
function ChoroplethMap(track_data){

    var self = this;
    self.track_data = track_data;
    self.world_data =
    self.init();
    d3.json("public/data/world.json",function(error,data){
        if(error) throw error;
        self.drawMap(data);
    });
};

/**
 * Initializes the svg elements required for this chart
 */
ChoroplethMap.prototype.init = function(){
    var self = this;
    self.margin = {top: 30, right: 20, bottom: 30, left: 50};

    //Gets access to the div element created for this chart from HTML
    var divchoropleth = d3.select("#choropleth");
    self.svgBounds = divchoropleth.node().getBoundingClientRect();
    self.svgWidth = self.svgBounds.width - self.margin.left - self.margin.right;
    self.svgHeight = self.svgBounds.height;

    //creates svg element within the div
    self.svg = divchoropleth.append("svg")
        .attr("width",self.svgWidth)
        .attr("height",self.svgHeight)
};

ChoroplethMap.prototype.redraw = function() {
    self.svg.select("g").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}

ChoroplethMap.prototype.drawMap =  function(world) {

    var self = this;

    var topmargin = +20;
    // var projection = d3.geoMercator()
    var projection = d3.geoEquirectangular()
        .translate([self.svgWidth/2,self.svgHeight/2 + topmargin])
        .scale(self.svgWidth/8);

    //Learnt from example
    //http://bl.ocks.org/mbostock/3734321
    var path = d3.geoPath()
        .projection(projection);

    //var graticule = d3.geoGraticule();

    self.svg.append("g")
        .classed("map",true);

    var map = self.svg.select(".map");

     map.append("path")
    //     .datum(graticule)
         .attr("class", "grat")
         .attr("fill","none")
         .attr("d", path);

    console.log(world);

    var countries = topojson.object(world, world.objects.countries).geometries,
        neighbors = topojson.neighbors(world, countries);

    // var countries = topojson.object(world, world.objects.countries);

    console.log(countries);
    //var countries = countries_data.features;

    for(var i = 0; i<countries.length; i++) {
        //console.log(countries[i].id);
        if (countries[i].id == 10){
            continue;
        }

        map.insert("path", ".grat")
            .datum(countries[i])
            .attr("class", "countries")
            .attr("id",countries[i].name_sort)
            .attr("d", path);

    }
}

ChoroplethMap.prototype.update = function(){
    var self = this;





};

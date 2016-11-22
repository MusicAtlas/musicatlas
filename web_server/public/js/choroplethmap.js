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
    self.init();
    var q = d3.queue()
    q.defer(d3.json,"public/data/world.json")
        .defer(d3.tsv,"public/data/world-country-names.tsv")
        .await(function(error,world,names){
            if(error) throw error;

            self.drawMap(world,names);
        });
};

/**
 * Initializes the svg elements required for this chart
 */
ChoroplethMap.prototype.init = function(){
    var self = this;
    self.margin = {top:30, right: 20, bottom: 30, left: 50};

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

ChoroplethMap.prototype.drawMap =  function(world,names) {

    var self = this;

    var topmargin = 50;
    // var projection = d3.geoMercator()
    var projection = d3.geoEquirectangular()
        .translate([self.svgWidth/2,self.svgHeight/2 + topmargin])
        .scale(self.svgWidth/8);

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

    //console.log(world);
    //console.log(names);

    var countries = topojson.object(world, world.objects.countries).geometries,
        neighbors = topojson.neighbors(world, countries);


    //console.log(countries);

    for(var i = 0; i<countries.length; i++) {
        if (countries[i].id == 10){
            continue;
        }
        var c = names.filter(function(n) { return countries[i].id == n.id; })[0];

        map.insert("path", ".grat")
            .datum(countries[i])
            .attr("class", "countries")
            .attr("id",function(c){
                if(typeof c === "undefined")
                    return "undefined";
                return c.name;
            })
            .attr("d", path)
            .attr("stroke","grey")
            .attr("fill","none");

    }
}

ChoroplethMap.prototype.update = function(){
    var self = this;





};

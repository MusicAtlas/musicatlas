/**
 * Created by nishantagarwal on 11/6/16.
 */

/**
 * Constructor for the ChoroplethMap
 *
 * @param
 */

function ChoroplethMap(track_data,world,names,yearChart,trackLength,tableChart, scaleSlider, wordCloud, genreCloud){

    var self = this;

    //initialize variables
    self.track_data = track_data;
    self.yearChart = yearChart;
    self.tableChart = tableChart;
    self.trackLength = trackLength;
    self.scaleSlider=scaleSlider;
    self.wordCloud=wordCloud;
    self.genreCloud=genreCloud;

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

    //initialize tooltip
    self.tooltip = divchoropleth.append("div").classed("tooltip",true);
};

/**
 * Initializes Map required for interaction
 */
ChoroplethMap.prototype.drawMap =  function() {

    var self = this;

    var topmargin = 10;

    //create map projection
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

    //create map
    var map = self.svg.select(".map");

     map.append("path")
         .datum(graticule)
         .attr("class", "grat")
         .attr("fill","none")
         .attr("d", path);

    //extract geo data to create map
    var countries = topojson.object(self.world, self.world.objects.countries).geometries;

    //create country boundaries
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

/**
 * Creates an array of values for color domain
 * @param min
 * @param max
 * @param n - Length of array required
 * @returns {Array of values for domain}
 */
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

/**
 * Create text html for tooltip
 * @param d
 * @returns {string}
 */
ChoroplethMap.prototype.tooltipText = function(d){
    var html =  "<h3>" + d.name + "</h3>" +
        "<p>Track Count: " + d.count + "</p>";
    return html
};

/**
 * Build the tooltip
 * @param d
 */
ChoroplethMap.prototype.buildTooltip = function(d){
    var self = this;
    self.tooltip.transition()
        .duration(200)
        .style("opacity", .9);

    self.tooltip.html( self.tooltipText(d) );
};

/**
 * Perform all the interactions needed for the chart and others
 */
ChoroplethMap.prototype.update = function(){
    var self = this;

    var countries =  self.svg.selectAll(".countries");
    var colorMin = d3.min(self.track_data,function(d){ return d.count;});
    var colorMax = d3.max(self.track_data,function(d){ return d.count;});

    var colorDomain = self.colorDomainArray(colorMin,colorMax,8);

    self.colorScale.domain(colorDomain);

    self.track_data.forEach(function(t){

        //make tag html search worthy
        var name = "#"+t.country.replace(/('|\.|\]|\[| )/g,"\\$1").trim();
        var country = d3.selectAll(name);

        //attach interactions to all country selections
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
                self.trackLength.country = t.id;

                //load all data needed for other charts
                d3.queue()
                    .defer(d3.json,"https://db03.cs.utah.edu:8181/api/country_track_year/"+t.id)
                    .defer(d3.json,"https://db03.cs.utah.edu:8181/api/country_length_per_year/"+t.id)
                    .defer(d3.json,"https://db03.cs.utah.edu:8181/api/country_track_record/"+t.id+"?limit=1000&offset=0")
                    .defer(d3.json,"https://db03.cs.utah.edu:8181/api/artist_tags/"+ t.id + "?limit=100&offset=0")
                    .defer(d3.json,"https://db03.cs.utah.edu:8181/api/genre_tags/"+ t.id + "?limit=100&offset=0")
                    .await(function(error,year_data,length_data,table_data,cloud_data, genre_data){
                        if(error) throw error;

                        self.yearChart.update(year_data);
                        self.trackLength.update(length_data);
                        self.tableChart.numTracks = t.count;
                        self.yearChart.numTracks = t.count;
                        self.trackLength.numTracks = t.count;
                        self.tableChart.update(table_data, t.id);
                        self.scaleSlider.update(cloud_data);
                        self.wordCloud.update(cloud_data, d3.max(cloud_data, function(d){return d.count; }) );

                        self.genreCloud.update(genre_data);
                        self.tableChart.numTracks = t.count;

                    });
                $('#dashboard_label').html(t.country + " Dashboard");
                $('#collapseOne').collapse('hide');
                $('#collapseTwo').collapse('show');
            });
        })
};

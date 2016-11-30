/**
 * Created by nishantagarwal on 11/27/16.
 */
/**
 * Constructor for the Year Chart
 *
 */
function YearChart() {
    var self = this;

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
YearChart.prototype.update = function(year_data,total_track){
    var self = this;

    //console.log(year_data);

    var max_count = d3.max(year_data,function(d,i){
        return parseInt(d.count);
    });

    self.colorScale.domain([0,max_count]);

    // var total = d3.sum(year_data,function(d,i){
    //     //console.log((i+1)+","+d.count);
    //     return parseInt(d.count);
    // });

    // var widthScale = d3.scaleLinear()
    //     .domain([0,total])
    //     .rangeRound([0,self.svgWidth-self.margin.left]);

    year_data.sort(function(a,b){
        return d3.ascending(parseInt(a.year),parseInt(b.year));
    });


    //console.log(year_data);

    // var group = self.svg.selectAll(".yeargroup").data([1]);
    //
    // group = group.enter().append("g").classed(".yeargroup",true).merge(group);
    //
    // group.attr("transform","translate("+self.margin.left+",0)");

    var stackedbar = self.svg.selectAll(".yearbar").data(year_data);

    stackedbar.exit().remove();

    stackedbar = stackedbar.enter().append("rect")
        .attr("height",30)
        .attr("y",self.svgHeight/2)
        .classed("yearbar",true)
        .merge(stackedbar);


    var width_till_now = 0;
    var prev = 0;

    // stackedbar.attr("x",function(d){
    //
    //     var w = widthScale(parseInt(d.count));
    //
    //     if(width_till_now == 0) {
    //         width_till_now += w;
    //         return 0;
    //     }
    //     else{
    //         width_till_now += prev ;
    //         prev = w;
    //         return width_till_now;
    //     }
    // })
    //     .attr("width", function(d){
    //         var w = widthScale(parseInt(d.count));
    //
    //         if(w == 0)
    //             return 0;
    //         return w-1;
    //     })
    //     .style("fill",function(d){
    //         return "grey";
    //     });

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
            //console.log(self.colorScale(parseInt(d.count)));
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
    }

    var width = self.svgWidth;
    var height = self.svgHeight;

    var brush = d3.brushX().extent([[0,height/2-10],[width,height/2+40]]).on("end", brushed);

    self.svg.select(".brush").call(brush.move, null);

    self.svg.selectAll(".brush").data([1]).enter().append("g").attr("class", "brush").call(brush);
};

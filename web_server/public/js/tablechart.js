/**
 * Created by shweta on 11/29/16.
 */

var cellBuffer = 3;

function TableChart() {
    var self = this;

    self.init();
};

/**
 * Initializes the svg elements required for this chart
 */
TableChart.prototype.init = function(){
    var self = this;
};

/**
 * Creates a chart with circles representing each election year, populates text content and other required elements for the Year Chart
 */

var sortHeaderAscending = true;

var tableElements;

var artist = 'artist_name',
    album = 'release_name',
    gender = 'gender',
    track = 'track_name',
    tracklength = 'length',
    year = 'year',
    language = 'language';

function descending(row_name){

    switch(row_name) {

        case "Track":
            tableElements.sort(function (a, b) {
                return d3.descending(a[track], b[track]);
            });
            break;

        case "Artist":
            tableElements.sort(function (a, b) {
                return d3.descending(a[artist], b[artist]);
            });
            break;

        case "Album":
            tableElements.sort(function (a, b) {
                return d3.descending(a[album], b[album]);
            });
            break;

        case "Year":
            tableElements.sort(function (a, b) {
                return d3.descending(a[year], b[year]);
            });
            break;

        case "Language":
            tableElements.sort(function (a, b) {
                return d3.descending(a[language], b[language]);
            });
            break;
        case "Length":
            tableElements.sort(function (a, b) {
                return d3.descending(a[tracklength], b[tracklength]);
            });
            break;

        default : console.log("Something Went Wrong In Descending!!!!!")
    }

}

function ascending(row_name){

    switch(row_name) {

        case "Track":
            tableElements.sort(function (a, b) {
                return d3.ascending(a[track], b[track]);
            });
            break;

        case "Artist":
            tableElements.sort(function (a, b) {
                return d3.ascending(a[artist], b[artist]);
            });
            break;

        case "Album":
            tableElements.sort(function (a, b) {
                return d3.ascending(a[album], b[album]);
            });
            break;

        case "Year":
            tableElements.sort(function (a, b) {
                return d3.ascending(a[year], b[year]);
            });
            break;

        case "Language":
            tableElements.sort(function (a, b) {
                return d3.ascending(a[language], b[language]);
            });
            break;
        case "Length":
            tableElements.sort(function (a, b) {
                return d3.ascending(a[tracklength], b[tracklength]);
            });
            break;

        default : console.log("Something Went Wrong In Descending!!!!!")
    }
}
var row;
var order;

function sortTable(row_name){
    console.log(row_name);

    if(row == row_name){
        if(order == "ascending"){
            descending(row_name);
            order = "descending";
        }
        else{
            ascending(row_name);
            order = "ascending";
        }
    }
    else{
        row = row_name;
        order = "descending";
        descending(row_name);
    }
    update();
}

var pageNumber = 1;
var recordPerPage = 50;
var country_id ;

TableChart.prototype.createTable = function(table_data, country){

    var self = this;
    tableElements = table_data;
    country_id = country;
    // console.log(tableElements);

    var divtableChart = d3.select("#table-chart");

    // var tableDiv = divtableChart.append("table");
    // tableDiv.attr("id","recordTable");
    //
    // var thead = tableDiv.append("thead"),
    //     tbody = tableDiv.append("tbody");

    var thead = divtableChart.select('table').select('thead');
    var columns =['Track','Artist','Album', 'Length', 'Year', 'Language'];

    var thVar = thead.select('tr')
            .selectAll('th')
            .data(columns);

    var thVarEnter = thVar.enter()
        .append("th");

    thVar.exit().remove();

    thVar = thVarEnter.merge(thVar);

    thVar.text(function (d) {
            return d;
        })
        .append('span')
        .classed('glyphicon glyphicon-sort',true);

    d3.selectAll("th")
        .on("click",function(){
            // console.log(this.innerText);
            sortTable(this.innerText);

        });

    update();
    createButtons();
}

function update(){
    // tableElements = table_data\;

    var trow = d3.select("tbody").selectAll("tr")
        .data(tableElements);

    trow.exit().remove();

    trow = trow.enter()
        .append("tr")
        .merge(trow);


    var cell = trow.selectAll("td")
        .data(function(d){
            // console.log(d);
            return [d[track],d[artist],d[album],d[tracklength],d[year],d[language]];
        });

    cell.exit().remove();

    cell = cell.enter()
        .append("td")
        .merge(cell);

    cell.text(function(d,i){
        // console.log(d);
        // if (i==1)
        //     //search artist in wiki
        //     //return html ref content eg: https://en.wikipedia.org/wiki/Chris_Martin(each space should replace with _ in artist name)
        // if (i==3)
            //search track in youtube
            // return html ref content eg: https://www.youtube.com/results?search_query=jis+desh+me(each word in title with space replaced with +)
        return d;
    });

};

function loadPrevious(){
    var offset = 0;
    if (pageNumber>0) {
      offset = (pageNumber - 1) * recordPerPage;
        pageNumber--;
    }

    // viewdata = data.slice((page-1)*recordPerPage,page*recordPerPage);

    d3.json("http://db03.cs.utah.edu:8181/api/country_track_record/"+country_id+"?limit=20&offset="+offset,function(error,data){
        if(error) throw error;
        tableElements = data;
        update();
    });
}

function loadNext(){
    var offset = (pageNumber) * recordPerPage;
    d3.select('#previous').classed('disabled',false);
    pageNumber++;
    // viewdata = data.slice((page-1)*recordPerPage,page*recordPerPage);
    console.log(pageNumber);

    d3.json("http://db03.cs.utah.edu:8181/api/country_track_record/"+country_id+"?limit=20&offset="+offset,function(error,data){
        if(error) throw error;
        tableElements = data;
        update();
    });
}


function createButtons() {
    // var divButton = d3.select("#page-button");
    //
    // var data = ['previous','next'];
    //
    // var buttonDiv = divButton.selectAll("button")
    //                         .data(data);
    //
    // buttonDiv.exit().remove();
    //
    // buttonDiv.enter()
    //     .append("button")
    //     .merge(buttonDiv);
    //
    // buttonDiv.attr("type","button")
    //     .attr("class","btn btn-default btn-md but")
    //     .attr('id',function (d) {
    //         return d;
    //     });
    //
    // divButton.select('#previous')
    //     .append('span')
    //     .attr('class','glyphicon glyphicon-chevron-left')
    //     .text(function (d){
    //     return d;
    // });
    //
    // divButton.select('#next')
    //     .text(function (d){
    //         return d;
    //     })
    //     .append('span')
    //     .attr('class','glyphicon glyphicon-chevron-right');

    if(pageNumber== 1){
        d3.select('#previous').classed('disabled',true);
    }else{
        d3.select('#previous').classed('disabled',false);
    }
    var previousBtn = d3.select('#previous');
        previousBtn.on('click', loadPrevious);

    var nextBtn = d3.select('#next');
        nextBtn.on('click',loadNext);


}

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

function sortTable(row_name){
    console.log(row_name);

    // if(sortHeaderAscending) {
    //     tableElements.sort(function (a, b) {
    //         console.log(a);
    //         if (row_name.match("Artist")) {
    //             return d3.ascending(a[artist], b[artist]);
    //         }else if (row_name.match("Album")) {
    //             return d3.ascending(a[album], b[album]);
    //         }else if (row_name.match("Track")) {
    //             return d3.ascending(a[track], b[track]);
    //         }else if (row_name.match("Gender")) {
    //             return d3.descending(a[gender], b[gender]);
    //         }else if (row_name.match("Length")) {
    //             return d3.descending(a[tracklength], b[tracklength]);
    //         }else if (row_name.match("Year")) {
    //             return d3.descending(a[year], b[year]);
    //         }else if (row_name.match("Language")) {
    //             return d3.descending(a[language], b[language]);
    //         }
    //     });
    //     sortHeaderAscending = false;
    // }else {
    //     tableElements.sort(function (a, b) {
    //         console.log(a);
    //         if (row_name.match("Artist")) {
    //             return d3.ascending(a[artist], b[artist]);
    //         }else if (row_name.match("Album")) {
    //             return d3.ascending(a[album], b[album]);
    //         }else if (row_name.match("Track")) {
    //             return d3.ascending(a[track], b[track]);
    //         }else if (row_name.match("Gender")) {
    //             return d3.descending(a[gender], b[gender]);
    //         }else if (row_name.match("Length")) {
    //             return d3.descending(a[tracklength], b[tracklength]);
    //         }else if (row_name.match("Year")) {
    //             return d3.descending(a[year], b[year]);
    //         }else if (row_name.match("Language")) {
    //             return d3.descending(a[language], b[language]);
    //         }
    //     });
    // }
    // update();
}
var pageNumber = 1;
var recordPerPage = 50;
var country_id ;

TableChart.prototype.createTable = function(table_data, country){

    var self = this;
    tableElements = table_data;
    country_id = country;
    console.log(tableElements);

    var divtableChart = d3.select("#table-chart");

    var tableDiv = divtableChart.append("table");
    tableDiv.attr("id","recordTable");

    var thead = tableDiv.append("thead"),
        tbody = tableDiv.append("tbody");

    var columns =['Track','Artist','Album', 'Length', 'Year', 'Language'];

    var thVar = thead.append('tr')
            .selectAll('th')
            .data(columns).enter()
            .append('th');

    thVar.text(function (d) {
            return d;
        })
        .append('span')
        .classed('glyphicon glyphicon-sort',true);

    d3.select("thead").select("tr")
        .selectAll("th")
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

    trow = trow.enter()
        .append("tr")
        .merge(trow);

    trow.exit().remove();

    var cell = trow.selectAll("td")
        .data(function(d){
            // console.log(d);
            return [d[track],d[artist],d[album],d[tracklength],d[year],d[language]];
        });

    cell = cell.enter()
        .append("td")
        .merge(cell);

    cell.exit().remove();

    cell.text(function(d,i){
        console.log(d);
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
    var offset = (pageNumber-1) * recordPerPage;
    pageNumber--;
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

    d3.json("http://db03.cs.utah.edu:8181/api/country_track_record/"+country_id+"?limit=20&offset="+offset,function(error,data){
        if(error) throw error;
        tableElements = data;
        update();
    });
}


function createButtons() {
    var divButton = d3.select("#page-button");

    var data = ['previous','next'];

    var buttonDiv = divButton.selectAll("button")
        .data(data)
        .enter()
        .append("button")
        .attr("type","button")
        .attr("class","btn btn-default btn-md but")
        .attr('id',function (d) {
            return d;
        });

    divButton.select('#previous')
        .append('span')
        .attr('class','glyphicon glyphicon-chevron-left')
        .text(function (d){
        return d;
    });

    divButton.select('#next')
        .text(function (d){
            return d;
        })
        .append('span')
        .attr('class','glyphicon glyphicon-chevron-right');

    if(pageNumber== 1){
        d3.select('#previous').classed('disabled',true);
    }else{
        d3.select('#previous').classed('enabled',true);
    }

    d3.select('#previous').on('click',loadPrevious);
    d3.select('#next').on('click',loadNext);


}

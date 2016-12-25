/**
 * Created by shweta on 11/29/16.
 */
/**
 * Constructor for the Table Chart
 *
 */
function TableChart() {
    var self = this;

    self.init();
};

/**
 * Initializes the table elements required for this chart
 */
TableChart.prototype.init = function(){
    var self = this;

    //set variable for creating and manipulating table
    self.offset = 0;
    self.pageNumber = 1;
    self.recordPerPage = 20;

    self.row = '';
    self.order = 'ascending';

    self.artist = 'artist_name',
    self.album = 'release_name',
    self.gender = 'gender',
    self.track = 'track_name',
    self.tracklength = 'length',
    self.year = 'year',
    self.language = 'language';

    self.country = '';
    self.numTracks = 0;
    self.artist_name = '';

    //column headers
    self.columns =['Track','Artist','Album', 'Length', 'Year', 'Language'];

    //button layer hidden
    self.pageButton = d3.selectAll(".pagination_btns");

    self.pagenumupdate = self.pageButton.selectAll("#page-num").append("rect");

    self.pagenumupdate.attr("width",10)
        .attr("height",40)
        .text("1");


    self.pageButton.style("visibility", 'hidden');

    /*Table creation*/
    self.divtableChart = d3.select("#table-chart");

    var thead = self.divtableChart.select('table').select('thead');

    var thVar = thead.select('tr')
        .selectAll('th')
        .data(self.columns);

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
            self.sortTable(this.innerText);
        });

    self.buttonAction();

};

/**
 * Sort the data in descending order
 * @param row_name
 */
TableChart.prototype.descending = function(row_name){
    var self = this;
    switch(row_name) {

        case "Track":
            self.tableElements.sort(function (a, b) {
                return d3.descending(a[self.track], b[self.track]);
            });
            break;

        case "Artist":
            self.tableElements.sort(function (a, b) {
                return d3.descending(a[self.artist], b[self.artist]);
            });
            break;

        case "Album":
            self.tableElements.sort(function (a, b) {
                return d3.descending(a[self.album], b[self.album]);
            });
            break;

        case "Year":
            self.tableElements.sort(function (a, b) {
                return d3.descending(a[self.year], b[self.year]);
            });
            break;

        case "Language":
            self.tableElements.sort(function (a, b) {
                return d3.descending(a[self.language], b[self.language]);
            });
            break;
        case "Length":
            self.tableElements.sort(function (a, b) {
                return d3.descending(a[self.tracklength], b[self.tracklength]);
            });
            break;

        default : console.log("Something Went Wrong In Descending!!!!!")
    }

};

/**
 * Sort the data in ascending order
 * @param row_name
 */
TableChart.prototype.ascending = function(row_name){
    var self = this;
    switch(row_name) {

        case "Track":
            self.tableElements.sort(function (a, b) {
                return d3.ascending(a[self.track], b[self.track]);
            });
            break;

        case "Artist":
            self.tableElements.sort(function (a, b) {
                return d3.ascending(a[self.artist], b[self.artist]);
            });
            break;

        case "Album":
            self.tableElements.sort(function (a, b) {
                return d3.ascending(a[self.album], b[self.album]);
            });
            break;

        case "Year":
            self.tableElements.sort(function (a, b) {
                return d3.ascending(a[self.year], b[self.year]);
            });
            break;

        case "Language":
            self.tableElements.sort(function (a, b) {
                return d3.ascending(a[self.language], b[self.language]);
            });
            break;
        case "Length":
            self.tableElements.sort(function (a, b) {
                return d3.ascending(a[self.tracklength], b[self.tracklength]);
            });
            break;

        default : console.log("Something Went Wrong In Descending!!!!!")
    }
}

/**
 * Sort the data based on the column clicked and handle toggle
 * @param row_name
 */
TableChart.prototype.sortTable = function(row_name){
    var self = this;
    if(self.row == row_name){
        if(self.order == "ascending"){
            self.descending(row_name);
            self.order = "descending";
        }
        else{
            self.ascending(row_name);
            self.order = "ascending";
        }
    }
    else{
        self.row = row_name;
        self.order = "descending";
        self.descending(row_name);
    }
    self.pageNumber=1;
    self.pageButton.select('#next')
        .style('visibility', 'visible');
    self.update(self.tableElements,self.country);
}

/**
 * Create table based on data refresh
 * @param data
 */
TableChart.prototype.tableRowCreate = function(data){
    var self = this;

    //Data rows created
    var trow = d3.select("tbody").selectAll("tr")
        .data(data);

    trow.exit().remove();

    trow = trow.enter()
        .append("tr")
        .merge(trow);

    var cell = trow.selectAll("td")
        .data(function(d){
            return [d[self.track],d[self.artist],d[self.album],d[self.tracklength],d[self.year],d[self.language]];
        });

    cell.exit().remove();

    cell = cell.enter()
        .append("td")
        .merge(cell);

    //add links for artist, album and tracks for user to interact
    cell.html(function(d,i){
        //search link to artist and track

        if (i==0){
            return d + self.getYoutubeLink(d);
        }
        if (i==1){
            return d + self.getWikiLink(d);
        }

        if (i==2){
            return d + self.getLastFMLink(d);
        }

        return d;
    });

    self.pagenumupdate.text(self.pageNumber);
};

/**
 * Replace string
 * @param str
 * @param find
 * @param replace
 * @returns {void|string|XML}
 */
TableChart.prototype.replaceAll = function(str, find, replace) {
    var self = this;
    return str.replace(new RegExp(find, 'g'), replace);
};

/**
 * Create Wiki link for the content
 * @param content
 * @returns {string}
 */
TableChart.prototype.getWikiLink = function(content) {
    var self = this;
    var html ='';
    var link = "https://en.wikipedia.org/wiki/"+self.replaceAll(content," ","_");
    html = "<span style='float: right; margin-right: 20px;'><a href='"+link + "' target='_blank'>  Wiki  </a></span>";
return html;
};

/**
 * Craete Youtube link for the content
 * @param content
 * @returns {string}
 */
TableChart.prototype.getYoutubeLink = function(content) {
    var self = this;
    var html ='';
    var link = "https://www.youtube.com/results?search_query="+self.replaceAll(content," ","+");
    html = "<span style='float: right; margin-right: 40px;'><a href='"+link + "' target='_blank'>  Youtube  </a></span>";
    return html;
};

/**
 * Create LastFM link for the content
 * @param content
 * @returns {string}
 */
TableChart.prototype.getLastFMLink = function(content) {
    var self = this;
    var html ='';
    var link = "http://www.last.fm/search?q="+self.replaceAll(content," ","+");
    html = "<span style='float: right; margin-right: 20px;'><a href='"+link + "' target='_blank'>  last.fm  </a></span>";
    return html;
};

/**
 * Update date based on data received and handle pagination
 * @param table_data
 * @param country
 */
TableChart.prototype.update = function(table_data, country){
    var self = this;
    self.tableElements = table_data;

    //slice data to show few records at a time
    self.country = country;
    var data = self.tableElements.slice((self.pageNumber-1)*self.recordPerPage,self.pageNumber*self.recordPerPage);

    if(data != 0)
        self.tableRowCreate(data);

    self.pageButton.style('visibility','visible');

    if(self.pageNumber == 1) {
        self.pageButton.select('#previous')
            .style('visibility', 'hidden');

    }

    if(self.numTracks <= self.recordPerPage){
        self.pageButton.select('#next')
            .style('visibility', 'hidden');
    }

    if(self.artist_name != ''){
        self.numTracks = self.tableElements.length;
    }

};

/**
 * Handle previous button click
 */
TableChart.prototype.loadPrevious = function() {
    var self = this;

    if (self.pageNumber > 0) {
        self.offset = (self.pageNumber - 1) * self.recordPerPage;
        self.pageNumber--;
    }

    if(self.pageNumber ==1){
        self.pageButton.select('#previous')
            .style('visibility','hidden');
    }
    self.pageButton.select("#next").style('visibility','visible');

    var data = self.tableElements.slice((self.pageNumber - 1) * self.recordPerPage, self.pageNumber * self.recordPerPage);
    if(data != 0)
        self.tableRowCreate(data);
}

/**
 * Handle next button click
 */
TableChart.prototype.loadNext = function(){
    var self = this;
    self.offset = (self.pageNumber) * self.recordPerPage;



    if(self.offset + self.recordPerPage >= self.tableElements.length) {
        var req;
        if(self.artist_name == '')
            req  = "//db03.cs.utah.edu:8181/api/country_track_record/" + self.country + "?limit=200&offset=" + self.tableElements.length;
        else
            req  = "//db03.cs.utah.edu:8181/api/country_track_record_artist/" + self.country + "/"+self.artist_name+"?limit=200&offset=" + self.tableElements.length;

        d3.json(req, function (error, data) {
            if (error) throw error;
            self.tableElements.push.apply(self.tableElements,data);
            self.updateData();
        });
    }
    else{
        self.updateData();
    }
};

TableChart.prototype.updateData = function(){

    var self = this;

    self.pageNumber++;
    var data;

    if((self.pageNumber) * self.recordPerPage <= self.tableElements.length) {
        data = self.tableElements.slice((self.pageNumber - 1) * self.recordPerPage, self.pageNumber * self.recordPerPage);
    }else{
        data = self.tableElements.slice((self.pageNumber - 1) * self.recordPerPage, self.tableElements.length);
        self.pageButton.select("#next").style('visibility','hidden');
    }
    if(data.length != 0)
        self.tableRowCreate(data);


    if(self.pageNumber > 1) {
        self.pageButton.select('#previous')
            .style('visibility', 'visible');
    }

};


/**
 * Set the action for next and previous buttons
 */
TableChart.prototype.buttonAction = function() {
    var self = this;

    var previousBtn = d3.select('#previous');
        previousBtn.on('click', function(){
            self.loadPrevious();
        });

    var nextBtn = d3.select('#next');
        nextBtn.on('click',function(){
            self.loadNext();
        });
}

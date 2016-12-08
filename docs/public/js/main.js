/**
 * Created by nishantagarwal on 11/6/16.
 */
/*
 * Root file that handles instances of all the charts and loads the visualization
 */
(function(){
    var instance = null;

    /**
     * Creates instances for every chart (classes created to handle each chart;
     * the classes are defined in the respective javascript files.
     */
    function init() {
        //Creating instances for each visualization
        $('#collapseTwo').collapse('show');
        var tableChart = new TableChart();

        var wordCloud = new WordCloud(tableChart);
        var trackLength = new TrackLength(tableChart, wordCloud);

        $('.carousel').carousel(1);
        var genreCloud = new GenreWordCloud();
        $('.carousel').carousel(0);

        var scaleSlider = new ScaleSlider(wordCloud);
        var yearChart = new YearChart(trackLength,tableChart, scaleSlider, wordCloud, genreCloud);

        $('#collapseTwo').collapse('hide');

        //load multiple files neede to create map and provide initial interaction
        d3.queue()
            .defer(d3.json,"public/data/world.json")
            .defer(d3.tsv,"public/data/world-country-names.tsv")
            .defer(d3.json,"https://db03.cs.utah.edu:8181/api/country_track")
            .await(function(error,world,names,track_data){
                if(error) {
                    console.log("SSL Error or API server down");
                    d3.select("#errordiv").html('<i>Blank Page Error? <a href="https://db03.cs.utah.edu:8181/api/ssl_auth" target="_blank">  click here and accept SSL </a></i>');
                    throw error;
                }

                var choroplethmap = new ChoroplethMap(track_data,world,names,yearChart,trackLength,tableChart,scaleSlider, wordCloud, genreCloud);
                choroplethmap.update();
            });
    }

    /**
     *
     * @constructor
     */
    function Main(){
        if(instance  !== null){
            throw new Error("Cannot instantiate more than one Class");
        }
    }

    /**
     *
     * @returns {Main singleton class |*}
     */
    Main.getInstance = function(){
        var self = this
        if(self.instance == null){
            self.instance = new Main();

            //called only once when the class is initialized
            init();
        }
        return instance;
    }

    Main.getInstance();
})();
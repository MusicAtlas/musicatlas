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
        var trackLength = new TrackLength();
        var yearChart = new YearChart(trackLength,tableChart);
        var scaleSlider = new ScaleSlider();
        var wordCloud = new WordCloud();
        $('#collapseTwo').collapse('hide');

        d3.queue()
            .defer(d3.json,"public/data/world.json")
            .defer(d3.tsv,"public/data/world-country-names.tsv")
            .defer(d3.json,"public/data/country_track.json")
            .await(function(error,world,names,track_data){
                if(error) throw error;

                var choroplethmap = new ChoroplethMap(track_data,world,names,yearChart,trackLength,tableChart,scaleSlider, wordCloud);
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
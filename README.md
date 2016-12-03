# musicatlas

musicatlas is an interactive visualization to explore the music of the world.

  - Website - https://musicatlas.github.io
  - Screencast - https://youtu.be/afVEXWe9Xfg

##Important Notice

The application first requires you to accept SSL certificate. For that initially when you open the website link, open console and click on the db03.cs.utah.edu link and accept the certificate. Once this is done the rest will work smoothly.

##Source Files

The source files are placed in the docs folder. Each different type of file is present in a subdirectory public. e.g. public/js conatins javascript files.
  - HTML files
    - index.html
    - processbook.html
    - screencast.html
    - about.html
    
  - Javascript files
    - main.js
    - choroplethmap.js
    - tracklength.js
    - wordcloud.js
    - genrewordcloud.js
    - tablechart.js
    - scaleslider.js
    - yearchart.js
   
  - CSS files
    - main.css
   
  - Data Files
    - world.json
    - world-country-names.tsv
    
  - Libraries
    - ColorBrewer
    - topojson
    - jQuery
    - D3v4
    - Bootstrap
    - Modernizr
    - PDFObject

###Features
  - Choroplethmap
  - Year Range, Track Range and Artist based filter
  - Display of most released genre and most popular artist in wordcloud based on year range selected
  - Sortable table with hyperlinks to tracks on youtube, artist on Wikipedia and albums on last.fm

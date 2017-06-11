## Project Neighborhood Map

### Overview
Objective for this project is to allow users to search and add markers to the map. 

When a market is clicked an info window will pop-up and points of interests like (e.g. restaurants, bars, etc)
will be shown around the marker that was clicked. This information helps the user to see what is near the current marker.


Link for this project on [GitHub](https://agapito78.github.io/google-maps-neighborhood/public/index.html).

### Getting started

Please, check below information to run this project. There is an online version published [here](https://agapito78.github.io/frontend-nanodegree-mobile-portfolio/)

#### Part 1: How to run this project

This project is using Gulp to adjust CSS and JS files. Check for instructions to install Gulp [here](http://gulpjs.com/).

After Gulp installation. There are three dependencies that must be installed to run Gulp tasks on this project: gulp-concat, gulp-clean-css and gulp-uglify. Please, check below:

* Installing required Gulp dependencies using NPM.

    ```bash
    npm install --save-dev gulp-concat
    npm install gulp-clean-css --save-dev
    npm install gulp-rename --save-dev
    npm install --save-dev gulp-uglify
    ```

* With dependencies properly installed, execute Gulp command below in order to adjust CSS and JS files.
    ```bash
    gulp dev
    ```
    
* After Gulp finishes his work you will be able to run this app opening "public/index.html" file
    
#### Part 2: How to use the map

Functionalities of the Search Bar

1. Default locations are already included in the list-view.
2. There are two options to filter points of interest around the market:
    * By radius: 500m, 1000m or 1500m
    * Choose the type of information: ATM, Stores, Bars, etc.
3. Add new markers using search bar
    * Before clicking Search button, user should select desired radio and point of interest
    
&nbsp;




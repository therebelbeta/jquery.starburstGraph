/*
  Plugin: jquery.starburstGraph
  Author: Trent Oswald (trento@mediarain.com, trentoswald@therebelrobot.com) for RAIN
  License: MIT
    Copyright (C) 2013 Trent Oswald

    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


  Dependencies: 
    jQuery 1.9+ (home: http://jquery.com/ | cdnjs: //cdnjs.cloudflare.com/ajax/libs/jquery/1.9.1/jquery.min.js)
    easelJS 0.6.1 (home: http://www.createjs.com/#!/EaselJS | documentation: http://createjs.com/Docs/EaselJS/modules/EaselJS.html | cdnjs: //cdnjs.cloudflare.com/ajax/libs/EaselJS/0.6.1/easeljs.min.js)
  
  Example Usage:
    $(document).ready(function(){
      var myOptions = { // for global settings, like origin, starting angle and radii limits
        origin:{
          x: 100,
          y: 100,
        },
        radius:{
          min: 10,
          max: 200
        },
        referenceAngle: 0
      }
      var mySlices = [ // for individual slices of the graph, dynamically organized to equal widths
        {
           fill: '#aa0000',
           stroke: { 
             width: 5
           },
           value: 35
        },
        {
          fill: '#00aa00',
           stroke: { 
             width: 1
           },
           value: 93
        },
        {
           stroke: { 
             width: 1
           },
           value: 0
        }
      ];
       $('#starburstContainer').starburstGraph(myOptions,mySlices,function(){ // keep in mind the element MUST have an ID label for this to work properly
        console.log('done'); // callback function for when the graph is finished drawing
       }).fadeTo('slow',0.5); // and chainable!
    });


*/
(function($) {
  $.fn.starburstGraph = function(params, slices, cb) { // (obj, arr, func)
    /*Global functions for working with radians*/
    function slicePercent(num){
      return num*(Math.PI/200);
    }
    function sliceRadian(num){
      return num/(Math.PI/200);
    }

    /*iterate through all instances of this object*/
    this.each( function() {
      var thisContainer = $(this);
      var thisContainerID = thisContainer.attr('id'); 

      /*make sure there are at least empty sub-objects for the parameters */
      if (!params.origin){
        params.origin = {};
      }
      if (!params.radius){
        params.radius = {};
      }

      /*Set defaults for global graph settings*/
      var graph = {
        origin:{
          x: params.origin.x || 0,
          y: params.origin.y || 0
        },
        radius:{
          min: params.radius.min || 0,
          max: params.radius.max || 0
        },
        referenceAngle: params.referenceAngle || 0
      };

      /*Set up the stage*/
      var starburstContainer = new createjs.Stage(thisContainerID);
      starburstContainer.autoClear = true;

      /*Iterate through slices and draw*/
      var i = 0;
      while (i < slices.length){
        var thisSlice = slices[i];

        /*make sure there are at least empty sub-objects for the parameters */
        if (!thisSlice.stroke){
          thisSlice.stroke = {};
        }

        /*Set defaults for this slice*/
        var slice = {
          fill: thisSlice.fill || '#'+Math.floor(Math.random()*16777215).toString(16),
          stroke: {
            color: thisSlice.stroke.color || '#cccccc',
            width: (typeof thisSlice.stroke.width != 'undefined') ?  thisSlice.stroke.width : 1
          },
          value: thisSlice.value || 0
        };
        var arcOffsetX = 0;
        var arcOffsetY = 0;

        /*ensure the value conforms to the min and max of the graph*/
        if (slice.value < graph.radius.min){
          slice.value = graph.radius.min;   
        }
        else if (slice.value > graph.radius.max){
          slice.value = graph.radius.max;   
        }            
        
        /*calculate radii, slice width, and radians for both points on arc*/
        var arcRadius= slice.value;
        var arcWidth = 360/slices.length; 
        var arcStart = i*arcWidth; // in percent
        arcStart = slicePercent(arcStart)+slicePercent(graph.referenceAngle);
        var arcEnd = arcStart + slicePercent(arcWidth);
        
        /*Draw the segment*/
        
        semiCircle = new createjs.Shape();

        /*switch if stroke is available*/
        if (slice.fill && slice.stroke.width < 1){
          semiCircle
          .graphics
          .beginFill(slice.fill)
          .moveTo(graph.origin.x,graph.origin.y)
          .arc(graph.origin.x, graph.origin.y, arcRadius, arcStart, arcEnd)
          .lineTo(graph.origin.x,graph.origin.y)
          .endFill();
        }
        else if (slice.fill && slice.stroke.width > 0){
          console.log(slice.fill,graph.origin.x, graph.origin.y, graph.origin.x, graph.origin.y, arcRadius, arcStart, arcEnd, graph.origin.x, graph.origin.y );
          semiCircle
          .graphics
          .beginFill(slice.fill)
          .moveTo(graph.origin.x,graph.origin.y)
          .arc(graph.origin.x, graph.origin.y, arcRadius, arcStart, arcEnd)
          .lineTo(graph.origin.x,graph.origin.y)
          .endFill()
          .setStrokeStyle(slice.stroke.width)
          .beginStroke(slice.stroke.color)
          .moveTo(graph.origin.x,graph.origin.y)
          .arc(graph.origin.x, graph.origin.y, arcRadius, arcStart, arcEnd)
          .lineTo(graph.origin.x,graph.origin.y)
          .endStroke();
        }

        /*Add slice to stage and update view*/
        starburstContainer.addChild(semiCircle);
        starburstContainer.update();

        /*increment iteration*/
        i++;
      }
    }).promise().done(function(){
      /*if callback is available, run now*/
      if (cb){
        cb();   
      }
    });
    return this.each(function() {
      /*this is to preserve chainability*/
    });
  }
}(jQuery));
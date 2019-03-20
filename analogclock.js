/*
 * Begat : Original code by many, generic HTML5/Canvas clock example.
 * Date  : 12/30/2014
 * Who   : Sandy Ganz
 *
 * Revisions -
 *
 * 0.0  - 12/30/2014 sjg - Begat
 * 0.6  - 01/01/2015 sjg - Added face background inset to make more 3d like
 * 0.7  - 01/02/2015 sjg - Changed hoursOffset to work agaist date() so calendar updates OK,
 *                         added more comment, removed wastefull variable checks in drawPathFast().
 *                         Beginning of multiple clocks on page
 * 0.8  - 01/04/2015 sjg - Totally broke code in initial attempt to objectify it.
 * 0.9  - 02/23/2015 sjg - Fixed up timer with some hack code. Added static background draw, fixed
 *                         up hand angles and a few other bits. Still Hack, but at least working again.
 * 0.91 - 08/28/2015 sjg - Added wtfpl LICENSE AGREEMENT
 *                         
 *
 * Notes -
 *
 * This was a hack project that I was messing with. The original had poor optimization
 * and was drawing a lot more then needed. Worst was the vector drawing that used
 * a string with the coordinates. These were also changed to regular array for
 * performance. Exposed most setting via options. The default settings for options
 * are very noisy to show functionality, turn stuff off to clean up look!
 *
 * Todo -
 *
 * General code clean and comment. Some possible structural changes to have a 'class'
 * like structure called Clock that keeps things out of the global name space.
 * Rename some of the option variables to be more consistent or shorter (I haven't
 * decided yet).
 *
 * The big ones are make the functions that are specific generic, for example
 * annular ticks, bezels, etc. Right now they are hard coded with positions,
 * sizes, and so on. Oh yeah learn Javascript...
 *
 * Figure out how to create a snap shot of the canvas with all the shading and drawing
 * done once then animate the image back before drawing hands. I think this would
 * be faster at some point, but not sure. Good for an experiment or someone that
 * is a HTML5 badass ;)
 *
 * Oh yeah, a demo page maybe operations guide
 *
 * For many options you can use rgba() or #123456 style color settings.
 *
 * Features (many optional settings too) -
 *
 * Very nice looking HTML 5 / Javascript Clock
 * No incompatible CSS to deal with
 * User selectable Colors,  fonts and sizes for number and most text objects
 * Supports Time offsets from your local time
 * Display UTC as an options
 * Displays user positionable Date in several simple formats
 * Displays user positionable AM/PM indicator window
 * Displays PM 'dot' at above 12
 * Two user selectable text fields, font and position
 * Shaded and non shaded bezel options
 * Two sets of annular tick rings, inner and outer with many options
 * Pie slice lines from center of clock
 * Five Minute Numeric display Option (rotated)
 * Five Minute (offset by 2.5min) display dot
 * Triangle markers at 3, 6, 9, 12
 * 12 O'clock Dot
 * Display of all Large Hour numbers or only 3, 6, 9, 12
 * Sweep second hand or 'Quartz' ticker
 *
 * -------------------------------------------------------------------- 
 * Copyright (C) 2015 Sandy Ganz <sganz@pacbell.net>
 * 
 * This work is free. You can redistribute it and/or modify it under the
 * terms of the Do What The Fuck You Want To Public License, Version 2,
 * as published by Sam Hocevar. See the COPYING file for more details.
 * (see below, yes this is a real license)
 * 
 * -------------------------------------------------------------------- 
 *         DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE 
 *                   Version 2, December 2004 
 *
 * Copyright (C) 2004 Sam Hocevar <sam@hocevar.net>
 * 
 * Everyone is permitted to copy and distribute verbatim or modified 
 * copies of this license document, and changing it is allowed as long 
 * as the name is changed. 
 *
 *           DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE 
 *  TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION 
 *
 * 0. You just DO WHAT THE FUCK YOU WANT TO.
 * 
 * For more information on the license see www.wtfpl.net/faq/
 * -------------------------------------------------------------------- 
 * 
 */


// all paths are CLOSED, and based from the center point of 0,0
// The FIRST element in each array is the contex moveTo for start of path
var pie_path = [
    [-108, -1],
    [108, -1],
    [108, -1],
    [-108, -1]
];
var tri_path = [
    [154, 0],
    [178, -6],
    [178, 6]
];
var inner_tick_head_path = [
    [110, -3],
    [120, -3],
    [120, 3],
    [110, 3]
];
var inner_tick_path = [
    [114, -0.5],
    [120, -0.5],
    [120, 0.5],
    [114, 0.5]
];
var outer_tick_pill_path = [
    [156, -2],
    [180, -2],
    [180, 2],
    [156, 2]
];
var outer_tick_head_path = [
    [180, -3],
    [184, -3],
    [184, 3],
    [180, 3]
];
var outer_tick_major_path = [
    [174, -0.5],
    [184, -0.5],
    [184, 0.5],
    [174, 0.5]
];
var outer_tick_minor_path = [
    [180, -0.3],
    [184, -0.3],
    [184, 0.3],
    [180, 0.3]
];

var sec_hand_path = [
    [-50, 0],
    [-45, -5],
    [-25, -5],
    [-22, -2],
    [22, -2],
    [25, -5],
    [180, 0],
    [25, 5],
    [22, 2],
    [-22, 2],
    [-25, 5],
    [-45, 5]
];

var min_hand_path = [
    [0, 0],
    [1, -2],
    [20, -2],
    [22, -5],
    [122, -5],
    [124, -2],
    [146, -2],
    [168, 0],
    [146, 2],
    [124, 2],
    [122, 5],
    [22, 5],
    [20, 2],
    [1, 2],
    [0, 0],
    [24, 0],
    [24, 2],
    [120, 2],
    [122, 0],
    [120, -2],
    [24, -2],
    [24, 0]
];

var hour_hand_path = [
    [0, 0],
    [1, -3],
    [14, -3],
    [17, -7],
    [97, -7],
    [100, -3],
    [112, -2],
    [134, 0],
    [112, 2],
    [100, 3],
    [97, 7],
    [17, 7],
    [14, 3],
    [1, 3],
    [0, 0],
    [18, 0],
    [21, 3],
    [94, 3],
    [96, 0],
    [94, -3],
    [21, -3],
    [18, 0]
];

function myclock(id) {
    var clk = new Clock(id);
    var clkOpts = clk.getClockOpts(); //cheezeee returns ref to object so now public
    var textOpts = clk.getTextOpts();
    
    clkOpts.smoothTicks = false;
    textOpts.text1 = 'Quartz';
    textOpts.text1Color = '#ff0000';
    textOpts.text1OffsetY= -80;

    textOpts.text2 = 'Chronometer';
    textOpts.text2Font = 'bold italic 20px Georgia';
    clk.redraw();    // force update of background on next tick event
}

function myclock1(id) {
    var clk = new Clock(id);
}

function Clock(id) {

    var bezelOpts = {
    
        // Outer most ring, drawn first, other bezels layer on top
        // These are all size by the RADIUS 250 is the working size of the
        // clock. Bezel operations can be as complex as needed as they are
        // outsize of the animation drawing. Once drawn the do not need
        // refresh
    
        // Simple thickness bezel
        bezel1Draw: false,
        bezel1Color: '#111',
        bezel1Diameter: 250,
    
        // Simple thickness bezel
        bezel2Draw: false,
        bezel2Color: '#aaa',
        bezel2Diameter: 248,
    
        // shaded bezel
        bezel3Draw: true,
        bezel3StartColor: '#555555',
        bezel3StopColor: '#000000',
        bezel3Diameter: 245,
    
        // shaded bezel
        bezel4Draw: false,
        bezel4StartColor: '#ff5555',
        bezel4StopColor: '#ff0000',
        bezel4Diameter: 224,
    
    };
    
    // general clock face options
    var faceOpts = {
        // General face background options, this draws over the bezels
        faceColor: '#ffffff', // background color of the face
        faceDiameter: 220, // diameter of the filled face
        faceInset: true, // simulate depth with shadow
    };
    
    // text display options, coords from center of clock, - is UP, + down
    var textOpts = {
        text1: 'Simplex',
        text1Color: '#ff5555',
        text1Font: '30px Georgia',
        text1OffsetX: 0,
        text1OffsetY: -75,
    
        text2: 'Analog Chronometer',
        text2Color: '#111111',
        text2Font: '20px Georgia',
        text2OffsetX: 0,
        text2OffsetY: 75,
    };
    
    // date display options
    
    var dateOpts = {
        dateTextColor: '#111111',
        dateFont: '22px Georgia',
        dateOffsetX: 0,
        dateOffsetY: 40,
        dateBox: true, // show in inset box
        dateBoxColor: '#ffffff',
        dateUTC: false, // use javascript UTC time
        dateShort: false, // display just date as number  
    };
    
    // Lots of stuff here mainly related to the annular tick rings and
    // other indicators around the rings really should be split up
    
    var tickOpts = {
    
        // triangles at 3, 6, 9 and 12
        tri: true,
        triColor: '#555555',
    
        // pie slices from the center of the clock
        pie: true,
        pieColor: '#dddddd',
        pieLineWidth: 2,
    
        // large hour numbers
        hourNums: true,
        hoursComplete: true, // show 1-12 if true, otherwise just 3, 6, 9 and 12
        hourColor: '#cc0000',
        hourFont: '30pt Georgia',
        hourOffset: 140, // offset from the center of the clock
    
        // inner tick ring
        innerTick: true,
        innerTickHead: true, // draws thick 5 minute markers 
        innerTickColor: '#aaaaaa',
        innerTickHeadColor: '#555555',
    
        // outer tick ring
    
        // draws tick head markers at 5 min marks
        outerTickHead: true,
        outerTickHeadColor: '#ff0000',
    
        // draws think line UNDER the 5 min tick head
        outerTickPill: true,
        outerTickPillColor: '#aaaaaa',
    
        // draws the finest tick marks
        outerTickMinor: true,
        outerTickMinorColor: '#aaaaaa',
    
        // draws the finest tick marks
        outerTickMajor: true,
        outerTickMajorColor: '#444000',
    
        // draws the dot over the 12 o'clock postion
        outer12Dot: true,
        outer12DotColor: '#ff0000',
    
        // draws the outer dots at 2.5min marks
        outerDots: true,
        outerDotsOffset: 195, // offset from the center of the clock  
        outerDotsSize: 3.0, // radius of the dot, fractional OK
        outerDotsColor: '#ff0000',
    
        // outer rotated minute numbers
        outerMinNums: true,
        outerMinNumsOffset: 195, // offset from the center of the clock
        outerMinNumsFont: '12pt Georgia',
        outerMinNumsColor: '#555555',
    };
    
    // general hand options
    var handOpts = {
        secPivot: true, // draws dot over center of hands
        secPivotColor: '#c21',
        secHandColor: '#c21',
        minHandColor: '#222222',
        hourHandColor: '#333333',
    };
    
    // options related to AM/PM indications
    var ampmOpts = {
        ampmDot: true, // show a tranparent dot over the 12 pm position
        amTextColor: '#000000', // AM/PM indicator text color if AM
        pmTextColor: '#000000', // AM/PM indicator text color if PM
        ampmFont: '22px Georgia',
        ampmBox: true, // Show indicator as inset
        amBoxColor: '#ffffff', // color of inset if AM
        pmBoxColor: '#bbbbbb', // color of insert if PM
        ampmOffsetX: 0, // X offset from center of clock 
        ampmOffsetY: -40, // Y offset from center of clock
    };
    
    // General clock options
    var clockOpts = {
        smoothTicks: true, // smooth sweep second hand
        hoursOffset: 0, // offset from current time (Local or UTC), may have some glitches
        useUTC: false, // use UTC as base for time
    };
        
    // instance vars
    var d,ds;
    var scale = 1;
    var interval_id = null;
    var ctx, back_ctx;
    var self = this;
    var interval = 31; //millisecs default for very smooth action, if not using smooth tics can be much higher
    var canvas = document.getElementById(id);
    var refresh = false;
    
    if (!canvas.getContext) {
        alert('Canvas not supported, can\'t draw clock');
        return;
    }
    
    ds = new Date(); // just to set it up
    d = new Date();     // aways pull new date
    
    if (clockOpts.hoursOffset != 0) // Add offset to new time, hopefull works OK with date
        d = new Date(d.getTime() + clockOpts.hoursOffset * 3600000);
    
    // set up pre computed options, and one time drawing that
    // don't get affected by hands or other display changes

    pie_path[3][1] = tickOpts.pieLineWidth - 1;
    pie_path[2][1] = tickOpts.pieLineWidth - 1;

    ctx = canvas.getContext('2d');

    canvas.width = 500 * scale; // base size is all drawn at 500x500
    canvas.height = 500 * scale;

    ctx.scale(scale, scale); // hint to get different sized clocks, adj canvas too
    
    var back_canvas = document.createElement("canvas");

    if (!back_canvas.getContext) {
        alert('Canvas not supported, can\'t draw clock');
        return;
    }

    back_canvas.id = id + '-hidden';
    back_canvas.style.hidden = true;    // not sure if works or needed
    
    var back_ctx = back_canvas.getContext('2d');    
    back_canvas.width = 500;
    back_canvas.height = 500;    
    
    // start and stop functions, must call start() to get clock ticking
    this.start = function() {
        interval_id = setInterval(function() {self.ticker()}, interval);
    }
    
    this.stop = function() {
        if(interval_id != null){
            clearInterval(interval_id);
            interval_id = null;
        }
    }
    
    this.redraw = function() {
        refresh = true;
    }

    this.getClockOpts = function() {
        return clockOpts;
    }

    this.getTextOpts = function() {
        return textOpts;
    }
    
    // called to update clock time from timeout/interval
    this.ticker = function () {
        var h;
        
        // adjust time offset if needed

        d = new Date();     // aways pull new date and time

        if (clockOpts.hoursOffset != 0) // Add offset to new time, hopefull works OK with date
            d = new Date(d.getTime() + clockOpts.hoursOffset * 3600000);

        // get system 
        if (clockOpts.useUTC) h = d.getUTCHours();
        else h = d.getHours();

        // set up the hands and relationships (they are all dependant)
        var m = d.getMinutes();
        var s = d.getSeconds();
        var ms = (clockOpts.smoothTicks) ? d.getMilliseconds() : 0;    // if using quarts like ticks 0 ms
        
        var secAngle = -90 + s * 6 + ms * 0.006;
        var minAngle = -90 + m * 6 + s * 0.1 + ms * 0.0001;
        var hourAngle = -90 + h * 30 + m * 0.5 + s / 120;

        ctx.clearRect(0, 0, 500, 500);        // always clear entire space
        ctx.drawImage(back_canvas, 0, 0);     // draw pre drawn background to top   
        
        // refresh background on hour change, will catch day change too for calendar
        if(ds.getHours() != d.getHours() || refresh)
        {
            ds = d;
            this.drawBackground();                  // refresh the background to catch changes
            ctx.drawImage(back_canvas, 0, 0);        // draw background again
            refresh = false;
        }

        // hand vectors need translation to center, these all draw to the front ctx/canvas
        ctx.translate(250, 250);
        this.drawHourHand(hourAngle, handOpts);
        this.drawMinHand(minAngle, handOpts);
        this.drawSecHand(secAngle, handOpts);
        ctx.translate(-250, -250);
    }

    
    // Draw all background items here. This doesn't get refreshed often, all draw to back ctx
    this.drawBackground = function()
    {
        this.drawBezels(bezelOpts);
        this.drawFace(faceOpts);
        this.drawTicks(tickOpts);
        this.drawText(textOpts);
        this.drawDate(dateOpts);
        this.drawAMPM(ampmOpts);
    }
    
    this.drawInsetBox = function (bk_color, shadow_color, offX, offY, width, height) {
        back_ctx.save();
        back_ctx.beginPath();
        back_ctx.fillStyle = bk_color;
        back_ctx.rect(offX, offY, width, height);
        back_ctx.closePath();
        back_ctx.fill();

        back_ctx.beginPath();
        back_ctx.rect(offX, offY, width, height);
        back_ctx.clip();

        back_ctx.beginPath();
        back_ctx.strokeStyle = shadow_color;
        back_ctx.lineWidth = 4;
        back_ctx.shadowBlur = 5;
        back_ctx.shadowColor = shadow_color;
        back_ctx.shadowOffsetX = 4;
        back_ctx.shadowOffsetY = 2;
        width += 4;
        back_ctx.strokeRect(offX - 2, offY - 2, width, height + 4);
        back_ctx.stroke();
        back_ctx.restore();
    };

    this.drawBezels = function (opts) {
        // Outer most Ring, bezel1Ring
        if (opts.bezel1Draw) {
            back_ctx.beginPath();
            back_ctx.arc(250, 250, opts.bezel1Diameter, 0, 6.2831); //2*pi
            back_ctx.fillStyle = opts.bezel1Color;
            back_ctx.fill();
            back_ctx.closePath();
        }

        // next thin ring
        if (opts.bezel2Draw) {
            back_ctx.beginPath();
            back_ctx.arc(250, 250, opts.bezel2Diameter, 0, 6.2831); //2*pi
            back_ctx.fillStyle = opts.bezel2Color;
            back_ctx.fill();
            back_ctx.closePath();
        }

        var gx1, gy1, gx2, gy2, g;

        if (opts.bezel3Draw) {
            gx1 = 127; // 250 + 246 * Math.cos(4 / 3 * Math.PI);
            gy1 = 35; // 250 + 246 * Math.sin(4 / 3 * Math.PI)
            gx2 = 373; // 250 + 246 * Math.cos(1 / 3 * Math.PI);
            gy2 = 463; // 250 + 246 * Math.sin(1 / 3 * Math.PI);
            g = back_ctx.createLinearGradient(gx1, gy1, gx2, gy2);
            g.addColorStop(0, opts.bezel3StartColor); // outer ring reflect
            g.addColorStop(1, opts.bezel3StopColor); // outer ring dark

            //  outer ring
            back_ctx.beginPath();
            back_ctx.arc(250, 250, opts.bezel3Diameter, 0, 6.2831); //2*pi
            back_ctx.fillStyle = g;
            back_ctx.fill();
            back_ctx.closePath();
        }

        if (opts.bezel4Draw) {
            gx1 = 138; // 250 + 224 * Math.cos(4 / 3 * Math.PI);
            gy1 = 56; // 250 + 224 * Math.sin(4 / 3 * Math.PI)
            gx2 = 362; // 250 + 224 * Math.cos(1 / 3 * Math.PI);
            gy2 = 326; // 250 + 224 * Math.sin(1 / 3 * Math.PI);
            g = back_ctx.createLinearGradient(gx1, gy1, gx2, gy2);

            // inner ring
            g.addColorStop(0, opts.bezel4StartColor); // outer ring reflect
            g.addColorStop(1, opts.bezel4StopColor); // outer ring dark
            back_ctx.beginPath();
            back_ctx.arc(250, 250, opts.bezel4Diameter, 0, 6.2831); //2*pi
            back_ctx.fillStyle = g;
            back_ctx.fill();
            back_ctx.closePath();
        }
    }

    this.drawFace = function (opts) {
        // background face, usally redrawn OVER bezels, and MUST
        back_ctx.beginPath();
        back_ctx.arc(250, 250, opts.faceDiameter, 0, 6.2831); //2*pi
        back_ctx.fillStyle = opts.faceColor;
        back_ctx.closePath();
        back_ctx.fill();

        // create a shaded area to simulate 3D shadow
        if (opts.faceInset) {
            back_ctx.save();

            back_ctx.beginPath();
            back_ctx.arc(250, 250, opts.faceDiameter, 0, 6.2831); //2*pi
            back_ctx.clip();

            back_ctx.beginPath();
            back_ctx.strokeStyle = 'black';
            back_ctx.lineWidth = 6;
            back_ctx.shadowBlur = 10;
            back_ctx.shadowColor = 'black';
            back_ctx.shadowOffsetX = 4;
            back_ctx.shadowOffsetY = 1;
            back_ctx.arc(250, 250, opts.faceDiameter + 3, 0, 6.2831); //2*pi
            back_ctx.stroke();
            back_ctx.restore();
        }
    }

    this.drawText = function (opts) {
        // clock text
        back_ctx.beginPath();
        back_ctx.textAlign = 'center';
        back_ctx.textBaseline = 'middle';

        back_ctx.font = opts.text1Font;
        back_ctx.fillStyle = opts.text1Color;
        back_ctx.fillText(opts.text1, 250 + opts.text1OffsetX, 250 + opts.text1OffsetY);

        back_ctx.font = opts.text2Font;
        back_ctx.fillStyle = opts.text2Color;
        back_ctx.fillText(opts.text2, 250 + opts.text2OffsetX, 250 + opts.text2OffsetY);

        back_ctx.fill();
        back_ctx.closePath();
    };

    this.drawDate = function (opts) {
        back_ctx.save();
        if (opts.dateUTC) {
            if (opts.dateShort) datestr = d.getUTCDate();
            else datestr = 'UTC : ' + d.getUTCDate() + '-' + d.getUTCMonth() + '-' + d.getUTCFullYear();
        } else if (opts.dateShort) datestr = d.getDate();
        else datestr = d.toDateString();

        back_ctx.font = opts.dateFont;
        width = back_ctx.measureText(datestr).width + 14;

        if (false && opts.dateBoxShadow && opts.dateBox) {
            back_ctx.shadowColor = '#aaaaaa';
            back_ctx.shadowBlur = 10;
            back_ctx.shadowOffsetX = 3;
            back_ctx.shadowOffsetY = 3;
        }

        if (opts.dateBox) {

            this.drawInsetBox(opts.dateBoxColor, 'black', 250 + opts.dateOffsetX - width / 2, 250 + opts.dateOffsetY - 15, width, 30);
        }
        back_ctx.restore();

        back_ctx.font = opts.dateFont;

        back_ctx.beginPath();
        back_ctx.textAlign = 'center';
        back_ctx.textBaseline = 'middle';
        back_ctx.fillStyle = opts.dateTextColor;
        back_ctx.fillText(datestr, 250 + opts.dateOffsetX, 250 + opts.dateOffsetY);
        back_ctx.fill();
        back_ctx.closePath();
    }

    this.drawAMPM = function (opts) {
        if (d.getHours() > 11) {
            ampmstr = 'PM';
            pm = true;
        } else {
            ampmstr = 'AM';
            pm = false;
        }

        back_ctx.font = opts.ampmFont;
        width = back_ctx.measureText(ampmstr).width + 10;

        back_ctx.save();

        if (opts.ampmBox) {
            background = (pm) ? opts.pmBoxColor : opts.amBoxColor;
            shadow = 'black';
            this.drawInsetBox(background, shadow, opts.ampmOffsetX + 250 - width / 2, 250 + opts.ampmOffsetY - 15, width, 30);
        }

        back_ctx.restore();

        if (opts.ampmDot && pm) {
            // 12 o'clock dot PM Dot

            back_ctx.beginPath();
            back_ctx.fillStyle = 'rgba(0,0,0,.50)';
            back_ctx.arc(250, 55, 10, 0, 6.2831); //2*pi
            back_ctx.closePath();
            back_ctx.fill();
        }

        back_ctx.font = opts.ampmFont;

        back_ctx.beginPath();
        back_ctx.textAlign = 'center';
        back_ctx.textBaseline = 'middle';
        back_ctx.fillStyle = (pm) ? opts.pmTextColor : opts.amTextColor;

        back_ctx.fillText(ampmstr, 250 + opts.ampmOffsetX, 250 + opts.ampmOffsetY);
        back_ctx.closePath();
        back_ctx.fill();
    }

    this.drawTicks = function (opts) {
        var lbl, x, y, i;

        back_ctx.translate(250, 250);

        // inner pie slices
        if (opts.pie) {
            this.drawPathBk(pie_path, opts.pieColor, 0);
            this.drawPathBk(pie_path, opts.pieColor, 30);
            this.drawPathBk(pie_path, opts.pieColor, 60);
            this.drawPathBk(pie_path, opts.pieColor, 90);
            this.drawPathBk(pie_path, opts.pieColor, 120);
            this.drawPathBk(pie_path, opts.pieColor, 150);
        }

        // triangle tics

        if (opts.tri) {
            this.drawPathBk(tri_path, opts.triColor, 0);
            this.drawPathBk(tri_path, opts.triColor, 90);
            this.drawPathBk(tri_path, opts.triColor, 180);
            this.drawPathBk(tri_path, opts.triColor, -90);
        } // outer ticks

        if (opts.outerTickPill) {
            this.drawPathBk(outer_tick_pill_path, opts.outerTickPillColor, 30);
            this.drawPathBk(outer_tick_pill_path, opts.outerTickPillColor, 60);
            this.drawPathBk(outer_tick_pill_path, opts.outerTickPillColor, 120);
            this.drawPathBk(outer_tick_pill_path, opts.outerTickPillColor, 150);
            this.drawPathBk(outer_tick_pill_path, opts.outerTickPillColor, -30);
            this.drawPathBk(outer_tick_pill_path, opts.outerTickPillColor, -60);
            this.drawPathBk(outer_tick_pill_path, opts.outerTickPillColor, -120);
            this.drawPathBk(outer_tick_pill_path, opts.outerTickPillColor, -150);

            if (!opts.tri) // no triangles, draw ticks in those slots too
            {
                this.drawPathBk(outer_tick_pill_path, opts.outerTickPillColor, 0);
                this.drawPathBk(outer_tick_pill_path, opts.outerTickPillColor, 90);
                this.drawPathBk(outer_tick_pill_path, opts.outerTickPillColor, 180);
                this.drawPathBk(outer_tick_pill_path, opts.outerTickPillColor, 270);
            }
        }

        // Hour Numbers
        if (opts.hourNums) {
            for (i = -60; i < 300; i += 30) {
                // large hour numbers

                if (!opts.hoursComplete) if (!(i == 270 || i == 180 || i == 90 || i == 0)) continue;

                lbl = '' + Math.round(i / 30 + 3);
                x = opts.hourOffset * Math.cos(i * 0.017453); // Math.PI / 180.0);
                y = opts.hourOffset * Math.sin(i * 0.017453); // Math.PI / 180.0);

                back_ctx.save();
                back_ctx.translate(x, y);
                back_ctx.font = opts.hourFont;
                back_ctx.textAlign = 'center';
                back_ctx.textBaseline = 'middle';
                back_ctx.fillStyle = opts.hourColor;
                back_ctx.fillText(lbl, 0, 0);
                back_ctx.restore();
            }
        }

        if (opts.outer12Dot) {
            // 12 o'clock dot
            back_ctx.beginPath();
            back_ctx.arc(0, -195, 4, 0, 6.2831); //2*pi
            back_ctx.fillStyle = opts.outer12DotColor;
            back_ctx.fill();
            back_ctx.closePath();
        }

        for (i = 0; i < 360; i += 30) {
            // outer tick pills
            if (opts.outerTickHead) this.drawPathBk(outer_tick_head_path, opts.outerTickHeadColor, i);

            // inner tick pills
            if (opts.innerTickHead) this.drawPathBk(inner_tick_head_path, opts.innerTickHeadColor, i);

            // outer small numbers
            if (opts.outerMinNums) {
                lbl = '' + Math.round(i / 6 + 15);
                if (lbl == '60') // show zero if no dot 
                if (opts.outer12Dot) lbl = '';
                else lbl = '0';

                if (lbl == '65') lbl = '5'; //hack
                if (lbl == '70') lbl = '10'; //hack

                x = opts.outerMinNumsOffset * Math.cos(i * 0.017453);
                y = opts.outerMinNumsOffset * Math.sin(i * 0.017453);

                back_ctx.save();
                back_ctx.translate(x, y);
                back_ctx.rotate((i + 90 - (i > 0 && i < 180 ? 180 : 0)) * 0.017453);
                back_ctx.font = opts.outerMinNumsFont;
                back_ctx.textAlign = 'center';
                back_ctx.textBaseline = 'middle';
                back_ctx.fillStyle = opts.outerMinNumsColor;
                back_ctx.fillText(lbl, 0, 0);
                back_ctx.restore();
            }

            // small dots between small numbers
            if (opts.outerDots) {
                back_ctx.beginPath();
                x = opts.outerDotsOffset * Math.cos((i + 15) * 0.017453);
                y = opts.outerDotsOffset * Math.sin((i + 15) * 0.017453);
                back_ctx.arc(x, y, opts.outerDotsSize, 0, 6.2831); //2*pi
                back_ctx.fillStyle = opts.outerDotsColor;
                back_ctx.fill();
                back_ctx.closePath();
            }

            // outiner ring tics, major, minor, inner ring with smart backfill for missing ticks

            for (var j = 0; j < 25; j += 6) {
                if (j != 0 || !(opts.outerTickHead || opts.outerTickPill)) // fill in major ticks if head or pills not drawn
                {
                    // major outer ring
                    if (opts.outerTickMajor) this.drawPathBk(outer_tick_major_path, opts.outerTickMajorColor, i + j);
                }

                if (j != 0 || !opts.innerTickHead) // if not drawing tick heads and inner ticks enabled fill them in too
                {
                    // inner ring major 
                    if (opts.innerTick) this.drawPathBk(inner_tick_path, opts.innerTickColor, i + j);
                }

                if (opts.outerTickMinor) // fine ticks, back fill if majors are not drawn
                {
                    var k = (opts.outerTickMajor) ? 1.5 : 0;
                    for (; k < 5; k += 1.5)
                    this.drawPathBk(outer_tick_minor_path, opts.outerTickMinorColor, i + j + k);
                }
            }
        }

        back_ctx.translate(-250, -250);
    }

    this.drawSecHand = function (ang, opts) {
        this.drawPathFr(sec_hand_path, opts.secHandColor, ang);

        if (opts.secPivot) {
            ctx.beginPath();
            ctx.arc(0, 0, 8, 0, 6.2831); //2*pi
            ctx.fillStyle = opts.secPivotColor;
            ctx.fill();
            ctx.closePath();
        }
    }

    this.drawMinHand = function (ang, opts) {
        this.drawPathFr(min_hand_path, opts.minHandColor, ang);
    }

    this.drawHourHand = function (ang, opts) {
        this.drawPathFr(hour_hand_path, opts.hourHandColor, ang);
    }

    // Draws on the front layer (hands typically)   
    this.drawPathFr = function (path, fill, ang) {
        ctx.save();
        ctx.rotate(ang * 0.017453); // Math.PI / 180.0);
        ctx.beginPath();
        ctx.moveTo(path[0][0], path[0][1]);

        for (i = 1; i < path.length; i++)
        ctx.lineTo(path[i][0], path[i][1]);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.restore();
    };

    this.drawPathBk = function (path, fill, ang) {
        back_ctx.save();
        back_ctx.rotate(ang * 0.017453); // Math.PI / 180.0);
        back_ctx.beginPath();
        back_ctx.moveTo(path[0][0], path[0][1]);

        for (i = 1; i < path.length; i++)
        back_ctx.lineTo(path[i][0], path[i][1]);
        back_ctx.closePath();
        back_ctx.fillStyle = fill;
        back_ctx.fill();
        back_ctx.restore();
    };

    /// one time code for the clock

    this.drawBackground();    // create background that usually is static
    
    if (clockOpts.useUTC) dateOpts.useUTC = clockOpts.useUTC;
    
    this.ticker();    // force initial
    this.start();    // start it up by default
} // Clock

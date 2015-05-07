'use strict';

var _ = require('underscore'),
    Promise = require('promise'),
    blur = require('ndarray-gaussian-filter'),
    pool = require('ndarray-scratch');

var imgUtils = require('../src/utils/image-conversion.js'),
    samples = require('../src/utils/samples.js'),
    visualUtils = require('../src/utils/testing.js'),
    testUtils = require('../src/utils/test-utils.js'),
    GuassianPyramid = require('../src/websift/guassian-pyramid.js'),
    OctaveSpace = require('../src/websift/octave-space'),
    detector = require('../src/websift/detector.js'),
    orientation = require('../src/websift/orientation.js'),
    descriptor = require('../src/websift/descriptor.js'),
    sift = require('../src/websift/websift.js'),
    siftUtils = require('../src/websift/utils.js');


var smallComet = 'Colour_image_of_comet.jpg',
    bigComet = 'Comet_on_5_September_2014.jpg',
    smallpic = '/home/sheep/Code/Project/web-sfm/tests/images/ibzi0xiqN0on8v.jpg';


function vectorTest(){

    var lena = imgUtils.rgb2gray(require('lena'));
    var lenaG = siftUtils.cacheGradient(lena);
    var width = lena.shape[0];
    var height = lena.shape[1];
    /** @type OrientedFeature */
    var f = {
        row: height*Math.random(),
        col: width*Math.random(),
        octave: 0,
        scale: 3,
        layer: 1,
        orientation: 1
    };

    var v = descriptor.getVector(lenaG, f);

    console.log(v.join(','));


}

vectorTest();

function orientationTest(){
    var lena = imgUtils.rgb2gray(require('lena'));
    var gradient = siftUtils.cacheGradient(lena);
    var f = { row: 400.6, col: 417.3, scale: 1, octave: 0, layer: 1 };
    var directions = orientation.getOrientations(gradient, f);
    console.log(directions);
}

//orientationTest();

function descroptorTest(){
    var lena = imgUtils.rgb2gray(require('lena'));
    var scale = { img: lena, sigma: 1.6 };
    var f = { row: 150.6, col: 301.3, octave: 0, layer: 1, orientation: 1 };
    var des = descriptor.getDescriptor(scale, f);
    console.log(des.vector);
}

//descroptorTest();


function fulltest(img) {

    sift.forEachDetected(img, function(scale, detectedF){
        if (isNotEdge(scale, detectedF)) {
            console.log('detected');
        }
    });

}

//fulltest(imgUtils.rgb2gray(require('lena')));

function pyramidTest(index){

    var features = [],
        all = [];

    samples
        .promiseImage(index)
        .then(function(img){

            sift.forEachDetected(img, function(scale, detectedF){
                var factor = Math.pow(2, detectedF.octave);
                var f = { row: factor*detectedF.row, col: factor*detectedF.col };
                all.push(f);
                if (isNotEdge(scale, detectedF)) {
                    features.push(f);
                    console.log('detected');
                }
            });

            return Promise.all([
                visualUtils.promiseVisualPoints('/home/sheep/Code/sift.png', index, features),
                visualUtils.promiseVisualPoints('/home/sheep/Code/sift-all.png', index, all)
            ]);

        });
}



function testExternal(filePath){

    var features = [];

    testUtils.promiseImage(filePath)
        .then(function(img){
            sift.forEachDetected(img, function(scales, detectedF){
                console.log('detected');
                var factor = Math.pow(2, detectedF.octave),
                    f = { row: factor*detectedF.row, col: factor*detectedF.col };
                features.push(f);
            });
            return testUtils.promiseVisualPoints('/home/sheep/Code/sift.png', filePath, features);
        });
}

function testGradient(path){
    return testUtils.promiseImage(path)
        .then(function(img){
            var cache = siftUtils.cacheGradient(img),
                width = img.shape[0],
                height = img.shape[1],
                buffer = pool.malloc([width, height]),
                ratio = 1;
            var r, c;
            for (r=0; r<height; r++) {
                for (c=0; c<width; c++) {
                    buffer.set(c, r, ratio*cache.get(c, r, 0));
                }
            }
            testUtils.promiseSaveNdarray('/home/sheep/Code/gradient.png', buffer);
        });
}


//pyramidTest(10);
//pyramidtest();
//testExternal(samples.getImagePath(1));
//testExternal('/home/sheep/Code/Project/web-sfm/demo/Leuven-City-Hall-Demo/images/000.png');
//testExternal('/home/sheep/Downloads/comet-demo/' + smallComet);
//testExternal('/home/sheep/Downloads/comet-demo/' + bigComet);
//testExternal(smallpic);
//testExternal(samples.getImagePath(3));
//testGradient('/home/sheep/Downloads/comet-demo/' + smallComet);

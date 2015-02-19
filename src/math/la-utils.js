'use strict';

var _ = require('underscore'),
    la = require('sylvester'),
    Matrix = la.Matrix,
    Vector = la.Vector,
    numeric = require('numeric');

//===================================================


/**
 * ATA of dense matrix without create transpose matrix, more efficient
 * @param {Matrix} A
 * @returns Matrix
 */
module.exports.denseATA = function(A){
    // todo A.transpose().x(A)
    return A.transpose().x(A);
};


/**
 * ATA of sparse matrix without create transpose matrix, more efficient
 * @param {SparseMatrix} A
 * @returns SparseMatrix
 */
module.exports.sparseATA = function(A){
    // todo A.transpose().x(A)
};


/**
 * ATA without create transpose matrix, more efficient, a shortcut
 * @param {Matrix|SparseMatrix} A
 * @returns Matrix|SparseMatrix
 */
module.exports.ATA = function(A){
    return A.isSparse ? exports.sparseATA(A) : exports.denseATA(A);
};


/**
 * get skewed matrix equivalent as cross product
 * @param v - 3d vector
 */
module.exports.crossVector = function(v){
    return Matrix.create([
        [ 0      , -v.e(3) , v.e(2) ],
        [ v.e(3) , 0       , -v.e(1)],
        [ -v.e(2), v.e(1)  , 0      ]
    ]);
};


/**
 * max of abs
 * @param {Matrix} m
 * @returns number
 */
module.exports.matrixInfiniteNorm = function(m){

    var row, col, cursor,
        rows = m.rows(),
        cols = m.cols(),
        max = -Infinity;

    for (row=1; row<=rows; row++) {
        for (col=1; col<=cols; col++) {
            cursor = Math.abs(m.e(row, col));
            if (cursor > max) {
                max = cursor
            }
        }
    }

    return max;

};


/**
 * max of abs
 * @param {Vector} v
 * @returns number
 */
module.exports.vectorInfiniteNorm = function(v){

    var max = -Infinity;

    v.each(function(x){
        var cursor = Math.abs(x);
        if (cursor > max) {
            max = cursor;
        }
    });

    return max;

};

/**
 * @param {Matrix} m
 * @returns {{U: Matrix, S: Vector, V: Matrix}}
 */
module.exports.svd = function(m){
    var usv = numeric.svd(m.elements);
    return {
        U: Matrix.create(usv.U),
        S: Vector.create(usv.S),
        V: Matrix.create(usv.V)
    };
};


/**
 * Shortcut for least mean square solve of Ax=0 using SVD (Normalized)
 * @param {Matrix} A
 * @returns {Vector}
 */
module.exports.svdSolve = function(A){

    var solve = numeric.svd(A.elements),
        V = Matrix.create(solve.V);

    return V.col(A.cols());

};


/**
 * flatten a matrix into a vector
 * @param {Matrix} m
 * @returns Vector
 */
module.exports.flattenMatrix = function(m){
    return Vector.create(
        _.flatten(m.elements)
    );
};


/**
 * Inflate a flatten matrix back to matrix
 * @param {Vector} v
 * @param {int} rows
 * @param {int} cols
 * @returns Matrix
 */
module.exports.inflateVector = function(v, rows, cols){

    if (rows*cols !== v.elements.length) {
        throw 'dimensions does not match, can not inflate!';
    }

    return Matrix.create(
        _.range(rows).map(function(row){
            return v.elements.slice(row*cols, row*cols+cols);
        })
    );

};


/**
 * Norm2 normalization
 * @param {Matrix} m
 * @returns Matrix
 */
module.exports.normalizedMatrix = function(m){

    var row, col, cursor,
        rows = m.rows(),
        cols = m.cols(),
        memo = 0;

    for (row=1; row<=rows; row++) {
        for (col=1; col<=cols; col++) {
            cursor = m.e(row, col);
            memo += cursor*cursor;
        }
    }

    return m.x(1/Math.sqrt(memo));

};


/**
 *
 * @param {Feature} f1
 * @param {Feature} f2
 * @returns {Number}
 */
module.exports.getFeatureDistance = function(f1, f2){

    var index, cursor,
        vector1 = f1.vector,
        vector2 = f2.vector,
        memo = 0,
        range = f1.vector.length;

    for (index=0; index<range; index++) {
        cursor = vector1[index] - vector2[index];
        memo += cursor*cursor;
    }

    return memo;

};
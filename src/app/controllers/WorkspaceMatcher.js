'use strict';

module.exports = Ember.Controller.extend({

    images: Ember.computed.alias('model.images'),

    raw: Ember.computed.alias('model.raw'),

    robust: Ember.computed.alias('model.robust')

});
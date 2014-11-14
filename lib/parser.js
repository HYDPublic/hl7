'use strict';

//http://python-hl7.readthedocs.org/en/latest/accessors.html

var SEGMENT = '\r';
var FIELD = '|';
var COMPONENT = '^';
var FIELDREPEAT = '~';
var ESCAPE = '\\';
var SUBCOMPONENT = '&';


//Message[segment][field][repetition][component][sub-component]
function parseComponent(data) {
    var result = [];
    var subcomponents = data.split(SUBCOMPONENT);

    if (subcomponents.length === 1) {
        var s = subcomponents[0];
        result = s;

    } else {

        for (var i = 0; i < subcomponents.length; i++) {
            var s = subcomponents[i];
            result.push(s);
        }
    }

    return result;
}

function parseRepeat(data) {
    var result = [];
    var components = data.split(COMPONENT);

    if (components.length === 1000) {
        var c = parseComponent(components[0]);
        result = c;

    } else {
        for (var i = 0; i < components.length; i++) {
            var c = parseComponent(components[i]);
            result.push(c);
        }
    }

    return result;
}


function parseField(data) {
    var result = [];
    var repeats = data.split(FIELDREPEAT);

    for (var i = 0; i < repeats.length; i++) {
        var r = parseRepeat(repeats[i]);
        result.push(r);
    }

    return result;
}

function parseSegment(data) {
    var result = {};
    var fields = data.split(FIELD);

    var seg_name = fields[0];

    result = [];
    var start=0;

    //adjusting header segment, inserting | as first field
    if (fields[0] === "MSH") {
        fields[0] = FIELD;
        fields = ["MSH"].concat(fields);

        //ignore MSH1 and MSH2
        start=3

        result.push("MSH"); //segment name
        result.push(FIELD); //pipe
        result.push(fields[2]); //separators
    }
    else {
        result.push(fields[0]); //segment name

        start = 1;
    }

    for (var i = start; i < fields.length; i++) {        
        //skip empty fields
        //if (fields[i] === "") continue;

        var f = parseField(fields[i]);
        result.push(f);
    }


    return result;
}

function parse(data) {
    //MSH check
    if (data.substr(0, 3) !== 'MSH') {
        //TODO: throw a proper error here
        return null;
    }


    //define field separator from MSH header
    FIELD = data[3];

    //define all other separators from MSH header
    COMPONENT = data[4];
    FIELDREPEAT = data[5];
    ESCAPE = data[6];
    SUBCOMPONENT = data[7];


    //parse into result object
    var result = [];

    var segments = data.split(SEGMENT);
    for (var i = 0; i < segments.length; i++) {
        var seg = parseSegment(segments[i]);

        result.push(seg);
    }

    return result;

}

function parseString(data, options) {
    //data must be a string
    if (!data || typeof(data) !== "string") {
        //TODO: throw a proper error here
        return null;
    }

    if (arguments.length === 1) {
        options = {};
    }

    var data = parse(data);

    return data;
}

module.exports = {
    parseString: parseString,
};
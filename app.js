const fs = require("fs");
const Handlebars = require("handlebars");
const moment = require("moment");
const { argv } = require('node:process');
const { homedir } = require('os');
const path = require('path');

Handlebars.registerHelper("toString", function (json) {
    return JSON.stringify(json, null, 4);
});

Handlebars.registerHelper("countTest", function (num) {
    return num + 1;
});

Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
    return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
});

function render(filename, data) {
    var source = fs.readFileSync(filename, "utf8").toString();
    var template = Handlebars.compile(source);
    var output = template(data);
    return output;
}

function getDuration(res) {
    const startTime = res.startedAt;
    const endTime = res.timestamp;
    return moment
        .duration(moment.utc(endTime).diff(moment.utc(startTime)))
        .asMilliseconds();
}

function getData(file) {
    const summary = JSON.parse(fs.readFileSync(file, "utf8"));
    const duration = getDuration(summary);
    return { "summary": summary, "duration": duration };
}

var data = getData("./data/Medici Service.postman_test_run.json");

const result = render("./views/main.hbs", data);

const getDirName = require("path").dirname;

function writeFile(path, contents, cb) {
    fs.mkdir(getDirName(path), { recursive: true }, function (err) {
        if (err) return cb(err);
        fs.writeFile(path, contents, cb);
    });
}

const getOutputPath = function () {
    const key = '-outputPath=';
    const found = argv.find((item) => item.indexOf(key) === 0);
    if (found) {
        return found.replace(key, '');
    }

    return path.join(homedir(), 'postman-report.html');
};

const outputPath = getOutputPath();
writeFile(outputPath, result, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Output file is in: ', outputPath)
    }
});

// Command: node app.js -outputPath="path/to/the/file/output.html"

var spawn = require('child_process').spawn;
var checkInterval = 5 * 60 * 1000; // check plurks per 5 mins
var lastCheckTime = null;
var lastCheckHours = null;
var lastCheckMins = null;

function checkPlurks() {
    var plurks = require('./plurks.json');
    var now = new Date();
    var nowHours = now.getMinutes();
    var nowMins = now.getMinutes();
    for(var i in plurks) {
        var plurkTime = plurks[i].daily.split(':');
        var plurkHours = parseInt(plurkTime[0], 10);
        var plurkMins = parseInt(plurkTime[1], 10);
        if(nowHours < plurkHours) continue;
        else if(nowHours === plurkHours && nowMins < plurkMins) continue;
        if(lastCheckTime !== null) {
            if(lastCheckHours > plurkHours) continue;
            else if(lastCheckHours === plurkHours && lastCheckMins > plurkMins) continue;
        }
        plurk(plurks[i]);
        return;
    }
    lastCheckTime = now;
    lastCheckHours = nowHours;
    lastCheckMins = nowMins;
}
function plurk(p) {
    var child = spawn('node', 
            ['./headlurk.js'], 
            {
                stdio: 'inherit', 
                env: {
                    'plurks': [p]
                }
            });
    child.on('close', function(code) {
            console.log('child process exited (code: ' + code + ', content: ' + p.content + ')');
            });
}

checkPlurks();
setInterval(checkPlurks, checkInterval);


var spawn = require('child_process').spawn;
var checkInterval = 10 * 60 * 1000;
var lastCheckTime = null;
var lastCheckHours = null;
var lastCheckMins = null;

function checkPlurks() {
    var plurks = require('./plurks.json');
    var now = new Date();
    var nowHours = now.getHours();
    var nowMins = now.getMinutes();
    for(var i in plurks) {
        var plurkTime = plurks[i].daily.split(':');
        var plurkHours = parseInt(plurkTime[0], 10);
        var plurkMins = parseInt(plurkTime[1], 10);
        if(nowHours < plurkHours) continue;
        else if(nowHours === plurkHours && nowMins < plurkMins) continue;
        if(lastCheckTime !== null) {
            if(lastCheckHours > plurkHours) continue;
            else if(lastCheckHours === plurkHours && lastCheckMins >= plurkMins) continue;
        }
        plurk(plurks[i]);
    }
    lastCheckTime = now;
    lastCheckHours = nowHours;
    lastCheckMins = nowMins;
    delete require.cache[__dirname + '/plurks.json'];
}
function plurk(p) {
    console.log('child process is created for content: ' + p.content);
    var child = spawn('node', 
            ['./headlurk.js'], 
            {
                stdio: 'inherit', 
                env: {
                    'plurks': JSON.stringify([p])
                }
            });
    child.on('close', function(code) {
            console.log('child process exited (code: ' + code + ', content: ' + p.content + ')');
            });
}

checkPlurks();
setInterval(checkPlurks, checkInterval);


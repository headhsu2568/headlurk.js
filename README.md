hEaDlurk.js
===========

#### v1.0

Automatically Daily Plurk via Plurk OAuth API 2.0

Quick Start
-----------
* Install required modules: [node-fibers](https://github.com/laverdet/node-fibers), [node-oauth](https://github.com/ciaranj/node-oauth)

        npm install fibers oauth

* Register a pair of Plurk APP(consumer) key & secret at [here](http://www.plurk.com/PlurkApp/register)

* Edit [config.json](https://github.com/headhsu2568/headlurk.js/blob/master/config.json)

* Edit [plurks.json](https://github.com/headhsu2568/headlurk.js/blob/master/plurks.json) ([example here](https://github.com/headhsu2568/headlurk.js/blob/master/examples/plurks.json))

* Fire !

        node daemon.js

Run hEaDlurk.js Forever !
-------------
* Install [forever](https://github.com/nodejitsu/forever) module
 
        sudo npm install forever -g

* Fire it forever !

        forever start -al forever.log -e err.log -o out.log daemon.js

<br />
- - -
###### by _Yen-Chun Hsu_ #######
- - -

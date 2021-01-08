const cluster = require('cluster'),
    isDebug = !__dirname.startsWith('/var/www/'),
    clusterFile = cluster.isMaster ? './config/cluster.master' : './config/cluster.worker';
require(clusterFile)(cluster, isDebug);
module.exports = (cluster, isDebug) => {
    const fs = require('fs'),
        path = require('path'),
        package = require('../package.json');
    const imageInfoPath = path.dirname(require.main.filename) + '/imageInfo.txt';

    const workers = {},
        numWorkers = isDebug ? 2 : require('os').cpus().length;
    for (let i = 0; i < numWorkers; i++) {
        const worker = cluster.fork({ enableInit: i == 0 });
        worker.status = 'running';
        worker.version = package.version;
        worker.imageInfo = fs.existsSync(imageInfoPath) ? fs.readFileSync(imageInfoPath, 'utf-8') : '';
        worker.createdDate = new Date();
        workers[worker.process.pid] = worker;
    }
    console.log(` - The ${package.title} is ` + (isDebug ? `debugging on http://localhost:${package.port}` : `running on ${package.rootUrl}`));
    console.log(` - Worker${workers.length >= 2 ? 's' : ''} ${Object.keys(workers)} ${workers.length >= 2 ? 'are' : 'is'} online.`);

    const workersChanged = () => {
        const listWorkers = Object.values(workers);
        let items = listWorkers.map(worker => ({
            pid: worker.process.pid,
            status: worker.status,
            version: worker.version,
            imageInfo: worker.imageInfo,
            createdDate: worker.createdDate
        }));
        listWorkers.forEach(worker => {
            try {
                !worker.isDead() && worker.send({ type: 'workersChanged', workers: items });
            } catch (error) {
                console.log('Error', error)
            }
        });
    }
    workersChanged();

    // Listen from WORKER ---------------------------------------------------------------------------------------------
    cluster.on('online', (worker) => {
        worker.on('message', message => {
            if (message.type == 'refreshState') {
                Object.values(workers).forEach(worker => worker.process.pid != message.workerId && worker.send(message));
            } else if (message.type == 'createWorker') {
                const targetWorker = cluster.fork();
                targetWorker.status = 'running';
                targetWorker.version = package.version;
                targetWorker.imageInfo = fs.existsSync(imageInfoPath) ? fs.readFileSync(imageInfoPath, 'utf-8') : '';
                targetWorker.createdDate = new Date();
                workers[targetWorker.process.pid] = targetWorker;
                workersChanged();
            } else if (message.type == 'resetWorker') {
                const resetWorker = (targetWorker) => {
                    targetWorker.status = 'resetting';
                    targetWorker.send({ type: message.type });
                };

                if (message.workerId) {
                    resetWorker(workers[message.workerId]);
                    workersChanged();
                } else {
                    Object.values(workers).forEach(worker => resetWorker(worker));
                }
            } else if (message.type == 'shutdownWorker') {
                const targetWorker = workers[message.workerId];
                targetWorker.status = 'shutdown';
                targetWorker.send({ type: message.type });
                workersChanged();
            }
        });
    });

    cluster.on('exit', (worker, code, signal) => {
        console.log(` - Worker #${worker.process.pid} died with code: ${code}, and signal: ${signal}. Starting a new worker!`);

        const status = workers[worker.process.pid].status;
        delete workers[worker.process.pid];
        if (status == 'resetting' || status == 'running') {
            worker = cluster.fork();
            worker.status = 'running';
            worker.version = package.version;
            worker.imageInfo = fs.existsSync(imageInfoPath) ? fs.readFileSync(imageInfoPath, 'utf-8') : '';
            worker.createdDate = new Date();
            workers[worker.process.pid] = worker;
        }

        workersChanged();
    });
};
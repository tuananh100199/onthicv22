module.exports = (cluster, isDebug) => {
    const fs = require('fs'),
        path = require('path'),
        appConfig = require('../package.json'),
        appConfigPath = path.join(__dirname, '../package.json'),
        imageInfoPath = path.join(__dirname, '../imageInfo.txt');

    const workers = {},
        numWorkers = isDebug ? 2 : require('os').cpus().length;
    for (let i = 0; i < numWorkers; i++) {
        const primaryWorker = i == 0;
        const worker = cluster.fork({ primaryWorker });
        worker.primaryWorker = primaryWorker;
        worker.status = 'running';
        worker.version = appConfig.version;
        worker.imageInfo = fs.existsSync(imageInfoPath) ? fs.readFileSync(imageInfoPath, 'utf-8') : '';
        worker.createdDate = new Date();
        workers[worker.process.pid] = worker;
    }
    console.log(` - The ${appConfig.title} is ` + (isDebug ? `debugging on http://localhost:${appConfig.port}` : `running on ${appConfig.rootUrl}`));
    console.log(` - Worker${workers.length >= 2 ? 's' : ''} ${Object.keys(workers)} ${workers.length >= 2 ? 'are' : 'is'} online.`);

    const workersChanged = () => {
        const listWorkers = Object.values(workers);
        let items = listWorkers.map(worker => ({
            pid: worker.process.pid,
            primaryWorker: worker.primaryWorker,
            status: worker.status,
            version: worker.version,
            imageInfo: worker.imageInfo,
            createdDate: worker.createdDate
        }));
        listWorkers.forEach(worker => {
            try {
                !worker.isDead() && worker.send({ type: 'workersChanged', workers: items });
            } catch (error) {
                console.log('Error', error);
            }
        });
    };
    workersChanged();

    // Listen from WORKER ---------------------------------------------------------------------------------------------
    cluster.on('online', (worker) => {
        worker.on('message', message => {
            if (message.type == 'createWorker') {
                const targetWorker = cluster.fork();
                targetWorker.primaryWorker = false;
                targetWorker.status = 'running';
                targetWorker.version = JSON.parse(fs.readFileSync(appConfigPath)).version;
                targetWorker.imageInfo = fs.existsSync(imageInfoPath) ? fs.readFileSync(imageInfoPath, 'utf-8') : '';
                targetWorker.createdDate = new Date();
                workers[targetWorker.process.pid] = targetWorker;
                workersChanged();
            } else if (message.type == 'resetWorker') {
                const targetWorker = workers[message.workerId];
                targetWorker.status = 'resetting';
                targetWorker.send({ type: message.type });
                workersChanged();
            } else if (message.type == 'shutdownWorker') {
                const targetWorker = workers[message.workerId];
                targetWorker.status = 'shutdown';
                targetWorker.send({ type: message.type });

                delete workers[message.workerId];
                const listWorkers = Object.values(workers);
                listWorkers.length && listWorkers[0].send({ type: 'setPrimaryWorker' });
                workersChanged();
            }
        });
    });

    cluster.on('exit', (worker, code, signal) => {
        console.log(` - Worker #${worker.process.pid} died with code: ${code}, and signal: ${signal}. Starting a new worker!`);
        if (code != 4) {
            const { primaryWorker, status } = workers[worker.process.pid];
            delete workers[worker.process.pid];
            if (status == 'resetting' || status == 'running') {
                worker = cluster.fork({ primaryWorker });
                worker.primaryWorker = primaryWorker;
                worker.status = 'running';
                worker.version = JSON.parse(fs.readFileSync(appConfigPath)).version;
                worker.imageInfo = fs.existsSync(imageInfoPath) ? fs.readFileSync(imageInfoPath, 'utf-8') : '';
                worker.createdDate = new Date();
                workers[worker.process.pid] = worker;
            }
        }

        workersChanged();
    });
};
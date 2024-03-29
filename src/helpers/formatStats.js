const moment = require('moment');

const formatStats = (stats) => {
    let cpuDelta = stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage,
        systemDelta = stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage,
        cpu = (cpuDelta / systemDelta * 100) / stats.cpu_stats.online_cpus,
        ram = stats.memory_stats.usage / stats.memory_stats.limit * 100;
    return {
        ram: parseFloat(ram >= 0 ? ram.toFixed(2) : -1),
        cpu: parseFloat(cpu >= 0 ? cpu.toFixed(2) : -1),
        read: moment(stats.read).valueOf(),
    };
};

module.exports = formatStats;
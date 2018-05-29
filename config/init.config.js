const path = require('path');
module.exports = [{
        srcPath: path.resolve(__dirname, '../clients/echarts.min.js'),
        initPath: path.resolve(__dirname, '../clients/echarts.config.js'),
        type: 'echarts'
    },
    {
        srcPath: path.resolve(__dirname, '../clients/highcharts.min.js'),
        initPath: path.resolve(__dirname, '../clients/highcharts.config.js'),
        type: 'highcharts'
    },
]
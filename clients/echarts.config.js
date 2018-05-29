(function (window) {
    let option =window.chart.options;
    var myChart = window.echarts.init(document.getElementById('container'), null, {
        renderer: 'svg'
    });
    myChart.setOption(option);
})(this);
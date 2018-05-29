(function (window) {
    let option = window.chart.options;
    console.log(option);
    window.Highcharts.chart('container', option);
})(this)
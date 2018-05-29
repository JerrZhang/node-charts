NodeChart 是一个基于puppeteer的Node生成chart 图片的库，简单易用，扩展方便，内置了echarts 和 highcharts两种类型的图表库，使用者可根据自身需求灵活添加，配置非常方便。

## 安装使用

```bash
npm install --save node-charts
```

## 使用教程

### 使用内置的图表

1. echarts 实例

```javascript
const NodeCharts = require('node-charts');
let nc = new NodeCharts();

let option = {
    title: {
        text: 'ECharts 入门示例'
    },
    tooltip: {},
    legend: {
        data:['销量']
    },
    xAxis: {
        data: ["衬衫","羊毛衫","雪纺衫","裤子","高跟鞋","袜子"]
    },
    yAxis: {},
    series: [{
        name: '销量',
        type: 'bar',
        data: [5, 20, 36, 10, 10, 20]
    }]
};
nc.render(option,(err,data)=>{
    fs.writeFileSync('test.png',data);
})

```
1. highcharts 实例
```javascript
let options = {

    title: {
        text: '2010 ~ 2016 年太阳能行业就业人员发展情况'
    },
    subtitle: {
        text: '数据来源：thesolarfoundation.com'
    },
    yAxis: {
        title: {
            text: '就业人数'
        }
    },
    legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle'
    },
    plotOptions: {
        series: {
            label: {
                connectorAllowed: false
            },
            pointStart: 2010
        }
    },
    series: [{
        name: '安装，实施人员',
        data: [43934, 52503, 57177, 69658, 97031, 119931, 137133, 154175]
    }, {
        name: '工人',
        data: [24916, 24064, 29742, 29851, 32490, 30282, 38121, 40434]
    }, {
        name: '销售',
        data: [11744, 17722, 16005, 19771, 20185, 24377, 32147, 39387]
    }, {
        name: '项目开发',
        data: [null, null, 7988, 12169, 15112, 22452, 34400, 34227]
    }, {
        name: '其他',
        data: [12908, 5948, 8105, 11248, 8989, 11816, 18274, 18111]
    }],
    responsive: {
        rules: [{
            condition: {
                maxWidth: 500
            },
            chartOptions: {
                legend: {
                    layout: 'horizontal',
                    align: 'center',
                    verticalAlign: 'bottom'
                }
            }
        }]
    }
}

nc.render(options, (err, data) => {
    console.log(err);
    fs.writeFileSync('test.h.png', data);
}, {
    chartType: 'highcharts',
    waitfor: 1000
});
```

nc.render(options,callback,config),其中option为图表库渲染需要的配置项，callback中处理图片信息data 为buffer类型，config 主要包含两项内容{
    type:''//图表类型,默认为echarts
    waitfor:0//等待渲染时间，默认为0
}

## 图表库扩展

如果内置图表无法满足或者不适合项目需求，可以添加外部图表库进来，配置也比较简单，首先需要在node项目根路径下创建nodechart.config.js 然后配置其中内容：
```javascript 
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
```

导出内容可以为对象和数组两种类型，主要参数说明：

srcPath:图表库文件

initPath:图表库调用初始化脚本文件

type:图表类型（唯一标识）比如echarts 、highcharts，推荐使用图表库名称

如echarts 初始化脚本文件配置如下：

```javascript   
(function (window) {
    //从window.chart中拿到图表需要的配置信息
    //约定container 为 容器ID
    let option =window.chart.options;
    var myChart = window.echarts.init(document.getElementById('container'), null, {
        renderer: 'svg'
    });
    myChart.setOption(option);
})(this);
```

## Q&A

欢迎 issue



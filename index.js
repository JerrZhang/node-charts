const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const EventEmitter = require('events').EventEmitter;
const initConfig = require('./config/init.config');

module.exports = class NodeCharts extends EventEmitter {
    constructor() {

        super();
        this.config = this.initConfig();

    }

    initConfig() {

        let externalConfig = this.tryReadExternalConfig() || [];

        return [
            ...initConfig,
            ...externalConfig
        ]
    }

    tryReadExternalConfig() {
        //
        let appRoot = '../../nodechart.config.js';
        try {
            if (fs.existsSync(appRoot)) {
                let externalConfig = require(appRoot);
                if (Array.isArray(externalConfig)) {
                    return externalConfig;
                } else {
                    return [externalConfig];
                }
            }
        } catch (error) {
            console.log(error);
        }

    }

    getConfigByChartType(chartType) {
        return this.config.find(c => c.type === chartType);
    }

    async render(chartOptions, callback, opts) {
        let defaultOpts = {
            chartType: 'echarts',
            waitfor: 0
        }

        opts = Object.assign(defaultOpts, opts)

        let {
            chartType,
            waitfor
        } = opts;

        let chartConfig = this.getConfigByChartType(chartType);




        callback = callback || function () {
            console.log('you should define callback function');
            return;
        }
        const browser = await puppeteer.launch({
            args: ['--no-sandbox'],
            ignoreHTTPSErrors: true,
            headless:false
        });
        const page = await browser.newPage();
        try {
            //对echarts的处理，其它可忽略
            Object.assign(chartOptions, {
                animation: false //禁用动画，否则截图时可能动画还没执行结束
            });

            //读取内容
            let content = fs.readFileSync(path.resolve(__dirname, './index.html'));

            //读取模板
            await page.setContent(content.toString());


            //使用svg 模式渲染，性能会高一些
            await page.evaluate((chartOptions, opts) => {
                window.chart = {
                    options: chartOptions,
                    config: opts
                };

            }, chartOptions, opts);
            //echart 主题本版本暂时不支持
            await page.addScriptTag({
                path: chartConfig.srcPath

            });
            await page.addScriptTag({
                path: chartConfig.initPath
            });

            if (opts.waitfor) {
                await page.waitFor(opts.waitfor);
            }


            let $el = await page.$('#container');
            let buffer = await $el.screenshot({
                type: 'png'
            });


            callback(null, buffer);

        } catch (error) {
            callback(error, null);
        } finally {
            await page.close();
            await browser.close();
        }

    }
}


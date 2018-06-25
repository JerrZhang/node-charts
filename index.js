const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const EventEmitter = require('events').EventEmitter;
const initConfig = require('./config/init.config');

module.exports = class NodeCharts extends EventEmitter {
    constructor() {

        super();
        this.config = this.initConfig();
        this.externalCfgPath = ''; //外部配置文件路径

    }

    setExternalConfPath(externalCfgPath) {
        this.externalCfgPath = externalCfgPath;
    }

    initConfig() {

        let externalConfig = this.tryReadExternalConfig() || [];

        return [
            ...initConfig,
            ...externalConfig
        ]
    }

    tryReadExternalConfig() {
        // issue 1 bug fixed
        let appRoot = this.externalCfgPath || '../../nodechart.config.js';
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
            ignoreHTTPSErrors: true
            // headless:false
        });
        const page = await browser.newPage();
        try {
            //对echarts的处理，其它可忽略
            Object.assign(chartOptions, {
                animation: false //禁用动画，否则截图时可能动画还没执行结束
            });

            //读取内容
            let containerElement = '<div id="container" style="width: 600px;height:400px;"></div>';
            if (opts.renderTo) {
                containerElement = opts.renderTo;
            }
            let content = `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <meta http-equiv="X-UA-Compatible" content="ie=edge">
                <title>chart</title>
            </head>
            <body>
                ${containerElement}
            </body>
            </html>`

            //读取模板
            await page.setContent(content);


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

            if (waitfor) {
                await page.waitFor(waitfor);
            }


            let $el = await page.$('#container');
            let buffer = await $el.screenshot({
                type: 'png'
            });

            this.emit('data', buffer);
            callback(null, buffer);

        } catch (error) {
            callback(error, null);
            this.emit('error', error);
        } finally {
            await page.close();
            await browser.close();
        }

    }
}
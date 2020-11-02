/**
 * 爬取boss直聘岗位信息
 */

const superagent = require('superagent') // 引入第三方包
const cheerio = require('cheerio')
const fs = require('fs-extra');
const config = require('./config');

// 常量
const G_TOTAL_LIMIT = 300;
const G_OFFSET = 30;
const G_REQUEST_TIMEOUT = 20000;
let G_JOB_NUMS = 0;
let G_CITY_NAME = '';
let G_POSITION_NAME = '';

// 解析命令行参数
if (process.argv.length === 4) {
    G_CITY_NAME = process.argv[2].trim();
    G_POSITION_NAME = process.argv[3].trim();

} else {
    console.log('命令行输入有误，请阅读readme后重试');
    return false;
}

const boss = {
    resolveData: function (city_name = '', position_name = '') {
        if (!city_name) {
            console.log('城市名不能为空');
            return false; 
        }

        if (!position_name) {
            console.log('岗位信息不能为空');
            return false; 
        }

        // 判断城市是否在配置中
        let city_id = '';
        let is_match = false;
        let city_list = [];

        config.bossConfig.cityConfig.forEach(item => {
            if (item.name == city_name) {
                city_id = item.code;
                is_match = true;
            }

            city_list.push(item.name)
        })

        if (!is_match) {
            console.log('目前仅支持以下城市的岗位爬取：', city_list.join(', '));
            return false;
        }

        this.getHtmlInfo({
            position_name: position_name,
            city_id: city_id,
            city_name: city_name
        })

    },
    getHtmlInfo: function (data) {
        data = Object.assign({page: 1}, data)
        let encode_position_name = encodeURI(data.position_name);

        console.log(`正在爬取${data.city_name} ${data.position_name} 第${data.page}页数据`);

        // 处理当前页数，若已经超过数量时，则停止爬取
        if (G_OFFSET * data.page >= G_JOB_NUMS && data.page != 1 ) {
            console.log('当前爬取的数量已超过岗位数，任务结束')
            return;
        }
        
        let url = `https://www.zhipin.com/c${data.city_id}/?query=${encode_position_name}&page=${data.page}`

        superagent
        .get(url)
        .set(config.bossConfig.headerOptions) 
        .end((err, res) => {
            if (err) {
                console.log('err', err);
                return {
                    result: -1,
                    res_info: '获取失败'
                }

            } else {

                this.dataHandler(res, data)

            }
        })
        
    },
    // 处理数据
    dataHandler: function (info, params = {}) {
        
        let _this = this;
        let $ = cheerio.load(info.text);
        //需要处理的数据
        let job_list = [];

        let job_list_ele = $('div.job-list');

        // 处理页数
        if (params.page == 1) {
            let job_tab_ele = job_list_ele.find('div.job-tab');

            G_JOB_NUMS = job_tab_ele.attr() ? (job_tab_ele.attr()['data-rescount'] ? parseInt(job_tab_ele.attr()['data-rescount']) : 0) : 0;
            console.log('当前岗位总数量为：', G_JOB_NUMS)
        }

        job_list_ele.find('li').each((index, item) => {
            let item_ele = $(item);
            let job_name_ele = item_ele.find('.job-name a');
            let job_name_ele_attr = job_name_ele.attr() || {};
            let job_area_ele = item_ele.find('span.job-area');
            let company_info_ele = item_ele.find('div.company-text h3 a');
            let salary_ele = item_ele.find('div.job-limit span.red');
            let job_append_info_ele = item_ele.find('div.info-append');

            let job_name = job_name_ele.text();
            let job_link =  job_name_ele_attr['href'] ? `https://www.zhipin.com${job_name_ele_attr['href']}` : '';
            let job_id = job_name_ele_attr['data-jobid'] || '';
            let job_address = job_area_ele.text();
            let company_name = company_info_ele.text();
            let salary = salary_ele.text();
            let job_request = [];

            job_append_info_ele.find('span.tag-item').each((requestIndex, requestItem) => {
                job_request.push($(requestItem).text())
            })

            job_list.push({
                job_name: job_name,
                job_link: job_link,
                job_id: job_id,
                job_address: job_address,
                company_name: company_name,
                salary: salary,
                job_request: job_request
            })

        })

        if(job_list.length == 0) {
            let msg = params.page == 1 ? '当前岗位爬取的数据为0条，请检查入参' : '当次爬取到的数据为0条，可能是该ip被封，可尝试更换cookie';
            console.log(msg);
            return;
        }

        // 若命中调试模式，则不进行文件的写入，直接打印结果
        if (params.is_debug) {
            console.log(job_list);
            return;
            
        }

        fs.writeJson(`./boss_${params.city_name}_${params.position_name}_page_${params.page}.json`, {job_list: job_list}, (err) => {
            if (err) throw err;
            console.log('爬取成功');

            // 执行下一页的查询
            setTimeout(() => {
                _this.getHtmlInfo({
                    position_name: params.position_name,
                    city_id: params.city_id,
                    city_name: params.city_name,
                    page: params.page + 1
                })
            }, G_REQUEST_TIMEOUT)
            
        });
    },

    // 用于测试解析dom功能是否正常
    testDataHandler: function () {
        fs.readFile('./boss_test.json', 'utf8', (err, data) => {
            
            this.dataHandler(JSON.parse(data), {page: 1, is_debug: true});
        })
    }
}

boss.resolveData(G_CITY_NAME, G_POSITION_NAME);
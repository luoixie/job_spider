/**
 * 爬取boss直聘岗位信息
 */

const superagent = require('superagent') // 引入第三方包
const cheerio = require('cheerio')
const fs = require('fs-extra');
const config = require('./config');

// 常量
const G_TOTAL_LIMIT = 300;
const G_OFFSET = 15;
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

const lagou = {
    resolveData: function (city_name = '', position_name = '') {
        let _this = this;
        if (!city_name) {
            console.log('城市名不能为空');
            return false; 
        }

        if (!position_name) {
            console.log('岗位信息不能为空');
            return false; 
        }

        let batchGetCompanyList = function (page) {
            // 判断是否超出限制数量
            if (page * G_OFFSET > G_TOTAL_LIMIT) {
                console.log('任务执行完成');
                return;
            }

            _this.positionAjax(city_name, position_name, page, function (res) {
                // 若已经超出，则不再请求
                if (+res.total_num < ((+res.page + 1 )* G_OFFSET)) {
                    console.log('任务执行完成');
                    return;
                }

                setTimeout(() => {
                    batchGetCompanyList(+res.page + 1)
                }, G_REQUEST_TIMEOUT);
            })
        }

        batchGetCompanyList();


    },
    positionAjax: function (city_name, position_name, page = 1, callback) {
        console.log(`城市： ${city_name}, 职位：${position_name}, 第${page}页`);
        let encode_city_name = encodeURI(city_name);
        let url =  `https://www.lagou.com/jobs/positionAjax.json?needAddtionalResult=false&city=${encode_city_name}`;

        superagent
        .post(url)
        .send({
            'pn': page,
            'kd': position_name,
            'first': true
        })
        .set(config.lagouConfig.headerOptions) 
        .end((err, res) => {
            if (err) throw err;
    
            // 解析数据
            let dataObj = JSON.parse(res.text);
            if (dataObj.success === true) {
                let total_num = dataObj.content.positionResult.totalCount;
                if (page == 1 ) console.log(`当前岗位总共有${total_num}条数据`);
    
                let job_list = dataObj.content.positionResult.result || [];
    
                if (job_list.length > 0) {
                    // 职位链接
                    // https://www.lagou.com/jobs/${scope.row.job_id}.html
                    // 添加链接
                    job_list.forEach(item => {
                        item.positionLink = `https://www.lagou.com/jobs/${item.positionId}.html`
                    });

                    // 写入数据，每次触发都是新建的操作
                    fs.writeJson(`./lagou_${city_name}_${position_name}_page_${page}.json`, {job_list: job_list}, (err) => {
                        if (err) throw err;
                        console.log('爬取成功');

                        // 执行回调
                        if (callback && typeof callback == 'function') {
                            callback({
                                page: page,
                                total_num: total_num
                            });
                        }
                        
                    });

                } else { // 数据为0
                    let msg = page == 1 ? '当前岗位爬取的数据为0条，请检查入参' : '当次爬取到的数据为0条，可能是该ip被封，可尝试更换cookie';
                    console.log(msg);
                    return;
                }
               
            } else {
                console.log('获取数据失败,' + res.text);
            }
            
        });
    }
}

lagou.resolveData(G_CITY_NAME, G_POSITION_NAME);
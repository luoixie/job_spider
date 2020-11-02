
// 爬取boss直聘岗位信息配置
const BOSS_CONFIG = {
    headerOptions: {
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Connection": "keep-alive",
        "Host": "www.zhipin.com",
        "Referer": 'https://www.zhipin.com/web/common/security-check.html',
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Safari/537.36',
        'Cookie': "Hm_lvt_194df3105ad7148dcf2b98a91b5e727a=1604023505,1604023511,1604023515,1604023519; __fid=0ee47a7bd076dc513a1d0bc6ed37225b; lastCity=100010000; Hm_lpvt_194df3105ad7148dcf2b98a91b5e727a=1604062336; __c=1604062337; __g=-; __l=l=%2Fwww.zhipin.com%2Fc101280600%2F%3Fquery%3D%25E5%2589%258D%25E7%25AB%25AF%26page%3D1&r=&g=&friend_source=0; __a=93240002.1604062337..1604062337.1.1.1.1; __zp_stoken__=7513bWFlMb08%2FNn8BUHd7Gi4YOjcTXGAgXSpgW1AiFCZPaXUITQ9nKmFqEFIUAGIkGldHNQN9CUhmc3A1MGd7W1FpbUt7eERsXlw7VxkMIwduGzZ4P1dhDRk1Vi11H3tMHAZNJkx3e05FWDhWRQ%3D%3D"
    },
    cityConfig: [{
        name: '广州',
        code: 101280100
    },{
        name: '深圳',
        code: 101280600
    },{
        name: '北京',
        code: 101010100
    },{
        name: '长沙',
        code: 101250100
    }, {
        name: '上海',
        code: 101020100
    }, {
        name: '佛山',
        code: 101280800
    }, {
        name: '成都',
        code: 101270100
    }]
}

// 爬取拉勾信息
const lagouConfig = {
    headerOptions: {
        "Accept": "application/json, text/javascript, */*; q=0.01",
        "Connection": "keep-alive",
        "Host": "www.lagou.com",
        "Referer": 'https://www.lagou.com/jobs/list_Python?px=default&city=%E6%AD%A6%E6%B1%89',
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Safari/537.36',
        'Cookie': 'JSESSIONID=ABAAAECAAEBABII05A7742CBE856558C67F91139496BDFE; SEARCH_ID=fb2f69f9fac34abab7ac67e951263a4a; user_trace_token=20201102104244-1dce3b57-dbd5-4c59-bf5f-94a32b6c05b5; X_HTTP_TOKEN=42daf4b72327b2814694824061bf5e71415983ed09; WEBTJ-ID=20201102104245-17586d5e24f19f-0d6181bb064074-c781f38-2073600-17586d5e25052b'
    }
}

exports.bossConfig = BOSS_CONFIG;
exports.lagouConfig = lagouConfig;

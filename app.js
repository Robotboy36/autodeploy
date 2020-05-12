
const fs = require('fs'),
    path = require('path'),
    Koa = require('koa'),
    shell = require('shell'),
    app = new Koa();

const projects = require('./projects.json')

function resolve (filepath) {
    return path.resolve(__dirname, filepath)
}


function render (page) {
    let pagePath = resolve(`./pages/${page}`)
    let html = '';
    
    try {
        html = fs.readFileSync(pagePath, {encoding: 'utf-8'})
    } catch (e) {
        html = fs.readFileSync(resolve('./pages/404.html'), {encoding: 'utf-8'})
    }

    // 填充项目
    let projectsHtml = projects.map(item => {
        return '<div class="project" data-path="' + item.path + '">' + item.label + '</div>'
    });

    html = html.replace('{{projectlist}}', projectsHtml.join(''));

    return html;
}

function router (url) {
    let page = '404.html'
    switch (url) {
    case '/':
        page = 'index.html';
        break;
    }

    let html = render(page)
    return html;
}

// 解析参数
function startDeploy (params) {
    let path = params.match(/path=(.+)/)[1]
    shell('cd ' + path + ' && git pull');
}

function api (url, params) {
    switch (url) {
    case '/api/start':
        startDeploy(params);
        break;
    }
}

app.use(function (context) {
    let url = context.request.url,
        method = context.request.method;

    let params = url.split('?')[1];
    url = url.split('?')[0];

    // 页面
    if (!/\/api\//.test(url) && /get/i.test(method)) {
        context.body = router(url)
        return;
    }

    // 接口
    // console.log('url: ' + url)
    api(url, params)
})

app.listen(3003, () => {
    console.log('服务器已启动')
})

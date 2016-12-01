/**
 * Created by Administrator on 2016/11/30 0030.
 */
var http= require('http');
var cheerio = require('cheerio');
var fs = require('fs');
var async = require('async');

var url = 'http://www.23us.cc/html/111/111867/5810834.html';
var urls = 'http://www.23us.cc/html/151/151280/';

var books = [];

//获取HTML页面
var getHtmlPage = function(url, callback){
    var html = '';
    http.get(url,function(res){
        res.on('data', function(data){
            html += data;
        });
        res.on('end', function(){
            callback(html);
        });
    }).on('error', function(){
        callback(null);
    });
};

//获取章节列表
var getChapterList = function (html) {
    var $ = cheerio.load(html);
    var bookInfo = {};
    bookInfo.bookName = $('span h1').text();
    bookInfo.author = $('span em').text();
    bookInfo.intro = $('p.intro').text();         //简介
    bookInfo.chapterArr = [];                     //用来存储章节信息的数组

    $('dl.chapterlist dd').each(function(id, ele){
        //console.log(id);
        var article = {};
        var $ = cheerio.load(ele);
        article.title = $('a').text();
        article.url = $('a').attr('href');
        bookInfo.chapterArr.push(article);
        //console.error(bookInfo);
    });
    //console.error(bookInfo);
    return bookInfo;
};

//获取单章文章内容
var getContent = function(html){
    var $ = cheerio.load(html);
    var article = {
        title: '',
        content: ''
    };

    article.title = $('body div.inner h1').text();
    article.content = $('body div#content').text();
    //console.error(article);
    return article;

};

getHtmlPage(url,function(html){
    //console.log('html = '+ html);
    //getContent(html);

    //console.error(getContent(html));
});


//获取整本数的内容
getHtmlPage(urls,function(html){
    var bookInfo = getChapterList(html);
    books.push(bookInfo.bookName);
    books.push(bookInfo.author);
    books.push(bookInfo.intro);
    writeFile(bookInfo.bookName+'.txt',bookInfo.bookName + '\r\n' + bookInfo.author+ '\r\n'+ bookInfo.intro+ '\r\n', {encoding:"utf8",flag:"a"},function(err){
        //console.error(err);

    });
   async.eachSeries(bookInfo.chapterArr, function (chapter, callback) {
       var url = urls + chapter.url;
       getHtmlPage(url,function(htm){
           var article = getContent(htm);
           console.error(chapter.title+'  内容抓取中。。。');
           books.push(article);
           writeFile(bookInfo.bookName+'.txt',article.title + '\r\n' + article.content+ '\r\n', {encoding:"utf8",flag:"a"},function(err){
               //console.error(err);
               callback();
           });
       });
   },function(){
       console.error('抓取完成！');
       //for(var i = 0; i < 3; i++ ){
       //
       //}
       //for(var i = 3; i < books.length; i++ ){
       //
       //}
   });
});

// 写入文件
var writeFile = function(fileName , data, option, callback){
    fs.writeFile(fileName, data, option, function(err) {
        callback(err);
    });
};
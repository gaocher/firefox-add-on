var requirejs = require('requirejs')
  , fs = require('fs')
  , path = require('path')
  , commander = require('commander');

// npm link commander

var config = {
  development: {
    content_script:{
      baseUrl: './js',
      name: 'everypage_main',
      optimize: 'none',
      out: './build/main-built.js'
    },
    
    background:{
      baseUrl: './js',
      name: 'background',
      optimize: 'none',
      out: './build/background.js'
    },
    
    chat_main: {
      baseUrl: './js',
      name: 'chat_main',
      optimize: 'none',
      paths: {
        'hbs' : 'vendor/hbs',
        'Handlebars' : 'vendor/Handlebars'
      },
      pragmasOnSave: {
        excludeHbsParser : true,
        excludeHbs: true,
        excludeAfterBuild: true
      },
      hbs: {
        disableI18n : true
      },
      out: './build/chat_main.js'
    }
  },
  
  production: {
    content_script: {
      baseUrl: './js',
      name: 'everypage_main',
      out: './build/main-built.js' 
    },
    
    background: {
      baseUrl: './js',
      name: 'background',
      out: './build/background.js'
    },
    
    chat_main: {
      baseUrl: './js',
      name: 'chat_main',
      paths: {
        'hbs' : 'vendor/hbs',
        'Handlebars' : 'vendor/Handlebars'
      },
      pragmasOnSave: {
        excludeHbsParser : true,
        excludeHbs: true,
        excludeAfterBuild: true
      },
      hbs: {
        disableI18n : true
      },
      out: './build/chat_main.js'
    }
  },
  
  // paths: {
  //   'jquery': 'vendor/jquery'
  // },
  // modules: {
  //   {
  //     name: "everypage_main",
  //     exclude: ["jquery"]
  //   }
  // }
};

commander.version('1.0.0')
  .usage('[options]')
  .option('-m, --mode <n>', 'build in development mode or production mode')
  .parse(process.argv);

var mode = commander.mode || 'development'
  , root_url = mode == 'development' ? 'http://192.168.1.100:3000' : 'http://yunitongzai.com'
  , img_base = mode == 'development' ? 'http://192.168.1.100:3000/uploads/' : 'http://s3-us-west-2.amazonaws.com/yunitongzai/resized_img/';

Object.keys(config[mode]).forEach(function(key){
  var tmpConfig = config[mode][key];
  requirejs.optimize(tmpConfig, function(buildResponse){
    var contents = fs.readFileSync(tmpConfig.out, 'utf-8')
      , str = contents.replace(/<%= root_url %>/g, root_url)
                      .replace(/<%= debug %>/g, mode == 'development' ? 'true' : 'false');
    fs.writeFileSync(tmpConfig.out, str, 'utf-8');
  });
});

var files = ['./js/web/Request.js', './js/common/Net.js', './js/common/Const.js']
for (var i=0; i < files.length; i++) {
  var contents = fs.readFileSync(files[i], 'utf-8')
    , str = contents.replace(/<%= root_url %>/g, root_url)
                    .replace(/<%= img_base %>/g, img_base);
  fs.writeFileSync('./build/'+path.basename(files[i]), str, 'utf-8');
};


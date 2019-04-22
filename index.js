const fs = require('fs');
const http = require('http');
const os = require("os");
const https = require('https');
const download = require('download-git-repo');
const inquirer = require('inquirer');


const config = {
  ci: {
    dbPrefix: 'wp_',
    local: {
      url: 'localhost',
      host: 'localhost',
      pass: 'root',
      user: 'root'
    },
    preprod: {
      url: 'localhost',
      host: 'localhost',
      pass: 'root',
      user: 'root',
    }
  },
  git: true,
  wordpress: {
    themePathFolder : "wp",
    basePath : "./",
    themesName : "starter2019",
    plugin: {
      gravity: true,
      acf: true
    }
  }
}

const questions = [
  {
    type: 'input',
    name: 'localUrl',
    message: 'local url',
  },
  {
    type: 'input',
    name: 'localDBHost',
    message: 'local host',
  },
  {
    type: 'input',
    name: 'localDBName',
    message: 'local name',
  },
  {
    type: 'input',
    name: 'localDBUser',
    message: 'local user',
  },
  {
    type: 'input',
    name: 'localDBPass',
    message: 'local password',
  },
  {
    type: 'input',
    name: 'dbPrefix',
    message: 'database prefix',
  },
  {
    type: 'input',
    name: 'prodUrl',
    message: 'prod url',
  },
  {
    type: 'input',
    name: 'prodFolderName',
    message: 'prod folder name',
  },
  {
    type: 'input',
    name: 'prodDBHost',
    message: 'prod host',
  },
  {
    type: 'input',
    name: 'prodDBName',
    message: 'prod name',
  },
  {
    type: 'input',
    name: 'prodDBUser',
    message: 'prod user',
  },
  {
    type: 'input',
    name: 'prodDBPass',
    message: 'prod password',
  },
  {
    type: 'list',
    name: 'themes',
    message: 'Choose your theme',
    choices: ['starter2019', 'barbaStarter2019'],
  },
  {
    type: 'confirm',
    name: 'isGit',
    message: 'Init a github repo ?',
  },
  {
    type: 'confirm',
    name: 'gravityForm',
    message: 'gravity form ?',
  },
  {
    type: 'confirm',
    name: 'acf',
    message: 'acf ?',
  },
];

function UserInterface() {
  inquirer.prompt(questions).then(answers => {
    config.ci.local.url = answers.localUrl
    config.ci.local.host = answers.localDBHost
    config.ci.local.name = answers.localDBName
    config.ci.local.user = answers.localDBUser
    config.ci.local.pass = answers.localDBPass

    config.ci.dbPrefix = answers.dbPrefix

    config.ci.preprod.url = answers.prodUrl
    config.ci.preprod.host = answers.prodDBHost
    config.ci.preprod.name = answers.prodDBName
    config.ci.preprod.user = answers.prodDBUser
    config.ci.preprod.pass = answers.prodDBPass
    config.ci.preprod.folderName = answers.prodFolderName

    config.wordpress.themesName = answers.themes
    config.git = answers.isGit
    config.wordpress.plugin.gravity = answers.gravityForm
    config.wordpress.plugin.acf = answers.acf

    downloadTheme()
  });
}

function downloadTheme() {
  let downloadPath = `${config.wordpress.themePathFolder}/flinked/`;
  
  download(`flinked/${config.wordpress.themesName}`, downloadPath, function (err) {
    if(err) {
      return err;
    } else {
      console.log(" ✨ Sucess");
      parseEnv()
    }
  })
}

function parseEnv() {
  const includeEnv = 
  `
  APP_ENV=local
  APP_PREFIX=${config.ci.dbPrefix}
  APP_SERVERHOST=flinked@51.68.44.225
  LOCAL_URL=${config.ci.local.url}
  LOCAL_HOST=${config.ci.local.host}
  LOCAL_DBNAME=${config.ci.local.name}
  LOCAL_DBUSER=${config.ci.local.user}
  LOCAL_DBPASS=${config.ci.local.pass}

  PREPROD_FOLDERNAME=${config.ci.preprod.folderName}
  PREPROD_URL=${config.ci.preprod.url}
  PREPROD_HOST=${config.ci.preprod.host}
  PREPROD_DBNAME=${config.ci.preprod.name}
  PREPROD_DBUSER=${config.ci.preprod.user}
  PREPROD_DBPASS=${config.ci.preprod.pass}
  SLACK_TOKEN=slacktoken
  `

  const includeMake = 
  `
  APP_ENV:=local
  APP_PREFIX:=${config.ci.dbPrefix}
  APP_SERVERHOST:=flinked@51.68.44.225
  LOCAL_URL:=${config.ci.local.url}
  LOCAL_HOST:=${config.ci.local.host}
  PREPROD_FOLDERNAME:=${config.ci.preprod.folderName}
  PREPROD_URL:=${config.ci.preprod.url}
  PREPROD_HOST:=${config.ci.preprod.host}
  `

  createEnvFile(includeEnv, includeMake)
}

function createEnvFile(includeEnv, includeMake) {
  if (!fs.existsSync(`${config.wordpress.basePath}.env`)){
    fs.appendFile(`${config.wordpress.basePath}.env`, includeEnv , function (err) {
      if (err) throw err;
      console.log(" ✨.env generated");
    });
  }
  if (!fs.existsSync(`${config.wordpress.basePath}.makerc`)){
    fs.appendFile(`${config.wordpress.basePath}.makerc`, includeMake , function (err) {
      if (err) throw err;
      console.log(" ✨.makerc generated");
    });
  }
}

// downloadTheme()

UserInterface()
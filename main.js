// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const exec = require('child_process').exec;
const iconv = require('iconv-lite');
const fs = require('fs');

String.prototype.replaceAll = function(org, dest) {
  return this.split(org).join(dest);
}

String.prototype.insert = function(_idx, _str) {
  return this.substring(0,_idx) + _str + this.substring(_idx,this.length);
}

function execute(command, callback) {
    exec(command, (error, stdout, stderr) => { 
        callback(stdout); 
    });
};
/* Event handler for asynchronous incoming messages */
ipcMain.on("repoStartPath-check", (event, arg) => {
  console.log('checking configure.conf');
  var repoStartPath = fs.readFileSync("./configure.conf", 'utf8');
  repoStartPath = repoStartPath.split('\n')[0];
  repoStartPath = repoStartPath.substring('PATH'.length, repoStartPath.length);
  repoStartPath = repoStartPath.replaceAll(" ","");
  repoStartPath = repoStartPath.substring(0, repoStartPath.length-1);
  console.log('PATH is '+ repoStartPath);

  event.sender.send("repoStartPath-reply", repoStartPath);
});

/* Event handler for asynchronous incoming messages */
ipcMain.on("addUsers", (event, arg) => {
  var arr = arg.split('#$')

  var repoPath = arr[0].split('\n');
  var userList = arr[1].split('\n');
  var _repoStartPath = arr[2]
  _repoStartPath = _repoStartPath.replaceAll("\n","");
  console.log('repoStartPath is '+_repoStartPath);

  var successLog = [];
  var errorLog = [];

  for(var i =0;i<repoPath.length;i++){
    repoPath[i] = repoPath[i].replaceAll(" ","");
    var ss = repoPath[i].indexOf('/', 8);
    var path = _repoStartPath + "/" + repoPath[i].substring(ss, repoPath[i].length) + "/conf/"
    path = path.replaceAll("//","/");
    console.log(path + 'is started');
    
    try{
      var data = fs.readFileSync(path+"authz", 'utf8');

      var successUserList = [];

      var startPoint = data.indexOf("admin = ") + "admin = ".length;
      for(var j=0;j<userList.length;j++){
        // 중복 유저 체크
        var lines = data.toString().split("\n");
        var userStr = "";
        for(let k = 0;k< lines.length;k++){
          if(lines[k].indexOf('admin =') != -1){
            console.log(lines[k]);
            console.log('startPoint '+startPoint);
            userStr = lines[k].substring(lines[k].indexOf("admin = ") + "admin = ".length,lines[k].length);
            userStr = userStr.replace(/ /g,"");
            console.log(userStr);
            break
          }
        }

        var userArr = userStr.split(',');
        console.log(userArr);


        var flag = false;
        for(let k = 0;k< userArr.length;k++){
          if(userList[j] == userArr[k]){
            flag = true;
            errorLog.push(repoPath[i]+' 작업실패, '+userList[j]+' 유저가 이미 존재합니다.'+'\n')
            break
          }
        }

        if(flag){
          continue;
        }

        data = data.insert(startPoint, userList[j] + ", ");
        successUserList.push(userList[j]);
      }
      fs.writeFileSync(path+"authz", data);
      console.log( 'success to add users in authz ' + path);
        
    
      data = fs.readFileSync(path+"passwd", 'utf8')
      startPoint = data.indexOf("[users]", 200) + "[users]".length;
      for(var j=0;j<successUserList.length;j++){
        data = data.insert(startPoint, "\r\n" + successUserList[j] + " = " + '1234');
      }
      fs.writeFileSync(path+"passwd", data);
      console.log('success to add users in passwd ' + path);
      for (let j = 0; j < successUserList.length; j++) {
        successLog.push(repoPath[i]+' 작업성공, '+successUserList[j]+'가 추가되었습니다.'+'\n');
      }
    }catch(e){
      console.log('bad path')
      errorLog.push(repoPath[i]+' 작업실패, 잘못된 경로입니다.'+'\n')
      event.sender.send("alert-result", 'error');
      console.log(e)
    }
  }
  event.sender.send("alert-result", successLog.toString()+errorLog.toString());
});

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()
  
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

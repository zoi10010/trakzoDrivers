// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const path = require('path')
var CronJob = require('cron').CronJob;
//add denis
var userPath = app.getPath('userData');
const { remote } = require('electron');
const find = require('find-process');
const { exec } = require("child_process");
const fs = require('fs');
var AutoLaunch = require('auto-launch');
// const process = require('process');
// var userPath = remote.app.getPath('userData');
var trakzoPath = "";

var uninstall = "";
function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

function pathLocation() {
  try {
    var arrAutoStartPath = userPath.split('/');
    arrAutoStartPath.pop();
    var autoStartPath = arrAutoStartPath.join('/');
    arrAutoStartPath.pop();
    var appImageFilePath = arrAutoStartPath.join('/') + '/.local/share/applications';
    fs.readdir(appImageFilePath, function (err, files) {
      files.forEach(function (file) {
        var fileExtension = file.split('.');
        if (file.toLowerCase().includes('trakzo') && fileExtension[fileExtension.length - 1].toLowerCase().includes('desktop')) {
          var data = fs.readFileSync(appImageFilePath + '/' + file, { encoding: 'utf-8' }, function (err, data) { });
          var arrList = data.split('\n');
          arrList.forEach(function (file, index) {
            if (file.includes('TryExec')) {
              // fs.writeFileSync(autoStartPath + '/autostart/TrakZo.desktop', '[Desktop Entry]\n'
              //   + 'Type=Application\n' +
              //   + 'Name=TrakZo\n'
              //   + 'Comment=Enhance your Productivity to next level with TrakZo\n'
              //   + 'Exec="' + file.substring(8) + '"\n'
              // + 'Terminal=false');
              trakzoPath = file.substring(8)
            } else if (file.includes("appimagelauncher/remove")) {
              uninstall = file.substring(5)
            }
          });
        }
      });
    });
  }
  catch (e) {
    // return ''
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  var minecraftAutoLauncher = new AutoLaunch({
		name: 'TrakZo',
		path: app.getPath('exe') //'/Library/LaunchAgents',
	});
	minecraftAutoLauncher.enable();
	minecraftAutoLauncher.isEnabled()
		.then(function (isEnabled) {
			// if (isEnabled) {
			// 	return;
			// }
			minecraftAutoLauncher.enable();
		})
		.catch(function (err) {
			console.log(err)
		});
  pathLocation();
  createWindow();
  //uninstall patch - denis
  // const job = new CronJob('1 * * * * *', function () {
  //   if (uninstall != '') {
  //     exec(uninstall, (error, data, getter) => {
  //       console.log(error)
  //       console.log(data)
  //       console.log(getter)
  //     })
  //   } else {
  //     pathLocation()
  //   }
  // });
  console.log('After job instantiation');
  job.start();
  console.log('is job running? ', job.running);
  console.log('Before job instantiation');
  const job = new CronJob('1 * * * * *', function () {
    if (trakzoPath) {
      find('name', 'trakzo', true)
        .then(function (list) {
          if (list.length > 0) {
            console.log(list)
          } else {
            exec("chmod u+x " + trakzoPath + "", (error, data, getter) => {
              if (error) {
                console.log("error", error.message);
                return;
              }
              if (getter) {
                console.log("data", data);
                return;
              }
              exec(trakzoPath, (error, data, getter) => {
                if (error) {
                  console.log("error", error.message);
                  return;
                }
                if (getter) {
                  console.log("data", data);
                  return;
                }
                console.log("data", data);
              });
            });
            console.log("nondata", list)
          }
        })
    } else {
      pathLocation();
    }
  });
  console.log('After job instantiation');
  job.start();
  console.log('is job running? ', job.running);

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

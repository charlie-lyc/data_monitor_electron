require('dotenv').config()
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const axios = require('axios')
const papa = require('papaparse')
const fs = require('node:fs')


const createWindow = () => {
    const mainWindow = new BrowserWindow({
        width: 1080,
        height: 720,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,   // <== Added !!!
            contextIsolation: false, // <== Added !!!
        },
    })
    mainWindow.loadFile('index.html')
    // mainWindow.webContents.openDevTools() // <== XXX DEVELOPMENT XXX
}

app.whenReady().then(() => {
    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})
/////////////////////////////////////////////////////////////////////////

/* --- API Call --- */
ipcMain.on('apiCall', async (event, fromDate, toDate) => {
    try {
        const response = await axios.post(
            process.env.API_URL, // <== XXX DEVELOPMENT XXX
            { fromDate, toDate },
            { 
                headers: {
                    'apikey-plant-1' : 'Y!Ptm6yXhecvu5jA=ZsSMW-MQeWNWq3L3qxgMe4qSCU4DT6mtGLX?rSdDkCV7m@D$74?K%gz&NJHgZg@d&X5--XYBcxyX3c?JrZP9w2mQEF_wNTMArnvzttyN*3w%A5L'
                }
            }
        )
        const data = response.data.reverse()
        event.reply('apiCallComplete', data)
      } catch (error) {
        console.error('API call failed:', error.message)
        event.reply('apiCallFailed', error.message)
      }
})
/* --- // API Call --- */

/* --- Convert JSON to CSV --- */
ipcMain.on('convertToCSV', async (event, jsonData, fromDate, toDate) => {
    try {
        const csvData = papa.unparse(jsonData)
        const savePath = app.getPath('downloads') + `/aotomon_raw_data_${fromDate}_${toDate}.csv`
        fs.writeFileSync(savePath, csvData)
        event.reply('conversionComplete', savePath)
      } catch (error) {
        console.error('CSV conversion failed:', error.message)
        event.reply('conversionFailed', error.message)
      }
})
/* --- // Convert JSON to CSV --- */

/* --- Full Download --- */
ipcMain.on('fullDownload', async (event) => {
    try {
        const response = await axios.post(
            process.env.API_URL, // <== XXX DEVELOPMENT XXX
            {},
            { 
                headers: {
                    'apikey-plant-1' : 'Y!Ptm6yXhecvu5jA=ZsSMW-MQeWNWq3L3qxgMe4qSCU4DT6mtGLX?rSdDkCV7m@D$74?K%gz&NJHgZg@d&X5--XYBcxyX3c?JrZP9w2mQEF_wNTMArnvzttyN*3w%A5L'
                }
            }
        )
        const jsonData = response.data.reverse()
        const csvData = papa.unparse(jsonData)
        const savePath = app.getPath('downloads') + `/aotomon_full_data.csv`
        fs.writeFileSync(savePath, csvData)
        event.reply('fullDownloadComplete', savePath)
      } catch (error) {
        console.error('Full download failed:', error.message)
        event.reply('fullDownloadFailed', error.message)
      }
})
/* --- // Full Download --- */


/////////////////////////////////////////////////////////////////////////
app.on('window-all-closed', () => {
    if (process.platform !== "darwin") app.quit()
})


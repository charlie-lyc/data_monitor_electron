const moment = require('moment')
const { ipcRenderer } = require('electron')


const fromDatePicker = document.getElementById('fromDate')
const toDatePicker = document.getElementById('toDate')
fromDatePicker.value = moment(new Date()).format('YYYY-MM-DD')
toDatePicker.value = moment(new Date()).format('YYYY-MM-DD')
let fromDate = moment(new Date()).format('YYYY-MM-DD')
let toDate = moment(new Date()).format('YYYY-MM-DD')
fromDatePicker.addEventListener('change', changeFromDate)
toDatePicker.addEventListener('change', changeToDate)
function changeFromDate(e) {
    e.target.value = moment(e.target.value).format('YYYY-MM-DD')
    fromDate = moment(e.target.value).format('YYYY-MM-DD')
}
function changeToDate(e) {
    e.target.value = moment(e.target.value).format('YYYY-MM-DD')
    toDate = moment(e.target.value).format('YYYY-MM-DD')
}


let result
const searchBtn = document.getElementById('search')
searchBtn.addEventListener('click', () => {
    ipcRenderer.send('apiCall', fromDate, toDate)
})
searchBtn.click() // <== Initial Call !!!
ipcRenderer.on('apiCallComplete', (event, data) => {
    console.log('API call successful. Data length:', data.length)
    result = data
    updateTable(result)
})
ipcRenderer.on('apiCallFailed', (event, errorMessage) => {
    console.error('API call failed:', errorMessage)
})
function updateTable(data) {
    const tableContainer = document.getElementById('tableContainer')
    while (tableContainer.firstChild) {
        tableContainer.removeChild(tableContainer.firstChild)
    }
    const table = document.createElement('table')
    const headers = Object.keys(data[0]).slice(1)
    const headerRow = document.createElement('tr')
    headers.forEach(header => {
        const th = document.createElement('th')
        th.textContent = header
        headerRow.appendChild(th)
    })
    table.appendChild(headerRow)
    data.forEach(item => {
        const row = document.createElement('tr')
        headers.forEach(header => {
            const td = document.createElement('td')
            td.textContent = item[header]
            row.appendChild(td)
        })
        table.appendChild(row)
    })
    tableContainer.appendChild(table)
}


const downloadBtn = document.getElementById('download')
downloadBtn.addEventListener('click', async() => {
    ipcRenderer.send('convertToCSV', result, fromDate, toDate)
})
ipcRenderer.on('conversionComplete', (event, savePath) => {
    console.log('CSV conversion successful. File saved at:', savePath)
})
ipcRenderer.on('conversionFailed', (event, errorMessage) => {
    console.error('CSV conversion failed:', errorMessage)
})


const fullDownloadBtn = document.getElementById('fullDownload')
fullDownloadBtn.addEventListener('click', () => {
    ipcRenderer.send('fullDownload')
})
ipcRenderer.on('fullDownloadComplete', (event, savePath) => {
    console.log('Full download successful. File saved at:', savePath)
})
ipcRenderer.on('fullDownloadFailed', (event, errorMessage) => {
    console.error('Full download failed:', errorMessage)
})
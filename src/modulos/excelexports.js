const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");
const csvtojson = require('csvtojson');

module.exports = {
  async exportExcelLayouts(res,camino) {
        // const imageId720 = workbook.addImage({
        //  buffer: fs.readFileSync("public\images\Logo_Baculo_Anagrama_Ok_BSales_Color.png"),
        //  extension: "png",
        // });
        console.time("/descargaexcel...", camino);
        const options = {
          parserOptions: {
            delimiter: ";",
            quote: false,
          },
        };
        let workbook = new ExcelJS.Workbook();
        let worksheet = workbook.addWorksheet('Datos');
      
        worksheet.columns = [
          { header: "Nivel 1", key: "1", width: 5, style: {font: { name: 'Calibri' }} },
          { header: "Nivel 2", key: "2", width: 5, style: {font: { name: 'Calibri' }} },
          { header: "Nivel 3", key: "3", width: 5, style: {font: { name: 'Calibri' }} },
          { header: "Nivel 4", key: "4", width: 5, style: {font: { name: 'Calibri' }} },
          //{ header: "Idx", key: "Idx", width: 5 },
          { header: "Response", key: "Response", width: 5, style: {font: { name: 'Calibri' }} },
          //{ header: "Pk", key: "Pk", width: 5 },
          { header: "Descripcion", key: "Descripcion", width: 25, font: { name: 'Calibri' } },
          { header: "Tot", key: "Tot", width: 10,style: {numFmt: '#,##0.00', font: { name: 'Calibri' }} },
          { header: "Ene", key: "Ene", width: 10,style: {numFmt: '#,##0.00', font: { name: 'Calibri' }} },
          { header: "Feb", key: "Feb", width: 10,style: {numFmt: '#,##0.00', font: { name: 'Calibri' }} },
          { header: "Mar", key: "Mar", width: 10,style: {numFmt: '#,##0.00', font: { name: 'Calibri' }} },
          { header: "Abr", key: "Abr", width: 10,style: {numFmt: '#,##0.00', font: { name: 'Calibri' }} },
          { header: "May", key: "May", width: 10,style: {numFmt: '#,##0.00', font: { name: 'Calibri' }} },
          { header: "Jun", key: "Jun", width: 10,style: {numFmt: '#,##0.00', font: { name: 'Calibri' }} },
          { header: "Jul", key: "Jul", width: 10,style: {numFmt: '#,##0.00', font: { name: 'Calibri' }} },
          { header: "Ago", key: "Ago", width: 10,style: {numFmt: '#,##0.00', font: { name: 'Calibri' }} },
          { header: "Sep", key: "Sep", width: 10,style: {numFmt: '#,##0.00', font: { name: 'Calibri' }} },
          { header: "Oct", key: "Oct", width: 10,style: {numFmt: '#,##0.00', font: { name: 'Calibri' }} },
          { header: "Nov", key: "Nov", width: 10,style: {numFmt: '#,##0.00', font: { name: 'Calibri' }} },
          { header: "Dic", key: "Dic", width: 10,style: {numFmt: '#,##0.00', font: { name: 'Calibri' }} },
          { header: "Nivel", key: "Nivel", width: 10 , style: {font: { name: 'Calibri' }} }
          //{ header: "Clave", key: "Clave", width: 10 },
          //{ header: "Indice", key: "Indice", width: 10 }
        ];
      
        const fila0 = worksheet.getRow(1);
        fila0.eachCell(function(cell, colNumber) {
          cell.border = {
            bottom: {style:'tin', color: {argb:'FF00FF00'}},
          };
          cell.fill = {
            type: 'pattern',
            pattern:'solid',
            fgColor:{argb:'F08080'},
          };
          cell.font = { name: 'Calibri Bold'};
        });
        worksheet.views = [
          {state: 'frozen', xSplit: 0, ySplit: 1}
        ];
        let filas = [];
        csvtojson({delimiter:';'}).fromFile(camino)
        .subscribe((json,lineNumber)=>{
          //datos['operaciones'][0]['CMP_CIUDAD']
          if (json.Response == 'null'){
            json.Response = "";
          }
          json.Tot = parseFloat(json.Tot);
          json.Ene = parseFloat(json.Ene);
          json.Feb = parseFloat(json.Feb);
          json.Mar = parseFloat(json.Mar);
          json.Abr = parseFloat(json.Abr);
          json.May = parseFloat(json.May);
          json.Jun = parseFloat(json.Jun);
          json.Jul = parseFloat(json.Jul);
          json.Ago = parseFloat(json.Ago);
          json.Sep = parseFloat(json.Sep);
          json.Oct = parseFloat(json.Oct);
          json.Nov = parseFloat(json.Nov);
          json.Dic = parseFloat(json.Dic);
          // json.Tot = parseFloat(json.Tot.toString().replace('.',','));
          // json.Ene = parseFloat(json.Ene.toString().replace('.',','));
          // json.Feb = parseFloat(json.Feb.toString().replace('.',','));
          // json.Mar = parseFloat(json.Mar.toString().replace('.',','));
          // json.Abr = parseFloat(json.Abr.toString().replace('.',','));
          // json.May = parseFloat(json.May.toString().replace('.',','));
          // json.Jun = parseFloat(json.Jun.toString().replace('.',','));
          // json.Jul = parseFloat(json.Jul.toString().replace('.',','));
          // json.Ago = parseFloat(json.Ago.toString().replace('.',','));
          // json.Sep = parseFloat(json.Sep.toString().replace('.',','));
          // json.Oct = parseFloat(json.Oct.toString().replace('.',','));
          // json.Nov = parseFloat(json.Nov.toString().replace('.',','));
          // json.Dic = parseFloat(json.Dic.toString().replace('.',','));
          //worksheet.addRow(json);
          return JSON.stringify(json);
        }).then(data => {
                // users is a JSON array
                // log the JSON array
                for (i = 0; i < data.length; i++) {
                  filas.push(data[i]);
                  worksheet.addRow(filas[i]);
                }
                
                res.setHeader(
                  "Content-Type",
                  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                );
                res.setHeader(
                  "Content-Disposition",
                  "attachment; filename=" + camino
                );
                console.timeEnd("/descargaexcel...",camino);
                 workbook.xlsx.write(res).then(function () {
                  res.status(200).end();
                });
            }).catch(err => {
                // log error if any
                console.log(err);
          });

},

async  sleep(ms) {
      return new Promise((resolve) => {
        setTimeout(resolve, ms);
      });
    }
};

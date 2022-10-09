module.exports = app => {
    const excel = require('exceljs');

    app.excel = {
        create: () => new excel.Workbook(),

        readFile: (path, done) => new Promise((resolve, reject) => {
            let workbook = app.excel.create();
            workbook.xlsx.readFile(path).then(() => {
                done && done(workbook);
                workbook ? resolve(workbook) : reject('Object is null!');
            });
        }),

        readFileSync: (path) => {
            let workbook = app.excel.create();
            return workbook.xlsx.readFile(path);
        },

        attachment: (workbook, respone, filename) => {
            respone.attachment(filename);
            workbook.xlsx.write(respone);
        },

        write: (worksheet, items) => {
            if (items.constructor !== Array) items = [items];
            for (let i = 0; i < items.length; i++) {
                let item = items[i],
                    cell = worksheet.getCell(item.cell);

                if (item.number) {
                    item.number = parseInt(item.number);
                    if (item.number !== 0) {
                        cell.value = item.number;
                        cell.numFmt = '#,##0';
                    } else {
                        cell.value = '0';
                        cell.alignment = { vertical: 'middle', horizontal: 'right' };
                    }
                } else if (item.value) {
                    cell.value = item.value;
                }

                if (item.border) {
                    let border = {}, strBorder = item.border.toString();
                    if (strBorder.indexOf('1') >= 0) border.top = { style: 'thin' };
                    if (strBorder.indexOf('2') >= 0) border.right = { style: 'thin' };
                    if (strBorder.indexOf('3') >= 0) border.bottom = { style: 'thin' };
                    if (strBorder.indexOf('4') >= 0) border.left = { style: 'thin' };
                    cell.border = border;
                }
                if (item.alignment && item.alignment !== undefined) cell.alignment = item.alignment;
                if (item.fill && item.fill !== undefined) cell.fill = item.fill;

                cell.font = {
                    name: item.font && item.font.font ? item.font.font : 'Times New Roman',
                    size: item.font && item.font.size ? item.font.size : 10
                };
                if (item.bold != null && item.bold !== undefined) cell.font.bold = item.bold;
            }
            return worksheet.getCell(items[0].cell);
        },

        chr: (codePt) => {
            if (codePt > 0xFFFF) {
                codePt -= 0x10000;
                return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF));
            }
            return String.fromCharCode(codePt);
        },

        numberToExcelColumn: (number) => {
            let numeric = (number - 1) % 26;
            let letter = app.excel.chr(65 + numeric);
            let number2 = parseInt((number - 1) / 26);
            if (number2 > 0) {
                return app.excel.numberToExcelColumn(number2) + letter;
            } else {
                return letter;
            }
        }
    };
};

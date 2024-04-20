const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

/**
 * 약속,
 * 엑셀 파일에서 아래 형태가 변경되지 않는다는 전제하에 스크립트가 동작합니다.
 */
const 키_칼럼_인덱스 = 'C';
const 한국어_칼럼_인덱스 = 'D';
const 영어_칼럼_인덱스 = 'E';
const 다국어_시작_인덱스 = 4;

const SHEET_NAME = 'i18n';
const EXCEL_FILE = './i18n.xlsx';
const TARGET = '../src/shared/lib/localization/dictionaries';

const workbook = new ExcelJS.Workbook();

workbook.xlsx.readFile(path.join(__dirname, EXCEL_FILE)).then(() => {
  const data = getSheetData(SHEET_NAME);

  const targetFolder = path.join(__dirname, TARGET);

  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true });
  }

  fs.writeFileSync(`${targetFolder}/en.json`, JSON.stringify({ ...data['en'] }, null, 2));
  fs.writeFileSync(`${targetFolder}/ko.json`, JSON.stringify({ ...data['ko'] }, null, 2));
});

const mergeKeyWithLang = (source, target) => {
  return Object.entries(source).reduce((prev, [index, key]) => {
    return {
      ...prev,
      [key]: target[index],
    };
  }, {});
};

const getSheetData = (sheetName) => {
  const worksheet = workbook.getWorksheet(sheetName);

  const keyMap = {};
  worksheet.getColumn(키_칼럼_인덱스).eachCell({ includeEmpty: false }, (cell, rowIndex) => {
    if (rowIndex < 다국어_시작_인덱스) return;
    keyMap[rowIndex] = cell.text.replace(/\\n/g, '\n');
  });

  const enMap = {};
  worksheet.getColumn(영어_칼럼_인덱스).eachCell({ includeEmpty: false }, (cell, rowIndex) => {
    if (rowIndex < 다국어_시작_인덱스) return;
    enMap[rowIndex] = cell.text.replace(/\\n/g, '\n');
  });

  const koMap = {};
  worksheet.getColumn(한국어_칼럼_인덱스).eachCell({ includeEmpty: false }, (cell, rowIndex) => {
    if (rowIndex < 다국어_시작_인덱스) return;
    koMap[rowIndex] = cell.text.replace(/\\n/g, '\n');
  });

  const en = mergeKeyWithLang(keyMap, enMap);
  const ko = mergeKeyWithLang(keyMap, koMap);

  return {
    en,
    ko,
  };
};

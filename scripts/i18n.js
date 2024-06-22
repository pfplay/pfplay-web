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

  const en = data['en'];
  const ko = fillMissingKeyValues(en, data['ko']);

  fs.writeFileSync(`${targetFolder}/en.json`, getStructuredLocale(en));
  fs.writeFileSync(`${targetFolder}/ko.json`, getStructuredLocale(ko));
});

function mergeKeyWithLang(source, target) {
  return Object.entries(source).reduce((prev, [index, key]) => {
    return {
      ...prev,
      [key]: target[index],
    };
  }, {});
}

function getSheetData(sheetName) {
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
}

/**
 * en을 기준으로 하며, 다른 언어의 값이 없는 경우 en의 값을 사용하도록 보정합니다.
 * 원본 객체를 변경합니다.
 */
function fillMissingKeyValues(defaultLang, _targetLang) {
  // targetLang에만 있고 defaultLang에는 없는 키가 있으면 에러를 뿜는다.
  Object.keys(defaultLang).forEach((key) => {
    if (defaultLang[key] === null || defaultLang[key] === undefined) {
      throw new Error(`Missing key in defaultLang: ${key}`);
    }
  });

  // defaultLang 기준으로 targetLang에 없는 키를 찾아서 targetLang에 defaultLang의 값으로 추가한다.
  const targetLang = { ..._targetLang };
  Object.keys(defaultLang).forEach((key) => {
    if (targetLang[key] === null || targetLang[key] === undefined) {
      targetLang[key] = defaultLang[key];
    }
  });
  return targetLang;
}

/**
 * 1Depth의 원본 JSON을 개발하기 편하도록 구조화 시킵니다.
 */
const getStructuredLocale = (locale) => {
  const SEPARATOR = '.';

  const resultObj = Object.entries(locale).reduce((acc, [key, value]) => {
    let current = acc;

    const partKeys = key.split(SEPARATOR);

    partKeys.forEach((partKey, depth) => {
      if (depth === partKeys.length - 1) {
        current[partKey] = value;
        return;
      }

      if (!current[partKey]) {
        current[partKey] = {};
      }

      current = current[partKey];
    });

    return acc;
  }, {});

  return JSON.stringify(resultObj, null, 2);
};

// NotoSansTC-Regular.js - 用於 jsPDF 中文字體支援
// 轉換自原始字體 ttf via jsPDF fontconverter

(function (jsPDFAPI) {
    var font = 'AAEAAAASAQAABAAgR0RFRrRCsIIAAjWsAAACYkdQT1Oo9kcdAAEy4AAAHEZHU1VC5AAV0wAAQ7gAAA...',
      name = 'NotoSansTC',
      style = 'normal';
  
    jsPDFAPI.addFileToVFS('NotoSansTC-Regular.ttf', font);
    jsPDFAPI.addFont('NotoSansTC-Regular.ttf', name, style);
  })(jsPDF.API);
  
// src/boot/loadPdfFont.js
export default async () => {
    const fontScript = document.createElement('script')
    fontScript.src = '/fonts/NotoSansTC-normal.js'
    fontScript.async = true
    document.head.appendChild(fontScript)
  }
  
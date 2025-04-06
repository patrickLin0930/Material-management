// src/db/database.js
import Dexie from 'dexie'

export const db = new Dexie('CargoFlowDB')

// v2 版本新增 price 欄位
db.version(2).stores({
  styles: '++id, name, price',   // 加入 price 欄位
  dailyForms: 'date'
})

window.db = db

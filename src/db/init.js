// src/db/init.js
// db.close(); // 先關閉資料庫
// indexedDB.deleteDatabase('CargoFlowDB'); // 然後刪除資料庫

import { db } from './database'

export async function initializeStyles() {
  await db.styles.clear()
  console.log('🔄 清空舊資料，開始初始化款式資料')

  const baseStyles = [
    { name: '8885', colors: ['粉色', '藍色', '紫色', '綠色'] }, // 980
    { name: 'A11', colors: ['黑色', '膚色', '桃色'] }, // 600
    { name: '934', colors: ['灰色', '膚色'] }, // 79
    { name: '668', colors: ['黑色', '灰色'] }, // 300
    { name: '1788', colors: ['黑色', '膚色'] }, // 780
    { name: '1593', colors: ['黑色', '粉色'] }, // 870

    { name: '637', colors: ['灰色', '淺紫色', '灰藍色', '黑色'] }, // 600
    { name: '2605', colors: ['黑色', '深杏色', '淺杏色', '暗粉色', '白色'] }, // 1200
    { name: '623', colors: ['黑色', '棗紅色', '豆沙色', '膚色'] }, // 300
    { name: 'A1', colors: ['紅灰色', '豆沙色', '灰藍色', '黑色'] }, // 300

    { name: '286', colors: ['蝦粉色', '豆沙色', '紫色', '杏色', '黑色'] }, // 300
    { name: '閨密', colors: ['灰紫色', '磚紅色', '膚色', '青檸色'] }, // 290
    { name: '6686', colors: ['莓粉色', '暖膚色', '藻綠色', '茶綠色', '黑色', '紅色'] }, // 870
    { name: '692', colors: ['淺綠色', '淺藍色', '膚色', '黑色'] }, // 290

    { name: '果凍1.0', colors: ['藍色', '粉色', '咖色', '黑色'] }, // 390
    { name: '8880', colors: ['淺綠色', '粉膚色', '豆紫色', '黑色'] }, // 780
    { name: '8805', colors: ['黑色', '藕紫色', '瓷藍色', '暖膚色', '大紅色'] }, // 1170
    { name: '6782', colors: ['豆粉色', '藕紫色', '藻綠色', '黑色'] }, // 1170
    
    { name: '6607', colors: ['淺綠色', '膚色', '磚紅色', '綠色', '黑色'] }, // 780
    { name: '3912', colors: ['淺紫色', '膚色', '香檳色', '黑色'] }, // 780
    { name: '875', colors: ['奶灰色', '藕紫色', '茶綠色', '藕粉色', '黑色'] }, // 1170
    { name: '520', colors: ['淺紫色', '淺膚色', '草綠色', '黑色'] } // 1170
  ]

  const priceMap = {
    '8885': 980,
    'A11': 600,
    '934': 79,
    '668': 300,
    '1788': 780,
    '1593': 870,
    '637': 600,
    '2605': 1200,
    '623': 300,
    'A1': 300,
    '286': 300,
    '閨密': 290,
    '6686': 870,
    '692': 290,
    '果凍1.0': 390,
    '8880': 780,
    '8805': 1170,
    '6782': 1170,
    '6607': 780,
    '3912': 780,
    '875': 1170,
    '520': 1170
  }

  const sizes = ['34 (S)', '36 (M)', '38 (L)', '40 (XL)', '42 (2XL)', '44 (3XL)', '46 (4XL)']
  const expanded = []

  baseStyles.forEach(({ name, colors }) => {
    sizes.forEach(size => {
      colors.forEach(color => {
        expanded.push({
          name,
          size,
          color,
          price: priceMap[name] || 0
        })
      })
    })
  })

  await db.styles.bulkAdd(expanded)
  console.log('✅ 初始化款式資料完成')
}

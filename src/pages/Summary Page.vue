<template>
  <div class="q-pa-md bg-grey-1">
    <div class="text-h5 text-bold text-primary q-mb-lg">📊 統計分析頁面</div>

    <div class="q-mb-md row items-center q-gutter-sm no-wrap">
      <q-btn icon="chevron_left" flat round @click="prevMonth" />
      <q-select
        v-model="currentYear"
        :options="yearOptions"
        dense outlined style="width: 100px"
      />
      <div class="text-h6 text-weight-medium">{{ displayMonth }}</div>
      <q-btn icon="chevron_right" flat round @click="nextMonth" />
      <q-btn flat label="回到本月" color="primary" @click="goToCurrentMonth" />
    </div>

    <q-card class="q-mb-lg shadow-2 rounded-borders">
      <q-card-section class="bg-blue-grey-1 text-subtitle1 text-weight-bold text-center">
        📅 {{ displayMonth }} 總覽
      </q-card-section>
      <q-card-section class="q-pa-md">
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-sm-4">
            <q-card class="bg-white shadow-1 q-pa-md">
              <q-card-section class="text-center">
                <div class="text-subtitle2 text-grey">已賣出總數</div>
                <div class="text-h6 text-positive text-bold">{{ summary.sold }}</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-sm-4">
            <q-card class="bg-white shadow-1 q-pa-md">
              <q-card-section class="text-center">
                <div class="text-subtitle2 text-grey">總收益（試算）</div>
                <div class="text-h6 text-primary text-bold">${{ summary.revenue.toLocaleString() }}</div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-12 col-sm-4">
            <q-card class="bg-white shadow-1 q-pa-md">
              <q-card-section class="text-center">
                <div class="text-subtitle2 text-grey">掛數（估）</div>
                <div class="text-h6 text-deep-orange text-bold">${{ summary.gua.toLocaleString() }}</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-6">
            <q-card flat bordered class="q-pa-sm">
              <q-card-section class="text-subtitle2 text-weight-bold">🔥 最暢銷商品 TOP 5</q-card-section>
              <q-list dense>
                <q-item v-for="item in summary.topSelling" :key="item.name">
                  <q-item-section>{{ item.name }}</q-item-section>
                  <q-item-section side>{{ item.count }} 件</q-item-section>
                </q-item>
              </q-list>
            </q-card>
          </div>
          <div class="col-12 col-md-6">
            <q-card flat bordered class="q-pa-sm">
              <q-card-section class="text-subtitle2 text-weight-bold">💰 單日最高營收日</q-card-section>
              <div class="text-center text-h6 text-primary">{{ summary.bestDay.date || '-' }}</div>
              <div class="text-center text-caption">${{ summary.bestDay.amount?.toLocaleString() || 0 }}</div>
            </q-card>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card class="bg-white shadow-1 rounded-borders">
      <q-card-section class="text-subtitle1 text-weight-bold">📆 每日紀錄統計表</q-card-section>
      <q-table
        :rows="dayRecords"
        :columns="columns"
        row-key="date"
        flat
        bordered
        dense
        separator="cell"
        :rows-per-page-options="[0]"
      >
        <template v-slot:body-cell="props">
          <q-td :props="props" :class="props.rowIndex % 2 === 0 ? 'bg-grey-2' : 'bg-grey-1'">
            {{ props.value }}
          </q-td>
        </template>
      </q-table>
    </q-card>
  </div>
</template>

<script>
import { db } from 'src/db/database'
import { ref, onMounted, computed, watch } from 'vue'

export default {
  name: 'SummaryPage',
  setup() {
    const summary = ref({ sold: 0, revenue: 0, gua: 0, topSelling: [], bestDay: {} })
    const dayRecords = ref([])

    const now = new Date()
    const currentYear = ref(now.getFullYear())
    const currentMonth = ref(now.getMonth())
    const displayMonth = computed(() => `${currentYear.value} 年 ${currentMonth.value + 1} 月`)

    const yearOptions = Array.from({ length: 6 }, (_, i) => now.getFullYear() - 2 + i)

    const columns = [
      { name: 'date', label: '日期', align: 'left', field: 'date' },
      { name: 'sold', label: '賣出筆數', align: 'center', field: 'sold' },
      {
        name: 'revenue',
        label: '收益（估）',
        align: 'center',
        field: 'revenue',
        format: val => `$${val.toLocaleString()}`
      }
    ]

    const loadData = async () => {
      const all = await db.dailyForms.toArray()
      const styles = await db.styles.toArray()
      const priceMap = {}
      styles.forEach(s => {
        priceMap[s.name] = s.price
      })

      const result = []
      let totalSold = 0
      let totalRevenue = 0
      let totalGua = 0
      const counter = {}
      let bestDay = { date: '', amount: 0 }

      const ym = `${currentYear.value}-${String(currentMonth.value + 1).padStart(2, '0')}`

      for (const entry of all.filter(e => e.date.startsWith(ym))) {
        const date = entry.date
        const list = entry.records || []
        const soldItems = list.filter(r => r.action === '已賣出')

        const soldCount = soldItems.reduce((acc, r) => acc + (r.quantity || 0), 0)
        const revenue = soldItems.reduce((acc, r) => {
          const price = priceMap[r.name] || 0
          if (!counter[r.name]) counter[r.name] = 0
          counter[r.name] += r.quantity
          return acc + (r.quantity * price)
        }, 0)

        result.push({ date, sold: soldCount, revenue })

        totalSold += soldCount
        totalRevenue += revenue
        totalGua += revenue

        if (revenue > bestDay.amount) {
          bestDay = { date, amount: revenue }
        }
      }

      const topSelling = Object.entries(counter)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }))

      dayRecords.value = result.sort((a, b) => b.date.localeCompare(a.date))
      summary.value = {
        sold: totalSold,
        revenue: totalRevenue,
        gua: totalGua,
        topSelling,
        bestDay
      }
    }

    const prevMonth = () => {
      if (currentMonth.value === 0) {
        currentMonth.value = 11
        currentYear.value--
      } else {
        currentMonth.value--
      }
    }

    const nextMonth = () => {
      if (currentMonth.value === 11) {
        currentMonth.value = 0
        currentYear.value++
      } else {
        currentMonth.value++
      }
    }

    const goToCurrentMonth = () => {
      currentYear.value = now.getFullYear()
      currentMonth.value = now.getMonth()
    }

    watch([currentYear, currentMonth], loadData)
    onMounted(loadData)

    return {
      summary,
      dayRecords,
      columns,
      currentYear,
      currentMonth,
      displayMonth,
      yearOptions,
      prevMonth,
      nextMonth,
      goToCurrentMonth
    }
  }
}
</script>

<style scoped>
.text-h5 {
  font-size: 24px;
}
.text-subtitle1 {
  font-size: 20px;
}
.text-subtitle2 {
  font-size: 16px;
}
@media (max-width: 599px) {
  .text-h5 {
    font-size: 20px;
  }
  .text-subtitle1 {
    font-size: 18px;
  }
  .text-subtitle2 {
    font-size: 15px;
  }
}
</style>

import assert from 'node:assert/strict'
import test from 'node:test'

// 纯函数逻辑：与 useMemberSignIn 中 buildMockWeekDays 对齐的精简校验
function formatShanghaiDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function shanghaiWeekdayMon1(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const utc = new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
  const short = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Shanghai',
    weekday: 'short',
  }).format(utc)
  return { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 }[short]
}

function addDaysToDateStr(dateStr, delta) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const utc = new Date(Date.UTC(y, m - 1, d + delta, 12, 0, 0))
  return formatShanghaiDate(utc)
}

function buildMockWeekDays(todaySigned = false) {
  const todayStr = formatShanghaiDate()
  const wd = shanghaiWeekdayMon1(todayStr)
  const mondayStr = addDaysToDateStr(todayStr, -(wd - 1))
  const days = []
  let signedSeq = 0
  for (let i = 0; i < 7; i++) {
    const date = addDaysToDateStr(mondayStr, i)
    const weekday = i + 1
    let status
    if (date === todayStr) status = todaySigned ? 'today_signed' : 'today_unsigned'
    else if (date < todayStr) status = i % 2 === 0 ? 'signed' : 'missed'
    else status = 'future'
    if (status === 'signed' || status === 'today_signed') signedSeq += 1
    days.push({
      date,
      weekday,
      status,
      daily_point: status === 'missed' ? 0 : weekday >= 6 ? 5 : 1,
      activity_seq: status === 'signed' || status === 'today_signed' ? signedSeq : null,
    })
  }
  return days
}

test('mock week has 7 days Mon-Sun and includes today', () => {
  const days = buildMockWeekDays(false)
  assert.equal(days.length, 7)
  assert.equal(days[0].weekday, 1)
  assert.equal(days[6].weekday, 7)
  const today = formatShanghaiDate()
  assert.ok(days.some((d) => d.date === today))
  const todayDay = days.find((d) => d.date === today)
  assert.equal(todayDay.status, 'today_unsigned')
})

test('missed days do not show positive daily points', () => {
  const days = buildMockWeekDays(false)
  for (const day of days) {
    if (day.status === 'missed') assert.equal(day.daily_point, 0)
  }
})

test('signed today mock flips today status', () => {
  const days = buildMockWeekDays(true)
  const today = formatShanghaiDate()
  assert.equal(days.find((d) => d.date === today).status, 'today_signed')
})

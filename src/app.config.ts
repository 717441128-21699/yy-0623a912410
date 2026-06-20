export default defineAppConfig({
  pages: [
    'pages/tasks/index',
    'pages/reminders/index',
    'pages/handover/index',
    'pages/task-detail/index',
    'pages/photo-preview/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#0E6FFF',
    navigationBarTitleText: '冷链温控',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F0F5FF'
  },
  tabBar: {
    color: '#86909C',
    selectedColor: '#0E6FFF',
    backgroundColor: '#FFFFFF',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/tasks/index',
        text: '今日任务'
      },
      {
        pagePath: 'pages/reminders/index',
        text: '途中提醒'
      },
      {
        pagePath: 'pages/handover/index',
        text: '到货交接'
      }
    ]
  }
})

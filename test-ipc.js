// 测试脚本 - 在浏览器控制台运行
console.log('=== IPC 诊断测试 ===')

// 测试1: 检查 window.api 是否存在
console.log('1. 检查 window.api:', window.api)

// 测试2: 尝试获取所有项目
console.log('2. 尝试获取所有项目...')
window.api.invoke('project:getAll')
  .then(result => {
    console.log('✅ 成功获取项目列表:', result)
  })
  .catch(error => {
    console.error('❌ 获取项目列表失败:', error)
  })

// 测试3: 尝试创建项目
console.log('3. 尝试创建项目...')
window.api.invoke('project:create', {
  title: '诊断测试项目',
  description: '这是一个测试',
  genre: 'fantasy'
})
  .then(result => {
    console.log('✅ 项目创建成功:', result)
  })
  .catch(error => {
    console.error('❌ 项目创建失败:', error)
  })

console.log('=== 请等待结果... ===')
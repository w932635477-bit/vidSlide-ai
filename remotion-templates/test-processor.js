import ServerVideoProcessor from './server-video-processor.js'

const processor = new ServerVideoProcessor()
console.log('✅ ServerVideoProcessor 实例化成功')

const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(processor))
  .filter(m => m !== 'constructor')
console.log('✅ 可用方法:', methods.join(', '))

console.log('\n验证完成!')

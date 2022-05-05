const { getSignActivity } = require("./functions/activity");
const { GeneralSign } = require("./functions/general");
const { LocationSign } = require("./functions/location");
const { PhotoSign, getObjectIdFromcxPan } = require("./functions/photo");
const { QRCodeSign } = require("./functions/QRCode");
const { userLogin, getCourses, getAccountInfo, printUsers } = require("./functions/user");
const { getStore, storeUser } = require('./utils/file');
const readline = require('./utils/readline')

const rl = readline.createInterface()
let count = 0
 async function qiandao() {
   console.log(count)
    count +=1
    
  let params;
  // 本地与登录之间的抉择
  {
    // 打印本地用户列表，并返回用户数量
    let userLength = printUsers()
    // let input = await readline.question(rl, '[ 若使用列表中用户，输入前面的序号; 若使用账号和密码登录，输入n ]\n输入：')
    let input = '1'

    // 使用新用户登录
    if (input !== '0') {
      // let uname = await readline.question(rl, '手机号：')
      let uname = 18165508505
      // let password = await readline.question(rl, '密码：')
      let password = '12345qwert'
      // 登录获取各参数
      params = await userLogin(uname, password)
      if (params === "AuthFailed") process.exit(1)
      storeUser(uname, params) // 储存到本地
    } else if (Number(input) === Number.NaN || !(Number(input) >= 0 && Number(input) < userLength)) {
      console.log('输入有误，程序退出；')
      return 0
    } else {
      // 使用本地储存的参数
      const data = getStore()
      params = data.users[Number(input)].params
    }
  }

  // 获取用户名
  let name = await getAccountInfo(params.uf, params._d, params._uid, params.vc3)
  console.log(`你好，${name}`)

  // 获取所有课程
  let courses = await getCourses(params._uid, params._d, params.vc3)
  if (courses === "AuthRequired") return 1
  // 获取进行中的签到活动
  let activity = await getSignActivity(courses, params.uf, params._d, params._uid, params.vc3)
  if (activity === "NoActivity") return 1

  // 检测到签到活动
  switch (activity.otherId) {
    
    case 2: {
      return 0

      // 二维码签到
      // let enc = await readline.question(rl, 'enc(微信或其他识别二维码，可得enc参数)：')
      // await QRCodeSign(enc, name, params.fid, params._uid, activity.aid, params.uf, params._d, params.vc3)
    }
    case 4: {
      // 位置签到
      console.log('https://api.map.baidu.com/lbsapi/getpoint/index.html')
      // let lnglat = await readline.question(rl, '经纬度(如113.516288,34.817038): ')
      let lnglat = '113.004313,28.137372'

      // let address = await readline.question(rl, '详细地址: ')
       let address = '中国湖南省长沙市中南林业科技大学'

      await LocationSign(params.uf, params._d, params.vc3, name, address, activity.aid, params._uid, Number(lnglat.substring(lnglat.indexOf(',') + 1, lnglat.length)), Number(lnglat.substring(0, lnglat.indexOf(','))), params.fid)
      return 0

    }
    case 3: {
      // 手势签到
      await GeneralSign(params.uf, params._d, params.vc3, name, activity.aid, params._uid, params.fid)
      return 0
    }
    case 5: {
      // 签到码签到
      await GeneralSign(params.uf, params._d, params.vc3, name, activity.aid, params._uid, params.fid)
      return 0
    }
    case 0: {
      // let photo = await readline.question(rl, '[注意]是否为拍照签到(y是, n否): ')
       let photo = 'y'

      if (photo === 'y') {
        // 拍照签到
        // await readline.question(rl, '访问 https://pan-yz.chaoxing.com 并在根目录上传你想要提交的照片，格式为jpg或png，命名为 0.jpg 或 0.png，完成后按回车继续...')
        // 获取照片objectId
        let objectId = await getObjectIdFromcxPan(params.uf, params._d, params.vc3, params._uid)
        await PhotoSign(params.uf, params._d, params.vc3, name, activity.aid, params._uid, params.fid, objectId)
      } else {
        // 普通签到
        await GeneralSign(params.uf, params._d, params.vc3, name, activity.aid, params._uid, params.fid)
      }
      return 0
    }
  }
}
qiandao()
// console.log(qiandao)
const timer =setInterval(qiandao,55000)
export const generateMember = (id: number) => ({
  user_id: 1253400 + id,
  user_num: `7001${(Math.floor(Math.random() * 10000) + 10000).toString().substring(1)}`,
  sex: Math.random() > 0.5 ? 1 : 0,
  name: `${['张', '李', '王', '赵', '陈', '黄', '周', '吴', '刘', '孙'][Math.floor(Math.random() * 10)]}${['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军'][Math.floor(Math.random() * 10)]}`,
  avatar: Math.random() > 0.7 ? `http://weilacorp.oss-cn-shenzhen.aliyuncs.com/corp/100067/u/${1253400 + id}/a/${Math.random().toString(36).substring(2, 10)}.jpg` : "http://favicon.weila.hk/default/user.png",
  dept_id: Math.floor(Math.random() * 5),
  country_code: "86",
  phone: `1${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
  type: Math.floor(Math.random() * 256),
  tts: Math.random() > 0.5 ? 1 : 0,
  loc_share: Math.random() > 0.5 ? 1 : 0,
  track: Math.random() > 0.8 ? 1 : 0,
  state: Math.floor(Math.random() * 3),
  created: Math.floor(Date.now() / 1000) - Math.floor(Math.random() * 31536000), // Random timestamp within the last year
  online: Math.random() > 0.7 ? 1 : 0,
  dept_name: ['技术部', '营销部', '人事部', '财务部', '行政部'][Math.floor(Math.random() * 5)]
});

// NOTE: 根据实际需求调整模拟数据的 mock api，此处的 api 将会替换掉生成的 mock api
export default [
  {
    url: '/v1/corp/web/location-get-track',
    method: 'post',
    response: (res: any) => {
      const { body = {} } = res
      console.log(res)

      // Generate random number of tracks (between 1 and 10)
      const numTracks = Math.floor(Math.random() * 10) + 1;

      // Generate random tracks
      const guangdongBounds = {
        minLat: 20.13,
        maxLat: 25.31,
        minLong: 109.66,
        maxLong: 117.19
      };

      const tracks = Array.from({ length: numTracks }, (_, idx) => ({
        latitude: Number((Math.random() * (guangdongBounds.maxLat - guangdongBounds.minLat) + guangdongBounds.minLat).toFixed(6)),
        longitude: Number((Math.random() * (guangdongBounds.maxLong - guangdongBounds.minLong) + guangdongBounds.minLong).toFixed(6)),
        created: Math.floor(Date.now() / 1000) + idx * 300 // Incrementing timestamp in seconds, 5 minutes apart
      }));

      return Object.assign({
        "errcode": 0,
        "errmsg": "请求成功",
        "data": {
          "tracks": tracks
        }
      }, check(body, {
        "user_id": 1253464, //群Id
        "date": "2024-11-19"
      }))
    }
  },
  {
    url: '/v1/corp/web/location-get-regeo',
    method: 'POST',
    response: (res: any) => {
      const { body = {} } = res
      const guangdongCities = [
        { name: "广州市", adcode: "440100" },
        { name: "深圳市", adcode: "440300" },
        { name: "珠海市", adcode: "440400" },
        { name: "汕头市", adcode: "440500" },
        { name: "佛山市", adcode: "440600" },
        { name: "韶关市", adcode: "440200" },
        { name: "湛江市", adcode: "440800" },
        { name: "肇庆市", adcode: "441200" },
        { name: "江门市", adcode: "440700" },
        { name: "茂名市", adcode: "440900" }
      ];

      const randomCity = guangdongCities[Math.floor(Math.random() * guangdongCities.length)];

      const randomRoad = `${Math.floor(Math.random() * 500)}省道`;
      const randomDistance = Math.floor(Math.random() * 1000);
      const randomPOI = ["公园", "商场", "学校", "医院", "餐厅"][Math.floor(Math.random() * 5)];

      return Object.assign({
        "errcode": 0,
        "errmsg": "请求成功",
        "data": {
          "regeo": {
            "province": "广东省",
            "city": randomCity.name,
            "district": `${randomCity.name.slice(0, -1)}区`,
            "township": `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}镇`,
            "road": randomRoad,
            "number": "",
            "addr": "",
            "name": `${randomRoad}${randomPOI}${randomDistance}米`,
            "adcode": randomCity.adcode,
            "matchs": {
              "aoi_name": "",
              "aoi_distance": 0,
              "poi_name": `${randomRoad}${randomPOI}${randomDistance}米`,
              "poi_distance": `${randomDistance.toFixed(3)}`,
              "roadinter_name": `${randomRoad}与${String.fromCharCode(65 + Math.floor(Math.random() * 26))}大道交叉口${["东", "南", "西", "北"][Math.floor(Math.random() * 4)]}${Math.floor(Math.random() * 1000)}米`,
              "roadinter_distance": `${(Math.random() * 1000).toFixed(3)}`
            },
            "formatted_address": `${randomCity.name}${randomRoad}${randomPOI}${randomDistance}米`
          }
        }
      }, check(body, { "latitude": Number((Math.random() * (25.31 - 20.13) + 20.13).toFixed(5)), "longitude": Number((Math.random() * (117.19 - 109.66) + 109.66).toFixed(5)) }))
    }
  },
  // {
  //   url: '/v1/corp/web/member-getall',
  //   method: 'POST',
  //   response: (res: any) => {
  //     const { body = {} } = res
  //     const members = Array.from({ length: 20 }, (_, i) => generateMember(i));

  //     return Object.assign({
  //       "errcode": 0,
  //       "errmsg": "请求成功",
  //       "data": {
  //         "members": members
  //       }
  //     }, check(body, { "org_num": 100130 }))
  //   }
  // },
  // {
  //   url: '/v1/corp/web/message-get-group-history-message',
  //   method: 'POST',
  //   response: (res: any) => {
  //     const { body = {} } = res

  //     const data = Array.from({ length: 100 }).map((_, idx) => {
  //       const id = idx + 1
  //       return {
  //         user_id: 1253341,
  //         msg_id: id,
  //         // content: "http://weilacorp.oss-cn-shenzhen.aliyuncs.com/media/corpgroup/81000335/20251119audio/1253341_1731989825_5?duration=5",
  //         content: `hello! [吐舌], 杀杀了大家看法路上的风景阿三发生了打[骷髅]飞机啊收到了地方就爱上了附件阿斯顿发射点理发师尽快答复杀了大家看法路上的风景阿三发生了打飞机啊收到了地方就爱上了附件阿斯顿发射点理发师尽快答复杀了大家看法路上的风景阿三发生了打飞机啊收到了地方就爱上了附件阿斯顿发射点理发师尽快答复杀了大家看法路上的风景阿三发生了打飞机啊收到了地方就爱上了附件阿斯顿发射点理发师尽快答复杀了大家看法路上的风景阿三发生了打飞机啊收到了地方就爱上了附件阿斯顿发射点理发师尽快答复杀了大家看法路上的风景阿三发生了打飞机啊收到了地方就爱上了附件阿斯顿发射点理发师尽快答复杀了大家看法路上的风景阿三发生了打飞机啊收到了地方就爱上了附件阿斯顿发射点理发师尽快答复杀了大家看法路上的风景阿三发生了打飞机啊收到了地方就爱上了附件阿斯顿发射点理发师尽快答复杀了大家看法路上的风景阿三发生了打飞机啊收到了地方就爱[中指]上了附件阿斯顿发射点理发师尽快答复杀了大家看法路上的风景阿三发生了打飞机啊收到了地方就爱上了附件阿斯顿发射点理发师尽快答复了大家看法路上的风景阿三发生了打飞机啊收到了地方就爱上了附件阿斯顿发射点理发师尽快答复`,
  //         type: 0,
  //         created: 1731989825
  //       }
  //     }).reverse()

  //     const {
  //       msg_count,
  //       msg_id,
  //     } = body

  //     let messages

  //     if (msg_id === 0) {
  //       messages = data.slice(0, msg_count)
  //     }
  //     else {
  //       const idx = data.findIndex((i) => i.msg_id === msg_id)
  //       messages = data.slice(idx + 1, idx + 1 + msg_count)
  //     }

  //     return Object.assign({
  //       "errcode": 0, "errmsg": "请求成功", "data": {
  //         messages,
  //       }
  //     }, check(body, { "group_id": 81000335, "msg_id": 0, "msg_count": 20, "date": "2024-11-19" }))
  //   }
  // },
] as const

export function check(obj1: object, obj2: object) {
  const keys = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys.length !== keys2.length)
    return { errcode: 1, errmsg: `Length mismatch: ${keys.length} !== ${keys2.length}` }

  for (const key of keys) {
    if (!(key in obj2))
      return { errcode: 1, errmsg: `Missing key: ${key}` }

    const val1 = obj1[key as keyof typeof obj1]
    const val2 = obj2[key as keyof typeof obj2]

    if (typeof val1 !== typeof val2) {
      if (typeof val1 === 'string' && val1 === '' && val2 !== '')
        return { errcode: 1, errmsg: `${key} is empty string` }
      return { errcode: 1, errmsg: `Type mismatch for key: ${key}` }
    }
  }

  return { errcode: 0, errmsg: '' }
}
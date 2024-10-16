import axios from 'axios';
import { createHash } from 'crypto';

function generateMD5(str) {
  return createHash('md5').update(str).digest('hex');
}

function sign(data) {
  const now = Math.floor(new Date().getTime() / 1000).toString();
  const tempData = { ...data, ts: now };
  const keys = Object.keys(tempData).sort();
  const newData = {};
  for (const key of keys) {
    newData[key] = tempData[key];
  }
  newData.key = process.env.SIGN_KEY;

  const queryString = Object.entries(newData)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  return {
    ...data,
    ts: now,
    sign: generateMD5(queryString),
  };
}

export class LeigodAPI {
  /**
   *
   * @param {String} token
   */
  constructor(token = null) {
    this.token = token;
    this.session = axios.create({
      baseURL: 'https://webapi.leigod.com/api',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36 Edg/118.0.0.0',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        Connection: 'keep-alive',
        Accept: 'application/json, text/javascript, */*; q=0.01',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
        DNT: '1',
        Referer: 'https://www.legod.com/',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-site',
      },
    });
  }

  /**
   *
   * @param {String} username
   * @param {String} password
   * @returns
   */
  async login(username, password) {
    const response = await this.session.post(
      '/auth/login/v1',
      sign({
        country_code: 86,
        lang: 'zh_CN',
        mobile_num: username,
        os_type: 4,
        password: generateMD5(password),
        region_code: 1,
        user_type: '0',
        src_channel: 'guanwang',
        username: username,
      }),
    );
    if (response.data['code'] == 0) {
      this.token = response.data['data']['login_info']['account_token'];
      return this.token;
    } else {
      throw new Error(response.data['msg']);
    }
  }

  async getUserInfo() {
    const response = await this.session.post('/user/info', {
      account_token: this.token,
      lang: 'zh_CN',
    });
    if (response.status === 403) {
      throw new Error('Server error.');
    } else {
      if (response.data['code'] == 0) {
        return response.data['data'];
      } else {
        throw new Error(response.data['msg']);
      }
    }
  }

  /**
   *
   * @return {boolean} is paused as bool
   */
  async isTimePaused() {
    const info = await this.getUserInfo();
    const status = info['pause_status_id'];
    if (status == 1) {
      return true;
    } else {
      return false;
    }
  }

  async pauseTime() {
    const response = await this.session.post('/user/pause', {
      account_token: this.token,
      lang: 'zh_CN',
    });
    if (response.status === 403) {
      throw new Error('Server error.');
    } else {
      return response.data['msg'];
    }
  }

  async recoverTime() {
    const response = await this.session.post('/user/recover', {
      account_token: this.token,
      lang: 'zh_CN',
    });
    if (response.status === 403) {
      throw new Error('Server error.');
    } else {
      return response.data['msg'];
    }
  }
}

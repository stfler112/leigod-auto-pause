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
      baseURL: 'https://webapi.leigod.com',
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
        'cache-control': 'no-cache',
        'content-type': 'application/json',
        pragma: 'no-cache',
        priority: 'u=1, i',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-site',
        Referer: 'https://www.leigod.com/',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
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
      '/wap/login/bind/v1',
      sign({
        code: '',
        country_code: 86,
        lang: 'en',
        os_type: 5,
        password: generateMD5(password),
        src_channel: 'guanwang',
        region_code: 1,
        user_type: '0',
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
    const response = await this.session.post('/api/user/info', {
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
    const response = await this.session.post('/api/user/pause', {
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
    const response = await this.session.post('/api/user/recover', {
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

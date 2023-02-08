import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

export function isDevFn(mode) {
  return mode === 'development';
}

export function isProdFn(mode) {
  return mode === 'production';
}

/**
 * Whether to generate package preview
 */
export function isReportMode(){
  return process.env.REPORT === 'true';
}

/**
* Read all environment variable configuration files to process.env
* 读取并处理所有环境变量配置文件 .env
 * @param {*} envConf 
 * @returns 
 */
export function wrapperEnv(envConf){
  let ret  = {};
  for (const envName of Object.keys(envConf)) {
    // 去除空格
    let realName = envConf[envName].replace(/\\n/g, '\n');
    realName = realName === 'true' ? true : realName === 'false' ? false : realName;
    ret[envName] = realName;
    process.env[envName] = realName;
  }
  return ret;
}

/**
 * Get the environment variables starting with the specified prefix
 * @param match prefix
 * @param confFiles ext
 */
export function getEnvConfig(match = 'VITE_GLOB_', confFiles = ['.env', '.env.production']) {
  let envConfig = {};
  confFiles.forEach((item) => {
    try {
      const env = dotenv.parse(fs.readFileSync(path.resolve(process.cwd(), item)));
      envConfig = { ...envConfig, ...env };
    } catch (error) {}
  });

  Object.keys(envConfig).forEach((key) => {
    const reg = new RegExp(`^(${match})`);
    if (!reg.test(key)) {
      Reflect.deleteProperty(envConfig, key);
    }
  });
  return envConfig;
}

/**
 * Get user root directory
 * @param directory file path
 */
export function getRootPath(...directory) {
  return path.resolve(process.cwd(), ...directory);
}

/**
 * Get Proxy
 * @param string target url
 */
export function createProxy(target,items=[]) {
  let ret = {};
  const httpsRE = /^https:\/\//;
  const isHttps = httpsRE.test(target); 
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    // https://github.com/http-party/node-http-proxy#options
    ret[item] = {
      target: target+item,
      changeOrigin: true,
      ws: true,
      rewrite: (path) => path.replace(new RegExp(`^${item}`), ''),
      // https is require secure=false
      // 如果您secure="true"只允许来自 HTTPS 的请求，则secure="false"意味着允许来自 HTTP 和 HTTPS 的请求。
      ...(isHttps ? { secure: false } : {}),
    };
  }
  return ret;
  // return {
  //   '/api': {
  //     target: 'http://localhost/api',
  //     changeOrigin: true,
  //     ws: true,
  //     rewrite: (path) => path.replace(new RegExp(/^\/api/), ''),
  //   },
  //   '/upload': {
  //     target: 'http://localhost/upload',
  //     changeOrigin: true,
  //     ws: true,
  //     rewrite: (path) => path.replace(new RegExp(/^\/upload/), ''),
  //   }
  // }
}
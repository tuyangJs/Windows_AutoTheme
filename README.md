# Windows AutoTheme
<div align="center">
 <img src="https://github.com/user-attachments/assets/c3cdbcf6-6bdc-4e91-a84a-55ef109c60f5" alt="Screenshot 1" width="100%">

 #### Language: [中文](/README.md) | [English](/README-English.md)
 </div>

> 现已登陆 **Microsoft Store**！获取更安全的安装体验和自动更新


## 概述

**Windows AutoTheme** 是一个轻量级的 Windows 主题自动切换工具，支持系统在日间使用浅色模式，夜间切换为深色模式。<br />
该项目利用 Rust 构建后端代码来执行系统操作，并采用 TypeScript 与 Ant Design 5 构建前端界面。<br />同时，它通过内置免费 API 获取日出和日落数据，实现智能自动切换主题模式。
<div align="center">
  <img src="https://github.com/user-attachments/assets/8ed6411d-cc19-4884-a2b6-8d0d65f64078" alt="Screenshot 2"  width="55%">
 </div>

---




## 🛠️ 安装方式
### 推荐安装（Microsoft Store）：
[![获取应用](https://get.microsoft.com/images/zh-cn%20light.svg)](https://apps.microsoft.com/detail/9n7nd584tdv1)


### 传统安装：
>打开我们的[发行页面](https://github.com/tuyangJs/Windows_AutoTheme/releases)，下载最新版本的安装包。


## 功能特点

- **自动切换**：根据日出、日落时间自动切换 Windows 主题模式。
- **高效轻量**：使用 Rust 提供高效的系统调用，保证运行稳定。
- **现代前端**：前端采用 TypeScript 与 Ant Design 5 定制界面，简洁美观。
- **免费天文数据支持**：集成免费 API，实时获取日出和日落时间。

---

## 截图

<div align="center">
  <img src="https://github.com/user-attachments/assets/5f0c5730-a398-482c-8e6c-e49067d2fe24" alt="pshotA.png" width="45%" style="margin-right: 5%;">
</div>

---

## 打赏

<img src="https://github.com/user-attachments/assets/1be236a6-504a-4beb-b76c-ba6192730ef3" alt="支付宝.png" width="45%" style="margin-right: 5%;">
<img src="https://github.com/user-attachments/assets/5e6f50f5-6712-429a-8c7f-d6ceb87a6cd6" alt="微信.png" width="45%" style="margin-right: 5%;">



## 开发调试
安装依赖
```
npm install
```
调试
```
npm start
```
编译
```
npm run tauri build
```
### 云端 Windows 打包

将代码和 `.github/workflows/windows-build.yml` 推送到 GitHub 后，推送到 `main` 或向 `main` 提交 PR 会触发 **Windows Build**。工作流进入默认分支后，也可以在仓库的 **Actions → Windows Build → Run workflow** 手动运行；如果 fork 的 Actions 尚未启用，先在 Actions 页面启用。

来自 fork 的 PR 构建可能需要维护者批准运行。此工作流上传构建产物，不会自动发布 GitHub Release 或 Microsoft Store 更新。

工作流先运行回归测试，再生成 Windows x64 NSIS 安装包。构建成功后，在该次运行页面的 **Artifacts** 下载 **AutoThemeMode-windows-x64**，解压后运行 `*-setup.exe`。文件保留 14 天，安装包未配置代码签名。

## 其它仓库
- Gitee (国内推荐): [https://gitee.com/ilinxuan/windows_-auto-theme](https://gitee.com/ilinxuan/windows_-auto-theme) 
- GitHub: [https://github.com/tuyangJs/Windows_AutoTheme](https://github.com/tuyangJs/Windows_AutoTheme) 

## 联系作者

- QQ群 : [703623743](http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=IVNKPTJ9WqoIHHCsy7UMkQd16NLnfjeD&authKey=WVTDqfUgdv9oV0d8%2BZz5krS98IIlB1Kuvm%2BS3pfMU1H6FBCV1b2xoG5pWsggiAgt&noverify=0&group_code=703623743) 
- Email : [ihanlong@qq.com](ihanlong@qq.com) 

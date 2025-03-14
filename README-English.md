# Windows AutoTheme
<div align="center">
 <img src="https://github.com/user-attachments/assets/c3cdbcf6-6bdc-4e91-a84a-55ef109c60f5" alt="Screenshot 1" width="100%">
 
#### Language: [中文](/README.md) | [English](/README-English.md)

 </div>
## Overview

**Windows AutoTheme** is a lightweight utility that automatically switches your Windows theme based on the time of day. In accordance with Windows’ official guidelines, “light mode” features a predominantly light (often white) background with dark text for optimal clarity, while “dark mode” uses a dark background paired with light text to reduce eye strain in low-light conditions. With Windows AutoTheme, your system uses light mode during the day and seamlessly transitions to dark mode at night. The backend is built in Rust for efficient system operations, and the frontend is developed using TypeScript and Ant Design 5 to deliver a modern, visually appealing interface. Additionally, the tool utilizes a built-in free API to fetch sunrise and sunset data, enabling intelligent and automated theme switching.

---

## Key Features

- **Automatic Theme Switching:** Dynamically toggles between light and dark modes—light mode for daytime and dark mode for nighttime—based on official Windows theme definitions.
- **Efficient and Lightweight:** Utilizes Rust for high-performance system calls, ensuring stable and responsive operation.
- **Modern User Interface:** The frontend is built with TypeScript and a customized Ant Design 5 interface, offering a clean, modern, and attractive design.
- **Free Astronomical Data Integration:** Integrates a free API to retrieve real-time sunrise and sunset times, guiding the automatic theme transitions.

---

## Screenshots

<div align="center">
  <img src="https://github.com/user-attachments/assets/8ed6411d-cc19-4884-a2b6-8d0d65f64078" alt="Screenshot 2"  width="55%">
 </div>

---

## Installation and Usage

### Prerequisites

- Windows 10 version 21H2 or later
- [Microsoft Edge WebView2](https://tauri.studio/) (required runtime environment)  
    _Note: Early builds of Windows 10 version 20H2 require manual installation of the WebView2 Runtime._

### Installation

Visit our [releases page](https://github.com/tuyangJs/Windows_AutoTheme/releases) and download the latest installer package.

---

## Development and Debugging

To set up the project for development:

1. **Install Dependencies:**
    
``` 
    npm install
```
    
2. **Debug the Application:**
    
``` 
    npm start
 ``` 
    
3. **Build the Project:**
``` 
    npm run tauri build
``` 

---

## Additional Repositories

- **Gitee (Recommended for China users):** [https://gitee.com/ilinxuan/windows_-auto-theme](https://gitee.com/ilinxuan/windows_-auto-theme)
- **GitHub:** [https://github.com/tuyangJs/Windows_AutoTheme](https://github.com/tuyangJs/Windows_AutoTheme)

---

## Contact the Author

- **QQ Group:** [703623743](http://qm.qq.com/cgi-bin/qm/qr?_wv=1027&k=IVNKPTJ9WqoIHHCsy7UMkQd16NLnfjeD&authKey=WVTDqfUgdv9oV0d8%2BZz5krS98IIlB1Kuvm%2BS3pfMU1H6FBCV1b2xoG5pWsggiAgt&noverify=0&group_code=703623743)
- **Email:** [ihanlong@qq.com](ihanlong@qq.com)

---

This translation not only conveys the technical details and features of Windows AutoTheme but also aligns with the official Windows descriptions of light and dark themes.

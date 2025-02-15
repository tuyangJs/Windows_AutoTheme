export interface UpdateType {
    releaseNotes: string;
    latestVersion: string;
    releaseUrl: string;
  }
  
  export function formatVersion(version: string): string {
    return version.replace(/^v/, "").trim();
  }
  
  export function compareVersions(a: string, b: string): number {
    const aParts = a.split(".").map(Number);
    const bParts = b.split(".").map(Number);
    const len = Math.max(aParts.length, bParts.length);
    for (let i = 0; i < len; i++) {
      const aNum = aParts[i] || 0;
      const bNum = bParts[i] || 0;
      if (aNum !== bNum) {
        return aNum - bNum;
      }
    }
    return 0;
  }
  
  export function isNewerVersion(current: string, latest: string): boolean {
    return compareVersions(current, latest) < 0;
  }
  
  export function parseBetaVersion(version: string): { base: string; beta: number } | null {
    const parts = version.split("-beta.");
    if (parts.length !== 2) return null;
    return { base: parts[0], beta: parseInt(parts[1]) };
  }
  
  export async function checkForUpdates(currentVersion: string): Promise<UpdateType | null> {
    const repo = "tuyangJs/Windows_AutoTheme";
    const apiUrl = `https://api.github.com/repos/${repo}/releases?per_page=100`;
    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`GitHub API 请求失败: ${response.status}`);
      }
      const releases = await response.json();
  
      let update: UpdateType | null = null;
      // 对于 beta 用户，提取基础版本
      const currentVerFormatted = currentVersion.trim();
      const currentIsBeta = currentVerFormatted.includes("beta");
      const currentBase = currentIsBeta ? currentVerFormatted.split("-")[0].trim() : currentVerFormatted;
  
      if (currentIsBeta) {
        // 1. 先检测同一基础版本下的新 beta 版本
        const currentBeta = parseBetaVersion(currentVerFormatted)?.beta || 0;
        const betaReleases = releases.filter((r: any) =>
          r.prerelease &&
          !r.tag_name.includes("next") &&
          formatVersion(r.tag_name).startsWith(`${currentBase}-beta.`)
        );
       // console.log("筛选出的 beta 版本:", betaReleases.map((r: any) => formatVersion(r.tag_name)));
        betaReleases.sort((a: any, b: any) => {
          const aBeta = parseBetaVersion(formatVersion(a.tag_name))?.beta || 0;
          const bBeta = parseBetaVersion(formatVersion(b.tag_name))?.beta || 0;
          return aBeta - bBeta;
        });
        const latestBeta = betaReleases.find((r: any) => {
          const candidateBeta = parseBetaVersion(formatVersion(r.tag_name))?.beta || 0;
          return candidateBeta > currentBeta;
        });
        if (latestBeta) {
          update = {
            latestVersion: formatVersion(latestBeta.tag_name),
            releaseNotes: latestBeta.body,
            releaseUrl: latestBeta.html_url,
          };
          console.log(`检测到新测试版本: v${update.latestVersion}`);
          return update;
        } else {
          // 2. 如果没有新的 beta，回退检测正式版更新
          const officialReleases = releases.filter((r: any) => !r.prerelease && !r.draft);
          console.log("beta fallback - 正式版本:", officialReleases.map((r: any) => formatVersion(r.tag_name)));
          // 优先查找与基础版本完全匹配的正式版
          const matchingOfficial = officialReleases.find((r: any) =>
            formatVersion(r.tag_name) === currentBase
          );
          if (matchingOfficial) {
            // 如果正式版与基础版本数值上相等，但当前是 beta 版，则也认为有更新（从 beta 升级到稳定版）
            if (isNewerVersion(currentBase, formatVersion(matchingOfficial.tag_name)) ||
                (currentIsBeta && compareVersions(currentBase, formatVersion(matchingOfficial.tag_name)) === 0)) {
              update = {
                latestVersion: formatVersion(matchingOfficial.tag_name),
                releaseNotes: matchingOfficial.body,
                releaseUrl: matchingOfficial.html_url,
              };
              console.log(`beta fallback - 检测到正式版更新: v${update.latestVersion}`);
              return update;
            }
          }
          // 或者取最新的正式版
          if (officialReleases.length > 0) {
            officialReleases.sort((a: any, b: any) => compareVersions(formatVersion(a.tag_name), formatVersion(b.tag_name)));
            const latestOfficial = officialReleases[officialReleases.length - 1];
            if (isNewerVersion(currentBase, formatVersion(latestOfficial.tag_name)) ||
                (currentIsBeta && compareVersions(currentBase, formatVersion(latestOfficial.tag_name)) === 0)) {
              update = {
                latestVersion: formatVersion(latestOfficial.tag_name),
                releaseNotes: latestOfficial.body,
                releaseUrl: latestOfficial.html_url,
              };
              console.log(`beta fallback - 检测到正式版更新: v${update.latestVersion}`);
              return update;
            }
          }
          return null;
        }
      } else {
        // 正式版逻辑，只检测正式发布（排除 draft 与 prerelease）
        const officialReleases = releases.filter((r: any) => !r.prerelease && !r.draft);
       // console.log("筛选出的正式版本:", officialReleases.map((r: any) => formatVersion(r.tag_name)));
        if (officialReleases.length === 0) return null;
        officialReleases.sort((a: any, b: any) => compareVersions(formatVersion(a.tag_name), formatVersion(b.tag_name)));
        const latestOfficial = officialReleases[officialReleases.length - 1];
        console.log("当前版本:", currentVerFormatted, "最新正式版本:", formatVersion(latestOfficial.tag_name));
        if (isNewerVersion(currentVerFormatted, formatVersion(latestOfficial.tag_name))) {
          update = {
            latestVersion: formatVersion(latestOfficial.tag_name),
            releaseNotes: latestOfficial.body,
            releaseUrl: latestOfficial.html_url,
          };
          console.log(`检测到新正式版本: v${update.latestVersion}`);
          return update;
        }
        return null;
      }
    } catch (error) {
      console.error("检测更新失败:", error);
      return null;
    }
  }
  
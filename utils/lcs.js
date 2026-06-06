function longestCommonSubstring(s1, s2) {
  const m = s1.length;
  const n = s2.length;
  let maxLen = 0;
  const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
        maxLen = Math.max(maxLen, dp[i][j]);
      }
    }
  }

  return maxLen;
}

module.exports = { longestCommonSubstring };

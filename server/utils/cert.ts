// 格式化SAML证书，确保证书格式正确无误
export function formatSamlCert(cert: string): string {
  if (!cert) {
    return cert;
  }

  // 移除证书的头部和尾部，并清理所有空白字符
  const certBody = cert
    .replace("-----BEGIN CERTIFICATE-----", "")
    .replace("-----END CERTIFICATE-----", "")
    .replace(/\s/g, ""); // 移除所有空格、换行符等

  // 将清理后的证书内容每64个字符进行换行
  const chunks = certBody.match(/.{1,64}/g) || [];

  // 重新组合为标准的PEM格式
  return [
    "-----BEGIN CERTIFICATE-----",
    ...chunks,
    "-----END CERTIFICATE-----",
  ].join("\n");
}

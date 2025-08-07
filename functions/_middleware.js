// Cloudflare Pages Middleware for SAML API
export function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  // 检查是否是SAML API请求
  if (url.pathname.startsWith('/api/auth/saml/')) {
    console.log('SAML API请求:', url.pathname);
    
    // 设置必要的响应头
    const response = context.next();
    
    // 添加CORS头
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // 禁用Cloudflare缓存
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    // 允许重定向
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    
    return response;
  }
  
  // 对于其他请求，正常处理
  return context.next();
}

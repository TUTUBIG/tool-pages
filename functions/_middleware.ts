/// <reference types="@cloudflare/workers-types" />

export const onRequest: PagesFunction = async (context) => {
    const url = new URL(context.request.url);
    const response = await context.next();
  
    if (url.hostname.endsWith('.pages.dev')) {
      response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    }
  
    return response;
  };  
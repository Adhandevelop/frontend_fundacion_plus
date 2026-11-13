export function publicMediaUrl(value:string|null|undefined):string {
  const raw=(value??'').trim();if(!raw)return '';
  try {
    const parsed=new URL(raw,typeof location==='undefined'?'https://fundacionplus.site':location.origin);
    const path=`${parsed.pathname}${parsed.search}`;
    if(path.startsWith('/api/'))return path;
    if(path.startsWith('/media/'))return `/api/v1/public/media/${path.slice('/media/'.length)}`;
    if(!raw.startsWith('/')&&!/^https?:/i.test(raw))return `/api/v1/public/media/${raw.replace(/^\/+/, '')}`;
    return path;
  } catch {return raw;}
}

import { StrictMode,useEffect,useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { fetchContent,readInitialContent } from './runtime/api';
import { installContent } from './runtime/catalog';
import './index.css';
const initial=readInitialContent();if(initial)installContent(initial);
function SiteLoader(){
 const [version,setVersion]=useState(initial?.version);const [error,setError]=useState('');const [loading,setLoading]=useState(!initial);
 const load=async(force=false)=>{setLoading(true);setError('');try{const content=await fetchContent(force);installContent(content);setVersion(content.version);}catch(e){setError(e instanceof Error?e.message:'Could not load holiday content.');}finally{setLoading(false);}};
 useEffect(()=>{void load();const onFocus=()=>{void load();};window.addEventListener('focus',onFocus);return()=>window.removeEventListener('focus',onFocus);},[]);
 if(error&&!version)return <main className="min-h-screen bg-[#FDFBF7] text-[#0B5E8E] grid place-content-center text-center p-8 gap-5"><h1 className="font-serif text-3xl">We couldn’t load the holiday content</h1><p role="alert">{error}</p><button className="rounded-xl bg-[#0B5E8E] text-white p-3" onClick={()=>void load(true)}>Retry</button><a href="/contact">Contact our travel specialists</a></main>;
 if(!version)return <main className="min-h-screen grid place-content-center" role="status">Loading Outbound Holidays…</main>;
 return <>{error&&<aside role="alert" className="bg-amber-50 text-amber-950 p-4 text-sm text-center">Live content could not be refreshed. You’re viewing the latest published page content; enquiries still require a live save. <button className="underline font-bold" onClick={()=>void load(true)}>Retry connection</button></aside>}<div aria-live="polite" className="sr-only">{loading?'Refreshing holiday content':''}</div><App contentVersion={version}/></>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><SiteLoader/></StrictMode>);

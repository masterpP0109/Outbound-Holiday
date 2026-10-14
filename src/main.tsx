import { StrictMode,useEffect,useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { fetchContent,readInitialContent } from './runtime/api';
import { installContent } from './runtime/catalog';
import './index.css';
import { installFetchLogging } from './runtime/fetch-log';

installFetchLogging();
const initial=readInitialContent();
installContent(initial);
function SiteLoader(){
 const [version,setVersion]=useState(initial.version);
 useEffect(()=>{
  let active=true;
  const refresh=async()=>{
   try{
    const content=await fetchContent();
    if(active){installContent(content);setVersion(content.version);}
   }catch{ /* Keep the published page available during an API outage. */ }
  };
  void refresh();
  const onFocus=()=>{void refresh();};
  window.addEventListener('focus',onFocus);
  const timer=window.setInterval(()=>void refresh(),60000);
  return()=>{active=false;window.clearInterval(timer);window.removeEventListener('focus',onFocus);};
 },[]);
 return <App contentVersion={version}/>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><SiteLoader/></StrictMode>);

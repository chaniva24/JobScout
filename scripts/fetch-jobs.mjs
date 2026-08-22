import {mkdir,writeFile} from 'node:fs/promises';
const {ADZUNA_APP_ID,ADZUNA_APP_KEY}=process.env;if(!ADZUNA_APP_ID||!ADZUNA_APP_KEY)throw new Error('Add ADZUNA_APP_ID and ADZUNA_APP_KEY as repository secrets.');
const searches=['casual','internship','graduate','part time'];
const pages=await Promise.all(searches.map(async term=>{const url=new URL(`https://api.adzuna.com/v1/api/jobs/au/search/1`);url.search=new URLSearchParams({app_id:ADZUNA_APP_ID,app_key:ADZUNA_APP_KEY,results_per_page:'50',what:term,content_type:'application/json'});const res=await fetch(url);if(!res.ok)throw new Error(`Adzuna returned ${res.status}`);return(await res.json()).results||[]}));
const seen=new Set();const jobs=pages.flat().filter(j=>!seen.has(j.id)&&seen.add(j.id)).map(j=>({id:j.id,title:j.title,company:j.company?.display_name||'Employer',location:j.location?.display_name||'Australia',description:j.description||'',url:j.redirect_url,created:j.created,type:''})).sort((a,b)=>new Date(b.created)-new Date(a.created));
await mkdir('data',{recursive:true});await writeFile('data/jobs.json',JSON.stringify(jobs,null,2)+'\n');console.log(`Saved ${jobs.length} jobs`);

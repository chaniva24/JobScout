import {mkdir,writeFile} from 'node:fs/promises';

const jobs=[];

async function fetchHimalayas(){
  const url=new URL('https://himalayas.app/jobs/api/search');
  url.search=new URLSearchParams({country:'AU',sort:'recent',page:'1'});
  const response=await fetch(url,{headers:{'User-Agent':'JobScout-Australia/1.0'}});
  if(!response.ok)throw new Error(`Himalayas returned ${response.status}`);
  const data=await response.json();
  return (data.jobs||[]).map(job=>({
    id:`himalayas-${job.guid}`,title:job.title,company:job.companyName||'Employer',
    location:job.locationRestrictions?.length?`Remote — ${job.locationRestrictions.map(place=>place.name).join(', ')}`:'Remote — worldwide',
    description:job.excerpt||job.description||'',url:job.applicationLink,
    created:new Date(job.pubDate).toISOString(),
    type:job.employmentType==='Part Time'?'Part-time':job.employmentType==='Intern'?'Internship':'',source:'Himalayas'
  }));
}

async function fetchAdzuna(){
  const {ADZUNA_APP_ID,ADZUNA_APP_KEY}=process.env;
  if(!ADZUNA_APP_ID||!ADZUNA_APP_KEY)return [];
  const searches=['casual','internship','graduate','part time'];
  const pages=await Promise.all(searches.map(async term=>{
    const url=new URL('https://api.adzuna.com/v1/api/jobs/au/search/1');
    url.search=new URLSearchParams({app_id:ADZUNA_APP_ID,app_key:ADZUNA_APP_KEY,results_per_page:'50',what:term,content_type:'application/json'});
    const response=await fetch(url);if(!response.ok)throw new Error(`Adzuna returned ${response.status}`);
    return (await response.json()).results||[];
  }));
  return pages.flat().map(job=>({id:`adzuna-${job.id}`,title:job.title,company:job.company?.display_name||'Employer',location:job.location?.display_name||'Australia',description:job.description||'',url:job.redirect_url,created:job.created,type:'',source:'Adzuna'}));
}

const results=await Promise.allSettled([fetchHimalayas(),fetchAdzuna()]);
for(const result of results){if(result.status==='fulfilled')jobs.push(...result.value);else console.warn(result.reason.message)}
const seen=new Set();
const unique=jobs.filter(job=>job.id&&job.url&&!seen.has(job.id)&&seen.add(job.id)).sort((a,b)=>new Date(b.created)-new Date(a.created));
if(!unique.length)throw new Error('No job source returned listings; keeping the existing data file.');
await mkdir('data',{recursive:true});await writeFile('data/jobs.json',JSON.stringify(unique,null,2)+'\n');
console.log(`Saved ${unique.length} real jobs`);

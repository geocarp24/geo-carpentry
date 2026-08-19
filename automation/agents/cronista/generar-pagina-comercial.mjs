import fs from 'node:fs';
import { spawn } from 'node:child_process';
const ROOT='/opt/alex-bot';
const env=Object.fromEntries(fs.readFileSync(ROOT+'/.env','utf8').split('\n').filter(l=>l.includes('=')&&!l.trim().startsWith('#')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const cfg=JSON.parse(fs.readFileSync(ROOT+'/agents/tenants/geo-carpentry.json','utf8'));

const prompt = `Write a commercial construction service page for Geo Carpentry LLC.

The business, all verified facts, do not add any others:
- Licensed general contractor in Green Bay, Wisconsin. Owner Jorge Cruz, working since 2014.
- Credentials: Wisconsin Dwelling Contractor 823-DCFR, qualifier 1053-DCQ. Fully insured.
- Address 735 E Walnut St Suite 3, Green Bay, WI. Phone (920) 367-1272.
- Bilingual English and Spanish crew, and Jorge himself is bilingual.
- Serves Green Bay, Appleton, Oshkosh, De Pere, Howard.
- Does commercial construction. Also kitchens, bathrooms, decks, finish carpentry, additions, framing, custom homes, basement finishing.

Hard limits:
- Do NOT claim industrial-scale work. That is unconfirmed.
- Do NOT claim custom cabinet making from scratch. They install and finish, they do not run a cabinet shop.
- Do NOT invent project counts, square footage, client names, awards, prices or review numbers. If a number would help and you do not have it, leave it out.
- Do NOT claim experience in commercial work beyond what is stated. Write about capability and process, not about a portfolio you cannot verify.

Search context: the site currently ranks around position 20 for "commercial carpentry contractors green bay" and "commercial general contractors green bay" without having a single page about commercial work. This page is meant to own those queries.

Audience: a business owner, property manager or landlord in Northeast Wisconsin who needs a contractor for an office, retail space, restaurant or tenant build-out. They care about scheduling around their operations, permits, insurance, and whether the contractor disappears halfway.

Style: plain, warm, direct. Written by a contractor, not a marketer. No hype. No em dashes. Do not stack adjectives in threes. 800 to 1200 words.

Include these internal links naturally as markdown links:
- https://geocarpentry.com/services/construction/
- https://geocarpentry.com/general-construction/green-bay-wi/
- https://geocarpentry.com/quote/

Return ONLY this:

---TITLE---
(under 60 characters)
---SLUG---
(lowercase-hyphenated)
---META---
(under 150 characters)
---BODY---
(markdown, starts with an H2, no H1)
`;

const raw = await new Promise((resolve,reject)=>{
  const c=spawn(cfg.claude.binary_path,['--print','--permission-mode','acceptEdits','--allowed-tools','WebFetch,WebSearch,Read','--',prompt],{stdio:['ignore','pipe','pipe']});
  let o='',e='';const t=setTimeout(()=>{c.kill('SIGKILL');reject(new Error('timeout'))},900000);
  c.stdout.on('data',d=>o+=d);c.stderr.on('data',d=>e+=d);
  c.on('close',k=>{clearTimeout(t);k===0?resolve(o):reject(new Error('claude exit '+k+': '+e.slice(0,300)))});
});
const grab=(a,b)=>{const m=raw.match(new RegExp(`---${a}---\s*([\s\S]*?)\s*(?=---${b}---|$)`));return m?m[1].trim():''};
const art={title:grab('TITLE','SLUG'),slug:grab('SLUG','META'),meta:grab('META','BODY'),body:grab('BODY','ZZZ')};
if(!art.title||art.body.length<1500){console.error('salida incompleta:',art.title.length,art.body.length);process.exit(1);}

const res=await fetch('https://api.airtable.com/v0/appAQpveuAec077jF/tblpiN42pK3YFxGEW',{
  method:'POST',headers:{Authorization:'Bearer '+env.AIRTABLE_TOKEN_GEO,'Content-Type':'application/json'},
  body:JSON.stringify({records:[{fields:{
    run_id:'cronista-comercial-2026-08-18', tenant_id:'geo-carpentry', status:'Review',
    content_type:'pillar_page', title:art.title, target_keyword:'commercial general contractors green bay',
    intent_query:'commercial carpentry contractors green bay', body_md:art.body,
    meta_description:art.meta, slug:art.slug, word_count:art.body.split(/\s+/).length,
    suggested_internal_links:'https://geocarpentry.com/services/construction/\nhttps://geocarpentry.com/general-construction/green-bay-wi/\nhttps://geocarpentry.com/quote/',
    language:'en', source_idea_id:'gsc:20impr:pos20.4:sin-pagina',
    run_started_at:new Date().toISOString(),
  }}]})});
if(!res.ok){console.error('Airtable',res.status,(await res.text()).slice(0,300));process.exit(1);}
console.log('EN COLA para revision');
console.log('  titulo:',art.title);
console.log('  slug: ',art.slug);
console.log('  meta: ',art.meta.length,'caracteres');
console.log('  cuerpo:',art.body.split(/\s+/).length,'palabras');

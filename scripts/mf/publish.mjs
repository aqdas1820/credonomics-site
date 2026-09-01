import fs from 'node:fs'
import path from 'node:path'
const arg=name=>process.argv.find(x=>x.startsWith(`--${name}=`))?.slice(name.length+3)
const staging=path.resolve(arg('staging')??'data/mf-production-staging/v2'),production=path.resolve(arg('production')??'public/data/mf-intelligence/v2'),validation=JSON.parse(fs.readFileSync(path.join(staging,'.validation.json'),'utf8'))
if(validation.status!=='PASSED')throw new Error('Publish blocked: staging has not passed validation')
const temp=path.join(path.dirname(production),`.${path.basename(production)}-publish-temp`),backup=path.join(path.dirname(production),`.${path.basename(production)}-publish-backup`);fs.rmSync(temp,{recursive:true,force:true});fs.cpSync(staging,temp,{recursive:true});fs.rmSync(path.join(temp,'.validation.json'));fs.rmSync(backup,{recursive:true,force:true})
try{if(fs.existsSync(production))fs.renameSync(production,backup);fs.renameSync(temp,production);fs.rmSync(backup,{recursive:true,force:true})}catch(error){if(!fs.existsSync(production)&&fs.existsSync(backup))fs.renameSync(backup,production);fs.rmSync(temp,{recursive:true,force:true});throw error}console.log(`MF production published atomically to ${production}`)

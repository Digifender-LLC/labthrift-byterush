import {test} from 'node:test';
import assert from 'node:assert/strict';
import {useApp,attachAccount,detachAccount,syncNow} from '../src/lib/store';
import {EMPTY_PROGRESS,mergeProgress,resetSnapshot} from '../src/lib/syncTypes';
import {actOnProject} from '../src/lib/projectProgress';
test('anonymous attach, account switching, offline recovery and reset retry isolate owners',async()=>{
 let remote={...EMPTY_PROGRESS};let offline=false;
 globalThis.fetch=async(_url,options)=>{
  if(offline)throw new Error('offline');
  if(options?.method==='PUT')remote=mergeProgress(JSON.parse(options.body as string).progress,remote);
  if(options?.method==='DELETE'){const r=JSON.parse(options.body as string);if(remote.resetId!==r.id&&remote.generation===r.generation)remote=resetSnapshot(remote,r.id);}
  return new Response(JSON.stringify({progress:remote}),{headers:{'Content-Type':'application/json'}});
 };
 useApp.setState({...actOnProject(EMPTY_PROGRESS,'first-ssh',{type:'resume'}),progressUserId:null,user:null});
 await attachAccount({id:'a',username:'a'});assert.ok(remote.projects['first-ssh']);assert.ok(JSON.parse(localStorage.getItem('byterush-store')!).state.projects['first-ssh']);
 remote={...EMPTY_PROGRESS};await attachAccount({id:'b',username:'b'});assert.deepEqual(useApp.getState().projects,{});assert.deepEqual(remote.projects,{});
 useApp.getState().projectAction('first-ssh',{type:'resume'});useApp.getState().projectAction('first-ssh',{type:'advance',next:'gloss'});
 offline=true;await syncNow();assert.equal(useApp.getState().xp,60);assert.equal(remote.xp,0);
 offline=false;await syncNow();assert.equal(remote.xp,60);
 offline=true;useApp.getState().resetProgress();await syncNow();assert.equal(useApp.getState().xp,0);assert.ok(useApp.getState().pendingReset);
 offline=false;await syncNow();assert.equal(remote.xp,0);assert.equal(useApp.getState().pendingReset,null);
 useApp.getState().projectAction('first-ssh',{type:'resume'});await syncNow();
 detachAccount();assert.equal(useApp.getState().progressUserId,null);assert.deepEqual(useApp.getState().projects,{});
});

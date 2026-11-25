/* ================================================================
   校园闲置 · 多用户在线版
   数据总线：公共 MQTT broker (wss)，所有访问者共享同一份数据
   ================================================================ */
const $=s=>document.querySelector(s);
const $$=s=>[...document.querySelectorAll(s)];
const NS='campus2nd_v1/';
/* 访客模式开关：true=隐藏登录页，自动分配 1~10 号账号；false=还原正常登录 */
const GUEST_MODE=true;
const SEED_USERS=['爱整理的小周','数码 scavenger','早睡冠军','衣柜断舍离','上岸学长'];
const SEED_PASS='123456';
const SEED_PRODUCTS=[
  {id:'p1',emoji:'📚',name:'高等数学 第七版 上册 同济版 笔记干净',price:18,cond:'九成新',cat:'教材书籍',sub:'专业课教材',owner:'爱整理的小周',desc:'大一高数教材，内容完整，后面几章有少量铅笔笔记（可擦）。支持校内中转站交易，买家到站现场验货后确认收货，放心购～'},
  {id:'p2',emoji:'🎧',name:'蓝牙耳机 半入耳式 音质很好 续航给力',price:45,cond:'八成新',cat:'电子数码配件',sub:'耳机',owner:'数码 scavenger',desc:'用了半年，音质在线，附赠充电线。功能一切正常，欢迎到站点试听验货。'},
  {id:'p3',emoji:'🪴',name:'宿舍小台灯 夹式暖光 三档调光护眼',price:12,cond:'九成新',cat:'宿舍家具',sub:null,owner:'早睡冠军',desc:'夹在床架或书桌上都行，暖光很舒服，搬宿舍用不上了。'},
  {id:'p4',emoji:'🧥',name:'春秋薄外套 M码 只穿过两次',price:39,cond:'九成新',cat:'服饰鞋包',sub:'上衣',owner:'衣柜断舍离',desc:'买小了只穿两次，无任何瑕疵，可以到站点试穿确认。'},
  {id:'p5',emoji:'📖',name:'英语四级真题套装 全套带解析 送答题卡',price:15,cond:'八成新',cat:'教材书籍',sub:'考证资料',owner:'上岸学长',desc:'做过一部分，解析册全新未拆。过了就出，概率论满分感谢它。'},
  {id:'p6',emoji:'🔌',name:'三合一数据线 Type-C/苹果/安卓 1.2m',price:8,cond:'全新',cat:'电子数码配件',sub:'数据线',owner:'数码 scavenger',desc:'囤多了全新未拆封，一条顶三条，宿舍桌面清爽神器。'},
  {id:'p7',emoji:'📦',name:'收纳箱大号两个 带滑轮 可叠放',price:20,cond:'八成新',cat:'生活用品',sub:'收纳箱',owner:'早睡冠军',desc:'毕业清宿舍，两个一起出，滑轮顺滑，装被子装书都行。'},
  {id:'p8',emoji:'👕',name:'加绒卫衣 L码 冬天太暖和了',price:55,cond:'九成新',cat:'服饰鞋包',sub:'上衣',owner:'衣柜断舍离',desc:'去年冬天买的，今年回了南方穿不上。绒很厚实，尺码标准。'},
  {id:'p9',emoji:'🏀',name:'篮球 七号球 气很足 适合操场',price:35,cond:'八成新',cat:'文体用品',sub:'球类',owner:'上岸学长',desc:'打了两个学期，表皮轻微磨损，弹性很好，毕业出。'},
  {id:'p10',emoji:'✏️',name:'文具套装大礼包 笔记本+笔+荧光笔',price:9,cond:'全新',cat:'文体用品',sub:'文具',owner:'爱整理的小周',desc:'社团抽奖多出来的全新套装，一件没拆。'},
  {id:'p11',emoji:'🧴',name:'护肤品水乳套装 敏感肌可用',price:60,cond:'八成新',cat:'美妆杂物',sub:'护肤品',owner:'衣柜断舍离',desc:'买错肤质了，只用过两三次，专柜小票还在。'},
  {id:'p12',emoji:'☂️',name:'自动长柄雨伞 抗风骨架 深灰',price:10,cond:'九成新',cat:'生活用品',sub:'雨伞',owner:'早睡冠军',desc:'宿舍囤了两把，出一把，骨架很结实。'},
  {id:'p13',emoji:'🖱️',name:'无线键鼠套装 静音轴 打字舒服',price:49,cond:'九成新',cat:'电子数码配件',sub:'鼠标键盘',owner:'数码 scavenger',desc:'换了机械键盘所以出，键鼠都很静音，适合图书馆。'},
  {id:'p14',emoji:'📝',name:'考研笔记习题集 手写整理全套',price:25,cond:'九成新',cat:'教材书籍',sub:'笔记习题集',owner:'上岸学长',desc:'一战上岸的手写笔记，重点标注超全，学妹学弟冲。'},
];
const CATS=[
  {major:'教材书籍',subs:['专业课教材','考证资料','课外读物','笔记习题']},
  {major:'电子数码',subs:['耳机','数据线','充电宝','鼠标键盘','支架','小配件']},
  {major:'生活用品',subs:['收纳箱','水杯','雨伞','清洁工具','床品织物']},
  {major:'服饰鞋包',subs:['上衣','裤装','鞋子','包包','配饰']},
  {major:'文体用品',subs:['文具','画板','球类','乐器','运动器材']},
  {major:'宿舍家具',subs:['床上桌','收纳架','椅子','小置物架']},
  {major:'美妆杂物',subs:['护肤小样','化妆工具']},
  {major:'食品零食',subs:['冲泡饮品','零食礼盒','特产','代餐食品']},
  {major:'二次元周边',subs:['徽章','立牌','吧唧','海报','谷圈周边','cos道具']},
  {major:'其他闲置',subs:['未归类杂项']},
];
/* 兼容早期线上数据里的旧分类名 */
const CAT_MAP={'教材':'教材书籍','电子配件':'电子数码','电子数码配件':'电子数码','衣物':'服饰鞋包','耳机':'电子数码','数据线':'电子数码','鼠标键盘':'电子数码','充电宝':'电子数码','支架':'电子数码','收纳箱':'生活用品','雨伞':'生活用品','水壶':'生活用品','清洁工具':'生活用品','上衣':'服饰鞋包','裤子':'服饰鞋包','包包':'服饰鞋包','鞋子':'服饰鞋包','球类':'文体用品','文具':'文体用品','画板':'文体用品','乐器':'文体用品','收纳架':'宿舍家具','床上桌':'宿舍家具','椅子':'宿舍家具','护肤品':'美妆杂物','化妆工具':'美妆杂物','笔记习题集':'教材书籍','考证资料':'教材书籍','专业课教材':'教材书籍','课外书':'教材书籍','各类杂项':'其他闲置','食品零食':'食品零食','零食':'食品零食','冲泡饮品':'食品零食','特产':'食品零食','代餐食品':'食品零食','徽章':'二次元周边','立牌':'二次元周边','吧唧':'二次元周边','海报':'二次元周边','谷圈周边':'二次元周边','cos道具':'二次元周边','运动器材':'文体用品','配饰':'服饰鞋包','床品织物':'生活用品','小配件':'电子数码','小置物架':'宿舍家具','零食礼盒':'食品零食','护肤小样':'美妆杂物','课外读物':'教材书籍','笔记习题':'教材书籍','裤装':'服饰鞋包','水杯':'生活用品'};

const state={
  view:'splash', me:null,
  users:{}, products:[], orders:[], presences:{},
  profiles:{},
  chatLog:{}, unread:{},
  favs:new Set(), history:[],
  groups:{}, currentGroup:null, grpKw:'',
  filter:{kw:'',mine:false,tags:[],sort:'rec',face:false,barg:false,delivery:false,price:null,conds:[],kind:null},
  chatProducts:{}, peerRoles:{}, currentThread:null,
  activity:{days:{},hours:new Array(24).fill(0),replies:{n:0,total:0},lastRecv:{}},
  currentProduct:null, currentOrder:null, currentPeer:null,
  prefs:{match:true,speed:'不限',online:'不限',rating:'不限',delivery:'站点自取'},
  pubTags:new Set(), pubGrade:'九成新', pubCut:'接受小刀', pubTrade:'线下面交', pubTradeNote:'', pubEditId:null,
  pubDelivery:'self', pubFee:0, pubKind:'sell',
  listMode:'all',
  csMsgs:[{side:'left',text:'同学你好～我是闲置小助手。想和真人卖家聊，请到商品详情页点「联系卖家」；这里处理交易纠纷与平台问题 📎'}],
};

/* ---------- 工具 ---------- */
let toastTimer;
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),1900);}
const fmt=n=>'¥'+Number(n).toFixed(2);
const getStore=k=>{const v=localStorage.getItem('cu_'+k);return v?JSON.parse(v):null;};
const setStore=(k,v)=>localStorage.setItem('cu_'+k,JSON.stringify(v));
async function hash(str){
  try{
    const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('cu::'+str));
    return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,'0')).join('');
  }catch(e){let h=5381;for(const c of 'cu::'+str)h=((h<<5)+h+c.charCodeAt(0))>>>0;return 'x'+h.toString(16);}
}
function isOnline(name){const p=state.presences[name];return !!(p&&p.on&&Date.now()-p.ts<75000);}

/* ---------- MQTT 数据总线 ---------- */
let mq=null,chatSubTopic=null,seedTimer=null,chatSyncUntil=0;
/* 公共总线节点列表：连接时并行竞速，自动采用最快连上的节点 */
/* 主节点：emqx 公共版单条消息上限 1MB；hivemq 只有 256KB，超限消息会被踢掉连接——
   所以主节点只放 emqx，hivemq 仅作镜像兜底且不发大消息 */
const BROKERS=['wss://broker.emqx.io:8084/mqtt','wss://broker-cn.emqx.io:8084/mqtt'];
const MIRROR_URLS=['wss://broker.hivemq.com:8884/mqtt'];
/* 单条消息安全上限：900KB（base64 后），超过一律拒发，防止被 broker 断连 */
const PAYLOAD_MAX=900000;
let brokerIdx=0,failCount=0;
function setNetUI(on,text){
  $$('.net-pill').forEach(p=>{
    p.classList.toggle('on',on);
    p.querySelector('i').style.background=on?'#7FBF7B':'#C9BB9F';
    p.lastChild.textContent=text;
  });
}
let raceTimer=null;
function mqConnect(){
  if(typeof mqtt==='undefined'){setNetUI(false,'组件加载失败，请刷新');return;}
  if(mq){try{mq.end(true);}catch(e){}mq=null;}
  clearTimeout(raceTimer);
  setNetUI(false,'正在连接市集…');
  /* 三节点并行竞速：同时发起连接，谁先连上用谁，其余立即关闭 */
  let settled=false;
  const clients=[];
  const cleanup=()=>{
    clearTimeout(raceTimer);
    clients.forEach(c=>{if(c!==mq){try{c.end(true);}catch(e){}}});
  };
  BROKERS.forEach((url,i)=>{
    const c=mqtt.connect(url,{clientId:'cu_'+Math.random().toString(16).slice(2,10),clean:true,keepalive:30,connectTimeout:8000,reconnectPeriod:3000});
    clients.push(c);
    c.on('connect',()=>{
      /* 已定主时的 connect：断线后 mqtt.js 自动重连成功（c===mq）→ 恢复订阅与界面，绝不关闭；
         竞速败者才关闭。此前重连成功也会被误当竞速败者关掉，导致反复掉线、无法自动恢复 */
      if(settled){
        if(c===mq){failCount=0;onNetUp();}
        else{try{c.end(true);}catch(e){}}
        return;
      }
      settled=true;
      brokerIdx=i;failCount=0;mq=c;
      cleanup();
      /* 每次连上就清一次演示商品，三节点同步墓碑 */
      setTimeout(()=>{try{purgeAllSeeds();}catch(e){}},1200);
      onNetUp();
    });
    c.on('message',(t,p,packet)=>{if(packet&&packet.retain)mainRetainTopics.add(t);onMqMsg(t,p);});
    c.on('close',()=>{
      if(!settled||c!==mq)return;
      setNetUI(false,'连接断开，自动重连');
      failCount++;
      /* mqtt.js 自带指数重连；连续 4 次失败才切换节点，减少不必要的全量重连 */
      if(failCount>=4){
        failCount=0;
        setNetUI(false,'切换节点…');
        setTimeout(mqConnect,500);
      }
    });
    c.on('reconnect',()=>{if(!settled||c===mq)setNetUI(false,'重连中…');});
    c.on('error',()=>{});
  });
  /* 15 秒内没有任何节点连上：全部重来一轮 */
  raceTimer=setTimeout(()=>{
    if(settled)return;
    settled=true;
    cleanup();
    failCount++;
    setNetUI(false,'节点较慢，重试…');
    setTimeout(mqConnect,500);
  },15000);
}
/* 断线暂存队列：retain 消息断网时先存起来，恢复连接后自动补发 */
const outbox=[];
function pub(topic,obj,retain=false){
  const payload=obj===null?'':JSON.stringify(obj);
  /* 超过红线直接拒绝：发出去会被 broker 断开，害得所有人掉线 */
  if(payload.length>PAYLOAD_MAX){
    toast('内容太大无法上传，请删掉几张图片');
    return false;
  }
  if(!mq||!mq.connected){
    if(retain&&outbox.length<300)outbox.push({topic,payload,retain:true});
    toast('网络未连接，已暂存，恢复后自动发送');
    return false;
  }
  mq.publish(topic,payload,{qos:0,retain});
  mirrorPublish(topic,payload,retain);
  return true;
}
function flushOutbox(){
  if(!mq||!mq.connected)return;
  while(outbox.length){
    const o=outbox.shift();
    try{
      mq.publish(o.topic,o.payload,{qos:0,retain:o.retain});
      mirrorPublish(o.topic,o.payload,o.retain);
    }catch(e){outbox.unshift(o);break;}
  }
}
/* ---------- 镜像节点：所有保留消息同步写入三个总线节点，数据不再依赖单一节点 ---------- */
/* 【已暂停跨节点同步】MIRROR_SYNC=false：数据只写当前节点，不同步到其他节点/镜像。
   原因：多节点同时长连接（主节点+镜像+跨节点拉取）心跳多、易断线；且各版本数据互相串扰。
   如需恢复：把 false 改回 true 即可，全部逻辑保留未删。 */
const MIRROR_SYNC=false;
let mirrors=[];
/* 演示商品墓碑：三节点发布空 retain，彻底删除 */
const SEED_IDS=new Set((typeof SEED_PRODUCTS!=='undefined'?SEED_PRODUCTS:[]).map(p=>p.id));
function purgeSeed(id){
  const topic=NS+'products/'+id;
  if(mq&&mq.connected){try{mq.publish(topic,'',{qos:0,retain:true});}catch(e){}}
  mirrorPublish(topic,'',true);
}
function purgeAllSeeds(){
  SEED_IDS.forEach(id=>purgeSeed(id));
}
function mirrorPublish(topic,payload,retain){
  /* 暂停同步：直接返回，数据只留在当前节点 */
  if(!MIRROR_SYNC)return;
  mirrors.forEach(m=>{
    /* 镜像节点上限不同（hivemq 256KB），大消息跳过，避免镜像连接被踢 */
    if(payload.length>(m.max||PAYLOAD_MAX))return;
    if(m.c&&m.c.connected){
      try{m.c.publish(topic,payload,{qos:0,retain});}catch(e){if(retain&&m.out.length<300)m.out.push({topic,payload,retain:true});}
    }else if(retain&&m.out.length<300)m.out.push({topic,payload,retain:true});
  });
}
function flushMirror(m){
  if(!m.c||!m.c.connected)return;
  while(m.out.length){
    const o=m.out.shift();
    try{m.c.publish(o.topic,o.payload,{qos:0,retain:o.retain});}catch(e){m.out.unshift(o);break;}
  }
}
function syncMirrors(){
  /* 暂停同步：不再建立镜像长连接，并关闭残留连接（减少心跳，提升稳定性） */
  if(!MIRROR_SYNC){
    mirrors.forEach(m=>{try{m.c&&m.c.end(true);}catch(e){}});
    mirrors=[];
    return;
  }
  const stale=mirrors.find(m=>m.idx===brokerIdx);
  if(stale){try{stale.c.end(true);}catch(e){}mirrors=mirrors.filter(m=>m!==stale);}
  MIRROR_URLS.forEach((url,i)=>{
    if(mirrors.some(m=>m.idx===i))return;
    const m={idx:i,c:null,out:[],max:url.indexOf('hivemq')>=0?250000:PAYLOAD_MAX};
    const c=mqtt.connect(url,{clientId:'cum_'+Math.random().toString(16).slice(2,10),clean:true,keepalive:30,connectTimeout:8000,reconnectPeriod:8000});
    m.c=c;
    c.on('connect',()=>flushMirror(m));
    c.on('error',()=>{});
    mirrors.push(m);
  });
}
/* 跨节点取数：主节点切换后，从其他节点把历史保留消息拉回来（一次性临时连接） */
let lastPrimary=-1,syncQuietUntil=0;
function collectRetained(){
  /* 暂停跨节点取数：只读当前节点自身的 retained，不再连其他节点/镜像（减少连接数与断线源） */
  syncQuietUntil=Date.now()+8000;
  if(!MIRROR_SYNC)return;
  const topics=[NS+'users/+',NS+'profiles/+',NS+'products/+',NS+'orders/+',NS+'presence/+',NS+'chat/+/+',NS+'archive/+',NS+'groups/+',NS+'groupchat/+/+'];
  const urls=[];
  BROKERS.forEach((u,i)=>{if(i!==brokerIdx)urls.push(u);});
  MIRROR_URLS.forEach(u=>urls.push(u));
  /* 镜像节点上的商品备份：主节点若丢失，取数窗口结束后自动补种回来 */
  const mirrorProds={};
  urls.forEach(url=>{
    const c=mqtt.connect(url,{clientId:'cuc_'+Math.random().toString(16).slice(2,10),clean:true,keepalive:15,connectTimeout:8000});
    c.on('connect',()=>{try{c.subscribe(topics);}catch(e){}});
    c.on('message',(t,p,packet)=>{
      /* 只取保留消息（历史数据），实时消息由主连接负责 */
      if(!packet||!packet.retain)return;
      if(t.startsWith(NS+'products/')){
        const id=t.slice((NS+'products/').length);
        if(id){try{mirrorProds[id]={topic:t,data:JSON.parse(p.toString())};}catch(e){}}
      }
      try{onMqMsg(t,p);}catch(e){}
    });
    c.on('error',()=>{});
    setTimeout(()=>{try{c.end(true);}catch(e){}},7000);
  });
  syncQuietUntil=Date.now()+8000;
  /* 取数结束后：主节点缺失的商品从镜像备份补种（本地已有/主节点已有则跳过） */
  setTimeout(()=>{
    if(!mq||!mq.connected)return;
    let n=0;
    Object.entries(mirrorProds).forEach(([id,{topic,data}])=>{
      /* 只认主连接真实收到的 retain 为准；内存列表不算（镜像取数也会写入内存） */
      if(mainRetainTopics.has(topic))return;
      try{mq.publish(topic,JSON.stringify(data),{qos:0,retain:true});n++;}catch(e){}
    });
    if(n)setTimeout(()=>{if(state.view==='home')renderGoods();},2500);
  },8500);
}
window.addEventListener('online',()=>{
  setNetUI(false,'重连中…');
  if(mq&&!mq.connected){try{mq.reconnect();}catch(e){}}
});
window.addEventListener('offline',()=>setNetUI(false,'网络离线'));
function onNetUp(){
  setNetUI(true,'已连接');
  chatSubTopic=null;
  mq.subscribe([NS+'users/+',NS+'profiles/+',NS+'products/+',NS+'orders/+',NS+'presence/+',NS+'chat/+/+',NS+'archive/+',NS+'groups/+',NS+'groupchat/+/+']);
  flushOutbox();
  if(lastPrimary!==brokerIdx){lastPrimary=brokerIdx;syncMirrors();collectRetained();}
  chatSyncUntil=Date.now()+3000;
  const saved=getStore('me');
  if(saved&&saved.name){state.me=saved;afterLogin();if(state.view==='splash')showView('home');}
  clearTimeout(seedTimer);
  seedTimer=setTimeout(()=>{
    const seedKey='cu_seeded_v2_'+brokerIdx;
    /* 演示商品已按需求删除，永久关闭播种，避免再次出现 */
    const SEED_ENABLED=false;
    if(SEED_ENABLED&&state.products.length===0&&!localStorage.getItem(seedKey)){
      localStorage.setItem(seedKey,'1');
      hash(SEED_PASS).then(h=>{
        /* 只补缺失的演示数据，已存在的账号/商品绝不覆盖（保护真实数据） */
        SEED_USERS.forEach(u=>{if(!state.users[u])pub(NS+'users/'+encodeURIComponent(u),{pass:h,ts:Date.now()},true);});
        SEED_PRODUCTS.forEach(p=>{if(!state.products.some(x=>x.id===p.id))pub(NS+'products/'+p.id,{...p,ts:Date.now()},true);});
      });
    }
  },3200);
  heartbeat();
}
function heartbeat(){if(state.me&&mq&&mq.connected)pub(NS+'presence/'+encodeURIComponent(state.me.name),{on:true,ts:Date.now()},true);}
/* 切回前台立即检查连接：浏览器对后台页面的定时器节流会让自动重连停滞（表现为"无法自动重连"） */
document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState!=='visible')return;
  if(mq&&mq.connected)return;
  /* mqtt.js 自带重连进行中：不打断 */
  if(mq&&mq.reconnecting)return;
  setNetUI(false,'恢复连接…');
  setTimeout(mqConnect,300);
});
setInterval(heartbeat,25000);
window.addEventListener('pagehide',()=>{
  if(state.me&&mq&&mq.connected){
    mq.publish(NS+'presence/'+encodeURIComponent(state.me.name),JSON.stringify({on:false,ts:Date.now()}),{qos:0,retain:true});
    publishArchive();
  }
});
function onMqMsg(topic,payload){
  const path=topic.slice(NS.length);
  const raw=payload.toString();
  let data=null;
  if(raw){try{data=JSON.parse(raw);}catch(e){return;}}
  if(path.startsWith('users/')){
    const name=decodeURIComponent(path.slice(6));
    if(data)state.users[name]=data;else delete state.users[name];
    if(state.view==='userpage'&&state.userPageWho===name)renderUserPage();
  }else if(path.startsWith('profiles/')){
    const name=decodeURIComponent(path.slice(9));
    if(data)state.profiles[name]=data;else delete state.profiles[name];
    if(name===state.me?.name)applyMyProfile();
    if(state.view==='userpage'&&state.userPageWho===name)renderUserPage();
    if(state.view==='msgs')renderMsgs();
    if(state.view==='plaza')renderGrpList();
    if(state.view==='chat'&&(state.currentPeer===name||isGroupWith(name)))renderChat();
    if(state.view==='detail'&&curP()&&curP().owner===name)renderDetail();
  }else if(path.startsWith('presence/')){
    const name=decodeURIComponent(path.slice(9));
    state.presences[name]=data||{on:false,ts:0};
    if(state.view==='chat'&&state.currentPeer===name)renderChatHead();
    if(state.view==='userpage'&&state.userPageWho===name)renderUserPage();
    if(state.view==='detail')renderDetailOwnerState();
  }else if(path.startsWith('products/')){
    const id=path.slice(9);
    /* 演示商品已永久下线：任何节点再出现即清除（防止旧客户端重新播种） */
    if(SEED_IDS.has(id)){
      if(data)purgeSeed(id);
      return;
    }
    if(!data)state.products=state.products.filter(p=>p.id!==id);
    else{const i=state.products.findIndex(p=>p.id===id);if(i>=0)state.products[i]=data;else state.products.push(data);}
    if(state.view==='home')renderGoods();
    if(state.view==='detail'&&curP()?.id===id)renderDetail();
    if(state.view==='profile')renderProfile();
  }else if(path.startsWith('orders/')){
    if(!data||!state.me)return;
    if(data.buyer!==state.me.name&&data.seller!==state.me.name)return;
    const isNew=!state.orders.some(o=>o.id===data.id);
    const i=state.orders.findIndex(o=>o.id===data.id);
    if(i>=0)state.orders[i]=data;else state.orders.push(data);
    state.orders.sort((a,b)=>b.ts-a.ts);
    if(isNew&&Date.now()>syncQuietUntil&&data.seller===state.me.name&&data.buyer!==state.me.name)toast('你有新订单 🧾');
    if(state.view==='order')renderOrder();
    if(state.view==='profile')renderProfile();
  }else if(path.startsWith('chat/')){
    if(!data||!state.me)return;
    /* 系统消息（下单通知）：买卖双方都接收，peer 为对方真实名字 */
    if(!data.sys&&data.from!==state.me.name&&data.to!==state.me.name)return;
    const peer=data.sys?(data.buyer===state.me.name?data.seller:data.buyer):(data.from===state.me.name?data.to:data.from);
    /* 频道路由：消息携带 pid 时落到该商品的独立频道 */
    const tKey=threadKey(peer,data.pid||null);
    const log=state.chatLog[tKey]=state.chatLog[tKey]||[];
    const exist=log.find(m=>m.ts===data.ts);
    if(exist){
      /* 撤回：消息被发送方覆盖为 revoked */
      if(data.revoked&&!exist.revoked){
        exist.revoked=true;exist.text='';exist.img=null;
        if(data.readAt&&!exist.readAt)exist.readAt=data.readAt;
        if(state.view==='chat'&&state.currentThread===tKey)renderChat();
        else if(state.view==='msgs')renderMsgs();
        saveSoon();
        return;
      }
      /* 已读回执：同一条消息被对方更新 readAt */
      if(data.readAt&&!exist.readAt){
        exist.readAt=data.readAt;
        if(state.view==='chat'&&state.currentPeer===peer)renderChat();
        else saveSoon();
      }
      return;
    }
    log.push(data);log.sort((a,b)=>a.ts-b.ts);
    const replay=Date.now()<chatSyncUntil;
    const inThread=state.view==='chat'&&state.currentThread===tKey;
    if(inThread){
      renderChat();
      markRead();
    }
    else if(!replay&&data.sys){
      /* 系统通知不弹 toast，仅计入未读，提醒双方有新对话 */
      state.unread[tKey]=(state.unread[tKey]||0)+1;updateUnread();saveUserData();
    }
    else if(!replay&&data.from!==state.me.name){
      state.activity.lastRecv[data.from]=Date.now();
      state.unread[tKey]=(state.unread[tKey]||0)+1;updateUnread();saveUserData();
      toast(peer+'：'+(data.text||(data.img&&data.img.indexOf('stk#')===0?'[表情包]':'[图片]')));
    }
    if(replay)saveSoon();else scheduleArchive();
  }else if(path.startsWith('archive/')){
    if(!data||!state.me)return;
    const name=decodeURIComponent(path.slice(8));
    if(name!==state.me.name||!data.log)return;
    let changed=false;
    Object.entries(data.log).forEach(([peer,msgs])=>{
      const arr=state.chatLog[peer]=state.chatLog[peer]||[];
      msgs.forEach(m=>{if(!arr.some(x=>x.ts===m.ts)){arr.push(m);changed=true;}});
      arr.sort((a,b)=>a.ts-b.ts);
    });
    if(changed){saveSoon();if(state.view==='msgs')renderMsgs();if(state.view==='chat'&&state.currentPeer)renderChat();}
  }else if(path.startsWith('groups/')){
    /* 群信息：retain 全量对象（含 members） */
    const id=path.slice(7);
    if(!data)delete state.groups[id];else state.groups[id]=data;
    if(state.view==='plaza')renderGrpList();
  }else if(path.startsWith('groupchat/')){
    /* 群消息：{gid,from,text,img,ts}；群成员都接收 */
    const gid=path.slice(10).split('/')[0];
    if(!data||!data.gid||!state.me)return;
    if(data.from!==state.me.name&&!grpMemberOf(data.gid,data.from))return;
    const gk='grp:'+data.gid;
    const arr=state.chatLog[gk]=state.chatLog[gk]||[];
    if(!arr.some(x=>x.ts===data.ts)){arr.push(data);arr.sort((a,b)=>a.ts-b.ts);saveSoon();}
    if(state.view==='chat'&&state.currentGroup===data.gid)renderChat();
    else if(!replay&&data.from!==state.me.name){
      state.unread[gk]=(state.unread[gk]||0)+1;updateUnread();
      const g=state.groups[data.gid];
      toast('['+(g?g.name:'鹅群')+'] '+data.from+'：'+(data.text||(data.img&&data.img.indexOf('stk#')===0?'[表情包]':'[图片]')));
      if(state.view==='plaza')renderGrpList();
    }
  }
}
function waitNet(ms=3000){
  return new Promise(res=>{
    if(mq&&mq.connected)return res();
    const t0=Date.now();
    const timer=setInterval(()=>{if((mq&&mq.connected)||Date.now()-t0>ms){clearInterval(timer);res();}},150);
  });
}

/* ---------- 路由（带历史栈：返回按钮回到上一步） ---------- */
let navStack=[];
/* 主节点上确实存在的 retained topic（用于镜像补种去重） */
const mainRetainTopics=new Set();
function showView(v,push=true){
  if(push&&state.view&&state.view!==v){navStack.push(state.view);if(navStack.length>40)navStack.shift();}
  state.view=v;
  $$('.view').forEach(el=>el.classList.remove('active'));
  $('#view-'+v).classList.add('active');
  $('#tabbar').classList.toggle('hidden',!['home','plaza','search','profile','msgs'].includes(v));
  $$('.tab').forEach(t=>t.classList.toggle('active',t.dataset.tab===v));
  if(v==='home')renderGoods();
  if(v==='search'){renderSearchTools();renderSearchChips();renderSearchGoods();}
  if(v==='userpage')renderUserPage();
  if(v==='detail')renderDetail();
  if(v==='chat'){ensureChatSub();renderChat();}
  if(v==='msgs')renderMsgs();
  if(v==='changelog')renderChangelog();
  if(v==='plaza')renderGrpList();
  if(v==='mylist')renderMyList();
  if(v==='profile')renderProfile();
  if(v==='support')renderSupport();
  if(v==='publish')renderUpload();
  if(v==='order')renderOrder();
  if(v==='station')renderStation();
  /* 聊天区不重置滚动，renderChat 会定位到最新一条 */
  const sc=$('#view-'+v).querySelector('.home-body,.search-body,.detail-body,.me-body,.order-scroll,.pub-body,.userpage-body');
  if(sc)sc.scrollTop=0;
}
function goBack(){
  let prev=null;
  while(navStack.length){const p=navStack.pop();if(p!==state.view){prev=p;break;}}
  showView(prev||'home',false);
}
$$('[data-back]').forEach(b=>b.addEventListener('click',goBack));

/* ---------- 启动页 ---------- */
if(GUEST_MODE){
  const hint=document.querySelector('#view-splash .tap-hint');
  if(hint)hint.textContent='正在为你准备账号…';
  /* 隐藏入口：连续点击开屏 5 次可回到原登录页（供老账号/管理员使用） */
  let tapN=0,tapT=0;
  $('#view-splash').addEventListener('click',()=>{
    const now=Date.now();
    tapN=(now-tapT<1200)?tapN+1:1;tapT=now;
    if(tapN>=5){tapN=0;showView('login');return;}
    if(!state.me)setTimeout(()=>{if(state.view==='splash'&&!state.me)autoGuest();},700);
  });
  setTimeout(()=>{if(state.view==='splash'&&!state.me)autoGuest();},1500);
}else{
  $('#view-splash').addEventListener('click',()=>showView(state.me?'home':'login'));
  setTimeout(()=>{if(state.view==='splash')showView(state.me?'home':'login');},3000);
}
/* ---------- 访客模式：自动分配 1~10 号账号 ---------- */
async function autoGuest(){
  if(state.me||state.view!=='splash')return;
  const hint=document.querySelector('#view-splash .tap-hint');
  const ok=await waitNet(10000);
  if(!mq||!mq.connected){
    if(hint)hint.textContent='网络较慢，正在重试…';
    setTimeout(()=>{if(state.view==='splash'&&!state.me)autoGuest();},2000);
    return;
  }
  /* 等总线上的注册表（保留消息）到达，避免误判占用 */
  await new Promise(r=>setTimeout(r,2200));
  if(state.me||state.view!=='splash')return;
  let pick=null;
  for(let i=1;i<=10;i++){if(!state.users[String(i)]){pick=String(i);break;}}
  if(pick){
    /* 空闲号码：注册新访客账号（注册前再核对一次，避免覆盖晚到的注册表） */
    if(state.users[pick]){guestLogin(pick,state.users[pick].pass);return;}
    const pass='g'+Math.random().toString(36).slice(2,10);
    const h=await hash(pass);
    if(state.users[pick]){guestLogin(pick,state.users[pick].pass);return;}
    pub(NS+'users/'+encodeURIComponent(pick),{pass:h,ts:Date.now()},true);
    state.users[pick]={pass:h,ts:Date.now()};
    guestLogin(pick,h,'已为你分配账号 '+pick);
  }else{
    /* 1~10 全部占用：随机借用一个（不改动其数据） */
    const name=String(1+Math.floor(Math.random()*10));
    guestLogin(name,(state.users[name]||{}).pass||'','已进入访客账号 '+name);
  }
}
function guestLogin(name,passHash,tip){
  if(!passHash)return;
  state.me={name,pass:passHash};
  setStore('me',state.me);
  navStack=[];
  if(tip)toast(tip+' 🦢');
  afterLogin();
  showView('home',false);
}

/* ---------- 登录 ---------- */
async function doLogin(){
  const name=$('#liName').value.trim();
  const pass=$('#liPass').value;
  const err=$('#loginErr');
  if(!name){err.textContent='请输入昵称';return;}
  if(!pass){err.textContent='请输入密码';return;}
  err.textContent='正在连接市集…';
  await waitNet(10000);
  if(!mq||!mq.connected){
    err.textContent='网络较慢，正在重试…';
    if(mq&&!mq.connected){try{mq.reconnect();}catch(e){}}
    await waitNet(10000);
    if(!mq||!mq.connected){err.textContent='连接超时，请检查网络后重试';return;}
  }
  const h=await hash(pass);
  const rec=state.users[name];
  if(rec&&rec.pass!==h){err.textContent='该昵称已被注册，密码不匹配';return;}
  if(!rec)pub(NS+'users/'+encodeURIComponent(name),{pass:h,ts:Date.now()},true);
  state.users[name]=rec||{pass:h,ts:Date.now()};
  state.me={name,pass:h};
  setStore('me',state.me);
  err.textContent='';
  toast('欢迎你，'+name+' 🎉');
  navStack=[];
  afterLogin();
  showView('home',false);
}
function afterLogin(){
  heartbeat();
  /* 登录成功后再触发一次跨节点取数：聊天/档案需要登录才能接收，
     手动登录往往晚于打开页面时的取数窗口，这里补一次（消息按 id/ts 幂等） */
  setTimeout(()=>{if(mq&&mq.connected)collectRetained();},600);
  /* 登录后把在线/成交摘要推到总线，供他人主页查看 */
  setTimeout(()=>publishActivity(true),1800);
  setInterval(()=>publishActivity(),300000);
  const perUser=getStore('data_'+state.me.name)||{};
  state.favs=new Set(perUser.favs||[]);
  state.history=perUser.history||[];
  state.unread=perUser.unread||{};
  state.chatProducts=perUser.chatProducts||{};
  state.peerRoles=perUser.peerRoles||{};
  state.prefs=perUser.prefs||state.prefs;
  state.chatLog=perUser.chatLog||{};
  const a=perUser.activity||{};
  state.activity={
    days:a.days||{},
    hours:(Array.isArray(a.hours)&&a.hours.length===24)?a.hours.slice():new Array(24).fill(0),
    replies:a.replies&&a.replies.n?a.replies:{n:0,total:0},
    lastRecv:{},
  };
  const localMe=getStore('me');
  if(localMe&&localMe.profile&&!state.profiles[state.me.name])state.profiles[state.me.name]=localMe.profile;
  applyMyProfile();
  updateUnread();
}
function saveUserData(){
  if(!state.me)return;
  const slimLog={};
  Object.entries(state.chatLog).forEach(([k,v])=>{
    /* grp: 开头是群聊频道，消息没有 to 字段 */
    slimLog[k]=v.filter(m=>m.revoked||m.text||(m.img&&m.img.indexOf('stk#')===0)).slice(-150).map(m=>({from:m.from,to:m.to||null,sys:m.sys||null,gid:m.gid||null,text:m.text||'',img:m.img||null,ts:m.ts,readAt:m.readAt||null,revoked:m.revoked||null}));
  });
  setStore('data_'+state.me.name,{favs:[...state.favs],history:state.history,unread:state.unread,prefs:state.prefs,chatProducts:state.chatProducts,peerRoles:state.peerRoles,chatLog:slimLog,activity:state.activity});
}
/* 聊天记录三层持久化：本地缓存 + 消息 retained + 账号云端档案 */
let saveTimer=null,archiveTimer=null;
function saveSoon(){clearTimeout(saveTimer);saveTimer=setTimeout(saveUserData,800);}
function scheduleArchive(){clearTimeout(archiveTimer);archiveTimer=setTimeout(publishArchive,4000);}
function slimLog(){
  const out={};
  Object.entries(state.chatLog).forEach(([k,v])=>{
    out[k]=v.filter(m=>m.revoked||m.text||(m.img&&m.img.indexOf('stk#')===0)).slice(-120).map(m=>({from:m.from,to:m.to,text:m.text||'',img:m.img||null,ts:m.ts,revoked:m.revoked||null}));
  });
  return out;
}
function publishArchive(){
  if(!state.me||!mq||!mq.connected)return;
  try{
    const t=NS+'archive/'+encodeURIComponent(state.me.name);
    const pl=JSON.stringify({log:slimLog(),ts:Date.now()});
    mq.publish(t,pl,{qos:0,retain:true});
    mirrorPublish(t,pl,true);
  }catch(e){}
}
/* 在线行为统计：每分钟累计在线时长与活跃小时 */
setInterval(()=>{
  if(!state.me||!mq||!mq.connected)return;
  if(document.visibilityState!=='visible')return;
  const a=state.activity;
  const key=new Date().toISOString().slice(0,10);
  a.days[key]=(a.days[key]||0)+1;
  a.hours[new Date().getHours()]++;
  saveUserData();
},60000);
/* 由真实行为计算个人主页三项在线数据 */
function dailyAvgHours(){
  const keys=Object.keys(state.activity.days);
  if(!keys.length)return null;
  const total=keys.reduce((s,k)=>s+state.activity.days[k],0);
  return total/keys.length/60;
}
function topPeriod(){
  const h=state.activity.hours;
  if(!h.some(v=>v>0))return null;
  const top=h.map((v,i)=>[v,i]).sort((x,y)=>y[0]-x[0]).slice(0,4).map(x=>x[1]).sort((a,b)=>a-b);
  let best=[top[0],top[0]],curStart=top[0],prev=top[0];
  for(let i=1;i<top.length;i++){
    if(top[i]===prev+1){prev=top[i];if(top[i]-curStart>best[1]-best[0])best=[curStart,prev];}
    else{curStart=prev=top[i];}
  }
  return best;
}
function avgReplyMs(){
  const r=state.activity.replies;
  return r&&r.n?r.total/r.n:null;
}
$('#liGo').addEventListener('click',doLogin);
$('#liPass').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});
$('#logoutBtn').addEventListener('click',()=>{
  if(!state.me)return;
  $('#logoutOverlay').classList.add('show');
});
$('#loNo').addEventListener('click',()=>$('#logoutOverlay').classList.remove('show'));
$('#logoutOverlay').addEventListener('click',e=>{if(e.target.id==='logoutOverlay')$('#logoutOverlay').classList.remove('show');});
$('#loYes').addEventListener('click',()=>{
  $('#logoutOverlay').classList.remove('show');
  if(state.me&&mq&&mq.connected){
    try{
      mq.publish(NS+'presence/'+encodeURIComponent(state.me.name),JSON.stringify({on:false,ts:Date.now()}),{qos:0,retain:true});
      publishArchive();
    }catch(e){}
  }
  state.me=null;navStack=[];
  localStorage.removeItem('cu_me');
  toast('已退出登录，正在返回…');
  setTimeout(()=>location.reload(),600);
});

/* ---------- 首页 ---------- */
function matchTags(p){
  const tags=state.filter.tags;
  if(!tags.length)return true;
  const cat=CAT_MAP[p.cat]||p.cat;
  return tags.includes(cat)||(p.sub&&tags.includes(p.sub));
}
function renderGoods(){
  const{kw,mine,tags,sort,face,barg,delivery,price,conds,kind}=state.filter;
  let list=state.products.filter(p=>{
    if(SEED_IDS.has(p.id))return false;
    if(mine)return state.me&&p.owner===state.me.name;
    if(p.sold||(p.stock!=null&&p.stock<=0))return false;
    if(!matchTags(p))return false;
    if(kw&&!(p.name+p.cat+p.owner).toLowerCase().includes(kw.toLowerCase()))return false;
    /* 交易方式筛选：旧商品（无 delivery 字段）按仅面交处理 */
    const dm=p.delivery||'self';
    if(face&&dm==='delivery')return false;
    if(delivery&&dm!=='delivery'&&dm!=='both')return false;
    if(barg&&p.cut==='不接受小刀')return false;
    if(price){
      if(p.price<price[0])return false;
      if(price[1]!=null&&p.price>price[1])return false;
    }
    if(conds.length&&!conds.includes(normCond(p.cond)))return false;
    if(kind&&((p.kind||'sell')!==kind))return false;
    return true;
  });
  /* 排序：热门商品按浏览+收藏加权（24h 内新商品有加分，避免刚发布的沉底看不见），其余按时间 */
  const hotScore=x=>((x.stats&&x.stats.views||0)+(x.stats&&x.stats.favs||0)*3+((Date.now()-(x.ts||0))<86400000?6:0));
  if(sort==='hot')list.sort((a,b)=>hotScore(b)-hotScore(a));
  else list.sort((a,b)=>(b.ts||0)-(a.ts||0));
  const extra=[];
  if(sort==='new')extra.push('最新发布');
  if(sort==='hot')extra.push('热门商品');
  if(face)extra.push('支持面交');
  if(delivery)extra.push('可送货');
  if(barg)extra.push('可议价');
  if(price)extra.push(HF_PRICES.find(x=>x.v===price)?.t||'价格筛选');
  if(conds.length)extra.push(conds.join('/'));
  if(kind==='buy')extra.push('收闲置');
  if(kind==='sell')extra.push('出闲置');
  const st=$('#homeSecTitle');
  const stTxt=mine?'我的发布':(kw?`“${kw}” 的搜索结果`:(tags.length||extra.length)?`筛选结果 · ${list.length} 件`:'');
  st.textContent=stTxt;st.style.display=stTxt?'':'none';
  $('#goodsGrid').innerHTML=list.length?list.map(p=>{
    const isBuy=(p.kind||'sell')==='buy';
    return `<div class="card goods" data-id="${p.id}">
      <div class="gimg" style="background:linear-gradient(140deg,#FBE7D4,#F3CEAC);">${p.img?`<img src="${p.img}">`:p.emoji||(isBuy?'🎯':'📦')}</div>
      ${p.sold?'<span class="sold-mark">已售出</span>':isBuy?'<span class="buy-mark">收</span>':''}
      <div class="ginfo">
        <div class="gname">${p.name}</div>
        <div class="grow"><span class="gprice">${isBuy?'<small>心理价</small>':'<small>¥</small>'}${p.price}</span><span class="gtag">${CAT_MAP[p.cat]||p.cat}${p.sub?' · '+p.sub:''}${isBuy?'':' · '+p.cond}</span></div>
      </div>
    </div>`;}).join('')
    :`<div class="empty-tip">🧺 ${mine?'你还没有发布闲置，点底部「＋」试试':'没有找到相关闲置，换个分类或关键词试试～'}</div>`;
  renderFilterChips();
  renderChannels();
}
/* 已生效筛选摘要：可单独删除 */
function renderFilterChips(){
  const box=$('#filterChips');
  const f=state.filter;
  const chips=[];
  if(f.kind)chips.push({label:f.kind==='buy'?'收闲置':'出闲置',act:()=>{f.kind=null;}});
  f.tags.forEach(t=>chips.push({label:t,act:()=>{f.tags=f.tags.filter(x=>x!==t);}}));
  if(f.face)chips.push({label:'支持面交',act:()=>{f.face=false;}});
  if(f.delivery)chips.push({label:'可送货',act:()=>{f.delivery=false;}});
  if(f.barg)chips.push({label:'可议价',act:()=>{f.barg=false;}});
  if(f.price)chips.push({label:(HF_PRICES.find(x=>x.v===f.price)?.t||'价格'),act:()=>{f.price=null;}});
  f.conds.forEach(c=>chips.push({label:c,act:()=>{f.conds=f.conds.filter(x=>x!==c);}}));
  if(!chips.length){box.style.display='none';box.innerHTML='';return;}
  box.style.display='flex';
  box.innerHTML=chips.map((c,i)=>`<span class="fchip" data-fchip="${i}">${c.label}<b>✕</b></span>`).join('')
    +`<span class="fchip clear" data-clr="1">清除全部</span>`;
}
$('#filterChips').addEventListener('click',e=>{
  const f=state.filter;
  const clr=e.target.closest('[data-clr]');
  if(clr){state.filter={kw:f.kw,mine:f.mine,tags:[],sort:f.sort,face:false,barg:false,delivery:false,price:null,conds:[],kind:null};renderGoods();return;}
  const c=e.target.closest('[data-fchip]');
  if(c){
    const i=+c.dataset.fchip;
    const chips=[];
    /* 重建同样的 chips 序列，按索引执行对应的清除动作 */
    if(f.kind)chips.push({act:()=>{f.kind=null;}});
    f.tags.forEach(t=>chips.push({act:()=>{f.tags=f.tags.filter(x=>x!==t);}}));
    if(f.face)chips.push({act:()=>{f.face=false;}});
    if(f.delivery)chips.push({act:()=>{f.delivery=false;}});
    if(f.barg)chips.push({act:()=>{f.barg=false;}});
    if(f.price)chips.push({act:()=>{f.price=null;}});
    f.conds.forEach(cc=>chips.push({act:()=>{f.conds=f.conds.filter(x=>x!==cc);}}));
    if(chips[i]){chips[i].act();renderGoods();}
  }
});
$('#goodsGrid').addEventListener('click',e=>{const g=e.target.closest('.goods');if(g)openDetail(g.dataset.id);});
/* ---------- 首页频道导航（闲鱼样式平铺）+ 全部频道弹窗 ---------- */
/* 频道大类标签 → 现有分类体系映射 */
Object.assign(CAT_MAP,{'绘画文体':'文体用品','宿舍好物':'宿舍家具','美妆个护':'美妆杂物'});
const HF_SORTS=[{k:'rec',t:'推荐'},{k:'new',t:'最新发布'},{k:'hot',t:'热门商品'}];
/* 交易方式筛选：全部收进下拉筛选菜单（首页顶部不再平铺，避免新用户不知道可滑动） */
const HF_TRADES=[{k:'face',t:'支持面交'},{k:'delivery',t:'可送货'},{k:'barg',t:'可议价'}];
const HF_PRICES=[{t:'全部',v:null},{t:'¥0-20',v:[0,20]},{t:'¥20-50',v:[20,50]},{t:'¥50-100',v:[50,100]},{t:'¥100以上',v:[100,null]}];
const HF_CONDS=['全新','九成新','八成新','明显使用痕迹'];
const HF_CATS=[['教材书籍','📚'],['电子数码','📱'],['绘画文体','🎨'],['服饰鞋包','👗'],['宿舍好物','🛏️'],['二次元周边','🎀'],['食品零食','🍬'],['美妆个护','💄'],['运动器材','🏀'],['乐器','🎸'],['其他闲置','📦']];
/* 成色归一化：把历史值归到四个筛选档 */
function normCond(c){
  if(!c)return '明显使用痕迹';
  if(c==='全新'||c==='九成新'||c==='八成新'||c==='明显使用痕迹')return c;
  return '明显使用痕迹';
}
/* 统一处理频道点击：inPanel=true（弹窗内）时应用后收起，频道行点击就地刷新 */
function handleHfClick(e,inPanel){
  const s=e.target.closest('[data-hfsort]');
  if(s){state.filter.sort=s.dataset.hfsort;renderGoods();hfRender();if(inPanel)hfClose();return true;}
  const a=e.target.closest('[data-hfattr]');
  if(a){
    const k=a.dataset.hfattr;
    state.filter[k]=!state.filter[k];
    renderGoods();hfRender();if(inPanel)hfClose();return true;
  }
  const pr=e.target.closest('[data-hfprice]');
  if(pr){
    const v=pr.dataset.hfprice;
    state.filter.price=v==='all'?null:JSON.parse(v);
    renderGoods();hfRender();if(inPanel)hfClose();return true;
  }
  const cd=e.target.closest('[data-hfcond]');
  if(cd){
    const c=cd.dataset.hfcond;
    state.filter.conds=state.filter.conds.includes(c)?state.filter.conds.filter(x=>x!==c):[...state.filter.conds,c];
    renderGoods();hfRender();if(inPanel)hfClose();return true;
  }
  const kd=e.target.closest('[data-hfkind]');
  if(kd){
    state.filter.kind=kd.dataset.hfkind==='all'?null:kd.dataset.hfkind;
    renderGoods();hfRender();if(inPanel)hfClose();return true;
  }
  const c=e.target.closest('[data-hfcat]');
  if(c){
    const t=c.dataset.hfcat;
    state.filter.tags=state.filter.tags.includes(t)?state.filter.tags.filter(x=>x!==t):[...state.filter.tags,t];
    renderGoods();hfRender();if(inPanel)hfClose();
    return true;
  }
  return false;
}
/* 频道行渲染：一级导航只保留排序三项，分类图标行保留 */
function renderChannels(){
  const f=state.filter;
  $('#hcTabs').innerHTML=HF_SORTS.map(s=>`<div class="hc-tab ${(f.sort||'rec')===s.k?'on':''}" data-hfsort="${s.k}">${s.t}</div>`).join('');
  $('#hcIcos').innerHTML=HF_CATS.map(([c,ico])=>`<div class="hc-ico ${f.tags.includes(c)?'on':''}" data-hfcat="${c}"><i>${ico}</i><span>${c}</span></div>`).join('');
}
function hfRender(){
  renderChannels();
  const f=state.filter;
  const priceCur=f.price?JSON.stringify(f.price):'all';
  $('#hfKindTags').innerHTML=[['all','全部'],['sell','出闲置'],['buy','收闲置']].map(([k,t])=>`<div class="hf-tag ${(f.kind||'all')===k?'on':''}" data-hfkind="${k}">${t}</div>`).join('');
  $('#hfTradeTags').innerHTML=HF_TRADES.map(a=>`<div class="hf-tag ${f[a.k]?'on':''}" data-hfattr="${a.k}">${a.t}</div>`).join('');
  $('#hfCatTags').innerHTML=HF_CATS.map(([c])=>`<div class="hf-tag ${f.tags.includes(c)?'on':''}" data-hfcat="${c}">${c}</div>`).join('');
  $('#hfPriceTags').innerHTML=HF_PRICES.map(p=>`<div class="hf-tag ${priceCur===JSON.stringify(p.v)?'on':''}" data-hfprice="${p.v===null?'all':JSON.stringify(p.v)}">${p.t}</div>`).join('');
  $('#hfCondTags').innerHTML=HF_CONDS.map(c=>`<div class="hf-tag ${f.conds.includes(c)?'on':''}" data-hfcond="${c}">${c}</div>`).join('');
}
function hfOpen(){hfRender();$('#homeFilterOverlay').classList.add('show');$('#homeFilterBtn').classList.add('on');}
function hfClose(){$('#homeFilterOverlay').classList.remove('show');$('#homeFilterBtn').classList.remove('on');}
/* 右侧下拉箭头：打开全部频道面板 */
$('#homeFilterBtn').addEventListener('click',e=>{
  e.stopPropagation();
  $('#homeFilterOverlay').classList.contains('show')?hfClose():hfOpen();
});
$('#hfClose').addEventListener('click',hfClose);
$('#homeFilterOverlay').addEventListener('click',e=>{
  if(e.target.id==='homeFilterOverlay'){hfClose();return;}
  handleHfClick(e,true);
});
/* 频道行直接点击：就地筛选，不弹面板 */
$('#homeChannels').addEventListener('click',e=>{handleHfClick(e,false);});
/* 首页搜索框：点击进入独立搜索页 */
$('#homeSearchBox').addEventListener('click',()=>{
  state.filter.mine=false;
  showView('search');
  setTimeout(()=>$('#searchInput2').focus(),120);
});
/* ---------- 独立搜索页：搜索框 + 热门标签 + 分类筛选 + 历史 ---------- */
const HOT_WORDS=['耳机','考研笔记','收纳箱','雨伞','充电宝','卫衣','泡面','cos'];
function getHist(){try{return JSON.parse(localStorage.getItem('cu_searchHist'))||[];}catch(e){return [];}}
function addHist(kw){
  if(!kw)return;
  let h=getHist().filter(x=>x!==kw);
  h.unshift(kw);h=h.slice(0,10);
  localStorage.setItem('cu_searchHist',JSON.stringify(h));
}
let histTimer;
function goodsCard(p){
  return `<div class="card goods" data-id="${p.id}">
      <div class="gimg" style="background:linear-gradient(140deg,#FBE7D4,#F3CEAC);">${p.img?`<img src="${p.img}">`:p.emoji||'📦'}</div>
      ${p.sold?'<span class="sold-mark">已售出</span>':''}
      <div class="ginfo">
        <div class="gname">${p.name}</div>
        <div class="grow"><span class="gprice"><small>¥</small>${p.price}</span><span class="gtag">${CAT_MAP[p.cat]||p.cat}${p.sub?' · '+p.sub:''} · ${p.cond}</span></div>
      </div>
    </div>`;
}
function renderSearchTools(){
  /* 热门搜索标签 */
  $('#hotTags').innerHTML=HOT_WORDS.map(w=>`<span class="hot-tag" data-hot="${w}">${w}</span>`).join('');
  /* 分类选择区：大类行 + 当前选中大类的子类行 */
  const tags=state.filter.tags;
  const selMajors=tags.filter(t=>CATS.some(c=>c.major===t));
  $('#catPick').innerHTML=CATS.map(c=>{
    const on=tags.includes(c.major);
    return `<span class="pick ${on?'on':''}" data-major="${c.major}">${c.major}</span>`;
  }).join('');
  const cur=selMajors[selMajors.length-1];
  const sec=cur?CATS.find(c=>c.major===cur):null;
  $('#catPickSubs').innerHTML=sec
    ?sec.subs.map(s=>{
      const on=tags.includes(s);
      return `<span class="pick ${on?'on':''}" data-sub="${s}">${s}</span>`;
    }).join('')
    :'';
}
function renderSearchChips(){
  const box=$('#searchChips');
  const tags=state.filter.tags;
  if(!tags.length){box.style.display='none';box.innerHTML='';return;}
  box.style.display='flex';
  box.innerHTML=tags.map(t=>`<span class="fchip" data-tag="${t}">${t}<b>✕</b></span>`).join('')
    +`<span class="fchip clear" data-clr="1">清除全部</span>`;
}
function renderSearchGoods(){
  const kw=state.filter.kw;
  const tags=state.filter.tags;
  const box=$('#searchGrid');
  $('#searchChips').style.display=tags.length?'flex':'none';
  if(!kw&&!tags.length){
    const h=getHist();
    box.innerHTML=`<div class="hist-wrap">
      <div class="hist-title"><b>搜索历史</b><span class="hist-clear" id="histClear" style="${h.length?'':'display:none;'}">清空</span></div>
      <div class="hist-rows">${h.length?h.map(k=>`<span class="hist-chip" data-kw="${k}">${k}</span>`).join(''):'<span style="font-size:12px;color:var(--text3);">暂无记录，搜过的关键词会出现在这里</span>'}</div>
    </div>`;
    return;
  }
  const list=state.products.filter(p=>{
    if(SEED_IDS.has(p.id))return false;
    if(p.sold||(p.stock!=null&&p.stock<=0))return false;
    if(kw&&!(p.name+CAT_MAP[p.cat]+p.cat+p.owner).toLowerCase().includes(kw.toLowerCase()))return false;
    if(!matchTags(p))return false;
    return true;
  }).sort((a,b)=>(b.ts||0)-(a.ts||0));
  const cond=kw&&tags.length?'关键词 + 分类':(kw?`“${kw}”`:`${tags.join(' · ')}`);
  box.innerHTML=list.length?list.map(goodsCard).join('')
    :`<div class="empty-tip">🧺 没有“${cond}”相关的闲置<br><span style="font-size:12px;">换个关键词或分类试试～</span></div>`;
}
function runSearch(kw){
  state.filter.kw=kw||'';
  $('#searchInput2').value=state.filter.kw;
  syncSearchClear2();
  addHist(state.filter.kw);
  renderSearchGoods();
}
$('#searchInput2').addEventListener('input',e=>{
  state.filter.kw=e.target.value.trim();
  syncSearchClear2();
  renderSearchGoods();
  /* 搜索词防抖入历史 */
  clearTimeout(histTimer);
  histTimer=setTimeout(()=>addHist(state.filter.kw),900);
});
function syncSearchClear2(){$('#searchClear2').style.display=$('#searchInput2').value?'flex':'none';}
$('#searchClear2').addEventListener('click',()=>{
  $('#searchInput2').value='';state.filter.kw='';
  renderSearchGoods();syncSearchClear2();$('#searchInput2').focus();
});
/* 搜索页各区域事件 */
$('#hotTags').addEventListener('click',e=>{
  const t=e.target.closest('[data-hot]');
  if(t)runSearch(t.dataset.hot);
});
$('#catPick').addEventListener('click',e=>{
  const m=e.target.closest('[data-major]');
  if(!m)return;
  const t=m.dataset.major;
  state.filter.tags=state.filter.tags.includes(t)?state.filter.tags.filter(x=>x!==t):[...state.filter.tags,t];
  renderSearchTools();renderSearchChips();renderSearchGoods();
});
$('#catPickSubs').addEventListener('click',e=>{
  const s=e.target.closest('[data-sub]');
  if(!s)return;
  const t=s.dataset.sub;
  state.filter.tags=state.filter.tags.includes(t)?state.filter.tags.filter(x=>x!==t):[...state.filter.tags,t];
  renderSearchTools();renderSearchChips();renderSearchGoods();
});
$('#searchChips').addEventListener('click',e=>{
  const clr=e.target.closest('[data-clr]');
  if(clr){state.filter.tags=[];renderSearchTools();renderSearchChips();renderSearchGoods();return;}
  const c=e.target.closest('[data-tag]');
  if(c){state.filter.tags=state.filter.tags.filter(t=>t!==c.dataset.tag);renderSearchTools();renderSearchChips();renderSearchGoods();}
});
$('#searchGrid').addEventListener('click',e=>{
  const chip=e.target.closest('.hist-chip');
  if(chip){runSearch(chip.dataset.kw);return;}
  if(e.target.closest('#histClear')){localStorage.removeItem('cu_searchHist');renderSearchGoods();return;}
  const g=e.target.closest('.goods');if(g)openDetail(g.dataset.id);
});
/* ---------- 分类筛选面板 ---------- */
let draftTags=new Set();
function renderCatPanel(){
  $('#catBody').innerHTML=CATS.map(sec=>{
    const mOn=draftTags.has(sec.major);
    const subs=sec.subs.map(s=>`<span class="schip ${draftTags.has(s)?'on':''}" data-tag="${s}">${s}</span>`).join('');
    return `<div class="cs-sec">
      <div class="cs-major"><span class="mchip ${mOn?'on':''}" data-major="${sec.major}">${sec.major}</span></div>
      <div class="cs-subs">${subs}</div>
    </div>`;
  }).join('');
}
function openCatPanel(){
  draftTags=new Set(state.filter.tags);
  renderCatPanel();
  $('#catOverlay').classList.add('show');
}
function closeCatPanel(){$('#catOverlay').classList.remove('show');}
$('#catBody').addEventListener('click',e=>{
  const m=e.target.closest('[data-major]');
  if(m){
    const sec=CATS.find(x=>x.major===m.dataset.major);
    if(draftTags.has(sec.major)){
      draftTags.delete(sec.major);
      sec.subs.forEach(s=>draftTags.delete(s));
    }else draftTags.add(sec.major);
    renderCatPanel();return;
  }
  const s=e.target.closest('[data-tag]');
  if(s){
    const t=s.dataset.tag;
    if(draftTags.has(t))draftTags.delete(t);
    else{
      draftTags.add(t);
      const sec=CATS.find(x=>x.subs.includes(t));
      if(sec)draftTags.delete(sec.major);
    }
    renderCatPanel();
  }
});
$('#catApply').addEventListener('click',()=>{
  state.filter.tags=[...draftTags];
  closeCatPanel();renderGoods();
  toast(state.filter.tags.length?`已按 ${state.filter.tags.length} 个标签筛选`:'已显示全部商品');
});
$('#catReset').addEventListener('click',()=>{draftTags=new Set();renderCatPanel();});
$('#catClear').addEventListener('click',()=>{draftTags=new Set();state.filter.tags=[];closeCatPanel();renderGoods();toast('已清除分类筛选');});
$('#catClose').addEventListener('click',closeCatPanel);
$('#catOverlay').addEventListener('click',e=>{if(e.target.id==='catOverlay')closeCatPanel();});

/* ---------- 闲鹅推荐价 ---------- */
const COND_FACTOR={'全新':1.15,'九成新':1,'八成新':0.8,'明显使用痕迹':0.55};
function marketRec(cat,cond,excludeOwner){
  const pool=state.products.filter(p=>!p.sold&&p.owner!==excludeOwner&&p.cond&&typeof p.price==='number'&&(CAT_MAP[p.cat]||p.cat)===cat);
  if(pool.length<3)return null;
  const tf=COND_FACTOR[cond]||1;
  const midOf=a=>a.length%2?a[(a.length-1)/2]:(a[a.length/2-1]+a[a.length/2])/2;
  const adj=pool.map(p=>p.price*(tf/(COND_FACTOR[p.cond]||1))).sort((a,b)=>a-b);
  const rough=midOf(adj);
  /* 剔除偏离中位数过大的离群样本，避免个别异常定价带偏推荐 */
  const core=adj.filter(x=>x>=rough*0.25&&x<=rough*1.75);
  const use=core.length>=3?core:adj;
  if(use.length<3)return null;
  const mid=midOf(use);
  const lo=use[Math.floor((use.length-1)*0.25)];
  const hi=use[Math.min(use.length-1,Math.ceil((use.length-1)*0.75))];
  return {mid:Math.round(mid),min:Math.round(lo),max:Math.round(hi),n:use.length};
}
let pubRecData=null;
function updatePubRec(){
  const cat=pubMajor();
  const box=$('#pubRec');
  if(!cat){box.style.display='none';pubRecData=null;return;}
  pubRecData=marketRec(cat,state.pubGrade,state.me&&state.me.name);
  if(!pubRecData){box.style.display='none';return;}
  box.style.display='flex';
  box.querySelector('.rb-main').innerHTML=`闲鹅推荐价：<b>¥${pubRecData.mid}</b><span>闲鹅推荐价，仅校内行情参考</span>`;
  $('#recFill').style.display='';
}
$('#recFill').addEventListener('click',()=>{
  if(!pubRecData)return;
  $('#pubPrice').value=pubRecData.mid;
  toast('已填入推荐价 ¥'+pubRecData.mid+'，可自由修改');
});

/* ---------- 商品详情 ---------- */
function curP(){return state.products.find(p=>p.id===state.currentProduct);}
/* 商品数据指标：浏览量 / 被收藏量（写入总线商品对象，全端同步） */
const viewMark={};
function bumpStat(p,key,delta){
  if(!p)return;
  p.stats=p.stats||{views:0,favs:0};
  p.stats[key]=Math.max(0,(p.stats[key]||0)+delta);
  pub(NS+'products/'+p.id,p,true);
}
function openDetail(id){
  state.currentProduct=id;
  if(state.me){state.history=[id,...state.history.filter(x=>x!==id)].slice(0,100);saveUserData();}
  /* 浏览量：30 秒内重复打开不重复计 */
  const p=curP();
  if(p&&(!viewMark[id]||Date.now()-viewMark[id]>30000)){viewMark[id]=Date.now();bumpStat(p,'views',1);}
  showView('detail');
}
function renderDetailOwnerState(){
  const p=curP();if(!p||p.owner===state.me?.name)return;
  const on=isOnline(p.owner);
  $('#dOwnerSub').innerHTML=`<span class="${on?'dot-on':'dot-off'}"></span> ${on?'在线 · 秒回消息':'离线 · 消息会保留'}`;
}
function renderDetail(){
  const p=curP();if(!p)return;
  /* 媒体列表：图片 */
  const media=((p.imgs&&p.imgs.length)?p.imgs:(p.img?[p.img]:[])).map(s=>({t:'img',s}));
  $('#dEmoji').style.display=media.length?'none':'';
  $('#dEmoji').textContent=p.emoji||'📦';
  ['#dImg .d-carousel','#dImg .d-dots','#dImg .d-count','#dImg .d-arrow.left','#dImg .d-arrow.right','#dImg img'].forEach(sel=>{
    const el=$(sel);if(el)el.remove();
  });
  if(media.length){
    const car=document.createElement('div');
    car.className='d-carousel';
    car.innerHTML=media.map(m=>`<img src="${m.s}" class="viewerable" draggable="false">`).join('');
    $('#dImg').prepend(car);
    if(media.length>1){
      let idx=0;
      const cnt=document.createElement('div');
      cnt.className='d-count';cnt.textContent='1/'+media.length;
      $('#dImg').appendChild(cnt);
      const dots=document.createElement('div');
      dots.className='d-dots';
      dots.innerHTML=media.map((m,i)=>`<i class="${i===0?'on':''}"></i>`).join('');
      $('#dImg').appendChild(dots);
      /* 左右箭头：点按切换，配合手势滑动 */
      const go=n=>{
        idx=Math.max(0,Math.min(media.length-1,n));
        car.scrollTo({left:idx*car.clientWidth,behavior:'smooth'});
        cnt.textContent=(idx+1)+'/'+media.length;
        [...dots.children].forEach((d,i)=>d.classList.toggle('on',i===idx));
      };
      const al=document.createElement('div');
      al.className='d-arrow left';al.textContent='‹';
      al.addEventListener('click',e=>{e.stopPropagation();go(idx-1);});
      const ar=document.createElement('div');
      ar.className='d-arrow right';ar.textContent='›';
      ar.addEventListener('click',e=>{e.stopPropagation();go(idx+1);});
      $('#dImg').appendChild(al);
      $('#dImg').appendChild(ar);
      car.addEventListener('scroll',()=>{
        idx=Math.max(0,Math.min(media.length-1,Math.round(car.scrollLeft/Math.max(1,car.clientWidth))));
        cnt.textContent=(idx+1)+'/'+media.length;
        [...dots.children].forEach((d,i)=>d.classList.toggle('on',i===idx));
      },{passive:true});
    }
  }
  const isBuyPost=(p.kind||'sell')==='buy';
  $('#dPrice').innerHTML=isBuyPost?`<small>心理价</small>${Number(p.price).toFixed(2)}`:`<small>¥</small>${Number(p.price).toFixed(2)}`;
  $('#dTitle').textContent=p.name;
  $('#dMeta').innerHTML=`<span class="chip ${isBuyPost?'green':''}">${isBuyPost?'🎯 收闲置':'🪙 出闲置'}</span><span class="chip">${CAT_MAP[p.cat]||p.cat}${p.sub?' · '+p.sub:''}</span><span class="chip">${isBuyPost?'成色不限':p.cond}</span><span class="chip orange">${p.trade||'线下面交'}</span>${isBuyPost?'':p.sold||(p.stock!=null&&p.stock<=0)?'<span class="chip">已售出</span>':`<span class="chip">库存 ${p.stock!=null?p.stock:1} 件</span>`}`;
  const pfOwner=p.owner?state.profiles[p.owner]:null;
  const dAv=$('#dAvatar');
  if(pfOwner&&pfOwner.av){dAv.innerHTML=`<img src="${pfOwner.av}">`;}else{dAv.textContent=(p.owner||'?')[0];}
  $('#dOwner').textContent=p.owner?dispName(p.owner):'匿名用户';
  $('#dDesc').textContent=p.desc||'卖家很懒，没有写描述～';
  const tn=$('#dTradeNote');
  if(tn){
    const dm=p.delivery||'self';
    const dmText=dm==='self'?`仅自提面交${p.tradeNote?'（'+p.tradeNote+'）':''}`
      :dm==='delivery'?`仅送货上门${p.fee?' · 跑腿费 '+fmt(p.fee):' · 免跑腿费'}`
      :`自提或送货由买家选${p.fee?'（送货跑腿费 '+fmt(p.fee)+'）':''}${p.tradeNote?' · 自提地点：'+p.tradeNote:''}`;
    tn.innerHTML=`<b>交易方式</b> ${dmText}`;
    tn.style.display='block';
  }
  $('#dViews').textContent='发布于 '+(p.ts?new Date(p.ts).toLocaleDateString('zh-CN'):'刚刚')
    +(p.stats?` · 👁 ${(p.stats.views||0)} 次浏览 · ❤ ${(p.stats.favs||0)} 人收藏`:' · 👁 1 次浏览 · ❤ 0 人收藏');
  $('#dCanCut').textContent='可小刀';
  $('#dCanCut').style.display=(p.cut||'接受小刀')==='不接受小刀'?'none':'';
  const mine=state.me&&p.owner===state.me.name;
  $('#dFav').style.display=mine?'none':'';
  const soldOut=p.sold||(p.stock!=null&&p.stock<=0);
  /* 收物帖：不能下单，按钮变为「我有货，联系 TA」 */
  $('#dContactSeller').textContent=isBuyPost?'我有货，联系 TA':'联系卖家';
  $('#dContactSeller').style.display=(mine||soldOut)?'none':'';
  $('#dBuy').style.display=(mine||soldOut||isBuyPost)?'none':'';
  const rec=marketRec(CAT_MAP[p.cat]||p.cat,p.cond,p.owner);
  const rt=$('#dRec');
  if(!mine){
    rt.style.display='inline-flex';
    if(rec){rt.classList.remove('none');rt.innerHTML='🦢 闲鹅推荐价 <b>¥'+rec.mid+'</b>';rt.dataset.rec=JSON.stringify(rec);}
    else{rt.classList.add('none');rt.innerHTML='🦢 暂无行情参考';rt.dataset.rec='';}
  }else rt.style.display='none';
  let dk=$('#dDel');
  if(mine){
    if(!dk){dk=document.createElement('div');dk.className='btn btn-ghost';dk.id='dDel';$('#dBtns').appendChild(dk);dk.addEventListener('click',delistProduct);}
    dk.style.display='';dk.textContent=p.sold?'删除记录':(isBuyPost?'取消求购':'下架商品');
    let de=$('#dEdit');
    if(!de){de=document.createElement('div');de.className='btn btn-ghost';de.id='dEdit';de.textContent='编辑商品';$('#dBtns').appendChild(de);de.addEventListener('click',()=>{const pp=curP();if(pp)fillPublish(pp);});}
    de.textContent=isBuyPost?'编辑求购':'编辑商品';
    de.style.display=p.sold?'none':'';
  }else{
    if(dk)dk.style.display='none';
    const de=$('#dEdit');if(de)de.style.display='none';
  }
  renderDetailOwnerState();
  updateFavBtn();
}
function updateFavBtn(){
  const faved=state.favs.has(state.currentProduct);
  $('#dFav').classList.toggle('faved',faved);
  $('#dFav span').textContent=faved?'已收藏':'收藏';
}
function delistProduct(){
  const p=curP();if(!p)return;
  if(pub(NS+'products/'+p.id,null,true)){
    state.products=state.products.filter(x=>x.id!==p.id);
    toast(p.sold?'已删除记录':(p.kind==='buy'?'求购帖已取消':'商品已下架'));
    showView('home');
  }
}
$('#dFav').addEventListener('click',()=>{
  const id=state.currentProduct;
  const p=curP();
  if(state.favs.has(id)){state.favs.delete(id);toast('已取消收藏');if(p)bumpStat(p,'favs',-1);}
  else{state.favs.add(id);toast('已加入收藏 ❤️');if(p)bumpStat(p,'favs',1);}
  saveUserData();updateFavBtn();
});
$('#dContactSeller').addEventListener('click',()=>{
  const p=curP();if(!p)return;
  if(state.me&&p.owner!==state.me.name){state.chatProducts[p.owner]=p.id;saveUserData();}
  openChatWith(p.owner,p.id);
});
$('#dBuy').addEventListener('click',()=>{
  const p=curP();
  if(!p||!state.me||p.owner===state.me.name)return;
  openOrderConfirm(p);
});
$('#dShare').addEventListener('click',()=>toast('链接已复制，快分享给同学吧'));
/* 闲鹅推荐价说明弹窗 */
$('#dRec').addEventListener('click',()=>{
  const raw=$('#dRec').dataset.rec;
  if(!raw){toast('同类在售不足，暂无行情参考');return;}
  const rec=JSON.parse(raw);
  $('#recBody').innerHTML=`
    <div class="rc-price"><small>¥</small>${rec.mid}</div>
    <div class="rc-range">
      <div class="rr"><span>行情低点</span><b>¥${rec.min}</b></div>
      <div class="rr"><span>行情高点</span><b>¥${rec.max}</b></div>
      <div class="rr"><span>同类在售</span><b>${rec.n} 件</b></div>
    </div>
    <div class="rc-note">🦢 推荐价基于校内市集当前同类闲置的售价，按成色折算后取中位数得出；价格区间为同类商品折算后的波动范围。仅供定价参考，实际成交以买卖双方协商为准，担保交易保障资金安全。</div>`;
  $('#recOverlay').classList.add('show');
});
$('#recClose').addEventListener('click',()=>$('#recOverlay').classList.remove('show'));
$('#recOverlay').addEventListener('click',e=>{if(e.target.id==='recOverlay')$('#recOverlay').classList.remove('show');});

/* ---------- 真人聊天 ---------- */
const pairId=(a,b)=>[a,b].sort().join('__');
/* 频道模型：每个商品/订单一个独立聊天频道，key=peer|pid；旧纯好友聊天 key=peer */
function threadKey(peer,pid){return pid?peer+'|'+pid:peer;}
function parseThread(k){
  if(!k)return {peer:'',pid:null};
  const i=k.indexOf('|');
  return i<0?{peer:k,pid:null}:{peer:k.slice(0,i),pid:k.slice(i+1)};
}
function ensureChatSub(){
  if(!state.me||!mq)return;
  /* 群聊频道 */
  if(state.currentGroup){
    const t=NS+'groupchat/'+state.currentGroup+'/+';
    if(chatSubTopic===t)return;
    if(chatSubTopic)mq.unsubscribe(chatSubTopic);
    mq.subscribe(t);chatSubTopic=t;
    return;
  }
  if(!state.currentPeer)return;
  const t=NS+'chat/'+pairId(state.me.name,state.currentPeer)+'/+';
  if(chatSubTopic===t)return;
  if(chatSubTopic)mq.unsubscribe(chatSubTopic);
  mq.subscribe(t);chatSubTopic=t;
}
/* 打开群聊：currentGroup 模式，复用聊天页 */
function openGroupChat(gid){
  if(!state.me)return;
  const g=state.groups[gid];
  if(!g)return;
  state.currentGroup=gid;
  state.currentPeer=null;
  state.currentThread='grp:'+gid;
  showView('chat');
}
/* 我是否在某群中（含自己创建） */
function grpMemberOf(gid,name){
  const g=state.groups[gid];
  return !!(g&&g.members&&g.members.includes(name));
}
/* 当前聊天页是否群模式（可附带成员名判断） */
function isGroupWith(name){
  if(!state.currentGroup)return false;
  const g=state.groups[state.currentGroup];
  return !!(g&&g.members&&g.members.includes(name));
}
function openChatWith(peer,pid){
  if(!state.me)return;
  if(peer===state.me.name){toast('这是你自己发布的商品哦');return;}
  state.currentGroup=null;
  state.currentPeer=peer;
  state.currentThread=threadKey(peer,pid||null);
  /* 记录本次会话中我的角色，快捷语据此切换 */
  const o=state.orders.find(o=>(!pid||o.productId===pid)&&((o.seller===state.me.name&&o.buyer===peer)||(o.buyer===state.me.name&&o.seller===peer)));
  const rp=pid?state.products.find(x=>x.id===pid):null;
  /* 收物帖：发布者是求购方（buyer 视角），有货联系的人是 seller 视角 */
  const role=o?(o.seller===state.me.name?'seller':'buyer')
    :(rp?(rp.kind==='buy'
      ?(rp.owner===state.me.name?'buyer':'seller')
      :(rp.owner===state.me.name?'seller':'buyer')):null);
  if(role){
    state.peerRoles=state.peerRoles||{};
    if(state.peerRoles[peer]!==role){state.peerRoles[peer]=role;saveUserData();}
  }
  showView('chat');
}
/* ---------- 移除 CodeSandbox 预览注入的 Open Sandbox 悬浮按钮 ---------- */
function hideSandboxBadge(){
  const el=document.querySelector('iframe[id^="sb__open-sandbox"]');
  if(el){el.style.setProperty('display','none','important');el.style.pointerEvents='none';}
}
hideSandboxBadge();
setInterval(hideSandboxBadge,1500);
try{new MutationObserver(hideSandboxBadge).observe(document.body,{childList:true});}catch(e){}
/* ---------- 聊天表情包 ---------- */
const STICKERS=[
  {code:'stk#1',name:'收到',src:'img/stk1.jpg'},
  {code:'stk#2',name:'看看',src:'img/stk2.jpg'},
  {code:'stk#3',name:'出物啦',src:'img/stk3.jpg'},
  {code:'stk#4',name:'靠谱',src:'img/stk4.jpg'},
  {code:'stk#5',name:'等你消息',src:'img/stk5.jpg'},
];
const STK_MAP={};
STICKERS.forEach(s=>STK_MAP[s.code]=s);
$('#stkPanel').innerHTML=STICKERS.map(s=>`<div class="stk-item" data-stk="${s.code}" title="${s.name}"><img src="${s.src}" alt="${s.name}"></div>`).join('');
$('#stkBtn').addEventListener('click',()=>{
  const p=$('#stkPanel');
  p.classList.toggle('show');
  $('#stkBtn').classList.toggle('on',p.classList.contains('show'));
});
$('#stkPanel').addEventListener('click',e=>{
  const it=e.target.closest('[data-stk]');
  if(!it||(!state.currentPeer&&!state.currentGroup))return;
  sendChat('',it.dataset.stk);
  $('#stkPanel').classList.remove('show');
  $('#stkBtn').classList.remove('on');
});
/* ---------- 买卖身份与快捷语 ---------- */
const QUICK_BUYER=['这个还在吗？','能便宜一点吗？','我想当面验货','什么时候方便面交？','可以送到楼下吗？'];
const QUICK_SELLER=['在的，随时可以看','已经是实价啦','支持当面验货','今晚就能送到楼下','还有其他想了解的？'];
function chatRole(){
  const peer=state.currentPeer;
  if(!peer||!state.me)return 'buyer';
  const th=parseThread(state.currentThread||'');
  /* 当前频道的商品归属优先（每个商品频道独立） */
  if(th.pid){
    const p=state.products.find(x=>x.id===th.pid);
    if(p)return p.owner===state.me.name?'seller':'buyer';
  }
  /* 有订单以订单为准 */
  const o=state.orders.find(o=>(o.seller===state.me.name&&o.buyer===peer)||(o.buyer===state.me.name&&o.seller===peer));
  if(o)return o.seller===state.me.name?'seller':'buyer';
  const pid=state.chatProducts[peer];
  const p2=pid?state.products.find(x=>x.id===pid):null;
  if(p2)return p2.owner===state.me.name?'seller':'buyer';
  const saved=state.peerRoles&&state.peerRoles[peer];
  return saved||'buyer';
}
function renderQuick(){
  const box=$('#quickRow');
  if(!box)return;
  /* 群聊不显示快捷语 */
  if(state.currentGroup){box.style.display='none';box.innerHTML='';return;}
  box.style.display='';
  const role=chatRole();
  const words=role==='seller'?QUICK_SELLER:QUICK_BUYER;
  const tip=role==='seller'?'卖家快捷语':'买家快捷语';
  box.innerHTML=`<span class="quick-tip">${tip}</span>`+words.map(t=>`<span class="quick">${t}</span>`).join('');
}
function renderChatHead(){
  /* 群聊头部：群名 + 成员数，无在线状态、无商品卡 */
  if(state.currentGroup){
    const g=state.groups[state.currentGroup];
    $('#cPeer').textContent=g?g.name:'鹅群';
    const avEl=$('#cPeerAva');
    avEl.textContent='🦢';
    $('#cPeerSub').innerHTML=g?`${(g.members||[]).length} 位成员 · 群主 ${dispName(g.owner)}`:'';
    $('#chatProd').style.display='none';
    $('#quickRow').style.display='none';
    $('#cGoOrder').style.display='none';
    $('#stkPanel').classList.remove('show');
    return;
  }
  $('#cGoOrder').style.display='';
  const on=isOnline(state.currentPeer);
  $('#cPeer').textContent=dispName(state.currentPeer);
  const avEl=$('#cPeerAva');
  const pf=state.currentPeer?state.profiles[state.currentPeer]:null;
  if(pf&&pf.av){avEl.innerHTML=`<img src="${pf.av}">`;}else{avEl.textContent=(state.currentPeer||'?')[0];}
  $('#cPeerSub').innerHTML=`<span class="${on?'dot-on':'dot-off'}"></span> ${on?'在线 · 消息实时送达':'离线 · 消息会保留'}`;
  renderChatProd();
}
/* 点击对方头像/昵称 → 他人主页 */
$('#cPeerBox').addEventListener('click',()=>{if(state.currentPeer)openUserPage(state.currentPeer);});
/* ---------- 他人个人主页 ---------- */
function openUserPage(name){
  if(!name)return;
  state.userPageWho=name;
  showView('userpage');
}
/* 在线数据摘要：上总线，供他人主页查看 */
function activitySummary(){
  const d=dailyAvgHours(),t=topPeriod(),r=avgReplyMs();
  const sellDone=state.orders.filter(o=>o.seller===state.me.name&&o.status===3).length;
  const buyDone=state.orders.filter(o=>o.buyer===state.me.name&&o.status===3).length;
  const sellAll=state.orders.filter(o=>o.seller===state.me.name).length;
  return {daily:d!=null?+d.toFixed(1):null,hours:t?[t[0],t[1]]:null,reply:r!=null?Math.round(r/1000):null,
    sell:sellDone,buy:buyDone,rate:sellAll?Math.round(sellDone/sellAll*100):98,ts:Date.now()};
}
let pubActTs=0;
function publishActivity(force){
  if(!state.me)return;
  const now=Date.now();
  if(!force&&now-pubActTs<120000)return;
  pubActTs=now;
  const rec=state.users[state.me.name];
  /* 必须已有账号记录（含 pass）才合并发布，避免覆盖账号数据 */
  if(!rec||!rec.pass)return;
  const next=Object.assign({},rec,{act:activitySummary(),ts:now});
  state.users[state.me.name]=next;
  pub(NS+'users/'+encodeURIComponent(state.me.name),next,true);
}
function renderUserPage(){
  const who=state.userPageWho;
  const u=who?state.users[who]:null;
  const isMe=who&&who===state.me?.name;
  const upf=who?state.profiles[who]:null;
  const upAv=$('#upAvatar');
  if(upf&&upf.av){upAv.innerHTML=`<img src="${upf.av}">`;}else{upAv.textContent=(who||'?')[0];}
  $('#upName').textContent=who?dispName(who):'匿名用户';
  $('#upBio').textContent=(upf&&upf.bio)||(u&&u.bio)||'校园闲置用户 · 诚信交易，欢迎咨询～';
  const on=isOnline(who);
  $('#upOnlinePill').innerHTML=`<i class="${on?'dot-on':'dot-off'}"></i>${on?'在线':'离线'}`;
  const goods=state.products.filter(p=>p.owner===who);
  const onSale=goods.filter(p=>!p.sold&&(p.stock==null||p.stock>0));
  const act=(u&&u.act)||(isMe?activitySummary():null);
  const sellOrders=state.orders.filter(o=>o.seller===who);
  const localSell=sellOrders.filter(o=>o.status===3).length;
  const localBuy=state.orders.filter(o=>o.buyer===who&&o.status===3).length;
  const doneSell=act&&act.sell!=null?act.sell:localSell;
  const buyDone=act&&act.buy!=null?act.buy:localBuy;
  /* 好评率：有成交按完成率计算，无成交显示默认 */
  const rate=act&&act.rate!=null?act.rate:(sellOrders.length?Math.round(localSell/sellOrders.length*100):98);
  $('#upRatePill').textContent='好评率 '+rate+'%';
  $('#usSell').textContent=doneSell;
  $('#usBuy').textContent=buyDone;
  $('#usOnSale').textContent=onSale.length;
  const fmtDur=s=>s==null?'–':(s<60?s+' 秒':Math.round(s/60)+' 分钟');
  $('#upDaily').textContent=act&&act.daily!=null?act.daily.toFixed(1)+' 小时':'–';
  $('#upHours').textContent=act&&act.hours?act.hours[0]+'–'+(act.hours[1]+1)+' 点':'–';
  $('#upReply').textContent=act?fmtDur(act.reply):'–';
  $('#upCount').textContent=onSale.length;
  $('#upGoods').innerHTML=onSale.length?onSale.sort((a,b)=>(b.ts||0)-(a.ts||0)).map(goodsCard).join('')
    :`<div class="empty-tip">🧺 TA 暂时没有在售的闲置</div>`;
  if(isMe)publishActivity();
}
/* 聊天页顶部迷你商品卡：直达下单闭环 */
function renderChatProd(){
  const box=$('#chatProd');if(!box)return;
  /* 群聊没有商品卡 */
  if(state.currentGroup){box.style.display='none';return;}
  const th=parseThread(state.currentThread||state.currentPeer||'');
  const peer=th.peer||state.currentPeer;
  let p=null,o=null;
  if(th.pid){
    /* 商品频道：商品卡与订单都按该商品精确匹配 */
    p=state.products.find(x=>x.id===th.pid)||null;
    o=(state.me?state.orders.find(x=>x.productId===th.pid&&((x.buyer===state.me.name&&x.seller===peer)||(x.seller===state.me.name&&x.buyer===peer))):null)||null;
    if(!p&&o)p=state.products.find(x=>x.id===o.productId)||null;
  }
  if(!p){
    const o2=(state.me&&peer)?state.orders.find(x=>(x.buyer===state.me.name&&x.seller===peer)||(x.seller===state.me.name&&x.buyer===peer)):null;
    o=o2||null;
    const cpid=state.chatProducts[peer];
    p=(cpid?state.products.find(x=>x.id===cpid):null)||(o2?state.products.find(x=>x.id===o2.productId):null);
  }
  if(!p){box.style.display='none';box.innerHTML='';return;}
  const iAmSeller=state.me&&p.owner===state.me.name;
  const hasOrder=!!o&&o.productId===p.id;
  const buyable=!iAmSeller&&!p.sold&&!hasOrder;
  /* 已下单：按钮变成查看订单进度（买卖双方都可以看） */
  const btn=hasOrder?'查看订单进度':iAmSeller?'等待买家下单':(p.sold?'已售出':'立即下单');
  box.style.display='flex';
  box.innerHTML=`
    <div class="cp-img">${p.img?`<img src="${p.img}">`:p.emoji||'📦'}</div>
    <div class="cp-info">
      <div class="cp-name">${p.name}</div>
      <div class="cp-price"><small>¥</small>${p.price}</div>
      <div class="cp-trade">${p.trade||'线下面交'}${p.tradeNote?' · '+p.tradeNote:''}${!iAmSeller&&!p.sold&&p.stock!=null&&p.stock>1?' · 剩 '+p.stock+' 件':''}</div>
    </div>
    <div class="cp-buy ${hasOrder||buyable?'':'off'}" id="cpBuy">${btn}</div>`;
}
$('#chatProd').addEventListener('click',e=>{
  const th=parseThread(state.currentThread||state.currentPeer||'');
  const peer=th.peer||state.currentPeer;
  const p=th.pid?state.products.find(x=>x.id===th.pid):null;
  if(!p){
    const o2=(state.me&&peer)?state.orders.find(x=>(x.buyer===state.me.name&&x.seller===peer)||(x.seller===state.me.name&&x.buyer===peer)):null;
    openDetail(o2?o2.productId:(state.chatProducts[peer]||''));
    return;
  }
  if(e.target.closest('#cpBuy')){
    const o=state.orders.find(x=>x.productId===p.id&&((x.buyer===state.me.name&&x.seller===peer)||(x.seller===state.me.name&&x.buyer===peer)));
    if(o){state.currentOrder=o.id;showView('order');return;}
    openOrderConfirm(p);
    return;
  }
  openDetail(p.id);
});
/* 下单：详情页与聊天页共用，先弹二次确认；送货上门自动合计跑腿费；收物帖不可下单 */
let ocMode='self';
function fmtMoney(n){return '¥'+Number(n||0).toFixed(2);}
function renderOcMode(p){
  const dm=p.delivery||'self';
  const box=$('#ocModeBox');
  if(dm==='self'){
    ocMode='self';
    box.innerHTML=`
      <div class="ord-rows" style="margin-top:0;">
        <div class="ord-row"><span>取货方式</span><b>自提面交（卖家指定地点）</b></div>
        <div class="ord-row"><span>面交地点</span><b id="ocPlace">${p.tradeNote||state.station||'东门驿站'}</b></div>
        <div class="ord-row"><span>商品价格</span><b>${fmtMoney(p.price)}</b></div>
        <div class="ord-row total"><span>合计</span><b>${fmtMoney(p.price)}</b></div>
      </div>`;
    $('#ocTip').innerHTML='🛡️ 交易流程：确认面交地点 → 买卖双方现场验货 → 交易完成。验货满意才付款，有问题可发起客服仲裁。';
    return;
  }
  const canSelf=dm==='both';
  const fee=p.fee||0;
  box.innerHTML=`
    <div class="pub-label" style="margin:12px 0 8px;font-size:13px;">选择取货方式</div>
    <div class="cut-row" id="ocModeRow">
      ${canSelf?`<div class="cut-chip on" data-ocmode="self">自提面交</div>`:''}
      <div class="cut-chip ${canSelf?'':'on'}" data-ocmode="delivery">送货上门${fee>0?`（+${fmtMoney(fee)} 跑腿费）`:''}</div>
    </div>
    <div class="form-box trade-note-box" id="ocAddrBox" style="display:none;margin-top:10px;">
      <input id="ocAddr" type="text" maxlength="60" placeholder="填写配送地址，如：3 号宿舍楼 402">
    </div>
    <div class="ord-rows" style="margin-top:10px;">
      <div class="ord-row"><span>商品价格</span><b>${fmtMoney(p.price)}</b></div>
      <div class="ord-row"><span>跑腿费</span><b id="ocFee">${fmtMoney(0)}</b></div>
      <div class="ord-row total"><span>合计</span><b id="ocTotal">${fmtMoney(p.price)}</b></div>
    </div>
    ${canSelf?`<div class="ord-row" style="border:none;font-size:11px;color:var(--text2);">自提面交地点：${p.tradeNote||state.station||'东门驿站'}</div>`:''}`;
  const applyMode=m=>{
    ocMode=m;
    $$('#ocModeRow .cut-chip').forEach(x=>x.classList.toggle('on',x.dataset.ocmode===m));
    $('#ocAddrBox').style.display=m==='delivery'?'':'none';
    const f=m==='delivery'?fee:0;
    $('#ocFee').textContent=fmtMoney(f);
    $('#ocTotal').textContent=fmtMoney(p.price+f);
    $('#ocTip').innerHTML=m==='delivery'
      ?'🛡️ 交易流程：买家下单并支付（含跑腿费）→ 卖家送货上门 → 买家验收确认 → 交易完成。'
      :'🛡️ 交易流程：确认面交地点 → 买卖双方现场验货 → 交易完成。验货满意才付款，有问题可发起客服仲裁。';
  };
  $('#ocModeRow').addEventListener('click',e=>{
    const c=e.target.closest('[data-ocmode]');if(!c)return;
    applyMode(c.dataset.ocmode);
  });
  applyMode(canSelf?'self':'delivery');
}
function openOrderConfirm(p){
  if(!p||!state.me||p.owner===state.me.name||p.sold||p.kind==='buy')return;
  state.ocPid=p.id;
  const img=$('#ocImg');
  if(p.img){img.innerHTML=`<img src="${p.img}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">`;}
  else{img.textContent=p.emoji||'📦';}
  $('#ocName').textContent=p.name;
  $('#ocSeller').textContent=dispName(p.owner);
  $('#ocCond').textContent=p.cond||'';
  $('#ocPrice').innerHTML=`<small>¥</small>${Number(p.price).toFixed(2)}`;
  $('#ocStock').textContent=(p.stock!=null?p.stock:1)+' 件';
  renderOcMode(p);
  $('#orderConfirmOverlay').classList.add('show');
}
function closeOrderConfirm(){$('#orderConfirmOverlay').classList.remove('show');}
$('#ocClose').addEventListener('click',closeOrderConfirm);
$('#ocNo').addEventListener('click',closeOrderConfirm);
$('#orderConfirmOverlay').addEventListener('click',e=>{if(e.target.id==='orderConfirmOverlay')closeOrderConfirm();});
$('#ocYes').addEventListener('click',()=>{
  const p=state.products.find(x=>x.id===state.ocPid);
  if(!p)return;
  if(ocMode==='delivery'){
    const addr=$('#ocAddr')?$('#ocAddr').value.trim():'';
    if(!addr){toast('请填写配送地址，卖家才知道送到哪 🏠');if($('#ocAddr'))$('#ocAddr').focus();return;}
    closeOrderConfirm();
    placeOrder(p,'delivery',addr);
  }else{
    closeOrderConfirm();
    placeOrder(p,'self','');
  }
});
function showOrderOk(){
  const ov=$('#orderOkOverlay');
  ov.classList.add('show');
  setTimeout(()=>ov.classList.remove('show'),2200);
}
function placeOrder(p,mode='self',address=''){
  if(!p||!state.me||p.owner===state.me.name||p.sold)return;
  const fee=mode==='delivery'?(p.fee||0):0;
  const o={id:'o'+Date.now(),buyer:state.me.name,seller:p.owner,productId:p.id,status:0,station:state.station||'东门驿站',
    mode,fee,address,trade:p.trade||'线下面交',tradeNote:p.tradeNote||'',buyerNote:'',ts:Date.now()};
  if(pub(NS+'orders/'+o.id,o,true)){
    state.orders.unshift(o);state.currentOrder=o.id;
    /* 下单即建立该商品的独立聊天频道 */
    state.chatProducts[p.owner]=p.id;
    state.currentThread=threadKey(p.owner,p.id);
    /* 库存扣减：减到 0 自动下架，主页不再显示 */
    const pp=state.products.find(x=>x.id===p.id);
    if(pp){
      const st=pp.stock==null?1:pp.stock;
      if(st<=1){pp.stock=0;pp.sold=true;toast('最后一件，商品已自动下架');}
      pub(NS+'products/'+pp.id,pp,true);
    }
    /* 订单系统消息：retained 推到商品聊天频道，卖家消息列表自动出现对话框 */
    const sys={sys:true,from:'__sys__',to:state.me.name,buyer:state.me.name,seller:p.owner,pid:p.id,
      text:`🧾 ${dispName(state.me.name)} 已下单「${p.name}」，合计 ${fmt(p.price+fee)}${mode==='delivery'?'（含跑腿费）':''}，点此对话沟通交货细节`,ts:Date.now()};
    const ct=NS+'chat/'+pairId(state.me.name,p.owner)+'/'+sys.ts;
    const cp=JSON.stringify(sys);
    if(mq&&mq.connected){mq.publish(ct,cp,{qos:0,retain:true});mirrorPublish(ct,cp,true);}
    else if(outbox.length<300)outbox.push({topic:ct,payload:cp,retain:true});
    const blog=state.chatLog[threadKey(p.owner,p.id)]=state.chatLog[threadKey(p.owner,p.id)]||[];
    if(!blog.some(m=>m.ts===sys.ts)){blog.push(sys);blog.sort((a,b)=>a.ts-b.ts);}
    showView('order');
    showOrderOk();
  }
}
/* 聊天时间格式化：今天 HH:MM / 昨天 HH:MM / M月D日 HH:MM */
function fmtChatTime(ts){
  const d=new Date(ts),now=new Date();
  const hm=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
  if(d.toDateString()===now.toDateString())return hm;
  const y=new Date(now);y.setDate(now.getDate()-1);
  if(d.toDateString()===y.toDateString())return '昨天 '+hm;
  if(d.getFullYear()===now.getFullYear())return (d.getMonth()+1)+'月'+d.getDate()+'日 '+hm;
  return d.getFullYear()+'年'+(d.getMonth()+1)+'月'+d.getDate()+'日 '+hm;
}
function renderChat(){
  /* 群聊：currentGroup 模式 */
  if(state.currentGroup){
    renderChatHead();
    renderQuick();
    const area=$('#chatArea');
    const log=(state.chatLog['grp:'+state.currentGroup]||[]).filter(m=>m.revoked||m.text||m.img);
    if(state.unread['grp:'+state.currentGroup]){state.unread['grp:'+state.currentGroup]=0;updateUnread();saveUserData();}
    const g=state.groups[state.currentGroup];
    if(!log.length){area.innerHTML=`<div class="chat-empty">🦢 欢迎加入「${g?g.name:'鹅群'}」<br>发条消息打个招呼吧</div>`;return;}
    const GAP=10*60*1000;
    let prevTs=0;
    area.innerHTML=log.map(m=>{
      const mine=m.from===state.me.name;
      let timeHtml='';
      if(!prevTs||(m.ts-prevTs)>GAP)timeHtml=`<div class="chat-time"><span>${fmtChatTime(m.ts)}</span></div>`;
      prevTs=m.ts;
      const stk=m.img&&m.img.indexOf('stk#')===0?STK_MAP[m.img]:null;
      const body=m.revoked
        ?`<div class="bubble revoked">${mine?'你':dispName(m.from)}撤回了一条消息</div>`
        :`<div class="bubble" data-mts="${m.ts}" data-mine="${mine?1:0}">${stk?`<img class="stk-msg" src="${stk.src}" alt="${stk.name}" style="margin-bottom:${m.text?'8px':'0'};">`:(m.img?`<img class="viewerable" src="${m.img}" style="width:150px;border-radius:10px;display:block;margin-bottom:${m.text?'8px':'0'};">`:'')}${m.text||''}</div>`;
      /* 群消息左侧显示发送者昵称 */
      const nick=!mine?`<div class="grp-nick">${dispName(m.from)}</div>`:'';
      return timeHtml+`<div class="msg ${mine?'right':'left'}">${avFor(m.from)}<div class="msg-col">${nick}${body}</div></div>`;
    }).join('');
    scrollChatBottom();
    return;
  }
  if(!state.currentPeer)return;
  if(!state.currentThread)state.currentThread=state.currentPeer;
  renderChatHead();
  renderQuick();
  const area=$('#chatArea');
  const log=(state.chatLog[state.currentThread]||[]).filter(m=>m.revoked||m.text||m.img);
  if(state.unread[state.currentThread]){state.unread[state.currentThread]=0;updateUnread();saveUserData();}
  if(!log.length){area.innerHTML=`<div class="chat-empty">🙋 和 ${state.currentPeer} 打个招呼吧<br>对方上线后就能收到你的消息</div>`;return;}
  /* 微信式时间：与上一条间隔 >10 分钟才显示 */
  const GAP=10*60*1000;
  let prevTs=0;
  let lastMineIdx=-1;
  log.forEach((m,i)=>{if(m.from===state.me.name)lastMineIdx=i;});
  area.innerHTML=log.map((m,i)=>{
    const mine=m.from===state.me.name;
    let timeHtml='';
    if(!prevTs||(m.ts-prevTs)>GAP)timeHtml=`<div class="chat-time"><span>${fmtChatTime(m.ts)}</span></div>`;
    prevTs=m.ts;
    /* 系统消息：居中灰色提示条（如下单通知） */
    if(m.sys)return timeHtml+`<div class="chat-sys">${m.text}</div>`;
    const av=mine?avFor(state.me.name):avFor(state.currentPeer);
    const stk=m.img&&m.img.indexOf('stk#')===0?STK_MAP[m.img]:null;
    const body=m.revoked
      ?`<div class="bubble revoked">${mine?'你':'对方'}撤回了一条消息</div>`
      :`<div class="bubble" data-mts="${m.ts}" data-mine="${mine?1:0}">${stk?`<img class="stk-msg" src="${stk.src}" alt="${stk.name}" style="margin-bottom:${m.text?'8px':'0'};">`:(m.img?`<img class="viewerable" src="${m.img}" style="width:150px;border-radius:10px;display:block;margin-bottom:${m.text?'8px':'0'};">`:'')}${m.text||''}</div>`;
    /* 只在我方最后一条消息下显示已读/未读 */
    const rd=mine&&!m.revoked&&i===lastMineIdx?`<div class="rd-state ${m.readAt?'read':''}">${m.readAt?'已读':'未读'}</div>`:'';
    return timeHtml+`<div class="msg ${mine?'right':'left'}">${av}<div class="msg-col">${body}${rd}</div></div>`;
  }).join('');
  scrollChatBottom();
  markRead();
}
/* 定位到聊天最下方：渲染后 + 图片加载后再各校正一次 */
function scrollChatBottom(){
  const area=$('#chatArea');if(!area)return;
  requestAnimationFrame(()=>{area.scrollTop=area.scrollHeight;setTimeout(()=>{area.scrollTop=area.scrollHeight;},160);});
}
$('#chatArea').addEventListener('load',scrollChatBottom,true);
/* 把对方发来的未读消息标记为已读，并回执给发送方 */
function markRead(){
  const peer=state.currentPeer;
  if(!peer||!state.me)return;
  const log=state.chatLog[state.currentThread||peer]||[];
  let changed=false;
  log.forEach(m=>{
    if(m.to===state.me.name&&!m.readAt){
      m.readAt=Date.now();changed=true;
      const payload=JSON.stringify(m);
      const topic=NS+'chat/'+pairId(m.from,m.to)+'/'+m.ts;
      if(mq&&mq.connected){mq.publish(topic,payload,{qos:0,retain:true});mirrorPublish(topic,payload,true);}
      else if(outbox.length<300)outbox.push({topic,payload,retain:true});
    }
  });
  if(changed)saveSoon();
}
function sendChat(text,img){
  if((!text||!text.trim())&&!img)return;
  /* 群聊消息：无 to，发到 groupchat 频道 */
  if(state.currentGroup){
    const msg={gid:state.currentGroup,from:state.me.name,text:(text||'').trim(),img:img||null,ts:Date.now()};
    const gk='grp:'+state.currentGroup;
    const log=state.chatLog[gk]=state.chatLog[gk]||[];
    log.push(msg);
    const topic=NS+'groupchat/'+state.currentGroup+'/'+msg.ts;
    const payload=JSON.stringify(msg);
    if(mq&&mq.connected){mq.publish(topic,payload,{qos:0,retain:true});mirrorPublish(topic,payload,true);}
    else{if(outbox.length<300)outbox.push({topic,payload,retain:true});toast('网络未连接，消息已暂存，恢复后自动送达');}
    renderChat();
    saveUserData();
    return;
  }
  const msg={from:state.me.name,to:state.currentPeer,text:(text||'').trim(),img:img||null,
    pid:parseThread(state.currentThread||'').pid||null,ts:Date.now()};
  const log=state.chatLog[state.currentThread||state.currentPeer]=state.chatLog[state.currentThread||state.currentPeer]||[];
  log.push(msg);
  /* 统计回复速度：从收到对方消息到自己发出消息的间隔 */
  const a=state.activity;
  const lr=a.lastRecv[state.currentPeer];
  if(lr){
    const delta=Date.now()-lr;
    if(delta>0&&delta<6*3600*1000){a.replies.n++;a.replies.total+=delta;}
    delete a.lastRecv[state.currentPeer];
  }
  const topic=NS+'chat/'+pairId(state.me.name,state.currentPeer)+'/'+msg.ts;
  const payload=JSON.stringify(msg);
  if(mq&&mq.connected){mq.publish(topic,payload,{qos:0,retain:true});mirrorPublish(topic,payload,true);}
  else{if(outbox.length<300)outbox.push({topic,payload,retain:true});toast('网络未连接，消息已暂存，恢复后自动送达');}
  renderChat();
  saveUserData();
  scheduleArchive();
}
/* ---------- 撤回消息：长按自己的气泡（5 分钟内），覆盖原 retained 消息 ---------- */
const REVOKE_WINDOW=5*60*1000;
function revokeMsg(ts){
  /* 群消息撤回 */
  if(state.currentGroup){
    const gk='grp:'+state.currentGroup;
    const log=state.chatLog[gk]||[];
    const m=log.find(x=>x.ts===ts);
    if(!m)return;
    if(m.from!==state.me.name){toast('只能撤回自己发送的消息');return;}
    if(m.revoked)return;
    if(Date.now()-m.ts>REVOKE_WINDOW){toast('超过 5 分钟的消息不能撤回啦');return;}
    const rev={...m,text:'',img:null,revoked:true};
    const topic=NS+'groupchat/'+state.currentGroup+'/'+m.ts;
    const payload=JSON.stringify(rev);
    if(mq&&mq.connected){mq.publish(topic,payload,{qos:0,retain:true});mirrorPublish(topic,payload,true);}
    else toast('网络未连接，稍后撤回会自动生效');
    Object.assign(m,rev);
    renderChat();saveSoon();
    toast('消息已撤回');
    return;
  }
  const log=state.chatLog[state.currentThread]||[];
  const m=log.find(x=>x.ts===ts);
  if(!m)return;
  if(m.from!==state.me.name){toast('只能撤回自己发送的消息');return;}
  if(m.revoked)return;
  if(Date.now()-m.ts>REVOKE_WINDOW){toast('超过 5 分钟的消息不能撤回啦');return;}
  const rev={...m,text:'',img:null,revoked:true};
  const topic=NS+'chat/'+pairId(m.from,m.to)+'/'+m.ts;
  const payload=JSON.stringify(rev);
  if(mq&&mq.connected){mq.publish(topic,payload,{qos:0,retain:true});mirrorPublish(topic,payload,true);}
  else toast('网络未连接，稍后撤回会自动生效');
  Object.assign(m,rev);
  renderChat();saveSoon();scheduleArchive();
  toast('消息已撤回');
}
/* 长按（触摸）+ 右键（桌面）先弹出撤回确认菜单，用户选择后才撤回 */
let lpTimer=null,pendingRevokeTs=0;
function askRevoke(ts){
  const log=state.chatLog[state.currentThread]||[];
  const m=log.find(x=>x.ts===ts);
  if(!m||m.from!==state.me.name||m.revoked)return;
  if(Date.now()-m.ts>REVOKE_WINDOW){toast('超过 5 分钟的消息不能撤回啦');return;}
  pendingRevokeTs=ts;
  $('#revokeOverlay').classList.add('show');
}
$('#rvYes').addEventListener('click',()=>{
  $('#revokeOverlay').classList.remove('show');
  if(pendingRevokeTs)revokeMsg(pendingRevokeTs);
  pendingRevokeTs=0;
});
$('#rvNo').addEventListener('click',()=>{$('#revokeOverlay').classList.remove('show');pendingRevokeTs=0;});
$('#revokeOverlay').addEventListener('click',e=>{if(e.target.id==='revokeOverlay'){$('#revokeOverlay').classList.remove('show');pendingRevokeTs=0;}});
$('#chatArea').addEventListener('touchstart',e=>{
  const b=e.target.closest('.bubble[data-mts]');
  if(!b||b.dataset.mine!=='1')return;
  const ts=+b.dataset.mts;
  lpTimer=setTimeout(()=>{lpTimer=null;askRevoke(ts);},550);
},{passive:true});
['touchend','touchmove','touchcancel'].forEach(ev=>$('#chatArea').addEventListener(ev,()=>{clearTimeout(lpTimer);lpTimer=null;},{passive:true}));
$('#chatArea').addEventListener('contextmenu',e=>{
  const b=e.target.closest('.bubble[data-mts]');
  if(!b||b.dataset.mine!=='1')return;
  e.preventDefault();
  askRevoke(+b.dataset.mts);
});
$('#chatInput').addEventListener('keydown',e=>{if(e.key==='Enter'){sendChat(e.target.value);e.target.value='';}});
/* 发送键点击（此前只有回车能发，点击无响应） */
$('#chatSend').addEventListener('click',()=>{
  const i=$('#chatInput');
  if(i.value.trim()){sendChat(i.value);i.value='';}
  else{i.focus();toast('先输入内容再发送哦');}
});
$('#quickRow').addEventListener('click',e=>{if(e.target.classList.contains('quick'))sendChat(e.target.textContent);});
$('#cGoOrder').addEventListener('click',()=>{
  const o=state.orders.find(o=>(o.seller===state.currentPeer||o.buyer===state.currentPeer));
  if(!o){toast('你和对方还没有订单');return;}
  state.currentOrder=o.id;showView('order');
});
function updateUnread(){
  /* 私聊未读 → 消息 tab；群聊未读（grp: 开头）→ 鹅群 tab */
  let total=0,grp=0;
  Object.entries(state.unread).forEach(([k,v])=>{
    if(k.startsWith('grp:'))grp+=v;else total+=v;
  });
  const b=$('#unreadBadge');
  b.style.display=total?'flex':'none';
  b.textContent=total>99?'99+':total;
  const gb=$('#grpBadge');
  if(gb){gb.style.display=grp?'flex':'none';gb.textContent=grp>99?'99+':grp;}
}

/* ---------- 消息列表 ---------- */
function fmtTime(ts){
  const d=new Date(ts),n=new Date();
  const hm=String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
  if(d.toDateString()===n.toDateString())return hm;
  return (d.getMonth()+1)+'/'+d.getDate()+' '+hm;
}
function peerProduct(peer){
  const o=state.orders.find(o=>(o.buyer===peer&&o.seller===state.me.name)||(o.seller===peer&&o.buyer===state.me.name));
  const pid=o?o.productId:state.chatProducts[peer];
  let p=pid&&state.products.find(x=>x.id===pid);
  if(!p)p=state.products.find(x=>x.owner===peer&&!x.sold);
  return p||null;
}
function renderMsgs(){
  if(!state.me)return;
  /* 每个频道（peer 或 peer|商品）一行；同一卖家不同商品各自独立 */
  /* 群聊频道（grp: 开头）不进消息列表，入口在鹅群页 */
  const list=Object.entries(state.chatLog)
    .filter(([key])=>!key.startsWith('grp:'))
    .map(([key,log])=>{
      const th=parseThread(key);
      return {key,peer:th.peer,pid:th.pid,log:log.filter(m=>m.revoked||m.text||m.img)};
    })
    .filter(x=>x.log.length)
    .sort((a,b)=>b.log[b.log.length-1].ts-a.log[a.log.length-1].ts);
  $('#msgList').innerHTML=list.length?list.map(({key,peer,pid,log})=>{
    const last=log[log.length-1];
    const prevImg=last.img?(last.img.indexOf('stk#')===0?'[表情包] ':'[图片] '):'';
    const prev=last.revoked?'消息已撤回':(last.from===state.me.name?'我：':'')+prevImg+(last.text||'');
    /* 频道商品：pid 精确匹配，其次订单/最近聊天商品 */
    const o=state.orders.find(x=>(!pid||x.productId===pid)&&((x.buyer===state.me.name&&x.seller===peer)||(x.seller===state.me.name&&x.buyer===peer)));
    const usePid=pid||(o&&o.productId)||state.chatProducts[peer];
    const p=usePid?state.products.find(x=>x.id===usePid):null;
    const un=state.unread[key]||0;
    return `<div class="card msg-row" data-peer="${peer}" data-pid="${pid||''}">
      ${avFor(peer)}
      <div class="m-main">
        <div class="m-top"><b>${dispName(peer)}</b><span class="m-time">${fmtTime(last.ts)}</span></div>
        <div class="m-prev">${prev}</div>
        ${p?`<div class="m-good"><div class="mg-img">${p.img?`<img src="${p.img}">`:p.emoji||'📦'}</div><span>${p.name}</span><b>${fmt(p.price)}</b></div>`:''}
      </div>
      ${un?`<span class="m-unread">${un>99?'99+':un}</span>`:''}
    </div>`;
  }).join(''):`<div class="chat-empty" style="margin-top:60px;">📭 还没有消息<br>去商品详情点「联系卖家」开始第一段对话吧</div>`;
}
$('#msgList').addEventListener('click',e=>{
  const r=e.target.closest('[data-peer]');
  if(r)openChatWith(r.dataset.peer,r.dataset.pid||null);
});

/* ---------- 用户资料（昵称/头像/性别/签名）：本地 + MQTT profiles 总线 ---------- */
function dispName(name){
  if(name==null)return '匿名用户';
  const pf=state.profiles[name];
  return (pf&&pf.nick)?pf.nick:name;
}
function avFor(name,extra){
  const pf=name!=null?state.profiles[name]:null;
  const cls='avatar'+(extra?' '+extra:'')+(name&&state.me&&name===state.me.name?' me':'');
  if(pf&&pf.av)return `<div class="${cls}"><img src="${pf.av}" draggable="false"></div>`;
  return `<div class="${cls}">${name!=null?name[0]:'?'}</div>`;
}
function applyMyProfile(){
  if(!state.me)return;
  const pf=state.profiles[state.me.name]||{};
  const gb=(pf.gender&&pf.gender!=='保密')?` <span class="g-badge">${pf.gender==='男'?'♂ 男':'♀ 女'}</span>`:'';
  $('#meName').innerHTML=(pf.nick||state.me.name)+gb;
  $('#meBio').textContent=pf.bio||('校园闲置用户 · '+state.me.name);
  const av=$('#meAvatar');
  if(pf.av){av.innerHTML=`<img src="${pf.av}">`;av.style.fontSize='0';}
  else{av.textContent=state.me.name[0];av.style.fontSize='';}
}
/* 编辑弹窗 */
let profTmp={av:null};
$('#editProfile').addEventListener('click',()=>{
  if(!state.me)return;
  const pf=state.profiles[state.me.name]||{};
  profTmp={av:pf.av||null};
  $('#pfNick').value=pf.nick||'';
  $('#pfBio').value=pf.bio||'';
  $$('#pfGenders .pf-g').forEach(g=>g.classList.toggle('on',g.dataset.g===(pf.gender||'保密')));
  const img=$('#profAvImg'),txt=$('#profAvTxt');
  if(pf.av){img.src=pf.av;img.style.display='';txt.style.display='none';}
  else{img.style.display='none';txt.textContent=state.me.name[0];txt.style.display='';}
  $('#profOverlay').classList.add('show');
});
$('#profClose').addEventListener('click',()=>$('#profOverlay').classList.remove('show'));
$('#profOverlay').addEventListener('click',e=>{if(e.target.id==='profOverlay')$('#profOverlay').classList.remove('show');});
$('#profAvBox').addEventListener('click',()=>$('#profFile').click());
$('#profFile').addEventListener('change',async e=>{
  const f=[...e.target.files][0];
  e.target.value='';
  if(!f||!f.type.startsWith('image'))return;
  toast('处理头像中…');
  profTmp.av=await compressImg(f);
  const img=$('#profAvImg'),txt=$('#profAvTxt');
  img.src=profTmp.av;img.style.display='';txt.style.display='none';
  toast('头像已就绪，记得保存 ✅');
});
$('#pfGenders').addEventListener('click',e=>{
  const g=e.target.closest('.pf-g');if(!g)return;
  $$('#pfGenders .pf-g').forEach(x=>x.classList.toggle('on',x===g));
});
$('#pfSave').addEventListener('click',()=>{
  if(!state.me)return;
  const pf={
    nick:$('#pfNick').value.trim()||state.me.name,
    gender:($('#pfGenders .pf-g.on')||{}).dataset?.g||'保密',
    bio:$('#pfBio').value.trim(),
    av:profTmp.av,
    ts:Date.now(),
  };
  const payload=JSON.stringify(pf);
  if(payload.length>PAYLOAD_MAX){toast('头像太大，请换一张小图');return;}
  if(mq&&mq.connected){
    mq.publish(NS+'profiles/'+encodeURIComponent(state.me.name),payload,{qos:0,retain:true});
    mirrorPublish(NS+'profiles/'+encodeURIComponent(state.me.name),payload,true);
  }else toast('网络未连接，资料已保存到本地，恢复后自动同步');
  state.profiles[state.me.name]=pf;
  const saved=getStore('me')||{};
  saved.profile=pf;setStore('me',saved);
  $('#profOverlay').classList.remove('show');
  applyMyProfile();
  if(state.view==='profile')renderProfile();
  toast('资料已保存 ✅');
});

/* ---------- 个人中心 ---------- */
function renderProfile(){
  if(!state.me)return;
  const myPub=state.products.filter(p=>p.owner===state.me.name);
  const myOrders=state.orders.filter(o=>o.buyer===state.me.name||o.seller===state.me.name);
  $('#stPub').textContent=myPub.filter(p=>!p.sold).length;
  $('#stSold').textContent=myOrders.filter(o=>o.seller===state.me.name&&o.status===3).length;
  $('#stBought').textContent=myOrders.filter(o=>o.buyer===state.me.name).length;
  $('#ordBadge').textContent=myOrders.filter(o=>o.status<3).length+' 个进行中';
  $('#favBadge').textContent=state.favs.size+' 件';
  /* 在线数据由真实行为统计得出 */
  const da=dailyAvgHours();
  $('#moDaily').textContent=da?da.toFixed(1)+' 小时':'–';
  const tp=topPeriod();
  $('#moHours').textContent=tp?tp[0]+'–'+(tp[1]+1)+' 点':'–';
  const ar=avgReplyMs();
  $('#moReply').textContent=ar?(ar<60000?Math.max(1,Math.round(ar/1000))+' 秒':Math.round(ar/60000)+' 分钟'):'–';
  /* 在线数据同步到总线，供他人主页展示 */
  publishActivity();
}
/* ---------- 版本公告 ---------- */
const APP_VERSION='v5.33';
const CHANGELOG=[
  {v:'v5.33',d:'11-25',cur:true,t:'UI 全面打磨：首页标题改「闲鹅」、分类图标上移+排序筛选下移、商品页去掉「东门驿站自提」、下单成功弹窗居中纯文字、发布页删冗余图标改「闲鹅推荐价」、多处间距优化'},
  {v:'v5.9.6',d:'11-20',t:'移除视频上传功能，上传只支持图片（最多 4 张），历史商品中的视频不再展示'},
  {v:'v5.9.5',d:'11-20',t:'频道导航平铺到首页（闲鱼样式）：一行排序/筛选频道 + 一排图标分类频道，点右侧箭头打开全部频道弹窗'},
  {v:'v5.9.4',d:'11-20',t:'首页搜索框新增下拉筛选频道面板：推荐/最新发布/热门商品排序，支持面交/可议价筛选，11 个商品大类一键筛选；首页标题改为「闲鹅校园二手APP」'},
  {v:'v5.9.3',d:'11-20',t:'移除个人中心的「偏好档案」模块，页面更简洁'},
  {v:'v5.9.2',d:'11-20',t:'网络稳定性大修：超限大消息不再发给服务器（之前会被服务器踢掉连接导致反复掉线）；节点重连策略放缓'},
  {v:'v5.8',d:'11-20',t:'修复上传图片失效；订单详情图片缩小；全站图片点击看大图（双指缩放/双击放大）；广场帖子可发图片和表情包，评论也能发表情；我的点赞与我的收藏分开'},
  {v:'v5.7',d:'11-20',t:'聊天按商品分频道：每个订单一个独立聊天；聊天顶部商品卡与订单精确对应，已下单显示查看进度'},
  {v:'v5.6',d:'11-20',t:'商品可编辑（重新打开编辑页改图/价格/交易方式）；库存设置：下单自动减一、0 件自动下架；聊天页已下单显示查看订单进度'},
  {v:'v5.5',d:'11-20',t:'详情页单图不滑动、多图才可滑；消息列表页显示底部导航；进入聊天自动定位最新消息'},
  {v:'v5.4',d:'11-20',t:'聊天点头像进主页（好评率/卖出买入/在售/在线三指标）；消息已读回执；发布可选面交或送楼下并备注；买卖快捷语分开；修复发布页上传区'},
  {v:'v5.3',d:'11-20',t:'聊天页点击对方头像进个人主页；商品新增浏览量/收藏量；首页搜索直达独立搜索页：热门搜索+全新分类体系，支持关键词+分类组合筛选'},
  {v:'v5.2',d:'11-20',t:'聊天页直达下单（顶部商品卡+立即下单）；搜索历史记录；未传图发布按钮置灰；字号与对比度全面优化'},
  {v:'v5.1',d:'11-20',t:'搜索结果独立页面：输入关键词即切换，只显示搜索框与结果；删除全部演示商品，仅保留真实发布'},
  {v:'v5.0',d:'11-19',t:'全新橙色主题：顶部橙色色块、全站按钮统一橙色系；全面放宽内边距，按钮不再贴边'},
  {v:'v4.9',d:'11-19',t:'返回按钮全面升级为"回到上一步"；商品多图新增左右点按箭头'},
  {v:'v4.8',d:'11-19',t:'访客模式：打开即用，自动分配 1~10 号体验账号，无需注册登录'},
  {v:'v4.7',d:'11-19',t:'商品多图滑动浏览；买卖双方快捷语区分；聊天时间分隔（10 分钟规则）；全新闲鹅开屏图标'},
  {v:'v4.6',d:'11-19',t:'历史数据恢复：商品/聊天跨节点补齐，登录后自动再取一次历史消息'},
  {v:'v4.5',d:'11-19',t:'跨节点数据同步：所有数据镜像写入三个总线节点，历史数据不因连接节点切换而丢失'},
  {v:'v4.4',d:'11-18',t:'聊天新增闲鹅表情包（5 款）；移除遮挡按键的 Open Sandbox 悬浮按钮'},
  {v:'v4.3',d:'11-18',t:'连接提速：三个总线节点并行竞速，自动采用最快连上的节点'},
  {v:'v4.2',d:'11-18',t:'多总线节点自动切换：主节点连不上时自动启用备用节点，市集数据自动补种'},
  {v:'v4.1',d:'11-18',t:'连接稳定性优化：断线自动重连、消息暂存补发、登录等待更耐心'},
  {v:'v4.0',d:'11-18',t:'闲鹅广场上线：水聊发帖、点赞收藏评论；浏览记录永久保存（上限 100 条）'},
  {v:'v3.6',d:'11-17',t:'发布页新增 AI 生成描述、推荐价一键填入、议价设置（接受/不接受小刀）；我的发布与订单列表页'},
  {v:'v3.5',d:'11-17',t:'搜索一键清空；发布标签支持搜索自选；聊天记录永久保留；个人中心子列表卡片化'},
  {v:'v3.0',d:'11-16',t:'闲鹅推荐价：同类行情参考价，点击可查看价格区间说明'},
  {v:'v2.6',d:'11-16',t:'偏好档案可折叠；个人主页在线统计改为真实行为数据'},
  {v:'v2.5',d:'11-16',t:'消息中心：底部消息入口汇总全部对话，未读红点提醒'},
  {v:'v2.0',d:'11-15',t:'多用户在线版：账号登录注册、商品全端实时共享、真人聊天'},
  {v:'v1.0',d:'11-14',t:'首发演示版：浏览、下单、校内站点自提全流程'},
];
function renderChangelog(){
  $('#logList').innerHTML=`<div class="log-cur">当前版本 <b>${APP_VERSION}</b> · 已是最新 🦢</div>`
    +CHANGELOG.map(l=>`
    <div class="card log-item ${l.cur?'latest':''}">
      <div class="log-head"><span class="log-v">${l.v}</span>${l.cur?'<span class="log-now">当前版本</span>':''}<span class="log-date">${l.d} 更新</span></div>
      <div class="log-text">${l.t}</div>
    </div>`).join('');
}
$('#annBtn').addEventListener('click',()=>showView('changelog'));
/* ---------- 鹅群 ---------- */
/* 群列表渲染：微信群样式（头像 + 群名 + 最后一条消息 + 时间） */
function renderGrpList(){
  const kw=(state.grpKw||'').trim().toLowerCase();
  const gs=Object.values(state.groups)
    .filter(g=>g&&g.name)
    .filter(g=>!kw||g.name.toLowerCase().includes(kw)||(g.members||[]).some(m=>dispName(m).toLowerCase().includes(kw)))
    .sort((a,b)=>lastGrpTs(b.id)-lastGrpTs(a.id));
  $('#grpCount').textContent=gs.filter(g=>grpMemberOf(g.id,state.me.name)).length;
  $('#plazaList').innerHTML=gs.length?gs.map(g=>{
    const mine=grpMemberOf(g.id,state.me.name);
    const log=state.chatLog['grp:'+g.id]||[];
    const last=log[log.length-1];
    const prev=last?(last.revoked?(last.from===state.me.name?'你':dispName(last.from))+'撤回了一条消息'
      :dispName(last.from)+'：'+(last.img?(last.img.indexOf('stk#')===0?'[表情包]':'[图片]'):(last.text||'')))
      :('群主 '+dispName(g.owner)+' 创建了本群');
    const time=last?fmtChatTime(last.ts):(g.ts?new Date(g.ts).toLocaleDateString('zh-CN'):'');
    const unread=state.unread['grp:'+g.id]||0;
    return `<div class="card grp-row ${mine?'':'grp-locked'}" data-gid="${g.id}">
      <div class="grp-ava">${(g.name||'群')[0]}</div>
      <div class="grp-main">
        <div class="grp-name">${g.name}${mine?'':'<span class="grp-notjoined">未加入</span>'}</div>
        <div class="grp-prev">${prev}</div>
      </div>
      <div class="grp-side">${time}${unread?`<span class="unread">${unread>99?'99+':unread}</span>`:''}</div>
    </div>`;
  }).join(''):`<div class="chat-empty" style="margin-top:60px;">🦢 还没有群聊<br>点右上角 ＋ 发起群聊，或加入同学的群</div>`;
}
function lastGrpTs(id){
  const log=state.chatLog['grp:'+id]||[];
  return (log.length&&log[log.length-1].ts)||state.groups[id].ts||0;
}
/* 群列表点击：已加入的进群聊；未加入的提示先加入 */
$('#plazaList').addEventListener('click',e=>{
  const row=e.target.closest('[data-gid]');
  if(!row)return;
  const gid=row.dataset.gid;
  if(grpMemberOf(gid,state.me.name))openGroupChat(gid);
  else{toast('先点右上角 ＋ →「加入群聊」加入这个群');renderJoinList();}
});
/* 顶部搜索：群名或成员名（搜索框常驻在标题正下方居中） */
$('#grpSearch').addEventListener('input',e=>{state.grpKw=e.target.value;renderGrpList();});
/* 右上角 ＋ 菜单 */
$('#grpPlus').addEventListener('click',e=>{e.stopPropagation();$('#grpPlusMenu').classList.toggle('show');});
document.addEventListener('click',e=>{
  const m=$('#grpPlusMenu');
  if(m&&m.classList.contains('show')&&!e.target.closest('#grpPlusMenu')&&!e.target.closest('#grpPlus'))m.classList.remove('show');
});
$('#grpPlusMenu').addEventListener('click',e=>{
  const it=e.target.closest('[data-act]');
  if(!it)return;
  $('#grpPlusMenu').classList.remove('show');
  if(it.dataset.act==='create'){$('#gcName').value='';$('#grpCreateOverlay').classList.add('show');setTimeout(()=>$('#gcName').focus(),120);}
  else{renderJoinList();$('#grpJoinOverlay').classList.add('show');}
});
/* 发起群聊 */
$('#gcClose').addEventListener('click',()=>$('#grpCreateOverlay').classList.remove('show'));
$('#gcSubmit').addEventListener('click',()=>{
  const name=$('#gcName').value.trim();
  if(!name){toast('先给群聊起个名字吧');return;}
  const g={id:'g'+Date.now().toString(36),name,owner:state.me.name,members:[state.me.name],ts:Date.now()};
  pub(NS+'groups/'+g.id,g,true);
  state.groups[g.id]=g;
  $('#grpCreateOverlay').classList.remove('show');
  toast('群聊「'+name+'」创建成功 🦢');
  renderGrpList();
});
$('#gcName').addEventListener('keydown',e=>{if(e.key==='Enter')$('#gcSubmit').click();});
/* 加入群聊 */
$('#gjClose').addEventListener('click',()=>$('#grpJoinOverlay').classList.remove('show'));
function renderJoinList(){
  const others=Object.values(state.groups).filter(g=>g&&g.name&&!grpMemberOf(g.id,state.me.name));
  const mine=Object.values(state.groups).filter(g=>grpMemberOf(g.id,state.me.name));
  $('#gjList').innerHTML=(others.length?'':`<div class="chat-empty" style="margin:10px 0;">🌿 现在没有可加入的群<br>让同学把群创建好，或自己发起一个</div>`)
    +others.map(g=>`<div class="card grp-row" data-join="${g.id}">
      <div class="grp-ava">${(g.name||'群')[0]}</div>
      <div class="grp-main">
        <div class="grp-name">${g.name}</div>
        <div class="grp-prev">${(g.members||[]).length} 位成员 · 群主 ${dispName(g.owner)}</div>
      </div>
      <div class="btn btn-orange" style="height:30px;padding:0 14px;font-size:12px;border-radius:15px;">加入</div>
    </div>`).join('')
    +(mine.length?`<div style="font-size:11px;color:var(--text3);margin:12px 4px 4px;">我已加入的群</div>`
      +mine.map(g=>`<div class="card grp-row" data-gid="${g.id}">
        <div class="grp-ava">${(g.name||'群')[0]}</div>
        <div class="grp-main">
          <div class="grp-name">${g.name}</div>
          <div class="grp-prev">${(g.members||[]).length} 位成员 · 已加入</div>
        </div>
        <div style="font-size:12px;color:var(--green);">✓</div>
      </div>`).join(''):'');
}
$('#gjList').addEventListener('click',e=>{
  const j=e.target.closest('[data-join]');
  if(j){
    const g=state.groups[j.dataset.join];
    if(!g)return;
    if(!g.members.includes(state.me.name)){
      g.members.push(state.me.name);
      pub(NS+'groups/'+g.id,g,true);
      toast('已加入「'+g.name+'」🎉');
    }
    $('#grpJoinOverlay').classList.remove('show');
    renderGrpList();
    return;
  }
  const row=e.target.closest('[data-gid]');
  if(row){$('#grpJoinOverlay').classList.remove('show');openGroupChat(row.dataset.gid);}
});

/* ---------- 我的发布/订单列表页 ---------- */
const LIST_MODES={pub:'我的发布',sold:'卖出的订单',bought:'买入的订单',all:'我的订单',his:'浏览记录',favs:'我的收藏'};
function renderMyList(){
  if(!state.me)return;
  const m=state.listMode||'all';
  $('#myListTitle').textContent=LIST_MODES[m]||'列表';
  let cards=[];
  if(m==='his'){
    cards=state.history.map(id=>state.products.find(x=>x.id===id)).filter(Boolean)
      .map(p=>({click:`data-id="${p.id}"`,peer:p.owner,top:'浏览于 '+(p.ts?new Date(p.ts).toLocaleDateString('zh-CN'):'今天'),p}));
  }else if(m==='favs'){
    /* 收藏列表：图片 + 商品名 + 价格 + 卖家名字，点开进商品详情 */
    cards=[...state.favs].map(id=>state.products.find(x=>x.id===id)).filter(Boolean)
      .map(p=>({click:`data-id="${p.id}"`,peer:p.owner,top:(p.kind==='buy'?'🎯 求购帖':'🪙 出闲置')+(p.sold?' · 已售出':''),p}));
  }else if(m==='pub'){
    cards=state.products.filter(p=>p.owner===state.me.name).sort((a,b)=>(b.ts||0)-(a.ts||0))
      .map(p=>({click:`data-id="${p.id}"`,peer:state.me.name,top:p.sold?'已售出':'在售中',p}));
  }else{
    const orders=state.orders.filter(o=>m==='all'||(m==='sold'?o.seller===state.me.name:o.buyer===state.me.name)).sort((a,b)=>b.ts-a.ts);
    cards=orders.map(o=>{
      const isBuyer=o.buyer===state.me.name;
      return {click:`data-order="${o.id}"`,peer:isBuyer?o.seller:o.buyer,top:`${isBuyer?'我买':'我卖'} · ${stName(o)}`,p:state.products.find(x=>x.id===o.productId)};
    });
  }
  $('#myListBody').innerHTML=cards.length?cards.map(c=>{
    /* 自己的发布：仅展示图片、价格、简介 + 浏览/收藏数据，不重复展示本人头像名字 */
    if(m==='pub'&&c.p){
      const s=c.p.stats||{views:0,favs:0};
      return `<div class="card pub-card" ${c.click}>
        <div class="pc-img">${c.p.img?`<img src="${c.p.img}">`:c.p.emoji||'📦'}${c.p.sold?'<span class="sold-mark">已售出</span>':''}</div>
        <div class="pc-body">
          <div class="pc-price"><small>¥</small>${c.p.price}</div>
          <div class="pc-desc">${c.p.desc||'卖家很懒，没有写描述～'}</div>
          <div class="pc-stats"><span>👁 ${s.views||0} 次浏览</span><span>❤ ${s.favs||0} 人收藏</span></div>
        </div>
      </div>`;
    }
    return `
    <div class="card sub-row" ${c.click}>
      ${m==='favs'?(c.p?avFor(c.peer):`<div class="avatar">${(c.peer||'?')[0]}</div>`):`<div class="avatar">${(c.peer||'?')[0]}</div>`}
      <div class="m-main">
        <div class="m-top"><b>${m==='favs'?(c.p?dispName(c.peer):(c.peer||'匿名用户')):(c.peer||'匿名用户')}</b><span class="m-time">${c.top}</span></div>
        <div class="m-good"><div class="mg-img">${c.p?`${c.p.img?`<img src="${c.p.img}">`:c.p.emoji||'📦'}`:'📦'}</div><span>${c.p?c.p.name:'商品已下架'}</span><b>${fmt(c.p?c.p.price:0)}</b></div>
      </div>
    </div>`;
  }).join(''):`<div class="chat-empty" style="margin-top:40px;">${m==='pub'?'📦 还没有发布闲置，点底部「＋」发布第一件':m==='his'?'👣 暂无浏览记录':m==='favs'?'❤️ 收藏夹空空的，去逛逛吧':'🧾 暂无相关订单'}</div>`;
}
$$('.stat-link').forEach(s=>s.addEventListener('click',()=>{
  state.listMode=s.dataset.list;showView('mylist');
}));
$('#goOrders').addEventListener('click',()=>{
  state.listMode='all';showView('mylist');
});
$('#goHistory').addEventListener('click',()=>{
  state.listMode='his';showView('mylist');
});
$('#goFavs').addEventListener('click',()=>{
  state.listMode='favs';showView('mylist');
});
$('#myListBody').addEventListener('click',e=>{
  const el=e.target.closest('[data-order],[data-id]');if(!el)return;
  if(el.dataset.order){state.currentOrder=el.dataset.order;showView('order');}
  else openDetail(el.dataset.id);
});
$$('.me-item[data-sub]').forEach(it=>it.addEventListener('click',()=>{
  const wasOpen=it.classList.contains('open');
  $$('.me-item').forEach(x=>x.classList.remove('open'));
  if(!wasOpen)it.classList.add('open');
}));
$$('.sublist').forEach(list=>list.addEventListener('click',e=>{
  const el=e.target.closest('[data-order],[data-id]');if(!el)return;
  if(el.dataset.order){state.currentOrder=el.dataset.order;showView('order');}
  else openDetail(el.dataset.id);
}));
$('#goSupport').addEventListener('click',()=>showView('support'));
$('#editProfile').addEventListener('click',()=>toast('资料编辑功能开发中～'));
/* 偏好档案模块已按需求移除（有备份，需要时可恢复） */

/* ---------- 客服中心（机器人） ---------- */
const FAQ_ANS={
  '商品有问题怎么办？':'别担心～担保交易下你可以到站点验货时当场拒绝确认，交易自动取消、货款原路退回；已完成交易可在 48 小时内发起售后，上传照片凭证后客服会介入处理。',
  '卖家不发货怎么办？':'下单后 24 小时内卖家未发货，订单会自动提醒；超过 48 小时可点击「申请平台介入」，核实后货款将全额退回你的账户。',
  '如何申请退款？':'订单详情页底部点「申请退款」→ 选择原因 → 上传凭证。只要你未确认收货，货款都在平台担保中，退款秒到账。',
};
function renderSupport(){
  $('#csArea').innerHTML=state.csMsgs.map(m=>{
    const av=m.side==='left'?`<div class="avatar" style="background:linear-gradient(135deg,#9CBF9B,#7FA87E);">客</div>`:`<div class="avatar me">我</div>`;
    const body=m.img
      ?`<div class="bubble">${m.img.indexOf('stk#')===0?m.img:`<img class="viewerable" src="${m.img}" style="width:150px;border-radius:10px;display:block;${m.text?'margin-bottom:8px;':''}">`}${m.text||''}</div>`
      :`<div class="bubble">${m.text}</div>`;
    return `<div class="msg ${m.side}">${av}${body}</div>`;
  }).join('');
  const a=$('#csArea');a.scrollTop=a.scrollHeight;
}
function csReply(text){setTimeout(()=>{state.csMsgs.push({side:'left',text});if(state.view==='support')renderSupport();},900);}
function sendCS(text){
  if(!text.trim())return;
  state.csMsgs.push({side:'right',text});renderSupport();$('#csInput').value='';
  csReply(FAQ_ANS[text]||`收到啦～已为你创建工单 #${Math.floor(Math.random()*9000+1000)}，客服会在 24 小时内处理并回复。`);
}
$('#csSend').addEventListener('click',()=>sendCS($('#csInput').value));
$('#csInput').addEventListener('keydown',e=>{if(e.key==='Enter')sendCS(e.target.value);});
$$('.faq-card').forEach(c=>c.addEventListener('click',()=>sendCS(c.dataset.q)));
/* 客服发图片：选图压缩后以图片消息发出，机器人回复按凭证类型区分 */
$('#csUpload').addEventListener('click',()=>$('#csFile').click());
$('#csFile').addEventListener('change',async e=>{
  const f=e.target.files&&e.target.files[0];
  e.target.value='';
  if(!f)return;
  try{
    const dataUrl=await compressImg(f);
    state.csMsgs.push({side:'right',img:dataUrl,text:$('#csInput').value.trim()});
    $('#csInput').value='';
    renderSupport();
    csReply('凭证图片已收到 📎 已附加到工单中，我们会尽快核实处理。有问题可以再补充文字说明。');
  }catch(err){toast('图片读取失败，请换一张试试');}
});

/* ---------- 发布上传 ---------- */
const UP_MAX=4;
let pubImgs=[];
const AI_POOL=CATS.map(c=>c.major);
function resetPublish(){
  pubImgs=[];state.pubTags=new Set();state.pubGrade='九成新';state.pubCut='接受小刀';
  state.pubDelivery='self';state.pubFee=0;state.pubTradeNote='';state.pubEditId=null;
  state.pubKind='sell';
  $('#pubPrice').value='';$('#pubDesc').value='';$('#tradeNote').value='';$('#pubStock').value='1';
  $('#feeInput').value='';
  $('#pubTitle').textContent='发布闲置';
  const sb=$('#pubSubmit');if(sb)sb.textContent='发布闲置';
  $('#aiState').textContent='上传照片后自动识别';
  syncTradeUI();syncKindUI();
  renderUpload();
}
/* 编辑模式：把已有商品内容填回发布页 */
function fillPublish(p){
  state.pubEditId=p.id;
  pubImgs=(p.imgs&&p.imgs.length)?p.imgs.slice():(p.img?[p.img]:[]);
  state.pubTags=new Set((p.tags&&p.tags.length)?p.tags.slice():[p.cat].concat(p.sub?[p.sub]:[]));
  state.pubGrade=p.cond||'九成新';
  state.pubCut=p.cut||'接受小刀';
  /* 旧商品兼容：无 delivery 字段按旧 trade 值推断 */
  state.pubDelivery=p.delivery||(p.trade==='送到楼下'?'delivery':'self');
  state.pubFee=p.fee||0;
  state.pubKind=p.kind||'sell';
  state.pubTradeNote=p.tradeNote||'';
  $('#pubPrice').value=p.price;
  $('#pubDesc').value=(p.desc&&p.desc!=='卖家很懒，没有写描述～')?p.desc:'';
  $('#tradeNote').value=p.tradeNote||'';
  $('#feeInput').value=p.fee||'';
  $('#pubStock').value=p.stock!=null?Math.max(1,p.stock):1;
  $('#pubTitle').textContent=p.kind==='buy'?'编辑求购':'编辑商品';
  const sb=$('#pubSubmit');if(sb)sb.textContent=p.kind==='buy'?'保存求购':'保存修改';
  $('#aiState').textContent='已载入原商品信息，可修改后保存';
  syncTradeUI();syncKindUI();
  showView('publish');
}
$('#cutRow').addEventListener('click',e=>{
  const c=e.target.closest('[data-cut]');if(!c)return;
  state.pubCut=c.dataset.cut;
  $$('#cutRow .cut-chip').forEach(x=>x.classList.toggle('on',x===c));
});
/* 配送方式：仅自提面交 / 仅送货上门 / 两者都可以（买家选），支持送货可设跑腿费 */
const DELIVERY_LABEL={self:'仅自提面交',delivery:'仅送货上门',both:'自提或送货'};
function syncTradeUI(){
  const d=state.pubDelivery;
  $$('#tradeRow .cut-chip').forEach(x=>x.classList.toggle('on',x.dataset.trade===d));
  $('#feeBox').style.display=(d==='self')?'none':'';
  $('#tradeNoteBox').style.display=(d==='delivery')?'none':'';
  $('#feeInput').placeholder=(d==='both')?'送货跑腿费（元），买家选送货时自动合计':'跑腿费（元），如 3，买家下单自动合计';
  $('#tradeNote').placeholder='希望在哪里面交，如：东门驿站门口';
  const isBuy=state.pubKind==='buy';
  $('#tradeTip').textContent=isBuy
    ?(d==='self'?'求购交接：你有货时可按此方式交付给求购者'
      :d==='delivery'?'求购交接：你送货上门，求购者支付跑腿费'
      :'求购交接：你有货时可自提交付给求购者，或送货上门（求购者付跑腿费）')
    :(d==='self'
    ?'买家到你的面交地点当面验货交易；地点可在聊天中协商调整'
    :d==='delivery'
    ?'你送货上门，买家下单时填写配送地址并支付跑腿费'
    :'买家下单时二选一：到面交地点自提，或送货上门（支付跑腿费）');
  $('#feeInput').placeholder=isBuy
    ?(d==='both'?'送货跑腿费（元），由求购者支付':'跑腿费（元），如 3，买家下单自动合计')
    :(d==='both'?'送货跑腿费（元），买家选送货时自动合计':'跑腿费（元），如 3，买家下单自动合计');
}
$('#tradeRow').addEventListener('click',e=>{
  const c=e.target.closest('[data-trade]');if(!c)return;
  state.pubDelivery=c.dataset.trade;
  syncTradeUI();
});
/* 发布类型：出闲置（卖）/ 收闲置（求购），收物帖视角全切换 */
function syncKindUI(){
  const buy=state.pubKind==='buy';
  $$('#kindRow .cut-chip').forEach(x=>x.classList.toggle('on',x.dataset.kind===state.pubKind));
  $('#condWrap').style.display=buy?'none':'';
  $('#cutWrap').style.display=buy?'none':'';
  $('#stockRow').style.display=buy?'none':'';
  $('#priceHint').textContent=buy?'收购心理价（可议）':'';
  $('#pubPrice').placeholder=buy?'0.00':'0.00';
  $('#pubPrice').parentElement.querySelector('.rmb').textContent='¥';
  $('#upLabel').innerHTML=buy?'晒一下想要的闲置 <small>可选，最多 4 张图</small>':'拍拍你的闲置 <small>第一张为封面 · 最多 4 张图</small>';
  $('#pubDesc').placeholder=buy?'描述你想收的东西、接受成色、预算说明…':'描述一下物品的成色、购买时间、交易方式…';
  $('#tradeTip').textContent=buy
    ?'求购交接方式：你有货时可按此方式交付给求购者'
    :'买家到你的面交地点当面验货交易；地点可在聊天中协商调整';
  $('#pubImgHint').textContent=buy?'求购帖可以不上图，直接发布':'请至少上传一张商品图片';
  $('#pubSubmit').textContent=state.pubEditId?(buy?'保存求购':'保存修改'):(buy?'发布求购帖':'发布闲置');
  $('#pubTitle').textContent=state.pubEditId?(buy?'编辑求购':'编辑商品'):(buy?'发布求购':'发布闲置');
}
$('#kindRow').addEventListener('click',e=>{
  const c=e.target.closest('[data-kind]');if(!c)return;
  state.pubKind=c.dataset.kind;
  syncKindUI();
});
$('#feeInput').addEventListener('input',e=>{
  const v=parseFloat(e.target.value);
  state.pubFee=(isNaN(v)||v<0)?0:Math.min(50,v);
});
$('#tradeNote').addEventListener('input',e=>{state.pubTradeNote=e.target.value.trim();});
/* AI 生成物品描述 */
const DESC_LIB={
  '教材书籍':['{c}，{g}，内容完整无缺页。刚考完试整理出来出给需要的同学，复习直接上手。支持校内站点自提，到站现场验货后确认收货，双方都放心～','{c}{g}，当年一口气整理的，重点标注很全。现在用不上了低价出，接手就能直接用。校内面交，站点验货后确认～'],
  '电子数码配件':['{c}，{g}，功能一切正常。附赠原装配件，到手即用。可以约校内站点当面测试再确认，有问题随时沟通～','{c}{g}，自用闲置出，已清理干净。支持到站点现场试机，确认没问题再完成交易，欢迎砍价交流～'],
  '生活用品':['{c}，{g}，宿舍闲置出。日常使用频率不高，成色见图。东西不大好拿，约校内站点交接很方便，验货满意再确认～','{c}{g}，毕业清宿舍忍痛割爱。实物比照片更好，欢迎到站点当面看看，合适就带走～'],
  '服饰鞋包':['{c}，{g}，无破损无污渍，洗晒干净了才挂出来。尺码标准可到站点试穿确认，不合适不勉强，支持现场验货～','{c}{g}，买来穿得不多，现在断舍离。颜色实拍无滤镜，介意色差可约站点看实物，诚实交易～'],
  '文体用品':['{c}，{g}，保养得不错，正常使用无暗病。运动/学习好物低价转让，喜欢就别犹豫，约站点验货后成交～','{c}{g}，社团活动结束后闲置。成色见图，功能完好，欢迎到站点当面检查，合适再确认收货～'],
  '宿舍家具':['{c}，{g}，宿舍神器真实好用，因为要搬走才出。体积不大方便携带，约校内站点交接，现场验货确认～','{c}{g}，只用了几个月。安装简单即插即用，宿舍党刚需。到站点看货满意再确认，顺路自提更方便～'],
  '美妆杂物':['{c}，{g}，保质期都还很充裕，专柜购入有记录。肤质不合适才出，介意的话可以约站点当面确认批次和质地～','{c}{g}，囤多了用不完。保存条件良好，无过期无变质，图物一致。站点验货后确认收货，放心拍～'],
  '其他闲置':['{c}，{g}，闲置出回血。实物如图，功能完好，具体细节可以聊，支持校内站点验货后确认收货～','{c}{g}，放宿舍占地方，低价出给有缘人。有什么想了解的直接私信我，约站点当面看货最稳妥～'],
};
/* 收购帖专属描述库：求购视角，与出物文案区分 */
const BUY_DESC_LIB={
  '教材书籍':['蹲一本{c}！备考急用，心理价{p}以内，成色不限能用就行，缺角划线都可接受。有闲置的同学联系我，可面交可送货，验完货当场确认～','长期收{c}，刚考完的学长学姐看过来～预算{p}左右（可小刀），版本对得上就行，笔记越多越感谢！东门驿站附近自提优先，谢谢你～'],
  '电子数码配件':['求收{c}一台！心理价{p}，成色九成新以上最佳，功能正常无维修史即可。可当面验机（拍照/充电/试机都行），合适当场交易，走平台担保安全放心～','收{c}！自用不挑包装，预算{p}以内。有原盒配件加分，能到东门驿站或宿舍楼下当面试机最好，长期蹲～'],
  '生活用品':['蹲一个{c}～心理价{p}，成色不限，干净能用就行。毕业清宿舍的同学优先出给我，可上门到宿舍楼下自提，替你的闲置找个新家～','收{c}！预算{p}左右，新旧无所谓，图物一致即可。校内可面交也可以送货到楼下（跑腿费我出），速来联系我呀～'],
  '服饰鞋包':['求购{c}！心理价{p}以内，无破损无污渍，尺码细节聊。可以约面交试穿，合适当场确认；不合适绝不纠缠，礼貌交流放心出～','收{c}！预算{p}，成色八成新往上即可，洗晒干净优先。校内面交验货，也可送货（跑腿费我出），有闲置的同学快联系我～'],
  '文体用品':['蹲收{c}！心理价{p}左右，功能完好无暗病即可，外观磨损不介意。可当面试用，满意再成交，走平台担保双方安心～','收{c}！预算{p}以内，社团退坑的学长学姐看过来～成色随意能用就行，东门驿站面交优先，也可约送货，谢谢！'],
  '宿舍家具':['收{c}！宿舍刚需，心理价{p}以内，结构稳固无断裂即可。最好能送到宿舍楼下（跑腿费好商量），当面验货满意再确认～','蹲一个{c}～预算{p}左右，毕业搬走的同学优先出给我！可上门自提帮你清宿舍，验货当场确认，利人利己～'],
  '美妆杂物':['求收{c}！心理价{p}以内，保质期充裕、无过期无变质，有购买记录更佳。可当面核对批次质地，图物一致才确认收货～','收{c}！预算{p}左右，囤多想出的同学联系我～介意的批次可以当面看，校内面交或送货都行，诚信交易～'],
  '其他闲置':['蹲一个{c}！心理价{p}以内，成色不限能用就行。有闲置的同学直接联系我，可面交可送货，验货满意当场确认，平台担保放心～','收{c}！预算{p}左右（可小刀），新旧都行，图物一致即可。面交自提优先，也可送货到宿舍楼下，谢谢各位～'],
};
$('#aiDescBtn').addEventListener('click',async()=>{
  /* 真 AI 优先：结合名称/分类/成色/价格生成；失败回退本地词库（保证离线可用） */
  const cat=pubMajor()||'其他闲置';
  const isBuy=state.pubKind==='buy';
  const price=$('#pubPrice').value;
  $('#aiDescBtn').textContent='🦢 AI 生成中…';
  try{
    const txt=await aiChat([{role:'user',content:'你是校园二手交易平台"闲鹅"的文案助手。请直接输出一段' +(isBuy?'求购帖':'出售帖')+'描述（40-80字，口语化、真诚、带 emoji，不要标题不要引号不要解释）。信息：分类=' + cat + '；成色=' + (state.pubGrade||'未知') + '；' + (isBuy?'求购心理价':'出价') + '=' + (price?'¥'+price:'未填') + '；描述要求：' + (isBuy?'突出急用、预算、交接方式灵活':'突出成色、校内自提验货、放心交易') + '。' + ($('#pubDesc').value?'原描述（可润色）：'+$('#pubDesc').value.slice(0,80):'')}]);
    const clean=txt.trim().replace(/^["'「]+|["'」]+$/g,'');
    if(clean){$('#pubDesc').value=clean.slice(0,240);toast('AI 描述已生成 ✨');}
    else throw new Error('空结果');
  }catch(e){
    /* 回退：本地词库 */
    if(isBuy){
      const p=price?'¥'+price:'预算范围内';
      const lib=BUY_DESC_LIB[cat]||BUY_DESC_LIB['其他闲置'];
      $('#pubDesc').value=lib[Math.floor(Math.random()*lib.length)].replace(/\{c\}/g,cat).replace(/\{p\}/g,p);
    }else{
      const g={'全新':'全新未拆封','九成新':'九成新，几乎无使用痕迹','八成新':'八成新，有正常使用痕迹','明显使用痕迹':'有明显使用痕迹但功能完好'}[state.pubGrade]||state.pubGrade;
      const lib=DESC_LIB[cat]||DESC_LIB['其他闲置'];
      $('#pubDesc').value=lib[Math.floor(Math.random()*lib.length)].replace(/\{c\}/g,cat).replace(/\{g\}/g,g);
    }
    toast('AI 通道暂不可用，已用本地文案 ✏️');
  }
  $('#aiDescBtn').textContent='🦢 AI 生成描述';
});
function renderUpload(){
  const g=$('#upGrid');
  let html=pubImgs.map((src,i)=>`<div class="up-tile up-pic" data-del="${i}"><img src="${src}"><span class="del">×</span></div>`).join('');
  if(pubImgs.length<UP_MAX){
    html+=`<div class="up-tile up-add" id="upAdd"><b>＋</b>照片</div>`;
    if(pubImgs.length===0)html+=`<div class="up-tile up-add" style="border-style:dashed;" data-cam><svg class="ic" width="22" height="22" viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg></div>`;
  }
  g.innerHTML=html;
  $('#aiTags').innerHTML=state.pubTags.size
    ?[...state.pubTags].map(t=>`<span class="tag on" data-rm="${t}">${t}<b style="font-weight:400;margin-left:4px;">✕</b></span>`).join('')
    :'<span style="font-size:11px;color:var(--text3);">AI 识别后自动生成标签，也可点下方按钮手动选择</span>';
  $$('#gradeRow .grade').forEach(x=>x.classList.toggle('on',x.dataset.g===state.pubGrade));
  syncTradeUI();
  /* 未上传图片时发布按钮置灰 + 提示（收物帖可免图发布） */
  const noImg=!pubImgs.length&&state.pubKind!=='buy';
  $('#pubSubmit').classList.toggle('disabled',noImg);
  $('#pubImgHint').classList.toggle('show',noImg);
  updatePubRec();
  renderAiPrice();
}
$('#aiTags').addEventListener('click',e=>{
  const t=e.target.closest('[data-rm]');
  if(t){state.pubTags.delete(t.dataset.rm);renderUpload();}
});
/* 全部标签选择面板（带搜索） */
function pubMajor(){
  const tags=[...state.pubTags];
  const m=tags.find(t=>CATS.some(c=>c.major===t));
  if(m)return m;
  const s=tags.find(t=>CATS.some(c=>c.subs.includes(t)));
  return s?CATS.find(c=>c.subs.includes(s)).major:null;
}
function renderTagPanel(){
  const kw=($('#tagSearch').value||'').trim().toLowerCase();
  const secs=CATS.map(sec=>{
    const mHit=!kw||sec.major.toLowerCase().includes(kw);
    const subs=mHit?sec.subs:sec.subs.filter(s=>s.toLowerCase().includes(kw));
    if(!mHit&&!subs.length)return null;
    return {major:sec.major,subs,mOn:state.pubTags.has(sec.major)};
  }).filter(Boolean);
  $('#tagList').innerHTML=secs.length?secs.map(sec=>`
    <div class="cs-sec">
      <div class="cs-major"><span class="mchip ${sec.mOn?'on':''}" data-major="${sec.major}">${sec.major}</span></div>
      <div class="cs-subs">${sec.subs.map(s=>`<span class="schip ${state.pubTags.has(s)?'on':''}" data-tag="${s}">${s}</span>`).join('')}</div>
    </div>`).join(''):'<div class="chat-empty" style="margin-top:40px;">🔍 没有匹配的标签</div>';
  $('#tagCount').textContent=state.pubTags.size;
}
$('#tagPickBtn').addEventListener('click',()=>{renderTagPanel();$('#tagOverlay').classList.add('show');});
$('#tagSearch').addEventListener('input',renderTagPanel);
$('#tagClose').addEventListener('click',()=>$('#tagOverlay').classList.remove('show'));
$('#tagDone').addEventListener('click',()=>$('#tagOverlay').classList.remove('show'));
$('#tagClear').addEventListener('click',()=>{state.pubTags=new Set();renderTagPanel();renderUpload();toast('已清空全部标签');});
$('#tagList').addEventListener('click',e=>{
  const m=e.target.closest('[data-major]');
  if(m){
    const sec=CATS.find(x=>x.major===m.dataset.major);
    if(state.pubTags.has(sec.major)){state.pubTags.delete(sec.major);sec.subs.forEach(s=>state.pubTags.delete(s));}
    else state.pubTags.add(sec.major);
    renderTagPanel();renderUpload();return;
  }
  const s=e.target.closest('[data-tag]');
  if(s){
    const t=s.dataset.tag;
    if(state.pubTags.has(t))state.pubTags.delete(t);
    else{state.pubTags.add(t);const sec=CATS.find(x=>x.subs.includes(t));if(sec)state.pubTags.delete(sec.major);}
    renderTagPanel();renderUpload();
  }
});
$('#upGrid').addEventListener('click',e=>{
  const del=e.target.closest('[data-del]');
  if(del){pubImgs.splice(+del.dataset.del,1);renderUpload();return;}
  if(e.target.closest('#upAdd')||e.target.closest('[data-cam]'))$('#fileInput').click();
});
function compressImg(file){
  return new Promise(res=>{
    const img=new Image(),r=new FileReader();
    r.onload=e=>{
      img.onload=()=>{
        const max=720,sc=Math.min(1,max/Math.max(img.width,img.height));
        const cv=document.createElement('canvas');
        cv.width=Math.round(img.width*sc);cv.height=Math.round(img.height*sc);
        cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
        res(cv.toDataURL('image/jpeg',0.62));
      };
      img.src=e.target.result;
    };
    r.readAsDataURL(file);
  });
}
$('#fileInput').addEventListener('change',async e=>{
  /* 必须先取文件再清 value，否则 FileList 会被清空 */
  const files=[...e.target.files].filter(f=>f.type.startsWith('image'));
  e.target.value='';
  if(!files.length)return;
  const room=UP_MAX-pubImgs.length;
  if(files.length>room){toast(`最多上传 ${UP_MAX} 张图片哦`);}
  if(room>0){
    toast('处理图片中…');
    for(const f of files.slice(0,room))pubImgs.push(await compressImg(f));
  }
  renderUpload();
  if(files.length&&room>0)aiRecognize();
});
/* ---------- AI 真智能：视觉识别商品 + 生成文案 + 建议价 ---------- */
/* 通道优先级：访客本机自定义（localStorage）> 站长内置（BUILTIN_AI，发版时填入）> 免费文字通道 */
/* ★ 站长接入：直连硅基流动（实测支持网页直连）。Key 混淆存储（分段+倒序+Base64），
   源码中无明文 sk- Key；配合"仅用赠送额度不充值"，被盗刷损失封顶，泄露可随时换 Key ★ */
const _ak=["ZGh6eXh2cXFxZGN0eHJpbHB","hdXN4anRkaXVnc21kdG1pZ3","RuYXJwbGR6bXNza3ZhLWtz"];
const BUILTIN_AI={base:'https://api.siliconflow.cn/v1',key:'',model:'Qwen/Qwen3-VL-8B-Instruct'};
try{if(_ak.length){BUILTIN_AI.key=atob(_ak.join('')).split('').reverse().join('');}}catch(e){}
const AI_CFG_KEY='ai_cfg';
function getAiCfg(){
  let local={};
  try{local=JSON.parse(localStorage.getItem(AI_CFG_KEY))||{};}catch(e){}
  if(local.key&&local.base)return local;
  if(BUILTIN_AI.base)return {base:BUILTIN_AI.base,key:BUILTIN_AI.key,model:BUILTIN_AI.model};
  return {};
}
function aiChannelName(){
  const c=getAiCfg();
  return c.key&&c.base?(c.model||'自定义模型'):'免费智能通道';
}
/* 调用对话模型：messages 为 OpenAI 格式；img 为 dataURL 时走视觉 */
async function aiChat(messages,img){
  const cfg=getAiCfg();
  if(img){
    /* 把图片作为消息内容插入最后一条 user 消息 */
    const last=messages[messages.length-1];
    last.content=[{type:'text',text:last.content},{type:'image_url',image_url:{url:img}}];
  }
  let url,body,headers={'Content-Type':'application/json'};
  if(cfg.base){
    /* 容错：填了完整 /chat/completions 地址就直接用；否则自动拼 */
    url=/chat\/completions$/.test(cfg.base)?cfg.base:cfg.base.replace(/\/+$/,'')+'/chat/completions';
    /* key 可选：站长代理通道（Worker）由服务端注入 Key，前端不带 */
    if(cfg.key)headers.Authorization='Bearer '+cfg.key;
    if(cfg.base.indexOf('openrouter')>-1){headers['HTTP-Referer']=location.origin;headers['X-Title']='xiange';}
    /* max_tokens 320：实测识别/描述 1 秒级返回；不设限会让思考型模型拖到几十秒 */
    body=JSON.stringify({model:cfg.model||'gpt-4o-mini',messages,temperature:.4,max_tokens:320});
  }else{
    url='https://text.pollinations.ai/openai';
    body=JSON.stringify({model:'openai-fast',messages,private:true});
  }
  let r;
  const ac=(typeof AbortController!=='undefined')?new AbortController():null;
  const timer=ac?setTimeout(()=>ac.abort(),45000):null;
  try{
    r=await fetch(url,{method:'POST',headers,body,signal:ac?ac.signal:undefined});
  }catch(e){
    if(e&&e.name==='AbortError')throw new Error('AI 响应超时（45秒），请点 ↻ 重试');
    /* 浏览器 fetch 失败通常是该服务商不允许网页直连（CORS 预检拦截） */
    throw new Error('网络直连被拦截——该服务商不支持网页调用，请检查网络后重试');
  }finally{
    if(timer)clearTimeout(timer);
  }
  if(!r.ok){
    let msg='AI 接口返回 '+r.status;
    try{const ej=await r.json();msg=ej.error&&ej.error.message?ej.error.message.slice(0,80):msg;}catch(e){}
    throw new Error(msg);
  }
  const j=await r.json();
  const msg0=j.choices&&j.choices[0]&&j.choices[0].message;
  let txt=(msg0&&msg0.content)||'';
  /* 兼容推理模型：content 为空时从 reasoning 里抽 */
  if(!txt&&msg0&&msg0.reasoning)txt=msg0.reasoning;
  if(!txt)throw new Error('AI 未返回内容');
  return txt;
}
function parseAiJson(txt){
  const m=txt.match(/\{[\s\S]*\}/);
  if(!m)throw new Error('无法解析 AI 结果');
  return JSON.parse(m[0].replace(/[\u201c\u201d]/g,'"').replace(/[\u2018\u2019]/g,"'"));
}
/* 从 AI 返回的分类文本匹配到平台 CATS 标签（major+一个细分） */
function aiMatchTags(catText){
  const tags=new Set();
  if(!catText)return tags;
  const ct=String(catText);
  let sec=CATS.find(c=>ct.includes(c.major));
  if(!sec)sec=CATS.find(c=>c.subs.some(s=>ct.includes(s)));
  if(!sec){
    /* 模糊：按关键词映射 */
    const KW={'书':'教材书籍','教材':'教材书籍','笔记':'教材书籍','手机':'电子数码','电脑':'电子数码','耳机':'电子数码','键盘':'电子数码','充电':'电子数码','平板':'电子数码','相机':'电子数码','杯':'生活用品','伞':'生活用品','收纳':'生活用品','床':'生活用品','衣':'服饰鞋包','鞋':'服饰鞋包','包':'服饰鞋包','球':'文体用品','笔':'文体用品','琴':'文体用品','桌':'宿舍家具','椅':'宿舍家具','化妆':'美妆杂物','护肤':'美妆杂物','零食':'食品零食','吃':'食品零食','徽章':'二次元周边','立牌':'二次元周边','手办':'二次元周边'};
    for(const[k,v]of Object.entries(KW)){if(ct.includes(k)){sec=CATS.find(c=>c.major===v);break;}}
  }
  if(sec){
    tags.add(sec.major);
    const sub=sec.subs.find(s=>ct.includes(s));
    if(sub)tags.add(sub);
  }
  return tags;
}
let aiBusy=false;
/* 压缩图片用于 AI 识别：最长边 768px、JPEG 0.72，几 MB 原图缩到几十 KB，避免请求过大卡死 */
function shrinkImg(dataURL){
  return new Promise(res=>{
    try{
      const im=new Image();
      im.onload=()=>{
        try{
          const MAX=768;
          let w=im.width,h=im.height;
          if(w<=MAX&&h<=MAX&&dataURL.length<150000){res(dataURL);return;}
          const k=Math.min(1,MAX/Math.max(w,h));
          w=Math.round(w*k);h=Math.round(h*k);
          const cv=document.createElement('canvas');cv.width=w;cv.height=h;
          cv.getContext('2d').drawImage(im,0,0,w,h);
          res(cv.toDataURL('image/jpeg',0.72));
        }catch(e){res(dataURL);}
      };
      im.onerror=()=>res(dataURL);
      im.src=dataURL;
    }catch(e){res(dataURL);}
  });
}
async function aiRecognize(){
  if(!pubImgs.length){toast('先上传照片才能识别哦');return;}
  const cfg=getAiCfg();
  if(!cfg.key||!cfg.base){
    $('#aiState').textContent='看图识别通道未就绪，请稍后重试';
    toast('看图识别通道未配置，文字生成描述不受影响');
    return;
  }
  if(aiBusy)return;
  aiBusy=true;
  $('#aiState').textContent='AI 正在识别图片…';
  try{
    const imgForAi=await shrinkImg(pubImgs[0]);
    const catList=CATS.map(c=>c.major+'('+c.subs.join('/')+')').join('、');
    const txt=await aiChat([{role:'user',content:'你是校园二手交易平台的商品识别助手。识别图片中的闲置物品，只输出一个 JSON 对象（禁止 markdown 代码块），字段：{"name":"商品名，12字内","cat":"分类，必须从这些里选：'+catList+'","cond":"成色，只能选：全新/九成新/八成新/明显使用痕迹","price":建议出价数字（人民币，校园二手行情，只给一个数）,"reason":"一句话定价理由，15字内"}'}],imgForAi);
    const d=parseAiJson(txt);
    const tags=aiMatchTags(d.cat);
    if(tags.size)state.pubTags=tags;else state.pubTags=new Set(['其他闲置']);
    if(['全新','九成新','八成新','明显使用痕迹'].includes(d.cond))state.pubGrade=d.cond;
    if(d.desc)$('#pubDesc').value=String(d.desc).slice(0,180);
    if(d.name&&!$('#pubName')){/* 无名称输入框，名称进标签不合适；把品名并入描述首句 */
      const desc=$('#pubDesc').value;
      if(desc&&!desc.includes(d.name))$('#pubDesc').value=d.name+'｜'+desc;
    }
    aiPriceData=(isFinite(d.price)&&d.price>0)?{price:Math.round(d.price),reason:d.reason||''}:null;
    $('#aiState').textContent='✨ AI 已识别：'+(d.name||'完成');
    renderUpload();
    toast('AI 识别完成，标签/成色/描述/建议价已填好 ✨');
  }catch(e){
    $('#aiState').textContent='识别失败，点 ↻ 重试';
    toast('AI 识别失败：'+e.message);
  }finally{
    aiBusy=false;
  }
}
let aiPriceData=null;
function renderAiPrice(){
  const row=$('#aiPriceRow');
  if(!aiPriceData||state.pubKind==='buy'){row.style.display='none';return;}
  row.style.display='flex';
  $('#aiPriceMain').innerHTML=`闲鹅推荐价：<b>¥${aiPriceData.price}</b><span>${aiPriceData.reason}</span>`;
}
$('#aiPriceFill').addEventListener('click',()=>{
  if(!aiPriceData)return;
  $('#pubPrice').value=aiPriceData.price;
  toast('已填入闲鹅推荐价 ¥'+aiPriceData.price+'，可自由修改');
});
/* AI 设置弹窗 */
$('#aiCfgClose').addEventListener('click',()=>$('#aiCfgOverlay').classList.remove('show'));
$('#aiCfgSave').addEventListener('click',()=>{
  const base=$('#aiCfgBase').value.trim(),key=$('#aiCfgKey').value.trim(),model=$('#aiCfgModel').value.trim();
  if(!key&&base){toast('填了接口地址就要填密钥，或全部留空走免费通道');return;}
  localStorage.setItem(AI_CFG_KEY,JSON.stringify(key?{base,key,model}:{}));
  $('#aiCfgOverlay').classList.remove('show');
  toast(key?'AI 接口已保存（本机存储）':'已切换回免费智能通道');
});
$('#aiCfgClear').addEventListener('click',()=>{
  localStorage.removeItem(AI_CFG_KEY);
  $('#aiCfgBase').value='';$('#aiCfgKey').value='';$('#aiCfgModel').value='';
  $('#aiCfgOverlay').classList.remove('show');
  toast('已清除自定义接口，走免费通道');
});
$('#aiRefresh').addEventListener('click',aiRecognize);
$('#gradeRow').addEventListener('click',e=>{
  const g=e.target.closest('.grade');if(!g)return;
  state.pubGrade=g.dataset.g;renderUpload();
});
$('#pubSubmit').addEventListener('click',()=>{
  if(!state.me){toast('请稍等，正在准备账号…');if(GUEST_MODE)autoGuest();else showView('login');return;}
  const price=parseFloat($('#pubPrice').value);
  if(!pubImgs.length&&state.pubKind!=='buy'){toast('至少上传一张照片哦 📷（收闲置求购帖可不上图）');return;}
  if(isNaN(price)||price<=0){toast('请填写正确的价格');$('#pubPrice').focus();return;}
  if(state.pubTags.size===0){toast('请选择至少一个商品标签');return;}
  const desc=$('#pubDesc').value.trim();
  const tags=[...state.pubTags];
  let cat=tags.find(t=>CATS.some(c=>c.major===t));
  const sub=tags.find(t=>CATS.some(c=>c.subs.includes(t)));
  if(!cat&&sub)cat=CATS.find(c=>c.subs.includes(sub)).major;
  cat=cat||'其他闲置';
  const stock=Math.max(1,Math.min(99,parseInt($('#pubStock').value)||1));
  const isBuy=state.pubKind==='buy';
  const delivery=state.pubDelivery||'self';
  const fee=(delivery==='self')?0:(parseFloat($('#feeInput').value)||0);
  if(delivery!=='self'&&fee<=0){toast('开启送货上门请填写跑腿费（可填 0 表示免跑腿费）');$('#feeInput').focus();return;}
  const tradeLabel=DELIVERY_LABEL[delivery]||'线下面交';
  const tradeNoteVal=$('#tradeNote').value.trim();
  if(isBuy&&!price){toast('请填写收购心理价');$('#pubPrice').focus();return;}
  const isEdit=!!state.pubEditId;
  /* 编辑模式：更新原商品，保留 id/owner/ts/统计 */
  if(isEdit){
    const old=state.products.find(x=>x.id===state.pubEditId);
    if(!old){toast('原商品已不存在');state.pubEditId=null;return;}
    const updated=Object.assign({},old,{
      name:desc?desc.slice(0,18):cat+(isBuy?' 求购':' 好物转让'),
      price,cond:isBuy?'不限':state.pubGrade,cat,sub:sub||null,cut:isBuy?'接受小刀':state.pubCut,tags,
      desc:desc||'卖家很懒，没有写描述～',
      kind:isBuy?'buy':'sell',
      delivery,fee,trade:tradeLabel,
      tradeNote:tradeNoteVal,
      stock,
      img:pubImgs[0]||null,
      imgs:pubImgs.slice(),

      emoji:pubImgs[0]?null:(isBuy?'🎯':'📦'),
    });
    if(JSON.stringify(updated).length>PAYLOAD_MAX){toast('内容太大无法上传，请删掉几张图片');return;}
    if(pub(NS+'products/'+old.id,updated,true)){
      const i=state.products.findIndex(x=>x.id===old.id);
      if(i>=0)state.products[i]=updated;
      toast('修改已保存 ✅');
      state.pubEditId=null;
      navStack=navStack.filter(x=>x!=='publish');
      showView('detail',false);
    }
    return;
  }
  const p={
    id:'p'+Date.now()+Math.random().toString(36).slice(2,6),
    name:desc?desc.slice(0,18):cat+(isBuy?' 求购':' 好物转让'),
    price,cond:isBuy?'不限':state.pubGrade,cat,sub:sub||null,cut:isBuy?'接受小刀':state.pubCut,tags,
    owner:state.me.name,
    desc:desc||'卖家很懒，没有写描述～',
    kind:isBuy?'buy':'sell',
    delivery,fee,trade:tradeLabel,
    tradeNote:tradeNoteVal,
    stock:isBuy?1:stock,
    img:pubImgs[0]||null,
    imgs:pubImgs.slice(),
    emoji:pubImgs[0]?null:(isBuy?'🎯':'📦'),
    ts:Date.now(),sold:false,stats:{views:0,favs:0},
  };
  if(JSON.stringify(p).length>PAYLOAD_MAX){toast('内容太大无法上传，请删掉几张图片');return;}
  if(pub(NS+'products/'+p.id,p,true)){
    state.products.unshift(p);
    toast(isBuy?'求购帖发布成功！有货的同学会联系你 🎯':'发布成功！已上架到共享市集 🎉');
    resetPublish();
    state.filter={kw:'',mine:false,tags:[],sort:'rec',face:false,barg:false,delivery:false,price:null,conds:[],kind:null};
    navStack=navStack.filter(x=>x!=='publish');
    showView('home',false);
  }
});

/* ---------- 订单状态 ---------- */
/* 面交：确认面交地点 → 现场验货 → 交易完成；送货：下单 → 配送 → 收货验货 → 完成 */
const STEP_TITLES_SELF=['已下单','确认面交地点','买卖双方现场验货','交易完成'];
const STEP_TITLES_DELIVERY=['已下单','卖家备货配送','买家收货验货','交易完成'];
const orderSteps=o=>((o.mode||'self')==='delivery')?STEP_TITLES_DELIVERY:STEP_TITLES_SELF;
function stName(o){
  const names=(o.mode||'self')==='delivery'
    ?['待卖家配送','配送中','待买家收货','已完成']
    :['待确认地点','待现场验货','验货中','已完成'];
  return names[o.status];
}
function curOrder(){return state.orders.find(o=>o.id===state.currentOrder);}
function setOrderStatus(o,status){
  o.status=status;
  if(pub(NS+'orders/'+o.id,o,true)){toast('订单状态已更新');renderOrder();renderProfile();}
}
function renderOrder(){
  const o=curOrder(),box=$('#orderScroll'),foot=$('#orderFoot');
  if(!o){
    box.innerHTML=`<div class="card order-head-card"><div class="oico">🧾</div>
      <div style="flex:1;"><div style="font-size:15px;font-weight:700;">暂无订单</div>
      <div style="font-size:11px;color:var(--text2);margin-top:3px;">去首页挑一件闲置，体验担保交易吧</div></div></div>
      <div class="order-tip">担保交易流程：自提面交 = 确认面交地点 → 现场验货 → 交易完成；送货上门 = 下单支付（含跑腿费）→ 卖家配送 → 买家验收。货款全程由平台担保。</div>`;
    foot.innerHTML=`<div class="btn btn-orange" id="goHome2">去逛逛</div>`;
    $('#goHome2').addEventListener('click',()=>showView('home'));
    return;
  }
  const p=state.products.find(x=>x.id===o.productId)||{name:'商品已下架',price:0,emoji:'📦',cond:''};
  const isBuyer=o.buyer===state.me?.name;
  const isDelivery=(o.mode||'self')==='delivery';
  const peer=isBuyer?o.seller:o.buyer;
  const total=p.price+(o.fee||0);
  const head=`<div class="card order-head-card">
    <div class="oico">${o.status===3?'🎉':isDelivery?'🛵':'🤝'}</div>
    <div style="flex:1;">
      <div style="font-size:15px;font-weight:800;color:${o.status===3?'#7FA87E':'#C96F2E'};">${o.status===3?'交易已完成':orderSteps(o)[o.status]}</div>
      <div style="font-size:11px;color:var(--text2);margin-top:3px;">${isBuyer?'我是买家 · 卖家 '+peer:'我是卖家 · 买家 '+peer}${isDelivery?(o.address?' · 送至 '+o.address:' · 送货上门'):' · '+(o.tradeNote||o.station)}</div>
    </div>
    <span class="chip ${o.status===3?'':'orange'}">${o.status===3?'已结算':'担保交易中'}</span>
  </div>
  <div class="card good-card" style="margin:0 16px;cursor:pointer;" data-pid="${p.id||''}">
    <div class="gimg">${p.img?`<img class="viewerable" src="${p.img}">`:p.emoji||'📦'}</div>
    <div style="flex:1;"><div style="font-size:13px;font-weight:600;">${p.name}</div>
    <div style="font-size:12px;color:var(--text2);margin-top:4px;">${fmt(p.price)} · ${p.cond}${o.fee?` · 含跑腿费 ${fmt(o.fee)}`:''}</div></div>
    <span style="font-size:11px;color:var(--text3);">›</span>
  </div>`;
  /* 交易方式 / 地点（可协商调整）/ 双方备注 */
  const noteHint=isDelivery?'补充收货说明，如：放门口即可':'面交补充，如：周三下午在图书馆门口';
  const tradeCard=`<div class="card trade-card" style="margin:0 16px;">
    <div class="tc-row"><span class="tc-k">交易方式</span><span class="tc-v">${isDelivery?'送货上门':'自提面交'}</span></div>
    ${isDelivery
      ?`<div class="tc-row"><span class="tc-k">配送地址</span><span class="tc-v" id="addrView">${o.address||'未填写'}</span></div>
        <div class="tc-row"><span class="tc-k">跑腿费</span><span class="tc-v">${fmt(o.fee||0)}</span></div>`
      :`<div class="tc-row"><span class="tc-k">面交地点</span><span class="tc-v" id="placeView">${o.tradeNote||p.tradeNote||o.station}</span></div>`}
    <div class="tc-row"><span class="tc-k">合计金额</span><span class="tc-v"><b>${fmt(total)}</b>（商品 ${fmt(p.price)}${o.fee?' + 跑腿费 '+fmt(o.fee):''}）</span></div>
    <div class="tc-row"><span class="tc-k">买家备注</span><span class="tc-v" id="buyerNoteView">${o.buyerNote||'未填写'}</span></div>
    ${isBuyer?`<div class="note-edit"><input id="buyerNoteInput" maxlength="60" placeholder="${isDelivery?'修改配送地址或补充说明':'补充面交约定'}" value="${isDelivery?(o.address||''):(o.buyerNote||'')}"><div class="note-save" id="buyerNoteSave">保存</div></div>`:''}
    <div class="tc-row" style="border:none;font-size:10px;color:var(--text3);">💡 地点/地址可在聊天窗口协商，改完后在上方保存，双方同步可见</div>
  </div>`;
  const subDesc=isDelivery
    ?['买家完成支付（含跑腿费），货款暂由平台担保','卖家备好货，送货至买家填写地址','买家收货并检查商品，确认无误','确认后，货款已转给卖家']
    :['买家完成支付，货款暂由平台担保','双方在聊天页确认面交地点与时间','当面检查商品，满意后确认完成','确认后，货款已转给卖家'];
  const steps=orderSteps(o).map((t,i)=>{
    const cls=i<o.status?'done':i===o.status?'now':'todo';
    const node=i<o.status?'✓':i===o.status?'●':(i+1);
    return `<div class="step ${cls}"><div class="snode">${node}</div><div class="sinfo"><b>${t}</b><span>${subDesc[i]}</span></div></div>`;
  }).join('');
  box.innerHTML=head+tradeCard+`<div class="card steps">${steps}</div>`
    +`<div class="order-tip">💡 小提示：${isDelivery?'买家请保持手机畅通，收货时当面检查商品再确认；有问题可发起客服仲裁。':'地点可随时在聊天中协商调整；现场验货满意后再确认完成，有问题可当场发起退款。'}</div>`;
  const bs=$('#buyerNoteSave');
  if(bs)bs.addEventListener('click',()=>{
    const v=$('#buyerNoteInput').value.trim();
    if(isDelivery){
      o.address=v;
      const view=$('#addrView');if(view)view.textContent=v||'未填写';
      toast('配送地址已更新，卖家可以看到 ✅');
    }else{
      o.buyerNote=v;
      const view=$('#buyerNoteView');if(view)view.textContent=v||'未填写';
      toast('备注已保存，卖家可以看到 ✅');
    }
    pub(NS+'orders/'+o.id,o,true);
  });
  const chatBtn=`<div class="btn btn-ghost" id="oChat">联系${isBuyer?'卖家':'买家'}</div>`;
  let mainBtn='';
  if(isBuyer){
    mainBtn=o.status===0?(isDelivery?`<div class="btn btn-orange" id="oNext">提醒卖家发货</div>`:`<div class="btn btn-orange" id="oNext">提醒卖家确认地点</div>`)
      :o.status===1?(isDelivery?`<div class="btn btn-orange" id="oNext">等待收货</div>`:`<div class="btn btn-orange" id="oNext">前往面交</div>`)
      :o.status===2?`<div class="btn btn-orange" id="oNext">确认${isDelivery?'收货':'交易完成'}</div>`
      :`<div class="btn btn-orange" id="oNext">评价本次交易</div>`;
  }else{
    mainBtn=o.status===0?(isDelivery?`<div class="btn btn-orange" id="oNext">开始备货配送</div>`:`<div class="btn btn-orange" id="oNext">确认面交地点</div>`)
      :o.status===1?(isDelivery?`<div class="btn btn-ghost" id="oNext">配送中，等待买家收货</div>`:`<div class="btn btn-ghost" id="oNext">等待买家赴约</div>`)
      :o.status===2?`<div class="btn btn-ghost" id="oNext">等待买家确认</div>`
      :`<div class="btn btn-ghost" id="oNext">交易已完成</div>`;
  }
  foot.innerHTML=chatBtn+mainBtn;
  $('#oChat').addEventListener('click',()=>openChatWith(peer,o.productId));
  $('#oNext').addEventListener('click',()=>{
    if(!isBuyer){
      if(o.status===0)setOrderStatus(o,1);
      else if(o.status===1)toast(isDelivery?'已开始配送，等待买家收货':'等待买家赴约，记得提前确认地点');
      else if(o.status===2)toast('等待买家验货确认');
      else toast('感谢你的支持 ✨');
      return;
    }
    if(o.status===0)toast(isDelivery?'已提醒卖家发货 📮':'已提醒卖家确认面交地点 📮');
    else if(o.status===1){
      if(isDelivery)toast('卖家配送中，收货时当面验货再确认');
      else showView('station');
    }
    else if(o.status===2)setOrderStatus(o,3);
    else toast('感谢你的评价，大学生活因你更美好 ✨');
  });
  const gc=box.querySelector('[data-pid]');
  if(gc&&p.id)gc.addEventListener('click',e=>{
    if(e.target.closest('img.viewerable'))return; /* 点图片放大，点其余区域进详情 */
    openDetail(p.id);
  });
}

/* ---------- 校内站点 ---------- */
state.station='东门驿站';
function renderStation(){
  const o=state.orders.find(x=>x.id===state.currentOrder&&x.status<3);
  $$('#stationList .station').forEach(s=>s.classList.toggle('on',s.dataset.name===state.station));
  const isSeller=o&&o.seller===state.me?.name;
  $('#stationTip').innerHTML=o
    ?`📦 订单 #${o.id.slice(-4)} 将送至 <b>${state.station}</b>，取件码 <b>8827</b>，${isSeller?'等待买家到场验货。':'验货完成后点击确认即可。'}`
    :`📦 暂无进行中订单，当前偏好站点：<b>${state.station}</b>。`;
  const btn=$('#stationBtn');
  if(isSeller){btn.textContent='等待买家到站';btn.onclick=()=>toast('买家到场验货后交易才会完成');}
  else if(o&&o.status===1){btn.textContent='确认到站';btn.onclick=()=>{setOrderStatus(o,2);showView('order');};}
  else if(o&&o.status===2){btn.textContent='验货完成，确认收货';btn.onclick=()=>{setOrderStatus(o,3);showView('order');};}
  else{btn.textContent='保存站点偏好';btn.onclick=()=>{toast('已保存站点偏好：'+state.station);showView('home');};}
}
$('#stationList').addEventListener('click',e=>{
  const s=e.target.closest('.station');if(!s)return;
  state.station=s.dataset.name;renderStation();
});

/* ---------- 图片大图查看器 ---------- */
let vScale=1,vTx=0,vTy=0,vPinch=null,vLastTap=0;
function viewerApply(){
  const im=$('#viewerImg');
  im.style.transform=`translate(${vTx}px,${vTy}px) scale(${vScale})`;
}
function openViewer(src){
  vScale=1;vTx=0;vTy=0;
  const im=$('#viewerImg');
  im.style.transform='none';
  im.src=src;
  $('#viewerOverlay').classList.add('show');
}
function closeViewer(){$('#viewerOverlay').classList.remove('show');}
$('#viewerClose').addEventListener('click',closeViewer);
$('#viewerOverlay').addEventListener('click',e=>{if(e.target.id==='viewerOverlay'||e.target.classList.contains('viewer-stage'))closeViewer();});
(function(){
  const stage=$('.viewer-stage');
  stage.addEventListener('touchstart',e=>{
    if(e.touches.length===2){
      const [a,b]=e.touches;
      vPinch={d:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY),s:vScale};
    }else if(e.touches.length===1){
      const t=e.touches[0];
      vPinch={x:t.clientX,y:t.clientY,tx:vTx,ty:vTy,move:false};
    }
  },{passive:true});
  stage.addEventListener('touchmove',e=>{
    e.preventDefault();
    if(!vPinch)return;
    if(e.touches.length===2&&vPinch.s!=null){
      const [a,b]=e.touches;
      const d=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
      vScale=Math.max(1,Math.min(5,vPinch.s*d/vPinch.d));
      viewerApply();
    }else if(e.touches.length===1&&vPinch.x!=null){
      const t=e.touches[0];
      vTx=vPinch.tx+(t.clientX-vPinch.x);
      vTy=vPinch.ty+(t.clientY-vPinch.y);
      if(Math.abs(t.clientX-vPinch.x)>6||Math.abs(t.clientY-vPinch.y)>6)vPinch.move=true;
      viewerApply();
    }
  },{passive:false});
  stage.addEventListener('touchend',e=>{
    if(vPinch&&vPinch.x!=null&&!vPinch.move&&e.touches.length===0){
      /* 单击图片：双击检测，非双击不做动作 */
      const now=Date.now();
      if(now-vLastTap<300){vScale=vScale>1?1:2.2;vTx=0;vTy=0;viewerApply();vLastTap=0;}
      else vLastTap=now;
    }
    if(e.touches.length===0)vPinch=null;
  });
  /* 桌面：滚轮缩放 + 双击 */
  stage.addEventListener('wheel',e=>{
    e.preventDefault();
    vScale=Math.max(1,Math.min(5,vScale*(e.deltaY<0?1.15:0.87)));
    if(vScale===1){vTx=0;vTy=0;}
    viewerApply();
  },{passive:false});
  stage.addEventListener('dblclick',()=>{vScale=vScale>1?1:2.2;vTx=0;vTy=0;viewerApply();});
})();
/* 需要放大的图片统一加 class="viewerable" */
document.addEventListener('click',e=>{
  const im=e.target.closest('img.viewerable');
  if(im&&im.src)openViewer(im.src);
});

/* ---------- 底部导航 ---------- */
$('#tabbar').addEventListener('click',e=>{
  const t=e.target.closest('[data-tab]');if(!t)return;
  const v=t.dataset.tab;
  $$('.tab').forEach(x=>x.classList.toggle('active',x===t));
  if(v==='publish')resetPublish();
  showView(v);
});

/* ---------- 启动 ---------- */
mqConnect();
showView('splash');

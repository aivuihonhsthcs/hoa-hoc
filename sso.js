/* Đăng nhập chung với app "Ai vui hơn học sinh THCS".
   Cách dùng: nhúng SAU thư viện supabase-js, TRƯỚC code của web môn học. */
(function(){
  var CFG={
    SUPABASE_URL:"https://ipurdwafbuqilgwwlkic.supabase.co",
    SUPABASE_ANON_KEY:"sb_publishable_-UPds1t0kDY5VKlWOZHncQ_kJg-X0CJ",
    APP_URL:"https://aivuihonhocsinhthcs.vercel.app"
  };
  var h=new URLSearchParams(location.hash.slice(1)),at=h.get("at");
  if(location.hash.indexOf("at=")>=0)history.replaceState(null,"",location.pathname+location.search); // xóa token khỏi thanh địa chỉ
  try{if(at)sessionStorage.setItem("avh_at",at);else at=sessionStorage.getItem("avh_at")}catch(e){}
  function jwt(t){try{return JSON.parse(atob(t.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")))}catch(e){return null}}
  var p=at&&jwt(at),ok=!!(p&&p.exp*1000>Date.now());
  var A=window.AVH={loggedIn:ok,sb:null,user:null,appUrl:CFG.APP_URL,
    /* Lưu điểm: AVH.saveScore("hoa-hoc","bai-1",8,10) */
    saveScore:function(subject,item,score,max){
      if(!A.sb)return Promise.resolve({error:{message:"Chưa đăng nhập"}});
      return A.sb.from("subject_scores").upsert({user_id:A.user.id,subject:subject,item:item,score:score,max:max,updated_at:new Date().toISOString()},{onConflict:"user_id,subject,item"});
    }};
  if(ok){
    A.sb=supabase.createClient(CFG.SUPABASE_URL,CFG.SUPABASE_ANON_KEY,{global:{headers:{Authorization:"Bearer "+at}},auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
    A.sb.realtime.setAuth(at);A.user={id:p.sub};
    A.ready=A.sb.from("profiles").select("name,role,avatar_url").eq("id",p.sub).maybeSingle().then(function(r){A.user=Object.assign({id:p.sub},r.data||{});return A});
  }else A.ready=Promise.resolve(A);
  A.ready.then(function(){
    function q(s,f){[].forEach.call(document.querySelectorAll(s),f)}
    q("[data-avh-notice]",function(e){e.hidden=A.loggedIn});            /* khung "Bạn chưa đăng nhập…" */
    q("[data-avh-user]",function(e){e.textContent=(A.user&&A.user.name)||""});
    q("a[data-avh-app]",function(a){a.href=CFG.APP_URL});               /* link "Mở Việc nhà" */
    document.dispatchEvent(new CustomEvent("avh-ready"));
  });
})();

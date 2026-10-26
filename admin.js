let db=null, currentProducts=[];
const $=id=>document.getElementById(id);
function ready(){return window.SUPABASE_URL&&!window.SUPABASE_URL.includes("PASTE_")&&window.SUPABASE_PUBLISHABLE_KEY&&!window.SUPABASE_PUBLISHABLE_KEY.includes("PASTE_")&&window.supabase;}
function msg(text,bad=false){$("adminMessage").textContent=text;$("adminMessage").classList.toggle("danger",bad)}
function formMsg(text){$("productFormMessage").textContent=text}
function safe(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
async function init(){
 if(!ready()){$("loginMessage").textContent="Setup needed: add your Supabase URL and Publishable key in supabase-config.js, then upload the files to GitHub.";return;}
 db=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_PUBLISHABLE_KEY);
 db.auth.onAuthStateChange((_event,session)=>{setTimeout(()=>session?showDashboard(session.user):showLogin(),0)});
 const {data:{session}}=await db.auth.getSession();if(session)await showDashboard(session.user);
}
function showLogin(){$("loginView").classList.remove("hidden");$("dashboardView").classList.add("hidden")}
async function showDashboard(user){
 if(!user)return;
 if(String(user.email||"").toLowerCase()!==String(window.TRASKOON_ADMIN_EMAIL||"").toLowerCase()){await db.auth.signOut();$("loginMessage").textContent="This email is not authorized for the admin panel.";showLogin();return;}
 $("loginView").classList.add("hidden");$("dashboardView").classList.remove("hidden");$("signedInAs").textContent="Signed in as "+user.email;await fetchProducts();
}
$("loginForm").addEventListener("submit",async e=>{e.preventDefault();$("loginMessage").textContent="Signing in…";const email=$("loginEmail").value.trim(),password=$("loginPassword").value;if(email.toLowerCase()!==String(window.TRASKOON_ADMIN_EMAIL).toLowerCase()){$("loginMessage").textContent="Use the authorized admin email.";return;}const {error}=await db.auth.signInWithPassword({email,password});$("loginMessage").textContent=error?error.message:"";});
$("logoutBtn").addEventListener("click",async()=>{await db.auth.signOut();showLogin()});
async function fetchProducts(){msg("Loading products…");const {data,error}=await db.from("products").select("*").order("name");if(error){msg("Could not load products: "+error.message+" — check that supabase-schema.sql was run.",true);$("adminProducts").innerHTML="";return;}currentProducts=data||[];renderAdminProducts();msg("Connected. "+currentProducts.length+" product(s) in the database.");}
function renderAdminProducts(){$("adminProducts").innerHTML=currentProducts.map(p=>`<div class="admin-product">${p.image_url?`<img src="${safe(p.image_url)}" alt="">`:`<div class="map-icon" style="width:54px;height:54px;font-size:22px">🍽️</div>`}<div><strong>${safe(p.name)}</strong><small>Rs. ${Number(p.price_pkr).toLocaleString("en-PK")} · ${safe(p.category)} · ${p.is_available?"Available":"Unavailable"}</small></div><button class="secondary-btn" data-edit="${safe(p.id)}">Edit</button></div>`).join("")||"<p class='admin-muted'>No products yet. Add your first product using the form.</p>";}
$("adminProducts").addEventListener("click",e=>{const b=e.target.closest("[data-edit]");if(!b)return;const p=currentProducts.find(x=>String(x.id)===b.dataset.edit);if(!p)return;$("productId").value=p.id;$("productName").value=p.name;$("productPrice").value=p.price_pkr;$("productCategory").value=p.category||"Sides";$("productDescription").value=p.description||"";$("productAvailable").value=String(p.is_available!==false);$("editorTitle").textContent="Edit product";formMsg("Existing picture is kept unless you choose a new one.");window.scrollTo({top:0,behavior:"smooth"});});
$("resetFormBtn").addEventListener("click",resetForm);
function resetForm(){$("productForm").reset();$("productId").value="";$("editorTitle").textContent="Add a product";formMsg("");}
async function uploadPicture(file){
 if(!file)return null;if(file.size>5*1024*1024)throw new Error("Picture must be 5 MB or smaller.");
 const ext=(file.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"");const path=`${crypto.randomUUID()}.${ext||"jpg"}`;
 const {error}=await db.storage.from("food-images").upload(path,file,{upsert:false,contentType:file.type});if(error)throw error;
 const {data}=db.storage.from("food-images").getPublicUrl(path);return data.publicUrl;
}
$("productForm").addEventListener("submit",async e=>{
 e.preventDefault();formMsg("");const saveBtn=$("productForm").querySelector('button[type="submit"]');saveBtn.disabled=true;saveBtn.textContent="Saving…";
 try{
  const id=$("productId").value, file=$("productImage").files[0];let imageUrl=null;
  if(file)imageUrl=await uploadPicture(file);
  const record={name:$("productName").value.trim(),price_pkr:Number($("productPrice").value),category:$("productCategory").value,description:$("productDescription").value.trim(),is_available:$("productAvailable").value==="true"};
  if(imageUrl)record.image_url=imageUrl;
  if(id){const {error}=await db.from("products").update(record).eq("id",id);if(error)throw error;}
  else {if(!imageUrl)record.image_url="";const {error}=await db.from("products").insert(record);if(error)throw error;}
  resetForm();await fetchProducts();formMsg("Saved successfully.");
 }catch(err){formMsg("Save failed: "+(err.message||"Please check database policies and storage setup."));}
 finally{saveBtn.disabled=false;saveBtn.textContent="Save product";}
});
init();

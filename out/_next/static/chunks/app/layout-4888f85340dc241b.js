(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[185],{4430:function(e,t,n){Promise.resolve().then(n.bind(n,3491)),Promise.resolve().then(n.t.bind(n,3445,23)),Promise.resolve().then(n.t.bind(n,2445,23))},3491:function(e,t,n){"use strict";n.r(t),n.d(t,{ThemeProvider:function(){return p}});var r=n(7437),a=n(2265),s=(e,t,n,r,a,s,o,l)=>{let i=document.documentElement,c=["light","dark"];function m(t){(Array.isArray(e)?e:[e]).forEach(e=>{let n="class"===e,r=n&&s?a.map(e=>s[e]||e):a;n?(i.classList.remove(...r),i.classList.add(t)):i.setAttribute(e,t)}),l&&c.includes(t)&&(i.style.colorScheme=t)}if(r)m(r);else try{let e=localStorage.getItem(t)||n,r=o&&"system"===e?window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light":e;m(r)}catch(e){}},o=["light","dark"],l="(prefers-color-scheme: dark)",i="undefined"==typeof window,c=a.createContext(void 0),m=e=>a.useContext(c)?a.createElement(a.Fragment,null,e.children):a.createElement(u,{...e}),d=["light","dark"],u=e=>{let{forcedTheme:t,disableTransitionOnChange:n=!1,enableSystem:r=!0,enableColorScheme:s=!0,storageKey:i="theme",themes:m=d,defaultTheme:u=r?"system":"light",attribute:p="data-theme",value:g,children:v,nonce:w,scriptProps:S}=e,[E,_]=a.useState(()=>f(i,u)),[k,T]=a.useState(()=>f(i)),C=g?Object.values(g):m,L=a.useCallback(e=>{let t=e;if(!t)return;"system"===e&&r&&(t=b());let a=g?g[t]:t,l=n?y(w):null,i=document.documentElement,c=e=>{"class"===e?(i.classList.remove(...C),a&&i.classList.add(a)):e.startsWith("data-")&&(a?i.setAttribute(e,a):i.removeAttribute(e))};if(Array.isArray(p)?p.forEach(c):c(p),s){let e=o.includes(u)?u:null,n=o.includes(t)?t:e;i.style.colorScheme=n}null==l||l()},[w]),A=a.useCallback(e=>{let t="function"==typeof e?e(E):e;_(t);try{localStorage.setItem(i,t)}catch(e){}},[E]),P=a.useCallback(e=>{T(b(e)),"system"===E&&r&&!t&&L("system")},[E,t]);a.useEffect(()=>{let e=window.matchMedia(l);return e.addListener(P),P(e),()=>e.removeListener(P)},[P]),a.useEffect(()=>{let e=e=>{e.key===i&&A(e.newValue||u)};return window.addEventListener("storage",e),()=>window.removeEventListener("storage",e)},[A]),a.useEffect(()=>{L(null!=t?t:E)},[t,E]);let N=a.useMemo(()=>({theme:E,setTheme:A,forcedTheme:t,resolvedTheme:"system"===E?k:E,themes:r?[...m,"system"]:m,systemTheme:r?k:void 0}),[E,A,t,k,r,m]);return a.createElement(c.Provider,{value:N},a.createElement(h,{forcedTheme:t,storageKey:i,attribute:p,enableSystem:r,enableColorScheme:s,defaultTheme:u,value:g,themes:m,nonce:w,scriptProps:S}),v)},h=a.memo(e=>{let{forcedTheme:t,storageKey:n,attribute:r,enableSystem:o,enableColorScheme:l,defaultTheme:i,value:c,themes:m,nonce:d,scriptProps:u}=e,h=JSON.stringify([r,n,i,t,m,c,o,l]).slice(1,-1);return a.createElement("script",{...u,suppressHydrationWarning:!0,nonce:"undefined"==typeof window?d:"",dangerouslySetInnerHTML:{__html:"(".concat(s.toString(),")(").concat(h,")")}})}),f=(e,t)=>{let n;if(!i){try{n=localStorage.getItem(e)||void 0}catch(e){}return n||t}},y=e=>{let t=document.createElement("style");return e&&t.setAttribute("nonce",e),t.appendChild(document.createTextNode("*,*::before,*::after{-webkit-transition:none!important;-moz-transition:none!important;-o-transition:none!important;-ms-transition:none!important;transition:none!important}")),document.head.appendChild(t),()=>{window.getComputedStyle(document.body),setTimeout(()=>{document.head.removeChild(t)},1)}},b=e=>(e||(e=window.matchMedia(l)),e.matches?"dark":"light");function p(e){let{children:t,...n}=e;return(0,r.jsx)(m,{attribute:"class",defaultTheme:"system",enableSystem:!0,disableTransitionOnChange:!0,...n,children:t})}},2445:function(){},3445:function(e){e.exports={style:{fontFamily:"'__Inter_eafbf4', '__Inter_Fallback_eafbf4'",fontStyle:"normal"},className:"__className_eafbf4"}}},function(e){e.O(0,[971,69,744],function(){return e(e.s=4430)}),_N_E=e.O()}]);
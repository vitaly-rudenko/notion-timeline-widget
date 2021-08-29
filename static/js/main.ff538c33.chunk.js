(this["webpackJsonpnotion-timeline-widget"]=this["webpackJsonpnotion-timeline-widget"]||[]).push([[0],{21:function(e,t,n){},23:function(e,t,n){"use strict";n.r(t);var o=n(0),a=n.n(o),r=n(7),i=n.n(r),c=n(5),s=n(8),p=n(2),l=n(9),d=n.n(l),u=n(10),m=n.n(u),h=n(11),f=n.n(h),b=(n(21),n(1)),v=864e5,g=86399999,w={default:"#505558",gray:"#6b6f71",brown:"#695c55",orange:"#917448",yellow:"#9f904d",green:"#487871",blue:"#497088",purple:"#6d5a90",pink:"#924d75",red:"#a05d59"};function j(e){return(e.properties.Scope.multi_select||e.properties.Scope.select)&&e.properties.Event.title&&e.properties.Event.title[0]&&e.properties.Event.title[0].text&&e.properties.Date.date&&(!e.properties.Ongoing||e.properties.Ongoing.checkbox)&&(!e.properties.Group||e.properties.Group.select)}function O(){var e=Object(o.useState)([]),t=Object(p.a)(e,2),n=t[0],a=t[1],r=Object(o.useState)(!1),i=Object(p.a)(r,2),l=i[0],u=i[1],h=new URLSearchParams(window.location.search),O=h.get("database_id")||"",y=h.get("token")||"",x=Object(o.useState)([800,300]),D=Object(p.a)(x,2),S=Object(p.a)(D[0],2),k=S[0],M=S[1],_=D[1];Object(o.useEffect)((function(){var e=function(){_([window.innerWidth,window.innerHeight])};return e(),window.addEventListener("resize",e),function(){return window.removeEventListener("resize",e)}}),[]),Object(o.useEffect)((function(){O&&y&&fetch("".concat("https://vr-cors-everywhere.herokuapp.com","/https://api.notion.com/v1/databases/").concat(O,"/query"),{method:"POST",headers:{Authorization:"Bearer ".concat(y),"Notion-Version":"2021-08-16"}}).then((function(e){return e.json()})).then((function(e){e.results&&e.results.some(j)?a(e.results):u(!0)}))}),[O,y]);var E=Object(o.useMemo)((function(){return n.map((function(e){if(!j(e))return console.log("Invalid database item:",JSON.stringify(e,null,2)),[];var t=e.properties.Event.title[0].text.content,n=e.properties.Scope.multi_select?e.properties.Scope.multi_select.map((function(e){return{name:e.name,color:e.color}})):[{name:e.properties.Scope.select.name,color:e.properties.Scope.select.color}];return n.map((function(o){var a,r,i,c,s,p;return{scope:o,scopes:n,name:t,startDate:e.properties.Date.date.start,endDate:e.properties.Date.date.end,ongoing:null!==(a=null===(r=e.properties.Ongoing)||void 0===r?void 0:r.checkbox)&&void 0!==a&&a,group:{name:null!==(i=null===(c=e.properties.Group)||void 0===c?void 0:c.select.name)&&void 0!==i?i:o.name,color:null!==(s=null===(p=e.properties.Group)||void 0===p?void 0:p.select.color)&&void 0!==s?s:o.color}}}))})).flat()}),[n]),I=Object(o.useMemo)((function(){var e,t=new Map,n=Object(s.a)(E);try{var o=function(){var n=e.value;if(t.has(n.group.name))return"continue";t.set(n.group.name,E.filter((function(e){return e.group.name===n.group.name})))};for(n.s();!(e=n.n()).done;)o()}catch(a){n.e(a)}finally{n.f()}return t}),[E]),z=Object(o.useMemo)((function(){return Object(c.a)(I.entries()).map((function(e){var t=Object(p.a)(e,2),n=t[0],o=t[1];return{events:o,name:n,data:o.map((function(e){return{event:e,fillColor:w[e.group.color],strokeColor:f()(w[e.group.color]).lightenByRatio(.5).toCSS(),x:e.scope.name,y:[Date.parse(e.startDate),e.ongoing?Date.now()+g:e.endDate?Date.parse(e.endDate)+g:Date.parse(e.startDate)+g]}}))}}))}),[I]),F=Object(o.useMemo)((function(){return[Math.min.apply(Math,Object(c.a)(z.map((function(e){return e.data[0].y[0]}))))||Date.now(),Math.max.apply(Math,Object(c.a)(z.map((function(e){return e.data[0].y[1]}))))||Date.now()]}),[z]),C=Object(p.a)(F,2),L=C[0],B=C[1],G=Math.max((B-L)/100,7*v);return O&&y?l?Object(b.jsx)("div",{children:"The database is not supported by this widget"}):Object(b.jsx)(b.Fragment,{children:Object(b.jsx)(d.a,{className:"chart",type:"rangeBar",width:k-20,height:M-20,options:{chart:{toolbar:{tools:{download:!1,selection:!0,zoom:!0,zoomin:!0,zoomout:!0,pan:!0,customIcons:[{icon:'<img src="'.concat("/notion-timeline-widget",'/reload.svg" width="16">'),class:"custom-icon",index:0,title:"Reload",click:function(){return window.location.reload()}},{icon:'<img src="'.concat("/notion-timeline-widget",'/copy.svg" width="16">'),class:"custom-icon",index:0,title:"Copy URL",click:function(){return m()(window.location.href)}}]}}},plotOptions:{bar:{horizontal:!0}},dataLabels:{enabled:!0,formatter:function(e,t){var n=t.seriesIndex,o=t.dataPointIndex,a=z[n].data[o].event,r=z[n].data[o].y||[],i=Object(p.a)(r,2),c=i[0],s=i[1],l=Math.ceil((s-c)/v),d=" ("+l+(l>1?" days":" day")+")";return a.name+(a.endDate?d:"")}},theme:{palette:"palette1",mode:"dark"},xaxis:{type:"datetime",min:L-G,max:B+G},legend:{show:!1},stroke:{width:2},tooltip:{custom:function(e){var t=e.seriesIndex,n=e.dataPointIndex,o=z[t].data[n].event,a=z[t].data[n].y||[],r=Object(p.a)(a,2),i=r[0],c=r[1],s=Math.ceil((c-i)/v),l=" ("+s+(s>1?" days":" day")+")";return'<div class="chart__tooltip">\n              <p class="chart__tooltip-primary-text">'.concat(o.name).concat(o.endDate?l:"",'</p>\n              <p class="chart__tooltip-secondary-text">').concat(o.startDate).concat(o.endDate?" - ".concat(o.endDate):"","</p>\n            </div>")}},grid:{show:!0,borderColor:"#FFFFFF22",xaxis:{lines:{show:!0}},yaxis:{lines:{show:!0}}}},series:z})}):Object(b.jsx)("div",{children:"Database ID and/or Notion token is not provided"})}i.a.render(Object(b.jsx)(a.a.StrictMode,{children:Object(b.jsx)(O,{})}),document.getElementById("root"))}},[[23,1,2]]]);
//# sourceMappingURL=main.ff538c33.chunk.js.map
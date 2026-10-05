const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-Diu6nHkN.js","assets/expression-Bl_GL2tO.js","assets/debug-hooks-B1wJ-XDk.js","assets/index-C_z6eycU.js","assets/index-lH2Imgkv.css","assets/webgl-device-BMMMqvrU.js","assets/index-CTF6SOQe.js"])))=>i.map(i=>d[i]);
import{_ as Di,g as Qo,d as zn,M as es,E as ts,a as is,R as Ke,A as ns,b as os,c as ss,e as at,p as rs,f as as}from"./index-C_z6eycU.js";import{R as lt,u as ls,l as E,B as D,s as cs,p as Vn,d as H,t as us,a as fs,g as ds,b as hs,W as Gn,v as ie,c as gs,e as ps,f as Ni,S as qt,T as hi,h as ct,i as jn,j as ms,k as ut,m as Xe,n as oe,o as ys,q as Je,r as bs,w as gi,x as $n,y as vs,z as q,A as _s,P as ae,C as de,D as ft,E as he,F as se,G as Et,H as ye,L as xs,I as Ps,J as Ui,K as ws,U as ve,V as Ls}from"./debug-hooks-B1wJ-XDk.js";import{R as Ie,S as Ss,g as Cs,i as As,a as Es,m as Wn,b as Zt,c as Is,d as Fi,e as Ts,f as Kt,n as Bs,T as Os,h as Rs,W as It}from"./webgl-device-BMMMqvrU.js";function Ms(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}function Ds(n){return Array.isArray(n)?n.length===0||typeof n[0]=="number":!1}function Hn(n){return Ms(n)||Ds(n)}class pi extends lt{width;height;updateTimestamp;get[Symbol.toStringTag](){return"ExternalTexture"}constructor(e,t){super(e,t,pi.defaultProps);const i=this.props.source?e.getExternalImageSize(this.props.source):null;this.width=this.props.width||i?.width||0,this.height=this.props.height||i?.height||0,this.updateTimestamp=e.incrementTimestamp()}static defaultProps={...lt.defaultProps,source:void 0,width:0,height:0,colorSpace:"srgb",sampler:{}}}class Me extends lt{get[Symbol.toStringTag](){return"ComputePipeline"}hash="";shaderLayout;constructor(e,t){super(e,t,Me.defaultProps),this.shaderLayout=t.shaderLayout}static defaultProps={...lt.defaultProps,shader:void 0,entryPoint:void 0,constants:{},shaderLayout:void 0}}class Pt{static defaultProps={...Ie.defaultProps};static getDefaultPipelineFactory(e){const t=e.getModuleData("@luma.gl/core");return t.defaultPipelineFactory||=new Pt(e),t.defaultPipelineFactory}device;_hashCounter=0;_hashes={};_renderPipelineCache={};_computePipelineCache={};_sharedRenderPipelineCache={};get[Symbol.toStringTag](){return"PipelineFactory"}toString(){return`PipelineFactory(${this.device.id})`}constructor(e){this.device=e}createRenderPipeline(e){if(!this.device.props._cachePipelines)return this.device.createRenderPipeline(e);const t={...Ie.defaultProps,...e},i=this._renderPipelineCache,o=this._hashRenderPipeline(t);let s=i[o]?.resource;if(s)i[o].useCount++,this.device.props.debugFactories&&E.log(3,`${this}: ${i[o].resource} reused, count=${i[o].useCount}, (id=${e.id})`)();else{const r=this.device.type==="webgl"&&this.device.props._sharePipelines?this.createSharedRenderPipeline(t):void 0;s=this.device.createRenderPipeline({...t,id:t.id?`${t.id}-cached`:ls("unnamed-cached"),_sharedRenderPipeline:r}),s.hash=o,i[o]={resource:s,useCount:1},this.device.props.debugFactories&&E.log(3,`${this}: ${s} created, count=${i[o].useCount}`)()}return s}createComputePipeline(e){if(!this.device.props._cachePipelines)return this.device.createComputePipeline(e);const t={...Me.defaultProps,...e},i=this._computePipelineCache,o=this._hashComputePipeline(t);let s=i[o]?.resource;return s?(i[o].useCount++,this.device.props.debugFactories&&E.log(3,`${this}: ${i[o].resource} reused, count=${i[o].useCount}, (id=${e.id})`)()):(s=this.device.createComputePipeline({...t,id:t.id?`${t.id}-cached`:void 0}),s.hash=o,i[o]={resource:s,useCount:1},this.device.props.debugFactories&&E.log(3,`${this}: ${s} created, count=${i[o].useCount}`)()),s}release(e){if(!this.device.props._cachePipelines){e.destroy();return}const t=this._getCache(e),i=e.hash;t[i].useCount--,t[i].useCount===0?(this._destroyPipeline(e),this.device.props.debugFactories&&E.log(3,`${this}: ${e} released and destroyed`)()):t[i].useCount<0?(E.error(`${this}: ${e} released, useCount < 0, resetting`)(),t[i].useCount=0):this.device.props.debugFactories&&E.log(3,`${this}: ${e} released, count=${t[i].useCount}`)()}createSharedRenderPipeline(e){const t=this._hashSharedRenderPipeline(e);let i=this._sharedRenderPipelineCache[t];return i||(i={resource:this.device._createSharedRenderPipelineWebGL(e),useCount:0},this._sharedRenderPipelineCache[t]=i),i.useCount++,i.resource}releaseSharedRenderPipeline(e){if(!e.sharedRenderPipeline)return;const t=this._hashSharedRenderPipeline(e.sharedRenderPipeline.props),i=this._sharedRenderPipelineCache[t];i&&(i.useCount--,i.useCount===0&&(i.resource.destroy(),delete this._sharedRenderPipelineCache[t]))}_destroyPipeline(e){const t=this._getCache(e);return this.device.props._destroyPipelines?(delete t[e.hash],e.destroy(),e instanceof Ie&&this.releaseSharedRenderPipeline(e),!0):!1}_getCache(e){let t;if(e instanceof Me&&(t=this._computePipelineCache),e instanceof Ie&&(t=this._renderPipelineCache),!t)throw new Error(`${this}`);if(!t[e.hash])throw new Error(`${this}: ${e} matched incorrect entry`);return t}_hashComputePipeline(e){const{type:t}=this.device,i=this._getHash(e.shader.source),o=this._getHash(JSON.stringify(e.shaderLayout));return`${t}/C/${i}SL${o}`}_hashRenderPipeline(e){const t=e.vs?this._getHash(e.vs.source):0,i=e.fs?this._getHash(e.fs.source):0,o=this._getWebGLVaryingHash(e),s=this._getHash(JSON.stringify(e.shaderLayout)),r=this._getHash(JSON.stringify(e._uniformBlockLayouts)),a=this._getHash(JSON.stringify(e.bufferLayout)),{type:l}=this.device;if(l==="webgl"){const c=this._getHash(JSON.stringify(e.parameters));return`${l}/R/${t}/${i}V${o}T${e.topology}P${c}SL${s}UBL${r}BL${a}`}else{const u=this._getHash(JSON.stringify({vertexEntryPoint:e.vertexEntryPoint,fragmentEntryPoint:e.fragmentEntryPoint})),f=this._getHash(JSON.stringify(e.parameters)),h=this._getWebGPUAttachmentHash(e);return`${l}/R/${t}/${i}V${o}T${e.topology}EP${u}P${f}SL${s}BL${a}A${h}`}}_hashSharedRenderPipeline(e){const t=e.vs?this._getHash(e.vs.source):0,i=e.fs?this._getHash(e.fs.source):0,o=this._getWebGLVaryingHash(e);return`webgl/S/${t}/${i}V${o}`}_getHash(e){return this._hashes[e]===void 0&&(this._hashes[e]=this._hashCounter++),this._hashes[e]}_getWebGLVaryingHash(e){const{varyings:t=[],bufferMode:i=null}=e;return this._getHash(JSON.stringify({varyings:t,bufferMode:i}))}_getWebGPUAttachmentHash(e){const t=e.colorAttachmentFormats??[this.device.preferredColorFormat],i=e.depthStencilAttachmentFormat??(e.parameters?.depthWriteEnabled?this.device.preferredDepthFormat:null);return this._getHash(JSON.stringify({colorAttachmentFormats:t,depthStencilAttachmentFormat:i}))}}class wt{static defaultProps={...Ss.defaultProps};static getDefaultShaderFactory(e){const t=e.getModuleData("@luma.gl/core");return t.defaultShaderFactory||=new wt(e),t.defaultShaderFactory}device;_cache={};get[Symbol.toStringTag](){return"ShaderFactory"}toString(){return`${this[Symbol.toStringTag]}(${this.device.id})`}constructor(e){this.device=e}createShader(e){if(!this.device.props._cacheShaders)return this.device.createShader(e);const t=this._hashShader(e);let i=this._cache[t];if(i)i.useCount++,this.device.props.debugFactories&&E.log(3,`${this}: Reusing shader ${i.resource.id} count=${i.useCount}`)();else{const o=this.device.createShader({...e,id:e.id?`${e.id}-cached`:void 0});this._cache[t]=i={resource:o,useCount:1},this.device.props.debugFactories&&E.log(3,`${this}: Created new shader ${o.id}`)()}return i.resource}release(e){if(!this.device.props._cacheShaders){e.destroy();return}const t=this._hashShader(e),i=this._cache[t];if(i)if(i.useCount--,i.useCount===0)this.device.props._destroyShaders&&(delete this._cache[t],i.resource.destroy(),this.device.props.debugFactories&&E.log(3,`${this}: Releasing shader ${e.id}, destroyed`)());else{if(i.useCount<0)throw new Error(`ShaderFactory: Shader ${e.id} released too many times`);this.device.props.debugFactories&&E.log(3,`${this}: Releasing shader ${e.id} count=${i.useCount}`)()}}_hashShader(e){return`${e.stage}:${e.source}`}}function Ns(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}function dt(n){return Array.isArray(n)?n.length===0||typeof n[0]=="number":Ns(n)}class Us{layout;constructor(e){this.layout=e}has(e){return!!this.layout.fields[e]}get(e){const t=this.layout.fields[e];return t?{offset:t.offset,size:t.size}:void 0}getFlatUniformValues(e){const t={};for(const[i,o]of Object.entries(e)){const s=this.layout.uniformTypes[i];s?this._flattenCompositeValue(t,i,s,o):this.layout.fields[i]&&(t[i]=o)}return t}getData(e){const t=Cs(this.layout.byteLength);new Uint8Array(t,0,this.layout.byteLength).fill(0);const i={i32:new Int32Array(t),u32:new Uint32Array(t),f32:new Float32Array(t),f16:new Uint16Array(t)},o=this.getFlatUniformValues(e);for(const[s,r]of Object.entries(o))this._writeLeafValue(i,s,r);return new Uint8Array(t,0,this.layout.byteLength)}_flattenCompositeValue(e,t,i,o){if(o!==void 0){if(typeof i=="string"||this.layout.fields[t]){e[t]=o;return}if(Array.isArray(i)){const s=i[0],r=i[1];if(Array.isArray(s))throw new Error(`Nested arrays are not supported for ${t}`);if(typeof s=="string"&&dt(o)){this._flattenPackedArray(e,t,s,r,o);return}if(!Array.isArray(o)){E.warn(`Unsupported uniform array value for ${t}:`,o)();return}for(let a=0;a<Math.min(o.length,r);a++){const l=o[a];l!==void 0&&this._flattenCompositeValue(e,`${t}[${a}]`,s,l)}return}if(As(i)&&Fs(o)){for(const[s,r]of Object.entries(o)){if(r===void 0)continue;const a=`${t}.${s}`;this._flattenCompositeValue(e,a,i[s],r)}return}E.warn(`Unsupported uniform value for ${t}:`,o)()}}_flattenPackedArray(e,t,i,o,s){const r=s,l=Es(i,this.layout.layout).components;for(let c=0;c<o;c++){const u=c*l;if(u>=r.length)break;l===1?e[`${t}[${c}]`]=Number(r[u]):e[`${t}[${c}]`]=ks(s,u,u+l)}}_writeLeafValue(e,t,i){const o=this.layout.fields[t];if(!o){E.warn(`Uniform ${t} not found in layout`)();return}const{type:s,components:r,columns:a,rows:l,offset:c,columnStride:u}=o,f=e[s];if(r===1){f[c]=Number(i);return}const h=i;if(a===1){for(let y=0;y<r;y++)f[c+y]=Number(h[y]??0);return}let g=0;for(let y=0;y<a;y++){const b=c+y*u;for(let w=0;w<l;w++)f[b+w]=Number(h[g++]??0)}}}function Fs(n){return!!n&&typeof n=="object"&&!Array.isArray(n)&&!ArrayBuffer.isView(n)}function ks(n,e,t){return Array.prototype.slice.call(n,e,t)}const zs=128;function Vs(n,e,t=16){if(n===e)return!0;const i=n,o=e;if(!dt(i)||!dt(o)||i.length!==o.length)return!1;const s=Math.min(t,zs);if(i.length>s)return!1;for(let r=0;r<i.length;++r)if(o[r]!==i[r])return!1;return!0}function Gs(n){return dt(n)?n.slice():n}class js{name;uniforms={};modifiedUniforms={};modified=!0;bindingLayout={};needsRedraw="initialized";constructor(e){if(this.name=e?.name||"unnamed",e?.name&&e?.shaderLayout){const t=e?.shaderLayout.bindings?.find(o=>o.type==="uniform"&&o.name===e?.name);if(!t)throw new Error(e?.name);const i=t;for(const o of i.uniforms||[])this.bindingLayout[o.name]=o}}setUniforms(e){for(const[t,i]of Object.entries(e))this._setUniform(t,i)&&!this.needsRedraw&&this.setNeedsRedraw(`${this.name}.${t}=${i}`)}setNeedsRedraw(e){this.needsRedraw=this.needsRedraw||e}getAllUniforms(){return this.modifiedUniforms={},this.needsRedraw=!1,this.uniforms||{}}_setUniform(e,t){return Vs(this.uniforms[e],t)?!1:(this.uniforms[e]=Gs(t),this.modifiedUniforms[e]=!0,this.modified=!0,!0)}}const $s=1024;class Yn{device;uniformBlocks=new Map;shaderBlockLayouts=new Map;shaderBlockWriters=new Map;uniformBuffers=new Map;constructor(e,t){this.device=e;for(const[i,o]of Object.entries(t)){const s=i,r=Wn(o.uniformTypes??{},{layout:o.layout??Ws(e)}),a=new Us(r);this.shaderBlockLayouts.set(s,r),this.shaderBlockWriters.set(s,a);const l=new js({name:i});l.setUniforms(a.getFlatUniformValues(o.defaultUniforms||{})),this.uniformBlocks.set(s,l)}}destroy(){for(const e of this.uniformBuffers.values())e.destroy()}setUniforms(e,t){for(const[i,o]of Object.entries(e)){const s=i,a=this.shaderBlockWriters.get(s)?.getFlatUniformValues(o||{});this.uniformBlocks.get(s)?.setUniforms(a||{})}this.updateUniformBuffers(t)}getUniformBufferByteLength(e){const t=this.shaderBlockLayouts.get(e)?.byteLength||0;return Math.max(t,$s)}getUniformBufferData(e){const t=this.uniformBlocks.get(e)?.getAllUniforms()||{};return this.shaderBlockWriters.get(e)?.getData(t)||new Uint8Array(0)}createUniformBuffer(e,t){t&&this.setUniforms(t);const i=this.getUniformBufferByteLength(e),o=this.device.createBuffer({usage:D.UNIFORM|D.COPY_DST,byteLength:i}),s=this.getUniformBufferData(e);return o.write(s),o}getManagedUniformBuffer(e){if(!this.uniformBuffers.get(e)){const t=this.getUniformBufferByteLength(e),i=this.device.createBuffer({usage:D.UNIFORM|D.COPY_DST,byteLength:t});this.uniformBuffers.set(e,i)}return this.uniformBuffers.get(e)}updateUniformBuffers(e){let t=!1;for(const i of this.uniformBlocks.keys()){const o=this.updateUniformBuffer(i,e);t||=o}return t&&E.log(3,`UniformStore.updateUniformBuffers(): ${t}`)(),t}updateUniformBuffer(e,t){const i=this.uniformBlocks.get(e);let o=this.uniformBuffers.get(e),s=!1;if(o&&i?.needsRedraw){s||=i.needsRedraw;const r=this.getUniformBufferData(e);if(o=this.uniformBuffers.get(e),o&&(t?this.device.writeBufferViaCommandEncoder(t,o,r):o.write(r)),E.level>=4){const a=this.uniformBlocks.get(e)?.getAllUniforms();E.log(4,`Writing to uniform buffer ${String(e)}`,r,a)()}}return s}}function Ws(n){return n.type==="webgpu"?"wgsl-uniform":"std140"}const Hs=/^(vs|fs):(?:#(?:decl|main-start|main-end)|[A-Za-z_][\w-]*)$/;function qn(n=[],e){const t=[],i={},o={},s={},r={};for(const a of n)ki({modules:t,defines:i,injections:o,vertexInputs:s,varyings:r},a),ki({modules:t,defines:i,injections:o,vertexInputs:s,varyings:r},a[e]);for(const a of Object.keys(r))if(s[a])throw new Error(`ShaderPlugin name "${a}" cannot be both a vertex input and a varying`);return{modules:t,defines:i,injections:o,vertexInputs:s,varyings:r}}function Zn(n=[],e=[]){const t=[...n],i=new Set(t.map(o=>o.name));for(const o of e)i.has(o.name)||(t.push(o),i.add(o.name));return t}function ki(n,e){if(e){e.modules?.length&&n.modules.push(...e.modules),e.defines&&Object.assign(n.defines,e.defines);for(const[t,i]of Object.entries(e.vertexInputs||{})){zi(t,"vertex input");const o=n.vertexInputs[t];if(o&&o!==i)throw new Error(`ShaderPlugin vertex input "${t}" has conflicting types "${o}" and "${i}"`);n.vertexInputs[t]=i}for(const[t,i]of Object.entries(e.varyings||{})){zi(t,"varying");const o=Ys(t,i),s=n.varyings[t];if(s&&(s.type!==o.type||s.interpolation!==o.interpolation))throw new Error(`ShaderPlugin varying "${t}" has conflicting declarations "${s.type}/${s.interpolation}" and "${o.type}/${o.interpolation}"`);n.varyings[t]=o}for(const t of e.injections||[])qs(t.target),n.injections[t.target]||(n.injections[t.target]=[]),n.injections[t.target].push({injection:t.injection,order:t.order??0})}}function zi(n,e){if(!/^[A-Za-z_][A-Za-z0-9_]*$/.test(n)||n.startsWith("_luma_"))throw new Error(`ShaderPlugin ${e} "${n}" must be a valid non-reserved identifier`)}function Ys(n,e){const{primitiveType:t}=cs.getAttributeShaderTypeInfo(e.type),i=t==="i32"||t==="u32",o=e.interpolation||(i?"flat":"smooth");if(i&&o==="smooth")throw new Error(`ShaderPlugin integer varying "${n}" must use flat interpolation`);return{type:e.type,interpolation:o}}function qs(n){if(!Hs.test(n))throw new Error(`ShaderPlugin injection target "${n}" must be a named shader anchor or hook`)}const Zs=`out vec4 transform_output;
void main() {
  transform_output = vec4(0);
}`,Ks=`#version 300 es
${Zs}`;function Xs(n){const{input:e,inputChannels:t,output:i}={};if(!e)return Ks;if(!t)throw new Error("inputChannels");const o=Js(t),s=Qs(e,t);return`#version 300 es
in ${o} ${e};
out vec4 ${i};
void main() {
  ${i} = ${s};
}`}function Js(n){switch(n){case 1:return"float";case 2:return"vec2";case 3:return"vec3";case 4:return"vec4";default:throw new Error(`invalid channels: ${n}`)}}function Qs(n,e){switch(e){case 1:return`vec4(${n}, 0.0, 0.0, 1.0)`;case 2:return`vec4(${n}, 0.0, 1.0)`;case 3:return`vec4(${n}, 1.0)`;case 4:return n;default:throw new Error(`invalid channels: ${e}`)}}function Kn(n,e=[],t=0){const i=Math.fround(n),o=n-i;return e[t]=i,e[t+1]=o,e}function er(n){return n-Math.fround(n)}function tr(n){const e=new Float32Array(32);for(let t=0;t<4;++t)for(let i=0;i<4;++i){const o=t*4+i;Kn(n[i*4+t],e,o*2)}return e}function Xn(n,e=!0){return n??e}function Jn(n=[0,0,0],e=!0){return e?n.map(t=>t/255):[...n]}function ir(n,e=!0){const t=Jn(n.slice(0,3),e),i=Number.isFinite(n[3]),o=i?n[3]:1;return[t[0],t[1],t[2],e&&i?o/255:o]}const Vi=`
layout(std140) uniform fp64arithmeticUniforms {
  uniform float ONE;
  uniform float SPLIT;
} fp64;

/*
About LUMA_FP64_CODE_ELIMINATION_WORKAROUND

The purpose of this workaround is to prevent shader compilers from
optimizing away necessary arithmetic operations by swapping their sequences
or transform the equation to some 'equivalent' form.

These helpers implement Dekker/Veltkamp-style error tracking. If the compiler
folds constants or reassociates the arithmetic, the high/low split can stop
tracking the rounding error correctly. That failure mode tends to look fine in
simple coordinate setup, but then breaks down inside iterative arithmetic such
as fp64 Mandelbrot loops.

The method is to multiply an artifical variable, ONE, which will be known to
the compiler to be 1 only at runtime. The whole expression is then represented
as a polynomial with respective to ONE. In the coefficients of all terms, only one a
and one b should appear

err = (a + b) * ONE^6 - a * ONE^5 - (a + b) * ONE^4 + a * ONE^3 - b - (a + b) * ONE^2 + a * ONE
*/

float prevent_fp64_optimization(float value) {
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  return value + fp64.ONE * 0.0;
#else
  return value;
#endif
}

// Divide float number to high and low floats to extend fraction bits
vec2 split(float a) {
  // Keep SPLIT as a runtime uniform so the compiler cannot fold the Dekker
  // split into a constant expression and reassociate the recovery steps.
  float split = prevent_fp64_optimization(fp64.SPLIT);
  float t = prevent_fp64_optimization(a * split);
  float temp = t - a;
  float a_hi = t - temp;
  float a_lo = a - a_hi;
  return vec2(a_hi, a_lo);
}

// Divide float number again when high float uses too many fraction bits
vec2 split2(vec2 a) {
  vec2 b = split(a.x);
  b.y += a.y;
  return b;
}

// Special sum operation when a > b
vec2 quickTwoSum(float a, float b) {
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  float sum = (a + b) * fp64.ONE;
  float err = b - (sum - a) * fp64.ONE;
#else
  float sum = a + b;
  float err = b - (sum - a);
#endif
  return vec2(sum, err);
}

// General sum operation
vec2 twoSum(float a, float b) {
  float s = (a + b);
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  float v = (s * fp64.ONE - a) * fp64.ONE;
  float err = (a - (s - v) * fp64.ONE) * fp64.ONE * fp64.ONE * fp64.ONE + (b - v);
#else
  float v = s - a;
  float err = (a - (s - v)) + (b - v);
#endif
  return vec2(s, err);
}

vec2 twoSub(float a, float b) {
  float s = (a - b);
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  float v = (s * fp64.ONE - a) * fp64.ONE;
  float err = (a - (s - v) * fp64.ONE) * fp64.ONE * fp64.ONE * fp64.ONE - (b + v);
#else
  float v = s - a;
  float err = (a - (s - v)) - (b + v);
#endif
  return vec2(s, err);
}

vec2 twoSqr(float a) {
  float prod = a * a;
  vec2 a_fp64 = split(a);
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  float err = ((a_fp64.x * a_fp64.x - prod) * fp64.ONE + 2.0 * a_fp64.x *
    a_fp64.y * fp64.ONE * fp64.ONE) + a_fp64.y * a_fp64.y * fp64.ONE * fp64.ONE * fp64.ONE;
#else
  float err = ((a_fp64.x * a_fp64.x - prod) + 2.0 * a_fp64.x * a_fp64.y) + a_fp64.y * a_fp64.y;
#endif
  return vec2(prod, err);
}

vec2 twoProd(float a, float b) {
  float prod = a * b;
  vec2 a_fp64 = split(a);
  vec2 b_fp64 = split(b);
  // twoProd is especially sensitive because mul_fp64 and div_fp64 both depend
  // on the split terms and cross terms staying in the original evaluation
  // order. If the compiler folds or reassociates them, the low part tends to
  // collapse to zero or NaN on some drivers.
  float highProduct = prevent_fp64_optimization(a_fp64.x * b_fp64.x);
  float crossProduct1 = prevent_fp64_optimization(a_fp64.x * b_fp64.y);
  float crossProduct2 = prevent_fp64_optimization(a_fp64.y * b_fp64.x);
  float lowProduct = prevent_fp64_optimization(a_fp64.y * b_fp64.y);
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  float err1 = (highProduct - prod) * fp64.ONE;
  float err2 = crossProduct1 * fp64.ONE * fp64.ONE;
  float err3 = crossProduct2 * fp64.ONE * fp64.ONE * fp64.ONE;
  float err4 = lowProduct * fp64.ONE * fp64.ONE * fp64.ONE * fp64.ONE;
#else
  float err1 = highProduct - prod;
  float err2 = crossProduct1;
  float err3 = crossProduct2;
  float err4 = lowProduct;
#endif
  float err = ((err1 + err2) + err3) + err4;
  return vec2(prod, err);
}

vec2 sum_fp64(vec2 a, vec2 b) {
  vec2 s, t;
  s = twoSum(a.x, b.x);
  t = twoSum(a.y, b.y);
  s.y += t.x;
  s = quickTwoSum(s.x, s.y);
  s.y += t.y;
  s = quickTwoSum(s.x, s.y);
  return s;
}

vec2 sub_fp64(vec2 a, vec2 b) {
  vec2 s, t;
  s = twoSub(a.x, b.x);
  t = twoSub(a.y, b.y);
  s.y += t.x;
  s = quickTwoSum(s.x, s.y);
  s.y += t.y;
  s = quickTwoSum(s.x, s.y);
  return s;
}

vec2 mul_fp64(vec2 a, vec2 b) {
  vec2 prod = twoProd(a.x, b.x);
  // y component is for the error
  prod.y += a.x * b.y;
#if defined(LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND)
  prod = split2(prod);
#endif
  prod = quickTwoSum(prod.x, prod.y);
  prod.y += a.y * b.x;
#if defined(LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND)
  prod = split2(prod);
#endif
  prod = quickTwoSum(prod.x, prod.y);
  return prod;
}

vec2 div_fp64(vec2 a, vec2 b) {
  float xn = 1.0 / b.x;
#if defined(LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND)
  vec2 yn = mul_fp64(a, vec2(xn, 0));
#else
  vec2 yn = a * xn;
#endif
  float diff = (sub_fp64(a, mul_fp64(b, yn))).x;
  vec2 prod = twoProd(xn, diff);
  return sum_fp64(yn, prod);
}

vec2 sqrt_fp64(vec2 a) {
  if (a.x == 0.0 && a.y == 0.0) return vec2(0.0, 0.0);
  if (a.x < 0.0) return vec2(0.0 / 0.0, 0.0 / 0.0);

  float x = 1.0 / sqrt(a.x);
  float yn = a.x * x;
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  vec2 yn_sqr = twoSqr(yn) * fp64.ONE;
#else
  vec2 yn_sqr = twoSqr(yn);
#endif
  float diff = sub_fp64(a, yn_sqr).x;
  vec2 prod = twoProd(x * 0.5, diff);
#if defined(LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND)
  return sum_fp64(split(yn), prod);
#else
  return sum_fp64(vec2(yn, 0.0), prod);
#endif
}
`,nr=`struct Fp64F32Bits {
  sign: u32,
  baseExponent: i32,
  significand: u32,
  isZero: bool,
  isInf: bool,
  isNan: bool,
};

// Decode an f32 as (-1)^sign * significand * 2^baseExponent.
fn fp64_decode_f32_bits(bits: u32) -> Fp64F32Bits {
  let sign = bits >> 31u;
  let exponentBits = (bits >> 23u) & 0xffu;
  let fraction = bits & 0x7fffffu;

  if (exponentBits == 0xffu) {
    return Fp64F32Bits(sign, 0, 0u, false, fraction == 0u, fraction != 0u);
  }
  if (exponentBits == 0u) {
    return Fp64F32Bits(sign, -149, fraction, fraction == 0u, false, false);
  }
  return Fp64F32Bits(sign, i32(exponentBits) - 150, 0x800000u | fraction, false, false, false);
}

fn fp64_f32_magnitude_compare(aBits: u32, bBits: u32) -> i32 {
  let aMagnitude = aBits & 0x7fffffffu;
  let bMagnitude = bBits & 0x7fffffffu;
  if (aMagnitude == bMagnitude) {
    return 0;
  }
  return select(-1, 1, aMagnitude > bMagnitude);
}

fn fp64_make_residual_f32_bits(
  exactSign: u32,
  exactMagnitude: vec2u,
  exactBaseExponent: i32,
  highBits: u32
) -> u32 {
  if (fp64_u64_is_zero(exactMagnitude)) {
    return 0u;
  }

  let high = fp64_decode_f32_bits(highBits);
  if (high.isInf || high.isNan) {
    return exactSign << 31u;
  }
  if (high.isZero) {
    return fp64_make_f32_bits_from_u64(exactSign, exactMagnitude, exactBaseExponent);
  }

  let commonBaseExponent = min(exactBaseExponent, high.baseExponent);
  let exactShift = exactBaseExponent - commonBaseExponent;
  let highShift = high.baseExponent - commonBaseExponent;

  // A normal two-sum/two-product residual never needs a shift this large.
  // This guard gives deterministic underflow behavior outside that contract.
  if (exactShift >= 64 || highShift >= 64) {
    return exactSign << 31u;
  }

  let exactAligned = fp64_u64_shift_left(exactMagnitude, u32(exactShift));
  let highAligned = fp64_u64_shift_left(vec2u(0u, high.significand), u32(highShift));
  let comparison = fp64_u64_compare(exactAligned, highAligned);
  if (comparison == 0) {
    return 0u;
  }

  var residualSign = exactSign;
  var residualMagnitude: vec2u;
  if (comparison > 0) {
    residualMagnitude = fp64_u64_sub(exactAligned, highAligned);
  } else {
    residualSign = exactSign ^ 1u;
    residualMagnitude = fp64_u64_sub(highAligned, exactAligned);
  }
  return fp64_make_f32_bits_from_u64(
    residualSign,
    residualMagnitude,
    commonBaseExponent
  );
}

fn fp64_split_accumulator_bits(
  sign: u32,
  magnitude: vec2u,
  baseExponent: i32
) -> vec2u {
  let highBits = fp64_make_f32_bits_from_u64(sign, magnitude, baseExponent);
  let lowBits = fp64_make_residual_f32_bits(sign, magnitude, baseExponent, highBits);
  return vec2u(highBits, lowBits);
}

fn fp64_two_sum_integer_bits(aBits: u32, bBits: u32) -> vec2u {
  let a = fp64_decode_f32_bits(aBits);
  let b = fp64_decode_f32_bits(bBits);

  if (a.isNan || b.isNan) {
    return vec2u(0x7fc00000u, 0u);
  }
  if (a.isInf || b.isInf) {
    if (a.isInf && b.isInf && a.sign != b.sign) {
      return vec2u(0x7fc00000u, 0u);
    }
    return select(vec2u(bBits, 0u), vec2u(aBits, 0u), a.isInf);
  }
  if (a.isZero && b.isZero) {
    return vec2u((a.sign & b.sign) << 31u, 0u);
  }
  if (a.isZero) {
    return vec2u(bBits, 0u);
  }
  if (b.isZero) {
    return vec2u(aBits, 0u);
  }

  let exponentDifference = select(
    b.baseExponent - a.baseExponent,
    a.baseExponent - b.baseExponent,
    a.baseExponent >= b.baseExponent
  );

  // Beyond half an ulp, rounding cannot change the larger operand. Returning
  // the smaller operand intact also avoids an unbounded integer alignment.
  // At a power-of-two boundary the spacing below the larger operand is half
  // the spacing above it, so an opposite-sign gap-25 operand can still change
  // the rounded high limb. Gap 26 is the first universally safe early-out.
  if (exponentDifference > 25) {
    if (fp64_f32_magnitude_compare(aBits, bBits) >= 0) {
      return vec2u(aBits, bBits);
    }
    return vec2u(bBits, aBits);
  }

  let commonBaseExponent = min(a.baseExponent, b.baseExponent);
  let aMagnitude = fp64_u64_shift_left(
    vec2u(0u, a.significand),
    u32(a.baseExponent - commonBaseExponent)
  );
  let bMagnitude = fp64_u64_shift_left(
    vec2u(0u, b.significand),
    u32(b.baseExponent - commonBaseExponent)
  );

  var resultSign = a.sign;
  var resultMagnitude: vec2u;
  if (a.sign == b.sign) {
    resultMagnitude = fp64_u64_add(aMagnitude, bMagnitude);
  } else {
    let comparison = fp64_u64_compare(aMagnitude, bMagnitude);
    if (comparison == 0) {
      return vec2u(0u, 0u);
    }
    if (comparison > 0) {
      resultMagnitude = fp64_u64_sub(aMagnitude, bMagnitude);
    } else {
      resultSign = b.sign;
      resultMagnitude = fp64_u64_sub(bMagnitude, aMagnitude);
    }
  }

  return fp64_split_accumulator_bits(resultSign, resultMagnitude, commonBaseExponent);
}

fn fp64_two_sum_integer(a: f32, b: f32) -> vec2f {
  let resultBits = fp64_two_sum_integer_bits(bitcast<u32>(a), bitcast<u32>(b));
  return vec2f(bitcast<f32>(resultBits.x), bitcast<f32>(resultBits.y));
}

fn fp64_multiply_significands(a: u32, b: u32) -> vec2u {
  let aLow = a & 0xffffu;
  let aHigh = a >> 16u;
  let bLow = b & 0xffffu;
  let bHigh = b >> 16u;
  let lowProduct = aLow * bLow;
  let crossProduct = aLow * bHigh + aHigh * bLow;
  let highProduct = aHigh * bHigh;

  var result = vec2u(0u, lowProduct);
  result = fp64_u64_add(
    result,
    fp64_u64_shift_left(vec2u(0u, crossProduct), 16u)
  );
  result = fp64_u64_add(result, vec2u(highProduct, 0u));
  return result;
}

fn fp64_two_prod_integer_bits(aBits: u32, bBits: u32) -> vec2u {
  let a = fp64_decode_f32_bits(aBits);
  let b = fp64_decode_f32_bits(bBits);
  let resultSign = a.sign ^ b.sign;

  if (a.isNan || b.isNan || ((a.isZero || b.isZero) && (a.isInf || b.isInf))) {
    return vec2u(0x7fc00000u, 0u);
  }
  if (a.isInf || b.isInf) {
    return vec2u((resultSign << 31u) | 0x7f800000u, resultSign << 31u);
  }
  if (a.isZero || b.isZero) {
    return vec2u(resultSign << 31u, resultSign << 31u);
  }

  let magnitude = fp64_multiply_significands(a.significand, b.significand);
  return fp64_split_accumulator_bits(
    resultSign,
    magnitude,
    a.baseExponent + b.baseExponent
  );
}

fn fp64_two_prod_integer(a: f32, b: f32) -> vec2f {
  let resultBits = fp64_two_prod_integer_bits(bitcast<u32>(a), bitcast<u32>(b));
  return vec2f(bitcast<f32>(resultBits.x), bitcast<f32>(resultBits.y));
}

fn fp64_round_add_integer(a: f32, b: f32) -> f32 {
  return fp64_two_sum_integer(a, b).x;
}

fn fp64_round_mul_integer(a: f32, b: f32) -> f32 {
  return fp64_two_prod_integer(a, b).x;
}

#ifndef LUMA_FP64_PREDICATE_ONLY
fn fp64_f32_finite_exponent(value: Fp64F32Bits) -> i32 {
  let mostSignificantBit = 31u - countLeadingZeros(value.significand);
  return value.baseExponent + i32(mostSignificantBit);
}

fn fp64_scale_f32_integer(value: f32, exponent: i32) -> f32 {
  let decoded = fp64_decode_f32_bits(bitcast<u32>(value));
  if (decoded.isZero || decoded.isInf || decoded.isNan) {
    return value;
  }
  let resultBits = fp64_make_f32_bits_from_u64(
    decoded.sign,
    vec2u(0u, decoded.significand),
    decoded.baseExponent + exponent
  );
  return bitcast<f32>(resultBits);
}

// Divide normalized significands so the hardware operation cannot overflow,
// underflow, or flush a subnormal result. Reapply the exponent with integer
// packing, which also produces subnormal correction limbs without relying on
// floating-point arithmetic to preserve them.
fn fp64_divide_f32_integer(aValue: f32, bValue: f32) -> f32 {
  let a = fp64_decode_f32_bits(bitcast<u32>(aValue));
  let b = fp64_decode_f32_bits(bitcast<u32>(bValue));
  if (a.isZero || b.isZero || a.isInf || b.isInf || a.isNan || b.isNan) {
    return aValue / bValue;
  }

  let aMostSignificantBit = 31u - countLeadingZeros(a.significand);
  let bMostSignificantBit = 31u - countLeadingZeros(b.significand);
  let normalizedABits = fp64_make_f32_bits_from_u64(
    a.sign,
    vec2u(0u, a.significand),
    -i32(aMostSignificantBit)
  );
  let normalizedBBits = fp64_make_f32_bits_from_u64(
    b.sign,
    vec2u(0u, b.significand),
    -i32(bMostSignificantBit)
  );
  let normalizedQuotient = bitcast<f32>(normalizedABits) / bitcast<f32>(normalizedBBits);
  let quotient = fp64_decode_f32_bits(bitcast<u32>(normalizedQuotient));
  let exponentShift =
    a.baseExponent + i32(aMostSignificantBit) -
    b.baseExponent - i32(bMostSignificantBit);
  let quotientBits = fp64_make_f32_bits_from_u64(
    quotient.sign,
    vec2u(0u, quotient.significand),
    quotient.baseExponent + exponentShift
  );
  return bitcast<f32>(quotientBits);
}
#endif

#ifndef LUMA_FP64_PREDICATE_ONLY
fn split(a: f32) -> vec2f {
  let aBits = bitcast<u32>(a);
  let decoded = fp64_decode_f32_bits(aBits);
  if (decoded.isZero || decoded.isInf || decoded.isNan) {
    return vec2f(a, 0.0);
  }

  var roundedHigh = decoded.significand >> 12u;
  let remainder = decoded.significand & 0xfffu;
  if (remainder > 0x800u || (remainder == 0x800u && (roundedHigh & 1u) == 1u)) {
    roundedHigh = roundedHigh + 1u;
  }
  var highMagnitude = vec2u(0u, roundedHigh << 12u);
  var highBits = fp64_make_f32_bits_from_u64(
    decoded.sign,
    highMagnitude,
    decoded.baseExponent
  );
  // Rounding the high limb of a maximum-exponent value can overflow even
  // though the original value is finite. Truncate only in that boundary case
  // so split remains an exact finite decomposition.
  if (fp64_decode_f32_bits(highBits).isInf) {
    roundedHigh = decoded.significand >> 12u;
    highMagnitude = vec2u(0u, roundedHigh << 12u);
    highBits = fp64_make_f32_bits_from_u64(
      decoded.sign,
      highMagnitude,
      decoded.baseExponent
    );
  }
  let lowBits = fp64_make_residual_f32_bits(
    decoded.sign,
    vec2u(0u, decoded.significand),
    decoded.baseExponent,
    highBits
  );
  return vec2f(bitcast<f32>(highBits), bitcast<f32>(lowBits));
}

fn split2(a: vec2f) -> vec2f {
  var result = split(a.x);
  result.y = fp64_round_add_integer(result.y, a.y);
  return result;
}
#endif

#ifndef LUMA_FP64_PREDICATE_ONLY
fn quickTwoSum(a: f32, b: f32) -> vec2f {
  return fp64_two_sum_integer(a, b);
}
#endif

fn twoSum(a: f32, b: f32) -> vec2f {
  return fp64_two_sum_integer(a, b);
}

fn twoSub(a: f32, b: f32) -> vec2f {
  let bBits = bitcast<u32>(b) ^ 0x80000000u;
  let resultBits = fp64_two_sum_integer_bits(bitcast<u32>(a), bBits);
  return vec2f(bitcast<f32>(resultBits.x), bitcast<f32>(resultBits.y));
}

#ifndef LUMA_FP64_PREDICATE_ONLY
fn twoSqr(a: f32) -> vec2f {
  return fp64_two_prod_integer(a, a);
}

fn twoProd(a: f32, b: f32) -> vec2f {
  return fp64_two_prod_integer(a, b);
}
#endif

fn sum_fp64(a: vec2f, b: vec2f) -> vec2f {
  var sum = fp64_two_sum_integer(a.x, b.x);
  let lowSum = fp64_two_sum_integer(a.y, b.y);
  sum.y = fp64_round_add_integer(sum.y, lowSum.x);
  sum = fp64_two_sum_integer(sum.x, sum.y);
  sum.y = fp64_round_add_integer(sum.y, lowSum.y);
  return fp64_two_sum_integer(sum.x, sum.y);
}

fn sub_fp64(a: vec2f, b: vec2f) -> vec2f {
  let negatedB = vec2f(
    bitcast<f32>(bitcast<u32>(b.x) ^ 0x80000000u),
    bitcast<f32>(bitcast<u32>(b.y) ^ 0x80000000u)
  );
  return sum_fp64(a, negatedB);
}

fn mul_fp64(a: vec2f, b: vec2f) -> vec2f {
  var product = fp64_two_prod_integer(a.x, b.x);
  let crossProduct1 = fp64_round_mul_integer(a.x, b.y);
  product.y = fp64_round_add_integer(product.y, crossProduct1);
  product = fp64_two_sum_integer(product.x, product.y);
  let crossProduct2 = fp64_round_mul_integer(a.y, b.x);
  product.y = fp64_round_add_integer(product.y, crossProduct2);
  return fp64_two_sum_integer(product.x, product.y);
}

#ifndef LUMA_FP64_PREDICATE_ONLY
fn fp64_scale_fp64_integer(value: vec2f, exponent: i32) -> vec2f {
  let high = fp64_scale_f32_integer(value.x, exponent);
  let low = fp64_scale_f32_integer(value.y, exponent);
  return sum_fp64(vec2f(high, 0.0), vec2f(low, 0.0));
}

fn fp64_div_fp64_normalized(a: vec2f, b: vec2f) -> vec2f {
  let quotientHigh = fp64_divide_f32_integer(a.x, b.x);
  var quotient = vec2f(quotientHigh, 0.0);

  let remainder = sub_fp64(a, mul_fp64(b, quotient));
  let quotientLow = fp64_divide_f32_integer(remainder.x, b.x);
  quotient = sum_fp64(quotient, vec2f(quotientLow, 0.0));

  let secondRemainder = sub_fp64(a, mul_fp64(b, quotient));
  let correction = fp64_divide_f32_integer(secondRemainder.x, b.x);
  return sum_fp64(quotient, vec2f(correction, 0.0));
}

fn div_fp64(a: vec2f, b: vec2f) -> vec2f {
  let decodedA = fp64_decode_f32_bits(bitcast<u32>(a.x));
  let decodedB = fp64_decode_f32_bits(bitcast<u32>(b.x));
  if (
    decodedA.isZero || decodedB.isZero ||
    decodedA.isInf || decodedB.isInf ||
    decodedA.isNan || decodedB.isNan
  ) {
    return fp64_div_fp64_normalized(a, b);
  }

  let exponentA = fp64_f32_finite_exponent(decodedA);
  let exponentB = fp64_f32_finite_exponent(decodedB);
  // Correct the quotient near unity so b * q and the remainder stay clear of
  // both f32 underflow and overflow. The exponent difference is applied once.
  let normalizedA = fp64_scale_fp64_integer(a, -exponentA);
  let normalizedB = fp64_scale_fp64_integer(b, -exponentB);
  let normalizedQuotient = fp64_div_fp64_normalized(normalizedA, normalizedB);
  return fp64_scale_fp64_integer(normalizedQuotient, exponentA - exponentB);
}

fn fp64_sqrt_fp64_normalized(a: vec2f) -> vec2f {
  let estimate = sqrt(a.x);
  let difference = sub_fp64(a, fp64_two_prod_integer(estimate, estimate)).x;
  let denominator = fp64_round_add_integer(estimate, estimate);
  let correction = fp64_divide_f32_integer(difference, denominator);
  return sum_fp64(vec2f(estimate, 0.0), vec2f(correction, 0.0));
}

fn sqrt_fp64(a: vec2f) -> vec2f {
  let decoded = fp64_decode_f32_bits(bitcast<u32>(a.x));
  let decodedLow = fp64_decode_f32_bits(bitcast<u32>(a.y));
  if (decoded.isZero && decodedLow.isZero) {
    return vec2f(0.0, 0.0);
  }
  if (decoded.sign == 1u) {
    let nanValue = fp64_nan(a.x);
    return vec2f(nanValue, nanValue);
  }

  if (decoded.isInf || decoded.isNan) {
    return fp64_sqrt_fp64_normalized(a);
  }
  let exponent = fp64_f32_finite_exponent(decoded);
  // An even scale lets the final square-root rescale use an integer exponent.
  let evenExponent = exponent - (exponent & 1);
  let normalizedA = fp64_scale_fp64_integer(a, -evenExponent);
  let normalizedRoot = fp64_sqrt_fp64_normalized(normalizedA);
  return fp64_scale_fp64_integer(normalizedRoot, evenExponent / 2);
}
#endif
`,or=`struct Fp64ArithmeticUniforms {
  ONE: f32,
  SPLIT: f32,
};

@group(0) @binding(auto) var<uniform> fp64arithmetic : Fp64ArithmeticUniforms;

#ifndef LUMA_FP64_F32_INPUT_ONLY
struct Fp64Bits {
  sign: u32,
  exponent: i32,
  significand: vec2u,
  isZero: bool,
  isInf: bool,
  isNan: bool,
};
#endif

#ifndef LUMA_FP64_PREDICATE_ONLY
fn fp64_nan(seed: f32) -> f32 {
  let nanBits = 0x7fc00000u | select(0u, 1u, seed < 0.0);
  return bitcast<f32>(nanBits);
}
#endif

fn fp64_u64_is_zero(value: vec2u) -> bool {
  return value.x == 0u && value.y == 0u;
}

fn fp64_u64_compare(a: vec2u, b: vec2u) -> i32 {
  if (a.x != b.x) {
    return select(-1, 1, a.x > b.x);
  }
  if (a.y != b.y) {
    return select(-1, 1, a.y > b.y);
  }
  return 0;
}

fn fp64_u64_add(a: vec2u, b: vec2u) -> vec2u {
  let low = a.y + b.y;
  let carry = select(0u, 1u, low < a.y);
  return vec2u(a.x + b.x + carry, low);
}

fn fp64_u64_sub(a: vec2u, b: vec2u) -> vec2u {
  let borrow = select(0u, 1u, a.y < b.y);
  return vec2u(a.x - b.x - borrow, a.y - b.y);
}

fn fp64_u64_shift_left(value: vec2u, shift: u32) -> vec2u {
  if (shift == 0u) {
    return value;
  }
  if (shift < 32u) {
    return vec2u((value.x << shift) | (value.y >> (32u - shift)), value.y << shift);
  }
  if (shift == 32u) {
    return vec2u(value.y, 0u);
  }
  if (shift < 64u) {
    return vec2u(value.y << (shift - 32u), 0u);
  }
  return vec2u(0u);
}

fn fp64_u64_shift_right(value: vec2u, shift: u32) -> vec2u {
  if (shift == 0u) {
    return value;
  }
  if (shift < 32u) {
    return vec2u(value.x >> shift, (value.y >> shift) | (value.x << (32u - shift)));
  }
  if (shift == 32u) {
    return vec2u(0u, value.x);
  }
  if (shift < 64u) {
    return vec2u(0u, value.x >> (shift - 32u));
  }
  return vec2u(0u);
}

fn fp64_u64_get_bit(value: vec2u, bitIndex: u32) -> bool {
  if (bitIndex >= 64u) {
    return false;
  }
  if (bitIndex >= 32u) {
    return ((value.x >> (bitIndex - 32u)) & 1u) != 0u;
  }
  return ((value.y >> bitIndex) & 1u) != 0u;
}

fn fp64_u64_has_bits_below(value: vec2u, bitCount: u32) -> bool {
  if (bitCount == 0u) {
    return false;
  }
  if (bitCount >= 64u) {
    return !fp64_u64_is_zero(value);
  }
  if (bitCount > 32u) {
    let highBitCount = bitCount - 32u;
    let highMask = (1u << highBitCount) - 1u;
    return value.y != 0u || (value.x & highMask) != 0u;
  }
  if (bitCount == 32u) {
    return value.y != 0u;
  }
  let lowMask = (1u << bitCount) - 1u;
  return (value.y & lowMask) != 0u;
}

#ifndef LUMA_FP64_F32_INPUT_ONLY
fn fp64_u64_shift_right_sticky(value: vec2u, shift: u32) -> vec2u {
  var shifted = fp64_u64_shift_right(value, shift);
  if (fp64_u64_has_bits_below(value, shift)) {
    shifted.y = shifted.y | 1u;
  }
  return shifted;
}
#endif

fn fp64_u64_count_leading_zeros(value: vec2u) -> u32 {
  if (value.x != 0u) {
    return countLeadingZeros(value.x);
  }
  return 32u + countLeadingZeros(value.y);
}

fn fp64_round_shift_right_to_u32(value: vec2u, shift: u32) -> u32 {
  if (shift == 0u) {
    return value.y;
  }

  let truncated = fp64_u64_shift_right(value, shift);
  var rounded = truncated.y;
  let guard = fp64_u64_get_bit(value, shift - 1u);
  let hasTrailingBits = fp64_u64_has_bits_below(value, shift - 1u);
  if (guard && (hasTrailingBits || (rounded & 1u) == 1u)) {
    rounded = rounded + 1u;
  }
  return rounded;
}

#ifndef LUMA_FP64_F32_INPUT_ONLY
fn fp64_round_shift_right(value: vec2u, shift: u32) -> vec2u {
  if (shift == 0u) {
    return value;
  }

  var rounded = fp64_u64_shift_right(value, shift);
  let guard = fp64_u64_get_bit(value, shift - 1u);
  let hasTrailingBits = fp64_u64_has_bits_below(value, shift - 1u);
  if (guard && (hasTrailingBits || (rounded.y & 1u) == 1u)) {
    rounded = fp64_u64_add(rounded, vec2u(0u, 1u));
  }
  return rounded;
}
#endif

fn fp64_make_f32_bits_from_u64(sign: u32, significand: vec2u, baseExponent: i32) -> u32 {
  if (fp64_u64_is_zero(significand)) {
    return sign << 31u;
  }

  let leadingZeros = fp64_u64_count_leading_zeros(significand);
  let mostSignificantBit = 63u - leadingZeros;
  var exponent = baseExponent + i32(mostSignificantBit);

  if (exponent > 127) {
    return (sign << 31u) | 0x7f800000u;
  }

  if (exponent >= -126) {
    let shift = i32(mostSignificantBit) - 23;
    var significand24: u32;
    if (shift > 0) {
      significand24 = fp64_round_shift_right_to_u32(significand, u32(shift));
    } else {
      significand24 = fp64_u64_shift_left(significand, u32(-shift)).y;
    }

    if (significand24 >= 0x1000000u) {
      significand24 = significand24 >> 1u;
      exponent = exponent + 1;
      if (exponent > 127) {
        return (sign << 31u) | 0x7f800000u;
      }
    }

    return (sign << 31u) | (u32(exponent + 127) << 23u) | (significand24 & 0x7fffffu);
  }

  let scaleExponent = baseExponent + 149;
  var mantissa: u32;
  if (scaleExponent >= 0) {
    mantissa = fp64_u64_shift_left(significand, u32(scaleExponent)).y;
  } else {
    mantissa = fp64_round_shift_right_to_u32(significand, u32(-scaleExponent));
  }

  if (mantissa >= 0x800000u) {
    return (sign << 31u) | 0x00800000u;
  }
  return (sign << 31u) | mantissa;
}

#ifndef LUMA_FP64_F32_INPUT_ONLY
fn fp64_decode_bits(bits: vec2u) -> Fp64Bits {
  let sign = bits.x >> 31u;
  let exponentBits = (bits.x >> 20u) & 0x7ffu;
  let fractionHigh = bits.x & 0xfffffu;
  let fractionLow = bits.y;
  let fraction = vec2u(fractionHigh, fractionLow);

  if (exponentBits == 0x7ffu) {
    let isInf = fp64_u64_is_zero(fraction);
    return Fp64Bits(sign, 0, vec2u(0u), false, isInf, !isInf);
  }

  if (exponentBits == 0u) {
    let isZero = fp64_u64_is_zero(fraction);
    return Fp64Bits(sign, -1022, fraction, isZero, false, false);
  }

  return Fp64Bits(sign, i32(exponentBits) - 1023, vec2u((1u << 20u) | fractionHigh, fractionLow), false, false, false);
}

fn fp64_finite_magnitude_compare(a: Fp64Bits, b: Fp64Bits) -> i32 {
  if (a.exponent != b.exponent) {
    return select(-1, 1, a.exponent > b.exponent);
  }
  return fp64_u64_compare(a.significand, b.significand);
}
#endif

#ifndef LUMA_FP64_F32_INPUT_ONLY
struct Fp64RawF32Bits {
  sign: u32,
  baseExponent: i32,
  significand: u32,
  isZero: bool,
  isInf: bool,
  isNan: bool,
};

// Decode an f32 as (-1)^sign * significand * 2^baseExponent. This shared
// integer representation lets normalization remain independent of the
// selected double-single arithmetic implementation.
fn fp64_decode_raw_f32_bits(bits: u32) -> Fp64RawF32Bits {
  let sign = bits >> 31u;
  let exponentBits = (bits >> 23u) & 0xffu;
  let fraction = bits & 0x7fffffu;

  if (exponentBits == 0xffu) {
    return Fp64RawF32Bits(sign, 0, 0u, false, fraction == 0u, fraction != 0u);
  }
  if (exponentBits == 0u) {
    return Fp64RawF32Bits(sign, -149, fraction, fraction == 0u, false, false);
  }
  return Fp64RawF32Bits(
    sign,
    i32(exponentBits) - 150,
    0x800000u | fraction,
    false,
    false,
    false
  );
}

fn fp64_raw_f32_magnitude_compare(aBits: u32, bBits: u32) -> i32 {
  let aMagnitude = aBits & 0x7fffffffu;
  let bMagnitude = bBits & 0x7fffffffu;
  if (aMagnitude == bMagnitude) {
    return 0;
  }
  return select(-1, 1, aMagnitude > bMagnitude);
}

fn fp64_make_raw_residual_f32_bits(
  exactSign: u32,
  exactMagnitude: vec2u,
  exactBaseExponent: i32,
  highBits: u32
) -> u32 {
  if (fp64_u64_is_zero(exactMagnitude)) {
    return 0u;
  }

  let high = fp64_decode_raw_f32_bits(highBits);
  if (high.isInf || high.isNan) {
    return 0u;
  }
  if (high.isZero) {
    return fp64_make_f32_bits_from_u64(exactSign, exactMagnitude, exactBaseExponent);
  }

  let commonBaseExponent = min(exactBaseExponent, high.baseExponent);
  let exactShift = exactBaseExponent - commonBaseExponent;
  let highShift = high.baseExponent - commonBaseExponent;
  if (exactShift >= 64 || highShift >= 64) {
    return 0u;
  }

  let exactAligned = fp64_u64_shift_left(exactMagnitude, u32(exactShift));
  let highAligned = fp64_u64_shift_left(vec2u(0u, high.significand), u32(highShift));
  let comparison = fp64_u64_compare(exactAligned, highAligned);
  if (comparison == 0) {
    return 0u;
  }

  var residualSign = exactSign;
  var residualMagnitude: vec2u;
  if (comparison > 0) {
    residualMagnitude = fp64_u64_sub(exactAligned, highAligned);
  } else {
    residualSign = exactSign ^ 1u;
    residualMagnitude = fp64_u64_sub(highAligned, exactAligned);
  }
  return fp64_make_f32_bits_from_u64(
    residualSign,
    residualMagnitude,
    commonBaseExponent
  );
}

fn fp64_split_raw_accumulator_bits(
  sign: u32,
  magnitude: vec2u,
  baseExponent: i32
) -> vec2u {
  if (fp64_u64_is_zero(magnitude)) {
    return vec2u(0u);
  }
  let highBits = fp64_make_f32_bits_from_u64(sign, magnitude, baseExponent);
  let rawLowBits = fp64_make_raw_residual_f32_bits(sign, magnitude, baseExponent, highBits);
  let lowBits = select(rawLowBits, 0u, (rawLowBits & 0x7fffffffu) == 0u);
  if ((highBits & 0x7fffffffu) == 0u && (lowBits & 0x7fffffffu) == 0u) {
    return vec2u(0u);
  }
  return vec2u(highBits, lowBits);
}
#endif

#ifndef LUMA_FP64_F32_INPUT_ONLY
// Round an arithmetic accumulator to binary64 before splitting it. The
// aligned add/subtract paths retain three guard bits plus a sticky bit, which
// is sufficient for round-to-nearest-even at the binary64 boundary.
fn fp64_split_binary64_accumulator_bits(
  sign: u32,
  magnitude: vec2u,
  baseExponent: i32
) -> vec2u {
  if (fp64_u64_is_zero(magnitude)) {
    return vec2u(0u);
  }

  let mostSignificantBit = 63u - fp64_u64_count_leading_zeros(magnitude);
  let exponent = baseExponent + i32(mostSignificantBit);
  if (exponent > 1023) {
    return vec2u((sign << 31u) | 0x7f800000u, 0u);
  }

  var roundedMagnitude = magnitude;
  var roundedBaseExponent = baseExponent;
  if (exponent >= -1022) {
    if (mostSignificantBit > 52u) {
      let shift = mostSignificantBit - 52u;
      roundedMagnitude = fp64_round_shift_right(magnitude, shift);
      roundedBaseExponent = baseExponent + i32(shift);
    }
  } else {
    let shift = -1074 - baseExponent;
    if (shift > 0) {
      roundedMagnitude = fp64_round_shift_right(magnitude, u32(shift));
      roundedBaseExponent = -1074;
    }
  }

  if (fp64_u64_is_zero(roundedMagnitude)) {
    return vec2u(0u);
  }
  return fp64_split_raw_accumulator_bits(sign, roundedMagnitude, roundedBaseExponent);
}
#endif

#ifndef LUMA_FP64_PREDICATE_ONLY
fn fp64_add_raw_f32_bits(aBits: u32, bBits: u32) -> vec2u {
  let a = fp64_decode_raw_f32_bits(aBits);
  let b = fp64_decode_raw_f32_bits(bBits);

  if (a.isNan || b.isNan) {
    return vec2u(0x7fc00000u, 0u);
  }
  if (a.isInf || b.isInf) {
    if (a.isInf && b.isInf && a.sign != b.sign) {
      return vec2u(0x7fc00000u, 0u);
    }
    return select(vec2u(bBits, 0u), vec2u(aBits, 0u), a.isInf);
  }
  if (a.isZero && b.isZero) {
    return vec2u(0u);
  }
  if (a.isZero) {
    return vec2u(bBits, 0u);
  }
  if (b.isZero) {
    return vec2u(aBits, 0u);
  }

  let exponentDifference = abs(a.baseExponent - b.baseExponent);
  if (exponentDifference > 25) {
    if (fp64_raw_f32_magnitude_compare(aBits, bBits) >= 0) {
      return vec2u(aBits, bBits);
    }
    return vec2u(bBits, aBits);
  }

  let commonBaseExponent = min(a.baseExponent, b.baseExponent);
  let aMagnitude = fp64_u64_shift_left(
    vec2u(0u, a.significand),
    u32(a.baseExponent - commonBaseExponent)
  );
  let bMagnitude = fp64_u64_shift_left(
    vec2u(0u, b.significand),
    u32(b.baseExponent - commonBaseExponent)
  );

  var resultSign = a.sign;
  var resultMagnitude: vec2u;
  if (a.sign == b.sign) {
    resultMagnitude = fp64_u64_add(aMagnitude, bMagnitude);
  } else {
    let comparison = fp64_u64_compare(aMagnitude, bMagnitude);
    if (comparison == 0) {
      return vec2u(0u);
    }
    if (comparison > 0) {
      resultMagnitude = fp64_u64_sub(aMagnitude, bMagnitude);
    } else {
      resultSign = b.sign;
      resultMagnitude = fp64_u64_sub(bMagnitude, aMagnitude);
    }
  }

  return fp64_split_raw_accumulator_bits(
    resultSign,
    resultMagnitude,
    commonBaseExponent
  );
}
#endif

#ifndef LUMA_FP64_F32_INPUT_ONLY
fn fp64_add_aligned_magnitudes_to_fp64_bits(
  sign: u32,
  larger: Fp64Bits,
  smaller: Fp64Bits
) -> vec2u {
  let largeSignificand = fp64_u64_shift_left(larger.significand, 3u);
  let smallSignificand = fp64_u64_shift_right_sticky(
    fp64_u64_shift_left(smaller.significand, 3u),
    u32(larger.exponent - smaller.exponent)
  );
  let resultSignificand = fp64_u64_add(largeSignificand, smallSignificand);
  return fp64_split_binary64_accumulator_bits(
    sign,
    resultSignificand,
    larger.exponent - 55
  );
}

fn fp64_sub_aligned_magnitudes_to_fp64_bits(
  sign: u32,
  larger: Fp64Bits,
  smaller: Fp64Bits
) -> vec2u {
  let largeSignificand = fp64_u64_shift_left(larger.significand, 3u);
  let smallSignificand = fp64_u64_shift_right_sticky(
    fp64_u64_shift_left(smaller.significand, 3u),
    u32(larger.exponent - smaller.exponent)
  );
  let resultSignificand = fp64_u64_sub(largeSignificand, smallSignificand);
  return fp64_split_binary64_accumulator_bits(
    sign,
    resultSignificand,
    larger.exponent - 55
  );
}

fn fp64_add_aligned_magnitudes_to_f32_bits(sign: u32, larger: Fp64Bits, smaller: Fp64Bits) -> u32 {
  let largeSignificand = fp64_u64_shift_left(larger.significand, 3u);
  let smallSignificand = fp64_u64_shift_right_sticky(
    fp64_u64_shift_left(smaller.significand, 3u),
    u32(larger.exponent - smaller.exponent)
  );
  let resultSignificand = fp64_u64_add(largeSignificand, smallSignificand);
  return fp64_make_f32_bits_from_u64(sign, resultSignificand, larger.exponent - 55);
}

fn fp64_sub_aligned_magnitudes_to_f32_bits(sign: u32, larger: Fp64Bits, smaller: Fp64Bits) -> u32 {
  let largeSignificand = fp64_u64_shift_left(larger.significand, 3u);
  let smallSignificand = fp64_u64_shift_right_sticky(
    fp64_u64_shift_left(smaller.significand, 3u),
    u32(larger.exponent - smaller.exponent)
  );
  let resultSignificand = fp64_u64_sub(largeSignificand, smallSignificand);
  return fp64_make_f32_bits_from_u64(sign, resultSignificand, larger.exponent - 55);
}

// Subtract two raw binary64 values and round the exact result once to f32.
// The input words are canonical high/low words: .x contains sign/exponent/high
// fraction bits, and .y contains the low 32 fraction bits.
fn sub_fp64u32_to_f32_bits(aBits: vec2u, bBits: vec2u) -> u32 {
  let a = fp64_decode_bits(aBits);
  let b = fp64_decode_bits(bBits);
  let bSubtractionSign = b.sign ^ 1u;

  if (a.isNan || b.isNan) {
    return 0x7fc00000u;
  }
  if (a.isInf && b.isInf) {
    if (a.sign == bSubtractionSign) {
      return (a.sign << 31u) | 0x7f800000u;
    }
    return 0x7fc00000u;
  }
  if (a.isInf) {
    return (a.sign << 31u) | 0x7f800000u;
  }
  if (b.isInf) {
    return (bSubtractionSign << 31u) | 0x7f800000u;
  }
  if (a.isZero && b.isZero) {
    return select(0u, 0x80000000u, a.sign == 1u && b.sign == 0u);
  }

  let magnitudeComparison = fp64_finite_magnitude_compare(a, b);
  if (a.sign == bSubtractionSign) {
    if (magnitudeComparison >= 0) {
      return fp64_add_aligned_magnitudes_to_f32_bits(a.sign, a, b);
    }
    return fp64_add_aligned_magnitudes_to_f32_bits(a.sign, b, a);
  }

  if (magnitudeComparison == 0) {
    return 0u;
  }
  if (magnitudeComparison > 0) {
    return fp64_sub_aligned_magnitudes_to_f32_bits(a.sign, a, b);
  }
  return fp64_sub_aligned_magnitudes_to_f32_bits(bSubtractionSign, b, a);
}

fn sub_fp64u32_to_f32(aBits: vec2u, bBits: vec2u) -> f32 {
  return bitcast<f32>(sub_fp64u32_to_f32_bits(aBits, bBits));
}

// Subtract two raw binary64 values, round once to binary64, then split the
// result into normalized f32 limbs. Finite results must fit within the f32
// exponent range; larger magnitudes map to infinity and smaller magnitudes
// map to zero. The input words use canonical high/low word order.
fn sub_fp64u32_to_fp64_bits(aBits: vec2u, bBits: vec2u) -> vec2u {
  let a = fp64_decode_bits(aBits);
  let b = fp64_decode_bits(bBits);
  let bSubtractionSign = b.sign ^ 1u;

  if (a.isNan || b.isNan) {
    return vec2u(0x7fc00000u, 0u);
  }
  if (a.isInf && b.isInf) {
    if (a.sign == bSubtractionSign) {
      return vec2u((a.sign << 31u) | 0x7f800000u, 0u);
    }
    return vec2u(0x7fc00000u, 0u);
  }
  if (a.isInf) {
    return vec2u((a.sign << 31u) | 0x7f800000u, 0u);
  }
  if (b.isInf) {
    return vec2u((bSubtractionSign << 31u) | 0x7f800000u, 0u);
  }
  if (a.isZero && b.isZero) {
    return vec2u(0u);
  }

  let magnitudeComparison = fp64_finite_magnitude_compare(a, b);
  if (a.sign == bSubtractionSign) {
    if (magnitudeComparison >= 0) {
      return fp64_add_aligned_magnitudes_to_fp64_bits(a.sign, a, b);
    }
    return fp64_add_aligned_magnitudes_to_fp64_bits(a.sign, b, a);
  }

  if (magnitudeComparison == 0) {
    return vec2u(0u);
  }
  if (magnitudeComparison > 0) {
    return fp64_sub_aligned_magnitudes_to_fp64_bits(a.sign, a, b);
  }
  return fp64_sub_aligned_magnitudes_to_fp64_bits(bSubtractionSign, b, a);
}

fn sub_fp64u32_to_fp64(aBits: vec2u, bBits: vec2u) -> vec2f {
  let resultBits = sub_fp64u32_to_fp64_bits(aBits, bBits);
  return vec2f(bitcast<f32>(resultBits.x), bitcast<f32>(resultBits.y));
}
#endif

#ifndef LUMA_FP64_PREDICATE_ONLY
fn fp64_runtime_zero() -> f32 {
  return fp64arithmetic.ONE * 0.0;
}

fn prevent_fp64_optimization(value: f32) -> f32 {
#ifdef LUMA_FP64_CODE_ELIMINATION_WORKAROUND
  return value + fp64_runtime_zero();
#else
  return value;
#endif
}
#endif

#ifdef LUMA_FP64_INTEGER_ARITHMETIC
${nr}
#else
fn split(a: f32) -> vec2f {
  let splitValue = prevent_fp64_optimization(fp64arithmetic.SPLIT + fp64_runtime_zero());
  let t = prevent_fp64_optimization(a * splitValue);
  let temp = prevent_fp64_optimization(t - a);
  let aHi = prevent_fp64_optimization(t - temp);
  let aLo = prevent_fp64_optimization(a - aHi);
  return vec2f(aHi, aLo);
}

fn split2(a: vec2f) -> vec2f {
  var b = split(a.x);
  b.y = b.y + a.y;
  return b;
}

fn quickTwoSum(a: f32, b: f32) -> vec2f {
#ifdef LUMA_FP64_CODE_ELIMINATION_WORKAROUND
  let sum = prevent_fp64_optimization((a + b) * fp64arithmetic.ONE);
  let err = prevent_fp64_optimization(b - (sum - a) * fp64arithmetic.ONE);
#else
  let sum = prevent_fp64_optimization(a + b);
  let err = prevent_fp64_optimization(b - (sum - a));
#endif
  return vec2f(sum, err);
}

fn twoSum(a: f32, b: f32) -> vec2f {
  let s = prevent_fp64_optimization(a + b);
#ifdef LUMA_FP64_CODE_ELIMINATION_WORKAROUND
  let v = prevent_fp64_optimization((s * fp64arithmetic.ONE - a) * fp64arithmetic.ONE);
  let err =
    prevent_fp64_optimization((a - (s - v) * fp64arithmetic.ONE) *
      fp64arithmetic.ONE *
      fp64arithmetic.ONE *
      fp64arithmetic.ONE) +
    prevent_fp64_optimization(b - v);
#else
  let v = prevent_fp64_optimization(s - a);
  let err = prevent_fp64_optimization(a - (s - v)) + prevent_fp64_optimization(b - v);
#endif
  return vec2f(s, err);
}

fn twoSub(a: f32, b: f32) -> vec2f {
  let s = prevent_fp64_optimization(a - b);
#ifdef LUMA_FP64_CODE_ELIMINATION_WORKAROUND
  let v = prevent_fp64_optimization((s * fp64arithmetic.ONE - a) * fp64arithmetic.ONE);
  let err =
    prevent_fp64_optimization((a - (s - v) * fp64arithmetic.ONE) *
      fp64arithmetic.ONE *
      fp64arithmetic.ONE *
      fp64arithmetic.ONE) -
    prevent_fp64_optimization(b + v);
#else
  let v = prevent_fp64_optimization(s - a);
  let err = prevent_fp64_optimization(a - (s - v)) - prevent_fp64_optimization(b + v);
#endif
  return vec2f(s, err);
}

fn twoSqr(a: f32) -> vec2f {
  let prod = prevent_fp64_optimization(a * a);
  let aFp64 = split(a);
  let highProduct = prevent_fp64_optimization(aFp64.x * aFp64.x);
  let crossProduct = prevent_fp64_optimization(2.0 * aFp64.x * aFp64.y);
  let lowProduct = prevent_fp64_optimization(aFp64.y * aFp64.y);
#ifdef LUMA_FP64_CODE_ELIMINATION_WORKAROUND
  let err =
    (prevent_fp64_optimization(highProduct - prod) * fp64arithmetic.ONE +
      crossProduct * fp64arithmetic.ONE * fp64arithmetic.ONE) +
    lowProduct * fp64arithmetic.ONE * fp64arithmetic.ONE * fp64arithmetic.ONE;
#else
  let err = ((prevent_fp64_optimization(highProduct - prod) + crossProduct) + lowProduct);
#endif
  return vec2f(prod, err);
}

fn twoProd(a: f32, b: f32) -> vec2f {
  let prod = prevent_fp64_optimization(a * b);
  let aFp64 = split(a);
  let bFp64 = split(b);
  let highProduct = prevent_fp64_optimization(aFp64.x * bFp64.x);
  let crossProduct1 = prevent_fp64_optimization(aFp64.x * bFp64.y);
  let crossProduct2 = prevent_fp64_optimization(aFp64.y * bFp64.x);
  let lowProduct = prevent_fp64_optimization(aFp64.y * bFp64.y);
#ifdef LUMA_FP64_CODE_ELIMINATION_WORKAROUND
  let err1 = (highProduct - prod) * fp64arithmetic.ONE;
  let err2 = crossProduct1 * fp64arithmetic.ONE * fp64arithmetic.ONE;
  let err3 = crossProduct2 * fp64arithmetic.ONE * fp64arithmetic.ONE * fp64arithmetic.ONE;
  let err4 =
    lowProduct *
    fp64arithmetic.ONE *
    fp64arithmetic.ONE *
    fp64arithmetic.ONE *
    fp64arithmetic.ONE;
#else
  let err1 = highProduct - prod;
  let err2 = crossProduct1;
  let err3 = crossProduct2;
  let err4 = lowProduct;
#endif
  let err12InputA = prevent_fp64_optimization(err1);
  let err12InputB = prevent_fp64_optimization(err2);
  let err12 = prevent_fp64_optimization(err12InputA + err12InputB);
  let err123InputA = prevent_fp64_optimization(err12);
  let err123InputB = prevent_fp64_optimization(err3);
  let err123 = prevent_fp64_optimization(err123InputA + err123InputB);
  let err1234InputA = prevent_fp64_optimization(err123);
  let err1234InputB = prevent_fp64_optimization(err4);
  let err = prevent_fp64_optimization(err1234InputA + err1234InputB);
  return vec2f(prod, err);
}

fn sum_fp64(a: vec2f, b: vec2f) -> vec2f {
  var s = twoSum(a.x, b.x);
  let t = twoSum(a.y, b.y);
  s.y = prevent_fp64_optimization(s.y + t.x);
  s = quickTwoSum(s.x, s.y);
  s.y = prevent_fp64_optimization(s.y + t.y);
  s = quickTwoSum(s.x, s.y);
  return s;
}

fn sub_fp64(a: vec2f, b: vec2f) -> vec2f {
  var s = twoSub(a.x, b.x);
  let t = twoSub(a.y, b.y);
  s.y = prevent_fp64_optimization(s.y + t.x);
  s = quickTwoSum(s.x, s.y);
  s.y = prevent_fp64_optimization(s.y + t.y);
  s = quickTwoSum(s.x, s.y);
  return s;
}

fn mul_fp64(a: vec2f, b: vec2f) -> vec2f {
  var prod = twoProd(a.x, b.x);
  let crossProduct1 = prevent_fp64_optimization(a.x * b.y);
  prod.y = prevent_fp64_optimization(prod.y + crossProduct1);
#ifdef LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND
  prod = split2(prod);
#endif
  prod = quickTwoSum(prod.x, prod.y);
  let crossProduct2 = prevent_fp64_optimization(a.y * b.x);
  prod.y = prevent_fp64_optimization(prod.y + crossProduct2);
#ifdef LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND
  prod = split2(prod);
#endif
  prod = quickTwoSum(prod.x, prod.y);
  return prod;
}

#ifndef LUMA_FP64_PREDICATE_ONLY
fn div_fp64(a: vec2f, b: vec2f) -> vec2f {
  let xn = prevent_fp64_optimization(1.0 / b.x);
  let yn = mul_fp64(a, vec2f(xn, fp64_runtime_zero()));
  let diff = prevent_fp64_optimization(sub_fp64(a, mul_fp64(b, yn)).x);
  let prod = twoProd(xn, diff);
  return sum_fp64(yn, prod);
}

fn sqrt_fp64(a: vec2f) -> vec2f {
  if (a.x == 0.0 && a.y == 0.0) {
    return vec2f(0.0, 0.0);
  }
  if (a.x < 0.0) {
    let nanValue = fp64_nan(a.x);
    return vec2f(nanValue, nanValue);
  }

  let x = prevent_fp64_optimization(1.0 / sqrt(a.x));
  let yn = prevent_fp64_optimization(a.x * x);
#ifdef LUMA_FP64_CODE_ELIMINATION_WORKAROUND
  let ynSqr = twoSqr(yn) * fp64arithmetic.ONE;
#else
  let ynSqr = twoSqr(yn);
#endif
  let diff = prevent_fp64_optimization(sub_fp64(a, ynSqr).x);
  let prod = twoProd(prevent_fp64_optimization(x * 0.5), diff);
#ifdef LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND
  return sum_fp64(split(yn), prod);
#else
  return sum_fp64(vec2f(yn, 0.0), prod);
#endif
}
#endif
#endif

#ifndef LUMA_FP64_PREDICATE_ONLY
fn fp64_f32_bits_is_nan(bits: u32) -> bool {
  return (bits & 0x7fffffffu) > 0x7f800000u;
}

fn fp64_f32_bits_is_inf(bits: u32) -> bool {
  return (bits & 0x7fffffffu) == 0x7f800000u;
}

fn fp64_compare_f32_bits(aBits: u32, bBits: u32) -> i32 {
  let aMagnitude = aBits & 0x7fffffffu;
  let bMagnitude = bBits & 0x7fffffffu;
  if (aMagnitude == 0u && bMagnitude == 0u) {
    return 0;
  }
  let aSign = aBits >> 31u;
  let bSign = bBits >> 31u;
  if (aSign != bSign) {
    return select(1, -1, aSign == 1u);
  }
  if (aMagnitude == bMagnitude) {
    return 0;
  }
  let magnitudeComparison = select(-1, 1, aMagnitude > bMagnitude);
  return select(magnitudeComparison, -magnitudeComparison, aSign == 1u);
}

// Normalize an arbitrary pair of finite f32 limbs with integer accumulation.
// This is independent of LUMA_FP64_INTEGER_ARITHMETIC and canonicalizes every
// representation of zero to vec2f(+0.0, +0.0).
fn normalize_fp64(value: vec2f) -> vec2f {
  let resultBits = fp64_add_raw_f32_bits(bitcast<u32>(value.x), bitcast<u32>(value.y));
  return vec2f(bitcast<f32>(resultBits.x), bitcast<f32>(resultBits.y));
}

fn is_nan_fp64(value: vec2f) -> bool {
  let normalized = normalize_fp64(value);
  return fp64_f32_bits_is_nan(bitcast<u32>(normalized.x)) ||
    fp64_f32_bits_is_nan(bitcast<u32>(normalized.y));
}

fn is_finite_fp64(value: vec2f) -> bool {
  let normalized = normalize_fp64(value);
  let highBits = bitcast<u32>(normalized.x);
  let lowBits = bitcast<u32>(normalized.y);
  return !fp64_f32_bits_is_nan(highBits) && !fp64_f32_bits_is_nan(lowBits) &&
    !fp64_f32_bits_is_inf(highBits) && !fp64_f32_bits_is_inf(lowBits);
}

// Returns -1, 0, or 1. NaN is unordered and returns 0; call is_nan_fp64 or
// is_finite_fp64 first when 0 must mean a finite zero.
fn sign_fp64(value: vec2f) -> i32 {
  let normalized = normalize_fp64(value);
  let highBits = bitcast<u32>(normalized.x);
  let lowBits = bitcast<u32>(normalized.y);
  if (fp64_f32_bits_is_nan(highBits) || fp64_f32_bits_is_nan(lowBits)) {
    return 0;
  }
  if ((highBits & 0x7fffffffu) != 0u) {
    return select(1, -1, (highBits >> 31u) == 1u);
  }
  if ((lowBits & 0x7fffffffu) != 0u) {
    return select(1, -1, (lowBits >> 31u) == 1u);
  }
  return 0;
}

// Compares double-single values and returns -1, 0, or 1. NaN is unordered
// and returns 0; callers that require equality semantics must first check
// is_nan_fp64 or is_finite_fp64.
fn compare_fp64(a: vec2f, b: vec2f) -> i32 {
  let normalizedA = normalize_fp64(a);
  let normalizedB = normalize_fp64(b);
  let aHighBits = bitcast<u32>(normalizedA.x);
  let aLowBits = bitcast<u32>(normalizedA.y);
  let bHighBits = bitcast<u32>(normalizedB.x);
  let bLowBits = bitcast<u32>(normalizedB.y);
  if (fp64_f32_bits_is_nan(aHighBits) || fp64_f32_bits_is_nan(aLowBits) ||
      fp64_f32_bits_is_nan(bHighBits) || fp64_f32_bits_is_nan(bLowBits)) {
    return 0;
  }
  let highComparison = fp64_compare_f32_bits(aHighBits, bHighBits);
  if (highComparison != 0) {
    return highComparison;
  }
  return fp64_compare_f32_bits(aLowBits, bLowBits);
}
#endif
`,sr={ONE:1,SPLIT:4097},rr={name:"fp64arithmetic",source:or,fs:Vi,vs:Vi,defaultUniforms:sr,uniformTypes:{ONE:"f32",SPLIT:"f32"},fp64ify:Kn,fp64LowPart:er,fp64ifyMatrix4:tr},ar={useByteColors:"f32"},lr={useByteColors:!0},Gi=ur("floatColors"),cr=fr("floatColors");function ur(n){return`layout(std140) uniform ${n}Uniforms {
  float useByteColors;
} ${n};

vec3 ${n}_normalize(vec3 inputColor) {
  return ${n}.useByteColors > 0.5 ? inputColor / 255.0 : inputColor;
}

vec4 ${n}_normalize(vec4 inputColor) {
  return ${n}.useByteColors > 0.5 ? inputColor / 255.0 : inputColor;
}

vec4 ${n}_premultiplyAlpha(vec4 inputColor) {
  return vec4(inputColor.rgb * inputColor.a, inputColor.a);
}

vec4 ${n}_unpremultiplyAlpha(vec4 inputColor) {
  return inputColor.a > 0.0 ? vec4(inputColor.rgb / inputColor.a, inputColor.a) : vec4(0.0);
}

vec4 ${n}_premultiply_alpha(vec4 inputColor) {
  return ${n}_premultiplyAlpha(inputColor);
}

vec4 ${n}_unpremultiply_alpha(vec4 inputColor) {
  return ${n}_unpremultiplyAlpha(inputColor);
}
`}function fr(n){return`struct ${n}Uniforms {
  useByteColors: f32
};

@group(0) @binding(auto) var<uniform> ${n} : ${n}Uniforms;

fn ${n}_normalize(inputColor: vec3<f32>) -> vec3<f32> {
  return select(inputColor, inputColor / 255.0, ${n}.useByteColors > 0.5);
}

fn ${n}_normalize4(inputColor: vec4<f32>) -> vec4<f32> {
  return select(inputColor, inputColor / 255.0, ${n}.useByteColors > 0.5);
}

fn ${n}_premultiplyAlpha(inputColor: vec4<f32>) -> vec4<f32> {
  return vec4<f32>(inputColor.rgb * inputColor.a, inputColor.a);
}

fn ${n}_unpremultiplyAlpha(inputColor: vec4<f32>) -> vec4<f32> {
  return select(
    vec4<f32>(0.0),
    vec4<f32>(inputColor.rgb / inputColor.a, inputColor.a),
    inputColor.a > 0.0
  );
}

fn ${n}_premultiply_alpha(inputColor: vec4<f32>) -> vec4<f32> {
  return ${n}_premultiplyAlpha(inputColor);
}

fn ${n}_unpremultiply_alpha(inputColor: vec4<f32>) -> vec4<f32> {
  return ${n}_unpremultiplyAlpha(inputColor);
}
`}const Qn={name:"floatColors",props:{},uniforms:{},vs:Gi,fs:Gi,source:cr,uniformTypes:ar,defaultUniforms:lr},dr=[0,1,1,1],hr=`layout(std140) uniform pickingUniforms {
  float isActive;
  float isAttribute;
  float isHighlightActive;
  float useByteColors;
  vec3 highlightedObjectColor;
  vec4 highlightColor;
} picking;

out vec4 picking_vRGBcolor_Avalid;

// Normalize unsigned byte color to 0-1 range
vec3 picking_normalizeColor(vec3 color) {
  return picking.useByteColors > 0.5 ? color / 255.0 : color;
}

// Normalize unsigned byte color to 0-1 range
vec4 picking_normalizeColor(vec4 color) {
  return picking.useByteColors > 0.5 ? color / 255.0 : color;
}

bool picking_isColorZero(vec3 color) {
  return dot(color, vec3(1.0)) < 0.00001;
}

bool picking_isColorValid(vec3 color) {
  return dot(color, vec3(1.0)) > 0.00001;
}

// Check if this vertex is highlighted 
bool isVertexHighlighted(vec3 vertexColor) {
  vec3 highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
  return
    bool(picking.isHighlightActive) && picking_isColorZero(abs(vertexColor - highlightedObjectColor));
}

// Set the current picking color
void picking_setPickingColor(vec3 pickingColor) {
  pickingColor = picking_normalizeColor(pickingColor);

  if (bool(picking.isActive)) {
    // Use alpha as the validity flag. If pickingColor is [0, 0, 0] fragment is non-pickable
    picking_vRGBcolor_Avalid.a = float(picking_isColorValid(pickingColor));

    if (!bool(picking.isAttribute)) {
      // Stores the picking color so that the fragment shader can render it during picking
      picking_vRGBcolor_Avalid.rgb = pickingColor;
    }
  } else {
    // Do the comparison with selected item color in vertex shader as it should mean fewer compares
    picking_vRGBcolor_Avalid.a = float(isVertexHighlighted(pickingColor));
  }
}

void picking_setPickingAttribute(float value) {
  if (bool(picking.isAttribute)) {
    picking_vRGBcolor_Avalid.r = value;
  }
}

void picking_setPickingAttribute(vec2 value) {
  if (bool(picking.isAttribute)) {
    picking_vRGBcolor_Avalid.rg = value;
  }
}

void picking_setPickingAttribute(vec3 value) {
  if (bool(picking.isAttribute)) {
    picking_vRGBcolor_Avalid.rgb = value;
  }
}
`,gr=`layout(std140) uniform pickingUniforms {
  float isActive;
  float isAttribute;
  float isHighlightActive;
  float useByteColors;
  vec3 highlightedObjectColor;
  vec4 highlightColor;
} picking;

in vec4 picking_vRGBcolor_Avalid;

/*
 * Returns highlight color if this item is selected.
 */
vec4 picking_filterHighlightColor(vec4 color) {
  // If we are still picking, we don't highlight
  if (picking.isActive > 0.5) {
    return color;
  }

  bool selected = bool(picking_vRGBcolor_Avalid.a);

  if (selected) {
    // Blend in highlight color based on its alpha value
    float highLightAlpha = picking.highlightColor.a;
    float blendedAlpha = highLightAlpha + color.a * (1.0 - highLightAlpha);
    float highLightRatio = highLightAlpha / blendedAlpha;

    vec3 blendedRGB = mix(color.rgb, picking.highlightColor.rgb, highLightRatio);
    return vec4(blendedRGB, blendedAlpha);
  } else {
    return color;
  }
}

/*
 * Returns picking color if picking enabled else unmodified argument.
 */
vec4 picking_filterPickingColor(vec4 color) {
  if (bool(picking.isActive)) {
    if (picking_vRGBcolor_Avalid.a == 0.0) {
      discard;
    }
    return picking_vRGBcolor_Avalid;
  }
  return color;
}

/*
 * Returns picking color if picking is enabled if not
 * highlight color if this item is selected, otherwise unmodified argument.
 */
vec4 picking_filterColor(vec4 color) {
  vec4 highlightColor = picking_filterHighlightColor(color);
  return picking_filterPickingColor(highlightColor);
}
`,me={props:{},uniforms:{},name:"picking",uniformTypes:{isActive:"f32",isAttribute:"f32",isHighlightActive:"f32",useByteColors:"f32",highlightedObjectColor:"vec3<f32>",highlightColor:"vec4<f32>"},defaultUniforms:{isActive:!1,isAttribute:!1,isHighlightActive:!1,useByteColors:!0,highlightedObjectColor:[0,0,0],highlightColor:dr},vs:hr,fs:gr,getUniforms:pr};function pr(n={},e){const t={},i=Xn(n.useByteColors,!0);if(n.highlightedObjectColor!==void 0)if(n.highlightedObjectColor===null)t.isHighlightActive=!1;else{t.isHighlightActive=!0;const o=n.highlightedObjectColor.slice(0,3);t.highlightedObjectColor=o}return n.highlightColor&&(t.highlightColor=ir(n.highlightColor,i)),n.isActive!==void 0&&(t.isActive=!!n.isActive,t.isAttribute=!!n.isAttribute),n.useByteColors!==void 0&&(t.useByteColors=!!n.useByteColors),t}const ji=`precision highp int;

// #if (defined(SHADER_TYPE_FRAGMENT) && defined(LIGHTING_FRAGMENT)) || (defined(SHADER_TYPE_VERTEX) && defined(LIGHTING_VERTEX))
struct AmbientLight {
  vec3 color;
};

struct PointLight {
  vec3 color;
  vec3 position;
  vec3 attenuation; // 2nd order x:Constant-y:Linear-z:Exponential
};

struct SpotLight {
  vec3 color;
  vec3 position;
  vec3 direction;
  vec3 attenuation;
  vec2 coneCos;
};

struct DirectionalLight {
  vec3 color;
  vec3 direction;
};

struct UniformLight {
  vec3 color;
  vec3 position;
  vec3 direction;
  vec3 attenuation;
  vec2 coneCos;
};

layout(std140) uniform lightingUniforms {
  int enabled;
  int directionalLightCount;
  int pointLightCount;
  int spotLightCount;
  vec3 ambientColor;
  UniformLight lights[5];
} lighting;

PointLight lighting_getPointLight(int index) {
  UniformLight light = lighting.lights[index];
  return PointLight(light.color, light.position, light.attenuation);
}

SpotLight lighting_getSpotLight(int index) {
  UniformLight light = lighting.lights[lighting.pointLightCount + index];
  return SpotLight(light.color, light.position, light.direction, light.attenuation, light.coneCos);
}

DirectionalLight lighting_getDirectionalLight(int index) {
  UniformLight light =
    lighting.lights[lighting.pointLightCount + lighting.spotLightCount + index];
  return DirectionalLight(light.color, light.direction);
}

float getPointLightAttenuation(PointLight pointLight, float distance) {
  return pointLight.attenuation.x
       + pointLight.attenuation.y * distance
       + pointLight.attenuation.z * distance * distance;
}

float getSpotLightAttenuation(SpotLight spotLight, vec3 positionWorldspace) {
  vec3 light_direction = normalize(positionWorldspace - spotLight.position);
  float coneFactor = smoothstep(
    spotLight.coneCos.y,
    spotLight.coneCos.x,
    dot(normalize(spotLight.direction), light_direction)
  );
  float distanceAttenuation = getPointLightAttenuation(
    PointLight(spotLight.color, spotLight.position, spotLight.attenuation),
    distance(spotLight.position, positionWorldspace)
  );
  return distanceAttenuation / max(coneFactor, 0.0001);
}

// #endif
`,mr=`// #if (defined(SHADER_TYPE_FRAGMENT) && defined(LIGHTING_FRAGMENT)) || (defined(SHADER_TYPE_VERTEX) && defined(LIGHTING_VERTEX))
const MAX_LIGHTS: i32 = 5;

struct AmbientLight {
  color: vec3<f32>,
};

struct PointLight {
  color: vec3<f32>,
  position: vec3<f32>,
  attenuation: vec3<f32>, // 2nd order x:Constant-y:Linear-z:Exponential
};

struct SpotLight {
  color: vec3<f32>,
  position: vec3<f32>,
  direction: vec3<f32>,
  attenuation: vec3<f32>,
  coneCos: vec2<f32>,
};

struct DirectionalLight {
  color: vec3<f32>,
  direction: vec3<f32>,
};

struct UniformLight {
  color: vec3<f32>,
  position: vec3<f32>,
  direction: vec3<f32>,
  attenuation: vec3<f32>,
  coneCos: vec2<f32>,
};

struct lightingUniforms {
  enabled: i32,
  directionalLightCount: i32,
  pointLightCount: i32,
  spotLightCount: i32,
  ambientColor: vec3<f32>,
  lights: array<UniformLight, 5>,
};

@group(2) @binding(auto) var<uniform> lighting : lightingUniforms;

fn lighting_getPointLight(index: i32) -> PointLight {
  let light = lighting.lights[index];
  return PointLight(light.color, light.position, light.attenuation);
}

fn lighting_getSpotLight(index: i32) -> SpotLight {
  let light = lighting.lights[lighting.pointLightCount + index];
  return SpotLight(light.color, light.position, light.direction, light.attenuation, light.coneCos);
}

fn lighting_getDirectionalLight(index: i32) -> DirectionalLight {
  let light = lighting.lights[lighting.pointLightCount + lighting.spotLightCount + index];
  return DirectionalLight(light.color, light.direction);
}

fn getPointLightAttenuation(pointLight: PointLight, distance: f32) -> f32 {
  return pointLight.attenuation.x
       + pointLight.attenuation.y * distance
       + pointLight.attenuation.z * distance * distance;
}

fn getSpotLightAttenuation(spotLight: SpotLight, positionWorldspace: vec3<f32>) -> f32 {
  let lightDirection = normalize(positionWorldspace - spotLight.position);
  let coneFactor = smoothstep(
    spotLight.coneCos.y,
    spotLight.coneCos.x,
    dot(normalize(spotLight.direction), lightDirection)
  );
  let distanceAttenuation = getPointLightAttenuation(
    PointLight(spotLight.color, spotLight.position, spotLight.attenuation),
    distance(spotLight.position, positionWorldspace)
  );
  return distanceAttenuation / max(coneFactor, 0.0001);
}
`,fe=5,yr={color:"vec3<f32>",position:"vec3<f32>",direction:"vec3<f32>",attenuation:"vec3<f32>",coneCos:"vec2<f32>"},eo={props:{},uniforms:{},name:"lighting",defines:{},uniformTypes:{enabled:"i32",directionalLightCount:"i32",pointLightCount:"i32",spotLightCount:"i32",ambientColor:"vec3<f32>",lights:[yr,fe]},defaultUniforms:Qe(),bindingLayout:[{name:"lighting",group:2}],firstBindingSlot:0,source:mr,vs:ji,fs:ji,getUniforms:br};function br(n,e={}){if(n=n&&{...n},!n)return Qe();n.lights&&(n={...n,..._r(n.lights),lights:void 0});const{useByteColors:t,ambientLight:i,pointLights:o,spotLights:s,directionalLights:r}=n||{};if(!(i||o&&o.length>0||s&&s.length>0||r&&r.length>0))return{...Qe(),enabled:0};const l={...Qe(),...vr({useByteColors:t,ambientLight:i,pointLights:o,spotLights:s,directionalLights:r})};return n.enabled!==void 0&&(l.enabled=n.enabled?1:0),l}function vr({useByteColors:n,ambientLight:e,pointLights:t=[],spotLights:i=[],directionalLights:o=[]}){const s=to();let r=0,a=0,l=0,c=0;for(const u of t){if(r>=fe)break;s[r]={...s[r],color:Ge(u,n),position:u.position,attenuation:u.attenuation||[1,0,0]},r++,a++}for(const u of i){if(r>=fe)break;s[r]={...s[r],color:Ge(u,n),position:u.position,direction:u.direction,attenuation:u.attenuation||[1,0,0],coneCos:Pr(u)},r++,l++}for(const u of o){if(r>=fe)break;s[r]={...s[r],color:Ge(u,n),direction:u.direction},r++,c++}return t.length+i.length+o.length>fe&&E.warn(`MAX_LIGHTS exceeded, truncating to ${fe}`)(),{ambientColor:Ge(e,n),directionalLightCount:c,pointLightCount:a,spotLightCount:l,lights:s}}function _r(n){const e={pointLights:[],spotLights:[],directionalLights:[]};for(const t of n||[])switch(t.type){case"ambient":e.ambientLight=t;break;case"directional":e.directionalLights?.push(t);break;case"point":e.pointLights?.push(t);break;case"spot":e.spotLights?.push(t);break}return e}function Ge(n={},e){const{color:t=[0,0,0],intensity:i=1}=n;return Jn(t,Xn(e,!0)).map(s=>s*i)}function Qe(){return{enabled:1,directionalLightCount:0,pointLightCount:0,spotLightCount:0,ambientColor:[.1,.1,.1],lights:to()}}function to(){return Array.from({length:fe},()=>xr())}function xr(){return{color:[1,1,1],position:[1,1,2],direction:[1,1,1],attenuation:[1,0,0],coneCos:[1,0]}}function Pr(n){const e=n.innerConeAngle??0,t=n.outerConeAngle??Math.PI/4;return[Math.cos(e),Math.cos(t)]}const io=`layout(std140) uniform phongMaterialUniforms {
  uniform bool unlit;
  uniform float ambient;
  uniform float diffuse;
  uniform float shininess;
  uniform vec3  specularColor;
} material;
`,no=`layout(std140) uniform phongMaterialUniforms {
  uniform bool unlit;
  uniform float ambient;
  uniform float diffuse;
  uniform float shininess;
  uniform vec3  specularColor;
} material;

vec3 lighting_getLightColor(vec3 surfaceColor, vec3 light_direction, vec3 view_direction, vec3 normal_worldspace, vec3 color) {
  vec3 halfway_direction = normalize(light_direction + view_direction);
  float lambertian = dot(light_direction, normal_worldspace);
  float specular = 0.0;
  if (lambertian > 0.0) {
    float specular_angle = max(dot(normal_worldspace, halfway_direction), 0.0);
    specular = pow(specular_angle, material.shininess);
  }
  lambertian = max(lambertian, 0.0);
  return (lambertian * material.diffuse * surfaceColor + specular * floatColors_normalize(material.specularColor)) * color;
}

vec3 lighting_getLightColor(vec3 surfaceColor, vec3 cameraPosition, vec3 position_worldspace, vec3 normal_worldspace) {
  vec3 lightColor = surfaceColor;

  if (material.unlit) {
    return surfaceColor;
  }

  if (lighting.enabled == 0) {
    return lightColor;
  }

  vec3 view_direction = normalize(cameraPosition - position_worldspace);
  lightColor = material.ambient * surfaceColor * lighting.ambientColor;

  for (int i = 0; i < lighting.pointLightCount; i++) {
    PointLight pointLight = lighting_getPointLight(i);
    vec3 light_position_worldspace = pointLight.position;
    vec3 light_direction = normalize(light_position_worldspace - position_worldspace);
    float light_attenuation = getPointLightAttenuation(pointLight, distance(light_position_worldspace, position_worldspace));
    lightColor += lighting_getLightColor(surfaceColor, light_direction, view_direction, normal_worldspace, pointLight.color / light_attenuation);
  }

  for (int i = 0; i < lighting.spotLightCount; i++) {
    SpotLight spotLight = lighting_getSpotLight(i);
    vec3 light_position_worldspace = spotLight.position;
    vec3 light_direction = normalize(light_position_worldspace - position_worldspace);
    float light_attenuation = getSpotLightAttenuation(spotLight, position_worldspace);
    lightColor += lighting_getLightColor(surfaceColor, light_direction, view_direction, normal_worldspace, spotLight.color / light_attenuation);
  }

  for (int i = 0; i < lighting.directionalLightCount; i++) {
    DirectionalLight directionalLight = lighting_getDirectionalLight(i);
    lightColor += lighting_getLightColor(surfaceColor, -directionalLight.direction, view_direction, normal_worldspace, directionalLight.color);
  }
  
  return lightColor;
}
`,oo=`struct phongMaterialUniforms {
  unlit: u32,
  ambient: f32,
  diffuse: f32,
  shininess: f32,
  specularColor: vec3<f32>,
};

@group(3) @binding(auto) var<uniform> phongMaterial : phongMaterialUniforms;

fn lighting_getLightColor(surfaceColor: vec3<f32>, light_direction: vec3<f32>, view_direction: vec3<f32>, normal_worldspace: vec3<f32>, color: vec3<f32>) -> vec3<f32> {
  let halfway_direction: vec3<f32> = normalize(light_direction + view_direction);
  var lambertian: f32 = dot(light_direction, normal_worldspace);
  var specular: f32 = 0.0;
  if (lambertian > 0.0) {
    let specular_angle = max(dot(normal_worldspace, halfway_direction), 0.0);
    specular = pow(specular_angle, phongMaterial.shininess);
  }
  lambertian = max(lambertian, 0.0);
  return (
    lambertian * phongMaterial.diffuse * surfaceColor +
    specular * floatColors_normalize(phongMaterial.specularColor)
  ) * color;
}

fn lighting_getLightColor2(surfaceColor: vec3<f32>, cameraPosition: vec3<f32>, position_worldspace: vec3<f32>, normal_worldspace: vec3<f32>) -> vec3<f32> {
  var lightColor: vec3<f32> = surfaceColor;

  if (phongMaterial.unlit != 0u) {
    return surfaceColor;
  }

  if (lighting.enabled == 0) {
    return lightColor;
  }

  let view_direction: vec3<f32> = normalize(cameraPosition - position_worldspace);
  lightColor = phongMaterial.ambient * surfaceColor * lighting.ambientColor;

  for (var i: i32 = 0; i < lighting.pointLightCount; i++) {
    let pointLight: PointLight = lighting_getPointLight(i);
    let light_position_worldspace: vec3<f32> = pointLight.position;
    let light_direction: vec3<f32> = normalize(light_position_worldspace - position_worldspace);
    let light_attenuation = getPointLightAttenuation(
      pointLight,
      distance(light_position_worldspace, position_worldspace)
    );
    lightColor += lighting_getLightColor(
      surfaceColor,
      light_direction,
      view_direction,
      normal_worldspace,
      pointLight.color / light_attenuation
    );
  }

  for (var i: i32 = 0; i < lighting.spotLightCount; i++) {
    let spotLight: SpotLight = lighting_getSpotLight(i);
    let light_position_worldspace: vec3<f32> = spotLight.position;
    let light_direction: vec3<f32> = normalize(light_position_worldspace - position_worldspace);
    let light_attenuation = getSpotLightAttenuation(spotLight, position_worldspace);
    lightColor += lighting_getLightColor(
      surfaceColor,
      light_direction,
      view_direction,
      normal_worldspace,
      spotLight.color / light_attenuation
    );
  }

  for (var i: i32 = 0; i < lighting.directionalLightCount; i++) {
    let directionalLight: DirectionalLight = lighting_getDirectionalLight(i);
    lightColor += lighting_getLightColor(surfaceColor, -directionalLight.direction, view_direction, normal_worldspace, directionalLight.color);
  }  
  
  return lightColor;
}

fn lighting_getSpecularLightColor(cameraPosition: vec3<f32>, position_worldspace: vec3<f32>, normal_worldspace: vec3<f32>) -> vec3<f32>{
  var lightColor = vec3<f32>(0, 0, 0);
  let surfaceColor = vec3<f32>(0, 0, 0);

  if (lighting.enabled != 0) {
    let view_direction = normalize(cameraPosition - position_worldspace);

    for (var i: i32 = 0; i < lighting.pointLightCount; i++) {
      let pointLight: PointLight = lighting_getPointLight(i);
      let light_position_worldspace: vec3<f32> = pointLight.position;
      let light_direction: vec3<f32> = normalize(light_position_worldspace - position_worldspace);
      let light_attenuation = getPointLightAttenuation(
        pointLight,
        distance(light_position_worldspace, position_worldspace)
      );
      lightColor += lighting_getLightColor(
        surfaceColor,
        light_direction,
        view_direction,
        normal_worldspace,
        pointLight.color / light_attenuation
      );
    }

    for (var i: i32 = 0; i < lighting.spotLightCount; i++) {
      let spotLight: SpotLight = lighting_getSpotLight(i);
      let light_position_worldspace: vec3<f32> = spotLight.position;
      let light_direction: vec3<f32> = normalize(light_position_worldspace - position_worldspace);
      let light_attenuation = getSpotLightAttenuation(spotLight, position_worldspace);
      lightColor += lighting_getLightColor(
        surfaceColor,
        light_direction,
        view_direction,
        normal_worldspace,
        spotLight.color / light_attenuation
      );
    }

    for (var i: i32 = 0; i < lighting.directionalLightCount; i++) {
        let directionalLight: DirectionalLight = lighting_getDirectionalLight(i);
        lightColor += lighting_getLightColor(surfaceColor, -directionalLight.direction, view_direction, normal_worldspace, directionalLight.color);
    }
  }
  return lightColor;
}
`,wr=[38.25,38.25,38.25],mi={props:{},name:"gouraudMaterial",bindingLayout:[{name:"gouraudMaterial",group:3}],vs:no.replace("phongMaterial","gouraudMaterial"),fs:io.replace("phongMaterial","gouraudMaterial"),source:oo.replaceAll("phongMaterial","gouraudMaterial"),defines:{LIGHTING_VERTEX:!0},dependencies:[eo,Qn],uniformTypes:{unlit:"i32",ambient:"f32",diffuse:"f32",shininess:"f32",specularColor:"vec3<f32>"},defaultUniforms:{unlit:!1,ambient:.35,diffuse:.6,shininess:32,specularColor:wr},getUniforms(n){return{...mi.defaultUniforms,...n}}},Lr=[38.25,38.25,38.25],so={name:"phongMaterial",firstBindingSlot:0,bindingLayout:[{name:"phongMaterial",group:3}],dependencies:[eo,Qn],source:oo,vs:io,fs:no,defines:{LIGHTING_FRAGMENT:!0},uniformTypes:{unlit:"i32",ambient:"f32",diffuse:"f32",shininess:"f32",specularColor:"vec3<f32>"},defaultUniforms:{unlit:!1,ambient:.35,diffuse:.6,shininess:32,specularColor:Lr},getUniforms(n){return{...so.defaultUniforms,...n}}},Sr=`

@must_use
fn deckgl_premultiplied_alpha(fragColor: vec4<f32>) -> vec4<f32> {
    return vec4(fragColor.rgb * fragColor.a, fragColor.a); 
};
`,Ue={name:"color",dependencies:[],source:Sr,getUniforms:n=>({})},Cr=`// Define a structure to hold both the clip-space position and the common position.
struct ProjectResult {
  clipPosition: vec4<f32>,
  commonPosition: vec4<f32>,
};

// This function mimics the GLSL version with the 'out' parameter by returning both values.
fn project_position_to_clipspace_and_commonspace(
    position: vec3<f32>,
    position64Low: vec3<f32>,
    offset: vec3<f32>
) -> ProjectResult {
  // Compute the projected position.
  let projectedPosition: vec3<f32> = project_position_vec3_f64(position, position64Low);

  // Start with the provided offset.
  var finalOffset: vec3<f32> = offset;

  // Get whether a rotation is needed and the rotation matrix.
  let rotationResult = project_needs_rotation(projectedPosition);

  // If rotation is needed, update the offset.
  if (rotationResult.needsRotation) {
    finalOffset = rotationResult.transform * offset;
  }

  // Compute the common position.
  let commonPosition: vec4<f32> = vec4<f32>(projectedPosition + finalOffset, 1.0);

  // Convert to clip-space.
  let clipPosition: vec4<f32> = project_common_position_to_clipspace(commonPosition);

  return ProjectResult(clipPosition, commonPosition);
}

// A convenience overload that returns only the clip-space position.
fn project_position_to_clipspace(
    position: vec3<f32>,
    position64Low: vec3<f32>,
    offset: vec3<f32>
) -> vec4<f32> {
  return project_position_to_clipspace_and_commonspace(position, position64Low, offset).clipPosition;
}
`,Ar=`vec4 project_position_to_clipspace(
  vec3 position, vec3 position64Low, vec3 offset, out vec4 commonPosition
) {
  vec3 projectedPosition = project_position(position, position64Low);
  mat3 rotation;
  if (project_needs_rotation(projectedPosition, rotation)) {
    // offset is specified as ENU
    // when in globe projection, rotate offset so that the ground alighs with the surface of the globe
    offset = rotation * offset;
  }
  commonPosition = vec4(projectedPosition + offset, 1.0);
  return project_common_position_to_clipspace(commonPosition);
}

vec4 project_position_to_clipspace(
  vec3 position, vec3 position64Low, vec3 offset
) {
  vec4 commonPosition;
  return project_position_to_clipspace(position, position64Low, offset, commonPosition);
}
`,_e={name:"project32",dependencies:[Vn],source:Cr,vs:Ar},ht=10,gt=16777215;function Er(n,e){n.length===ht?H.warn(`pickMultipleObjects can only exclude ${ht} previously picked objects for layers without picking buffers`)():n.push(e)}const Ir=`  float disabledPickingIndexCount;
  vec4 disabledPickingIndices0;
  vec4 disabledPickingIndices1;
  vec4 disabledPickingIndices2;
`;function $i(n){return n.replace(`  vec4 highlightColor;
} picking;`,`  vec4 highlightColor;
${Ir}} picking;`)}function Tt(n,e){return[n[e]||0,n[e+1]||0,n[e+2]||0,n[e+3]||0]}const Tr=`vec3 picking_getPickingColorFromIndex(float objectIndex) {
  if (objectIndex < 0.0 || objectIndex >= ${gt}.0) {
    return vec3(0.0);
  }

  for (int i = 0; i < ${ht}; i++) {
    if (float(i) >= picking.disabledPickingIndexCount) {
      break;
    }
    vec4 disabledIndices = i < 4
      ? picking.disabledPickingIndices0
      : (i < 8 ? picking.disabledPickingIndices1 : picking.disabledPickingIndices2);
    float disabledIndex = disabledIndices[i - (i / 4) * 4];
    if (disabledIndex == objectIndex) {
      return vec3(0.0);
    }
  }

  float encodedIndex = objectIndex + 1.0;
  return vec3(
    mod(encodedIndex, 256.0),
    mod(floor(encodedIndex / 256.0), 256.0),
    mod(floor(encodedIndex / 65536.0), 256.0)
  );
}

vec3 picking_getPickingColorFromIndex(uint objectIndex) {
  return picking_getPickingColorFromIndex(float(objectIndex));
}

vec3 picking_getPickingColorFromInstanceID() {
  return picking_getPickingColorFromIndex(float(gl_InstanceID));
}

void picking_setPickingColorFromInstanceID() {
  picking_setPickingColor(picking_getPickingColorFromInstanceID());
}
`,Br=`struct pickingUniforms {
  isActive: f32,
  isAttribute: f32,
  isHighlightActive: f32,
  useByteColors: f32,
  highlightedObjectColor: vec3<f32>,
  highlightColor: vec4<f32>,
  disabledPickingIndexCount: f32,
  disabledPickingIndices0: vec4<f32>,
  disabledPickingIndices1: vec4<f32>,
  disabledPickingIndices2: vec4<f32>,
};

@group(0) @binding(auto) var<uniform> picking: pickingUniforms;

fn picking_normalizeColor(color: vec3<f32>) -> vec3<f32> {
  return select(color, color / 255.0, picking.useByteColors > 0.5);
}

fn picking_normalizeColor4(color: vec4<f32>) -> vec4<f32> {
  return select(color, color / 255.0, picking.useByteColors > 0.5);
}

fn picking_isColorZero(color: vec3<f32>) -> bool {
  return dot(color, vec3<f32>(1.0)) < 0.00001;
}

fn picking_isColorValid(color: vec3<f32>) -> bool {
  return dot(color, vec3<f32>(1.0)) > 0.00001;
}

fn picking_getPickingColorFromIndex(objectIndex: u32) -> vec3<f32> {
  if (objectIndex >= ${gt}u) {
    return vec3<f32>(0.0);
  }

  for (var i = 0; i < ${ht}; i = i + 1) {
    if (f32(i) >= picking.disabledPickingIndexCount) {
      break;
    }
    let disabledIndices = select(
      picking.disabledPickingIndices2,
      select(picking.disabledPickingIndices1, picking.disabledPickingIndices0, i < 4),
      i < 8
    );
    let disabledIndex = disabledIndices[i % 4];
    if (disabledIndex == f32(objectIndex)) {
      return vec3<f32>(0.0);
    }
  }

  let encodedIndex = objectIndex + 1u;
  return vec3<f32>(
    f32(encodedIndex % 256u),
    f32((encodedIndex / 256u) % 256u),
    f32((encodedIndex / 65536u) % 256u)
  ) / 255.0;
}
`,Fe={...me,vs:`${$i(me.vs)}
${Tr}`,fs:$i(me.fs),source:Br,uniformTypes:{...me.uniformTypes,disabledPickingIndexCount:"f32",disabledPickingIndices0:"vec4<f32>",disabledPickingIndices1:"vec4<f32>",disabledPickingIndices2:"vec4<f32>"},defaultUniforms:{...me.defaultUniforms,useByteColors:!0,disabledPickingIndexCount:0,disabledPickingIndices0:[0,0,0,0],disabledPickingIndices1:[0,0,0,0],disabledPickingIndices2:[0,0,0,0]},getUniforms(n,e){const t=me.getUniforms(n,e),i=n.disabledPickingIndices||[];return t.disabledPickingIndexCount=i.length,t.disabledPickingIndices0=Tt(i,0),t.disabledPickingIndices1=Tt(i,4),t.disabledPickingIndices2=Tt(i,8),t},inject:{"vs:DECKGL_FILTER_GL_POSITION":`
    // for picking depth values
    picking_setPickingAttribute(position.z / position.w);
  `,"vs:DECKGL_FILTER_COLOR":`
  picking_setPickingColor(geometry.pickingColor);
  `,"fs:DECKGL_FILTER_COLOR":{order:99,injection:`
  // use highlight color if this fragment belongs to the selected object.
  color = picking_filterHighlightColor(color);

  // use picking color if rendering to picking FBO.
  color = picking_filterPickingColor(color);
    `}}},Wi=[0,0,0];function Bt(n,e,t=!1){const i=e.projectPosition(n);if(t&&e instanceof Gn){const[o,s,r=0]=n,a=e.getDistanceScales([o,s]);i[2]=r*a.unitsPerMeter[2]}return i}function Or(n){const{viewport:e,modelMatrix:t,coordinateOrigin:i}=n;let{coordinateSystem:o,fromCoordinateSystem:s,fromCoordinateOrigin:r}=n;return o==="default"&&(o=e.isGeospatial?"lnglat":"cartesian"),s===void 0?s=o:s==="default"&&(s=e.isGeospatial?"lnglat":"cartesian"),r===void 0&&(r=i),{viewport:e,coordinateSystem:o,coordinateOrigin:i,modelMatrix:t,fromCoordinateSystem:s,fromCoordinateOrigin:r}}function yi(n,{viewport:e,modelMatrix:t,coordinateSystem:i,coordinateOrigin:o,offsetMode:s}){let[r,a,l=0]=n;switch(t&&([r,a,l]=us([],[r,a,l,1],t)),i){case"default":return yi(n,{viewport:e,modelMatrix:t,coordinateSystem:e.isGeospatial?"lnglat":"cartesian",coordinateOrigin:o,offsetMode:s});case"lnglat":return Bt([r,a,l],e,s);case"lnglat-offsets":return Bt([r+o[0],a+o[1],l+(o[2]||0)],e,s);case"meter-offsets":return Bt(fs(o,[r,a,l]),e,s);case"cartesian":return e.isGeospatial?[r+o[0],a+o[1],l+o[2]]:e.projectPosition([r,a,l]);default:throw new Error(`Invalid coordinateSystem: ${i}`)}}function Rr(n,e){const{viewport:t,coordinateSystem:i,coordinateOrigin:o,modelMatrix:s,fromCoordinateSystem:r,fromCoordinateOrigin:a}=Or(e),{autoOffset:l=!0}=e,{geospatialOrigin:c=Wi,shaderCoordinateOrigin:u=Wi,offsetMode:f=!1}=l?ds(t,i,o):{},h=yi(n,{viewport:t,modelMatrix:s,coordinateSystem:r,coordinateOrigin:a,offsetMode:f});if(f){const g=t.projectPosition(c||u);hs(h,h,g)}return h}const Ot={};function ke(n="id"){Ot[n]=Ot[n]||1;const e=Ot[n]++;return`${n}-${e}`}class le{id;topology;vertexCount;indices;attributes;bufferLayout;userData={};constructor(e){const{attributes:t={},indices:i=null,vertexCount:o=null}=e;this.id=e.id||ke("geometry"),this.topology=e.topology,i&&(this.indices=ArrayBuffer.isView(i)?{value:i,size:1}:i),this.attributes={};for(const[s,r]of Object.entries(t)){const a=ArrayBuffer.isView(r)?{value:r}:r;if(!ArrayBuffer.isView(a.value))throw new Error(`${this._print(s)}: must be typed array or object with value as typed array`);if((s==="POSITION"||s==="positions")&&!a.size&&(a.size=3),s==="indices"){if(this.indices)throw new Error("Multiple indices detected");this.indices=a}else{const l=De(s),c=Object.keys(this.attributes).find(u=>De(u)===l);c&&delete this.attributes[c],this.attributes[s]=a}}this.indices&&this.indices.isIndexed!==void 0&&(this.indices=Object.assign({},this.indices),delete this.indices.isIndexed),this.vertexCount=o||this._calculateVertexCount(this.attributes,this.indices),this.bufferLayout=e.bufferLayout||Mr(this.attributes)}getVertexCount(){return this.vertexCount}getAttributes(){return this.indices?{indices:this.indices,...this.attributes}:this.attributes}_print(e){return`Geometry ${this.id} attribute ${e}`}_setAttributes(e,t){return this}_calculateVertexCount(e,t){if(t)return t.value.length;let i=1/0;for(const o of Object.values(e)){if(!o)continue;const{value:s,size:r,constant:a}=o;!a&&s&&r!==void 0&&r>=1&&(i=Math.min(i,s.length/r))}return i}}function De(n){switch(n){case"POSITION":return"positions";case"NORMAL":return"normals";case"TEXCOORD_0":return"texCoords";case"TEXCOORD_1":return"texCoords1";case"COLOR_0":return"colors";default:return n}}function Mr(n){const e=[];for(const[t,i]of Object.entries(n)){if(!i)continue;const{value:o,size:s,normalized:r}=i;if(s===void 0)throw new Error(`Attribute ${t} is missing a size`);e.push({name:De(t),format:ie.getVertexFormatFromAttribute(o,s,r)})}return e}function et(n,e={}){const t=e.bufferName||"geometry";if(Dr(n,t))return n;const i=e.minAttributeAlignment||4,o=Nr(n,e.attributes),s=[];let r=0,a=1/0;for(const[u,f]of o){if(!f)continue;if(f.constant)throw new Error(`Attribute ${u} is constant`);const{value:h,size:g,normalized:y}=f;if(!ArrayBuffer.isView(h))throw new Error(`Attribute ${u} is missing typed array data`);if(g===void 0)throw new Error(`Attribute ${u} is missing a size`);const b=ie.getVertexFormatFromAttribute(h,g,y),w=ie.getVertexFormatInfo(b);r=Hi(r,i),s.push({sourceName:u,attributeName:De(u),value:h,size:g,format:b,byteOffset:r,byteLength:w.byteLength}),r+=w.byteLength;const S=h.length/g;if(!Number.isInteger(S))throw new Error(`Attribute ${u} length is not divisible by size`);a=Math.min(a,S)}if(s.length===0||!Number.isFinite(a))throw new Error(`Geometry ${n.id} has no interleavable attributes`);const l=Hi(r,i),c=new ArrayBuffer(a*l);for(const u of s)Ur(c,a,l,u);return new le({id:n.id,topology:n.topology||"triangle-list",vertexCount:n.vertexCount,indices:n.indices,attributes:{[t]:{value:new Uint8Array(c),size:l,byteStride:l}},bufferLayout:[{name:t,stepMode:"vertex",byteStride:l,attributes:s.map(u=>({attribute:u.attributeName,format:u.format,byteOffset:u.byteOffset}))}]})}function Dr(n,e){if(n.bufferLayout.length!==1)return!1;const t=n.bufferLayout[0];return t.name===e&&!!t.attributes?.length&&!!n.attributes[e]}function Nr(n,e){return e?e.map(t=>[t,n.attributes[t]]):Object.entries(n.attributes)}function Ur(n,e,t,i){const o=i.value.constructor,s=o.BYTES_PER_ELEMENT;if(i.byteOffset%s!==0||t%s!==0)throw new Error(`Attribute ${i.sourceName} is not aligned to its component type`);const r=new o(n),a=i.value,l=i.byteOffset/s,c=t/s;for(let u=0;u<e;u++){const f=u*i.size,h=u*c+l;for(let g=0;g<i.size;g++)r[h+g]=a[f+g]}}function Hi(n,e){return Math.ceil(n/e)*e}class Yi{id;userData={};topology;bufferLayout=[];vertexCount;indices;attributes;constructor(e){if(this.id=e.id||ke("geometry"),this.topology=e.topology,this.indices=e.indices||null,this.attributes=e.attributes,this.vertexCount=e.vertexCount,this.bufferLayout=e.bufferLayout||[],this.indices&&!(this.indices.usage&D.INDEX))throw new Error("Index buffer must have INDEX usage")}destroy(){this.indices?.destroy();for(const e of Object.values(this.attributes))e.destroy()}getVertexCount(){return this.vertexCount}getAttributes(){return this.attributes}getIndexes(){return this.indices||null}_calculateVertexCount(e){return e.byteLength/12}}function Fr(n,e){if(e instanceof Yi)return e;const t=et(e),i=kr(n,t),{attributes:o,bufferLayout:s}=zr(n,t);return new Yi({topology:t.topology||"triangle-list",bufferLayout:s,vertexCount:t.vertexCount,indices:i,attributes:o})}function kr(n,e){if(!e.indices)return;const t=e.indices.value;return n.createBuffer({usage:D.INDEX,data:t})}function zr(n,e){const t={};for(const[i,o]of Object.entries(e.attributes)){const s=e.bufferLayout.find(r=>r.name===i)?.name||De(i);o&&(t[s]=n.createBuffer({data:o.value,id:`${i}-buffer`}))}return{attributes:t,bufferLayout:e.bufferLayout,vertexCount:e.vertexCount}}function Vr(n,e){const t={},i="Values";if(n.attributes.length===0&&!n.varyings?.length)return{"No attributes or varyings":{[i]:"N/A"}};for(const o of n.attributes)if(o){const s=`${o.location} ${o.name}: ${o.type}`;t[`in ${s}`]={[i]:o.stepMode||"vertex"}}for(const o of n.varyings||[]){const s=`${o.location} ${o.name}`;t[`out ${s}`]={[i]:JSON.stringify(o)}}return t}const qi="__debugFramebufferState",Rt=8;function Gr(n,e,t){if(n.device.type!=="webgl")return;const i=Wr(n.device);if(!i.flushing){if(Yr(n)){jr(n,t,i);return}e&&Hr(e)&&e.handle!==null&&(i.queuedFramebuffers.includes(e)||i.queuedFramebuffers.push(e))}}function jr(n,e,t){if(t.queuedFramebuffers.length===0)return;const i=n.device,{gl:o}=i,s=o.getParameter(36010),r=o.getParameter(36006),[a,l]=n.device.getDefaultCanvasContext().getDrawingBufferSize();let c=Zi(e.top,Rt);const u=Zi(e.left,Rt);t.flushing=!0;try{for(const f of t.queuedFramebuffers){const[h,g,y,b,w]=$r({framebuffer:f,targetWidth:a,targetHeight:l,topPx:c,leftPx:u,minimap:e.minimap});o.bindFramebuffer(36008,f.handle),o.bindFramebuffer(36009,null),o.blitFramebuffer(0,0,f.width,f.height,h,g,y,b,16384,9728),c+=w+Rt}}finally{o.bindFramebuffer(36008,s),o.bindFramebuffer(36009,r),t.flushing=!1}}function $r(n){const{framebuffer:e,targetWidth:t,targetHeight:i,topPx:o,leftPx:s}=n,r=Math.max(Math.floor(t/4),1),a=Math.max(Math.floor(i/4),1),l=Math.min(r/e.width,a/e.height),c=Math.max(Math.floor(e.width*l),1),u=Math.max(Math.floor(e.height*l),1),f=s,h=Math.max(i-o-u,0),g=f+c,y=h+u;return[f,h,g,y,u]}function Wr(n){return n.userData[qi]||={flushing:!1,queuedFramebuffers:[]},n.userData[qi]}function Hr(n){return"colorAttachments"in n}function Yr(n){const e=n.props.framebuffer;return!e||e.handle===null}function Zi(n,e){if(!n)return e;const t=Number.parseInt(n,10);return Number.isFinite(t)?t:e}function Be(n,e,t){if(n===e)return!0;if(!t||!n||!e)return!1;if(Array.isArray(n)){if(!Array.isArray(e)||n.length!==e.length)return!1;for(let i=0;i<n.length;i++)if(!Be(n[i],e[i],t-1))return!1;return!0}if(Array.isArray(e))return!1;if(typeof n=="object"&&typeof e=="object"){const i=Object.keys(n),o=Object.keys(e);if(i.length!==o.length)return!1;for(const s of i)if(!e.hasOwnProperty(s)||!Be(n[s],e[s],t-1))return!1;return!0}return!1}class Mt{bufferLayouts;constructor(e){this.bufferLayouts=e}getBufferLayout(e){return this.bufferLayouts.find(t=>t.name===e)||null}getAttributeNamesForBuffer(e){return Zt(e)}mergeBufferLayouts(e,t){const i=[...e];for(const o of t){const s=i.findIndex(r=>r.name===o.name);s<0?i.push(o):i[s]=o}return i}}function qr(n,e){const t=Is(n),i=e.slice();return i.sort((o,s)=>{const r=Fi(Zt(o).map(l=>t[l])),a=Fi(Zt(s).map(l=>t[l]));return r-a}),i}function pt(n,e){if(!n||!e.some(i=>i.bindingLayout?.length))return n;const t={...n,bindings:n.bindings.map(i=>({...i}))};"attributes"in(n||{})&&(t.attributes=n?.attributes||[]);for(const i of e)for(const o of i.bindingLayout||[])for(const s of Xr(o.name)){const r=t.bindings.find(a=>a.name===s);r?.group===0&&(r.group=o.group),r&&o.visibility!==void 0&&(r.visibility=o.visibility)}return t}function Zr(n,e,t=[]){return n?e?{...n,attributes:n.attributes.length?ea(n.attributes,e.attributes.filter(i=>t.includes(i.name))):e.attributes,bindings:Qr(n.bindings,e.bindings)}:n:e}function bi(n){return!!(n.uniformTypes&&!Jr(n.uniformTypes))}function Kr(n){const e=[];for(const t of n){const i=gs(t),o=new Set([t.vs,t.fs].flatMap(r=>r?ps(r).filter(a=>a.isStd140).map(a=>a.blockName):[])),s=o.has(i)?i:o.size===1?o.values().next().value:void 0;bi(t)&&s&&e.push({name:s,uniformTypes:t.uniformTypes})}return e}function ro(n,e){const t=[],i=new Set;for(const o of[...n||[],...e||[]])i.has(o.name)||(i.add(o.name),t.push(o));return t}function Xr(n){const e=new Set([n,`${n}Uniforms`]);return n.endsWith("Uniforms")||e.add(`${n}Sampler`),[...e]}function Jr(n){for(const e in n)return!1;return!0}function Qr(n,e){const t=n.map(s=>({...s})),i=new Set(n.map(s=>s.name)),o=new Set(n.map(s=>`${s.group}:${s.location}`));for(const s of e){const r=`${s.group}:${s.location}`;!i.has(s.name)&&!o.has(r)&&t.push({...s})}return t}function ea(n,e){const t=n.map(s=>({...s})),i=new Map(n.map(s=>[s.name,s])),o=new Map(n.map(s=>[s.location,s]));for(const s of e){const r=i.get(s.name);if(r){if(r.type!==s.type||r.location!==s.location)throw new Error(`Shader attribute "${s.name}" conflicts with its inferred type or location`);continue}const a=o.get(s.location);if(a)throw new Error(`Shader attributes "${a.name}" and "${s.name}" both use location ${s.location}`);t.push({...s})}return t}function ta(n){return Hn(n)||typeof n=="number"||typeof n=="boolean"}function ia(n,e={}){const t={bindings:{},uniforms:{}};return Object.keys(n).forEach(i=>{const o=n[i];Object.prototype.hasOwnProperty.call(e,i)||ta(o)?t.uniforms[i]=o:t.bindings[i]=o}),t}class ao{options={disableWarnings:!1};modules;moduleUniforms;moduleBindings;directBindings={};constructor(e,t){Object.assign(this.options,t);const i=Ni(Object.values(e).filter(na));for(const o of i)e[o.name]=o;E.log(1,"Creating ShaderInputs with modules",Object.keys(e))(),this.modules=e,this.moduleUniforms={},this.moduleBindings={};for(const[o,s]of Object.entries(e))s&&(this._addModule(s),s.name&&o!==s.name&&!this.options.disableWarnings&&E.warn(`Module name: ${o} vs ${s.name}`)())}destroy(){}setProps(e){e.bindings&&Object.assign(this.directBindings,e.bindings);for(const t of Object.keys(e)){if(t==="bindings")continue;const i=t,o=e[i]||{},s=this.modules[i];if(!s)this.options.disableWarnings||E.warn(`Module ${t} not found`)();else{const r=this.moduleUniforms[i],a=this.moduleBindings[i],l=s.getUniforms?.(o,r)||o,{uniforms:c,bindings:u}=ia(l,s.uniformTypes);this.moduleUniforms[i]=Ki(r,c,s.uniformTypes),this.moduleBindings[i]={...a,...u}}}}getModules(){return Object.values(this.modules)}addModules(e){const t=Ni(e);for(const i of t){const o=i.name;this.modules[o]||(this.modules[o]=i,this._addModule(i))}}getUniformValues(){return this.moduleUniforms}getBindingValues(){const e={};for(const t of Object.values(this.moduleBindings))Object.assign(e,t);return Object.assign(e,this.directBindings),e}getModuleBindingValues(e){const t=this.moduleBindings[e];return t?{...t}:{}}getDebugTable(){const e={};for(const[t,i]of Object.entries(this.moduleUniforms))for(const[o,s]of Object.entries(i))e[`${t}.${o}`]={type:this.modules[t].uniformTypes?.[o],value:String(s)};return e}_addModule(e){const t=e.name;this.moduleUniforms[t]=Ki({},e.defaultUniforms||{},e.uniformTypes),this.moduleBindings[t]={}}}function Ki(n={},e={},t={}){const i={...n};for(const[o,s]of Object.entries(e))s!==void 0&&(i[o]=Xt(n[o],s,t[o]));return i}function Xt(n,e,t){if(!t||typeof t=="string")return Oe(e);if(Array.isArray(t)){if(Jt(e)||!Array.isArray(e))return Oe(e);const r=Array.isArray(n)&&!Jt(n)?[...n]:[],a=r.slice();for(let l=0;l<e.length;l++){const c=e[l];c!==void 0&&(a[l]=Xt(r[l],c,t[0]))}return a}if(!Qt(e))return Oe(e);const i=t,o=Qt(n)?n:{},s={...o};for(const[r,a]of Object.entries(e))a!==void 0&&(s[r]=Xt(o[r],a,i[r]));return s}function Oe(n){return ArrayBuffer.isView(n)?Array.prototype.slice.call(n):Array.isArray(n)?Jt(n)?n.slice():n.map(t=>t===void 0?void 0:Oe(t)):Qt(n)?Object.fromEntries(Object.entries(n).map(([e,t])=>[e,t===void 0?void 0:Oe(t)])):n}function Jt(n){return ArrayBuffer.isView(n)||Array.isArray(n)&&(n.length===0||typeof n[0]=="number")}function Qt(n){return!!n&&typeof n=="object"&&!Array.isArray(n)&&!ArrayBuffer.isView(n)}function na(n){return!!n?.dependencies}const oa=D.DEBUG_DATA_MAX_LENGTH;class ee{device;id;ready;usage;props;isReady=!0;destroyed=!1;generation=0;updateTimestamp;debugData=new ArrayBuffer(0);_debugDataEnabled;_maxDebugDataByteLength;_ownsBuffer;_buffer;get buffer(){return this._buffer}get byteLength(){return this._buffer.byteLength}get[Symbol.toStringTag](){return"DynamicBuffer"}toString(){return`DynamicBuffer:"${this.id}":${this.byteLength}B`}toJSON(){return this.toString()}constructor(e,t){const{debugData:i=!1,buffer:o,ownsBuffer:s=!0,...r}=t;if(o&&o.device!==e)throw new Error("DynamicBuffer adopted buffers must belong to the supplied device");if(o&&(r.byteLength!==void 0||r.data!==void 0))throw new Error("DynamicBuffer cannot combine an adopted buffer with byteLength or data");const a=t.id||o?.id||ke("dynamic-buffer"),l={...r,id:a,usage:r.usage??o?.usage,indexType:r.indexType??o?.indexType};(l.usage||0)&D.INDEX&&!l.indexType&&(r.data instanceof Uint32Array?l.indexType="uint32":r.data instanceof Uint16Array?l.indexType="uint16":r.data instanceof Uint8Array&&(l.indexType="uint8")),delete l.data,delete l.byteOffset,this.device=e,this.id=a,this.props=l,this.usage=l.usage||0,this._debugDataEnabled=!!i,this._maxDebugDataByteLength=typeof i=="object"&&i.maxByteLength!==void 0?i.maxByteLength:oa,this._ownsBuffer=s,this._buffer=o??this.device.createBuffer({...r,id:a}),this.ready=Promise.resolve(this._buffer),this.updateTimestamp=this._buffer.updateTimestamp,this._resetDebugData(this._buffer.byteLength),r.data&&this._writeDebugData(r.data,r.byteOffset||0)}write(e,t=0){this._buffer.write(e,t),this._touch(),this._writeDebugData(e,t)}async mapAndWriteAsync(e,t=0,i=this.byteLength-t){let o=null;await this._buffer.mapAndWriteAsync(async(s,r)=>{await e(s,r),o=new Uint8Array(s.slice(0,i))},t,i),this._touch(),o&&this._writeDebugData(o,t)}async readAsync(e=0,t=this.byteLength-e){const i=await this._buffer.readAsync(e,t);return this._writeDebugData(i,e)&&this._touch(),i}async mapAndReadAsync(e,t=0,i=this.byteLength-t){let o=null;const s=await this._buffer.mapAndReadAsync(async(r,a)=>(o=new Uint8Array(r.slice(0)),await e(r,a)),t,i);return o&&this._writeDebugData(o,t)&&this._touch(),s}resize(e){const{byteLength:t,preserveData:i=!1}=e;if(t===this.byteLength)return!1;const o=Math.min(e.copyByteLength??Math.min(this.byteLength,t),this.byteLength,t),s=this._buffer,r=this.debugData.slice(0),{data:a,byteOffset:l,...c}=this.props,u=this.device.createBuffer({...c,byteLength:t});return i&&o>0&&this._copyBufferContents(s,u,o),this._buffer=u,this._resetDebugData(t),i&&r.byteLength>0&&this._writeDebugData(r,0),this._ownsBuffer&&s.destroy(),this._ownsBuffer=!0,this.generation++,this._touch(),!0}ensureSize(e,t){return e<=this.byteLength?!1:this.resize({byteLength:e,preserveData:t?.preserveData})}getBinding(e){return e?.offset===void 0&&e?.size===void 0?this._buffer:{buffer:this._buffer,offset:e?.offset,size:e?.size}}destroy(){this.destroyed||(this._ownsBuffer&&this._buffer.destroy(),this.destroyed=!0,this.debugData=new ArrayBuffer(0))}_copyBufferContents(e,t,i){const o=this.device.type==="webgpu"?Math.ceil(i/4)*4:i,s=this.device.createCommandEncoder();s.copyBufferToBuffer({sourceBuffer:e,destinationBuffer:t,size:o}),this.device.submit(s.finish())}_touch(){this.updateTimestamp=this.device.incrementTimestamp()}_resetDebugData(e){if(!this._debugDataEnabled){this.debugData=new ArrayBuffer(0);return}this.debugData=new ArrayBuffer(Math.min(e,this._maxDebugDataByteLength))}_writeDebugData(e,t){if(!this._debugDataEnabled||this.debugData.byteLength===0||t>=this.debugData.byteLength)return!1;const i=ArrayBuffer.isView(e)?new Uint8Array(e.buffer,e.byteOffset,e.byteLength):new Uint8Array(e),o=new Uint8Array(this.debugData),s=Math.min(i.byteLength,o.byteLength-t);return o.set(i.subarray(0,s),t),s>0}}function lo(n){return n!==null&&typeof n=="object"&&"buffer"in n}function sa(n){return n instanceof ee?n.buffer:n}function ra(n){return{buffer:sa(n.buffer),offset:n.offset,size:n.size}}function tt(n){return n!==null&&typeof n=="object"&&"resolveTextureBinding"in n&&typeof n.resolveTextureBinding=="function"}function aa(n){return n?.type==="texture"||n?.type==="external-texture"}function la(n,e,t){const i=Ts(n,e,{ignoreWarnings:!0});return aa(i)?i:n.bindings.length===0&&t?.fallbackGroup!==void 0?{type:"texture",name:e,group:t.fallbackGroup,location:0}:null}const Q=2,ca=1e4,Dt="render pipeline initialization failed",ua=["stencil8","depth16unorm","depth24plus","depth24plus-stencil8","depth32float","depth32float-stencil8"];class j{static defaultProps={...Ie.defaultProps,source:void 0,vs:null,fs:null,id:"unnamed",handle:void 0,userData:{},defines:{},modules:[],plugins:[],geometry:null,indexBuffer:null,indexCount:void 0,firstVertex:0,firstIndex:0,attributes:{},constantAttributes:{},bindings:{},uniforms:{},varyings:[],isInstanced:void 0,instanceCount:0,vertexCount:0,shaderInputs:void 0,material:void 0,pipelineFactory:void 0,shaderFactory:void 0,transformFeedback:void 0,shaderAssembler:qt.getDefaultShaderAssembler("glsl"),debugShaders:void 0,disableWarnings:void 0};device;id;source;vs;fs;pipelineFactory;shaderFactory;userData={};parameters;topology;bufferLayout;isInstanced=void 0;instanceCount=0;vertexCount;indexCount;firstVertex;firstIndex;indexBuffer=null;bufferAttributes={};constantAttributes={};bindings={};vertexArray;transformFeedback=null;pipeline;shaderInputs;material=null;_uniformStore;_attributeInfos={};_gpuGeometry=null;props;_dynamicIndexBufferSource=null;_dynamicAttributeBufferSources={};_colorAttachmentFormats;_depthStencilAttachmentFormat;_pipelineNeedsUpdate="newly created";_needsRedraw="initializing";_drawBlockedReason=!1;_destroyed=!1;_vertexCountSet=!1;_lastDrawTimestamp=-1;_bindingTable=[];get[Symbol.toStringTag](){return"Model"}toString(){return`Model(${this.id})`}constructor(e,t){const i=j.defaultProps.shaderAssembler,o=t.vertexCount!==void 0;this.props={...j.defaultProps,...t,shaderAssembler:t.shaderAssembler??(Nt(i,e.info.shadingLanguage)?i:qt.getDefaultShaderAssembler(e.info.shadingLanguage))},this._vertexCountSet=o,t=this.props,this.id=t.id||ke("model"),this.device=e,Object.assign(this.userData,t.userData),this.material=t.material||null;const s=pa(e),r=qn(this.props.plugins,s.shaderLanguage),a=Zn(this.props.modules,r.modules),l=Object.fromEntries(a.map(g=>[g.name,g])),c=t.shaderInputs||new ao(l,{disableWarnings:this.props.disableWarnings});t.shaderInputs&&r.modules.length>0&&c.addModules(r.modules),this.setShaderInputs(c);const u=ro(this.props.modules,c.getModules()),f={...r.defines,...this.props.defines};if(this.device.type==="webgl"&&(this.props._uniformBlockLayouts=Kr(u)),this.props.shaderLayout=pt(this.props.shaderLayout,u)||null,this.device.type==="webgpu"&&this.props.source){const g=this.props.shaderAssembler;Kt(Nt(g,"wgsl"));const{source:y,getUniforms:b,bindingTable:w,shaderLayout:S}=g.assembleWGSLShader({platformInfo:s,...this.props,modules:u,defines:f,pluginInjections:r.injections,pluginVertexInputs:r.vertexInputs,pluginVaryings:r.varyings});this.source=y,this._getModuleUniforms=b,this._bindingTable=w;const A=S??e.getShaderLayout?.(this.source),L=fa(A,r.vertexInputs),B=Zr(this.props.shaderLayout,L,Object.keys(r.vertexInputs));this.props.shaderLayout=pt(B||null,u)||null}else{const g=this.props.shaderAssembler;Kt(Nt(g,"glsl"));const{vs:y,fs:b,getUniforms:w}=g.assembleGLSLShaderPair({platformInfo:s,...this.props,modules:u,defines:f,pluginInjections:r.injections,pluginVertexInputs:r.vertexInputs,pluginVaryings:r.varyings});this.vs=y,this.fs=b,this._getModuleUniforms=w,this._bindingTable=[]}this.vertexCount=this.props.vertexCount,this.indexCount=this.props.indexCount,this.firstVertex=this.props.firstVertex,this.firstIndex=this.props.firstIndex,this.instanceCount=this.props.instanceCount,this.topology=this.props.topology,this.bufferLayout=this.props.bufferLayout,this.parameters=this.props.parameters,this._colorAttachmentFormats=this.props.colorAttachmentFormats,this._depthStencilAttachmentFormat=this.props.depthStencilAttachmentFormat,t.geometry&&this.setGeometry(t.geometry),this.pipelineFactory=t.pipelineFactory||Pt.getDefaultPipelineFactory(this.device),this.shaderFactory=t.shaderFactory||wt.getDefaultShaderFactory(this.device),this.pipeline=this._updatePipeline(),this.vertexArray=e.createVertexArray({shaderLayout:this.pipeline.shaderLayout,bufferLayout:this.pipeline.bufferLayout}),this._gpuGeometry&&this._setGeometryAttributes(this._gpuGeometry),"isInstanced"in t&&(this.isInstanced=t.isInstanced),t.instanceCount&&this.setInstanceCount(t.instanceCount),t.vertexCount&&this.setVertexCount(t.vertexCount),t.indexBuffer&&this.setIndexBuffer(t.indexBuffer),t.attributes&&this.setAttributes(t.attributes),t.constantAttributes&&this.setConstantAttributes(t.constantAttributes),t.bindings&&this.setBindings(t.bindings),t.transformFeedback&&(this.transformFeedback=t.transformFeedback)}destroy(){this._destroyed||(this.pipelineFactory.release(this.pipeline),this.shaderFactory.release(this.pipeline.vs),this.pipeline.fs&&this.pipeline.fs!==this.pipeline.vs&&this.shaderFactory.release(this.pipeline.fs),this._uniformStore.destroy(),this._gpuGeometry?.destroy(),this._destroyed=!0)}needsRedraw(){this._getBindingsUpdateTimestamp()>this._lastDrawTimestamp&&this.setNeedsRedraw("contents of bound textures or buffers updated");const e=this._needsRedraw;return this._needsRedraw=!1,e}setNeedsRedraw(e){this._needsRedraw||=e}getBindingDebugTable(){return this._bindingTable}predraw(e){this._syncDynamicBuffers(),this.updateShaderInputs(e),this.material?.updateShaderInputs(e),this.pipeline=this._updatePipeline()}draw(e){if(this._drawBlockedReason&&!this._pipelineNeedsUpdate)return E.info(Q,`>>> DRAWING ABORTED ${this.id}: ${this._drawBlockedReason}`)(),!1;const t=this._areBindingsLoading();if(t)return E.info(Q,`>>> DRAWING ABORTED ${this.id}: ${t} not loaded`)(),!1;this._syncAttachmentFormats(e);try{e.pushDebugGroup(`${this}.predraw(${e})`),this.device.type==="webgpu"?(this.updateShaderInputs(),this.material?.updateShaderInputs(),this._syncDynamicBuffers(),this.pipeline=this._updatePipeline()):this.predraw(this.device.commandEncoder)}finally{e.popDebugGroup()}let i,o=this.pipeline.isErrored;try{if(e.pushDebugGroup(`${this}.draw(${e})`),this._logDrawCallStart(),this.pipeline=this._updatePipeline(),o=this.pipeline.isErrored,o)E.info(Q,`>>> DRAWING ABORTED ${this.id}: ${Dt}`)(),i=!1;else{const s=this.vertexArray.getDrawValidationError();if(s)E.info(Q,`>>> DRAWING ABORTED ${this.id}: ${s}`)(),this._drawBlockedReason=s,i=!1;else{const r=this._getCurrentShaderLayout(),a=this._getBindings(r),l=this._getBindGroups(r,a),{indexBuffer:c}=this.vertexArray,u=c?this.indexCount??(this._vertexCountSet?this.vertexCount:c.byteLength/(c.indexType==="uint32"?4:2)):void 0;e.setPipeline(this.pipeline),e.setBindings(l,{_bindGroupCacheKeys:this._getBindGroupCacheKeys()}),e.setVertexArray(this.vertexArray),i=this.isInstanced===!0&&this.instanceCount===0?!0:e.draw({isInstanced:this.isInstanced,vertexCount:this.vertexCount,instanceCount:this.isInstanced?this.instanceCount:void 0,indexCount:u,firstVertex:this.firstVertex,firstIndex:this.firstIndex,transformFeedback:this.transformFeedback||void 0,uniforms:this.props.uniforms,parameters:this.parameters,topology:this.topology})}}}finally{e.popDebugGroup(),this._logDrawCallEnd()}return this._logFramebuffer(e),i?(this._lastDrawTimestamp=this.device.timestamp,this._needsRedraw=!1):o?(this._needsRedraw=Dt,this._drawBlockedReason=Dt):this._drawBlockedReason?this._needsRedraw=this._drawBlockedReason:this._needsRedraw="waiting for resource initialization",i}setGeometry(e){this._gpuGeometry?.destroy();const t=e&&Fr(this.device,e);if(t){this.setTopology(t.topology||"triangle-list");const i=new Mt(this.bufferLayout);this.bufferLayout=i.mergeBufferLayouts(t.bufferLayout,this.bufferLayout),this.vertexArray&&this._setGeometryAttributes(t)}this._gpuGeometry=t}setTopology(e){e!==this.topology&&(this.topology=e,this._setPipelineNeedsUpdate("topology"))}setBufferLayout(e){const t=new Mt(this.bufferLayout),i=this._gpuGeometry?t.mergeBufferLayouts(e,this._gpuGeometry.bufferLayout):e;Be(i,this.bufferLayout,-1)||(this.bufferLayout=i,this._setPipelineNeedsUpdate("bufferLayout"),this.pipeline=this._updatePipeline(),this.vertexArray=this.device.createVertexArray({shaderLayout:this.pipeline.shaderLayout,bufferLayout:this.pipeline.bufferLayout}),this._gpuGeometry&&this._setGeometryAttributes(this._gpuGeometry))}setParameters(e){Be(e,this.parameters,2)||(this.parameters=e,this._setPipelineNeedsUpdate("parameters"))}setInstanceCount(e){this.instanceCount=e,this.isInstanced===void 0&&e>0&&(this.isInstanced=!0),this.setNeedsRedraw("instanceCount")}setVertexCount(e){this.vertexCount=e,this._vertexCountSet=!0,this.setNeedsRedraw("vertexCount")}setIndexCount(e){this.indexCount=e,this.setNeedsRedraw("indexCount")}setDrawOffsets({firstVertex:e,firstIndex:t}){this.firstVertex=e,this.firstIndex=t,this.setNeedsRedraw("drawOffsets")}setShaderInputs(e){this.shaderInputs=e,this._uniformStore=new Yn(this.device,this.shaderInputs.modules);for(const[t,i]of Object.entries(this.shaderInputs.modules))if(bi(i)&&!this.material?.ownsModule(t)){const o=this._uniformStore.getManagedUniformBuffer(t);this.bindings[`${t}Uniforms`]=o}this.setNeedsRedraw("shaderInputs")}setMaterial(e){this.material=e,this.setNeedsRedraw("material")}updateShaderInputs(e){this._uniformStore.setUniforms(this.shaderInputs.getUniformValues(),e),this.setBindings(this._getNonMaterialBindings(this.shaderInputs.getBindingValues())),this.setNeedsRedraw("shaderInputs")}setBindings(e){Object.assign(this.bindings,e),this.setNeedsRedraw("bindings")}setTransformFeedback(e){this.transformFeedback=e,this.setNeedsRedraw("transformFeedback")}setIndexBuffer(e){const t=e instanceof ee?e.buffer:e;this.indexBuffer=t,this._dynamicIndexBufferSource=e instanceof ee?{source:e,generation:e.generation}:null,this.vertexArray.setIndexBuffer(t),this.setNeedsRedraw("indexBuffer")}setAttributes(e,t){this._drawBlockedReason=!1;const i=t?.disableWarnings??this.props.disableWarnings;e.indices&&E.warn(`Model:${this.id} setAttributes() - indexBuffer should be set using setIndexBuffer()`)(),this.bufferLayout=qr(this.pipeline.shaderLayout,this.bufferLayout);const o=new Mt(this.bufferLayout);for(const[s,r]of Object.entries(e)){const a=r instanceof ee?r.buffer:r,l=o.getBufferLayout(s);if(!l){i||E.warn(`Model(${this.id}): Missing layout for buffer "${s}".`)();continue}const c=o.getAttributeNamesForBuffer(l);let u=!1;for(const f of c){const h=this._attributeInfos[f];if(h){const g=this.device.type==="webgpu"?this.vertexArray.getBufferSlot(h.bufferName):h.location;if(g===null){i||E.warn(`Model(${this.id}): Missing vertex array slot for buffer "${h.bufferName}".`)();continue}this.vertexArray.setBuffer(g,a),r instanceof ee?this._dynamicAttributeBufferSources[g]={source:r,generation:r.generation}:delete this._dynamicAttributeBufferSources[g],u=!0}}!u&&!i&&E.warn(`Model(${this.id}): Ignoring buffer "${a.id}" for unknown attribute "${s}"`)()}this.setNeedsRedraw("attributes")}setConstantAttributes(e,t){for(const[i,o]of Object.entries(e)){const s=this._attributeInfos[i];s?this.vertexArray.setConstantWebGL(s.location,o):(t?.disableWarnings??this.props.disableWarnings)||E.warn(`Model "${this.id}: Ignoring constant supplied for unknown attribute "${i}"`)()}this.setNeedsRedraw("constants")}_areBindingsLoading(){for(const e of Object.values(this.bindings))if(tt(e)&&!e.isReady)return e.id;for(const e of Object.values(this.material?.bindings||{}))if(tt(e)&&!e.isReady)return e.id;return!1}_getBindings(e=this._getCurrentShaderLayout()){const t={};for(const[i,o]of Object.entries(this.bindings)){const s=da(i,o,e);s&&(t[i]=s)}return t}_getBindGroups(e=this._getCurrentShaderLayout(),t=this._getBindings(e)){const i=e.bindings.length?Bs(e,t):{0:t};if(!this.material)return i;for(const[o,s]of Object.entries(this.material.getBindingsByGroup(e))){const r=Number(o);i[r]={...i[r]||{},...s}}return i}_getBindGroupCacheKeys(){const e=this.material?.getBindGroupCacheKey(3);return e?{3:e}:{}}_getBindingsUpdateTimestamp(){let e=0;this._dynamicIndexBufferSource&&(e=Math.max(e,this._dynamicIndexBufferSource.source.updateTimestamp));for(const t of Object.values(this._dynamicAttributeBufferSources))e=Math.max(e,t.source.updateTimestamp);for(const t of Object.values(this.bindings))t instanceof Os?e=Math.max(e,t.texture.updateTimestamp):t instanceof D||t instanceof hi||t instanceof pi||t instanceof ee?e=Math.max(e,t.updateTimestamp):tt(t)?e=t.isReady?Math.max(e,t.updateTimestamp):1/0:lo(t)&&(e=Math.max(e,(t.buffer instanceof ee,t.buffer.updateTimestamp)));return Math.max(e,this.material?.getBindingsUpdateTimestamp()||0)}_setGeometryAttributes(e){const t={...e.attributes};for(const[i]of Object.entries(t))!this.pipeline.shaderLayout.attributes.find(o=>o.name===i)&&i!=="positions"&&delete t[i];this.vertexCount=e.vertexCount,this._vertexCountSet=!0,this.setIndexBuffer(e.indices||null),this.setAttributes(e.attributes,{disableWarnings:!0}),this.setAttributes(t,{disableWarnings:this.props.disableWarnings}),this.setNeedsRedraw("geometry attributes")}_setPipelineNeedsUpdate(e){this._pipelineNeedsUpdate||=e,this._drawBlockedReason=!1,this.setNeedsRedraw(e)}_updatePipeline(){if(this._pipelineNeedsUpdate){let e=null,t=null;this.pipeline&&(E.log(1,`Model ${this.id}: Recreating pipeline because "${this._pipelineNeedsUpdate}".`)(),e=this.pipeline.vs,t=this.pipeline.fs),this._pipelineNeedsUpdate=!1;const i=this.shaderFactory.createShader({id:`${this.id}-vertex`,stage:"vertex",source:this.source||this.vs,debugShaders:this.props.debugShaders});let o=null;this.source?o=i:this.fs&&(o=this.shaderFactory.createShader({id:`${this.id}-fragment`,stage:"fragment",source:this.source||this.fs,debugShaders:this.props.debugShaders})),this.pipeline=this.pipelineFactory.createRenderPipeline({...this.props,bindings:void 0,bufferLayout:this.bufferLayout,colorAttachmentFormats:this._colorAttachmentFormats,depthStencilAttachmentFormat:this._depthStencilAttachmentFormat,topology:this.topology,parameters:this.parameters,bindGroups:void 0,vs:i,fs:o}),this._attributeInfos=Rs(this.pipeline.shaderLayout,this.bufferLayout),e&&this.shaderFactory.release(e),t&&t!==e&&this.shaderFactory.release(t)}return this.pipeline}_lastLogTime=0;_logOpen=!1;_logDrawCallStart(){const e=E.level>3?0:ca;E.level<2||Date.now()-this._lastLogTime<e||(this._lastLogTime=Date.now(),this._logOpen=!0,E.group(Q,`>>> DRAWING MODEL ${this.id}`,{collapsed:E.level<=2})())}_logDrawCallEnd(){if(this._logOpen){const e=Vr(this.pipeline.shaderLayout,this.id);E.table(Q,e)();const t=this.shaderInputs.getDebugTable();E.table(Q,t)();const i=this._getAttributeDebugTable();E.table(Q,this._attributeInfos)(),E.table(Q,i)(),E.groupEnd(Q)(),this._logOpen=!1}}_drawCount=0;_logFramebuffer(e){const t=this.device.props.debugFramebuffers;if(this._drawCount++,!t)return;const i=e.props.framebuffer;Gr(e,i,{id:i?.id||`${this.id}-framebuffer`,minimap:!0})}_getAttributeDebugTable(){const e={};for(const[t,i]of Object.entries(this._attributeInfos)){const o=this.vertexArray.attributes[i.location];e[i.location]={name:t,type:i.shaderType,values:o?this._getBufferOrConstantValues(o,i.bufferDataType):"null"}}if(this.vertexArray.indexBuffer){const{indexBuffer:t}=this.vertexArray,i=t.indexType==="uint32"?new Uint32Array(t.debugData):new Uint16Array(t.debugData);e.indices={name:"indices",type:t.indexType,values:i.toString()}}return e}_getBufferOrConstantValues(e,t){const i=ct.getTypedArrayConstructor(t);return(e instanceof D?new i(e.debugData):e).toString()}_getNonMaterialBindings(e){if(!this.material)return e;const t={};for(const[i,o]of Object.entries(e))this.material.ownsBinding(i)||(t[i]=o);return t}_getCurrentShaderLayout(){return this.pipeline?.shaderLayout||this.props.shaderLayout||{bindings:[]}}_syncDynamicBuffers(){if(this._dynamicIndexBufferSource&&this._dynamicIndexBufferSource.generation!==this._dynamicIndexBufferSource.source.generation){const e=this._dynamicIndexBufferSource.source.buffer;this.indexBuffer=e,this.vertexArray.setIndexBuffer(e),this._dynamicIndexBufferSource.generation=this._dynamicIndexBufferSource.source.generation,this.setNeedsRedraw("dynamic index buffer")}for(const[e,t]of Object.entries(this._dynamicAttributeBufferSources))t.generation!==t.source.generation&&(this.vertexArray.setBuffer(Number(e),t.source.buffer),t.generation=t.source.generation,this.setNeedsRedraw("dynamic attribute buffer"))}_syncAttachmentFormats(e){if(this.device.type!=="webgpu")return;const t=e.framebuffer||e.props.framebuffer,i=e.props,o=i.colorAttachmentFormats??t?.colorAttachments?.map(r=>ha(r?.texture?.format)),s=i.depthStencilAttachmentFormat===!1?void 0:i.depthStencilAttachmentFormat??ga(t?.depthStencilAttachment?.texture?.format);(!Be(this._colorAttachmentFormats,o,1)||this._depthStencilAttachmentFormat!==s)&&(this._colorAttachmentFormats=o,this._depthStencilAttachmentFormat=s,this._setPipelineNeedsUpdate("attachment formats"))}}function Nt(n,e){return n.shaderLanguage!==void 0&&n.shaderLanguage!==e?!1:e==="glsl"?"assembleGLSLShaderPair"in n&&typeof n.assembleGLSLShaderPair=="function":"assembleWGSLShader"in n&&typeof n.assembleWGSLShader=="function"}function fa(n,e){return!n||Object.keys(e).length===0?n:{...n,attributes:n.attributes.map(t=>{const i=t.name.startsWith("_luma_")?t.name.slice(6):null;return i&&e[i]?{...t,name:i}:t})}}function da(n,e,t){if(tt(e)){const i=la(t,n,{fallbackGroup:0});return i?e.resolveTextureBinding(i):null}return e instanceof ee?e.buffer:lo(e)?ra(e):e}function ha(n){return n&&!co(n)?n:null}function ga(n){return n&&co(n)?n:void 0}function co(n){return ua.includes(n)}function pa(n){return{type:n.type,shaderLanguage:n.info.shadingLanguage,shaderLanguageVersion:n.info.shadingLanguageVersion,gpu:n.info.gpu,limits:n.limits,features:n.features}}const ma=35980,ya=35981;class ge{device;model;transformFeedback;static defaultProps={...j.defaultProps,feedbackBufferMode:"separate",outputs:void 0,feedbackBuffers:void 0};static isSupported(e){return e?.info?.type==="webgl"}constructor(e,t=ge.defaultProps){if(!ge.isSupported(e))throw new Error("BufferTransform not yet implemented on WebGPU");this.device=e,this.model=new j(this.device,{id:t.id||"buffer-transform-model",fs:t.fs||Xs(),topology:t.topology||"point-list",varyings:t.outputs||t.varyings,...t,bufferMode:t.bufferMode||(t.feedbackBufferMode==="interleaved"?ma:ya)}),this.transformFeedback=this.device.createTransformFeedback({layout:this.model.pipeline.shaderLayout,buffers:t.feedbackBuffers}),this.model.setTransformFeedback(this.transformFeedback)}destroy(){this.model&&this.model.destroy()}delete(){this.destroy()}run(e){e?.inputBuffers&&this.model.setAttributes(e.inputBuffers),e?.outputBuffers&&this.transformFeedback.setBuffers(e.outputBuffers);const t=this.device.beginRenderPass({discard:!0,...e});this.model.draw(t),t.end()}getBuffer(e){return this.transformFeedback.getBuffer(e)}readAsync(e){const t=this.getBuffer(e);if(!t)throw new Error("BufferTransform#getBuffer");if(t instanceof D)return t.readAsync();const{buffer:i,byteOffset:o=0,byteLength:s=i.byteLength}=t;return i.readAsync(o,s)}}const Ut=2,ba=1e4;class vi{static defaultProps={...Me.defaultProps,id:"unnamed",handle:void 0,userData:{},source:"",modules:[],defines:{},plugins:[],bindings:void 0,shaderInputs:void 0,pipelineFactory:void 0,shaderFactory:void 0,shaderAssembler:qt.getDefaultShaderAssembler("wgsl"),debugShaders:void 0};device;id;pipelineFactory;shaderFactory;userData={};bindings={};pipeline;source;shader;shaderInputs;_uniformStore;_pipelineNeedsUpdate="newly created";_getModuleUniforms;props;_destroyed=!1;constructor(e,t){if(e.type!=="webgpu")throw new Error("Computation is only supported in WebGPU");this.props={...vi.defaultProps,...t},t=this.props,this.id=t.id||ke("model"),this.device=e,Object.assign(this.userData,t.userData);const i=va(e),o=qn(this.props.plugins,i.shaderLanguage);if(Object.keys(o.vertexInputs).length>0||Object.keys(o.varyings).length>0)throw new Error("Computation does not support ShaderPlugin vertex inputs or varyings");const s=Zn(this.props.modules,o.modules),r=Object.fromEntries(s.map(y=>[y.name,y]));this.shaderInputs=t.shaderInputs||new ao(r),t.shaderInputs&&o.modules.length>0&&this.shaderInputs.addModules(o.modules),this.setShaderInputs(this.shaderInputs);const a=ro(this.props.modules,this.shaderInputs?.getModules()),l={...o.defines,...this.props.defines};this.props.shaderLayout=pt(this.props.shaderLayout,a)||null,this.pipelineFactory=t.pipelineFactory||Pt.getDefaultPipelineFactory(this.device),this.shaderFactory=t.shaderFactory||wt.getDefaultShaderFactory(this.device);const c=this.props.shaderAssembler;Kt(c instanceof jn);const{source:u,getUniforms:f,shaderLayout:h}=c.assembleWGSLShader({platformInfo:i,...this.props,modules:a,defines:l,scanVertexAttributes:!1,pluginInjections:o.injections});this.source=u,this._getModuleUniforms=f;const g=h??e.getShaderLayout?.(this.source,{scanVertexAttributes:!1});this.props.shaderLayout=pt(this.props.shaderLayout||g||null,a)||null,this.pipeline=this._updatePipeline(),t.bindings&&this.setBindings(t.bindings)}destroy(){this._destroyed||(this.pipelineFactory.release(this.pipeline),this.shaderFactory.release(this.shader),this._uniformStore.destroy(),this._destroyed=!0)}predraw(e){this.updateShaderInputs(e)}dispatch(e,t,i,o){try{this._logDrawCallStart(),this._setPipeline(e),e.dispatch(t,i,o)}finally{this._logDrawCallEnd()}}dispatchIndirect(e,t,i=0){try{this._logDrawCallStart(),this._setPipeline(e),e.dispatchIndirect(t,i)}finally{this._logDrawCallEnd()}}_setPipeline(e){this.pipeline=this._updatePipeline(),this.pipeline.setBindings(this.bindings),e.setPipeline(this.pipeline),e.setBindings({})}setVertexCount(e){}setInstanceCount(e){}setShaderInputs(e){this.shaderInputs=e,this._uniformStore=new Yn(this.device,this.shaderInputs.modules);for(const[t,i]of Object.entries(this.shaderInputs.modules))if(bi(i)){const o=this._uniformStore.getManagedUniformBuffer(t);this.bindings[`${t}Uniforms`]=o}}setShaderModuleProps(e){const t=this._getModuleUniforms(e),i=Object.keys(t).filter(o=>{const s=t[o];return!Hn(s)&&typeof s!="number"&&typeof s!="boolean"});for(const o of i)t[o],delete t[o]}updateShaderInputs(e){this._uniformStore.setUniforms(this.shaderInputs.getUniformValues(),e)}setBindings(e){Object.assign(this.bindings,e)}_setPipelineNeedsUpdate(e){this._pipelineNeedsUpdate=this._pipelineNeedsUpdate||e}_updatePipeline(){if(this._pipelineNeedsUpdate){let e=null;this.pipeline&&(E.log(1,`Model ${this.id}: Recreating pipeline because "${this._pipelineNeedsUpdate}".`)(),e=this.shader),this._pipelineNeedsUpdate=!1,this.shader=this.shaderFactory.createShader({id:`${this.id}-fragment`,stage:"compute",source:this.source,debugShaders:this.props.debugShaders}),this.pipeline=this.pipelineFactory.createComputePipeline({...this.props,shader:this.shader}),e&&this.shaderFactory.release(e)}return this.pipeline}_lastLogTime=0;_logOpen=!1;_logDrawCallStart(){const e=E.level>3?0:ba;E.level<2||Date.now()-this._lastLogTime<e||(this._lastLogTime=Date.now(),this._logOpen=!0,E.group(Ut,`>>> DRAWING MODEL ${this.id}`,{collapsed:E.level<=2})())}_logDrawCallEnd(){if(this._logOpen){const e=this.shaderInputs.getDebugTable();E.table(Ut,e)(),E.groupEnd(Ut)(),this._logOpen=!1}}_drawCount=0;_getBufferOrConstantValues(e,t){const i=ct.getTypedArrayConstructor(t);return(e instanceof D?new i(e.debugData):e).toString()}}function va(n){return{type:n.type,shaderLanguage:n.info.shadingLanguage,shaderLanguageVersion:n.info.shadingLanguageVersion,gpu:n.info.gpu,limits:n.limits,features:n.features}}function _a(n){switch(n){case"float64":return Float64Array;case"uint8":case"unorm8":return Uint8ClampedArray;default:return ms(n)}}const xa=ct.getDataType.bind(ct);function je(n,e,t){if(e.size>4)return null;const i=t==="webgpu"&&e.type==="uint8"?"unorm8":e.type,o=e.size,s=!!(t!=="webgpu"&&o===3&&i&&["uint8","sint8","unorm8","snorm8","uint16","sint16","unorm16","snorm16"].includes(i));return{attribute:n,format:o>1?`${i}x${o}${s?"-webgl":""}`:e.type,byteOffset:e.offset||0}}function te(n){return n.stride||n.size*n.bytesPerElement}function Pa(n,e){return n.type===e.type&&n.size===e.size&&te(n)===te(e)&&(n.offset||0)===(e.offset||0)}function ei(n,e){e.offset&&H.removed("shaderAttribute.offset","vertexOffset, elementOffset")();const t=te(n),i=e.vertexOffset!==void 0?e.vertexOffset:n.vertexOffset||0,o=e.elementOffset||0,s=i*t+o*n.bytesPerElement+(n.offset||0);return{...e,offset:s,stride:t}}function wa(n,e){const t=ei(n,e);return{high:t,low:{...t,offset:t.offset+n.size*4}}}class La{constructor(e,t,i){this._buffer=null,this.device=e,this.id=t.id||"",this.size=t.size||1;const o=t.logicalType||t.type,s=o==="float64";let{defaultValue:r}=t;r=Number.isFinite(r)?[r]:r||new Array(this.size).fill(0);let a;s?a="float32":!o&&t.isIndexed?a="uint32":a=o||"float32";let l=_a(o||a);this.doublePrecision=s,s&&t.fp64===!1&&(l=Float32Array),this.value=null,this.settings={...t,defaultType:l,defaultValue:r,logicalType:o,type:a,normalized:a.includes("norm"),size:this.size,bytesPerElement:l.BYTES_PER_ELEMENT},this.state={...i,externalBuffer:null,bufferAccessor:this.settings,allocatedValue:null,numInstances:0,bounds:null,constant:!1}}get isConstant(){return this.state.constant}get buffer(){return this._buffer}get byteOffset(){const e=this.getAccessor();return e.vertexOffset?e.vertexOffset*te(e):0}get numInstances(){return this.state.numInstances}set numInstances(e){this.state.numInstances=e}get isDoublePrecisionBuffer(){return this._shouldSplitDoublePrecisionValue(this.value)}delete(){this._buffer&&(this._buffer.delete(),this._buffer=null),ut.release(this.state.allocatedValue),this.state.allocatedValue=null}getBuffer(){return this.state.constant&&this.device.type!=="webgpu"?null:this.state.externalBuffer||this._buffer}getValue(e=this.id,t=null){const i={};if(this.state.constant){const o=this.value;if(this.device.type==="webgpu"&&this._buffer)i[e]=this._buffer;else if(t){const s=ei(this.getAccessor(),t),r=s.offset/o.BYTES_PER_ELEMENT,a=s.size||this.size;i[e]=o.subarray(r,r+a)}else i[e]=o}else i[e]=this.getBuffer();return this.doublePrecision&&(this.isDoublePrecisionBuffer?i[`${e}64Low`]=i[e]:i[`${e}64Low`]=new Float32Array(this.size)),i}_getBufferLayout(e=this.id,t=null){const i=this.getAccessor(),o=[],s={name:this.id,byteStride:this.device.type==="webgpu"&&this.state.constant?0:te(i)};if(this.doublePrecision){const r=wa(i,t||{});o.push(je(e,{...i,...r.high},this.device.type),je(`${e}64Low`,{...i,...r.low},this.device.type))}else if(t){const r=ei(i,t);o.push(je(e,{...i,...r},this.device.type))}else o.push(je(e,i,this.device.type));return s.attributes=o.filter(Boolean),s}setAccessor(e){this.state.bufferAccessor=e}getAccessor(){return this.state.bufferAccessor}getBounds(){if(this.state.bounds)return this.state.bounds;let e=null;if(this.state.constant&&this.value){const t=Array.from(this.value);e=[t,t]}else{const{value:t,numInstances:i,size:o}=this,s=i*o;if(t&&s&&t.length>=s){const r=new Array(o).fill(1/0),a=new Array(o).fill(-1/0);for(let l=0;l<s;)for(let c=0;c<o;c++){const u=t[l++];u<r[c]&&(r[c]=u),u>a[c]&&(a[c]=u)}e=[r,a]}}return this.state.bounds=e,e}setData(e){const{state:t}=this;let i;ArrayBuffer.isView(e)?i={value:e}:e instanceof D?i={buffer:e}:i=e;const o={...this.settings,...i};if(ArrayBuffer.isView(i.value)){if(!i.type)if(this.doublePrecision&&i.value instanceof Float64Array)o.type="float32";else{const r=xa(i.value);o.type=o.normalized?r.replace("int","norm"):r}o.bytesPerElement=i.value.BYTES_PER_ELEMENT,o.stride=te(o)}if(t.bounds=null,i.constant){let s=i.value;if(s=this._normalizeValue(s,[],0),this.settings.normalized&&(s=this.normalizeConstant(s)),!(!t.constant||!this._areValuesEqual(s,this.value)))return!1;t.externalBuffer=null,t.constant=!0,this.value=ArrayBuffer.isView(s)?s:new Float32Array(s)}else if(i.buffer){const s=i.buffer;t.externalBuffer=s,t.constant=!1,this.value=i.value||null}else if(i.value){this._checkExternalBuffer(i);const s=i.value;let r=s;t.externalBuffer=null,t.constant=!1,this.value=s,this._shouldSplitDoublePrecisionValue(r)&&(r=Xe(r,o),s instanceof Float32Array&&(o.stride=o.size*2*Float32Array.BYTES_PER_ELEMENT));let{buffer:a}=this;const l=te(o),c=(o.vertexOffset||0)*l;if(this.settings.isIndexed){const f=this.settings.defaultType;r.constructor!==f&&(r=new f(r))}const u=r.byteLength+c+l*2;(!a||a.byteLength<u)&&(a=this._createBuffer(u)),a.write(r,c)}return this.setAccessor(o),!0}updateSubBuffer(e={}){this.state.bounds=null;const t=this.value,{startOffset:i=0,endOffset:o}=e,s=this._shouldSplitDoublePrecisionValue(t);this.buffer.write(s?Xe(t,{size:this.size,startIndex:i,endIndex:o}):t.subarray(i,o),i*(s?8:t.BYTES_PER_ELEMENT)+this.byteOffset)}allocate(e,t=!1){const{state:i}=this,o=i.allocatedValue,s=ut.allocate(o,e+1,{size:this.size,type:this.settings.defaultType,copy:t});this.value=s;const r=this._shouldSplitDoublePrecisionValue(s),a=r&&s instanceof Float32Array?{...this.settings,stride:this.size*2*Float32Array.BYTES_PER_ELEMENT}:this.settings;this.setAccessor(a);const{byteOffset:l}=this;let{buffer:c}=this;const u=s.byteLength*(r&&s instanceof Float32Array?2:1);return(!c||c.byteLength<u+l)&&(c=this._createBuffer(u+l),t&&o&&c.write(this._shouldSplitDoublePrecisionValue(o)?Xe(o,this):o,l)),i.allocatedValue=s,i.constant=!1,i.externalBuffer=null,!0}_shouldSplitDoublePrecisionValue(e){return!!(this.doublePrecision&&(e instanceof Float64Array||this.device.type==="webgpu"&&e instanceof Float32Array))}_checkExternalBuffer(e){const{value:t}=e;if(!ArrayBuffer.isView(t))throw new Error(`Attribute ${this.id} value is not TypedArray`);const i=this.settings.defaultType;let o=!1;if(this.doublePrecision&&(o=t.BYTES_PER_ELEMENT<4),o)throw new Error(`Attribute ${this.id} does not support ${t.constructor.name}`);!(t instanceof i)&&this.settings.normalized&&!("normalized"in e)&&H.warn(`Attribute ${this.id} is normalized`)()}normalizeConstant(e){switch(this.settings.type){case"snorm8":return new Float32Array(e).map(t=>(t+128)/255*2-1);case"snorm16":return new Float32Array(e).map(t=>(t+32768)/65535*2-1);case"unorm8":return new Float32Array(e).map(t=>t/255);case"unorm16":return new Float32Array(e).map(t=>t/65535);default:return e}}_normalizeValue(e,t,i){const{defaultValue:o,size:s}=this.settings;if(Number.isFinite(e))return t[i]=e,t;if(!e){let r=s;for(;--r>=0;)t[i+r]=o[r];return t}switch(s){case 4:t[i+3]=Number.isFinite(e[3])?e[3]:o[3];case 3:t[i+2]=Number.isFinite(e[2])?e[2]:o[2];case 2:t[i+1]=Number.isFinite(e[1])?e[1]:o[1];case 1:t[i+0]=Number.isFinite(e[0])?e[0]:o[0];break;default:let r=s;for(;--r>=0;)t[i+r]=Number.isFinite(e[r])?e[r]:o[r]}return t}_areValuesEqual(e,t){if(!e||!t)return!1;const{size:i}=this;for(let o=0;o<i;o++)if(e[o]!==t[o])return!1;return!0}_createBuffer(e){this._buffer&&this._buffer.destroy();const{isIndexed:t,type:i}=this.settings,o=this.device.type==="webgpu"&&!t?D.VERTEX|D.STORAGE|D.COPY_DST|D.COPY_SRC:(t?D.INDEX:D.VERTEX)|D.COPY_DST;return this._buffer=this.device.createBuffer({...this._buffer?.props,id:this.id,usage:o,indexType:t?i:void 0,byteLength:e}),this._buffer}}const Xi=[],Ji=[];function Lt(n,e=0,t=1/0){let i=Xi;const o={index:-1,data:n,target:[]};return n?typeof n[Symbol.iterator]=="function"?i=n:n.length>0&&(Ji.length=n.length,i=Ji):i=Xi,(e>0||Number.isFinite(t))&&(i=(Array.isArray(i)?i:Array.from(i)).slice(e,t),o.index=e-1),{iterable:i,objectInfo:o}}function uo(n){return n&&n[Symbol.asyncIterator]}function fo(n,e){const{size:t,stride:i,offset:o,startIndices:s,nested:r}=e,a=n.BYTES_PER_ELEMENT,l=i?i/a:t,c=o?o/a:0,u=Math.floor((n.length-c)/l);return(f,{index:h,target:g})=>{if(!s){const S=h*l+c;for(let A=0;A<t;A++)g[A]=n[S+A];return g}const y=s[h],b=s[h+1]||u;let w;if(r){w=new Array(b-y);for(let S=y;S<b;S++){const A=S*l+c;g=new Array(t);for(let L=0;L<t;L++)g[L]=n[A+L];w[S-y]=g}}else if(l===t)w=n.subarray(y*t+c,b*t+c);else{w=new n.constructor((b-y)*t);let S=0;for(let A=y;A<b;A++){const L=A*l+c;for(let B=0;B<t;B++)w[S++]=n[L+B]}}return w}}const Sa=[],it=[[0,1/0]];function Ca(n,e){if(n===it||(e[0]<0&&(e[0]=0),e[0]>=e[1]))return n;const t=[],i=n.length;let o=0;for(let s=0;s<i;s++){const r=n[s];r[1]<e[0]?(t.push(r),o=s+1):r[0]>e[1]?t.push(r):e=[Math.min(r[0],e[0]),Math.max(r[1],e[1])]}return t.splice(o,0,e),t}const Aa={interpolation:{duration:0,easing:n=>n},spring:{stiffness:.05,damping:.5}};function ho(n,e){if(!n)return null;Number.isFinite(n)&&(n={type:"interpolation",duration:n});const t=n.type||"interpolation";return{...Aa[t],...e,...n,type:t}}class go extends La{constructor(e,t){super(e,t,{startIndices:null,constantValue:null,lastExternalBuffer:null,binaryValue:null,binaryAccessor:null,needsUpdate:!0,needsRedraw:!1,layoutChanged:!1,updateRanges:it}),this.constant=!1,this.settings.update=t.update||(t.accessor?this._autoUpdater:void 0),Object.seal(this.settings),Object.seal(this.state),this._validateAttributeUpdaters()}get startIndices(){return this.state.startIndices}set startIndices(e){this.state.startIndices=e}needsUpdate(){return this.state.needsUpdate}needsRedraw({clearChangedFlags:e=!1}={}){const t=this.state.needsRedraw;return this.state.needsRedraw=t&&!e,t}layoutChanged(){return this.state.layoutChanged}setAccessor(e){var t;(t=this.state).layoutChanged||(t.layoutChanged=!Pa(e,this.getAccessor())),super.setAccessor(e)}getUpdateTriggers(){const{accessor:e}=this.settings;return[this.id].concat(typeof e!="function"&&e||[])}supportsTransition(){return!!this.settings.transition}getTransitionSetting(e){if(!e||!this.supportsTransition())return null;const{accessor:t}=this.settings,i=this.settings.transition,o=Array.isArray(t)?e[t.find(s=>e[s])]:e[t];return ho(o,i)}setNeedsUpdate(e=this.id,t){if(this.state.needsUpdate=this.state.needsUpdate||e,this.setNeedsRedraw(e),t){const{startRow:i=0,endRow:o=1/0}=t;this.state.updateRanges=Ca(this.state.updateRanges,[i,o])}else this.state.updateRanges=it}clearNeedsUpdate(){this.state.needsUpdate=!1,this.state.updateRanges=Sa}setNeedsRedraw(e=this.id){this.state.needsRedraw=this.state.needsRedraw||e}allocate(e){const{state:t,settings:i}=this;if(i.noAlloc)return!1;if(i.update){const o=this.isConstant;return super.allocate(e,t.updateRanges!==it),t.layoutChanged||(t.layoutChanged=o&&this.device.type==="webgpu"),!0}return!1}updateBuffer({numInstances:e,data:t,props:i,context:o}){if(!this.needsUpdate())return!1;const{state:{updateRanges:s},settings:{update:r,noAlloc:a}}=this;let l=!0;if(r){for(const[c,u]of s)r.call(o,this,{data:t,startRow:c,endRow:u,props:i,numInstances:e});if(this.value)if(this.constant||!this.buffer||this.buffer.byteLength<this.value.byteLength+this.byteOffset){if(this.constant){const c=this.value;this.value=null,this.setConstantValue(o,c)}else this.setData({value:this.value,constant:this.constant});this.constant=!1}else for(const[c,u]of s){const f=Number.isFinite(c)?this.getVertexOffset(c):0,h=Number.isFinite(u)?this.getVertexOffset(u):a||!Number.isFinite(e)?this.value.length:e*this.size;super.updateSubBuffer({startOffset:f,endOffset:h})}this._checkAttributeArray()}else l=!1;return this.clearNeedsUpdate(),this.setNeedsRedraw(),l}setConstantValue(e,t){var i;if(t===void 0||typeof t=="function")return!1;const o=this.isConstant,s=this.settings.transform&&e?this.settings.transform.call(e,t):t,r=this.settings.defaultType;this.state.constantValue=this._normalizeValue(s,new r(this.size),0);const a=this.setData({constant:!0,value:s});if(this.device.type==="webgpu"){let l=this.state.constantValue;this.doublePrecision&&(l instanceof Float32Array||l instanceof Float64Array)&&(l=Xe(l,{size:this.size}),this.setAccessor({...this.getAccessor(),stride:this.size*2*Float32Array.BYTES_PER_ELEMENT}));let c=this._buffer;(!c||c.byteLength<l.byteLength)&&(c=this._createBuffer(l.byteLength)),c.write(l),(i=this.state).layoutChanged||(i.layoutChanged=!o),this.constant=!1}return a&&this.setNeedsRedraw(),this.clearNeedsUpdate(),!0}getConstantValue(){return this.isConstant?this.state.constantValue:null}setExternalBuffer(e){const{state:t}=this;return e?(this.clearNeedsUpdate(),t.lastExternalBuffer===e||(t.lastExternalBuffer=e,this.setNeedsRedraw(),this.setData(e)),!0):(t.lastExternalBuffer=null,!1)}setBinaryValue(e,t=null){const{state:i,settings:o}=this;if(!e)return i.binaryValue=null,i.binaryAccessor=null,!1;if(o.noAlloc)return!1;if(i.binaryValue===e)return this.clearNeedsUpdate(),!0;if(i.binaryValue=e,this.setNeedsRedraw(),o.transform||t!==this.startIndices){ArrayBuffer.isView(e)&&(e={value:e});const r=e;oe(ArrayBuffer.isView(r.value),`invalid ${o.accessor}`);const a=!!r.size&&r.size!==this.size;return i.binaryAccessor=fo(r.value,{size:r.size||this.size,stride:r.stride,offset:r.offset,startIndices:t,nested:a}),!1}return this.clearNeedsUpdate(),this.setData(e),!0}getVertexOffset(e){const{startIndices:t}=this;return(t?e<t.length?t[e]:this.numInstances:e)*this.size}getValue(){const e=this.settings.shaderAttributes,t=super.getValue();if(!e)return t;for(const i in e)Object.assign(t,super.getValue(i,e[i]));return t}getBufferLayout(e){this.state.layoutChanged=!1;const t=this.settings.shaderAttributes,i=super._getBufferLayout(),{stepMode:o}=this.settings;if(o==="dynamic"?i.stepMode=e?e.isInstanced?"instance":"vertex":"instance":i.stepMode=o??"vertex",!t)return i;for(const s in t){const r=super._getBufferLayout(s,t[s]);i.attributes.push(...r.attributes)}return i}_autoUpdater(e,{data:t,startRow:i,endRow:o,props:s,numInstances:r}){const{settings:a,state:l,value:c,size:u,startIndices:f}=e,{accessor:h,transform:g}=a,y=l.binaryAccessor||(typeof h=="function"?h:s[h]);oe(typeof y=="function",`accessor "${h}" is not a function`);let b=e.getVertexOffset(i);const{iterable:w,objectInfo:S}=Lt(t,i,o);for(const A of w){S.index++;let L=y(A,S);if(g&&(L=g.call(this,L)),f){const B=(S.index<f.length-1?f[S.index+1]:r)-f[S.index];if(L&&Array.isArray(L[0])){let k=b;for(const V of L)e._normalizeValue(V,c,k),k+=u}else L&&L.length>u?c.set(L,b):(e._normalizeValue(L,S.target,0),ys({target:c,source:S.target,start:b,count:B}));b+=B*u}else e._normalizeValue(L,c,b),b+=u}}_validateAttributeUpdaters(){const{settings:e}=this;if(!(e.noAlloc||typeof e.update=="function"))throw new Error(`Attribute ${this.id} missing update or accessor`)}_checkAttributeArray(){const{value:e}=this,t=Math.min(4,this.size);if(e&&e.length>=t){let i=!0;switch(t){case 4:i=i&&Number.isFinite(e[3]);case 3:i=i&&Number.isFinite(e[2]);case 2:i=i&&Number.isFinite(e[1]);case 1:i=i&&Number.isFinite(e[0]);break;default:i=!1}if(!i)throw new Error(`Illegal attribute generated for ${this.id}`)}}}const po=/^vertex-list<([^<>]+)>$/,mo=/^value-list<([^<>]+)>$/;function yo(n){return po.test(n)}function bo(n){return mo.test(n)}function Ea(n){const e=po.exec(n),t=mo.exec(n),i=e?.[1]??t?.[1]??n;try{ie.getVertexFormatInfo(i)}catch{throw new Error(`Unsupported GPUVector format ${n}`)}return i}function ze(n){const e=Ea(n),t=yo(n),i=bo(n),o=ie.getVertexFormatInfo(e),s=o.type,r=o.normalized,a=Ia(s,r);return{format:n,elementFormat:e,vertexList:t,valueList:i,type:s,signedDataType:Ta(e,s),primitiveType:a,components:o.components,byteLength:o.byteLength,integer:o.integer,signed:o.signed,normalized:r,...o.webglOnly?{webglOnly:!0}:{}}}function Ia(n,e){if(e)return"f32";switch(n){case"float32":return"f32";case"float16":return"f16";case"uint8":case"uint16":case"uint32":return"u32";case"sint8":case"sint16":case"sint32":return"i32";default:throw new Error(`Unsupported GPUVector component type ${n}`)}}function Ta(n,e){if(n==="unorm10-10-10-2")return"uint32";switch(e){case"unorm8":return"uint8";case"snorm8":return"sint8";case"unorm16":return"uint16";case"snorm16":return"sint16";default:return e}}class mt{buffer;format;length;byteOffset;byteStride;constructor(e){const t=ie.getVertexFormatInfo(e.format).byteLength,i=e.byteOffset??0,o=e.byteStride??t;if(Ft(e.length,"GPUDataView length"),Ft(i,"GPUDataView byteOffset"),Ft(o,"GPUDataView byteStride"),o<t)throw new Error(`GPUDataView byteStride ${o} is smaller than ${e.format} byte length ${t}`);const s=e.length===0?0:(e.length-1)*o+t,r=i+s;if(!Number.isSafeInteger(s)||!Number.isSafeInteger(r))throw new Error("GPUDataView byte range must use safe integers");if(r>e.buffer.byteLength)throw new Error("GPUDataView exceeds its backing buffer byte length");this.buffer=e.buffer,this.format=e.format,this.length=e.length,this.byteOffset=i,this.byteStride=o}get elementByteLength(){return ie.getVertexFormatInfo(this.format).byteLength}get byteLength(){return this.length===0?0:(this.length-1)*this.byteStride+this.elementByteLength}}function Ft(n,e){if(!Number.isSafeInteger(n)||n<0)throw new Error(`${e} must be a non-negative safe integer`)}function kt(n){return!!(n&&typeof n=="object"&&n.type==="struct")}function Ba(n,e){const t=Object.entries(n);if(t.length===0)throw new Error("GPUData struct format must declare at least one field");return e==="packed"?Oa(t):Ra(t)}function Oa(n){const e=[];let t=0,i=0;for(const[o,s]of n){const r=ie.getVertexFormatInfo(s);if(r.webglOnly)throw new Error(`Packed GPUData struct field "${o}" uses WebGL-only format ${s}`);t=Qi(t,Math.min(4,r.byteLength)),e.push([o,Object.freeze({format:s,byteOffset:t,byteLength:r.byteLength})]),t+=r.byteLength,i+=r.components}return Object.freeze({type:"struct",layout:"packed",fields:Object.freeze(Object.fromEntries(e)),components:i,byteStride:Qi(t,4),rowByteLength:t})}function Ra(n){const e=Object.fromEntries(n.map(([r,a])=>[r,Ma(a)])),t=Wn(e,{layout:"wgsl-storage"}),i=[];let o=0,s=0;for(const[r,a]of n){const l=ie.getVertexFormatInfo(a),c=t.fields[r].offset*4;i.push([r,Object.freeze({format:a,byteOffset:c,byteLength:l.byteLength})]),o=Math.max(o,c+l.byteLength),s+=l.components}return Object.freeze({type:"struct",layout:"wgsl-storage",fields:Object.freeze(Object.fromEntries(i)),components:s,byteStride:t.byteLength,rowByteLength:o})}function Ma(n){const e=ie.getVertexFormatInfo(n);switch(e.type){case"float32":return $e("f32",e.components);case"sint32":return $e("i32",e.components);case"uint32":return $e("u32",e.components);default:{const t=Math.ceil(e.byteLength/4);return $e("u32",t)}}}function $e(n,e){return e===1?n:`vec${e}<${n}>`}function Qi(n,e){return Math.ceil(n/e)*e}class Da{buffer;ownsDataBuffer;constructor(e,t){this.buffer=e,this.ownsDataBuffer=t}get ownsBuffer(){return this.ownsDataBuffer}transferBufferOwnership(e){if(e.buffer!==this.buffer)throw new Error("GPUData ownership can only be transferred to the same buffer");e.ownsDataBuffer=this.ownsDataBuffer,this.ownsDataBuffer=!1}destroy(){this.ownsDataBuffer&&(this.buffer.destroy(),this.ownsDataBuffer=!1)}}class Na extends Da{dataType;format;length;valueLength;stride;byteOffset;byteStride;rowByteLength;readbackMetadata;valueOffsets;nullBitmap;valueByteLength;constructor(e){const{buffer:t,format:i,length:o,valueLength:s,stride:r,byteOffset:a=0,byteStride:l,rowByteLength:c,ownsBuffer:u=!1,readbackMetadata:f,valueOffsets:h,nullBitmap:g,valueByteLength:y,dataType:b}=e;super(t,u);let w;i?typeof i=="string"?w=i:w=Ba(i,e.layout??"wgsl-storage"):w=void 0;const S=kt(w)?w:void 0,A=typeof w=="string"?ze(w):void 0;if(this.dataType=b,this.format=w,this.length=o,this.valueLength=s??o,this.stride=r??A?.components??S?.components??l??c??1,this.byteOffset=a,this.rowByteLength=c??S?.rowByteLength??A?.byteLength??l??this.stride,this.byteStride=l??S?.byteStride??this.rowByteLength,S){if(this.rowByteLength<S.rowByteLength)throw new Error(`GPUData rowByteLength ${this.rowByteLength} is smaller than struct format row byte length ${S.rowByteLength}`);if(this.byteStride<Math.max(S.byteStride,this.rowByteLength))throw new Error(`GPUData byteStride ${this.byteStride} is smaller than its struct row layout`)}this.readbackMetadata=f,this.valueOffsets=h,this.nullBitmap=g,this.valueByteLength=y}getChild(e){if(!kt(this.format))return null;const t=this.format.fields[e];return t?new mt({buffer:this.buffer,format:t.format,length:this.length,byteOffset:this.byteOffset+t.byteOffset,byteStride:this.byteStride}):null}getChildAt(e){if(!kt(this.format))return null;const t=Object.values(this.format.fields)[e];return t?new mt({buffer:this.buffer,format:t.format,length:this.length,byteOffset:this.byteOffset+t.byteOffset,byteStride:this.byteStride}):null}}const ti=Na;class Re{name;dataType;format;length;valueLength;stride;byteOffset;byteStride;rowByteLength;bufferLayout;data=[];device;bufferProps;isAppendable=!1;ownsDataChunks=!0;ownedVectors=[];appendableByteLength=0;constructor(e){switch(e.type){case"buffer":{const{name:t,buffer:i,format:o,length:s,valueLength:r=s,byteOffset:a=0,ownsBuffer:l=!1}=e,{stride:c,byteStride:u,rowByteLength:f}=en(e);this.name=t,this.dataType=e.dataType,this.format=o,this.length=s,this.valueLength=r,this.stride=c,this.byteOffset=a,this.byteStride=u,this.rowByteLength=f,this.data.push(new ti({buffer:i,format:o,length:s,valueLength:r,stride:c,byteOffset:a,byteStride:u,rowByteLength:f,ownsBuffer:l,dataType:e.dataType}));return}case"interleaved":{const{name:t,buffer:i,format:o,length:s,valueLength:r=s,byteOffset:a=0,byteStride:l,attributes:c,ownsBuffer:u=!1}=e;this.name=t,this.dataType=e.dataType,this.format=o,this.length=s,this.valueLength=r,this.stride=l,this.byteOffset=a,this.byteStride=l,this.rowByteLength=l,this.bufferLayout={name:t,byteStride:l,attributes:c},this.data.push(new ti({buffer:i,format:o,length:s,valueLength:r,stride:l,byteOffset:a,byteStride:l,rowByteLength:l,ownsBuffer:u,dataType:e.dataType}));return}case"data":{const t=e.format??Ua(e.data),i=t?ze(t):void 0,{name:o,data:s,stride:r=s[0]?.stride??i?.components??1,valueLength:a=s.reduce((h,g)=>h+g.valueLength,0),byteStride:l=s[0]?.byteStride??i?.byteLength,rowByteLength:c=s[0]?.rowByteLength??i?.byteLength,bufferLayout:u,ownsData:f=!1}=e;if(l===void 0||c===void 0)throw new Error("GPUVector requires format or explicit byte layout metadata");t&&Fa(s,t),this.name=o,this.dataType=e.dataType,this.format=t,this.length=s.reduce((h,g)=>h+g.length,0),this.valueLength=a,this.stride=r,this.byteOffset=s.length===1?s[0].byteOffset:0,this.byteStride=l,this.rowByteLength=c,this.bufferLayout=u,this.ownsDataChunks=f,this.data.push(...s);return}case"appendable":{const{name:t,device:i,format:o,valueLength:s=0,bufferProps:r}=e,{stride:a,byteStride:l,rowByteLength:c}=en(e);this.name=t,this.dataType=e.dataType,this.format=o,this.length=0,this.valueLength=s,this.stride=a,this.byteOffset=0,this.byteStride=l,this.rowByteLength=c,this.device=i,this.bufferProps=r,this.isAppendable=!0;return}}}get ownsBuffer(){return this.ownsDataChunks&&this.data.some(e=>e.ownsBuffer)||this.ownedVectors.some(e=>e.ownsBuffer)}get capacityRows(){return this.isAppendable?this.length:void 0}get appendedByteLength(){return this.appendableByteLength}addData(e){if(this.format&&e.format!==this.format)throw new Error("GPUVector.addData() requires matching formats");if(e.byteStride!==this.byteStride)throw new Error("GPUVector.addData() requires matching byteStride");if(e.rowByteLength!==this.rowByteLength)throw new Error("GPUVector.addData() requires matching rowByteLength");return this.data.push(e),this.length+=e.length,this.valueLength+=e.valueLength,this}appendDataChunk(e,t=this.appendableByteLength+e.buffer.byteLength){if(!this.isAppendable)throw new Error("GPUVector.appendDataChunk() requires appendable vector storage");if(this.format&&e.format!==this.format)throw new Error("GPUVector.appendDataChunk() requires matching formats");if(e.byteStride!==this.byteStride||e.rowByteLength!==this.rowByteLength)throw new Error("GPUVector.appendDataChunk() requires matching byte layout metadata");return this.data.push(e),this.length+=e.length,this.valueLength+=e.valueLength,this.appendableByteLength=t,this}resetLastBatch(){if(!this.isAppendable)throw new Error("GPUVector.resetLastBatch() requires appendable vector storage");for(const e of this.data.splice(0))e.destroy();return this.length=0,this.valueLength=0,this.appendableByteLength=0,this}retainOwnedVectors(e){return this.ownedVectors.push(...e),this}transferBufferOwnership(e){const t=this.data[0],i=e.data[0];if(!t||!i||t.buffer!==i.buffer)throw new Error("GPUVector ownership can only be transferred to the same buffer");t.transferBufferOwnership(i)}destroy(){if(this.ownsDataChunks)for(const e of this.data)e.destroy();for(const e of this.ownedVectors.splice(0))e.destroy()}}function en(n){const e=n.format?ze(n.format):void 0,t=n.rowByteLength??n.byteStride??e?.byteLength;if(t===void 0)throw new Error("GPUVector requires format or explicit rowByteLength");return{stride:n.stride??e?.components??1,byteStride:n.byteStride??t,rowByteLength:t}}function Ua(n){return n[0]?.format}function Fa(n,e){if(n.find(i=>i.format!==e))throw new Error("GPUVector data chunks must share the declared format")}class ka{poolSize=20;bufferPools;constructor(){this.bufferPools=new Map}createOrReuse(e,t){if(t>e.limits.maxBufferSize)throw new Error(`Buffer pool cannot allocate ${t} bytes: device.limits.maxBufferSize is ${e.limits.maxBufferSize}`);const i=this.bufferPools.get(e),o=i?i.findIndex(r=>r.byteLength>=t):-1;if(o<0)return e.createBuffer({usage:D.VERTEX|D.STORAGE|D.COPY_DST|D.COPY_SRC,byteLength:t});const[s]=i.splice(o,1);return s}recycle(e){const t=e.device;this.bufferPools.has(t)||this.bufferPools.set(t,[]);const i=this.bufferPools.get(t),o=i.findIndex(s=>s.byteLength>e.byteLength);o<0?i.push(e):i.splice(o,0,e),this.purge()}purge(){for(const[e,t]of this.bufferPools){const i=e.isLost?0:this.poolSize;for(;t.length>i;)t.shift().destroy();t.length===0&&this.bufferPools.delete(e)}}}const Se=new ka;class F{static get bufferPoolSize(){return Se.poolSize}static set bufferPoolSize(e){if(!Number.isSafeInteger(e)||e<0)throw new Error("GPUDataEvaluator.bufferPoolSize must be a non-negative safe integer");Se.poolSize=e,Se.purge()}type;size;get offset(){return this._offset}get stride(){return this._stride}normalized;isConstant;length;get byteLength(){return this._byteLength}ValueType;source=null;format;_id;_destroyed=!1;_value;_offset;_stride;_byteLength;_gpuVector;_bufferOwnership="owned";_targetBuffer;static fromArray(e,{type:t,size:i=1,offset:o=0,stride:s=0,normalized:r=!1}){let a=t,l;if(Array.isArray(e)){a=a||"float32";const u=Je(a);l=new u(e)}else e instanceof Float64Array?(a="uint32",i*=2,o*=2,s*=2,l=new Uint32Array(e.buffer,e.byteOffset,e.byteLength/4)):(a=a||bs(e),l=e);const c=`<${a} * ${i}>`;return new F({id:c,type:a,size:i,offset:o,stride:s,normalized:r,value:l})}static fromConstant(e,t="float32"){const i=Je(t);let o;return Array.isArray(e)?o=`[${e.join(",")}]`:(o=String(e),e=[e]),new F({id:o,isConstant:!0,type:t,size:e.length,value:new i(e)})}static fromGPUData(e,t={}){Va(e);const i=new mt({buffer:e.buffer,format:e.format,length:e.length,byteOffset:e.byteOffset,byteStride:e.byteStride});return new F({...nn(i),id:t.id,gpuData:e})}static fromGPUDataView(e,t={}){return new F({...nn(e),id:t.id,buffer:e.buffer})}constructor(e){const{id:t,value:i,buffer:o,gpuData:s,format:r,source:a=null,isConstant:l=!1}=e;if(!a&&!i&&!o&&!s)throw new Error("GPUDataEvaluator must have a value source");let{type:c,size:u,offset:f,stride:h,normalized:g,length:y}=e;if(a instanceof F?(c=c??a.type,u=u??a.size,f=f??a.offset,h=h??a.stride,g=g??a.normalized,y=y??a.length):(u=u??1,f=f??0,g=g??!1,y=l?1:y),!c)throw new Error("GPUDataEvaluator: type not defined");if(this._id=t,this.type=c,this.size=u,this.ValueType=Je(this.type),this._offset=f,this._stride=h||this.ValueType.BYTES_PER_ELEMENT*u,this.normalized=g,this.source=a,this.format=r,y===void 0)if(l)y=1;else{if(!i)throw new Error("GPUDataEvaluator: length not defined");y=Math.ceil(i.byteLength/this.stride)}this.isConstant=l,this.length=y;const b=this.ValueType.BYTES_PER_ELEMENT*this.size;this._byteLength=y===0?0:(y-1)*this.stride+b,this._value=i,this._bufferOwnership=a instanceof F||o||s?"borrowed":"owned",s?this._gpuVector=new Re({type:"data",name:this._id??"data",format:s.format,data:[s],stride:s.stride,byteStride:s.byteStride,rowByteLength:s.rowByteLength}):o&&(this._gpuVector=this.createGPUVectorView({buffer:o,name:this._id,format:this.format}))}get value(){return this._value||(this.source instanceof F?this.source.value:void 0)}get evaluated(){return!!this._gpuVector}get id(){return this._id}get gpuVector(){if(!this._gpuVector)throw new Error(`${this} not evaluated`);return this._gpuVector}get buffer(){return We(this.gpuVector)}setTargetBuffer({buffer:e,byteOffset:t=0,byteStride:i=this.stride}){if(this._destroyed)throw new Error(`GPUDataEvaluator ${this} already destroyed`);if(this._gpuVector)throw new Error(`GPUDataEvaluator ${this} already evaluated`);if(!this.source||this.source instanceof F)throw new Error("GPUDataEvaluator target buffers require a deferred operation source");this._targetBuffer={buffer:e,byteOffset:t,byteStride:i}}async evaluate(e,t={}){if(this._destroyed)throw new Error(`GPUDataEvaluator ${this} already destroyed`);if(this._gpuVector)return this._gpuVector;let i;if(this.source instanceof F){const o=await this.source.evaluate(e);return this._gpuVector=this.createGPUVectorView({...t,buffer:We(o)}),this._gpuVector}if(i=this._getEvaluationBuffer(e),this._value)i.write(this._value);else{const o=await this.source.execute(e,i);if(!o.success)throw o.error||new Error(`${this.source} evaluation failed`);o.value&&(this._value=o.value)}return this._gpuVector=this.createGPUVectorView({...t,buffer:i}),this._gpuVector}evaluateSync(e,t={}){if(this._destroyed)throw new Error(`GPUDataEvaluator ${this} already destroyed`);if(this._gpuVector)return this._gpuVector;let i;if(this.source instanceof F){const o=this.source.evaluateSync(e);return this._gpuVector=this.createGPUVectorView({...t,buffer:We(o)}),this._gpuVector}if(i=this._getEvaluationBuffer(e),this._value)i.write(this._value);else{const o=this.source.executeSync(e,i);if(!o.success)throw o.error||new Error(`${this.source} evaluation failed`);o.value&&(this._value=o.value)}return this._gpuVector=this.createGPUVectorView({...t,buffer:i}),this._gpuVector}createGPUVectorView(e){const t=e.name??this._id??"vector",i=e.format??this.format??$a(this.type,this.size,this.normalized);if(e.interleaved){const o=typeof e.interleaved=="object"&&e.interleaved.attributes?e.interleaved.attributes:ja(this);return new Re({type:"interleaved",name:t,buffer:e.buffer,format:e.format??this.format,length:this.length,byteOffset:this.offset,byteStride:this.stride,attributes:o,ownsBuffer:!1})}return new Re({type:"buffer",name:t,buffer:e.buffer,format:i,length:this.length,stride:this.size,byteOffset:this.offset,byteStride:this.stride,rowByteLength:this.ValueType.BYTES_PER_ELEMENT*this.size,ownsBuffer:!1})}_getEvaluationBuffer(e){const t=this._targetBuffer;if(!t)return Se.createOrReuse(e,this.byteLength);if(t.buffer.device!==e)throw new Error("GPUDataEvaluator target buffer belongs to a different device");const i=this.ValueType.BYTES_PER_ELEMENT*this.size,o=this.length===0?0:(this.length-1)*t.byteStride+i;if(t.byteOffset+o>t.buffer.byteLength)throw new Error("GPUDataEvaluator target buffer is too small for the output layout");return this._offset=t.byteOffset,this._stride=t.byteStride,this._byteLength=o,this._bufferOwnership="borrowed",this._targetBuffer=void 0,t.buffer}async readValue(e=0,t){const{ValueType:i}=this,{size:o,offset:s,stride:r,length:a}=this,l=i.BYTES_PER_ELEMENT*o;if(t=t??a,e=Math.max(0,Math.min(a,e)),t=Math.max(e,Math.min(a,t)),this._value)return za(this,this._value,e,t);const c=t-e;if(c===0)return new i(0);const u=s+e*r,f=r===l?c*l:(c-1)*r+l,h=await this.buffer.readAsync(u,f),g=new i(h.buffer,h.byteOffset,h.byteLength/i.BYTES_PER_ELEMENT);if(r===l)return g;const y=new Uint8Array(l*c);for(let b=0;b<c;b++){const w=b*r;y.set(h.subarray(w,w+l),b*l)}return new i(y.buffer)}async ensureCPUValue(){const e=this.value;if(e)return e;const t=await this.buffer.readAsync(0,this.offset+this.byteLength);if(t.byteLength%this.ValueType.BYTES_PER_ELEMENT!==0)throw new Error(`${this} backing buffer byte length is not aligned to its scalar type`);const i=t.slice();return this._value=new this.ValueType(i.buffer,i.byteOffset,i.byteLength/this.ValueType.BYTES_PER_ELEMENT),this._value}ensureCPUValueSync(){const e=this.value;if(e)return e;throw new Error(`${this} CPU value is not available for synchronous evaluation`)}toString(){return this._id??this.source?.toString()??this.constructor.name}destroy(){this._gpuVector&&(this._bufferOwnership==="owned"&&Se.recycle(We(this._gpuVector)),this._gpuVector=void 0),this._targetBuffer=void 0,this._destroyed=!0}}function za(n,e,t,i){const{ValueType:o,size:s,offset:r,stride:a}=n,l=a/o.BYTES_PER_ELEMENT,c=r/o.BYTES_PER_ELEMENT,u=i-t;if(l===s){const h=c+t*l;return e.subarray(h,h+u*s)}const f=new o(u*s);for(let h=0;h<u;h++){const g=c+(t+h)*l;f.set(e.subarray(g,g+s),h*s)}return f}function tn(n){if(n instanceof F)return n;if(typeof n=="number"||Array.isArray(n))return F.fromConstant(n);if(n instanceof ti)return F.fromGPUData(n);if(n instanceof mt)return F.fromGPUDataView(n);throw new Error("getGPUDataEvaluator() requires GPUDataEvaluator, GPUData, GPUDataView, number, or number[]")}function Va(n){if(!n.format)throw new Error("GPUDataEvaluator.fromGPUData() requires GPUData format metadata");if(yo(n.format)||bo(n.format))throw new Error("GPUDataEvaluator.fromGPUData() does not support variable-length input");const t=ze(n.format).byteLength;if(n.rowByteLength!==t)throw new Error(`GPUDataEvaluator.fromGPUData() requires rowByteLength ${t} for GPUData`)}function nn(n){const e=ze(n.format),t=Je(e.signedDataType),i=t.BYTES_PER_ELEMENT*e.components;if(e.byteLength!==i)throw new Error(`GPUDataEvaluator does not support packed vertex format ${n.format}: ${e.byteLength} physical bytes cannot expose ${e.components} ${e.signedDataType} components`);if(n.byteOffset%t.BYTES_PER_ELEMENT!==0||n.byteStride%t.BYTES_PER_ELEMENT!==0)throw new Error(`GPUDataEvaluator requires ${n.format} offset and stride aligned to ${t.BYTES_PER_ELEMENT} bytes`);return{type:e.signedDataType,size:e.components,offset:n.byteOffset,stride:n.byteStride,normalized:e.normalized,length:n.length,format:n.format}}function We(n){const e=Ga(n).buffer;return e instanceof ee?e.buffer:e}function Ga(n){const[e,...t]=n.data;if(!e||t.length>0)throw new Error(`GPUDataEvaluator requires exactly one GPUData chunk for "${n.name}"`);return e}function ja(n){const e=[];return vo(n,e,{byteOffset:0}),e}function vo(n,e,t){const i=n.source;if(i&&!(i instanceof F)&&i.name==="interleave"){for(const o of Object.values(i.inputs))o instanceof F&&vo(o,e,t);return}e.push({attribute:n.id??n.toString(),format:_o(n.type,n.size,n.normalized),byteOffset:t.byteOffset}),t.byteOffset+=n.ValueType.BYTES_PER_ELEMENT*n.size}function _o(n,e,t=!1){if(e<1||e>4)throw new Error(`Cannot synthesize a GPUVector vertex format with ${e} components`);let i=n;if(t)switch(n){case"uint8":i="unorm8";break;case"sint8":i="snorm8";break;case"uint16":i="unorm16";break;case"sint16":i="snorm16";break;case"float32":i="float32";break;default:throw new Error(`Unsupported normalized vertex format for ${n}`)}return(i==="uint8"||i==="sint8"||i==="uint16"||i==="sint16"||i==="unorm8"||i==="snorm8"||i==="unorm16"||i==="snorm16")&&e===3?`${i}x3-webgl`:`${i}${e===1?"":`x${e}`}`}function $a(n,e,t=!1){return e>=1&&e<=4?_o(n,e,t):void 0}class be{gpuDataEvaluators;format;length;id;_gpuVector;_ownsGPUDataEvaluators;_destroyed=!1;static fromGPUVector(e){if(e.bufferLayout)throw new Error(`GPUVectorEvaluator.fromGPUVector() does not accept interleaved vector "${e.name}"`);if(e.data.length===0)throw new Error(`GPUVectorEvaluator.fromGPUVector() requires GPUData for "${e.name}"`);return new be({id:e.name,gpuDataEvaluators:e.data.map(t=>F.fromGPUData(t,{id:e.name})),gpuVector:e,format:e.format})}static fromGPUDataEvaluators(e,t={}){return new be({id:t.id,gpuDataEvaluators:e,format:t.format})}constructor({id:e,gpuDataEvaluators:t,gpuVector:i,format:o}){if(t.length===0)throw new Error("GPUVectorEvaluator requires at least one GPUData evaluator");Wa(t),this.id=e,this.gpuDataEvaluators=t,this.format=o??t[0].format,this.length=t.reduce((s,r)=>s+r.length,0),this._gpuVector=i,this._ownsGPUDataEvaluators=!i}get evaluated(){return!!this._gpuVector}get gpuVector(){if(!this._gpuVector)throw new Error(`${this} not evaluated`);return this._gpuVector}mapGPUData(e){return be.fromGPUDataEvaluators(this.gpuDataEvaluators.map((t,i)=>e(t,i)),{id:this.id})}async evaluate(e,t={}){if(this._destroyed)throw new Error(`GPUVectorEvaluator ${this} already destroyed`);if(this._gpuVector)return this._gpuVector;const i=await Promise.all(this.gpuDataEvaluators.map(a=>a.evaluate(e,t))),o=i[0],s=i.map(on),r=t.format??this.format??o.format;return this._gpuVector=new Re({type:"data",name:t.name??this.id??"vector",format:r,data:s,stride:o.stride,byteStride:o.byteStride,rowByteLength:o.rowByteLength,bufferLayout:o.bufferLayout}),this._gpuVector}evaluateSync(e,t={}){if(this._destroyed)throw new Error(`GPUVectorEvaluator ${this} already destroyed`);if(this._gpuVector)return this._gpuVector;const i=this.gpuDataEvaluators.map(a=>a.evaluateSync(e,t)),o=i[0],s=i.map(on),r=t.format??this.format??o.format;return this._gpuVector=new Re({type:"data",name:t.name??this.id??"vector",format:r,data:s,stride:o.stride,byteStride:o.byteStride,rowByteLength:o.rowByteLength,bufferLayout:o.bufferLayout}),this._gpuVector}destroy(){if(this._ownsGPUDataEvaluators)for(const e of this.gpuDataEvaluators)e.destroy();this._gpuVector=void 0,this._destroyed=!0}toString(){return this.id??this.constructor.name}}function Wa(n){const e=n[0];for(const t of n.slice(1))if(t.type!==e.type||t.size!==e.size||t.normalized!==e.normalized||t.format!==e.format)throw new Error("GPUVectorEvaluator requires matching GPUData evaluator layouts")}function on(n){const[e,...t]=n.data;if(!e||t.length>0)throw new Error(`GPUVectorEvaluator requires one GPUData chunk for "${n.name}"`);return e}const Ha={add:{arity:2,symbol:"arithmetic_add"},subtract:{arity:2,symbol:"arithmetic_subtract"},multiply:{arity:2,symbol:"arithmetic_multiply"},divide:{arity:2,symbol:"arithmetic_divide"},pow:{arity:2,symbol:"pow"},sqrt:{arity:1,symbol:"sqrt"},abs:{arity:1,symbol:"abs"},sin:{arity:1,symbol:"sin"},cos:{arity:1,symbol:"cos"},tan:{arity:1,symbol:"arithmetic_tan"},exp:{arity:1,symbol:"exp"},log:{arity:1,symbol:"log"}};function _i({elementWise:n,func:e,inputs:t,output:i,outputBuffer:o}){const s=Array.isArray(t)?t:Object.values(t);for(const y of s)if(!y.value)throw new Error(`${y} does not have CPU value`);const r=i.length,a=i.size,l=new i.ValueType(r*a);for(let y=0;y<r;y++){const b=s.map(w=>W(w,y));if(n)for(let w=0;w<a;w++)l[y*a+w]=e.apply(null,b.map(S=>S[w]));else e.call(null,l.subarray(y*a,y*a+a),...b)}const c=i.ValueType.BYTES_PER_ELEMENT,u=i.offset/c,f=i.stride/c,h=a;let g=l;if(u!==0||f!==h){g=new i.ValueType(u+i.byteLength/c);for(let y=0;y<r;y++){const b=y*h,w=u+y*f,S=l.subarray(b,b+a);g.set(S,w),o.write(S,w*c)}}else o.write(l);return{success:!0,value:g}}function W(n,e){const t=n.value,i=n.size,o=n.offset/n.ValueType.BYTES_PER_ELEMENT,s=n.stride/n.ValueType.BYTES_PER_ELEMENT,r=n.isConstant?0:e,a=o+r*s,l=t.slice(a,a+i);if(!n.normalized)return l;const c=new Float32Array(i);for(let u=0;u<i;u++)c[u]=Ya(l[u],n.type);return c}function Ya(n,e){switch(e){case"uint8":return n/255;case"uint16":return n/65535;case"uint32":return n/4294967295;case"sint8":return Math.max(n/127,-1);case"sint16":return Math.max(n/32767,-1);case"sint32":return Math.max(n/2147483647,-1);case"float32":return n;default:throw new Error(`Unsupported normalized source type ${e}`)}}const qa=({inputs:n,output:e,target:t})=>{for(const o of Object.values(n.namedInputs))if(!o.value)throw new Error(`${o} does not have CPU value`);const i=new e.ValueType(e.length*e.size);for(let o=0;o<e.length;o++){const s=Object.fromEntries(Object.entries(n.namedInputs).map(([r,a])=>[r,W(a,o)]));for(let r=0;r<e.size;r++)i[o*e.size+r]=xo(n.expression,s,r)}return t.write(i),{success:!0,value:i}};function xo(n,e,t){switch(n.kind){case"input":{const i=e[n.name];return t<i.length?i[t]:i.length===1?i[0]:0}case"literal":return Array.isArray(n.value)?n.value[t]??0:n.value;case"call":{Za(n.op,n.args.length);const i=n.args.map(o=>xo(o,e,t));switch(n.op){case"add":return i[0]+i[1];case"subtract":return i[0]-i[1];case"multiply":return i[0]*i[1];case"divide":return i[0]/i[1];case"pow":return Math.pow(i[0],i[1]);case"sqrt":return Math.sqrt(i[0]);case"abs":return Math.abs(i[0]);case"sin":return Math.sin(i[0]);case"cos":return Math.cos(i[0]);case"tan":return Math.tan(i[0]);case"exp":return Math.exp(i[0]);case"log":return Math.log(i[0]);default:{const o=n.op;throw new Error(`Unsupported arithmetic op ${o}`)}}}default:{const i=n;throw new Error(`Unsupported expression node ${i.kind}`)}}}function Za(n,e){const t=Ha[n].arity;if(e!==t)throw new Error(`Arithmetic op '${n}' expects ${t} args, got ${e}`)}const Ka=({inputs:n,output:e,target:t})=>{const{sourceValues:i}=n;if(!i.value)throw new Error(`${i} does not have CPU value`);const s=new e.ValueType(e.length*e.size);if(i.length===0)return{success:!1,error:new Error(`${i} is empty`)};for(let r=0;r<i.size;r++){const a=W(i,0)[r],l=r*e.size,c=l+1;s[l]=a,s[c]=a;for(let u=1;u<i.length;u++){const f=W(i,u)[r];f<s[l]&&(s[l]=f),f>s[c]&&(s[c]=f)}}return t.write(s),{success:!0,value:s}},Xa=({inputs:n,output:e,target:t})=>_i({func:(i,o)=>{const s=i.length/2,r=new Float64Array(o.buffer);for(let a=0;a<s;a++){const l=r[a];i[a]=Math.fround(l),i[a+s]=l-i[a]}return i},inputs:n,output:e,outputBuffer:t}),Ja=async({inputs:n,output:e,target:t})=>{const{ids:i,sourceValues:o}=n,s=i.value,r=o.value;if(!s)throw new Error(`${i} does not have CPU value`);if(!r)throw new Error(`${o} does not have CPU value`);const a=new e.ValueType(e.length*e.size),l=new Array(e.size).fill(0);for(let c=0;c<e.length;c++){const u=W(i,c),f=Number(u[0]),h=Qa(f,o.length)?W(o,f):l;a.set(h,c*e.size)}return t.write(a),{success:!0,value:a}};function Qa(n,e){return Number.isInteger(n)&&n>=0&&n<e}const el=({inputs:n,output:e,target:t})=>_i({func:(i,...o)=>{let s=0;for(const r of o)i.set(r,s),s+=r.length},inputs:n,output:e,outputBuffer:t}),tl=({inputs:n,output:e,target:t})=>{const{x:i,y:o}=n,s=new e.ValueType(e.length);for(let r=0;r<e.length;r++){const a=W(i,r),l=W(o,r);let c=0;for(let u=0;u<i.size;u++)c+=a[u]*l[u];s[r]=c}return t.write(s),{success:!0,value:s}},il=({inputs:n,output:e,target:t})=>{const{x:i,y:o}=n,s=new e.ValueType(e.length);for(let r=0;r<e.length;r++){const a=W(i,r),l=W(o,r);let c=1;for(let u=0;u<i.size;u++)if(a[u]!==l[u]){c=0;break}s[r]=c}return t.write(s),{success:!0,value:s}},nl=({inputs:n,output:e,target:t})=>{const{x:i}=n,o=new e.ValueType(e.length);for(let s=0;s<e.length;s++){const r=W(i,s);let a=0;for(let l=0;l<i.size;l++)a+=r[l]*r[l];o[s]=Math.sqrt(a)}return t.write(o),{success:!0,value:o}},ol=async({inputs:n,output:e,target:t})=>{const{segments:i,vertexCount:o}=n,s=i.value;if(!s)throw new Error(`${i} does not have CPU value`);sl(s,i,o);const r=new e.ValueType(e.length*e.size);let a=0;for(let l=0;l<o;l++){for(;a+1<i.length&&s[ii(i,a+1)]<=l;)a++;const c=s[ii(i,a)],u=l*e.size;r[u]=a,r[u+1]=l-c}return t.write(r),{success:!0,value:r}};function sl(n,e,t){if(e.length<1)throw new Error("segmentedMap segments must contain at least one segment start");let i=0;for(let o=0;o<e.length;o++){const s=n[ii(e,o)];if(o===0&&s!==0)throw new Error(`segmentedMap segments must start at 0, got ${s}`);if(o>0&&s<i)throw new Error(`segmentedMap segments must be non-decreasing, got ${s} after ${i}`);i=s}if(i>t)throw new Error(`segmentedMap last segment start must be <= vertexCount, got ${i} > ${t}`)}function ii(n,e){return n.offset/n.ValueType.BYTES_PER_ELEMENT+e*(n.stride/n.ValueType.BYTES_PER_ELEMENT)}const rl=async({inputs:n,output:e,target:t})=>{const{condition:i,whenTrue:o,whenFalse:s}=n,r=new e.ValueType(e.length*e.size);for(let a=0;a<e.length;a++){const l=W(i,a),c=W(o,a),u=W(s,a);for(let f=0;f<e.size;f++){const h=zt(l,i.size,f);r[a*e.size+f]=h!==0?zt(c,o.size,f):zt(u,s.size,f)}}return t.write(r),{success:!0,value:r}};function zt(n,e,t){return t<e?n[t]:e===1?n[0]:0}const al=({inputs:n,output:e,target:t})=>{const i=new e.ValueType(e.length);for(let o=0;o<e.length;o++)i[o]=n.start+o*n.step;return t.write(i),{success:!0,value:i}},ll=({inputs:n,output:e,target:t})=>{const{columns:i}=n;return _i({func:(o,s)=>{for(let r=0;r<i.length;r++)o[r]=s[i[r]]},inputs:{x:n.x},output:e,outputBuffer:t})},cl=Object.freeze(Object.defineProperty({__proto__:null,arithmetic:qa,dot:tl,equalAll:il,extent:Ka,fround:Xa,gather:Ja,interleave:el,length:nl,segmentedMap:ol,select:rl,sequence:al,swizzle:ll},Symbol.toStringTag,{value:"Module"}));class ul{_modules={cpu:cl};add(e,t){const i=this._modules[e];if(typeof t.then=="function"){const s=Promise.all([Promise.resolve(i||{}),t]).then(([r,a])=>({...r,...a}));return this._modules[e]=s,s.then(r=>{this._modules[e]=r}).catch(r=>{E.error(`Failed to register ${e} backend: ${r}`)()}),s}if(i&&typeof i.then=="function"){const s=Promise.resolve(i).then(r=>({...r,...t})).then(r=>(this._modules[e]=r,r)).catch(r=>{throw E.error(`Failed to register ${e} backend: ${r}`)(),r});return this._modules[e]=s,s}const o={...i||{},...t};return this._modules[e]=o,Promise.resolve(o)}async get(e,t){let i=this._modules[e];if(!i)if(e==="webgl")i=this.add("webgl",Di(()=>import("./index-Diu6nHkN.js"),__vite__mapDeps([0,1,2,3,4,5])));else if(e==="webgpu")i=this.add("webgpu",Di(()=>import("./index-CTF6SOQe.js"),__vite__mapDeps([6,1,2,3,4,5])));else throw new Error(`${e} backend not registered`);const s=(await i)[t];if(typeof s!="function")throw new Error(`${e} backend does not implement ${t}`);return s}getSync(e,t){const i=this._modules[e];if(!i)throw new Error(`${e} backend not registered`);if(typeof i.then=="function")throw new Error(`${e} backend is not loaded yet`);const s=i[t];if(typeof s!="function")throw new Error(`${e} backend does not implement ${t}`);return s}clear(){this._modules={}}}const ni=new ul;class fl{inputs;dependencies;constructor(e){this.inputs=e,this.dependencies=Array.from(e instanceof Array?e:Object.values(e)).filter(t=>t instanceof F)}async execute(e,t){return await this._resolveDependencies(e),await this._executeWithHandler(await ni.get(this._getHandlerRegistry(e),this.name),t)}executeSync(e,t){this._resolveDependenciesSync(e);const i=this._executeWithHandler(ni.getSync(this._getHandlerRegistry(e),this.name),t);if(dl(i))throw new Error(`${this.name} returned a Promise in executeSync()`);return i}shouldExecuteOnCPU(){return this.output.length<=1&&Array.from(this.dependencies).every(e=>!!e.value)}_getHandlerRegistry(e){return this.shouldExecuteOnCPU()?"cpu":e.type}async _resolveDependencies(e){for(const i of this.dependencies)await i.evaluate(e);if(this._getHandlerRegistry(e)==="cpu"||e.type==="null")for(const i of this.dependencies)await i.ensureCPUValue()}_resolveDependenciesSync(e){for(const i of this.dependencies)i.evaluateSync(e);if(this._getHandlerRegistry(e)==="cpu"||e.type==="null")for(const i of this.dependencies)i.ensureCPUValueSync()}_executeWithHandler(e,t){return e({device:t.device,inputs:this.inputs,output:this.output,target:t})}}function dl(n){return typeof n?.then=="function"}function hl(...n){let e=gl(n.map(t=>t.type));return e[0]!=="f"&&n.some(t=>t.normalized)&&(e="float32"),{isConstant:n.every(t=>t.isConstant),type:e,size:n.reduce((t,i)=>Math.max(t,i.size),0),length:n.reduce((t,i)=>Math.max(t,i.length),0)}}function gl(n){let e=0,t=0;for(const i of n){if(i[0]==="f")return"float32";const o=i.endsWith("8")?8:i.endsWith("6")?16:32;i[0]==="u"?e=Math.max(e,o):t=Math.max(t,o)}return e&&!t?`uint${e}`:t&&e<32?`sint${Math.max(t,e*2)}`:"float32"}class pl extends fl{name="interleave";output;constructor(e){super(e);const{isConstant:t,type:i,length:o}=hl(...e);this.output=new F({isConstant:t,type:i,size:e.reduce((s,r)=>s+r.size,0),length:o,source:this})}toString(){return`_${this.inputs.join("_")}_`}}function ml(...n){if(n.length===0)throw new Error("interleave() requires at least one input");return n.length===1?tn(n[0]):new pl(n.map(tn)).output}function yl(n,e){const t=vl(e);for(const i of t)i.evaluateSync(n);return bl(t),e}function bl(n){const e=new Set(n.flatMap(xl)),t=new Set;for(const i of n)nt(i,t);for(const i of t)i.evaluated&&!e.has(i.buffer)&&i.destroy()}function vl(n){const e=new Set;return oi(n,e,new Set),Array.from(e)}function oi(n,e,t){if(Pl(n)){e.add(n);return}if(!(!n||typeof n!="object"||t.has(n))){if(t.add(n),Array.isArray(n)){for(const i of n)oi(i,e,t);return}if(_l(n))for(const i of Object.values(n))oi(i,e,t)}}function _l(n){const e=Object.getPrototypeOf(n);return e===Object.prototype||e===null}function nt(n,e){if(n instanceof be){for(const i of n.gpuDataEvaluators)nt(i,e);return}const t=n.source;if(t){if(t instanceof F){e.has(t)||(e.add(t),nt(t,e));return}for(const i of t.dependencies)e.has(i)||(e.add(i),nt(i,e))}}function xl(n){return n instanceof F?[n.buffer]:n.gpuVector.data.map(e=>e.buffer instanceof ee?e.buffer.buffer:e.buffer)}function Pl(n){return n instanceof F||n instanceof be}const wl=65535;function Ll(n,e){const t=Al(e),i=Math.max(1,Math.ceil(n)),o=Math.min(i,t),s=Math.min(Math.ceil(i/o),t),r=Math.ceil(i/o/s);if(r>t)throw new Error(`WebGPU dispatch requires ${i} workgroups, exceeding the 3D dispatch limit of ${t} per dimension`);return{x:o,y:s,z:r}}function Sl(n,e="workgroupId"){return`((${e}.z * ${n.y}u + ${e}.y) * ${n.x}u + ${e}.x)`}function Cl(n,e,t="workgroupId",i="localId"){return`(${Sl(n,t)} * ${e}u + ${i}.x)`}function Al(n){return Number.isFinite(n)&&n>0?Math.floor(n):wl}function si(n,e){switch(n){case"u32":return`${e}u`;case"f32":return Number.isInteger(e)?`${e}.0`:`${e}`;default:return`${e}`}}function vd(n,e){switch(n){case"uint32":return si("u32",Math.trunc(e));case"sint32":return`${Math.trunc(e)}`;case"float32":return si("f32",e);default:throw new Error(`WebGPU operations only support 32-bit output types, got ${n}`)}}function El(n){switch(n){case"uint32":return"0u";case"sint32":return"0";case"float32":return"0.0";default:throw new Error(`WebGPU operations only support 32-bit output types, got ${n}`)}}function ce(n){switch(n){case"uint32":return"u32";case"sint32":return"i32";case"float32":return"f32";default:throw new Error(`WebGPU operations only support 32-bit storage types, got ${n}`)}}const Vt=64,Il="GPGPU Operation Counts",Tl="Computation Runs",Bl=new jn;function Ol({module:n,elementWise:e=!1,expression:t,inputs:i,output:o,operationType:s=o.type,outputBuffer:r}){if(!n.source)throw new Error(`WebGPU computation ${n.name} requires WGSL source`);const a=Fl(i),l=a.map(([A,L])=>({name:A,input:L})),c=l.filter(({input:A})=>!A.isConstant).map((A,L)=>({...A,index:L})),u=ce(s),f=ce(o.type),h={TYPE:u,RESULT_LEN:o.size.toString()},g=Ll(Math.ceil(o.length/Vt),r.device.limits.maxComputeWorkgroupsPerDimension);for(const[A,L]of a)h[`${A.toUpperCase()}_LEN`]=L.size.toString();const y=`
${zl(n.source,h)}
${c.map(({name:A,input:L,index:B})=>Rl(A,L,B)).join(`
`)}
${l.map(({name:A,input:L})=>Ml(A,L,s)).join(`
`)}
${Dl(o,c.length)}
${Nl(o)}

@compute @workgroup_size(${Vt}) fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_id) localId: vec3<u32>
) {
  let rowIndex = ${Cl(g,Vt)};
  if (rowIndex >= ${o.length}u) {
    return;
  }

${l.map(({name:A})=>`  let ${A} = read_${A}(rowIndex);`).join(`
`)}
  var result: array<${f}, ${o.size}>;
${Ul(n.name,a,o,e,t)}
  write_result(rowIndex, result);
}
`,b=new vi(r.device,{source:y,modules:n.dependencies,shaderAssembler:Bl,shaderLayout:{bindings:[...c.map(({name:A},L)=>({name:A,type:"storage",group:0,location:L})),{name:"result",type:"storage",group:0,location:c.length}]}}),w=Object.fromEntries(c.map(({name:A,input:L})=>[A,L.buffer]));w.result=r,b.setBindings(w);const S=r.device.beginComputePass({});r.device.statsManager.getStats(Il).get(Tl).incrementCount(),b.dispatch(S,g.x,g.y,g.z),S.end(),r.device.submit(),b.destroy()}function Rl(n,e,t){if(e.isConstant)return"";const i=ce(e.type);return`@group(0) @binding(${t}) var<storage, read> ${n}: array<${i}>;`}function Ml(n,e,t){const i=ce(t),o=e.type===t?"":i,s=e.stride/e.ValueType.BYTES_PER_ELEMENT,r=e.offset/e.ValueType.BYTES_PER_ELEMENT;return e.isConstant?`fn read_${n}(_rowIndex: u32) -> array<${i}, ${e.size}> {
  return array<${i}, ${e.size}>(${kl(e,o)});
}`:`fn read_${n}(rowIndex: u32) -> array<${i}, ${e.size}> {
  var value: array<${i}, ${e.size}>;
  let rowOffset = ${r}u + rowIndex * ${s}u;
${Array.from({length:e.size},(a,l)=>o?`  value[${l}] = ${o}(${n}[rowOffset + ${l}u]);`:`  value[${l}] = ${n}[rowOffset + ${l}u];`).join(`
`)}
  return value;
}`}function Dl(n,e){const t=ce(n.type);return`@group(0) @binding(${e}) var<storage, read_write> result: array<${t}>;`}function Nl(n){const e=n.stride/n.ValueType.BYTES_PER_ELEMENT,t=n.offset/n.ValueType.BYTES_PER_ELEMENT;return`fn write_result(rowIndex: u32, value: array<${ce(n.type)}, ${n.size}>) {
  let rowOffset = ${t}u + rowIndex * ${e}u;
${Array.from({length:n.size},(o,s)=>`  result[rowOffset + ${s}u] = value[${s}];`).join(`
`)}
}`}function Ul(n,e,t,i,o){let s="";if(o)for(let r=0;r<t.size;r++)s+=`  result[${r}] = ${o(r)};
`;else if(i){const r=El(t.type),a=ce(t.type);for(let l=0;l<t.size;l++){const c=e.map(([u,f])=>l<f.size?ce(f.type)===a?`${u}[${l}]`:`${a}(${u}[${l}])`:r);s+=`  result[${l}] = ${n}(${c.join(", ")});
`}}else s+=`result = ${n}(${e.map(([r])=>r).join(", ")});`;return s.trimEnd()}function Fl(n){return Array.isArray(n)?n.map((e,t)=>[`x${t}`,e]):Object.entries(n)}function kl(n,e){const t=n.value;if(!t)throw new Error(`Constant input ${n} is missing CPU values`);return Array.from({length:n.size},(i,o)=>si(e,t[o]??0)).join(", ")}function zl(n,e){for(const t in e)n=n.replaceAll(`{${t}}`,e[t]);return n}const Vl=({inputs:n,output:e,target:t})=>{const i=n.map((l,c)=>[`x${c}`,l]);Gl(t.device.limits,i);const o=i.map(([l,c])=>`${l}: array<{TYPE}, ${c.size}>`).join(", ");let s=0;const r=i.map(([l,c])=>{const u=Array.from({length:c.size},(f,h)=>`  out[${s+h}] = ${l}[${h}];`).join(`
`);return s+=c.size,u}).join(`
`),a=`fn interleave(${o}) -> array<{TYPE}, {RESULT_LEN}> {
  var out: array<{TYPE}, {RESULT_LEN}>;
${r}
  return out;
}
`;return Ol({module:{name:"interleave",source:a},inputs:n,output:e,outputBuffer:t}),{success:!0}};function Gl(n,e){const i=e.filter(([,o])=>!o.isConstant).length+1;if(i>n.maxStorageBuffersPerShaderStage)throw new Error(`interleave() requires ${i} storage buffers, exceeding device limit ${n.maxStorageBuffersPerShaderStage}`);if(i>n.maxBindingsPerBindGroup)throw new Error(`interleave() requires ${i} bindings, exceeding bind group limit ${n.maxBindingsPerBindGroup}`)}class jl{constructor(e,{id:t,isTransitionAttribute:i}){this.packedBuffers={},this.device=e,this.id=t,this.isTransitionAttribute=i,this.device.type==="webgpu"&&ni.add("webgpu",{interleave:Vl})}hasGroups(e){return this.device.type==="webgpu"&&Object.values(e).some(t=>!!t.settings.bufferGroup)}finalize(){for(const e of Object.values(this.packedBuffers))e.packed.destroy();this.packedBuffers={}}getBufferLayouts(e,t){const i=this._getPackedGroups(e,t,{requireValues:!1,excludeAttributes:{}});return this._getBufferLayouts(e,i,t)}getBindings(e,t,i,o){const s=this._getPackedGroups(e,i,{requireValues:!0,excludeAttributes:o}),r={},a=new Set;for(const l of s.values()){const c=!this.packedBuffers[l.id]||l.attributes.some(u=>!!t[u.id]);r[l.id]=this._getPackedBuffer(l,c);for(const u of l.attributes)a.add(u.id)}return{bufferLayouts:this._getBufferLayouts(e,s,i).filter(l=>!o[l.name]&&!e[l.name]?.settings.isIndexed),buffers:r,groupedAttributeIds:a}}_getPackedGroups(e,t,{requireValues:i,excludeAttributes:o}){const s=new Map;for(const a of Object.values(e)){const l=a.settings.bufferGroup;if(!l)continue;const c=s.get(l)||[];c.push(a),s.set(l,c)}const r=new Map;for(const[a,l]of s){const c=this._getPackedGroup(a,l,t,i,o);c&&r.set(a,c)}return r}_getPackedGroup(e,t,i,o,s){if(t.length<2)return null;const r=t.map(g=>g.getBufferLayout(i)),a=r[0].stepMode,l=Math.max(1,t[0].numInstances),c=o&&t.every(g=>g.isConstant);for(let g=0;g<t.length;g++){const y=t[g],b=y.getAccessor(),w=b.size*b.bytesPerElement;if(s[y.id]||y.settings.isIndexed||y.settings.noAlloc||y.doublePrecision||this.isTransitionAttribute(y.id)||r[g].stepMode!==a||y.numInstances!==t[0].numInstances||(b.offset||0)!==0||(b.vertexOffset||0)!==0||te(b)!==w||o&&(y.isConstant?!y.getConstantValue()||y.getConstantValue().byteLength<w:!ArrayBuffer.isView(y.value)||y.value.byteLength<l*w))return null}const u={},f=[];let h=0;for(let g=0;g<t.length;g++){const y=t[g];h=sn(h),u[y.id]=h;for(const b of r[g].attributes||[])f.push({...b,byteOffset:h+(b.byteOffset||0)});h+=te(y.getAccessor())}return h=sn(h),{id:e,attributes:t,byteStride:h,byteOffsets:u,rowCount:l,layout:{name:e,byteStride:c?0:h,stepMode:a,attributes:f}}}_getBufferLayouts(e,t,i){const o=[],s=new Set,r=new Set;for(const a of t.values())for(const l of a.attributes)r.add(l.id);for(const a of Object.values(e)){const l=a.settings.bufferGroup,c=l&&t.get(l);c&&r.has(a.id)?s.has(c.id)||(o.push(c.layout),s.add(c.id)):o.push(a.getBufferLayout(i))}return o}_getPackedBuffer(e,t){const i=JSON.stringify({byteStride:e.layout.byteStride,attributes:e.layout.attributes}),o=this.packedBuffers[e.id];if((!o||o.layoutKey!==i)&&(t=!0),t){o&&(o.packed.destroy(),delete this.packedBuffers[e.id]);const s=this._interleavePackedGroup(e);return this.packedBuffers[e.id]={packed:s,layoutKey:i},s.buffer}if(!o)throw new Error(`Attribute buffer group ${e.id} has no packed buffer`);return o.packed.buffer}_interleavePackedGroup(e){const t=e.attributes.map(o=>this._getInterleaveInput(e,o)),i=ml(...t);return yl(this.device,i),i}_getInterleaveInput(e,t){const i=te(t.getAccessor()),o=e.byteOffsets[t.id];if(Ce(`${e.id}.${t.id} rowByteLength`,i),Ce(`${e.id}.${t.id} groupByteOffset`,o),t.isConstant){const l=t.getConstantValue();if(!l)throw new Error(`Attribute group ${e.id} is missing constant value ${t.id}`);return Ce(`${e.id}.${t.id} constant byteOffset`,l.byteOffset),new F({id:t.id,type:"uint32",size:i/4,isConstant:!0,value:new Uint32Array(l.buffer,l.byteOffset,i/Uint32Array.BYTES_PER_ELEMENT)})}const s=t.getBuffer(),r=t.byteOffset,a=t.getAccessor().stride||i;if(Ce(`${e.id}.${t.id} byteOffset`,r),Ce(`${e.id}.${t.id} stride`,a),!s)throw new Error(`Attribute group ${e.id} cannot interleave missing buffer ${t.id}`);return new F({id:t.id,type:"uint32",size:i/4,offset:r,stride:a,length:e.rowCount,buffer:s})}}function sn(n){return Math.ceil(n/4)*4}function Ce(n,e){if(e%4!==0)throw new Error(`Attribute buffer groups require 32-bit alignment: ${n}=${e}`)}function Gt(n){const{source:e,target:t,start:i=0,size:o,getData:s}=n,r=n.end||t.length,a=e.length,l=r-i;if(a>l){t.set(e.subarray(0,l),i);return}if(t.set(e,i),!s)return;let c=a;for(;c<l;){const u=s(c,e);for(let f=0;f<o;f++)t[i+c]=u[f]||0,c++}}function $l({source:n,target:e,size:t,getData:i,sourceStartIndices:o,targetStartIndices:s}){if(!o||!s)return Gt({source:n,target:e,size:t,getData:i}),e;let r=0,a=0;const l=i&&((u,f)=>i(u+a,f)),c=Math.min(o.length,s.length);for(let u=1;u<c;u++){const f=o[u]*t,h=s[u]*t;Gt({source:n.subarray(r,f),target:e,start:a,end:h,size:t,getData:l}),r=f,a=h}return a<e.length&&Gt({source:[],target:e,start:a,size:t,getData:l}),e}function Wl(n){const{device:e,settings:t,value:i}=n,o=new go(e,t);return o.setData({value:i instanceof Float64Array?new Float64Array(0):new Float32Array(0),normalized:t.normalized}),o}function Po(n){switch(n){case 1:return"float";case 2:return"vec2";case 3:return"vec3";case 4:return"vec4";default:throw new Error(`No defined attribute type for size "${n}"`)}}function wo(n){switch(n){case 1:return"float32";case 2:return"float32x2";case 3:return"float32x3";case 4:return"float32x4";default:throw new Error("invalid type size")}}function Lo(n){n.push(n.shift())}function Hl(n,e){const{settings:t,value:i,size:o}=n,s=n.isDoublePrecisionBuffer?2:1;let r=0;const{shaderAttributes:a}=n.settings;if(a)for(const l of Object.values(a))r=Math.max(r,l.vertexOffset??0);return(t.noAlloc?i.length:(e+r)*o)*s}function So({device:n,source:e,target:t}){return(!t||t.byteLength<e.byteLength)&&(t?.destroy(),t=n.createBuffer({byteLength:e.byteLength,usage:e.usage})),t}function Co({device:n,buffer:e,attribute:t,fromLength:i,toLength:o,fromStartIndices:s,getData:r=a=>a}){const a=t.isDoublePrecisionBuffer?2:1,l=t.size*a,c=t.byteOffset,u=t.settings.bytesPerElement<4?c/t.settings.bytesPerElement*4:c,f=t.startIndices,h=s&&f,g=t.isConstant;if(!h&&e&&i>=o)return e;const y=t.value instanceof Float64Array?Float32Array:t.value.constructor,b=g?t.value:new y(t.getBuffer().readSyncWebGL(c,o*y.BYTES_PER_ELEMENT).buffer);if(t.settings.normalized&&!g){const L=r;r=(B,k)=>t.normalizeConstant(L(B,k))}const w=g?(L,B)=>r(b,B):(L,B)=>r(b.subarray(L+c,L+c+l),B),S=e?new Float32Array(e.readSyncWebGL(u,i*4).buffer):new Float32Array(0),A=new Float32Array(o);return $l({source:S,target:A,sourceStartIndices:s,targetStartIndices:f,size:l,getData:w}),(!e||e.byteLength<A.byteLength+u)&&(e?.destroy(),e=n.createBuffer({byteLength:A.byteLength+u,usage:35050})),e.write(A,u),e}class Ao{constructor({device:e,attribute:t,timeline:i}){this.buffers=[],this.currentLength=0,this.device=e,this.transition=new gi(i),this.attribute=t,this.attributeInTransition=Wl(t),this.currentStartIndices=t.startIndices}get inProgress(){return this.transition.inProgress}start(e,t,i=1/0){this.settings=e,this.currentStartIndices=this.attribute.startIndices,this.currentLength=Hl(this.attribute,t),this.transition.start({...e,duration:i})}update(){const e=this.transition.update();return e&&this.onUpdate(),e}setBuffer(e){const{stride:t}=this.attributeInTransition.getAccessor();this.attributeInTransition.setData({buffer:e,normalized:this.attribute.settings.normalized,value:this.attributeInTransition.value,stride:t})}cancel(){this.transition.cancel()}delete(){this.cancel();for(const e of this.buffers)e.destroy();this.buffers.length=0}}class Yl extends Ao{constructor({device:e,attribute:t,timeline:i}){super({device:e,attribute:t,timeline:i}),this.type="interpolation",this.transform=Xl(e,t)}start(e,t){const i=this.currentLength,o=this.currentStartIndices;if(super.start(e,t,e.duration),e.duration<=0){this.transition.cancel();return}const{buffers:s,attribute:r}=this;Lo(s),s[0]=Co({device:this.device,buffer:s[0],attribute:r,fromLength:i,toLength:this.currentLength,fromStartIndices:o,getData:e.enter}),s[1]=So({device:this.device,source:s[0],target:s[1]}),this.setBuffer(s[1]);const{transform:a}=this,l=a.model;let c=Math.floor(this.currentLength/r.size);Eo(r)&&(c/=2),l.setVertexCount(c),r.isConstant?(l.setAttributes({aFrom:s[0]}),l.setConstantAttributes({aTo:r.value})):l.setAttributes({aFrom:s[0],aTo:r.getBuffer()}),a.transformFeedback.setBuffers({vCurrent:s[1]})}onUpdate(){const{duration:e,easing:t}=this.settings,{time:i}=this.transition;let o=i/e;t&&(o=t(o));const{model:s}=this.transform,r={time:o};s.shaderInputs.setProps({interpolation:r}),this.transform.run({discard:!0})}delete(){super.delete(),this.transform.destroy()}}const ql=`layout(std140) uniform interpolationUniforms {
  float time;
} interpolation;
`,rn={name:"interpolation",vs:ql,uniformTypes:{time:"f32"}},Zl=`#version 300 es
#define SHADER_NAME interpolation-transition-vertex-shader

in ATTRIBUTE_TYPE aFrom;
in ATTRIBUTE_TYPE aTo;
out ATTRIBUTE_TYPE vCurrent;

void main(void) {
  vCurrent = mix(aFrom, aTo, interpolation.time);
  gl_Position = vec4(0.0);
}
`,Kl=`#version 300 es
#define SHADER_NAME interpolation-transition-vertex-shader

in ATTRIBUTE_TYPE aFrom;
in ATTRIBUTE_TYPE aFrom64Low;
in ATTRIBUTE_TYPE aTo;
in ATTRIBUTE_TYPE aTo64Low;
out ATTRIBUTE_TYPE vCurrent;
out ATTRIBUTE_TYPE vCurrent64Low;

vec2 mix_fp64(vec2 a, vec2 b, float x) {
  vec2 range = sub_fp64(b, a);
  return sum_fp64(a, mul_fp64(range, vec2(x, 0.0)));
}

void main(void) {
  for (int i=0; i<ATTRIBUTE_SIZE; i++) {
    vec2 value = mix_fp64(vec2(aFrom[i], aFrom64Low[i]), vec2(aTo[i], aTo64Low[i]), interpolation.time);
    vCurrent[i] = value.x;
    vCurrent64Low[i] = value.y;
  }
  gl_Position = vec4(0.0);
}
`;function Eo(n){return n.isDoublePrecisionBuffer}function Xl(n,e){const t=e.size,i=Po(t),o=wo(t),s=e.getBufferLayout();return Eo(e)?new ge(n,{vs:Kl,bufferLayout:[{name:"aFrom",byteStride:8*t,attributes:[{attribute:"aFrom",format:o,byteOffset:0},{attribute:"aFrom64Low",format:o,byteOffset:4*t}]},{name:"aTo",byteStride:8*t,attributes:[{attribute:"aTo",format:o,byteOffset:0},{attribute:"aTo64Low",format:o,byteOffset:4*t}]}],modules:[rr,rn],defines:{ATTRIBUTE_TYPE:i,ATTRIBUTE_SIZE:t},moduleSettings:{},varyings:["vCurrent","vCurrent64Low"],bufferMode:35980,disableWarnings:!0}):new ge(n,{vs:Zl,bufferLayout:[{name:"aFrom",format:o},{name:"aTo",format:s.attributes[0].format}],modules:[rn],defines:{ATTRIBUTE_TYPE:i},varyings:["vCurrent"],disableWarnings:!0})}class Jl extends Ao{constructor({device:e,attribute:t,timeline:i}){super({device:e,attribute:t,timeline:i}),this.type="spring",this.texture=oc(e),this.framebuffer=sc(e,this.texture),this.transform=nc(e,t)}start(e,t){const i=this.currentLength,o=this.currentStartIndices;super.start(e,t);const{buffers:s,attribute:r}=this;for(let l=0;l<2;l++)s[l]=Co({device:this.device,buffer:s[l],attribute:r,fromLength:i,toLength:this.currentLength,fromStartIndices:o,getData:e.enter});s[2]=So({device:this.device,source:s[0],target:s[2]}),this.setBuffer(s[1]);const{model:a}=this.transform;a.setVertexCount(Math.floor(this.currentLength/r.size)),r.isConstant?a.setConstantAttributes({aTo:r.value}):a.setAttributes({aTo:r.getBuffer()})}onUpdate(){const{buffers:e,transform:t,framebuffer:i,transition:o}=this,s=this.settings;t.model.setAttributes({aPrev:e[0],aCur:e[1]}),t.transformFeedback.setBuffers({vNext:e[2]});const r={stiffness:s.stiffness,damping:s.damping};t.model.shaderInputs.setProps({spring:r}),t.run({framebuffer:i,discard:!1,parameters:{viewport:[0,0,1,1]},clearColor:[0,0,0,0]}),Lo(e),this.setBuffer(e[1]),this.device.readPixelsToArrayWebGL(i)[0]>0||o.end()}delete(){super.delete(),this.transform.destroy(),this.texture.destroy(),this.framebuffer.destroy()}}const Ql=`layout(std140) uniform springUniforms {
  float damping;
  float stiffness;
} spring;
`,ec={name:"spring",vs:Ql,uniformTypes:{damping:"f32",stiffness:"f32"}},tc=`#version 300 es
#define SHADER_NAME spring-transition-vertex-shader

#define EPSILON 0.00001

in ATTRIBUTE_TYPE aPrev;
in ATTRIBUTE_TYPE aCur;
in ATTRIBUTE_TYPE aTo;
out ATTRIBUTE_TYPE vNext;
out float vIsTransitioningFlag;

ATTRIBUTE_TYPE getNextValue(ATTRIBUTE_TYPE cur, ATTRIBUTE_TYPE prev, ATTRIBUTE_TYPE dest) {
  ATTRIBUTE_TYPE velocity = cur - prev;
  ATTRIBUTE_TYPE delta = dest - cur;
  ATTRIBUTE_TYPE force = delta * spring.stiffness;
  ATTRIBUTE_TYPE resistance = velocity * spring.damping;
  return force - resistance + velocity + cur;
}

void main(void) {
  bool isTransitioning = length(aCur - aPrev) > EPSILON || length(aTo - aCur) > EPSILON;
  vIsTransitioningFlag = isTransitioning ? 1.0 : 0.0;

  vNext = getNextValue(aCur, aPrev, aTo);
  gl_Position = vec4(0, 0, 0, 1);
  gl_PointSize = 100.0;
}
`,ic=`#version 300 es
#define SHADER_NAME spring-transition-is-transitioning-fragment-shader

in float vIsTransitioningFlag;

out vec4 fragColor;

void main(void) {
  if (vIsTransitioningFlag == 0.0) {
    discard;
  }
  fragColor = vec4(1.0);
}`;function nc(n,e){const t=Po(e.size),i=wo(e.size);return new ge(n,{vs:tc,fs:ic,bufferLayout:[{name:"aPrev",format:i},{name:"aCur",format:i},{name:"aTo",format:e.getBufferLayout().attributes[0].format}],varyings:["vNext"],modules:[ec],defines:{ATTRIBUTE_TYPE:t},parameters:{depthCompare:"always",blendColorOperation:"max",blendColorSrcFactor:"one",blendColorDstFactor:"one",blendAlphaOperation:"max",blendAlphaSrcFactor:"one",blendAlphaDstFactor:"one"}})}function oc(n){return n.createTexture({data:new Uint8Array(4),format:"rgba8unorm",width:1,height:1})}function sc(n,e){return n.createFramebuffer({id:"spring-transition-is-transitioning-framebuffer",width:1,height:1,colorAttachments:[e]})}const rc={interpolation:Yl,spring:Jl};class ac{constructor(e,{id:t,timeline:i}){if(!e)throw new Error("AttributeTransitionManager is constructed without device");this.id=t,this.device=e,this.timeline=i,this.transitions={},this.needsRedraw=!1,this.numInstances=1}finalize(){for(const e in this.transitions)this._removeTransition(e)}update({attributes:e,transitions:t,numInstances:i}){this.numInstances=i||1;for(const o in e){const s=e[o],r=s.getTransitionSetting(t);r&&this._updateAttribute(o,s,r)}for(const o in this.transitions){const s=e[o];(!s||!s.getTransitionSetting(t))&&this._removeTransition(o)}}hasAttribute(e){const t=this.transitions[e];return t&&t.inProgress}getAttributes(){const e={};for(const t in this.transitions){const i=this.transitions[t];i.inProgress&&(e[t]=i.attributeInTransition)}return e}run(){if(this.numInstances===0)return!1;for(const t in this.transitions)this.transitions[t].update()&&(this.needsRedraw=!0);const e=this.needsRedraw;return this.needsRedraw=!1,e}_removeTransition(e){this.transitions[e].delete(),delete this.transitions[e]}_updateAttribute(e,t,i){const o=this.transitions[e];let s=!o||o.type!==i.type;if(s){o&&this._removeTransition(e);const r=rc[i.type];r?this.transitions[e]=new r({attribute:t,timeline:this.timeline,device:this.device}):(H.error(`unsupported transition type '${i.type}'`)(),s=!1)}(s||t.needsRedraw())&&(this.needsRedraw=!0,this.transitions[e].start(i,this.numInstances))}}const an="attributeManager.invalidate",lc="attributeManager.updateStart",cc="attributeManager.updateEnd",uc="attribute.updateStart",fc="attribute.allocate",dc="attribute.updateEnd";class Io{constructor(e,{id:t="attribute-manager",stats:i,timeline:o}={}){this.mergeBoundsMemoized=$n(vs),this.id=t,this.device=e,this.attributes={},this.updateTriggers={},this.needsRedraw=!0,this.userData={},this.stats=i,this.attributeTransitionManager=new ac(e,{id:`${t}-transitions`,timeline:o}),this.attributeBufferGroups=e.type==="webgpu"?new jl(e,{id:t,isTransitionAttribute:s=>this.attributeTransitionManager.hasAttribute(s)}):null,Object.seal(this)}finalize(){this.attributeBufferGroups?.finalize();for(const e in this.attributes)this.attributes[e].delete();this.attributeTransitionManager.finalize()}getNeedsRedraw(e={clearRedrawFlags:!1}){const t=this.needsRedraw;return this.needsRedraw=this.needsRedraw&&!e.clearRedrawFlags,t&&this.id}setNeedsRedraw(){this.needsRedraw=!0}add(e){this._add(e)}addInstanced(e){this._add(e,{stepMode:"instance"})}remove(e){for(const t of e)this.attributes[t]!==void 0&&(this.attributes[t].delete(),delete this.attributes[t])}invalidate(e,t){const i=this._invalidateTrigger(e,t);q(an,this,e,i)}invalidateAll(e){for(const t in this.attributes)this.attributes[t].setNeedsUpdate(t,e);q(an,this,"all")}update({data:e,numInstances:t,startIndices:i=null,transitions:o,props:s={},buffers:r={},context:a={}}){let l=!1;q(lc,this),this.stats&&this.stats.get("Update Attributes").timeStart();for(const c in this.attributes){const u=this.attributes[c],f=u.settings.accessor;u.startIndices=i,u.numInstances=t,s[c]&&H.removed(`props.${c}`,`data.attributes.${c}`)(),u.setExternalBuffer(r[c])||u.setBinaryValue(typeof f=="string"?r[f]:void 0,e.startIndices)||typeof f=="string"&&!r[f]&&u.setConstantValue(a,s[f])||u.needsUpdate()&&(l=!0,this._updateAttribute({attribute:u,numInstances:t,data:e,props:s,context:a})),this.needsRedraw=this.needsRedraw||u.needsRedraw()}l&&q(cc,this,t),this.stats&&(this.stats.get("Update Attributes").timeEnd(),l&&this.stats.get("Attributes updated").incrementCount()),this.attributeTransitionManager.update({attributes:this.attributes,numInstances:t,transitions:o})}updateTransition(){const{attributeTransitionManager:e}=this,t=e.run();return this.needsRedraw=this.needsRedraw||t,t}getAttributes(){return{...this.attributes,...this.attributeTransitionManager.getAttributes()}}getBounds(e){const t=e.map(i=>this.attributes[i]?.getBounds());return this.mergeBoundsMemoized(t)}getChangedAttributes(e={clearChangedFlags:!1}){const{attributes:t,attributeTransitionManager:i}=this,o={...i.getAttributes()};for(const s in t){const r=t[s];r.needsRedraw(e)&&!i.hasAttribute(s)&&(o[s]=r)}return o}getBufferLayouts(e){return this.hasBufferGroups()?this.attributeBufferGroups.getBufferLayouts(this.getAttributes(),e):Object.values(this.getAttributes()).map(t=>t.getBufferLayout(e))}hasBufferGroups(){return!!this.attributeBufferGroups?.hasGroups(this.attributes)}getBufferGroupBindings(e,t,i={}){return this.attributeBufferGroups?this.attributeBufferGroups.getBindings(this.getAttributes(),e,t,i):{bufferLayouts:this.getBufferLayouts(t),buffers:{},groupedAttributeIds:new Set}}_add(e,t){for(const i in e){const o=e[i],s={...o,id:i,size:o.isIndexed&&1||o.size||1,...t};this.attributes[i]=new go(this.device,s)}this._mapUpdateTriggersToAttributes()}_mapUpdateTriggersToAttributes(){const e={};for(const t in this.attributes)this.attributes[t].getUpdateTriggers().forEach(o=>{e[o]||(e[o]=[]),e[o].push(t)});this.updateTriggers=e}_invalidateTrigger(e,t){const{attributes:i,updateTriggers:o}=this,s=o[e];return s&&s.forEach(r=>{const a=i[r];a&&a.setNeedsUpdate(a.id,t)}),s}_updateAttribute(e){const{attribute:t,numInstances:i}=e;if(q(uc,t),t.constant){t.setConstantValue(e.context,t.value);return}t.allocate(i)&&q(fc,t,i),t.updateBuffer(e)&&(this.needsRedraw=!0,q(dc,t,i))}}class hc extends gi{get value(){return this._value}_onUpdate(){const{time:e,settings:{fromValue:t,toValue:i,duration:o,easing:s}}=this,r=s(e/o);this._value=_s(t,i,r)}}const ln=1e-5;function cn(n,e,t,i,o){const s=e-n,a=(t-e)*o,l=-s*i;return a+l+s+e}function gc(n,e,t,i,o){if(Array.isArray(t)){const s=[];for(let r=0;r<t.length;r++)s[r]=cn(n[r],e[r],t[r],i,o);return s}return cn(n,e,t,i,o)}function un(n,e){if(Array.isArray(n)){let t=0;for(let i=0;i<n.length;i++){const o=n[i]-e[i];t+=o*o}return Math.sqrt(t)}return Math.abs(n-e)}class pc extends gi{get value(){return this._currValue}_onUpdate(){const{fromValue:e,toValue:t,damping:i,stiffness:o}=this.settings,{_prevValue:s=e,_currValue:r=e}=this;let a=gc(s,r,t,i,o);const l=un(a,t),c=un(a,r);l<ln&&c<ln&&(a=t,this.end()),this._prevValue=r,this._currValue=a}}const mc={interpolation:hc,spring:pc};class yc{constructor(e){this.transitions=new Map,this.timeline=e}get active(){return this.transitions.size>0}add(e,t,i,o){const{transitions:s}=this;if(s.has(e)){const l=s.get(e),{value:c=l.settings.fromValue}=l;t=c,this.remove(e)}if(o=ho(o),!o)return;const r=mc[o.type];if(!r){H.error(`unsupported transition type '${o.type}'`)();return}const a=new r(this.timeline);a.start({...o,fromValue:t,toValue:i}),s.set(e,a)}remove(e){const{transitions:t}=this;t.has(e)&&(t.get(e).cancel(),t.delete(e))}update(){const e={};for(const[t,i]of this.transitions)i.update(),e[t]=i.value,i.inProgress||this.remove(t);return e}clear(){for(const e of this.transitions.keys())this.remove(e)}}function bc(n){const e=n[ae];for(const t in e){const i=e[t],{validate:o}=i;if(o&&!o(n[t],i))throw new Error(`Invalid prop ${t}: ${n[t]}`)}}function vc(n,e){const t=To({newProps:n,oldProps:e,propTypes:n[ae],ignoreProps:{data:null,updateTriggers:null,extensions:null,transitions:null}}),i=xc(n,e);let o=!1;return i||(o=Pc(n,e)),{dataChanged:i,propsChanged:t,updateTriggersChanged:o,extensionsChanged:wc(n,e),transitionsChanged:_c(n,e)}}function _c(n,e){if(!n.transitions)return!1;const t={},i=n[ae];let o=!1;for(const s in n.transitions){const r=i[s],a=r&&r.type;(a==="number"||a==="color"||a==="array")&&ri(n[s],e[s],r)&&(t[s]=!0,o=!0)}return o?t:!1}function To({newProps:n,oldProps:e,ignoreProps:t={},propTypes:i={},triggerName:o="props"}){if(e===n)return!1;if(typeof n!="object"||n===null)return`${o} changed shallowly`;if(typeof e!="object"||e===null)return`${o} changed shallowly`;for(const s of Object.keys(n))if(!(s in t)){if(!(s in e))return`${o}.${s} added`;const r=ri(n[s],e[s],i[s]);if(r)return`${o}.${s} ${r}`}for(const s of Object.keys(e))if(!(s in t)){if(!(s in n))return`${o}.${s} dropped`;if(!Object.hasOwnProperty.call(n,s)){const r=ri(n[s],e[s],i[s]);if(r)return`${o}.${s} ${r}`}}return!1}function ri(n,e,t){let i=t&&t.equal;return i&&!i(n,e,t)||!i&&(i=n&&e&&n.equals,i&&!i.call(n,e))?"changed deeply":!i&&e!==n?"changed shallowly":null}function xc(n,e){if(e===null)return"oldProps is null, initial diff";let t=!1;const{dataComparator:i,_dataDiff:o}=n;return i?i(n.data,e.data)||(t="Data comparator detected a change"):n.data!==e.data&&(t="A new data container was supplied"),t&&o&&(t=o(n.data,e.data)||t),t}function Pc(n,e){if(e===null)return{all:!0};if("all"in n.updateTriggers&&fn(n,e,"all"))return{all:!0};const t={};let i=!1;for(const o in n.updateTriggers)o!=="all"&&fn(n,e,o)&&(t[o]=!0,i=!0);return i?t:!1}function wc(n,e){if(e===null)return!0;const t=e.extensions,{extensions:i}=n;if(i===t)return!1;if(!t||!i||i.length!==t.length)return!0;for(let o=0;o<i.length;o++)if(!i[o].equals(t[o]))return!0;return!1}function fn(n,e,t){let i=n.updateTriggers[t];i=i??{};let o=e.updateTriggers[t];return o=o??{},To({oldProps:o,newProps:i,triggerName:t})}const Lc="count(): argument not an object",Sc="count(): argument not a container";function Cc(n){if(!Ec(n))throw new Error(Lc);if(typeof n.count=="function")return n.count();if(Number.isFinite(n.size))return n.size;if(Number.isFinite(n.length))return n.length;if(Ac(n))return Object.keys(n).length;throw new Error(Sc)}function Ac(n){return n!==null&&typeof n=="object"&&n.constructor===Object}function Ec(n){return n!==null&&typeof n=="object"}function dn(n,e){if(!e)return n;const t={...n,...e};if("defines"in e&&(t.defines={...n.defines,...e.defines}),"modules"in e&&(t.modules=(n.modules||[]).concat(e.modules),e.modules.some(i=>i.name==="project64"))){const i=t.modules.findIndex(o=>o.name==="project32");i>=0&&t.modules.splice(i,1)}if("inject"in e)if(!n.inject)t.inject=e.inject;else{const i={...n.inject};for(const o in e.inject)i[o]=(i[o]||"")+e.inject[o];t.inject=i}return t}const Ic={minFilter:"linear",mipmapFilter:"linear",magFilter:"linear",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge"},ai={};function Tc(n,e,t,i){if(t instanceof hi)return t;t.constructor&&t.constructor.name!=="Object"&&(t={data:t});let o=null;t.compressed&&(o={minFilter:"linear",mipmapFilter:t.data.length>1?"nearest":"linear"});const{width:s,height:r}=t.data,a=e.createTexture({...t,sampler:{...Ic,...o,...i},mipLevels:e.getMipLevelCount(s,r)});return e.type==="webgl"?a.generateMipmapsWebGL():e.type==="webgpu"&&e.generateMipmapsWebGPU(a),ai[a.id]=n,a}function Bc(n,e){!e||!(e instanceof hi)||ai[e.id]===n&&(e.delete(),delete ai[e.id])}const Oc={boolean:{validate(n,e){return!0},equal(n,e,t){return!!n==!!e}},number:{validate(n,e){return Number.isFinite(n)&&(!("max"in e)||n<=e.max)&&(!("min"in e)||n>=e.min)}},color:{validate(n,e){return e.optional&&!n||li(n)&&(n.length===3||n.length===4)},equal(n,e,t){return de(n,e,1)}},accessor:{validate(n,e){const t=yt(n);return t==="function"||t===yt(e.value)},equal(n,e,t){return typeof e=="function"?!0:de(n,e,1)}},array:{validate(n,e){return e.optional&&!n||li(n)},equal(n,e,t){const{compare:i}=t,o=Number.isInteger(i)?i:i?1:0;return i?de(n,e,o):n===e}},object:{equal(n,e,t){if(t.ignore)return!0;const{compare:i}=t,o=Number.isInteger(i)?i:i?1:0;return i?de(n,e,o):n===e}},function:{validate(n,e){return e.optional&&!n||typeof n=="function"},equal(n,e,t){return!t.compare&&t.ignore!==!1||n===e}},data:{transform:(n,e,t)=>{if(!n)return n;const{dataTransform:i}=t.props;return i?i(n):typeof n.shape=="string"&&n.shape.endsWith("-table")&&Array.isArray(n.data)?n.data:n}},image:{transform:(n,e,t)=>{const i=t.context;return!i||!i.device?null:Tc(t.id,i.device,n,{...e.parameters,...t.props.textureParameters})},release:(n,e,t)=>{Bc(t.id,n)}}};function Rc(n){const e={},t={},i={};for(const[o,s]of Object.entries(n)){const r=s?.deprecatedFor;if(r)i[o]=Array.isArray(r)?r:[r];else{const a=Mc(o,s);e[o]=a,t[o]=a.value}}return{propTypes:e,defaultProps:t,deprecatedProps:i}}function Mc(n,e){switch(yt(e)){case"object":return Ae(n,e);case"array":return Ae(n,{type:"array",value:e,compare:!1});case"boolean":return Ae(n,{type:"boolean",value:e});case"number":return Ae(n,{type:"number",value:e});case"function":return Ae(n,{type:"function",value:e,compare:!0});default:return{name:n,type:"unknown",value:e}}}function Ae(n,e){return"type"in e?{name:n,...Oc[e.type],...e}:"value"in e?{name:n,type:yt(e.value),...e}:{name:n,type:"object",value:e}}function li(n){return Array.isArray(n)||ArrayBuffer.isView(n)}function yt(n){return li(n)?"array":n===null?"null":typeof n}function Dc(n,e){let t;for(let s=e.length-1;s>=0;s--){const r=e[s];"extensions"in r&&(t=r.extensions)}const i=ci(n.constructor,t),o=Object.create(i);o[ft]=n,o[he]={},o[se]={};for(let s=0;s<e.length;++s){const r=e[s];for(const a in r)o[a]=r[a]}return Object.freeze(o),o}const Nc="_mergedDefaultProps";function ci(n,e){if(!(n instanceof St.constructor))return{};let t=Nc;if(e)for(const o of e){const s=o.constructor;s&&(t+=`:${s.extensionName||s.name}`)}const i=Bo(n,t);return i||(n[t]=Uc(n,e||[]))}function Uc(n,e){if(!n.prototype)return null;const i=Object.getPrototypeOf(n),o=ci(i),s=Bo(n,"defaultProps")||{},r=Rc(s),a=Object.assign(Object.create(null),o,r.defaultProps),l=Object.assign(Object.create(null),o?.[ae],r.propTypes),c=Object.assign(Object.create(null),o?.[Et],r.deprecatedProps);for(const u of e){const f=ci(u.constructor);f&&(Object.assign(a,f),Object.assign(l,f[ae]),Object.assign(c,f[Et]))}return Fc(a,n),zc(a,l),kc(a,c),a[ae]=l,a[Et]=c,e.length===0&&!xi(n,"_propTypes")&&(n._propTypes=l),a}function Fc(n,e){const t=Gc(e);Object.defineProperties(n,{id:{writable:!0,value:t}})}function kc(n,e){for(const t in e)Object.defineProperty(n,t,{enumerable:!1,set(i){const o=`${this.id}: ${t}`;for(const s of e[t])xi(this,s)||(this[s]=i);H.deprecated(o,e[t].join("/"))()}})}function zc(n,e){const t={},i={};for(const o in e){const s=e[o],{name:r,value:a}=s;s.async&&(t[r]=a,i[r]=Vc(r))}n[ye]=t,n[he]={},Object.defineProperties(n,i)}function Vc(n){return{enumerable:!0,set(e){typeof e=="string"||e instanceof Promise||uo(e)?this[he][n]=e:this[se][n]=e},get(){if(this[se]){if(n in this[se])return this[se][n]||this[ye][n];if(n in this[he]){const e=this[ft]&&this[ft].internalState;if(e&&e.hasAsyncProp(n))return e.getAsyncProp(n)||this[ye][n]}}return this[ye][n]}}}function xi(n,e){return Object.prototype.hasOwnProperty.call(n,e)}function Bo(n,e){return xi(n,e)&&n[e]}function Gc(n){const e=n.componentName;return e||H.warn(`${n.name}.componentName not specified`)(),e||n.name}let jc=0;class St{constructor(...e){this.props=Dc(this,e),this.id=this.props.id,this.count=jc++}clone(e){const{props:t}=this,i={};for(const o in t[ye])o in t[se]?i[o]=t[se][o]:o in t[he]&&(i[o]=t[he][o]);return new this.constructor({...t,...i,...e})}}St.componentName="Component";St.defaultProps={};const $c=Object.freeze({});class Wc{constructor(e){this.component=e,this.asyncProps={},this.onAsyncPropUpdated=()=>{},this.oldProps=null,this.oldAsyncProps=null}finalize(){for(const e in this.asyncProps){const t=this.asyncProps[e];t&&t.type&&t.type.release&&t.type.release(t.resolvedValue,t.type,this.component)}this.asyncProps={},this.component=null,this.resetOldProps()}getOldProps(){return this.oldAsyncProps||this.oldProps||$c}resetOldProps(){this.oldAsyncProps=null,this.oldProps=this.component?this.component.props:null}hasAsyncProp(e){return e in this.asyncProps}getAsyncProp(e){const t=this.asyncProps[e];return t&&t.resolvedValue}isAsyncPropLoading(e){if(e){const t=this.asyncProps[e];return!!(t&&t.pendingLoadCount>0&&t.pendingLoadCount!==t.resolvedLoadCount)}for(const t in this.asyncProps)if(this.isAsyncPropLoading(t))return!0;return!1}reloadAsyncProp(e,t){this._watchPromise(e,Promise.resolve(t))}setAsyncProps(e){this.component=e[ft]||this.component;const t=e[se]||{},i=e[he]||e,o=e[ye]||{};for(const s in t){const r=t[s];this._createAsyncPropData(s,o[s]),this._updateAsyncProp(s,r),t[s]=this.getAsyncProp(s)}for(const s in i){const r=i[s];this._createAsyncPropData(s,o[s]),this._updateAsyncProp(s,r)}}_fetch(e,t){return null}_onResolve(e,t){}_onError(e,t){}_updateAsyncProp(e,t){if(this._didAsyncInputValueChange(e,t)){if(typeof t=="string"&&(t=this._fetch(e,t)),t instanceof Promise){this._watchPromise(e,t);return}if(uo(t)){this._resolveAsyncIterable(e,t);return}this._setPropValue(e,t)}}_freezeAsyncOldProps(){if(!this.oldAsyncProps&&this.oldProps){this.oldAsyncProps=Object.create(this.oldProps);for(const e in this.asyncProps)Object.defineProperty(this.oldAsyncProps,e,{enumerable:!0,value:this.oldProps[e]})}}_didAsyncInputValueChange(e,t){const i=this.asyncProps[e];return t===i.resolvedValue||t===i.lastValue?!1:(i.lastValue=t,!0)}_setPropValue(e,t){this._freezeAsyncOldProps();const i=this.asyncProps[e];i&&(t=this._postProcessValue(i,t),i.resolvedValue=t,i.pendingLoadCount++,i.resolvedLoadCount=i.pendingLoadCount)}_setAsyncPropValue(e,t,i){const o=this.asyncProps[e];o&&i>=o.resolvedLoadCount&&t!==void 0&&(this._freezeAsyncOldProps(),o.resolvedValue=t,o.resolvedLoadCount=i,this.onAsyncPropUpdated(e,t))}_watchPromise(e,t){const i=this.asyncProps[e];if(i){i.pendingLoadCount++;const o=i.pendingLoadCount;t.then(s=>{this.component&&(s=this._postProcessValue(i,s),this._setAsyncPropValue(e,s,o),this._onResolve(e,s))}).catch(s=>{this._onError(e,s)})}}async _resolveAsyncIterable(e,t){if(e!=="data"){this._setPropValue(e,t);return}const i=this.asyncProps[e];if(!i)return;i.pendingLoadCount++;const o=i.pendingLoadCount;let s=[],r=0;for await(const a of t){if(!this.component)return;const{dataTransform:l}=this.component.props;l?s=l(a,s):s=s.concat(a),Object.defineProperty(s,"__diff",{enumerable:!1,value:[{startRow:r,endRow:s.length}]}),r=s.length,this._setAsyncPropValue(e,s,o)}this._onResolve(e,s)}_postProcessValue(e,t){const i=e.type;return i&&this.component&&(i.release&&i.release(e.resolvedValue,i,this.component),i.transform)?i.transform(t,i,this.component):t}_createAsyncPropData(e,t){if(!this.asyncProps[e]){const o=this.component&&this.component.props[ae];this.asyncProps[e]={type:o&&o[e],lastValue:null,resolvedValue:t,pendingLoadCount:0,resolvedLoadCount:0}}}}class Hc extends Wc{constructor({attributeManager:e,layer:t}){super(t),this.attributeManager=e,this.needsRedraw=!0,this.needsUpdate=!0,this.subLayers=null,this.usesPickingColorCache=!1,this.disabledPickingIndices=[]}get layer(){return this.component}_fetch(e,t){const i=this.layer,o=i?.props.fetch;return o?o(t,{propName:e,layer:i}):super._fetch(e,t)}_onResolve(e,t){const i=this.layer;if(i){const o=i.props.onDataLoad;e==="data"&&o&&o(t,{propName:e,layer:i})}}_onError(e,t){const i=this.layer;i&&i.raiseError(t,`loading ${e} of ${this.layer}`)}}const Yc="layer.changeFlag",qc="layer.initialize",Zc="layer.update",Kc="layer.finalize",Xc="layer.matched",hn=2**24-1,Jc=Object.freeze([]),Qc=$n(({oldViewport:n,viewport:e})=>n.equals(e));let K=new Uint8ClampedArray(0);function gn(n){return n.rowIndexes||n.pickingColors||n.instancePickingColors}function jt(n){return n.rowIndexes}function $t(n){return n.pickingColors||n.instancePickingColors}const eu={data:{type:"data",value:Jc,async:!0},dataComparator:{type:"function",value:null,optional:!0},_dataDiff:{type:"function",value:n=>n&&n.__diff,optional:!0},dataTransform:{type:"function",value:null,optional:!0},onDataLoad:{type:"function",value:null,optional:!0},onError:{type:"function",value:null,optional:!0},fetch:{type:"function",value:(n,{propName:e,layer:t,loaders:i,loadOptions:o,signal:s})=>{const{resourceManager:r}=t.context;o=o||t.getLoadOptions(),i=i||t.props.loaders,s&&(o={...o,core:{...o?.core,fetch:{...o?.core?.fetch,signal:s}}});let a=r.contains(n);return!a&&!o&&(r.add({resourceId:n,data:Ui(n,i),persistent:!1}),a=!0),a?r.subscribe({resourceId:n,onChange:l=>t.internalState?.reloadAsyncProp(e,l),consumerId:t.id,requestId:e}):Ui(n,i,o)}},updateTriggers:{},visible:!0,pickable:!1,opacity:{type:"number",min:0,max:1,value:1},operation:"draw",onHover:{type:"function",value:null,optional:!0},onClick:{type:"function",value:null,optional:!0},onDragStart:{type:"function",value:null,optional:!0},onDrag:{type:"function",value:null,optional:!0},onDragEnd:{type:"function",value:null,optional:!0},coordinateSystem:"default",coordinateOrigin:{type:"array",value:[0,0,0],compare:!0},modelMatrix:{type:"array",value:null,compare:!0,optional:!0},wrapLongitude:!1,positionFormat:"XYZ",colorFormat:"RGBA",parameters:{type:"object",value:{},optional:!0,compare:2},loadOptions:{type:"object",value:null,optional:!0,ignore:!0},transitions:null,extensions:[],loaders:{type:"array",value:[],optional:!0,ignore:!0},getPolygonOffset:{type:"function",value:({layerIndex:n})=>[0,-n*100]},highlightedObjectIndex:null,autoHighlight:!1,highlightColor:{type:"accessor",value:[0,0,128,128]}};class ue extends St{constructor(){super(...arguments),this.internalState=null,this.lifecycle=xs.NO_STATE,this.parent=null}static get componentName(){return Object.prototype.hasOwnProperty.call(this,"layerName")?this.layerName:""}get root(){let e=this;for(;e.parent;)e=e.parent;return e}toString(){return`${this.constructor.layerName||this.constructor.name}({id: '${this.props.id}'})`}project(e){oe(this.internalState);const t=this.internalState.viewport||this.context.viewport,i=yi(e,{viewport:t,modelMatrix:this.props.modelMatrix,coordinateOrigin:this.props.coordinateOrigin,coordinateSystem:this.props.coordinateSystem}),[o,s,r]=Ps(i,t.pixelProjectionMatrix);return e.length===2?[o,s]:[o,s,r]}unproject(e){return oe(this.internalState),(this.internalState.viewport||this.context.viewport).unproject(e)}projectPosition(e,t){oe(this.internalState);const i=this.internalState.viewport||this.context.viewport;return Rr(e,{viewport:i,modelMatrix:this.props.modelMatrix,coordinateOrigin:this.props.coordinateOrigin,coordinateSystem:this.props.coordinateSystem,...t})}get isComposite(){return!1}get isDrawable(){return!0}setState(e){this.setChangeFlags({stateChanged:!0}),Object.assign(this.state,e),this.setNeedsRedraw()}setNeedsRedraw(){this.internalState&&(this.internalState.needsRedraw=!0)}setNeedsUpdate(){this.internalState&&(this.context.layerManager.setNeedsUpdate(String(this)),this.internalState.needsUpdate=!0)}get isLoaded(){return this.internalState?!this.internalState.isAsyncPropLoading():!1}get wrapLongitude(){return this.props.wrapLongitude}isPickable(){return this.props.pickable&&this.props.visible}getModels(){const e=this.state;return e&&(e.models||e.model&&[e.model])||[]}setShaderModuleProps(...e){for(const t of this.getModels())t.shaderInputs.setProps(...e)}getAttributeManager(){return this.internalState&&this.internalState.attributeManager}getCurrentLayer(){return this.internalState&&this.internalState.layer}getLoadOptions(){return this.props.loadOptions}use64bitPositions(){const{coordinateSystem:e}=this.props;return e==="default"||e==="lnglat"||e==="cartesian"}onHover(e,t){return this.props.onHover&&this.props.onHover(e,t)||!1}onClick(e,t){return this.props.onClick&&this.props.onClick(e,t)||!1}nullPickingColor(){return[0,0,0]}encodePickingColor(e,t=[]){return t[0]=e+1&255,t[1]=e+1>>8&255,t[2]=e+1>>8>>8&255,t}decodePickingColor(e){oe(e instanceof Uint8Array);const[t,i,o]=e;return t+i*256+o*65536-1}getNumInstances(){return Number.isFinite(this.props.numInstances)?this.props.numInstances:this.state&&this.state.numInstances!==void 0?this.state.numInstances:Cc(this.props.data)}getStartIndices(){return this.props.startIndices?this.props.startIndices:this.state&&this.state.startIndices?this.state.startIndices:null}getBounds(){return this.getAttributeManager()?.getBounds(["positions","instancePositions"])}getShaders(e){e=dn(e,{disableWarnings:!0,modules:this.context.defaultShaderModules});for(const t of this.props.extensions)e=dn(e,t.getShaders.call(this,t));return e}shouldUpdateState(e){return e.changeFlags.propsOrDataChanged}updateState(e){const t=this.getAttributeManager(),{dataChanged:i}=e.changeFlags;if(i&&t)if(Array.isArray(i))for(const o of i)t.invalidateAll(o);else t.invalidateAll();if(t){const{props:o}=e,s=this.internalState.hasPickingBuffer,r=Number.isInteger(o.highlightedObjectIndex)||!!o.pickable||o.extensions.some(a=>a.getNeedsPickingBuffer.call(this,a));if(s!==r){this.internalState.hasPickingBuffer=r;const a=gn(t.attributes);a&&(r&&a.constant&&(a.constant=!1,t.invalidate(a.id)),!a.value&&!r&&(a.constant=!0,a.value=jt(t.attributes)?[gt]:[0,0,0]))}}}finalizeState(e){for(const i of this.getModels())i.destroy();const t=this.getAttributeManager();t&&t.finalize(),this.context&&this.context.resourceManager.unsubscribe({consumerId:this.id}),this.internalState&&(this.internalState.uniformTransitions.clear(),this.internalState.finalize())}draw(e){for(const t of this.getModels())t.draw(e.renderPass)}getPickingInfo({info:e,mode:t,sourceLayer:i}){const{index:o}=e;return o>=0&&Array.isArray(this.props.data)&&(e.object=this.props.data[o]),e}raiseError(e,t){t&&(e=new Error(`${t}: ${e.message}`,{cause:e})),this.props.onError?.(e)||this.context?.onError?.(e,this)}getNeedsRedraw(e={clearRedrawFlags:!1}){return this._getNeedsRedraw(e)}needsUpdate(){return this.internalState?this.internalState.needsUpdate||this.hasUniformTransition()||this.shouldUpdateState(this._getUpdateParams()):!1}hasUniformTransition(){return this.internalState?.uniformTransitions.active||!1}activateViewport(e){if(!this.internalState)return;const t=this.internalState.viewport;this.internalState.viewport=e,(!t||!Qc({oldViewport:t,viewport:e}))&&(this.setChangeFlags({viewportChanged:!0}),this.isComposite?this.needsUpdate()&&this.setNeedsUpdate():this._update())}invalidateAttribute(e="all"){const t=this.getAttributeManager();t&&(e==="all"?t.invalidateAll():t.invalidate(e))}updateAttributes(e){let t=!1;for(const i in e)e[i].layoutChanged()&&(t=!0);for(const i of this.getModels())this._setModelAttributes(i,e,t)}_updateAttributes(){const e=this.getAttributeManager();if(!e)return;const t=this.props,i=this.getNumInstances(),o=this.getStartIndices();e.update({data:t.data,numInstances:i,startIndices:o,props:t,transitions:t.transitions,buffers:t.data.attributes,context:this});const s=e.getChangedAttributes({clearChangedFlags:!0});this.updateAttributes(s)}_updateAttributeTransition(){const e=this.getAttributeManager();e&&e.updateTransition()}_updateUniformTransition(){const{uniformTransitions:e}=this.internalState;if(e.active){const t=e.update(),i=Object.create(this.props);for(const o in t)Object.defineProperty(i,o,{value:t[o]});return i}return this.props}calculateInstancePickingColors(e,{numInstances:t}){if(e.constant)return;const i=Math.floor(K.length/4);this.internalState.usesPickingColorCache=!0;const o=t>0&&K[0]===0;if(i<t||o){t>hn&&H.warn("Layer has too many data objects. Picking might not be able to distinguish all objects.")(),K=ut.allocate(K,t,{size:4,copy:!0,maxCount:Math.max(t,hn)});const s=Math.floor(K.length/4),r=[0,0,0],a=o?0:i;for(let l=a;l<s;l++)this.encodePickingColor(l,r),K[l*4+0]=r[0],K[l*4+1]=r[1],K[l*4+2]=r[2],K[l*4+3]=0}e.value=K.subarray(0,t*4)}_setModelAttributes(e,t,i=!1){if(!Object.keys(t).length)return;const o=this.getAttributeManager();if(o?.hasBufferGroups()){this._setGroupedModelAttributes(e,o,t);return}if(i){const l=this.getAttributeManager();e.setBufferLayout(l.getBufferLayouts(e)),t=l.getAttributes()}const s=e.userData?.excludeAttributes||{},r={},a={};for(const l in t){if(s[l])continue;const c=t[l].getValue();for(const u in c){const f=c[u];f instanceof D?t[l].settings.isIndexed?e.setIndexBuffer(f):r[u]=f:f&&(a[u]=f)}}e.setAttributes(r),e.setConstantAttributes(a)}_setGroupedModelAttributes(e,t,i){const o=e.userData?.excludeAttributes||{},s=t.getBufferGroupBindings(i,e,o);e.setBufferLayout(s.bufferLayouts);const r={...s.buffers},a={},l=t.getAttributes();for(const c in l){if(o[c]||s.groupedAttributeIds.has(c))continue;const u=l[c],f=u.getValue();for(const h in f){const g=f[h];g instanceof D?u.settings.isIndexed?e.setIndexBuffer(g):r[h]=g:g&&(a[h]=g)}}e.setAttributes(r),e.setConstantAttributes(a)}disablePickingIndex(e){const t=this.props.data;if(!("attributes"in t)){this._disablePickingIndex(e);return}const i=this.getAttributeManager().attributes,o=jt(i),s=$t(i),r=o&&t.attributes&&t.attributes[o.id];if(r&&r.value){const l=r.value;for(let c=0;c<t.length;c++){const u=o.getVertexOffset(c);l[u]===e&&this._disablePickingIndex(c)}return}const a=s&&t.attributes&&t.attributes[s.id];if(a&&a.value){const l=a.value,c=this.encodePickingColor(e);for(let u=0;u<t.length;u++){const f=s.getVertexOffset(u);l[f]===c[0]&&l[f+1]===c[1]&&l[f+2]===c[2]&&this._disablePickingIndex(u)}}else this._disablePickingIndex(e)}_disablePickingIndex(e){const t=this.getAttributeManager().attributes,i=jt(t);if(i){const a=i.getVertexOffset(e),l=i.getVertexOffset(e+1),c=new Uint32Array(l-a);c.fill(gt),i.buffer.write(c,a*c.BYTES_PER_ELEMENT);return}const o=$t(t);if(!o){this.internalState&&Er(this.internalState.disabledPickingIndices,e);return}const s=o.getVertexOffset(e),r=o.getVertexOffset(e+1);o.buffer.write(new Uint8Array(r-s),s)}restorePickingColors(){const e=this.getAttributeManager().attributes,t=gn(e);if(!t){this.internalState&&(this.internalState.disabledPickingIndices.length=0);return}const i=$t(e);this.internalState.usesPickingColorCache&&i&&i.value.buffer!==K.buffer&&(i.value=K.subarray(0,i.value.length)),t.updateSubBuffer({startOffset:0})}_initialize(){oe(!this.internalState),q(qc,this);const e=this._getAttributeManager();this.internalState=new Hc({attributeManager:e,layer:this}),this._clearChangeFlags(),this.state={},Object.defineProperty(this.state,"attributeManager",{get:()=>(H.deprecated("layer.state.attributeManager","layer.getAttributeManager()")(),e)}),this.internalState.uniformTransitions=new yc(this.context.timeline),this.internalState.onAsyncPropUpdated=this._onAsyncPropUpdated.bind(this),this.internalState.setAsyncProps(this.props),this.initializeState(this.context);for(const t of this.props.extensions)t.initializeState.call(this,this.context,t);this.setChangeFlags({dataChanged:"init",propsChanged:"init",viewportChanged:!0,extensionsChanged:!0}),this._update()}_transferState(e){q(Xc,this,this===e);const{state:t,internalState:i}=e;this!==e&&(this.internalState=i,this.state=t,this.internalState.setAsyncProps(this.props),this._diffProps(this.props,this.internalState.getOldProps()))}_update(){const e=this.needsUpdate();if(q(Zc,this,e),!e)return;this.context.stats.get("Layer updates").incrementCount();const t=this.props,i=this.context,o=this.internalState,s=i.viewport,r=this._updateUniformTransition();o.propsInTransition=r,i.viewport=o.viewport||s,this.props=r;try{const a=this._getUpdateParams(),l=this.getModels();if(i.device)this.updateState(a);else try{this.updateState(a)}catch{}for(const u of this.props.extensions)u.updateState.call(this,a,u);this.setNeedsRedraw(),this._updateAttributes();const c=this.getModels()[0]!==l[0];this._postUpdate(a,c)}finally{i.viewport=s,this.props=t,this._clearChangeFlags(),o.needsUpdate=!1,o.resetOldProps()}}_finalize(){q(Kc,this),this.finalizeState(this.context);for(const e of this.props.extensions)e.finalizeState.call(this,this.context,e)}_drawLayer({renderPass:e,shaderModuleProps:t=null,uniforms:i={},parameters:o={}}){this._updateAttributeTransition();const s=this.props,r=this.context;this.props=this.internalState.propsInTransition||s;try{t&&this.setShaderModuleProps(t);const{getPolygonOffset:a}=this.props,l=a&&a(i)||[0,0];r.device instanceof It&&r.device.setParametersWebGL({polygonOffset:l});const c=r.device instanceof It?null:tu(o);if(iu(this.getModels(),e,o,c),r.device instanceof It)r.device.withParametersWebGL(o,()=>{const u={renderPass:e,shaderModuleProps:t,uniforms:i,parameters:o,context:r};for(const f of this.props.extensions)f.draw.call(this,u,f);this.draw(u)});else{c?.renderPassParameters&&e.setParameters(c.renderPassParameters);const u={renderPass:e,shaderModuleProps:t,uniforms:i,parameters:o,context:r};for(const f of this.props.extensions)f.draw.call(this,u,f);this.draw(u)}}finally{this.props=s}}getChangeFlags(){return this.internalState?.changeFlags}setChangeFlags(e){if(!this.internalState)return;const{changeFlags:t}=this.internalState;for(const o in e)if(e[o]){let s=!1;switch(o){case"dataChanged":const r=e[o],a=t[o];r&&Array.isArray(a)&&(t.dataChanged=Array.isArray(r)?a.concat(r):r,s=!0);default:t[o]||(t[o]=e[o],s=!0)}s&&q(Yc,this,o,e)}const i=!!(t.dataChanged||t.updateTriggersChanged||t.propsChanged||t.extensionsChanged);t.propsOrDataChanged=i,t.somethingChanged=i||t.viewportChanged||t.stateChanged}_clearChangeFlags(){this.internalState.changeFlags={dataChanged:!1,propsChanged:!1,updateTriggersChanged:!1,viewportChanged:!1,stateChanged:!1,extensionsChanged:!1,propsOrDataChanged:!1,somethingChanged:!1}}_diffProps(e,t){const i=vc(e,t);if(i.updateTriggersChanged)for(const o in i.updateTriggersChanged)i.updateTriggersChanged[o]&&this.invalidateAttribute(o);if(i.transitionsChanged)for(const o in i.transitionsChanged)this.internalState.uniformTransitions.add(o,t[o],e[o],e.transitions?.[o]);return this.setChangeFlags(i)}validateProps(){bc(this.props)}updateAutoHighlight(e){this.props.autoHighlight&&!Number.isInteger(this.props.highlightedObjectIndex)&&this._updateAutoHighlight(e)}_updateAutoHighlight(e){const t={highlightedObjectColor:e.picked?e.color:null},{highlightColor:i}=this.props;e.picked&&typeof i=="function"&&(t.highlightColor=i(e)),this.setShaderModuleProps({picking:t}),this.setNeedsRedraw()}_getAttributeManager(){const e=this.context;return new Io(e.device,{id:this.props.id,stats:e.stats,timeline:e.timeline})}_postUpdate(e,t){const{props:i,oldProps:o}=e,s=this.state.model;s?.isInstanced&&s.setInstanceCount(this.getNumInstances());const{autoHighlight:r,highlightedObjectIndex:a,highlightColor:l}=i;if(t||o.autoHighlight!==r||o.highlightedObjectIndex!==a||o.highlightColor!==l){const c={};Array.isArray(l)&&(c.highlightColor=l),(t||o.autoHighlight!==r||a!==o.highlightedObjectIndex)&&(c.highlightedObjectColor=Number.isFinite(a)&&a>=0?this.encodePickingColor(a):null),this.setShaderModuleProps({picking:c})}}_getUpdateParams(){return{props:this.props,oldProps:this.internalState.getOldProps(),context:this.context,changeFlags:this.internalState.changeFlags}}_getNeedsRedraw(e){if(!this.internalState)return!1;let t=!1;t=t||this.internalState.needsRedraw&&this.id;const i=this.getAttributeManager(),o=i?i.getNeedsRedraw(e):!1;if(t=t||o,t)for(const s of this.props.extensions)s.onNeedsRedraw.call(this,s);return this.internalState.needsRedraw=this.internalState.needsRedraw&&!e.clearRedrawFlags,t}_onAsyncPropUpdated(){this._diffProps(this.props,this.internalState.getOldProps()),this.setNeedsUpdate()}}ue.defaultProps=eu;ue.layerName="Layer";function tu(n){const{blendConstant:e,...t}=n;return e?{pipelineParameters:t,renderPassParameters:{blendConstant:e}}:{pipelineParameters:t}}function iu(n,e,t,i){for(const o of n)o.device.type==="webgpu"?(nu(o,e),o.setParameters({...o.parameters,...i?.pipelineParameters})):o.setParameters(t)}function nu(n,e){const t=e.props.framebuffer||(e.framebuffer??null);if(!t)return;const i=t.colorAttachments.map(r=>r?.texture?.format??null),o=t.depthStencilAttachment?.texture?.format,s=n;(!ou(s.props.colorAttachmentFormats,i)||s.props.depthStencilAttachmentFormat!==o)&&(s.props.colorAttachmentFormats=i,s.props.depthStencilAttachmentFormat=o,s._setPipelineNeedsUpdate("attachment formats"))}function ou(n,e){if(n===e)return!0;if(!n||!e||n.length!==e.length)return!1;for(let t=0;t<n.length;t++)if(n[t]!==e[t])return!1;return!0}const su="compositeLayer.renderLayers";class Pi extends ue{get isComposite(){return!0}get isDrawable(){return!1}get isLoaded(){return super.isLoaded&&this.getSubLayers().every(e=>e.isLoaded)}getSubLayers(){return this.internalState&&this.internalState.subLayers||[]}initializeState(e){}setState(e){super.setState(e),this.setNeedsUpdate()}getPickingInfo({info:e}){const{object:t}=e;return t&&t.__source&&t.__source.parent&&t.__source.parent.id===this.id&&(e.object=t.__source.object,e.index=t.__source.index),e}filterSubLayer(e){return!0}shouldRenderSubLayer(e,t){return t&&t.length}getSubLayerClass(e,t){const{_subLayerProps:i}=this.props;return i&&i[e]&&i[e].type||t}getSubLayerRow(e,t,i){return e.__source={parent:this,object:t,index:i},e}getSubLayerAccessor(e){if(typeof e=="function"){const t={index:-1,data:this.props.data,target:[]};return(i,o)=>i&&i.__source?(t.index=i.__source.index,e(i.__source.object,t)):e(i,o)}return e}getSubLayerProps(e={}){const{opacity:t,pickable:i,visible:o,parameters:s,getPolygonOffset:r,highlightedObjectIndex:a,autoHighlight:l,highlightColor:c,coordinateSystem:u,coordinateOrigin:f,wrapLongitude:h,positionFormat:g,modelMatrix:y,extensions:b,fetch:w,operation:S,_subLayerProps:A}=this.props,L={id:"",updateTriggers:{},opacity:t,pickable:i,visible:o,parameters:s,getPolygonOffset:r,highlightedObjectIndex:a,autoHighlight:l,highlightColor:c,coordinateSystem:u,coordinateOrigin:f,wrapLongitude:h,positionFormat:g,modelMatrix:y,extensions:b,fetch:w,operation:S},B=A&&e.id&&A[e.id],k=B&&B.updateTriggers,V=e.id||"sublayer";if(B){const Y=this.props[ae],X=e.type?e.type._propTypes:{};for(const Z in B){const $=X[Z]||Y[Z];$&&$.type==="accessor"&&(B[Z]=this.getSubLayerAccessor(B[Z]))}}Object.assign(L,e,B),L.id=`${this.props.id}-${V}`,L.updateTriggers={all:this.props.updateTriggers?.all,...e.updateTriggers,...k};for(const Y of b){const X=Y.getSubLayerProps.call(this,Y);X&&Object.assign(L,X,{updateTriggers:Object.assign(L.updateTriggers,X.updateTriggers)})}return L}_updateAutoHighlight(e){for(const t of this.getSubLayers())t.updateAutoHighlight(e)}_getAttributeManager(){return null}_postUpdate(e,t){let i=this.internalState.subLayers;const o=!i||this.needsUpdate();if(o){const s=this.renderLayers();i=ws(s,Boolean),this.internalState.subLayers=i}q(su,this,o,i);for(const s of i)s.parent=this}}Pi.layerName="CompositeLayer";class Oo{constructor(e){this.indexStarts=[0],this.vertexStarts=[0],this.vertexCount=0,this.instanceCount=0;const{attributes:t={}}=e;this.typedArrayManager=ut,this.attributes={},this._attributeDefs=t,this.opts=e,this.updateGeometry(e)}updateGeometry(e){Object.assign(this.opts,e);const{data:t,buffers:i={},getGeometry:o,geometryBuffer:s,positionFormat:r,dataChanged:a,normalize:l=!0}=this.opts;if(this.data=t,this.getGeometry=o,this.positionSize=s&&s.size||(r==="XY"?2:3),this.buffers=i,this.normalize=l,s&&(oe(t.startIndices),this.getGeometry=this.getGeometryFromBuffer(s),l||(i.vertexPositions=s)),this.geometryBuffer=i.vertexPositions,Array.isArray(a))for(const c of a)this._rebuildGeometry(c);else this._rebuildGeometry()}updatePartialGeometry({startRow:e,endRow:t}){this._rebuildGeometry({startRow:e,endRow:t})}getGeometryFromBuffer(e){const t=e.value||e;return ArrayBuffer.isView(t)?fo(t,{size:this.positionSize,offset:e.offset,stride:e.stride,startIndices:this.data.startIndices}):null}_allocate(e,t){const{attributes:i,buffers:o,_attributeDefs:s,typedArrayManager:r}=this;for(const a in s)if(a in o)r.release(i[a]),i[a]=null;else{const l=s[a];l.copy=t,i[a]=r.allocate(i[a],e,l)}}_forEachGeometry(e,t,i){const{data:o,getGeometry:s}=this,{iterable:r,objectInfo:a}=Lt(o,t,i);for(const l of r){a.index++;const c=s?s(l,a):null;e(c,a.index)}}_rebuildGeometry(e){if(!this.data)return;let{indexStarts:t,vertexStarts:i,instanceCount:o}=this;const{data:s,geometryBuffer:r}=this,{startRow:a=0,endRow:l=1/0}=e||{},c={};if(e||(t=[0],i=[0]),this.normalize||!r)this._forEachGeometry((f,h)=>{const g=f&&this.normalizeGeometry(f);c[h]=g,i[h+1]=i[h]+(g?this.getGeometrySize(g):0)},a,l),o=i[i.length-1];else if(i=s.startIndices,o=i[s.length]||0,ArrayBuffer.isView(r))o=o||r.length/this.positionSize;else if(r instanceof D){const f=this.positionSize*4;o=o||r.byteLength/f}else if(r.buffer){const f=r.stride||this.positionSize*4;o=o||r.buffer.byteLength/f}else if(r.value){const f=r.value,h=r.stride/f.BYTES_PER_ELEMENT||this.positionSize;o=o||f.length/h}this._allocate(o,!!e),this.indexStarts=t,this.vertexStarts=i,this.instanceCount=o;const u={};this._forEachGeometry((f,h)=>{const g=c[h]||f;u.vertexStart=i[h],u.indexStart=t[h];const y=h<i.length-1?i[h+1]:o;u.geometrySize=y-i[h],u.geometryIndex=h,this.updateGeometryAttributes(g,u)},a,l),this.vertexCount=t[t.length-1]}}const ru=`struct ArcUniforms {
  greatCircle: f32,
  useShortestPath: f32,
  numSegments: f32,
  widthScale: f32,
  widthMinPixels: f32,
  widthMaxPixels: f32,
  widthUnits: i32,
};

@group(0) @binding(auto) var<uniform> arc: ArcUniforms;
`,pn=`layout(std140) uniform arcUniforms {
  bool greatCircle;
  bool useShortestPath;
  float numSegments;
  float widthScale;
  float widthMinPixels;
  float widthMaxPixels;
  highp int widthUnits;
} arc;
`,au={name:"arc",source:ru,vs:pn,fs:pn,uniformTypes:{greatCircle:"f32",useShortestPath:"f32",numSegments:"f32",widthScale:"f32",widthMinPixels:"f32",widthMaxPixels:"f32",widthUnits:"i32"}},lu=`const ZERO_OFFSET: vec3<f32> = vec3<f32>(0.0, 0.0, 0.0);

struct Attributes {
  @location(0) instanceSourcePositions: vec3<f32>,
  @location(1) instanceSourcePositions64Low: vec3<f32>,
  @location(2) instanceTargetPositions: vec3<f32>,
  @location(3) instanceTargetPositions64Low: vec3<f32>,
  @location(4) instanceSourceColors: vec4<f32>,
  @location(5) instanceTargetColors: vec4<f32>,
  @location(6) instanceWidths: f32,
  @location(7) instanceHeights: f32,
  @location(8) instanceTilts: f32,
};

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) uv: vec2<f32>,
  @location(2) pickingColor: vec3<f32>,
  @location(3) isValid: f32,
};

fn paraboloid(
  distance: f32,
  sourceZ: f32,
  targetZ: f32,
  ratio: f32,
  height: f32
) -> f32 {
  let deltaZ = targetZ - sourceZ;
  let dh = distance * height;
  if (dh == 0.0) {
    return sourceZ + deltaZ * ratio;
  }
  let unitZ = deltaZ / dh;
  let p2 = unitZ * unitZ + 1.0;
  let dir = select(0.0, 1.0, deltaZ <= 0.0);
  let z0 = mix(sourceZ, targetZ, dir);
  let r = mix(ratio, 1.0 - ratio, dir);
  return sqrt(max(r * (p2 - r), 0.0)) * dh + z0;
}

fn getExtrusionOffset(lineClipspace: vec2<f32>, side: f32, width: f32) -> vec2<f32> {
  var direction = normalize(lineClipspace * project.viewportSize);
  direction = vec2<f32>(-direction.y, direction.x);
  return direction * side * width / 2.0;
}

fn getSegmentRatio(index: f32) -> f32 {
  return smoothstep(0.0, 1.0, index / max(arc.numSegments - 1.0, 1.0));
}

fn interpolateFlat(
  source: vec3<f32>,
  targetPosition: vec3<f32>,
  ratio: f32,
  height: f32,
  tiltDegrees: f32
) -> vec3<f32> {
  let distance = length(source.xy - targetPosition.xy);
  let z = paraboloid(distance, source.z, targetPosition.z, ratio, height);
  let tiltAngle = radians(tiltDegrees);
  let tiltDirection = normalize(targetPosition.xy - source.xy);
  let tilt = vec2<f32>(-tiltDirection.y, tiltDirection.x) * z * sin(tiltAngle);
  return vec3<f32>(mix(source.xy, targetPosition.xy, ratio) + tilt, z * cos(tiltAngle));
}

// Great circle interpolation
// http://www.movable-type.co.uk/scripts/latlong.html
fn getAngularDistance(source: vec2<f32>, targetPosition: vec2<f32>) -> f32 {
  let sourceRadians = radians(source);
  let targetRadians = radians(targetPosition);
  let sinHalfDelta = sin((sourceRadians - targetRadians) / 2.0);
  let sinHalfDeltaSquared = sinHalfDelta * sinHalfDelta;
  let a = sinHalfDeltaSquared.y +
    cos(sourceRadians.y) * cos(targetRadians.y) * sinHalfDeltaSquared.x;
  return 2.0 * asin(sqrt(a));
}

fn interpolateGreatCircle(
  source: vec3<f32>,
  targetPosition: vec3<f32>,
  source3D: vec3<f32>,
  target3D: vec3<f32>,
  angularDistance: f32,
  ratio: f32,
  height: f32
) -> vec3<f32> {
  var longitudeLatitude: vec2<f32>;

  // If the angular distance is PI, use linear interpolation. Otherwise use spherical interpolation.
  if (abs(angularDistance - PI) < 0.001) {
    longitudeLatitude = (1.0 - ratio) * source.xy + ratio * targetPosition.xy;
  } else {
    let a = sin((1.0 - ratio) * angularDistance);
    let b = sin(ratio * angularDistance);
    let p = source3D.yxz * a + target3D.yxz * b;
    longitudeLatitude = degrees(vec2<f32>(
      atan2(p.y, -p.x),
      atan2(p.z, length(p.xy))
    ));
  }

  let z = paraboloid(
    angularDistance * EARTH_RADIUS,
    source.z,
    targetPosition.z,
    ratio,
    height
  );
  return vec3<f32>(longitudeLatitude, z);
}

@vertex
fn vertexMain(
  attributes: Attributes,
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32
) -> Varyings {
  geometry.worldPosition = attributes.instanceSourcePositions;
  geometry.worldPositionAlt = attributes.instanceTargetPositions;

  let segmentIndex = f32(vertexIndex / 2u);
  let segmentSide = select(-1.0, 1.0, vertexIndex % 2u == 1u);
  var segmentRatio = getSegmentRatio(segmentIndex);
  let previousRatio = getSegmentRatio(max(0.0, segmentIndex - 1.0));
  var nextRatio = getSegmentRatio(min(arc.numSegments - 1.0, segmentIndex + 1.0));
  // If this is the first point, use next - current as direction.
  var indexDirection = select(-1.0, 1.0, segmentIndex <= 0.0);
  var isValid = 1.0;

  var currentClip: vec4<f32>;
  var nextClip: vec4<f32>;

  if (
    (arc.greatCircle != 0.0 || project.projectionMode == PROJECTION_MODE_GLOBE) &&
    project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT
  ) {
    let source = project_globe_(vec3<f32>(attributes.instanceSourcePositions.xy, 0.0));
    let targetPosition = project_globe_(vec3<f32>(attributes.instanceTargetPositions.xy, 0.0));
    let angularDistance = getAngularDistance(
      attributes.instanceSourcePositions.xy,
      attributes.instanceTargetPositions.xy
    );

    let previousPosition = interpolateGreatCircle(
      attributes.instanceSourcePositions,
      attributes.instanceTargetPositions,
      source,
      targetPosition,
      angularDistance,
      previousRatio,
      attributes.instanceHeights
    );
    var currentPosition = interpolateGreatCircle(
      attributes.instanceSourcePositions,
      attributes.instanceTargetPositions,
      source,
      targetPosition,
      angularDistance,
      segmentRatio,
      attributes.instanceHeights
    );
    var nextPosition = interpolateGreatCircle(
      attributes.instanceSourcePositions,
      attributes.instanceTargetPositions,
      source,
      targetPosition,
      angularDistance,
      nextRatio,
      attributes.instanceHeights
    );

    if (abs(currentPosition.x - previousPosition.x) > 180.0) {
      indexDirection = -1.0;
      isValid = 0.0;
    } else if (abs(currentPosition.x - nextPosition.x) > 180.0) {
      indexDirection = 1.0;
      isValid = 0.0;
    }
    nextPosition = select(nextPosition, previousPosition, indexDirection < 0.0);
    nextRatio = select(nextRatio, previousRatio, indexDirection < 0.0);

    if (isValid == 0.0) {
      // Split at the antimeridian.
      nextPosition.x += select(360.0, -360.0, nextPosition.x > 0.0);
      let ratio = (
        select(-180.0, 180.0, currentPosition.x > 0.0) - currentPosition.x
      ) / (nextPosition.x - currentPosition.x);
      currentPosition = mix(currentPosition, nextPosition, ratio);
      segmentRatio = mix(segmentRatio, nextRatio, ratio);
    }

    let currentPosition64Low = mix(
      attributes.instanceSourcePositions64Low,
      attributes.instanceTargetPositions64Low,
      segmentRatio
    );
    let nextPosition64Low = mix(
      attributes.instanceSourcePositions64Low,
      attributes.instanceTargetPositions64Low,
      nextRatio
    );
    let currentProjection = project_position_to_clipspace_and_commonspace(
      currentPosition,
      currentPosition64Low,
      ZERO_OFFSET
    );
    currentClip = currentProjection.clipPosition;
    nextClip = project_position_to_clipspace(nextPosition, nextPosition64Low, ZERO_OFFSET);
    geometry.position = currentProjection.commonPosition;
  } else {
    var sourceWorld = attributes.instanceSourcePositions;
    var targetWorld = attributes.instanceTargetPositions;
    if (arc.useShortestPath != 0.0) {
      sourceWorld.x = ((sourceWorld.x + 180.0) % 360.0) - 180.0;
      targetWorld.x = ((targetWorld.x + 180.0) % 360.0) - 180.0;
      let deltaLongitude = targetWorld.x - sourceWorld.x;
      if (deltaLongitude > 180.0) {
        targetWorld.x -= 360.0;
      }
      if (deltaLongitude < -180.0) {
        sourceWorld.x -= 360.0;
      }
    }

    let source = project_position_vec3_f64(
      sourceWorld,
      attributes.instanceSourcePositions64Low
    );
    let targetPosition = project_position_vec3_f64(
      targetWorld,
      attributes.instanceTargetPositions64Low
    );

    // Common x at longitude=-180.
    var antimeridianX = 0.0;
    if (arc.useShortestPath != 0.0) {
      if (project.projectionMode == PROJECTION_MODE_WEB_MERCATOR_AUTO_OFFSET) {
        antimeridianX = -(project.coordinateOrigin.x + 180.0) / 360.0 * TILE_SIZE;
      }
      let thresholdRatio = (antimeridianX - source.x) / (targetPosition.x - source.x);
      if (previousRatio <= thresholdRatio && nextRatio > thresholdRatio) {
        isValid = 0.0;
        indexDirection = sign(segmentRatio - thresholdRatio);
        segmentRatio = thresholdRatio;
      }
    }

    nextRatio = select(nextRatio, previousRatio, indexDirection < 0.0);
    var currentPosition = interpolateFlat(
      source,
      targetPosition,
      segmentRatio,
      attributes.instanceHeights,
      attributes.instanceTilts
    );
    var nextPosition = interpolateFlat(
      source,
      targetPosition,
      nextRatio,
      attributes.instanceHeights,
      attributes.instanceTilts
    );

    if (arc.useShortestPath != 0.0 && nextPosition.x < antimeridianX) {
      currentPosition.x += TILE_SIZE;
      nextPosition.x += TILE_SIZE;
    }

    currentClip = project_common_position_to_clipspace(vec4<f32>(currentPosition, 1.0));
    nextClip = project_common_position_to_clipspace(vec4<f32>(nextPosition, 1.0));
    geometry.position = vec4<f32>(currentPosition, 1.0);
  }

  geometry.uv = vec2<f32>(segmentRatio, segmentSide);
  geometry.pickingColor = picking_getPickingColorFromIndex(instanceIndex);

  let widthPixels = clamp(
    project_unit_size_to_pixel(attributes.instanceWidths * arc.widthScale, arc.widthUnits),
    arc.widthMinPixels,
    arc.widthMaxPixels
  );
#ifdef ANTIALIASING
  var offset = getExtrusionOffset(
#else
  let offset = getExtrusionOffset(
#endif
    (nextClip.xy - currentClip.xy) * indexDirection,
    segmentSide,
    widthPixels
  );
#ifdef ANTIALIASING
  let halfWidthPixels = length(offset);
  if (halfWidthPixels > 0.0) {
    // Keep the declared edge at abs(uv.y) == 1 while rasterizing the outer half of the centered
    // one-device-pixel coverage ramp.
    let coverageScale = 1.0 + 0.5 / project.devicePixelRatio / halfWidthPixels;
    offset *= coverageScale;
    geometry.uv.y *= coverageScale;
  }
#endif

  var output: Varyings;
  output.position = currentClip + vec4<f32>(project_pixel_size_to_clipspace(offset), 0.0, 0.0);
  let color = mix(attributes.instanceSourceColors, attributes.instanceTargetColors, segmentRatio);
  output.color = vec4<f32>(color.rgb, color.a * layer.opacity);
  output.uv = geometry.uv;
  output.pickingColor = geometry.pickingColor;
  output.isValid = isValid;
  return output;
}

@fragment
fn fragmentMain(varyings: Varyings) -> @location(0) vec4<f32> {
#ifdef ANTIALIASING
  let edgeCoord = abs(varyings.uv.y);
  let edgePixels = (1.0 - edgeCoord) / max(fwidth(edgeCoord), 1e-6);
#endif

  if (varyings.isValid == 0.0) {
    discard;
  }

#ifdef ANTIALIASING
  // Fragments outside the coverage ramp must not write depth or picking colors.
  if (edgePixels <= -SMOOTH_EDGE_RADIUS) {
    discard;
  }
#endif
  var color = varyings.color;
#ifdef ANTIALIASING
  // Feather one device pixel across the width. Arc segments meet lengthwise, so only soften the
  // two outer edges of the strip.
  color.a *= smoothedge(0.0, edgePixels);
#endif
  if (picking.isActive > 0.5) {
    if (!picking_isColorValid(varyings.pickingColor)) {
      discard;
    }
    return vec4<f32>(varyings.pickingColor, 1.0);
  }
  if (picking.isHighlightActive > 0.5) {
    let highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
    if (picking_isColorZero(abs(varyings.pickingColor - highlightedObjectColor))) {
      let highlightAlpha = picking.highlightColor.a;
      let blendedAlpha = highlightAlpha + color.a * (1.0 - highlightAlpha);
      if (blendedAlpha > 0.0) {
        let highlightRatio = highlightAlpha / blendedAlpha;
        color = vec4<f32>(
          mix(color.rgb, picking.highlightColor.rgb, highlightRatio),
          blendedAlpha
        );
      }
    }
  }
  return deckgl_premultiplied_alpha(color);
}
`,cu=`#version 300 es
#define SHADER_NAME arc-layer-vertex-shader
in vec4 instanceSourceColors;
in vec4 instanceTargetColors;
in vec3 instanceSourcePositions;
in vec3 instanceSourcePositions64Low;
in vec3 instanceTargetPositions;
in vec3 instanceTargetPositions64Low;
in float instanceWidths;
in float instanceHeights;
in float instanceTilts;
out vec4 vColor;
out vec2 uv;
out float isValid;
float paraboloid(float distance, float sourceZ, float targetZ, float ratio) {
float deltaZ = targetZ - sourceZ;
float dh = distance * instanceHeights;
if (dh == 0.0) {
return sourceZ + deltaZ * ratio;
}
float unitZ = deltaZ / dh;
float p2 = unitZ * unitZ + 1.0;
float dir = step(deltaZ, 0.0);
float z0 = mix(sourceZ, targetZ, dir);
float r = mix(ratio, 1.0 - ratio, dir);
return sqrt(r * (p2 - r)) * dh + z0;
}
vec2 getExtrusionOffset(vec2 line_clipspace, float offset_direction, float width) {
vec2 dir_screenspace = normalize(line_clipspace * project.viewportSize);
dir_screenspace = vec2(-dir_screenspace.y, dir_screenspace.x);
return dir_screenspace * offset_direction * width / 2.0;
}
float getSegmentRatio(float index) {
return smoothstep(0.0, 1.0, index / (arc.numSegments - 1.0));
}
vec3 interpolateFlat(vec3 source, vec3 target, float segmentRatio) {
float distance = length(source.xy - target.xy);
float z = paraboloid(distance, source.z, target.z, segmentRatio);
float tiltAngle = radians(instanceTilts);
vec2 tiltDirection = normalize(target.xy - source.xy);
vec2 tilt = vec2(-tiltDirection.y, tiltDirection.x) * z * sin(tiltAngle);
return vec3(
mix(source.xy, target.xy, segmentRatio) + tilt,
z * cos(tiltAngle)
);
}
float getAngularDist (vec2 source, vec2 target) {
vec2 sourceRadians = radians(source);
vec2 targetRadians = radians(target);
vec2 sin_half_delta = sin((sourceRadians - targetRadians) / 2.0);
vec2 shd_sq = sin_half_delta * sin_half_delta;
float a = shd_sq.y + cos(sourceRadians.y) * cos(targetRadians.y) * shd_sq.x;
return 2.0 * asin(sqrt(a));
}
vec3 interpolateGreatCircle(vec3 source, vec3 target, vec3 source3D, vec3 target3D, float angularDist, float t) {
vec2 lngLat;
if(abs(angularDist - PI) < 0.001) {
lngLat = (1.0 - t) * source.xy + t * target.xy;
} else {
float a = sin((1.0 - t) * angularDist);
float b = sin(t * angularDist);
vec3 p = source3D.yxz * a + target3D.yxz * b;
lngLat = degrees(vec2(atan(p.y, -p.x), atan(p.z, length(p.xy))));
}
float z = paraboloid(angularDist * EARTH_RADIUS, source.z, target.z, t);
return vec3(lngLat, z);
}
void main(void) {
geometry.worldPosition = instanceSourcePositions;
geometry.worldPositionAlt = instanceTargetPositions;
float segmentIndex = float(gl_VertexID / 2);
float segmentSide = mod(float(gl_VertexID), 2.) == 0. ? -1. : 1.;
float segmentRatio = getSegmentRatio(segmentIndex);
float prevSegmentRatio = getSegmentRatio(max(0.0, segmentIndex - 1.0));
float nextSegmentRatio = getSegmentRatio(min(arc.numSegments - 1.0, segmentIndex + 1.0));
float indexDir = mix(-1.0, 1.0, step(segmentIndex, 0.0));
isValid = 1.0;
uv = vec2(segmentRatio, segmentSide);
geometry.uv = uv;
geometry.pickingColor = picking_getPickingColorFromInstanceID();
vec4 curr;
vec4 next;
vec3 source;
vec3 target;
if ((arc.greatCircle || project.projectionMode == PROJECTION_MODE_GLOBE) && project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT) {
source = project_globe_(vec3(instanceSourcePositions.xy, 0.0));
target = project_globe_(vec3(instanceTargetPositions.xy, 0.0));
float angularDist = getAngularDist(instanceSourcePositions.xy, instanceTargetPositions.xy);
vec3 prevPos = interpolateGreatCircle(instanceSourcePositions, instanceTargetPositions, source, target, angularDist, prevSegmentRatio);
vec3 currPos = interpolateGreatCircle(instanceSourcePositions, instanceTargetPositions, source, target, angularDist, segmentRatio);
vec3 nextPos = interpolateGreatCircle(instanceSourcePositions, instanceTargetPositions, source, target, angularDist, nextSegmentRatio);
if (abs(currPos.x - prevPos.x) > 180.0) {
indexDir = -1.0;
isValid = 0.0;
} else if (abs(currPos.x - nextPos.x) > 180.0) {
indexDir = 1.0;
isValid = 0.0;
}
nextPos = indexDir < 0.0 ? prevPos : nextPos;
nextSegmentRatio = indexDir < 0.0 ? prevSegmentRatio : nextSegmentRatio;
if (isValid == 0.0) {
nextPos.x += nextPos.x > 0.0 ? -360.0 : 360.0;
float t = ((currPos.x > 0.0 ? 180.0 : -180.0) - currPos.x) / (nextPos.x - currPos.x);
currPos = mix(currPos, nextPos, t);
segmentRatio = mix(segmentRatio, nextSegmentRatio, t);
}
vec3 currPos64Low = mix(instanceSourcePositions64Low, instanceTargetPositions64Low, segmentRatio);
vec3 nextPos64Low = mix(instanceSourcePositions64Low, instanceTargetPositions64Low, nextSegmentRatio);
curr = project_position_to_clipspace(currPos, currPos64Low, vec3(0.0), geometry.position);
next = project_position_to_clipspace(nextPos, nextPos64Low, vec3(0.0));
} else {
vec3 source_world = instanceSourcePositions;
vec3 target_world = instanceTargetPositions;
if (arc.useShortestPath) {
source_world.x = mod(source_world.x + 180., 360.0) - 180.;
target_world.x = mod(target_world.x + 180., 360.0) - 180.;
float deltaLng = target_world.x - source_world.x;
if (deltaLng > 180.) target_world.x -= 360.;
if (deltaLng < -180.) source_world.x -= 360.;
}
source = project_position(source_world, instanceSourcePositions64Low);
target = project_position(target_world, instanceTargetPositions64Low);
float antiMeridianX = 0.0;
if (arc.useShortestPath) {
if (project.projectionMode == PROJECTION_MODE_WEB_MERCATOR_AUTO_OFFSET) {
antiMeridianX = -(project.coordinateOrigin.x + 180.) / 360. * TILE_SIZE;
}
float thresholdRatio = (antiMeridianX - source.x) / (target.x - source.x);
if (prevSegmentRatio <= thresholdRatio && nextSegmentRatio > thresholdRatio) {
isValid = 0.0;
indexDir = sign(segmentRatio - thresholdRatio);
segmentRatio = thresholdRatio;
}
}
nextSegmentRatio = indexDir < 0.0 ? prevSegmentRatio : nextSegmentRatio;
vec3 currPos = interpolateFlat(source, target, segmentRatio);
vec3 nextPos = interpolateFlat(source, target, nextSegmentRatio);
if (arc.useShortestPath) {
if (nextPos.x < antiMeridianX) {
currPos.x += TILE_SIZE;
nextPos.x += TILE_SIZE;
}
}
curr = project_common_position_to_clipspace(vec4(currPos, 1.0));
next = project_common_position_to_clipspace(vec4(nextPos, 1.0));
geometry.position = vec4(currPos, 1.0);
}
float widthPixels = clamp(
project_size_to_pixel(instanceWidths * arc.widthScale, arc.widthUnits),
arc.widthMinPixels, arc.widthMaxPixels
);
vec3 offset = vec3(
getExtrusionOffset((next.xy - curr.xy) * indexDir, segmentSide, widthPixels),
0.0);
DECKGL_FILTER_SIZE(offset, geometry);
#ifdef ANTIALIASING
float halfWidthPixels = length(offset.xy);
if (halfWidthPixels > 0.0) {
float coverageScale = 1.0 + 0.5 / project.devicePixelRatio / halfWidthPixels;
offset.xy *= coverageScale;
uv.y *= coverageScale;
}
geometry.uv = uv;
#endif
DECKGL_FILTER_GL_POSITION(curr, geometry);
gl_Position = curr + vec4(project_pixel_size_to_clipspace(offset.xy), 0.0, 0.0);
vec4 color = mix(instanceSourceColors, instanceTargetColors, segmentRatio);
vColor = vec4(color.rgb, color.a * layer.opacity);
DECKGL_FILTER_COLOR(vColor, geometry);
}
`,uu=`#version 300 es
#define SHADER_NAME arc-layer-fragment-shader
precision highp float;
in vec4 vColor;
in vec2 uv;
in float isValid;
out vec4 fragColor;
void main(void) {
#ifdef ANTIALIASING
float edgeCoord = abs(uv.y);
float edgePixels = (1.0 - edgeCoord) / max(fwidth(edgeCoord), 1e-6);
#endif
if (isValid == 0.0) {
discard;
}
#ifdef ANTIALIASING
if (edgePixels <= -SMOOTH_EDGE_RADIUS) {
discard;
}
#endif
fragColor = vColor;
geometry.uv = uv;
#ifdef ANTIALIASING
fragColor.a *= smoothedge(0.0, edgePixels);
#endif
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`,bt=[0,0,0,255],fu={getSourcePosition:{type:"accessor",value:n=>n.sourcePosition},getTargetPosition:{type:"accessor",value:n=>n.targetPosition},getSourceColor:{type:"accessor",value:bt},getTargetColor:{type:"accessor",value:bt},getWidth:{type:"accessor",value:1},getHeight:{type:"accessor",value:1},getTilt:{type:"accessor",value:0},greatCircle:!1,numSegments:{type:"number",value:50,min:1},widthUnits:"pixels",widthScale:{type:"number",value:1,min:0},widthMinPixels:{type:"number",value:0,min:0},widthMaxPixels:{type:"number",value:Number.MAX_SAFE_INTEGER,min:0},antialiasing:!1};class wi extends ue{getBounds(){return this.getAttributeManager()?.getBounds(["instanceSourcePositions","instanceTargetPositions"])}getShaders(){const{antialiasing:e}=this.props;return super.getShaders({vs:cu,fs:uu,source:lu,defines:e?{ANTIALIASING:1}:{},modules:[_e,Ue,Fe,au]})}get wrapLongitude(){return!1}initializeState(){this.getAttributeManager().addInstanced({instanceSourcePositions:{size:3,type:"float64",fp64:this.use64bitPositions(),transition:!0,accessor:"getSourcePosition"},instanceTargetPositions:{size:3,type:"float64",fp64:this.use64bitPositions(),transition:!0,accessor:"getTargetPosition"},instanceSourceColors:{size:this.props.colorFormat.length,type:"unorm8",transition:!0,accessor:"getSourceColor",defaultValue:bt},instanceTargetColors:{size:this.props.colorFormat.length,type:"unorm8",transition:!0,accessor:"getTargetColor",defaultValue:bt},instanceWidths:{size:1,transition:!0,accessor:"getWidth",defaultValue:1},instanceHeights:{size:1,transition:!0,accessor:"getHeight",defaultValue:1},instanceTilts:{size:1,transition:!0,accessor:"getTilt",defaultValue:0}})}updateState(e){super.updateState(e);const{props:t,oldProps:i,changeFlags:o}=e;(o.extensionsChanged||t.antialiasing!==i.antialiasing)&&(this.state.model?.destroy(),this.state.model=this._getModel(),this.getAttributeManager().invalidateAll())}draw({uniforms:e}){const{widthUnits:t,widthScale:i,widthMinPixels:o,widthMaxPixels:s,greatCircle:r,wrapLongitude:a,numSegments:l}=this.props,c={numSegments:l,widthUnits:ve[t],widthScale:i,widthMinPixels:o,widthMaxPixels:s,greatCircle:r,useShortestPath:a},u=this.state.model;u.shaderInputs.setProps({arc:c}),u.setVertexCount(l*2),u.draw(this.context.renderPass)}_getModel(){return new j(this.context.device,{...this.getShaders(),id:this.props.id,bufferLayout:this.getAttributeManager().getBufferLayouts(),topology:"triangle-strip",isInstanced:!0})}}wi.layerName="ArcLayer";wi.defaultProps=fu;const mn=`layout(std140) uniform scatterplotUniforms {
  float radiusScale;
  float radiusMinPixels;
  float radiusMaxPixels;
  float lineWidthScale;
  float lineWidthMinPixels;
  float lineWidthMaxPixels;
  float stroked;
  float filled;
  bool antialiasing;
  bool billboard;
  highp int radiusUnits;
  highp int lineWidthUnits;
} scatterplot;
`,du={name:"scatterplot",vs:mn,fs:mn,source:"",uniformTypes:{radiusScale:"f32",radiusMinPixels:"f32",radiusMaxPixels:"f32",lineWidthScale:"f32",lineWidthMinPixels:"f32",lineWidthMaxPixels:"f32",stroked:"f32",filled:"f32",antialiasing:"f32",billboard:"f32",radiusUnits:"i32",lineWidthUnits:"i32"}},hu=`#version 300 es
#define SHADER_NAME scatterplot-layer-vertex-shader
in vec3 positions;
in vec3 instancePositions;
in vec3 instancePositions64Low;
in float instanceRadius;
in float instanceLineWidths;
in vec4 instanceFillColors;
in vec4 instanceLineColors;
#ifdef USE_ROW_INDEXES
in float rowIndexes;
#endif
in vec2 instancePixelOffset;
out vec4 vFillColor;
out vec4 vLineColor;
out vec2 unitPosition;
out float innerUnitRadius;
out float outerRadiusPixels;
void main(void) {
geometry.worldPosition = instancePositions;
outerRadiusPixels = clamp(
project_size_to_pixel(scatterplot.radiusScale * instanceRadius, scatterplot.radiusUnits),
scatterplot.radiusMinPixels, scatterplot.radiusMaxPixels
);
float lineWidthPixels = clamp(
project_size_to_pixel(scatterplot.lineWidthScale * instanceLineWidths, scatterplot.lineWidthUnits),
scatterplot.lineWidthMinPixels, scatterplot.lineWidthMaxPixels
);
outerRadiusPixels += scatterplot.stroked * lineWidthPixels / 2.0;
float edgePadding = scatterplot.antialiasing ? (outerRadiusPixels + SMOOTH_EDGE_RADIUS) / outerRadiusPixels : 1.0;
unitPosition = edgePadding * positions.xy;
geometry.uv = unitPosition;
#ifdef USE_ROW_INDEXES
geometry.pickingColor = picking_getPickingColorFromIndex(rowIndexes);
#else
geometry.pickingColor = picking_getPickingColorFromInstanceID();
#endif
innerUnitRadius = 1.0 - scatterplot.stroked * lineWidthPixels / outerRadiusPixels;
if (scatterplot.billboard) {
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0), geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
vec3 offset = edgePadding * positions * outerRadiusPixels;
offset.xy += instancePixelOffset;
DECKGL_FILTER_SIZE(offset, geometry);
gl_Position.xy += project_pixel_size_to_clipspace(offset.xy);
} else {
vec3 offset = edgePadding * positions * project_pixel_size(outerRadiusPixels);
offset.xy += project_pixel_size(instancePixelOffset);
DECKGL_FILTER_SIZE(offset, geometry);
gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset, geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
}
vFillColor = vec4(instanceFillColors.rgb, instanceFillColors.a * layer.opacity);
DECKGL_FILTER_COLOR(vFillColor, geometry);
vLineColor = vec4(instanceLineColors.rgb, instanceLineColors.a * layer.opacity);
DECKGL_FILTER_COLOR(vLineColor, geometry);
}
`,gu=`#version 300 es
#define SHADER_NAME scatterplot-layer-fragment-shader
precision highp float;
in vec4 vFillColor;
in vec4 vLineColor;
in vec2 unitPosition;
in float innerUnitRadius;
in float outerRadiusPixels;
out vec4 fragColor;
void main(void) {
geometry.uv = unitPosition;
float distToCenter = length(unitPosition) * outerRadiusPixels;
float inCircle = scatterplot.antialiasing ?
smoothedge(distToCenter, outerRadiusPixels) :
step(distToCenter, outerRadiusPixels);
if (inCircle == 0.0) {
discard;
}
if (scatterplot.stroked > 0.5) {
float isLine = scatterplot.antialiasing ?
smoothedge(innerUnitRadius * outerRadiusPixels, distToCenter) :
step(innerUnitRadius * outerRadiusPixels, distToCenter);
if (scatterplot.filled > 0.5) {
fragColor = mix(vFillColor, vLineColor, isLine);
} else {
if (isLine == 0.0) {
discard;
}
fragColor = vec4(vLineColor.rgb, vLineColor.a * isLine);
}
} else if (scatterplot.filled < 0.5) {
discard;
} else {
fragColor = vFillColor;
}
fragColor.a *= inCircle;
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`,pu=`// Main shaders

struct ScatterplotUniforms {
  radiusScale: f32,
  radiusMinPixels: f32,
  radiusMaxPixels: f32,
  lineWidthScale: f32,
  lineWidthMinPixels: f32,
  lineWidthMaxPixels: f32,
  stroked: f32,
  filled: i32,
  antialiasing: i32,
  billboard: i32,
  radiusUnits: i32,
  lineWidthUnits: i32,
};

@group(0) @binding(0) var<uniform> scatterplot: ScatterplotUniforms;

struct Attributes {
  @builtin(instance_index) instanceIndex : u32,
  @builtin(vertex_index) vertexIndex : u32,
  @location(0) positions: vec3<f32>,
  @location(1) instancePositions: vec3<f32>,
  @location(2) instancePositions64Low: vec3<f32>,
  @location(3) instanceRadius: f32,
  @location(4) instanceLineWidths: f32,
  @location(5) instanceFillColors: vec4<f32>,
  @location(6) instanceLineColors: vec4<f32>,
  @location(7) instancePixelOffset: vec2<f32>,
  PICKING_COLOR_ATTRIBUTE
};

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) vFillColor: vec4<f32>,
  @location(1) vLineColor: vec4<f32>,
  @location(2) unitPosition: vec2<f32>,
  @location(3) innerUnitRadius: f32,
  @location(4) outerRadiusPixels: f32,
  @location(5) pickingColor: vec3<f32>,
  @location(6) clipCoordinates: vec2<f32>,
};

@vertex
fn vertexMain(attributes: Attributes) -> Varyings {
  var varyings: Varyings;

  // Draw an inline geometry constant array clip space triangle to verify that rendering works.
  // var positions = array<vec2<f32>, 3>(vec2(0.0, 0.5), vec2(-0.5, -0.5), vec2(0.5, -0.5));
  // if (attributes.instanceIndex == 0) {
  //   varyings.position = vec4<f32>(positions[attributes.vertexIndex], 0.0, 1.0);
  //   return varyings;
  // }

  geometry.worldPosition = attributes.instancePositions;

  // Multiply out radius and clamp to limits
  varyings.outerRadiusPixels = clamp(
    project_unit_size_to_pixel(scatterplot.radiusScale * attributes.instanceRadius, scatterplot.radiusUnits),
    scatterplot.radiusMinPixels, scatterplot.radiusMaxPixels
  );

  // Multiply out line width and clamp to limits
  let lineWidthPixels = clamp(
    project_unit_size_to_pixel(scatterplot.lineWidthScale * attributes.instanceLineWidths, scatterplot.lineWidthUnits),
    scatterplot.lineWidthMinPixels, scatterplot.lineWidthMaxPixels
  );

  // outer radius needs to offset by half stroke width
  varyings.outerRadiusPixels += scatterplot.stroked * lineWidthPixels / 2.0;
  // Expand geometry to accommodate edge smoothing
  // WGSL selects the second value when the condition is true, so keep the antialiased path second.
  let edgePadding = select(
    1.0,
    (varyings.outerRadiusPixels + SMOOTH_EDGE_RADIUS) / varyings.outerRadiusPixels,
    scatterplot.antialiasing != 0
  );

  // position on the containing square in [-1, 1] space
  varyings.unitPosition = edgePadding * attributes.positions.xy;
  geometry.uv = varyings.unitPosition;
  geometry.pickingColor = PICKING_COLOR_VALUE;

  varyings.innerUnitRadius = 1.0 - scatterplot.stroked * lineWidthPixels / varyings.outerRadiusPixels;

  if (scatterplot.billboard != 0) {
    let projectedPosition = project_position_to_clipspace_and_commonspace(
      attributes.instancePositions,
      attributes.instancePositions64Low,
      vec3<f32>(0.0)
    );
    geometry.position = projectedPosition.commonPosition;
    varyings.position = projectedPosition.clipPosition;
    // DECKGL_FILTER_GL_POSITION(varyings.position, geometry);
    var offset = edgePadding * attributes.positions * varyings.outerRadiusPixels;
    offset = vec3<f32>(offset.xy + attributes.instancePixelOffset, offset.z);
    // DECKGL_FILTER_SIZE(offset, geometry);
    let clipPixels = project_pixel_size_to_clipspace(offset.xy);
    varyings.position = vec4<f32>(varyings.position.x + clipPixels.x, varyings.position.y + clipPixels.y, varyings.position.z, varyings.position.w);
    geometry.position = vec4<f32>(
      geometry.position.xy + project_pixel_size_vec2(offset.xy),
      geometry.position.zw
    );
  } else {
    var offset = edgePadding * attributes.positions * project_pixel_size_float(varyings.outerRadiusPixels);
    offset = vec3<f32>(offset.xy + project_pixel_size_vec2(attributes.instancePixelOffset), offset.z);
    // DECKGL_FILTER_SIZE(offset, geometry);
    let projectedPosition = project_position_to_clipspace_and_commonspace(
      attributes.instancePositions,
      attributes.instancePositions64Low,
      offset
    );
    geometry.position = projectedPosition.commonPosition;
    varyings.position = projectedPosition.clipPosition;
    // DECKGL_FILTER_GL_POSITION(varyings.position, geometry);
  }

  varyings.clipCoordinates = geometry.position.xy;
  clip_filterPosition(&varyings.position, geometry.worldPosition.xy);

  // Apply opacity to instance color, or return instance picking color
  varyings.vFillColor = vec4<f32>(attributes.instanceFillColors.rgb, attributes.instanceFillColors.a * layer.opacity);
  // DECKGL_FILTER_COLOR(varyings.vFillColor, geometry);
  varyings.vLineColor = vec4<f32>(attributes.instanceLineColors.rgb, attributes.instanceLineColors.a * layer.opacity);
  // DECKGL_FILTER_COLOR(varyings.vLineColor, geometry);
  varyings.pickingColor = geometry.pickingColor;

  return varyings;
}

@fragment
fn fragmentMain(varyings: Varyings) -> @location(0) vec4<f32> {
  // var geometry: Geometry;
  // geometry.uv = unitPosition;

  let distToCenter = length(varyings.unitPosition) * varyings.outerRadiusPixels;
  let inCircle = select(
    step(distToCenter, varyings.outerRadiusPixels),
    smoothedge(distToCenter, varyings.outerRadiusPixels),
    scatterplot.antialiasing != 0
  );

  if (inCircle == 0.0) {
    discard;
  }

  var fragColor: vec4<f32>;

  if (scatterplot.stroked != 0) {
    let isLine = select(
      step(varyings.innerUnitRadius * varyings.outerRadiusPixels, distToCenter),
      smoothedge(varyings.innerUnitRadius * varyings.outerRadiusPixels, distToCenter),
      scatterplot.antialiasing != 0
    );

    if (scatterplot.filled != 0) {
      fragColor = mix(varyings.vFillColor, varyings.vLineColor, isLine);
    } else {
      if (isLine == 0.0) {
        discard;
      }
      fragColor = vec4<f32>(varyings.vLineColor.rgb, varyings.vLineColor.a * isLine);
    }
  } else if (scatterplot.filled == 0) {
    discard;
  } else {
    fragColor = varyings.vFillColor;
  }

  fragColor.a *= inCircle;

  clip_filterColor(varyings.clipCoordinates);

  if (picking.isActive > 0.5) {
    if (!picking_isColorValid(varyings.pickingColor)) {
      discard;
    }
    return vec4<f32>(varyings.pickingColor, 1.0);
  }

  if (picking.isHighlightActive > 0.5) {
    let highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
    if (picking_isColorZero(abs(varyings.pickingColor - highlightedObjectColor))) {
      let highLightAlpha = picking.highlightColor.a;
      let blendedAlpha = highLightAlpha + fragColor.a * (1.0 - highLightAlpha);
      if (blendedAlpha > 0.0) {
        let highLightRatio = highLightAlpha / blendedAlpha;
        fragColor = vec4<f32>(
          mix(fragColor.rgb, picking.highlightColor.rgb, highLightRatio),
          blendedAlpha
        );
      } else {
        fragColor = vec4<f32>(fragColor.rgb, 0.0);
      }
    }
  }

  // Apply premultiplied alpha as required by transparent canvas
  fragColor = deckgl_premultiplied_alpha(fragColor);

  return fragColor;
  // return vec4<f32>(0, 0, 1, 1);
}
`;function mu(n){return pu.replace("PICKING_COLOR_ATTRIBUTE",n?"@location(8) rowIndexes: u32,":"").replace("PICKING_COLOR_VALUE",n?"picking_getPickingColorFromIndex(attributes.rowIndexes)":"picking_getPickingColorFromIndex(attributes.instanceIndex)")}const ui=0,Ro=1,yu=`struct ClipUniforms {
  enabled: i32,
  mode: i32,
  bounds: vec4<f32>,
};

@group(2) @binding(auto) var<uniform> clipUniforms: ClipUniforms;

fn clip_isInBounds(coordinates: vec2<f32>) -> bool {
  return coordinates.x >= clipUniforms.bounds.x &&
    coordinates.y >= clipUniforms.bounds.y &&
    coordinates.x < clipUniforms.bounds.z &&
    coordinates.y < clipUniforms.bounds.w;
}

fn clip_filterPosition(position: ptr<function, vec4<f32>>, instanceCoordinates: vec2<f32>) {
  if (
    clipUniforms.enabled != 0 &&
    clipUniforms.mode == ${Ro} &&
    !clip_isInBounds(instanceCoordinates)
  ) {
    *position = vec4<f32>(2.0, 2.0, 2.0, 1.0);
  }
}

fn clip_filterColor(geometryCoordinates: vec2<f32>) {
  if (
    clipUniforms.enabled != 0 &&
    clipUniforms.mode == ${ui} &&
    !clip_isInBounds(geometryCoordinates)
  ) {
    discard;
  }
}
`,Li={name:"clip",source:yu,props:{},uniforms:{},bindingLayout:[{name:"clip",group:2}],uniformTypes:{enabled:"i32",mode:"i32",bounds:"vec4<f32>"},defaultUniforms:{enabled:0,mode:ui,bounds:[0,0,1,1]},getUniforms(n={}){const e={};return n.enabled!==void 0&&(e.enabled=n.enabled?1:0),n.mode!==void 0&&(e.mode=n.mode==="instance"?Ro:ui),n.bounds!==void 0&&(e.bounds=n.bounds),e}},yn=[0,0,0,255],bu={radiusUnits:"meters",radiusScale:{type:"number",min:0,value:1},radiusMinPixels:{type:"number",min:0,value:0},radiusMaxPixels:{type:"number",min:0,value:Number.MAX_SAFE_INTEGER},lineWidthUnits:"meters",lineWidthScale:{type:"number",min:0,value:1},lineWidthMinPixels:{type:"number",min:0,value:0},lineWidthMaxPixels:{type:"number",min:0,value:Number.MAX_SAFE_INTEGER},stroked:!1,filled:!0,billboard:!1,antialiasing:!0,getPosition:{type:"accessor",value:n=>n.position},getRadius:{type:"accessor",value:1},getFillColor:{type:"accessor",value:yn},getLineColor:{type:"accessor",value:yn},getLineWidth:{type:"accessor",value:1},getPixelOffset:{type:"accessor",value:[0,0]},strokeWidth:{deprecatedFor:"getLineWidth"},outline:{deprecatedFor:"stroked"},getColor:{deprecatedFor:["getFillColor","getLineColor"]}};class Si extends ue{getShaders(){const e=!!this.props.data?.attributes?.rowIndexes;return super.getShaders({vs:hu,fs:gu,source:mu(e),defines:e?{USE_ROW_INDEXES:!0}:{},modules:[_e,Ue,Fe,du,...this.context.device.type==="webgpu"?[Li]:[]]})}initializeState(){const e=this.props.data?.attributes?.rowIndexes?{rowIndexes:{size:1,type:"uint32",noAlloc:!0}}:{};this.getAttributeManager().addInstanced({instancePositions:{size:3,type:"float64",fp64:this.use64bitPositions(),transition:!0,accessor:"getPosition"},instanceRadius:{size:1,transition:!0,accessor:"getRadius",defaultValue:1,bufferGroup:"scatterplot-instance-data"},instanceFillColors:{size:this.props.colorFormat.length,transition:!0,type:"unorm8",accessor:"getFillColor",defaultValue:[0,0,0,255],bufferGroup:"scatterplot-instance-data"},instanceLineColors:{size:this.props.colorFormat.length,transition:!0,type:"unorm8",accessor:"getLineColor",defaultValue:[0,0,0,255],bufferGroup:"scatterplot-instance-data"},instanceLineWidths:{size:1,transition:!0,accessor:"getLineWidth",defaultValue:1,bufferGroup:"scatterplot-instance-data"},instancePixelOffset:{size:2,transition:!0,accessor:"getPixelOffset",bufferGroup:"scatterplot-instance-data"},...e})}updateState(e){super.updateState(e),e.changeFlags.extensionsChanged&&(this.state.model?.destroy(),this.state.model=this._getModel(),this.getAttributeManager().invalidateAll())}draw({uniforms:e}){const{radiusUnits:t,radiusScale:i,radiusMinPixels:o,radiusMaxPixels:s,stroked:r,filled:a,billboard:l,antialiasing:c,lineWidthUnits:u,lineWidthScale:f,lineWidthMinPixels:h,lineWidthMaxPixels:g}=this.props,y={stroked:r,filled:a,billboard:l,antialiasing:c,radiusUnits:ve[t],radiusScale:i,radiusMinPixels:o,radiusMaxPixels:s,lineWidthUnits:ve[u],lineWidthScale:f,lineWidthMinPixels:h,lineWidthMaxPixels:g},b=this.state.model;b.shaderInputs.setProps({scatterplot:y}),b.draw(this.context.renderPass)}_getModel(){const e=[-1,-1,0,1,-1,0,-1,1,0,1,1,0];return new j(this.context.device,{...this.getShaders(),id:this.props.id,bufferLayout:this.getAttributeManager().getBufferLayouts(),geometry:new le({topology:"triangle-strip",attributes:{positions:{size:3,value:new Float32Array(e)}}}),isInstanced:!0})}}Si.defaultProps=bu;Si.layerName="ScatterplotLayer";const Ci={CLOCKWISE:1,COUNTER_CLOCKWISE:-1};function Ai(n,e,t={}){return vu(n,t)!==e?(xu(n,t),!0):!1}function vu(n,e={}){return Math.sign(_u(n,e))}const bn={x:0,y:1,z:2};function _u(n,e={}){const{start:t=0,end:i=n.length,plane:o="xy"}=e,s=e.size||2;let r=0;const a=bn[o[0]],l=bn[o[1]];for(let c=t,u=i-s;c<i;c+=s)r+=(n[c+a]-n[u+a])*(n[c+l]+n[u+l]),u=c;return r/2}function xu(n,e){const{start:t=0,end:i=n.length,size:o=2}=e,s=(i-t)/o,r=Math.floor(s/2);for(let a=0;a<r;++a){const l=t+a*o,c=t+(s-1-a)*o;for(let u=0;u<o;++u){const f=n[l+u];n[l+u]=n[c+u],n[c+u]=f}}}function J(n,e){const t=e.length,i=n.length;if(i>0){let o=!0;for(let s=0;s<t;s++)if(n[i-t+s]!==e[s]){o=!1;break}if(o)return!1}for(let o=0;o<t;o++)n[i+o]=e[o];return!0}function fi(n,e){const t=e.length;for(let i=0;i<t;i++)n[i]=e[i]}function Ne(n,e,t,i,o=[]){const s=i+e*t;for(let r=0;r<t;r++)o[r]=n[s+r];return o}function di(n,e,t,i,o=[]){let s,r;if(t&8)s=(i[3]-n[1])/(e[1]-n[1]),r=3;else if(t&4)s=(i[1]-n[1])/(e[1]-n[1]),r=1;else if(t&2)s=(i[2]-n[0])/(e[0]-n[0]),r=2;else if(t&1)s=(i[0]-n[0])/(e[0]-n[0]),r=0;else return null;for(let a=0;a<n.length;a++)o[a]=(r&1)===a?i[r]:s*(e[a]-n[a])+n[a];return o}function ot(n,e){let t=0;return n[0]<e[0]?t|=1:n[0]>e[2]&&(t|=2),n[1]<e[1]?t|=4:n[1]>e[3]&&(t|=8),t}function Mo(n,e){const{size:t=2,broken:i=!1,gridResolution:o=10,gridOffset:s=[0,0],startIndex:r=0,endIndex:a=n.length}=e||{},l=(a-r)/t;let c=[];const u=[c],f=Ne(n,0,t,r);let h,g;const y=No(f,o,s,[]),b=[];J(c,f);for(let w=1;w<l;w++){for(h=Ne(n,w,t,r,h),g=ot(h,y);g;){di(f,h,g,y,b);const S=ot(b,y);S&&(di(f,b,S,y,b),g=S),J(c,b),fi(f,b),wu(y,o,g),i&&c.length>t&&(c=[],u.push(c),J(c,f)),g=ot(h,y)}J(c,h),fi(f,h)}return i?u:u[0]}const vn=0,Pu=1;function Do(n,e=null,t){if(!n.length)return[];const{size:i=2,gridResolution:o=10,gridOffset:s=[0,0],edgeTypes:r=!1}=t||{},a=[],l=[{pos:n,types:r?new Array(n.length/i).fill(Pu):null,holes:e||[]}],c=[[],[]];let u=[];for(;l.length;){const{pos:f,types:h,holes:g}=l.shift();Lu(f,i,g[0]||f.length,c),u=No(c[0],o,s,u);const y=ot(c[1],u);if(y){let b=_n(f,h,i,0,g[0]||f.length,u,y);const w={pos:b[0].pos,types:b[0].types,holes:[]},S={pos:b[1].pos,types:b[1].types,holes:[]};l.push(w,S);for(let A=0;A<g.length;A++)b=_n(f,h,i,g[A],g[A+1]||f.length,u,y),b[0]&&(w.holes.push(w.pos.length),w.pos=He(w.pos,b[0].pos),r&&(w.types=He(w.types,b[0].types))),b[1]&&(S.holes.push(S.pos.length),S.pos=He(S.pos,b[1].pos),r&&(S.types=He(S.types,b[1].types)))}else{const b={positions:f};r&&(b.edgeTypes=h),g.length&&(b.holeIndices=g),a.push(b)}}return a}function _n(n,e,t,i,o,s,r){const a=(o-i)/t,l=[],c=[],u=[],f=[],h=[];let g,y,b;const w=Ne(n,a-1,t,i);let S=Math.sign(r&8?w[1]-s[3]:w[0]-s[2]),A=e&&e[a-1],L=0,B=0;for(let k=0;k<a;k++)g=Ne(n,k,t,i,g),y=Math.sign(r&8?g[1]-s[3]:g[0]-s[2]),b=e&&e[i/t+k],y&&S&&S!==y&&(di(w,g,r,s,h),J(l,h)&&u.push(A),J(c,h)&&f.push(A)),y<=0?(J(l,g)&&u.push(b),L-=y):u.length&&(u[u.length-1]=vn),y>=0?(J(c,g)&&f.push(b),B+=y):f.length&&(f[f.length-1]=vn),fi(w,g),S=y,A=b;return[L?{pos:l,types:e&&u}:null,B?{pos:c,types:e&&f}:null]}function No(n,e,t,i){const o=Math.floor((n[0]-t[0])/e)*e+t[0],s=Math.floor((n[1]-t[1])/e)*e+t[1];return i[0]=o,i[1]=s,i[2]=o+e,i[3]=s+e,i}function wu(n,e,t){t&8?(n[1]+=e,n[3]+=e):t&4?(n[1]-=e,n[3]-=e):t&2?(n[0]+=e,n[2]+=e):t&1&&(n[0]-=e,n[2]-=e)}function Lu(n,e,t,i){let o=1/0,s=-1/0,r=1/0,a=-1/0;for(let l=0;l<t;l+=e){const c=n[l],u=n[l+1];o=c<o?c:o,s=c>s?c:s,r=u<r?u:r,a=u>a?u:a}return i[0][0]=o,i[0][1]=r,i[1][0]=s,i[1][1]=a,i}function He(n,e){for(let t=0;t<e.length;t++)n.push(e[t]);return n}const Su=85.051129;function Cu(n,e){const{size:t=2,startIndex:i=0,endIndex:o=n.length,normalize:s=!0}=e||{},r=n.slice(i,o);Uo(r,t,0,o-i);const a=Mo(r,{size:t,broken:!0,gridResolution:360,gridOffset:[-180,-180]});if(s)for(const l of a)Fo(l,t);return a}function Au(n,e=null,t){const{size:i=2,normalize:o=!0,edgeTypes:s=!1}=t||{};e=e||[];const r=[],a=[];let l=0,c=0;for(let f=0;f<=e.length;f++){const h=e[f]||n.length,g=c,y=Eu(n,i,l,h);for(let b=y;b<h;b++)r[c++]=n[b];for(let b=l;b<y;b++)r[c++]=n[b];Uo(r,i,g,c),Iu(r,i,g,c,t?.maxLatitude),l=h,a[f]=c}a.pop();const u=Do(r,a,{size:i,gridResolution:360,gridOffset:[-180,-180],edgeTypes:s});if(o)for(const f of u)Fo(f.positions,i);return u}function Eu(n,e,t,i){let o=-1,s=-1;for(let r=t+1;r<i;r+=e){const a=Math.abs(n[r]);a>o&&(o=a,s=r-1)}return s}function Iu(n,e,t,i,o=Su){const s=n[t],r=n[i-e];if(Math.abs(s-r)>180){const a=Ne(n,0,e,t);a[0]+=Math.round((r-s)/360)*360,J(n,a),a[1]=Math.sign(a[1])*o,J(n,a),a[0]=s,J(n,a)}}function Uo(n,e,t,i){let o=n[0],s;for(let r=t;r<i;r+=e){s=n[r];const a=s-o;(a>180||a<-180)&&(s-=Math.round(a/360)*360),n[r]=o=s}}function Fo(n,e){let t;const i=n.length/e;for(let s=0;s<i&&(t=n[s*e],(t+180)%360===0);s++);const o=-Math.round(t/360)*360;if(o!==0)for(let s=0;s<i;s++)n[s*e]+=o}class Tu extends le{constructor(e){const{indices:t,attributes:i}=Bu(e);super({...e,topology:"line-list",indices:t,attributes:i})}}function Bu(n){const{radius:e,height:t=1,nradial:i=10}=n;let{vertices:o}=n;o&&(H.assert(o.length>=i),o=o.flatMap(g=>[g[0],g[1]]),Ai(o,Ci.COUNTER_CLOCKWISE));const s=t>0,r=i+1,a=s?r*3+1:i,l=Math.PI*2/i,c=new Uint16Array(s?i*3*2:0),u=new Float32Array(a*3),f=new Float32Array(a*3);let h=0;if(s){for(let g=0;g<r;g++){const y=g*l,b=g%i,w=Math.sin(y),S=Math.cos(y);for(let A=0;A<2;A++)u[h+0]=o?o[b*2]:S*e,u[h+1]=o?o[b*2+1]:w*e,u[h+2]=(1/2-A)*t,f[h+0]=o?o[b*2]:S,f[h+1]=o?o[b*2+1]:w,h+=3}u[h+0]=u[h-3],u[h+1]=u[h-2],u[h+2]=u[h-1],h+=3}for(let g=s?0:1;g<r;g++){const y=Math.floor(g/2)*Math.sign(.5-g%2),b=y*l,w=(y+i)%i,S=Math.sin(b),A=Math.cos(b);u[h+0]=o?o[w*2]:A*e,u[h+1]=o?o[w*2+1]:S*e,u[h+2]=t/2,f[h+2]=1,h+=3}if(s){let g=0;for(let y=0;y<i;y++)c[g++]=y*2+0,c[g++]=y*2+2,c[g++]=y*2+0,c[g++]=y*2+1,c[g++]=y*2+1,c[g++]=y*2+3}return{indices:c,attributes:{POSITION:{size:3,value:u},NORMAL:{size:3,value:f}}}}const Ou=`struct ColumnUniforms {
  radius: f32,
  angle: f32,
  offset: vec2<f32>,
  extruded: f32,
  stroked: f32,
  isStroke: f32,
  coverage: f32,
  elevationScale: f32,
  edgeDistance: f32,
  widthScale: f32,
  widthMinPixels: f32,
  widthMaxPixels: f32,
  radiusUnits: i32,
  widthUnits: i32,
};

@group(0) @binding(auto) var<uniform> column: ColumnUniforms;
`,xn=`layout(std140) uniform columnUniforms {
  float radius;
  float angle;
  vec2 offset;
  bool extruded;
  bool stroked;
  bool isStroke;
  float coverage;
  float elevationScale;
  float edgeDistance;
  float widthScale;
  float widthMinPixels;
  float widthMaxPixels;
  highp int radiusUnits;
  highp int widthUnits;
} column;
`,Ru={name:"column",source:Ou,vs:xn,fs:xn,uniformTypes:{radius:"f32",angle:"f32",offset:"vec2<f32>",extruded:"f32",stroked:"f32",isStroke:"f32",coverage:"f32",elevationScale:"f32",edgeDistance:"f32",widthScale:"f32",widthMinPixels:"f32",widthMaxPixels:"f32",radiusUnits:"i32",widthUnits:"i32"}},ko=`struct Attributes {
  @builtin(instance_index) instanceIndex: u32,
  @location(0) positions: vec3<f32>,
  @location(1) normals: vec3<f32>,
  @location(2) instancePositions: vec3<f32>,
  @location(3) instancePositions64Low: vec3<f32>,
  @location(4) instanceElevations: f32,
  @location(5) instanceFillColors: vec4<f32>,
  @location(6) instanceLineColors: vec4<f32>,
  @location(7) instanceStrokeWidths: f32
};

fn getRotationMatrix(angle: f32) -> mat2x2<f32> {
  let s = sin(angle);
  let c = cos(angle);
  return mat2x2<f32>(
    vec2<f32>(c, s),
    vec2<f32>(-s, c)
  );
}

fn getOffset(
  positions: vec3<f32>,
  strokeOffsetRatio: f32,
  dotRadius: f32,
  rotationMatrix: mat2x2<f32>
) -> vec3<f32> {
  var offset = (rotationMatrix * positions.xy * strokeOffsetRatio + column.offset) * dotRadius;
  if (column.radiusUnits == UNIT_METERS) {
    offset = project_size_vec2(offset);
  } else if (column.radiusUnits == UNIT_PIXELS) {
    offset = project_pixel_size_vec2(offset);
  }
  return vec3<f32>(offset, 0.0);
}
`,Mu=`${ko}

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>
};

@vertex
fn vertexMain(attributes: Attributes) -> Varyings {
  var varyings: Varyings;

  geometry.worldPosition = attributes.instancePositions;
  geometry.pickingColor = picking_getPickingColorFromIndex(attributes.instanceIndex);

  let isStroke = column.isStroke > 0.5;
  let baseColor = select(attributes.instanceFillColors, attributes.instanceLineColors, isStroke);
  let rotationMatrix = getRotationMatrix(column.angle);

  var elevation = 0.0;
  var strokeOffsetRatio = 1.0;

  if (column.extruded > 0.5) {
    elevation =
      attributes.instanceElevations * (attributes.positions.z + 1.0) / 2.0 * column.elevationScale;
  } else if (column.stroked > 0.5) {
    let widthPixels = clamp(
      project_unit_size_to_pixel(attributes.instanceStrokeWidths * column.widthScale, column.widthUnits),
      column.widthMinPixels,
      column.widthMaxPixels
    ) / 2.0;
    let halfOffset =
      project_pixel_size_float(widthPixels) /
      project_size_float(column.edgeDistance * column.coverage * column.radius);
    if (isStroke) {
      strokeOffsetRatio -= sign(attributes.positions.z) * halfOffset;
    } else {
      strokeOffsetRatio -= halfOffset;
    }
  }

  let shouldRender = select(0.0, 1.0, baseColor.a > 0.0 && attributes.instanceElevations >= 0.0);
  let dotRadius = column.radius * column.coverage * shouldRender;
  let centroidPosition =
    vec3<f32>(
      attributes.instancePositions.xy,
      attributes.instancePositions.z + elevation
    );
  let offset = getOffset(attributes.positions, strokeOffsetRatio, dotRadius, rotationMatrix);
  let projected = project_position_to_clipspace_and_commonspace(
    centroidPosition,
    attributes.instancePositions64Low,
    offset
  );

  geometry.position = projected.commonPosition;
  geometry.normal = project_normal(vec3<f32>(rotationMatrix * attributes.normals.xy, attributes.normals.z));

  let lightColor = lighting_getLightColor2(
    baseColor.rgb,
    project.cameraPosition,
    geometry.position.xyz,
    geometry.normal
  );

  varyings.position = projected.clipPosition;
  varyings.color = vec4<f32>(
    select(baseColor.rgb, lightColor, column.extruded > 0.5 && !isStroke),
    baseColor.a * layer.opacity
  );

  return varyings;
}

@fragment
fn fragmentMain(varyings: Varyings) -> @location(0) vec4<f32> {
  geometry.uv = vec2<f32>(0.0);
  return deckgl_premultiplied_alpha(varyings.color);
}
`,Du=`${ko}

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) cameraPosition: vec3<f32>,
  @location(2) positionCommonspace: vec4<f32>
};

@vertex
fn vertexMain(attributes: Attributes) -> Varyings {
  var varyings: Varyings;

  geometry.worldPosition = attributes.instancePositions;
  geometry.pickingColor = picking_getPickingColorFromIndex(attributes.instanceIndex);

  let isStroke = column.isStroke > 0.5;
  let baseColor = select(attributes.instanceFillColors, attributes.instanceLineColors, isStroke);
  let rotationMatrix = getRotationMatrix(column.angle);

  var elevation = 0.0;
  var strokeOffsetRatio = 1.0;

  if (column.extruded > 0.5) {
    elevation =
      attributes.instanceElevations * (attributes.positions.z + 1.0) / 2.0 * column.elevationScale;
  } else if (column.stroked > 0.5) {
    let widthPixels = clamp(
      project_unit_size_to_pixel(attributes.instanceStrokeWidths * column.widthScale, column.widthUnits),
      column.widthMinPixels,
      column.widthMaxPixels
    ) / 2.0;
    let halfOffset =
      project_pixel_size_float(widthPixels) /
      project_size_float(column.edgeDistance * column.coverage * column.radius);
    if (isStroke) {
      strokeOffsetRatio -= sign(attributes.positions.z) * halfOffset;
    } else {
      strokeOffsetRatio -= halfOffset;
    }
  }

  let shouldRender = select(0.0, 1.0, baseColor.a > 0.0 && attributes.instanceElevations >= 0.0);
  let dotRadius = column.radius * column.coverage * shouldRender;
  let centroidPosition =
    vec3<f32>(
      attributes.instancePositions.xy,
      attributes.instancePositions.z + elevation
    );
  let offset = getOffset(attributes.positions, strokeOffsetRatio, dotRadius, rotationMatrix);
  let projected = project_position_to_clipspace_and_commonspace(
    centroidPosition,
    attributes.instancePositions64Low,
    offset
  );

  geometry.position = projected.commonPosition;
  geometry.normal = project_normal(vec3<f32>(rotationMatrix * attributes.normals.xy, attributes.normals.z));

  varyings.position = projected.clipPosition;
  varyings.color = vec4<f32>(baseColor.rgb, baseColor.a * layer.opacity);
  varyings.cameraPosition = project.cameraPosition;
  varyings.positionCommonspace = projected.commonPosition;

  return varyings;
}

@fragment
fn fragmentMain(varyings: Varyings) -> @location(0) vec4<f32> {
  geometry.uv = vec2<f32>(0.0);

  var fragColor = varyings.color;
  if (column.extruded > 0.5 && column.isStroke < 0.5) {
    // WebGPU's screen-space Y axis reverses the derivative orientation used by GLSL flat shading.
    let normal = normalize(cross(dpdy(varyings.positionCommonspace.xyz), dpdx(varyings.positionCommonspace.xyz)));
    fragColor = vec4<f32>(
      lighting_getLightColor2(
        varyings.color.rgb,
        varyings.cameraPosition,
        varyings.positionCommonspace.xyz,
        normal
      ),
      varyings.color.a
    );
  }

  return deckgl_premultiplied_alpha(fragColor);
}
`;function Nu(n){return n?Du:Mu}const Uu=`#version 300 es
#define SHADER_NAME column-layer-vertex-shader
in vec3 positions;
in vec3 normals;
in vec3 instancePositions;
in float instanceElevations;
in vec3 instancePositions64Low;
in vec4 instanceFillColors;
in vec4 instanceLineColors;
in float instanceStrokeWidths;
out vec4 vColor;
#ifdef FLAT_SHADING
out vec3 cameraPosition;
out vec4 position_commonspace;
#endif
void main(void) {
geometry.worldPosition = instancePositions;
vec4 color = column.isStroke ? instanceLineColors : instanceFillColors;
mat2 rotationMatrix = mat2(cos(column.angle), sin(column.angle), -sin(column.angle), cos(column.angle));
float elevation = 0.0;
float strokeOffsetRatio = 1.0;
if (column.extruded) {
elevation = instanceElevations * (positions.z + 1.0) / 2.0 * column.elevationScale;
} else if (column.stroked) {
float widthPixels = clamp(
project_size_to_pixel(instanceStrokeWidths * column.widthScale, column.widthUnits),
column.widthMinPixels, column.widthMaxPixels) / 2.0;
float halfOffset = project_pixel_size(widthPixels) / project_size(column.edgeDistance * column.coverage * column.radius);
if (column.isStroke) {
strokeOffsetRatio -= sign(positions.z) * halfOffset;
} else {
strokeOffsetRatio -= halfOffset;
}
}
float shouldRender = float(color.a > 0.0 && instanceElevations >= 0.0);
float dotRadius = column.radius * column.coverage * shouldRender;
geometry.pickingColor = picking_getPickingColorFromInstanceID();
vec3 centroidPosition = vec3(instancePositions.xy, instancePositions.z + elevation);
vec3 centroidPosition64Low = instancePositions64Low;
vec2 offset = (rotationMatrix * positions.xy * strokeOffsetRatio + column.offset) * dotRadius;
if (column.radiusUnits == UNIT_METERS) {
offset = project_size(offset);
} else if (column.radiusUnits == UNIT_PIXELS) {
offset = project_pixel_size(offset);
}
vec3 pos = vec3(offset, 0.);
DECKGL_FILTER_SIZE(pos, geometry);
gl_Position = project_position_to_clipspace(centroidPosition, centroidPosition64Low, pos, geometry.position);
geometry.normal = project_normal(vec3(rotationMatrix * normals.xy, normals.z));
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
if (column.extruded && !column.isStroke) {
#ifdef FLAT_SHADING
cameraPosition = project.cameraPosition;
position_commonspace = geometry.position;
vColor = vec4(color.rgb, color.a * layer.opacity);
#else
vec3 lightColor = lighting_getLightColor(color.rgb, project.cameraPosition, geometry.position.xyz, geometry.normal);
vColor = vec4(lightColor, color.a * layer.opacity);
#endif
} else {
vColor = vec4(color.rgb, color.a * layer.opacity);
}
DECKGL_FILTER_COLOR(vColor, geometry);
}
`,Fu=`#version 300 es
#define SHADER_NAME column-layer-fragment-shader
precision highp float;
out vec4 fragColor;
in vec4 vColor;
#ifdef FLAT_SHADING
in vec3 cameraPosition;
in vec4 position_commonspace;
#endif
void main(void) {
fragColor = vColor;
geometry.uv = vec2(0.);
#ifdef FLAT_SHADING
if (column.extruded && !column.isStroke && !bool(picking.isActive)) {
vec3 normal = normalize(cross(dFdx(position_commonspace.xyz), dFdy(position_commonspace.xyz)));
fragColor.rgb = lighting_getLightColor(vColor.rgb, cameraPosition, position_commonspace.xyz, normal);
}
#endif
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`,vt=[0,0,0,255],ku={name:"geometry",stepMode:"vertex",byteStride:24,attributes:[{attribute:"positions",format:"float32x3",byteOffset:0},{attribute:"normals",format:"float32x3",byteOffset:12}]},zu={diskResolution:{type:"number",min:4,value:20},vertices:null,radius:{type:"number",min:0,value:1e3},angle:{type:"number",value:0},offset:{type:"array",value:[0,0]},coverage:{type:"number",min:0,max:1,value:1},elevationScale:{type:"number",min:0,value:1},radiusUnits:"meters",lineWidthUnits:"meters",lineWidthScale:1,lineWidthMinPixels:0,lineWidthMaxPixels:Number.MAX_SAFE_INTEGER,extruded:!0,wireframe:!1,filled:!0,stroked:!1,flatShading:!1,getPosition:{type:"accessor",value:n=>n.position},getFillColor:{type:"accessor",value:vt},getLineColor:{type:"accessor",value:vt},getLineWidth:{type:"accessor",value:1},getElevation:{type:"accessor",value:1e3},material:!0,getColor:{deprecatedFor:["getFillColor","getLineColor"]}};class Ei extends ue{getShaders(){const e={},{flatShading:t}=this.props;return t&&(e.FLAT_SHADING=1),super.getShaders({vs:Uu,fs:Fu,source:Nu(t),defines:e,modules:[_e,Ue,t?so:mi,Fe,Ru]})}initializeState(){this.getAttributeManager().addInstanced({instancePositions:{size:3,type:"float64",fp64:this.use64bitPositions(),transition:!0,accessor:"getPosition"},instanceElevations:{size:1,transition:!0,accessor:"getElevation"},instanceFillColors:{size:this.props.colorFormat.length,type:"unorm8",transition:!0,accessor:"getFillColor",defaultValue:vt},instanceLineColors:{size:this.props.colorFormat.length,type:"unorm8",transition:!0,accessor:"getLineColor",defaultValue:vt},instanceStrokeWidths:{size:1,accessor:"getLineWidth",transition:!0}})}updateState(e){super.updateState(e);const{props:t,oldProps:i,changeFlags:o}=e,s=o.extensionsChanged||t.flatShading!==i.flatShading;s&&(this.state.models?.forEach(a=>a.destroy()),this.setState(this._getModels()),this.getAttributeManager().invalidateAll());const r=this.getNumInstances();this.state.fillModel.setInstanceCount(r),this.state.strokeModel.setInstanceCount(r),this.state.wireframeModel.setInstanceCount(r),(s||t.diskResolution!==i.diskResolution||t.vertices!==i.vertices||t.extruded!==i.extruded||t.stroked!==i.stroked)&&this._updateGeometry(t)}getGeometry(e,t,i){const o=new Tu({radius:1,height:i?2:0,vertices:t,nradial:e});let s=0;if(t)for(let r=0;r<e;r++){const a=t[r],l=Math.sqrt(a[0]*a[0]+a[1]*a[1]);s+=l/e}else s=1;return this.setState({edgeDistance:Math.cos(Math.PI/e)*s}),o}_getModels(){const e=this.getShaders(),t=[...this.getAttributeManager().getBufferLayouts(),ku],i=new j(this.context.device,{...e,id:`${this.props.id}-fill`,bufferLayout:t,isInstanced:!0}),o=new j(this.context.device,{...e,id:`${this.props.id}-stroke`,bufferLayout:t,isInstanced:!0}),s=new j(this.context.device,{...e,id:`${this.props.id}-wireframe`,bufferLayout:t,isInstanced:!0});return{fillModel:i,strokeModel:o,wireframeModel:s,models:[s,i,o]}}_updateGeometry({diskResolution:e,vertices:t,extruded:i,stroked:o}){const s=this.getGeometry(e,t,i||o),r=s.attributes.POSITION,a=s.attributes.NORMAL;if(this._setFillGeometry(new le({topology:"triangle-strip",attributes:{POSITION:r,NORMAL:a}})),!i&&o){const l=r.value.length/3;this._setStrokeGeometry(new le({topology:"triangle-strip",vertexCount:l-e-1,attributes:{POSITION:r,NORMAL:a}}))}i&&this._setWireframeGeometry(s)}_setFillGeometry(e){const t=et(e,{attributes:["POSITION","NORMAL"]});this.state.fillModel.setGeometry(t)}_setStrokeGeometry(e){const t=et(e,{attributes:["POSITION","NORMAL"]});this.state.strokeModel.setGeometry(t)}_setWireframeGeometry(e){const t=et(e,{attributes:["POSITION","NORMAL"]}),i=this.state.wireframeModel;i.setGeometry(t),i.setTopology("line-list")}draw({uniforms:e}){const{lineWidthUnits:t,lineWidthScale:i,lineWidthMinPixels:o,lineWidthMaxPixels:s,radiusUnits:r,elevationScale:a,extruded:l,filled:c,stroked:u,wireframe:f,offset:h,coverage:g,radius:y,angle:b}=this.props,w=this.state.fillModel,S=this.state.strokeModel,A=this.state.wireframeModel,{edgeDistance:L}=this.state,B={radius:y,angle:b/180*Math.PI,offset:h,extruded:l,stroked:u,coverage:g,elevationScale:a,edgeDistance:L,radiusUnits:ve[r],widthUnits:ve[t],widthScale:i,widthMinPixels:o,widthMaxPixels:s};l&&f&&(A.shaderInputs.setProps({column:{...B,isStroke:!0}}),A.draw(this.context.renderPass)),c&&(w.shaderInputs.setProps({column:{...B,isStroke:!1}}),w.draw(this.context.renderPass)),!l&&u&&(S.shaderInputs.setProps({column:{...B,isStroke:!0}}),S.draw(this.context.renderPass))}}Ei.layerName="ColumnLayer";Ei.defaultProps=zu;function Vu(n,e,t,i){let o;if(Array.isArray(n[0])){const s=n.length*e;o=new Array(s);for(let r=0;r<n.length;r++)for(let a=0;a<e;a++)o[r*e+a]=n[r][a]||0}else o=n;return t?Mo(o,{size:e,gridResolution:t}):i?Cu(o,{size:e}):o}const Gu=1,ju=2,Ee=4;class $u extends Oo{constructor(e){super({...e,attributes:{positions:{size:3,padding:18,initialize:!0,type:e.fp64?Float64Array:Float32Array},segmentTypes:{size:1,type:e.isWebGPU?Float32Array:Uint8ClampedArray}}})}get(e){return this.attributes[e]}getPathSegmentIndices(e){const t=this.attributes.segmentTypes,i=this.vertexStarts[e],o=Math.min(this.vertexStarts[e+1]??this.instanceCount,this.instanceCount),s=[];for(let r=i;r<o-1;r++)(t[r]&Ee)===0&&s.push(r);return s.length&&(t[i]&Ee)!==0&&s.unshift(s.pop()),s}getGeometryFromBuffer(e){return this.normalize||this.opts.isWebGPU?super.getGeometryFromBuffer(e):null}normalizeGeometry(e){return this.normalize?Vu(e,this.positionSize,this.opts.resolution,this.opts.wrapLongitude):e}getGeometrySize(e){if(Pn(e)){let i=0;for(const o of e)i+=this.getGeometrySize(o);return i}const t=this.getPathLength(e);return t<2?0:this.isClosed(e)?t<3?0:t+2:t}updateGeometryAttributes(e,t){if(t.geometrySize!==0)if(e&&Pn(e))for(const i of e){const o=this.getGeometrySize(i);t.geometrySize=o,this.updateGeometryAttributes(i,t),t.vertexStart+=o}else this._updateSegmentTypes(e,t),this._updatePositions(e,t)}_updateSegmentTypes(e,t){const i=this.attributes.segmentTypes,o=e?this.isClosed(e):!1,{vertexStart:s,geometrySize:r}=t;i.fill(0,s,s+r),o?(i[s]=Ee,i[s+r-2]=Ee):(i[s]+=Gu,i[s+r-2]+=ju),i[s+r-1]=Ee}_updatePositions(e,t){const{positions:i}=this.attributes;if(!i||!e)return;const{vertexStart:o,geometrySize:s}=t,r=new Array(3);for(let a=o,l=0;l<s;a++,l++)this.getPointOnPath(e,l,r),i[a*3]=r[0],i[a*3+1]=r[1],i[a*3+2]=r[2]}getPathLength(e){return e.length/this.positionSize}getPointOnPath(e,t,i=[]){const{positionSize:o}=this;t*o>=e.length&&(t+=1-e.length/o);const s=t*o;return i[0]=e[s],i[1]=e[s+1],i[2]=o===3&&e[s+2]||0,i}isClosed(e){if(!this.normalize)return!!this.opts.loop;const{positionSize:t}=this,i=e.length-t;return e[0]===e[i]&&e[1]===e[i+1]&&(t===2||e[2]===e[i+2])}}function Pn(n){return Array.isArray(n[0])}const Wu=`struct PathUniforms {
  widthScale: f32,
  widthMinPixels: f32,
  widthMaxPixels: f32,
  jointType: f32,
  capType: f32,
  miterLimit: f32,
  billboard: f32,
  widthUnits: i32,
};

@group(0) @binding(auto)
var<uniform> path: PathUniforms;
`,wn=`layout(std140) uniform pathUniforms {
  float widthScale;
  float widthMinPixels;
  float widthMaxPixels;
  float jointType;
  float capType;
  float miterLimit;
  bool billboard;
  highp int widthUnits;
} path;
`,Hu={name:"path",source:Wu,vs:wn,fs:wn,uniformTypes:{widthScale:"f32",widthMinPixels:"f32",widthMaxPixels:"f32",jointType:"f32",capType:"f32",miterLimit:"f32",billboard:"f32",widthUnits:"i32"}},Yu=`const EPSILON: f32 = 0.001;
const ZERO_OFFSET: vec3<f32> = vec3<f32>(0.0, 0.0, 0.0);

struct JoinResult {
  offset: vec3<f32>,
  cornerOffset: vec2<f32>,
  miterLength: f32,
  pathPosition: vec2<f32>,
  pathLength: f32,
  jointType: f32,
};

struct Attributes {
  @location(0) positions: vec2<f32>,
  @location(1) instanceTypes: f32,
  @location(2) instanceLeftPositions: vec3<f32>,
  @location(3) instanceStartPositions: vec3<f32>,
  @location(4) instanceEndPositions: vec3<f32>,
  @location(5) instanceRightPositions: vec3<f32>,
  @location(6) instanceLeftPositions64Low: vec3<f32>,
  @location(7) instanceStartPositions64Low: vec3<f32>,
  @location(8) instanceEndPositions64Low: vec3<f32>,
  @location(9) instanceRightPositions64Low: vec3<f32>,
  @location(10) instanceStrokeWidths: f32,
  @location(11) instanceColors: vec4<f32>,
  @location(12) rowIndexes: u32,
};

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) vColor: vec4<f32>,
  @location(1) vCornerOffset: vec2<f32>,
  @location(2) vMiterLength: f32,
  @location(3) vPathPosition: vec2<f32>,
  @location(4) vPathLength: f32,
  @location(5) vJointType: f32,
  // Location 6 is reserved for TripsLayer's injected vTime varying.
  @location(7) clipCoordinates: vec2<f32>,
#ifdef DASH_ENABLED
  @location(8) vPathBounds: vec2<f32>,
#endif
};

fn flipIfTrue(flag: bool) -> f32 {
  return select(1.0, -1.0, flag);
}

fn clipLine(position: vec4<f32>, refPosition: vec4<f32>) -> vec4<f32> {
  if (position.w < EPSILON) {
    let r = (EPSILON - refPosition.w) / (position.w - refPosition.w);
    return refPosition + (position - refPosition) * r;
  }
  return position;
}

#ifdef DASH_ENABLED
// Return the visible interval of the original segment before clipLine moves either endpoint.
fn getClippedPathRange(startW: f32, endW: f32) -> vec2<f32> {
  let startClipped = startW < EPSILON;
  let endClipped = endW < EPSILON;
  if (startClipped && endClipped) {
    return vec2<f32>(0.0, 0.0);
  }
  if (startClipped || endClipped) {
    let intersection = clamp((EPSILON - startW) / (endW - startW), 0.0, 1.0);
    if (startClipped) {
      return vec2<f32>(intersection, 1.0);
    }
    return vec2<f32>(0.0, intersection);
  }
  return vec2<f32>(0.0, 1.0);
}
#endif

fn getLineJoinOffset(
  prevPoint: vec3<f32>,
  currPoint: vec3<f32>,
  nextPoint: vec3<f32>,
  width: vec2<f32>,
#ifdef DASH_ENABLED
  sourcePathLength: f32,
  sourcePathRange: vec2<f32>,
#endif
#ifdef ANTIALIASING
  coverageScale: f32,
#endif
  positions: vec2<f32>,
  instanceTypes: f32
) -> JoinResult {
  let isEnd = positions.x > 0.0;
  let sideOfPath = positions.y;
  let isJoint = select(0.0, 1.0, sideOfPath == 0.0);

  var deltaA3 = currPoint - prevPoint;
  var deltaB3 = nextPoint - currPoint;

  let rotationResult = project_needs_rotation(currPoint);
  if (path.billboard == 0.0 && rotationResult.needsRotation) {
    deltaA3 = rotationResult.transform * deltaA3;
    deltaB3 = rotationResult.transform * deltaB3;
  }

  let deltaA = deltaA3.xy / width;
  let deltaB = deltaB3.xy / width;

  let lenA = length(deltaA);
  let lenB = length(deltaB);

  let dirA = select(vec2<f32>(0.0, 0.0), normalize(deltaA), lenA > 0.0);
  let dirB = select(vec2<f32>(0.0, 0.0), normalize(deltaB), lenB > 0.0);

  let perpA = vec2<f32>(-dirA.y, dirA.x);
  let perpB = vec2<f32>(-dirB.y, dirB.x);

  var tangent = dirA + dirB;
  tangent = select(perpA, normalize(tangent), length(tangent) > 0.0);
  let miterVec = vec2<f32>(-tangent.y, tangent.x);
  let dir = select(dirB, dirA, isEnd);
  let perp = select(perpB, perpA, isEnd);
#ifdef DASH_ENABLED
  let segmentLength2D = select(lenB, lenA, isEnd);

  // Extrusion happens in the XY plane, so segmentLength2D is a 2D length and pathPosition.y
  // below measures 2D distance along the segment. For a path that also moves in Z the true
  // arc length is longer by this ratio. Scaling pathLength and pathPosition.y by it makes
  // the coordinate measure real 3D distance while leaving the joint tests unchanged, since
  // they compare the two against each other and both are scaled alike. Billboard mode
  // extrudes in clip space, where the perspective divide has already reduced the segment to
  // its screen projection, so its complete common-space length is supplied by the caller.
  // Mirrors path-layer-vertex.glsl.ts.
  let currDelta3 = select(deltaB3, deltaA3, isEnd);
  let currLength2D = length(currDelta3.xy);
  // Do not clamp a valid denominator to EPSILON: high-zoom Web Mercator deltas are often
  // smaller than that in common space, and changing their scale corrupts even flat paths.
  let safeLength2D = select(1.0, currLength2D, currLength2D > 0.0);
  var arcLengthRatio = 1.0;
  var pathPositionOffset = 0.0;
  var pathLength = segmentLength2D;
  if (path.billboard != 0.0) {
    // clipLine may shorten the visible screen-space segment. Preserve the corresponding interval
    // of the complete common-space arclength instead of compressing the full dash period into the
    // visible span. Keep pathLength complete so justification is stable as the camera clips it.
    let visiblePathLength = sourcePathLength * (sourcePathRange.y - sourcePathRange.x);
    arcLengthRatio = 0.0;
    if (segmentLength2D > 0.0) {
      arcLengthRatio = visiblePathLength / segmentLength2D;
    }
    pathPositionOffset = sourcePathLength * sourcePathRange.x;
    pathLength = sourcePathLength;
  } else if (currLength2D > 0.0) {
    arcLengthRatio = length(currDelta3) / safeLength2D;
    pathLength = segmentLength2D * arcLengthRatio;
  }
#else
  let pathLength = select(lenB, lenA, isEnd);
#endif

  let sinHalfA = abs(dot(miterVec, perp));
  let cosHalfA = abs(dot(dirA, miterVec));
  let turnDirection = flipIfTrue(dirA.x * dirB.y >= dirA.y * dirB.x);
  let cornerPosition = sideOfPath * turnDirection;

  var miterSize = 1.0 / max(sinHalfA, EPSILON);
  miterSize = mix(
    min(miterSize, max(lenA, lenB) / max(cosHalfA, EPSILON)),
    miterSize,
    step(0.0, cornerPosition)
  );

  var offsetVec =
    mix(miterVec * miterSize, perp, step(0.5, cornerPosition)) *
    (sideOfPath + isJoint * turnDirection);

  let isStartCap = lenA == 0.0 || (!isEnd && (instanceTypes == 1.0 || instanceTypes == 3.0));
  let isEndCap = lenB == 0.0 || (isEnd && (instanceTypes == 2.0 || instanceTypes == 3.0));
  let isCap = isStartCap || isEndCap;

  var jointType = path.jointType;
  if (isCap) {
    offsetVec = mix(
      perp * sideOfPath,
      dir * path.capType * 4.0 * flipIfTrue(isStartCap),
      isJoint
    );
    jointType = path.capType;
  }

#ifdef ANTIALIASING
  let coverageOffsetVec = offsetVec * coverageScale;
  var miterLength = dot(coverageOffsetVec, miterVec * turnDirection);
#else
  var miterLength = dot(offsetVec, miterVec * turnDirection);
#endif
  miterLength = select(miterLength, isJoint, isCap);

#ifdef ANTIALIASING
  let offsetFromStartOfPath = coverageOffsetVec + deltaA * select(0.0, 1.0, isEnd);
#else
  let offsetFromStartOfPath = offsetVec + deltaA * select(0.0, 1.0, isEnd);
#endif
  let pathPosition = vec2<f32>(
    dot(offsetFromStartOfPath, perp),
#ifdef DASH_ENABLED
    pathPositionOffset + dot(offsetFromStartOfPath, dir) * arcLengthRatio
#else
    dot(offsetFromStartOfPath, dir)
#endif
  );
  let isValid = step(f32(instanceTypes), 3.5);
#ifdef ANTIALIASING
  var offset = vec3<f32>(coverageOffsetVec * width * isValid, 0.0);
#else
  var offset = vec3<f32>(offsetVec * width * isValid, 0.0);
#endif

  if (path.billboard == 0.0 && rotationResult.needsRotation) {
    offset = rotationResult.transform * offset;
  }

#ifdef ANTIALIASING
  return JoinResult(
    offset, coverageOffsetVec, miterLength, pathPosition, pathLength, jointType
  );
#else
  return JoinResult(offset, offsetVec, miterLength, pathPosition, pathLength, jointType);
#endif
}

@vertex
fn vertexMain(attributes: Attributes) -> Varyings {
  var varyings: Varyings;

  geometry.pickingColor = picking_getPickingColorFromIndex(attributes.rowIndexes);

  let isEnd = attributes.positions.x;

  let prevPosition = mix(attributes.instanceLeftPositions, attributes.instanceStartPositions, isEnd);
  let prevPosition64Low = mix(
    attributes.instanceLeftPositions64Low,
    attributes.instanceStartPositions64Low,
    isEnd
  );
  let currPosition = mix(attributes.instanceStartPositions, attributes.instanceEndPositions, isEnd);
  let currPosition64Low = mix(
    attributes.instanceStartPositions64Low,
    attributes.instanceEndPositions64Low,
    isEnd
  );
  let nextPosition = mix(attributes.instanceEndPositions, attributes.instanceRightPositions, isEnd);
  let nextPosition64Low = mix(
    attributes.instanceEndPositions64Low,
    attributes.instanceRightPositions64Low,
    isEnd
  );

  geometry.worldPosition = currPosition;

  let widthPixels =
    clamp(
      project_unit_size_to_pixel(attributes.instanceStrokeWidths * path.widthScale, path.widthUnits),
      path.widthMinPixels,
      path.widthMaxPixels
    ) / 2.0;

  if (path.billboard != 0.0) {
#ifdef DASH_ENABLED
    let prevProjection = project_position_to_clipspace_and_commonspace(
      prevPosition, prevPosition64Low, ZERO_OFFSET
    );
    let nextProjection = project_position_to_clipspace_and_commonspace(
      nextPosition, nextPosition64Low, ZERO_OFFSET
    );
    let prevPositionCommon = prevProjection.commonPosition.xyz;
    let nextPositionCommon = nextProjection.commonPosition.xyz;
    var prevPositionScreen = prevProjection.clipPosition;
    var nextPositionScreen = nextProjection.clipPosition;
#else
    var prevPositionScreen = project_position_to_clipspace(
      prevPosition, prevPosition64Low, ZERO_OFFSET
    );
    var nextPositionScreen = project_position_to_clipspace(
      nextPosition, nextPosition64Low, ZERO_OFFSET
    );
#endif
    let currProjection = project_position_to_clipspace_and_commonspace(
      currPosition, currPosition64Low, ZERO_OFFSET
    );
    geometry.position = currProjection.commonPosition;
    var currPositionScreen = currProjection.clipPosition;
#ifdef DASH_ENABLED
    let currPositionCommon = currProjection.commonPosition.xyz;
    let sourcePathStartScreen = mix(currPositionScreen, prevPositionScreen, isEnd);
    let sourcePathEndScreen = mix(nextPositionScreen, currPositionScreen, isEnd);
    let billboardPathRange = getClippedPathRange(
      sourcePathStartScreen.w, sourcePathEndScreen.w
    );
#endif

    prevPositionScreen = clipLine(prevPositionScreen, currPositionScreen);
    nextPositionScreen = clipLine(nextPositionScreen, currPositionScreen);
    currPositionScreen = clipLine(currPositionScreen, mix(nextPositionScreen, prevPositionScreen, isEnd));

#ifdef ANTIALIASING
    let coverageScale = select(
      1.0,
      (widthPixels + 0.5 / project.devicePixelRatio) / max(widthPixels, 1e-6),
      widthPixels > 0.0
    );
#endif
#ifdef DASH_ENABLED
    let currentDeltaCommon = select(
      nextPositionCommon - currPositionCommon,
      currPositionCommon - prevPositionCommon,
      isEnd > 0.0
    );
    let billboardPathLength = select(
      0.0,
      length(currentDeltaCommon) * project.scale / (widthPixels * project.focalDistance),
      widthPixels > 0.0
    );
#endif
    let join = getLineJoinOffset(
      prevPositionScreen.xyz / prevPositionScreen.w,
      currPositionScreen.xyz / currPositionScreen.w,
      nextPositionScreen.xyz / nextPositionScreen.w,
      project_pixel_size_to_clipspace(vec2<f32>(widthPixels, widthPixels)),
#ifdef DASH_ENABLED
      billboardPathLength,
      billboardPathRange,
#endif
#ifdef ANTIALIASING
      coverageScale,
#endif
      attributes.positions,
      attributes.instanceTypes
    );
#ifdef DASH_ENABLED
    // Phase and justification use the complete source segment, while cap and joint coverage
    // must still recognize the endpoints moved by clipLine.
    varyings.vPathBounds = billboardPathLength * billboardPathRange;
#endif

    geometry.uv = join.pathPosition;
    varyings.position = vec4<f32>(
      currPositionScreen.xyz + join.offset * currPositionScreen.w,
      currPositionScreen.w
    );
    varyings.vCornerOffset = join.cornerOffset;
    varyings.vMiterLength = join.miterLength;
    varyings.vPathPosition = join.pathPosition;
    varyings.vPathLength = join.pathLength;
    varyings.vJointType = join.jointType;
  } else {
    let prevPositionCommon = project_position_vec3_f64(prevPosition, prevPosition64Low);
    let currPositionCommon = project_position_vec3_f64(currPosition, currPosition64Low);
    let nextPositionCommon = project_position_vec3_f64(nextPosition, nextPosition64Low);

    let width = vec2<f32>(
      project_pixel_size_float(widthPixels),
      project_pixel_size_float(widthPixels)
    );
#ifdef ANTIALIASING
    let coverageScale = select(
      1.0,
      (widthPixels + 0.5 / project.devicePixelRatio) / max(widthPixels, 1e-6),
      widthPixels > 0.0
    );
#endif
    let join = getLineJoinOffset(
      prevPositionCommon,
      currPositionCommon,
      nextPositionCommon,
      width,
#ifdef DASH_ENABLED
      1.0,
      vec2<f32>(0.0, 1.0),
#endif
#ifdef ANTIALIASING
      coverageScale,
#endif
      attributes.positions,
      attributes.instanceTypes
    );
#ifdef DASH_ENABLED
    varyings.vPathBounds = vec2<f32>(0.0, join.pathLength);
#endif

    geometry.position = vec4<f32>(currPositionCommon + join.offset, 1.0);
    geometry.uv = join.pathPosition;
    varyings.position = project_common_position_to_clipspace(geometry.position);
    varyings.vCornerOffset = join.cornerOffset;
    varyings.vMiterLength = join.miterLength;
    varyings.vPathPosition = join.pathPosition;
    varyings.vPathLength = join.pathLength;
    varyings.vJointType = join.jointType;
  }

  varyings.clipCoordinates = geometry.position.xy;
  clip_filterPosition(&varyings.position, geometry.worldPosition.xy);

  varyings.vColor = vec4<f32>(
    attributes.instanceColors.rgb,
    attributes.instanceColors.a * layer.opacity
  );
  return varyings;
}

@fragment
fn fragmentMain(varyings: Varyings) -> @location(0) vec4<f32> {
  geometry.uv = varyings.vPathPosition;

#ifdef ANTIALIASING
  // Coordinates of the outer silhouette, in units of half-width: rounded joints and caps are
  // bounded by the corner offset, everywhere else by the edge of the stroke. Dividing by the
  // screen-space derivative converts the distance to the boundary into device pixels, which stays
  // correct under perspective foreshortening and under extensions that rescale the stroke.
#ifdef DASH_ENABLED
  let isCorner =
    varyings.vPathPosition.y < varyings.vPathBounds.x ||
    varyings.vPathPosition.y > varyings.vPathBounds.y;
#else
  let isCorner = varyings.vPathPosition.y < 0.0 || varyings.vPathPosition.y > varyings.vPathLength;
#endif
  let isRound = varyings.vJointType > 0.5;

  // Distance to the silhouette in device pixels, from the derivative of the coordinate that
  // bounds it. Computed before the discards below: derivatives need uniform control flow and are
  // undefined after a discard in the quad. See dev-docs/RFCs/v9.4/analytic-antialiasing-rfc.md
  let bodyCoord = abs(varyings.vPathPosition.x);
  let cornerCoord = length(varyings.vCornerOffset);
  // Both evaluated so each derivative stays on one field across the corner/body boundary
  let bodyPixels = (1.0 - bodyCoord) / max(fwidth(bodyCoord), 1e-6);
  let cornerPixels = (1.0 - cornerCoord) / max(fwidth(cornerCoord), 1e-6);
#ifdef PATH_STYLE_OFFSET
  // Rounded corners still intersect the stroke-width envelope. Extensions may remap
  // vPathPosition.x independently of vCornerOffset, as PathStyleExtension does for offsets.
  let edgePixels = select(bodyPixels, min(cornerPixels, bodyPixels), isRound && isCorner);
#else
  let edgePixels = select(bodyPixels, cornerPixels, isRound && isCorner);
#endif

  // Fragments outside the coverage ramp must not write depth or picking colors.
  if (edgePixels <= -SMOOTH_EDGE_RADIUS) {
    discard;
  }

  if (isCorner) {
    if (!isRound && varyings.vMiterLength > path.miterLimit + 1.0) {
      discard;
    }
  }

  var color = varyings.vColor;

  // Feather one device pixel across the width only, before premultiplication. edgePixels is a
  // signed device-pixel distance and SMOOTH_EDGE_RADIUS is 0.5, so this ramps across one pixel.
  color.a *= smoothedge(0.0, edgePixels);
#else
#ifdef DASH_ENABLED
  if (
    varyings.vPathPosition.y < varyings.vPathBounds.x ||
    varyings.vPathPosition.y > varyings.vPathBounds.y
  ) {
#else
  if (
    varyings.vPathPosition.y < 0.0 ||
    varyings.vPathPosition.y > varyings.vPathLength
  ) {
#endif
    if (varyings.vJointType > 0.5 && length(varyings.vCornerOffset) > 1.0) {
      discard;
    }
    if (
      varyings.vJointType < 0.5 &&
      varyings.vMiterLength > path.miterLimit + 1.0
    ) {
      discard;
    }
  }
#endif

  // Fragment-layer injections that discard pixels must run after analytic coverage derivatives.
  // See TripsLayer, which rejects fragments outside of the active time window at this anchor.
  // DECKGL_FILTER_COLOR
  clip_filterColor(varyings.clipCoordinates);
#ifdef ANTIALIASING
  return deckgl_premultiplied_alpha(color);
#else
  return deckgl_premultiplied_alpha(varyings.vColor);
#endif
}
`,qu=`#version 300 es
#define SHADER_NAME path-layer-vertex-shader
in vec2 positions;
in float instanceTypes;
in vec3 instanceStartPositions;
in vec3 instanceEndPositions;
in vec3 instanceLeftPositions;
in vec3 instanceRightPositions;
in vec3 instanceLeftPositions64Low;
in vec3 instanceStartPositions64Low;
in vec3 instanceEndPositions64Low;
in vec3 instanceRightPositions64Low;
in float instanceStrokeWidths;
in vec4 instanceColors;
in float rowIndexes;
uniform float opacity;
out vec4 vColor;
out vec2 vCornerOffset;
out float vMiterLength;
out vec2 vPathPosition;
out float vPathLength;
out float vJointType;
#ifdef DASH_ENABLED
out vec2 vPathBounds;
#endif
const float EPSILON = 0.001;
const vec3 ZERO_OFFSET = vec3(0.0);
float flipIfTrue(bool flag) {
return -(float(flag) * 2. - 1.);
}
vec3 getLineJoinOffset(
vec3 prevPoint, vec3 currPoint, vec3 nextPoint,
vec2 width
#ifdef DASH_ENABLED
, float sourcePathLength, vec2 sourcePathRange
#endif
#ifdef ANTIALIASING
, float coverageScale
#endif
) {
bool isEnd = positions.x > 0.0;
float sideOfPath = positions.y;
float isJoint = float(sideOfPath == 0.0);
vec3 deltaA3 = (currPoint - prevPoint);
vec3 deltaB3 = (nextPoint - currPoint);
mat3 rotationMatrix;
bool needsRotation = !path.billboard && project_needs_rotation(currPoint, rotationMatrix);
if (needsRotation) {
deltaA3 = deltaA3 * rotationMatrix;
deltaB3 = deltaB3 * rotationMatrix;
}
vec2 deltaA = deltaA3.xy / width;
vec2 deltaB = deltaB3.xy / width;
float lenA = length(deltaA);
float lenB = length(deltaB);
vec2 dirA = lenA > 0. ? normalize(deltaA) : vec2(0.0, 0.0);
vec2 dirB = lenB > 0. ? normalize(deltaB) : vec2(0.0, 0.0);
vec2 perpA = vec2(-dirA.y, dirA.x);
vec2 perpB = vec2(-dirB.y, dirB.x);
vec2 tangent = dirA + dirB;
tangent = length(tangent) > 0. ? normalize(tangent) : perpA;
vec2 miterVec = vec2(-tangent.y, tangent.x);
vec2 dir = isEnd ? dirA : dirB;
vec2 perp = isEnd ? perpA : perpB;
float L = isEnd ? lenA : lenB;
#ifdef DASH_ENABLED
vec3 currDelta3 = isEnd ? deltaA3 : deltaB3;
float currLength2D = length(currDelta3.xy);
float arcLengthRatio = 1.0;
float pathPositionOffset = 0.0;
float pathLength = L;
if (path.billboard) {
float visiblePathLength = sourcePathLength * (sourcePathRange.y - sourcePathRange.x);
arcLengthRatio = L > 0.0 ? visiblePathLength / L : 0.0;
pathPositionOffset = sourcePathLength * sourcePathRange.x;
pathLength = sourcePathLength;
} else if (currLength2D > 0.0) {
arcLengthRatio = length(currDelta3) / currLength2D;
pathLength = L * arcLengthRatio;
}
#endif
float sinHalfA = abs(dot(miterVec, perp));
float cosHalfA = abs(dot(dirA, miterVec));
float turnDirection = flipIfTrue(dirA.x * dirB.y >= dirA.y * dirB.x);
float cornerPosition = sideOfPath * turnDirection;
float miterSize = 1.0 / max(sinHalfA, EPSILON);
miterSize = mix(
min(miterSize, max(lenA, lenB) / max(cosHalfA, EPSILON)),
miterSize,
step(0.0, cornerPosition)
);
vec2 offsetVec = mix(miterVec * miterSize, perp, step(0.5, cornerPosition))
* (sideOfPath + isJoint * turnDirection);
bool isStartCap = lenA == 0.0 || (!isEnd && (instanceTypes == 1.0 || instanceTypes == 3.0));
bool isEndCap = lenB == 0.0 || (isEnd && (instanceTypes == 2.0 || instanceTypes == 3.0));
bool isCap = isStartCap || isEndCap;
if (isCap) {
offsetVec = mix(perp * sideOfPath, dir * path.capType * 4.0 * flipIfTrue(isStartCap), isJoint);
vJointType = path.capType;
} else {
vJointType = path.jointType;
}
#ifdef ANTIALIASING
vec2 coverageOffsetVec = offsetVec * coverageScale;
#ifdef DASH_ENABLED
vPathLength = pathLength;
#else
vPathLength = L;
#endif
vCornerOffset = coverageOffsetVec;
vMiterLength = dot(vCornerOffset, miterVec * turnDirection);
vMiterLength = isCap ? isJoint : vMiterLength;
vec2 offsetFromStartOfPath = coverageOffsetVec + deltaA * float(isEnd);
vPathPosition = vec2(
dot(offsetFromStartOfPath, perp),
#ifdef DASH_ENABLED
pathPositionOffset + dot(offsetFromStartOfPath, dir) * arcLengthRatio
#else
dot(offsetFromStartOfPath, dir)
#endif
);
geometry.uv = vPathPosition;
float isValid = step(instanceTypes, 3.5);
vec3 offset = vec3(coverageOffsetVec * width * isValid, 0.0);
#else
#ifdef DASH_ENABLED
vPathLength = pathLength;
#else
vPathLength = L;
#endif
vCornerOffset = offsetVec;
vMiterLength = dot(vCornerOffset, miterVec * turnDirection);
vMiterLength = isCap ? isJoint : vMiterLength;
vec2 offsetFromStartOfPath = vCornerOffset + deltaA * float(isEnd);
vPathPosition = vec2(
dot(offsetFromStartOfPath, perp),
#ifdef DASH_ENABLED
pathPositionOffset + dot(offsetFromStartOfPath, dir) * arcLengthRatio
#else
dot(offsetFromStartOfPath, dir)
#endif
);
geometry.uv = vPathPosition;
float isValid = step(instanceTypes, 3.5);
vec3 offset = vec3(offsetVec * width * isValid, 0.0);
#endif
if (needsRotation) {
offset = rotationMatrix * offset;
}
return offset;
}
void clipLine(inout vec4 position, vec4 refPosition) {
if (position.w < EPSILON) {
float r = (EPSILON - refPosition.w) / (position.w - refPosition.w);
position = refPosition + (position - refPosition) * r;
}
}
#ifdef DASH_ENABLED
vec2 getClippedPathRange(float startW, float endW) {
bool startClipped = startW < EPSILON;
bool endClipped = endW < EPSILON;
if (startClipped && endClipped) {
return vec2(0.0);
}
if (startClipped || endClipped) {
float intersection = clamp((EPSILON - startW) / (endW - startW), 0.0, 1.0);
return startClipped ? vec2(intersection, 1.0) : vec2(0.0, intersection);
}
return vec2(0.0, 1.0);
}
#endif
void main() {
geometry.pickingColor = picking_getPickingColorFromIndex(rowIndexes);
vColor = vec4(instanceColors.rgb, instanceColors.a * layer.opacity);
float isEnd = positions.x;
vec3 prevPosition = mix(instanceLeftPositions, instanceStartPositions, isEnd);
vec3 prevPosition64Low = mix(instanceLeftPositions64Low, instanceStartPositions64Low, isEnd);
vec3 currPosition = mix(instanceStartPositions, instanceEndPositions, isEnd);
vec3 currPosition64Low = mix(instanceStartPositions64Low, instanceEndPositions64Low, isEnd);
vec3 nextPosition = mix(instanceEndPositions, instanceRightPositions, isEnd);
vec3 nextPosition64Low = mix(instanceEndPositions64Low, instanceRightPositions64Low, isEnd);
geometry.worldPosition = currPosition;
vec2 widthPixels = vec2(clamp(
project_size_to_pixel(instanceStrokeWidths * path.widthScale, path.widthUnits),
path.widthMinPixels, path.widthMaxPixels) / 2.0);
vec3 width;
if (path.billboard) {
#ifdef DASH_ENABLED
vec4 prevPositionCommon;
vec4 nextPositionCommon;
vec4 prevPositionScreen = project_position_to_clipspace(
prevPosition, prevPosition64Low, ZERO_OFFSET, prevPositionCommon
);
#else
vec4 prevPositionScreen = project_position_to_clipspace(
prevPosition, prevPosition64Low, ZERO_OFFSET
);
#endif
vec4 currPositionScreen = project_position_to_clipspace(currPosition, currPosition64Low, ZERO_OFFSET, geometry.position);
#ifdef DASH_ENABLED
vec4 nextPositionScreen = project_position_to_clipspace(
nextPosition, nextPosition64Low, ZERO_OFFSET, nextPositionCommon
);
#else
vec4 nextPositionScreen = project_position_to_clipspace(
nextPosition, nextPosition64Low, ZERO_OFFSET
);
#endif
#ifdef DASH_ENABLED
vec4 sourcePathStartScreen = mix(currPositionScreen, prevPositionScreen, isEnd);
vec4 sourcePathEndScreen = mix(nextPositionScreen, currPositionScreen, isEnd);
vec2 billboardPathRange = getClippedPathRange(
sourcePathStartScreen.w, sourcePathEndScreen.w
);
#endif
clipLine(prevPositionScreen, currPositionScreen);
clipLine(nextPositionScreen, currPositionScreen);
clipLine(currPositionScreen, mix(nextPositionScreen, prevPositionScreen, isEnd));
width = vec3(widthPixels, 0.0);
DECKGL_FILTER_SIZE(width, geometry);
#ifdef ANTIALIASING
vec2 coveragePadding = vec2(0.5 / project.devicePixelRatio);
float coverageScale = length(width.xy) > 0.0
? length(width.xy + coveragePadding) / length(width.xy)
: 1.0;
#endif
#ifdef DASH_ENABLED
vec3 currentDeltaCommon = isEnd > 0.0
? geometry.position.xyz - prevPositionCommon.xyz
: nextPositionCommon.xyz - geometry.position.xyz;
float billboardPathLength = width.x > 0.0
? length(currentDeltaCommon) * project.scale / (width.x * project.focalDistance)
: 0.0;
#endif
vec3 offset = getLineJoinOffset(
prevPositionScreen.xyz / prevPositionScreen.w,
currPositionScreen.xyz / currPositionScreen.w,
nextPositionScreen.xyz / nextPositionScreen.w,
project_pixel_size_to_clipspace(width.xy)
#ifdef DASH_ENABLED
,
billboardPathLength, billboardPathRange
#endif
#ifdef ANTIALIASING
,
coverageScale
#endif
);
#ifdef DASH_ENABLED
vPathBounds = billboardPathLength * billboardPathRange;
#endif
DECKGL_FILTER_GL_POSITION(currPositionScreen, geometry);
gl_Position = vec4(currPositionScreen.xyz + offset * currPositionScreen.w, currPositionScreen.w);
} else {
prevPosition = project_position(prevPosition, prevPosition64Low);
currPosition = project_position(currPosition, currPosition64Low);
nextPosition = project_position(nextPosition, nextPosition64Low);
width = vec3(project_pixel_size(widthPixels), 0.0);
DECKGL_FILTER_SIZE(width, geometry);
#ifdef ANTIALIASING
vec2 coveragePadding = project_pixel_size(vec2(0.5 / project.devicePixelRatio));
float coverageScale = length(width.xy) > 0.0
? length(width.xy + coveragePadding) / length(width.xy)
: 1.0;
#endif
vec3 offset = getLineJoinOffset(
prevPosition, currPosition, nextPosition, width.xy
#ifdef DASH_ENABLED
, 1.0, vec2(0.0, 1.0)
#endif
#ifdef ANTIALIASING
, coverageScale
#endif
);
#ifdef DASH_ENABLED
vPathBounds = vec2(0.0, vPathLength);
#endif
geometry.position = vec4(currPosition + offset, 1.0);
gl_Position = project_common_position_to_clipspace(geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
}
DECKGL_FILTER_COLOR(vColor, geometry);
}
`,Zu=`#version 300 es
#define SHADER_NAME path-layer-fragment-shader
precision highp float;
in vec4 vColor;
in vec2 vCornerOffset;
in float vMiterLength;
in vec2 vPathPosition;
in float vPathLength;
in float vJointType;
#ifdef DASH_ENABLED
in vec2 vPathBounds;
#endif
out vec4 fragColor;
void main(void) {
geometry.uv = vPathPosition;
#ifdef ANTIALIASING
#ifdef DASH_ENABLED
bool isCorner = vPathPosition.y < vPathBounds.x || vPathPosition.y > vPathBounds.y;
#else
bool isCorner = vPathPosition.y < 0.0 || vPathPosition.y > vPathLength;
#endif
bool isRound = vJointType > 0.5;
float bodyCoord = abs(vPathPosition.x);
float cornerCoord = length(vCornerOffset);
float bodyPixels = (1.0 - bodyCoord) / max(fwidth(bodyCoord), 1e-6);
float cornerPixels = (1.0 - cornerCoord) / max(fwidth(cornerCoord), 1e-6);
#ifdef PATH_STYLE_OFFSET
float edgePixels = isRound && isCorner ? min(cornerPixels, bodyPixels) : bodyPixels;
#else
float edgePixels = isRound && isCorner ? cornerPixels : bodyPixels;
#endif
if (edgePixels <= -SMOOTH_EDGE_RADIUS) {
discard;
}
if (isCorner) {
if (!isRound && vMiterLength > path.miterLimit + 1.0) {
discard;
}
}
fragColor = vColor;
fragColor.a *= smoothedge(0.0, edgePixels);
#else
#ifdef DASH_ENABLED
if (vPathPosition.y < vPathBounds.x || vPathPosition.y > vPathBounds.y) {
#else
if (vPathPosition.y < 0.0 || vPathPosition.y > vPathLength) {
#endif
if (vJointType > 0.5 && length(vCornerOffset) > 1.0) {
discard;
}
if (vJointType < 0.5 && vMiterLength > path.miterLimit + 1.0) {
discard;
}
}
fragColor = vColor;
#endif
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`,zo=[0,0,0,255],Ku={widthUnits:"meters",widthScale:{type:"number",min:0,value:1},widthMinPixels:{type:"number",min:0,value:0},widthMaxPixels:{type:"number",min:0,value:Number.MAX_SAFE_INTEGER},jointRounded:!1,capRounded:!1,miterLimit:{type:"number",min:0,value:4},antialiasing:!1,billboard:!1,_pathType:null,getPath:{type:"accessor",value:n=>n.path},getColor:{type:"accessor",value:zo},getWidth:{type:"accessor",value:1},rounded:{deprecatedFor:["jointRounded","capRounded"]}},Wt={enter:(n,e)=>e.length?e.subarray(e.length-n.length):n};function Xu(n){if(n.isGeospatial)return null;const{unitsPerMeter:e}=n.distanceScales;return[e[0],e[1],e[2]]}function Ln(n,e){return n===e||!!(n&&e&&n.length===e.length&&n.every((t,i)=>t===e[i]))}class Ii extends ue{getShaders(){const{antialiasing:e}=this.props;return super.getShaders({vs:qu,fs:Zu,source:Yu,defines:e?{ANTIALIASING:1}:{},modules:[_e,Ue,Fe,Hu,...this.context.device.type==="webgpu"?[Li]:[]]})}get wrapLongitude(){return!1}getBounds(){return this.context.device.type==="webgpu"?null:this.getAttributeManager()?.getBounds(["vertexPositions"])}getPathProjectionScale(e){const t=this.props.coordinateSystem;if(!!!this.getAttributeManager()?.getAttributes().instanceDashOffsets)return null;if(e instanceof Gn&&e.zoom>=12&&(t==="default"||t==="lnglat"||t==="cartesian")){const r=Vn.getUniforms({viewport:e,coordinateSystem:t,coordinateOrigin:this.props.coordinateOrigin,autoWrapLongitude:this.wrapLongitude});return[e.projectionMode,r.coordinateOrigin[1],r.commonOrigin[1],...r.commonUnitsPerWorldUnit,...r.commonUnitsPerWorldUnit2,r.commonUnitsPerMeter[2]]}const s=Xu(e);return s?[e.projectionMode,...s]:[e.projectionMode]}shouldUpdateState(e){const{viewport:t}=this.context;return super.shouldUpdateState(e)||this.state?.tessellationResolution!==t.resolution||!Ln(this.state?.pathProjectionScale,this.getPathProjectionScale(t))}initializeState(){const t=this.context.device.type==="webgpu";this.getAttributeManager().addInstanced({...t?{pathPositions:{size:24,type:"float32",transition:!1,accessor:"getPath",update:this.calculateWebGPUPositions,shaderAttributes:{instanceLeftPositions:{size:3,elementOffset:0},instanceStartPositions:{size:3,elementOffset:3},instanceEndPositions:{size:3,elementOffset:6},instanceRightPositions:{size:3,elementOffset:9},instanceLeftPositions64Low:{size:3,elementOffset:12},instanceStartPositions64Low:{size:3,elementOffset:15},instanceEndPositions64Low:{size:3,elementOffset:18},instanceRightPositions64Low:{size:3,elementOffset:21}},noAlloc:!0}}:{vertexPositions:{size:3,vertexOffset:1,type:"float64",fp64:this.use64bitPositions(),transition:Wt,accessor:"getPath",update:this.calculatePositions,noAlloc:!0,shaderAttributes:{instanceLeftPositions:{vertexOffset:0},instanceStartPositions:{vertexOffset:1},instanceEndPositions:{vertexOffset:2},instanceRightPositions:{vertexOffset:3}}}},instanceTypes:{size:1,type:t?"float32":"uint8",update:this.calculateSegmentTypes,noAlloc:!0},instanceStrokeWidths:{size:1,accessor:"getWidth",transition:t?!1:Wt,defaultValue:1,bufferGroup:"path-instance-data"},instanceColors:{size:this.props.colorFormat.length,type:"unorm8",accessor:"getColor",transition:t?!1:Wt,defaultValue:zo,bufferGroup:"path-instance-data"},rowIndexes:{size:1,type:"uint32",accessor:(o,{index:s})=>o&&o.__source?o.__source.index:s,bufferGroup:"path-instance-data"}}),this.setState({pathTesselator:new $u({fp64:this.use64bitPositions(),isWebGPU:t}),tessellationResolution:this.context.viewport.resolution,pathProjectionScale:this.getPathProjectionScale(this.context.viewport)})}updateState(e){super.updateState(e);const{props:t,oldProps:i,changeFlags:o}=e,s=this.getAttributeManager(),{viewport:r}=this.context,a=this.state.tessellationResolution!==r.resolution,l=this.getPathProjectionScale(r),c=!Ln(this.state.pathProjectionScale,l),f=o.updateTriggersChanged&&(o.updateTriggersChanged.all||o.updateTriggersChanged.getPath)||t._pathType!==i._pathType||t.positionFormat!==i.positionFormat||t.wrapLongitude!==i.wrapLongitude||a;if(o.dataChanged||f){const{pathTesselator:g}=this.state,y=t.data.attributes||{};g.updateGeometry({data:t.data,geometryBuffer:y.getPath,buffers:y,normalize:!t._pathType,loop:t._pathType==="loop",getGeometry:t.getPath,positionFormat:t.positionFormat,wrapLongitude:t.wrapLongitude,resolution:r.resolution,dataChanged:f?void 0:o.dataChanged}),this.setState({numInstances:g.instanceCount,startIndices:g.vertexStarts,tessellationResolution:r.resolution,pathProjectionScale:l}),!o.dataChanged||f?s.invalidateAll():c&&s.invalidate("instanceDashOffsets")}else c&&(this.setState({pathProjectionScale:l}),s.invalidate("instanceDashOffsets"));(o.extensionsChanged||t.antialiasing!==i.antialiasing)&&(this.state.model?.destroy(),this.state.model=this._getModel(),s.invalidateAll())}getPickingInfo(e){const t=super.getPickingInfo(e),{index:i}=t,o=this.props.data;return o[0]&&o[0].__source&&(t.object=o.find(s=>s.__source.index===i)),t}disablePickingIndex(e){const t=this.props.data;if(t[0]&&t[0].__source)for(let i=0;i<t.length;i++)t[i].__source.index===e&&this._disablePickingIndex(i);else super.disablePickingIndex(e)}draw({uniforms:e}){const{jointRounded:t,capRounded:i,billboard:o,miterLimit:s,widthUnits:r,widthScale:a,widthMinPixels:l,widthMaxPixels:c}=this.props,u=this.state.model,f={jointType:Number(t),capType:Number(i),billboard:o,widthUnits:ve[r],widthScale:a,miterLimit:s,widthMinPixels:l,widthMaxPixels:c};u.shaderInputs.setProps({path:f}),u.draw(this.context.renderPass)}_getModel(){const e=[0,1,2,1,4,2,1,3,4,3,5,4],t=[0,0,0,-1,0,1,1,-1,1,1,1,0];return new j(this.context.device,{...this.getShaders(),id:this.props.id,bufferLayout:this.getAttributeManager().getBufferLayouts(),geometry:new le({topology:"triangle-list",attributes:{indices:new Uint16Array(e),positions:{value:new Float32Array(t),size:2}}}),isInstanced:!0})}calculatePositions(e){const{pathTesselator:t}=this.state;e.startIndices=t.vertexStarts,e.value=t.get("positions")}calculateSegmentTypes(e){const{pathTesselator:t}=this.state;e.startIndices=t.vertexStarts,e.value=t.get("segmentTypes")}calculateWebGPUPositions(e){const{pathTesselator:t}=this.state,i=t.get("positions");if(!i){e.value=null;return}const o=t.instanceCount,s=new Float32Array(o*24),r=[-1,0,1,2];for(let a=0;a<o;a++){const l=a*24;for(let c=0;c<4;c++){const u=a+r[c],f=l+c*3;for(let h=0;h<3;h++){const g=u>=0&&u<o?i[u*3+h]:0,y=Math.fround(g);s[f+h]=y,s[f+h+12]=g-y}}}e.startIndices=t.vertexStarts,e.value=s}}Ii.defaultProps=Ku;Ii.layerName="PathLayer";var Ye={exports:{}},Sn;function Ju(){if(Sn)return Ye.exports;Sn=1,Ye.exports=n,Ye.exports.default=n;function n(d,m,p){p=p||2;var v=m&&m.length,_=v?m[0]*p:d.length,x=e(d,0,_,p,!0),P=[];if(!x||x.next===x.prev)return P;var C,T,I,z,N,O,G;if(v&&(x=l(d,m,x,p)),d.length>80*p){C=I=d[0],T=z=d[1];for(var U=p;U<_;U+=p)N=d[U],O=d[U+1],N<C&&(C=N),O<T&&(T=O),N>I&&(I=N),O>z&&(z=O);G=Math.max(I-C,z-T),G=G!==0?32767/G:0}return i(x,P,p,C,T,G,0),P}function e(d,m,p,v,_){var x,P;if(_===Pe(d,m,p,v)>0)for(x=m;x<p;x+=v)P=pe(x,d[x],d[x+1],P);else for(x=p-v;x>=m;x-=v)P=pe(x,d[x],d[x+1],P);return P&&B(P,P.next)&&(ne(P),P=P.next),P}function t(d,m){if(!d)return d;m||(m=d);var p=d,v;do if(v=!1,!p.steiner&&(B(p,p.next)||L(p.prev,p,p.next)===0)){if(ne(p),p=m=p.prev,p===p.next)break;v=!0}else p=p.next;while(v||p!==m);return m}function i(d,m,p,v,_,x,P){if(d){!P&&x&&g(d,v,_,x);for(var C=d,T,I;d.prev!==d.next;){if(T=d.prev,I=d.next,x?s(d,v,_,x):o(d)){m.push(T.i/p|0),m.push(d.i/p|0),m.push(I.i/p|0),ne(d),d=I.next,C=I.next;continue}if(d=I,d===C){P?P===1?(d=r(t(d),m,p),i(d,m,p,v,_,x,2)):P===2&&a(d,m,p,v,_,x):i(t(d),m,p,v,_,x,1);break}}}}function o(d){var m=d.prev,p=d,v=d.next;if(L(m,p,v)>=0)return!1;for(var _=m.x,x=p.x,P=v.x,C=m.y,T=p.y,I=v.y,z=_<x?_<P?_:P:x<P?x:P,N=C<T?C<I?C:I:T<I?T:I,O=_>x?_>P?_:P:x>P?x:P,G=C>T?C>I?C:I:T>I?T:I,U=v.next;U!==m;){if(U.x>=z&&U.x<=O&&U.y>=N&&U.y<=G&&S(_,C,x,T,P,I,U.x,U.y)&&L(U.prev,U,U.next)>=0)return!1;U=U.next}return!0}function s(d,m,p,v){var _=d.prev,x=d,P=d.next;if(L(_,x,P)>=0)return!1;for(var C=_.x,T=x.x,I=P.x,z=_.y,N=x.y,O=P.y,G=C<T?C<I?C:I:T<I?T:I,U=z<N?z<O?z:O:N<O?N:O,we=C>T?C>I?C:I:T>I?T:I,Le=z>N?z>O?z:O:N>O?N:O,Ri=b(G,U,m,p,v),Mi=b(we,Le,m,p,v),R=d.prevZ,M=d.nextZ;R&&R.z>=Ri&&M&&M.z<=Mi;){if(R.x>=G&&R.x<=we&&R.y>=U&&R.y<=Le&&R!==_&&R!==P&&S(C,z,T,N,I,O,R.x,R.y)&&L(R.prev,R,R.next)>=0||(R=R.prevZ,M.x>=G&&M.x<=we&&M.y>=U&&M.y<=Le&&M!==_&&M!==P&&S(C,z,T,N,I,O,M.x,M.y)&&L(M.prev,M,M.next)>=0))return!1;M=M.nextZ}for(;R&&R.z>=Ri;){if(R.x>=G&&R.x<=we&&R.y>=U&&R.y<=Le&&R!==_&&R!==P&&S(C,z,T,N,I,O,R.x,R.y)&&L(R.prev,R,R.next)>=0)return!1;R=R.prevZ}for(;M&&M.z<=Mi;){if(M.x>=G&&M.x<=we&&M.y>=U&&M.y<=Le&&M!==_&&M!==P&&S(C,z,T,N,I,O,M.x,M.y)&&L(M.prev,M,M.next)>=0)return!1;M=M.nextZ}return!0}function r(d,m,p){var v=d;do{var _=v.prev,x=v.next.next;!B(_,x)&&k(_,v,v.next,x)&&Z(_,x)&&Z(x,_)&&(m.push(_.i/p|0),m.push(v.i/p|0),m.push(x.i/p|0),ne(v),ne(v.next),v=d=x),v=v.next}while(v!==d);return t(v)}function a(d,m,p,v,_,x){var P=d;do{for(var C=P.next.next;C!==P.prev;){if(P.i!==C.i&&A(P,C)){var T=Ve(P,C);P=t(P,P.next),T=t(T,T.next),i(P,m,p,v,_,x,0),i(T,m,p,v,_,x,0);return}C=C.next}P=P.next}while(P!==d)}function l(d,m,p,v){var _=[],x,P,C,T,I;for(x=0,P=m.length;x<P;x++)C=m[x]*v,T=x<P-1?m[x+1]*v:d.length,I=e(d,C,T,v,!1),I===I.next&&(I.steiner=!0),_.push(w(I));for(_.sort(c),x=0;x<_.length;x++)p=u(_[x],p);return p}function c(d,m){return d.x-m.x}function u(d,m){var p=f(d,m);if(!p)return m;var v=Ve(p,d);return t(v,v.next),t(p,p.next)}function f(d,m){var p=m,v=d.x,_=d.y,x=-1/0,P;do{if(_<=p.y&&_>=p.next.y&&p.next.y!==p.y){var C=p.x+(_-p.y)*(p.next.x-p.x)/(p.next.y-p.y);if(C<=v&&C>x&&(x=C,P=p.x<p.next.x?p:p.next,C===v))return P}p=p.next}while(p!==m);if(!P)return null;var T=P,I=P.x,z=P.y,N=1/0,O;p=P;do v>=p.x&&p.x>=I&&v!==p.x&&S(_<z?v:x,_,I,z,_<z?x:v,_,p.x,p.y)&&(O=Math.abs(_-p.y)/(v-p.x),Z(p,d)&&(O<N||O===N&&(p.x>P.x||p.x===P.x&&h(P,p)))&&(P=p,N=O)),p=p.next;while(p!==T);return P}function h(d,m){return L(d.prev,d,m.prev)<0&&L(m.next,d,d.next)<0}function g(d,m,p,v){var _=d;do _.z===0&&(_.z=b(_.x,_.y,m,p,v)),_.prevZ=_.prev,_.nextZ=_.next,_=_.next;while(_!==d);_.prevZ.nextZ=null,_.prevZ=null,y(_)}function y(d){var m,p,v,_,x,P,C,T,I=1;do{for(p=d,d=null,x=null,P=0;p;){for(P++,v=p,C=0,m=0;m<I&&(C++,v=v.nextZ,!!v);m++);for(T=I;C>0||T>0&&v;)C!==0&&(T===0||!v||p.z<=v.z)?(_=p,p=p.nextZ,C--):(_=v,v=v.nextZ,T--),x?x.nextZ=_:d=_,_.prevZ=x,x=_;p=v}x.nextZ=null,I*=2}while(P>1);return d}function b(d,m,p,v,_){return d=(d-p)*_|0,m=(m-v)*_|0,d=(d|d<<8)&16711935,d=(d|d<<4)&252645135,d=(d|d<<2)&858993459,d=(d|d<<1)&1431655765,m=(m|m<<8)&16711935,m=(m|m<<4)&252645135,m=(m|m<<2)&858993459,m=(m|m<<1)&1431655765,d|m<<1}function w(d){var m=d,p=d;do(m.x<p.x||m.x===p.x&&m.y<p.y)&&(p=m),m=m.next;while(m!==d);return p}function S(d,m,p,v,_,x,P,C){return(_-P)*(m-C)>=(d-P)*(x-C)&&(d-P)*(v-C)>=(p-P)*(m-C)&&(p-P)*(x-C)>=(_-P)*(v-C)}function A(d,m){return d.next.i!==m.i&&d.prev.i!==m.i&&!X(d,m)&&(Z(d,m)&&Z(m,d)&&$(d,m)&&(L(d.prev,d,m.prev)||L(d,m.prev,m))||B(d,m)&&L(d.prev,d,d.next)>0&&L(m.prev,m,m.next)>0)}function L(d,m,p){return(m.y-d.y)*(p.x-m.x)-(m.x-d.x)*(p.y-m.y)}function B(d,m){return d.x===m.x&&d.y===m.y}function k(d,m,p,v){var _=Y(L(d,m,p)),x=Y(L(d,m,v)),P=Y(L(p,v,d)),C=Y(L(p,v,m));return!!(_!==x&&P!==C||_===0&&V(d,p,m)||x===0&&V(d,v,m)||P===0&&V(p,d,v)||C===0&&V(p,m,v))}function V(d,m,p){return m.x<=Math.max(d.x,p.x)&&m.x>=Math.min(d.x,p.x)&&m.y<=Math.max(d.y,p.y)&&m.y>=Math.min(d.y,p.y)}function Y(d){return d>0?1:d<0?-1:0}function X(d,m){var p=d;do{if(p.i!==d.i&&p.next.i!==d.i&&p.i!==m.i&&p.next.i!==m.i&&k(p,p.next,d,m))return!0;p=p.next}while(p!==d);return!1}function Z(d,m){return L(d.prev,d,d.next)<0?L(d,m,d.next)>=0&&L(d,d.prev,m)>=0:L(d,m,d.prev)<0||L(d,d.next,m)<0}function $(d,m){var p=d,v=!1,_=(d.x+m.x)/2,x=(d.y+m.y)/2;do p.y>x!=p.next.y>x&&p.next.y!==p.y&&_<(p.next.x-p.x)*(x-p.y)/(p.next.y-p.y)+p.x&&(v=!v),p=p.next;while(p!==d);return v}function Ve(d,m){var p=new xe(d.i,d.x,d.y),v=new xe(m.i,m.x,m.y),_=d.next,x=m.prev;return d.next=m,m.prev=d,p.next=_,_.prev=p,v.next=p,p.prev=v,x.next=v,v.prev=x,v}function pe(d,m,p,v){var _=new xe(d,m,p);return v?(_.next=v.next,_.prev=v,v.next.prev=_,v.next=_):(_.prev=_,_.next=_),_}function ne(d){d.next.prev=d.prev,d.prev.next=d.next,d.prevZ&&(d.prevZ.nextZ=d.nextZ),d.nextZ&&(d.nextZ.prevZ=d.prevZ)}function xe(d,m,p){this.i=d,this.x=m,this.y=p,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}n.deviation=function(d,m,p,v){var _=m&&m.length,x=_?m[0]*p:d.length,P=Math.abs(Pe(d,0,x,p));if(_)for(var C=0,T=m.length;C<T;C++){var I=m[C]*p,z=C<T-1?m[C+1]*p:d.length;P-=Math.abs(Pe(d,I,z,p))}var N=0;for(C=0;C<v.length;C+=3){var O=v[C]*p,G=v[C+1]*p,U=v[C+2]*p;N+=Math.abs((d[O]-d[U])*(d[G+1]-d[O+1])-(d[O]-d[G])*(d[U+1]-d[O+1]))}return P===0&&N===0?0:Math.abs((N-P)/P)};function Pe(d,m,p,v){for(var _=0,x=m,P=p-v;x<p;x+=v)_+=(d[P]-d[x])*(d[x+1]+d[P+1]),P=x;return _}return n.flatten=function(d){for(var m=d[0][0].length,p={vertices:[],holes:[],dimensions:m},v=0,_=0;_<d.length;_++){for(var x=0;x<d[_].length;x++)for(var P=0;P<m;P++)p.vertices.push(d[_][x][P]);_>0&&(v+=d[_-1].length,p.holes.push(v))}return p},Ye.exports}var Qu=Ju();const ef=Qo(Qu),qe=Ci.CLOCKWISE,Cn=Ci.COUNTER_CLOCKWISE,re={};function tf(n){if(n=n&&n.positions||n,!Array.isArray(n)&&!ArrayBuffer.isView(n))throw new Error("invalid polygon")}function Te(n){return"positions"in n?n.positions:n}function st(n){return"holeIndices"in n?n.holeIndices:null}function nf(n){return Array.isArray(n[0])}function of(n){return n.length>=1&&n[0].length>=2&&Number.isFinite(n[0][0])}function sf(n){const e=n[0],t=n[n.length-1];return e[0]===t[0]&&e[1]===t[1]&&e[2]===t[2]}function rf(n,e,t,i){for(let o=0;o<e;o++)if(n[t+o]!==n[i-e+o])return!1;return!0}function An(n,e,t,i,o){let s=e;const r=t.length;for(let a=0;a<r;a++)for(let l=0;l<i;l++)n[s++]=t[a][l]||0;if(!sf(t))for(let a=0;a<i;a++)n[s++]=t[0][a]||0;return re.start=e,re.end=s,re.size=i,Ai(n,o,re),s}function En(n,e,t,i,o=0,s,r){s=s||t.length;const a=s-o;if(a<=0)return e;let l=e;for(let c=0;c<a;c++)n[l++]=t[o+c];if(!rf(t,i,o,s))for(let c=0;c<i;c++)n[l++]=t[o+c];return re.start=e,re.end=l,re.size=i,Ai(n,r,re),l}function Vo(n,e){tf(n);const t=[],i=[];if("positions"in n){const{positions:o,holeIndices:s}=n;if(s){let r=0;for(let a=0;a<=s.length;a++)r=En(t,r,o,e,s[a-1],s[a],a===0?qe:Cn),i.push(r);return i.pop(),{positions:t,holeIndices:i}}n=o}if(!nf(n))return En(t,0,n,e,0,t.length,qe),t;if(!of(n)){let o=0;for(const[s,r]of n.entries())o=An(t,o,r,e,s===0?qe:Cn),i.push(o);return i.pop(),{positions:t,holeIndices:i}}return An(t,0,n,e,qe),t}function Ht(n,e,t){const i=n.length/3;let o=0;for(let s=0;s<i;s++){const r=(s+1)%i;o+=n[s*3+e]*n[r*3+t],o-=n[r*3+e]*n[s*3+t]}return Math.abs(o/2)}function In(n,e,t,i){const o=n.length/3;for(let s=0;s<o;s++){const r=s*3,a=n[r+0],l=n[r+1],c=n[r+2];n[r+e]=a,n[r+t]=l,n[r+i]=c}}function af(n,e,t,i){let o=st(n);o&&(o=o.map(a=>a/e));let s=Te(n);const r=i&&e===3;if(t){const a=s.length;s=s.slice();const l=[];for(let c=0;c<a;c+=e){l[0]=s[c],l[1]=s[c+1],r&&(l[2]=s[c+2]);const u=t(l);s[c]=u[0],s[c+1]=u[1],r&&(s[c+2]=u[2])}}if(r){const a=Ht(s,0,1),l=Ht(s,0,2),c=Ht(s,1,2);if(!a&&!l&&!c)return[];a>l&&a>c||(l>c?(t||(s=s.slice()),In(s,0,2,1)):(t||(s=s.slice()),In(s,2,0,1)))}return ef(s,o,e)}class lf extends Oo{constructor(e){const{fp64:t,IndexType:i=Uint32Array}=e;super({...e,attributes:{positions:{size:3,type:t?Float64Array:Float32Array},vertexValid:{type:Uint16Array,size:1},indices:{type:i,size:1}}})}get(e){const{attributes:t}=this;return e==="indices"?t.indices&&t.indices.subarray(0,this.vertexCount):t[e]}updateGeometry(e){super.updateGeometry(e);const t=this.buffers.indices;if(t)this.vertexCount=(t.value||t).length;else if(this.data&&!this.getGeometry)throw new Error("missing indices buffer")}normalizeGeometry(e){if(this.normalize){const t=Vo(e,this.positionSize);return this.opts.resolution?Do(Te(t),st(t),{size:this.positionSize,gridResolution:this.opts.resolution,edgeTypes:!0}):this.opts.wrapLongitude?Au(Te(t),st(t),{size:this.positionSize,maxLatitude:86,edgeTypes:!0}):t}return e}getGeometrySize(e){if(Tn(e)){let t=0;for(const i of e)t+=this.getGeometrySize(i);return t}return Te(e).length/this.positionSize}getGeometryFromBuffer(e){return this.normalize||!this.buffers.indices?super.getGeometryFromBuffer(e):null}updateGeometryAttributes(e,t){if(e&&Tn(e))for(const i of e){const o=this.getGeometrySize(i);t.geometrySize=o,this.updateGeometryAttributes(i,t),t.vertexStart+=o,t.indexStart=this.indexStarts[t.geometryIndex+1]}else{const i=e;this._updateIndices(i,t),this._updatePositions(i,t),this._updateVertexValid(i,t)}}_updateIndices(e,{geometryIndex:t,vertexStart:i,indexStart:o}){const{attributes:s,indexStarts:r,typedArrayManager:a}=this;let l=s.indices;if(!l||!e)return;let c=o;const u=af(e,this.positionSize,this.opts.preproject,this.opts.full3d);l=a.allocate(l,o+u.length,{copy:!0});for(let f=0;f<u.length;f++)l[c++]=u[f]+i;r[t+1]=o+u.length,s.indices=l}_updatePositions(e,{vertexStart:t,geometrySize:i}){const{attributes:{positions:o},positionSize:s}=this;if(!o||!e)return;const r=Te(e);for(let a=t,l=0;l<i;a++,l++){const c=r[l*s],u=r[l*s+1],f=s>2?r[l*s+2]:0;o[a*3]=c,o[a*3+1]=u,o[a*3+2]=f}}_updateVertexValid(e,{vertexStart:t,geometrySize:i}){const{positionSize:o}=this,s=this.attributes.vertexValid,r=e&&st(e);if(e&&e.edgeTypes?s.set(e.edgeTypes,t):s.fill(1,t,t+i),r)for(let a=0;a<r.length;a++)s[t+r[a]/o-1]=0;s[t+i-1]=0}}function Tn(n){return Array.isArray(n)&&n.length>0&&!Number.isFinite(n[0])}const cf=`struct SolidPolygonUniforms {
  extruded: f32,
  isWireframe: f32,
  elevationScale: f32,
};

@group(0) @binding(auto) var<uniform> solidPolygon: SolidPolygonUniforms;
`,Bn=`layout(std140) uniform solidPolygonUniforms {
  bool extruded;
  bool isWireframe;
  float elevationScale;
} solidPolygon;
`,uf={name:"solidPolygon",source:cf,vs:Bn,fs:Bn,uniformTypes:{extruded:"f32",isWireframe:"f32",elevationScale:"f32"}},Go=`in vec4 fillColors;
in vec4 lineColors;
in float rowIndexes;
out vec4 vColor;
struct PolygonProps {
vec3 positions;
vec3 positions64Low;
vec3 normal;
float elevations;
};
vec3 project_offset_normal(vec3 vector) {
if (project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT ||
project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT_OFFSETS) {
return normalize(vector * project.commonUnitsPerWorldUnit);
}
return project_normal(vector);
}
void calculatePosition(PolygonProps props) {
vec3 pos = props.positions;
vec3 pos64Low = props.positions64Low;
vec3 normal = props.normal;
vec4 colors = solidPolygon.isWireframe ? lineColors : fillColors;
geometry.worldPosition = props.positions;
geometry.pickingColor = picking_getPickingColorFromIndex(rowIndexes);
if (solidPolygon.extruded) {
pos.z += props.elevations * solidPolygon.elevationScale;
}
gl_Position = project_position_to_clipspace(pos, pos64Low, vec3(0.), geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
if (solidPolygon.extruded) {
#ifdef IS_SIDE_VERTEX
normal = project_offset_normal(normal);
#else
normal = project_normal(normal);
#endif
geometry.normal = normal;
vec3 lightColor = lighting_getLightColor(colors.rgb, project.cameraPosition, geometry.position.xyz, geometry.normal);
vColor = vec4(lightColor, colors.a * layer.opacity);
} else {
vColor = vec4(colors.rgb, colors.a * layer.opacity);
}
DECKGL_FILTER_COLOR(vColor, geometry);
}
`,ff=`#version 300 es
#define SHADER_NAME solid-polygon-layer-vertex-shader
in vec3 vertexPositions;
in vec3 vertexPositions64Low;
in float elevations;
${Go}
void main(void) {
PolygonProps props;
props.positions = vertexPositions;
props.positions64Low = vertexPositions64Low;
props.elevations = elevations;
props.normal = vec3(0.0, 0.0, 1.0);
calculatePosition(props);
}
`,df=`#version 300 es
#define SHADER_NAME solid-polygon-layer-vertex-shader-side
#define IS_SIDE_VERTEX
in vec2 positions;
in vec3 vertexPositions;
in vec3 nextVertexPositions;
in vec3 vertexPositions64Low;
in vec3 nextVertexPositions64Low;
in float elevations;
in float instanceVertexValid;
${Go}
void main(void) {
if(instanceVertexValid < 0.5){
gl_Position = vec4(0.);
return;
}
PolygonProps props;
vec3 pos;
vec3 pos64Low;
vec3 nextPos;
vec3 nextPos64Low;
#if RING_WINDING_ORDER_CW == 1
pos = vertexPositions;
pos64Low = vertexPositions64Low;
nextPos = nextVertexPositions;
nextPos64Low = nextVertexPositions64Low;
#else
pos = nextVertexPositions;
pos64Low = nextVertexPositions64Low;
nextPos = vertexPositions;
nextPos64Low = vertexPositions64Low;
#endif
props.positions = mix(pos, nextPos, positions.x);
props.positions64Low = mix(pos64Low, nextPos64Low, positions.x);
props.normal = vec3(
pos.y - nextPos.y + (pos64Low.y - nextPos64Low.y),
nextPos.x - pos.x + (nextPos64Low.x - pos64Low.x),
0.0);
props.elevations = elevations * positions.y;
calculatePosition(props);
}
`,hf=`#version 300 es
#define SHADER_NAME solid-polygon-layer-fragment-shader
precision highp float;
in vec4 vColor;
out vec4 fragColor;
void main(void) {
fragColor = vColor;
geometry.uv = vec2(0.);
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;function jo(){return`fn project_offset_normal(vector: vec3<f32>) -> vec3<f32> {
  if (project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT ||
      project.coordinateSystem == COORDINATE_SYSTEM_LNGLAT_OFFSETS) {
    return normalize(vector * project.commonUnitsPerWorldUnit);
  }
  return project_normal(vector);
}

fn apply_polygon_color(
  colors: vec4<f32>,
  normal: vec3<f32>,
  position: vec4<f32>
) -> vec4<f32> {
  if (solidPolygon.extruded > 0.5) {
    let lightColor = lighting_getLightColor2(
      colors.rgb,
      project.cameraPosition,
      position.xyz,
      normal
    );
    return vec4<f32>(lightColor, colors.a * layer.opacity);
  }
  return vec4<f32>(colors.rgb, colors.a * layer.opacity);
}
`}function $o(){return`@fragment
fn fragmentMain(inp: Varyings) -> @location(0) vec4<f32> {
  geometry.uv = vec2<f32>(0.0, 0.0);

  clip_filterColor(inp.clipCoordinates);

  if (picking.isActive > 0.5) {
    if (!picking_isColorValid(inp.pickingColor)) {
      discard;
    }
    return vec4<f32>(inp.pickingColor, 1.0);
  }

  var fragColor = inp.vColor;

  if (picking.isHighlightActive > 0.5) {
    let highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
    if (picking_isColorZero(abs(inp.pickingColor - highlightedObjectColor))) {
      let highLightAlpha = picking.highlightColor.a;
      let blendedAlpha = highLightAlpha + fragColor.a * (1.0 - highLightAlpha);
      if (blendedAlpha > 0.0) {
        let highLightRatio = highLightAlpha / blendedAlpha;
        fragColor = vec4<f32>(
          mix(fragColor.rgb, picking.highlightColor.rgb, highLightRatio),
          blendedAlpha
        );
      } else {
        fragColor = vec4<f32>(fragColor.rgb, 0.0);
      }
    }
  }

  return deckgl_premultiplied_alpha(fragColor);
}
`}function gf(){return`${jo()}

struct Attributes {
  @location(0) vertexPositions: vec3<f32>,
  @location(1) vertexPositions64Low: vec3<f32>,
  @location(2) elevations: f32,
  @location(3) fillColors: vec4<f32>,
  @location(4) lineColors: vec4<f32>,
  @location(5) rowIndexes: u32,
};

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) vColor: vec4<f32>,
  @location(1) pickingColor: vec3<f32>,
  @location(2) clipCoordinates: vec2<f32>,
};

@vertex
fn vertexMain(attributes: Attributes) -> Varyings {
  var outp: Varyings;

  var pos = attributes.vertexPositions;
  if (solidPolygon.extruded > 0.5) {
    pos.z += attributes.elevations * solidPolygon.elevationScale;
  }

  geometry.worldPosition = attributes.vertexPositions;
  geometry.pickingColor = picking_getPickingColorFromIndex(attributes.rowIndexes);

  let projectedPosition = project_position_to_clipspace_and_commonspace(
    pos,
    attributes.vertexPositions64Low,
    vec3<f32>(0.0)
  );
  geometry.position = projectedPosition.commonPosition;
  outp.position = projectedPosition.clipPosition;

  let normal = project_normal(vec3<f32>(0.0, 0.0, 1.0));
  geometry.normal = normal;

  let colors = select(
    attributes.fillColors,
    attributes.lineColors,
    solidPolygon.isWireframe > 0.5
  );
  outp.vColor = apply_polygon_color(colors, normal, geometry.position);
  outp.pickingColor = geometry.pickingColor;

  outp.clipCoordinates = geometry.position.xy;
  clip_filterPosition(&outp.position, geometry.worldPosition.xy);

  return outp;
}

${$o()}
`}function pf(n){return`const RING_WINDING_ORDER_CW: bool = ${n?"true":"false"};

${jo()}

struct Attributes {
  @location(0) positions: vec2<f32>,
  @location(1) vertexPositions: vec3<f32>,
  @location(2) vertexPositions64Low: vec3<f32>,
  @location(3) nextVertexPositions: vec3<f32>,
  @location(4) nextVertexPositions64Low: vec3<f32>,
  @location(5) vertexValid: f32,
  @location(6) elevations: f32,
  @location(7) fillColors: vec4<f32>,
  @location(8) lineColors: vec4<f32>,
  @location(9) rowIndexes: u32,
};

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) vColor: vec4<f32>,
  @location(1) pickingColor: vec3<f32>,
  @location(2) clipCoordinates: vec2<f32>,
};

@vertex
fn vertexMain(attributes: Attributes) -> Varyings {
  var outp: Varyings;
  outp.position = vec4<f32>(0.0);
  outp.vColor = vec4<f32>(0.0);
  outp.pickingColor = picking_getPickingColorFromIndex(attributes.rowIndexes);
  outp.clipCoordinates = vec2<f32>(0.0);

  if (attributes.vertexValid < 0.5) {
    return outp;
  }

  let pos = select(attributes.nextVertexPositions, attributes.vertexPositions, RING_WINDING_ORDER_CW);
  let pos64Low = select(
    attributes.nextVertexPositions64Low,
    attributes.vertexPositions64Low,
    RING_WINDING_ORDER_CW
  );
  let nextPos = select(attributes.vertexPositions, attributes.nextVertexPositions, RING_WINDING_ORDER_CW);
  let nextPos64Low = select(
    attributes.vertexPositions64Low,
    attributes.nextVertexPositions64Low,
    RING_WINDING_ORDER_CW
  );

  let position = mix(pos, nextPos, attributes.positions.x);
  let position64Low = mix(pos64Low, nextPos64Low, attributes.positions.x);

  var worldPosition = position;
  if (solidPolygon.extruded > 0.5) {
    worldPosition.z += attributes.elevations * attributes.positions.y * solidPolygon.elevationScale;
  }

  geometry.worldPosition = position;
  geometry.pickingColor = picking_getPickingColorFromIndex(attributes.rowIndexes);

  let projectedPosition = project_position_to_clipspace_and_commonspace(
    worldPosition,
    position64Low,
    vec3<f32>(0.0)
  );
  geometry.position = projectedPosition.commonPosition;
  outp.position = projectedPosition.clipPosition;

  let normal = project_offset_normal(vec3<f32>(
    pos.y - nextPos.y + (pos64Low.y - nextPos64Low.y),
    nextPos.x - pos.x + (nextPos64Low.x - pos64Low.x),
    0.0
  ));
  geometry.normal = normal;

  let colors = select(
    attributes.fillColors,
    attributes.lineColors,
    solidPolygon.isWireframe > 0.5
  );
  outp.vColor = apply_polygon_color(colors, normal, geometry.position);
  outp.pickingColor = geometry.pickingColor;

  outp.clipCoordinates = geometry.position.xy;
  clip_filterPosition(&outp.position, geometry.worldPosition.xy);

  return outp;
}

${$o()}
`}function mf(n,e){return n==="top"?gf():pf(e)}const _t=[0,0,0,255],yf={filled:!0,extruded:!1,wireframe:!1,_normalize:!0,_windingOrder:"CW",_full3d:!1,elevationScale:{type:"number",min:0,value:1},getPolygon:{type:"accessor",value:n=>n.polygon},getElevation:{type:"accessor",value:1e3},getFillColor:{type:"accessor",value:_t},getLineColor:{type:"accessor",value:_t},material:!0},Ze={enter:(n,e)=>e.length?e.subarray(e.length-n.length):n};class Ti extends ue{getShaders(e){const t=!this.props._normalize&&this.props._windingOrder==="CCW"?0:1;return super.getShaders({vs:e==="top"?ff:df,fs:hf,source:mf(e,!!t),defines:{RING_WINDING_ORDER_CW:t},modules:[_e,Ue,mi,Fe,uf,...this.context.device.type==="webgpu"?[Li]:[]]})}get wrapLongitude(){return!1}getBounds(){return this.getAttributeManager()?.getBounds(["vertexPositions"])}initializeState(){const{viewport:e}=this.context;let{coordinateSystem:t}=this.props;const{_full3d:i}=this.props;e.isGeospatial&&t==="default"&&(t="lnglat");let o;t==="lnglat"&&(i?o=e.projectPosition.bind(e):o=e.projectFlat.bind(e)),this.setState({numInstances:0,polygonTesselator:new lf({preproject:o,fp64:this.use64bitPositions(),IndexType:Uint32Array})});const s=this.getAttributeManager(),r=!0,a=this.context.device.type==="webgpu";s.add({indices:{size:1,isIndexed:!0,update:this.calculateIndices,noAlloc:r},vertexPositions:{size:3,type:"float64",stepMode:"dynamic",fp64:this.use64bitPositions(),transition:Ze,accessor:"getPolygon",update:this.calculatePositions,noAlloc:r,...a?{}:{shaderAttributes:{nextVertexPositions:{vertexOffset:1}}}},...a?{nextVertexPositions:{size:3,type:"float64",stepMode:"dynamic",fp64:this.use64bitPositions(),transition:!1,update:this.calculateNextPositions,noAlloc:r}}:{},[a?"vertexValid":"instanceVertexValid"]:{size:1,type:a?"float32":"uint16",stepMode:"instance",update:this.calculateVertexValid,noAlloc:r},elevations:{size:1,stepMode:"dynamic",transition:Ze,accessor:"getElevation",bufferGroup:"solid-polygon-instance-data"},fillColors:{size:this.props.colorFormat.length,type:"unorm8",stepMode:"dynamic",transition:Ze,accessor:"getFillColor",defaultValue:_t,bufferGroup:"solid-polygon-instance-data"},lineColors:{size:this.props.colorFormat.length,type:"unorm8",stepMode:"dynamic",transition:Ze,accessor:"getLineColor",defaultValue:_t,bufferGroup:"solid-polygon-instance-data"},rowIndexes:{size:1,type:"uint32",stepMode:"dynamic",accessor:(l,{index:c})=>l&&l.__source?l.__source.index:c,bufferGroup:"solid-polygon-instance-data"}})}getPickingInfo(e){const t=super.getPickingInfo(e),{index:i}=t,o=this.props.data;return o[0]&&o[0].__source&&(t.object=o.find(s=>s.__source.index===i)),t}disablePickingIndex(e){const t=this.props.data;if(t[0]&&t[0].__source)for(let i=0;i<t.length;i++)t[i].__source.index===e&&this._disablePickingIndex(i);else super.disablePickingIndex(e)}draw({uniforms:e}){const{extruded:t,filled:i,wireframe:o,elevationScale:s}=this.props,{topModel:r,sideModel:a,wireframeModel:l,polygonTesselator:c}=this.state,u={extruded:!!t,elevationScale:s,isWireframe:!1};l&&o&&(l.setInstanceCount(c.instanceCount-1),l.shaderInputs.setProps({solidPolygon:{...u,isWireframe:!0}}),l.draw(this.context.renderPass)),a&&i&&(a.setInstanceCount(c.instanceCount-1),a.shaderInputs.setProps({solidPolygon:u}),a.draw(this.context.renderPass)),r&&i&&(r.setVertexCount(c.vertexCount),r.shaderInputs.setProps({solidPolygon:u}),r.draw(this.context.renderPass))}updateState(e){super.updateState(e),this.updateGeometry(e);const{props:t,oldProps:i,changeFlags:o}=e,s=this.getAttributeManager();(o.extensionsChanged||t.filled!==i.filled||t.extruded!==i.extruded)&&(this.state.models?.forEach(a=>a.destroy()),this.setState(this._getModels()),s.invalidateAll())}updateGeometry({props:e,oldProps:t,changeFlags:i}){if(i.dataChanged||i.updateTriggersChanged&&(i.updateTriggersChanged.all||i.updateTriggersChanged.getPolygon)){const{polygonTesselator:s}=this.state,r=e.data.attributes||{};s.updateGeometry({data:e.data,normalize:e._normalize,geometryBuffer:r.getPolygon,buffers:this.context.device.type==="webgpu"?{...r}:r,getGeometry:e.getPolygon,positionFormat:e.positionFormat,wrapLongitude:e.wrapLongitude,resolution:this.context.viewport.resolution,fp64:this.use64bitPositions(),dataChanged:i.dataChanged,full3d:e._full3d}),this.setState({numInstances:s.instanceCount,startIndices:s.vertexStarts}),i.dataChanged||this.getAttributeManager().invalidateAll()}}_getModels(){const{id:e,filled:t,extruded:i}=this.props;let o,s,r;if(t){const a=this.getShaders("top");a.defines={...a.defines,NON_INSTANCED_MODEL:1};let l=this.getAttributeManager().getBufferLayouts({isInstanced:!1});this.context.device.type==="webgpu"&&(l=l.filter(c=>c.name!=="indices"&&c.name!=="vertexValid"&&c.name!=="instanceVertexValid"&&c.name!=="nextVertexPositions")),o=new j(this.context.device,{...a,id:`${e}-top`,topology:"triangle-list",bufferLayout:l,isIndexed:!0,userData:{excludeAttributes:{vertexValid:!0,instanceVertexValid:!0,nextVertexPositions:!0}}})}if(i){let a=this.getAttributeManager().getBufferLayouts({isInstanced:!0});this.context.device.type==="webgpu"&&(a=a.filter(l=>l.name!=="indices")),s=new j(this.context.device,{...this.getShaders("side"),id:`${e}-side`,bufferLayout:a,geometry:new le({topology:"triangle-strip",attributes:{positions:{size:2,value:new Float32Array([1,0,0,0,1,1,0,1])}}}),isInstanced:!0,userData:{excludeAttributes:{indices:!0}}}),r=new j(this.context.device,{...this.getShaders("side"),id:`${e}-wireframe`,bufferLayout:a,geometry:new le({topology:"line-strip",attributes:{positions:{size:2,value:new Float32Array([1,0,0,0,0,1,1,1])}}}),isInstanced:!0,userData:{excludeAttributes:{indices:!0}}})}return{models:[s,r,o].filter(Boolean),topModel:o,sideModel:s,wireframeModel:r}}calculateIndices(e){const{polygonTesselator:t}=this.state;e.startIndices=t.indexStarts,e.value=t.get("indices")}calculatePositions(e){const{polygonTesselator:t}=this.state;e.startIndices=t.vertexStarts;const i=this.props.data.attributes?.getPolygon;if(this.context.device.type==="webgpu"&&ArrayBuffer.isView(i?.value)){const{value:o,size:s=3,offset:r=0,stride:a}=i,l=r/o.BYTES_PER_ELEMENT,c=a?a/o.BYTES_PER_ELEMENT:s,u=new Float64Array(t.instanceCount*3);for(let f=0;f<t.instanceCount;f++){const h=l+f*c,g=f*3;u[g]=o[h],u[g+1]=o[h+1],u[g+2]=s>2?o[h+2]:0}e.value=u;return}e.value=t.get("positions")}calculateVertexValid(e){const t=this.props.data.attributes?.instanceVertexValid?.value,i=this.context.device.type==="webgpu"&&t?t:this.state.polygonTesselator.get("vertexValid");e.value=this.context.device.type==="webgpu"&&i?Float32Array.from(i):i}calculateNextPositions(e){const{polygonTesselator:t}=this.state,i=this.getAttributeManager().getAttributes(),o=i.vertexPositions.value,s=this.props.data.attributes?.instanceVertexValid?.value||i.vertexValid?.value||t.get("vertexValid");if(e.startIndices=t.vertexStarts,!o){e.value=o;return}const r=o.length/3,a=new o.constructor(o.length);for(let l=0;l<r;l++){const c=l*3,u=s?.[l]&&l+1<r?c+3:c;for(let f=0;f<3;f++)a[c+f]=o[u+f]}e.value=a}}Ti.defaultProps=yf;Ti.layerName="SolidPolygonLayer";function bf({data:n,getIndex:e,dataRange:t,replace:i}){const{startRow:o=0,endRow:s=1/0}=t,r=n.length;let a=r,l=r;for(let h=0;h<r;h++){const g=e(n[h]);if(a>h&&g>=o&&(a=h),g>=s){l=h;break}}let c=a;const f=l-a!==i.length?n.slice(l):void 0;for(let h=0;h<i.length;h++)n[c++]=i[h];if(f){for(let h=0;h<f.length;h++)n[c++]=f[h];n.length=c}return{startRow:a,endRow:a+i.length}}const Wo=[0,0,0,255],vf=[0,0,0,255],_f={stroked:!0,filled:!0,extruded:!1,elevationScale:1,wireframe:!1,_normalize:!0,_windingOrder:"CW",lineWidthUnits:"meters",lineWidthScale:1,lineWidthMinPixels:0,lineWidthMaxPixels:Number.MAX_SAFE_INTEGER,lineJointRounded:!1,lineMiterLimit:4,lineAntialiasing:!1,getPolygon:{type:"accessor",value:n=>n.polygon},getFillColor:{type:"accessor",value:vf},getLineColor:{type:"accessor",value:Wo},getLineWidth:{type:"accessor",value:1},getElevation:{type:"accessor",value:1e3},material:!0};class Bi extends Pi{initializeState(){this.state={paths:[],pathsDiff:null},this.props.getLineDashArray&&H.removed("getLineDashArray","PathStyleExtension")()}updateState({changeFlags:e}){const t=e.dataChanged||e.updateTriggersChanged&&(e.updateTriggersChanged.all||e.updateTriggersChanged.getPolygon);if(t&&Array.isArray(e.dataChanged)){const i=this.state.paths.slice(),o=e.dataChanged.map(s=>bf({data:i,getIndex:r=>r.__source.index,dataRange:s,replace:this._getPaths(s)}));this.setState({paths:i,pathsDiff:o})}else t&&this.setState({paths:this._getPaths(),pathsDiff:null})}_getPaths(e={}){const{data:t,getPolygon:i,positionFormat:o,_normalize:s}=this.props,r=[],a=o==="XY"?2:3,{startRow:l,endRow:c}=e,{iterable:u,objectInfo:f}=Lt(t,l,c);for(const h of u){f.index++;let g=i(h,f);s&&(g=Vo(g,a));const{holeIndices:y}=g,b=g.positions||g;if(y)for(let w=0;w<=y.length;w++){const S=b.slice(y[w-1]||0,y[w]||b.length);r.push(this.getSubLayerRow({path:S},h,f.index))}else r.push(this.getSubLayerRow({path:b},h,f.index))}return r}renderLayers(){const{data:e,_dataDiff:t,stroked:i,filled:o,extruded:s,wireframe:r,_normalize:a,_windingOrder:l,elevationScale:c,transitions:u,positionFormat:f}=this.props,{lineWidthUnits:h,lineWidthScale:g,lineWidthMinPixels:y,lineWidthMaxPixels:b,lineJointRounded:w,lineMiterLimit:S,lineAntialiasing:A,lineDashJustified:L}=this.props,{getFillColor:B,getLineColor:k,getLineWidth:V,getLineDashArray:Y,getElevation:X,getPolygon:Z,updateTriggers:$,material:Ve}=this.props,{paths:pe,pathsDiff:ne}=this.state,xe=this.getSubLayerClass("fill",Ti),Pe=this.getSubLayerClass("stroke",Ii),d=this.shouldRenderSubLayer("fill",pe)&&new xe({_dataDiff:t,extruded:s,elevationScale:c,filled:o,wireframe:r,_normalize:a,_windingOrder:l,getElevation:X,getFillColor:B,getLineColor:s&&r?k:Wo,material:Ve,transitions:u},this.getSubLayerProps({id:"fill",updateTriggers:$&&{getPolygon:$.getPolygon,getElevation:$.getElevation,getFillColor:$.getFillColor,lineColors:s&&r,getLineColor:$.getLineColor}}),{data:e,positionFormat:f,getPolygon:Z}),m=!s&&i&&this.shouldRenderSubLayer("stroke",pe)&&new Pe({_dataDiff:ne&&(()=>ne),widthUnits:h,widthScale:g,widthMinPixels:y,widthMaxPixels:b,jointRounded:w,miterLimit:S,antialiasing:A,dashJustified:L,_pathType:"loop",transitions:u&&{getWidth:u.getLineWidth,getColor:u.getLineColor,getPath:u.getPolygon},getColor:this.getSubLayerAccessor(k),getWidth:this.getSubLayerAccessor(V),getDashArray:this.getSubLayerAccessor(Y)},this.getSubLayerProps({id:"stroke",updateTriggers:$&&{getWidth:$.getLineWidth,getColor:$.getLineColor,getDashArray:$.getLineDashArray}}),{data:pe,positionFormat:f,getPath:p=>p.path});return[!s&&d,m,s&&d]}}Bi.layerName="PolygonLayer";Bi.defaultProps=_f;function xf({pointCount:n,getBinId:e}){const t=new Map;for(let i=0;i<n;i++){const o=e(i);if(o===null)continue;let s=t.get(String(o));s?s.points.push(i):(s={id:o,index:t.size,points:[i]},t.set(String(o),s))}return Array.from(t.values())}function Pf({bins:n,dimensions:e,target:t}){const i=n.length*e;(!t||t.length<i)&&(t=new Float32Array(i));for(let o=0;o<n.length;o++){const{id:s}=n[o];Array.isArray(s)?t.set(s,o*e):t[o]=s}return t}const wf=n=>n.length,Ho=(n,e)=>{let t=0;for(const i of n)t+=e(i);return t},Lf=(n,e)=>n.length===0?NaN:Ho(n,e)/n.length,Sf=(n,e)=>{let t=1/0;for(const i of n){const o=e(i);o<t&&(t=o)}return t},Cf=(n,e)=>{let t=-1/0;for(const i of n){const o=e(i);o>t&&(t=o)}return t},Af={COUNT:wf,SUM:Ho,MEAN:Lf,MIN:Sf,MAX:Cf};function Ef({bins:n,getValue:e,operation:t,target:i}){(!i||i.length<n.length)&&(i=new Float32Array(n.length));let o=1/0,s=-1/0;for(let r=0;r<n.length;r++){const{points:a}=n[r];i[r]=t(a,e),i[r]<o&&(o=i[r]),i[r]>s&&(s=i[r])}return{value:i,domain:[o,s]}}function On(n,e,t){const i={};for(const s of n.sources||[]){const r=e[s];if(r)i[s]=If(r);else throw new Error(`Cannot find attribute ${s}`)}const o={};return s=>{for(const r in i)o[r]=i[r](s);return n.getValue(o,s,t)}}function If(n){const e=n.value,{offset:t=0,stride:i,size:o}=n.getAccessor(),s=e.BYTES_PER_ELEMENT,r=t/s,a=i?i/s:o;if(o===1)return n.isConstant?()=>e[0]:c=>{const u=r+a*c;return e[u]};let l;return n.isConstant?(l=Array.from(e),()=>l):(l=new Array(o),c=>{const u=r+a*c;for(let f=0;f<o;f++)l[f]=e[u+f];return l})}class Tf{constructor(e){this.bins=[],this.binIds=null,this.results=[],this.dimensions=e.dimensions,this.channelCount=e.getValue.length,this.props={...e,binOptions:{},pointCount:0,operations:[],customOperations:[],attributes:{}},this.needsUpdate=!0,this.setProps(e)}destroy(){}get binCount(){return this.bins.length}setProps(e){const t=this.props;if(e.binOptions&&(de(e.binOptions,t.binOptions,2)||this.setNeedsUpdate()),e.operations)for(let i=0;i<this.channelCount;i++)e.operations[i]!==t.operations[i]&&this.setNeedsUpdate(i);if(e.customOperations)for(let i=0;i<this.channelCount;i++)!!e.customOperations[i]!=!!t.customOperations[i]&&this.setNeedsUpdate(i);e.pointCount!==void 0&&e.pointCount!==t.pointCount&&this.setNeedsUpdate(),e.attributes&&(e.attributes={...t.attributes,...e.attributes}),Object.assign(this.props,e)}setNeedsUpdate(e){e===void 0?this.needsUpdate=!0:this.needsUpdate!==!0&&(this.needsUpdate=this.needsUpdate||[],this.needsUpdate[e]=!0)}update(){if(this.needsUpdate===!0){this.bins=xf({pointCount:this.props.pointCount,getBinId:On(this.props.getBin,this.props.attributes,this.props.binOptions)});const e=Pf({bins:this.bins,dimensions:this.dimensions,target:this.binIds?.value});this.binIds={value:e,type:"float32",size:this.dimensions}}for(let e=0;e<this.channelCount;e++)if(this.needsUpdate===!0||this.needsUpdate[e]){const t=this.props.customOperations[e]||Af[this.props.operations[e]],{value:i,domain:o}=Ef({bins:this.bins,getValue:On(this.props.getValue[e],this.props.attributes,void 0),operation:t,target:this.results[e]?.value});this.results[e]={value:i,domain:o,type:"float32",size:1},this.props.onUpdate?.({channel:e})}this.needsUpdate=!1}preDraw(){}getBins(){return this.binIds}getResult(e){return this.results[e]}getResultDomain(e){return this.results[e]?.domain??[1/0,-1/0]}getBin(e){const t=this.bins[e];if(!t)return null;const i=new Array(this.channelCount);for(let o=0;o<i.length;o++){const s=this.results[o];i[o]=s?.value[e]}return{id:t.id,value:i,count:t.points.length,pointIndices:t.points}}}function Yo(n,e,t){return n.createFramebuffer({width:e,height:t,colorAttachments:[n.createTexture({width:e,height:t,format:"rgba32float",sampler:{minFilter:"nearest",magFilter:"nearest"}})]})}const Bf=`layout(std140) uniform binSorterUniforms {
  ivec4 binIdRange;
  ivec2 targetSize;
} binSorter;
`,Of={name:"binSorter",vs:Bf,uniformTypes:{binIdRange:"vec4<i32>",targetSize:"vec2<i32>"}},qo=[1,2,4,8],Rn=3e38,Rf={SUM:0,MEAN:0,MIN:0,MAX:0,COUNT:0},rt=1024;class Mf{constructor(e,t){this.binsFBO=null,this.device=e,this.model=Nf(e,t)}get texture(){return this.binsFBO?this.binsFBO.colorAttachments[0].texture:null}destroy(){this.model.destroy(),this.binsFBO?.colorAttachments[0].texture.destroy(),this.binsFBO?.destroy()}getBinValues(e){if(!this.binsFBO)return null;const t=e%rt,i=Math.floor(e/rt),o=this.device.readPixelsToArrayWebGL(this.binsFBO,{sourceX:t,sourceY:i,sourceWidth:1,sourceHeight:1}).buffer;return new Float32Array(o)}setDimensions(e,t){const i=rt,o=Math.ceil(e/i);this.binsFBO?this.binsFBO.height<o&&this.binsFBO.resize({width:i,height:o}):this.binsFBO=Yo(this.device,i,o);const s={binIdRange:[t[0][0],t[0][1],t[1]?.[0]||0,t[1]?.[1]||0],targetSize:[this.binsFBO.width,this.binsFBO.height]};this.model.shaderInputs.setProps({binSorter:s})}setModelProps(e){const t=this.model;e.attributes&&t.setAttributes(e.attributes),e.constantAttributes&&t.setConstantAttributes(e.constantAttributes),e.vertexCount!==void 0&&t.setVertexCount(e.vertexCount),e.shaderModuleProps&&t.shaderInputs.setProps(e.shaderModuleProps)}update(e){if(!this.binsFBO)return;const t=Df(e);this._updateBins("SUM",t.SUM+t.MEAN),this._updateBins("MIN",t.MIN),this._updateBins("MAX",t.MAX)}_updateBins(e,t){if(t===0)return;t|=qo[3];const i=this.model,o=this.binsFBO,s=e==="MAX"?-Rn:e==="MIN"?Rn:0,r=this.device.beginRenderPass({id:`gpu-aggregation-${e}`,framebuffer:o,parameters:{viewport:[0,0,o.width,o.height],colorMask:t},clearColor:[s,s,s,0],clearDepth:!1,clearStencil:!1});i.setParameters({blend:!0,blendColorSrcFactor:"one",blendColorDstFactor:"one",blendAlphaSrcFactor:"one",blendAlphaDstFactor:"one",blendColorOperation:e==="MAX"?"max":e==="MIN"?"min":"add",blendAlphaOperation:"add"}),i.draw(r),r.end()}}function Df(n){const e={...Rf};for(let t=0;t<n.length;t++){const i=n[t];i&&(e[i]+=qo[t])}return e}function Nf(n,e){let t=e.vs;e.dimensions===2&&(t+=`
void getBin(out int binId) {
  ivec2 binId2;
  getBin(binId2);
  if (binId2.x < binSorter.binIdRange.x || binId2.x >= binSorter.binIdRange.y) {
    binId = -1;
  } else {
    binId = (binId2.y - binSorter.binIdRange.z) * (binSorter.binIdRange.y - binSorter.binIdRange.x) + binId2.x;
  }
}
`);const i=`#version 300 es
#define SHADER_NAME gpu-aggregation-sort-bins-vertex

${t}

out vec3 v_Value;

void main() {
  int binIndex;
  getBin(binIndex);
  binIndex = binIndex - binSorter.binIdRange.x;
  if (binIndex < 0) {
    gl_Position = vec4(0.);
    return;
  }
  int row = binIndex / binSorter.targetSize.x;
  int col = binIndex - row * binSorter.targetSize.x;
  vec2 position = (vec2(col, row) + 0.5) / vec2(binSorter.targetSize) * 2.0 - 1.0;
  gl_Position = vec4(position, 0.0, 1.0);
  gl_PointSize = 1.0;

#if NUM_CHANNELS == 3
  getValue(v_Value);
#elif NUM_CHANNELS == 2
  getValue(v_Value.xy);
#else
  getValue(v_Value.x);
#endif
}
`,o=`#version 300 es
#define SHADER_NAME gpu-aggregation-sort-bins-fragment

precision highp float;

in vec3 v_Value;
out vec4 fragColor;

void main() {
  fragColor.xyz = v_Value;

  #ifdef MODULE_GEOMETRY
  geometry.uv = vec2(0.);
  DECKGL_FILTER_COLOR(fragColor, geometry);
  #endif

  fragColor.w = 1.0;
}
`;return new j(n,{bufferLayout:e.bufferLayout,modules:[...e.modules||[],Of],defines:{...e.defines,NON_INSTANCED_MODEL:1,NUM_CHANNELS:e.channelCount},isInstanced:!1,vs:i,fs:o,topology:"point-list",disableWarnings:!0})}const Uf=`layout(std140) uniform aggregatorTransformUniforms {
  ivec4 binIdRange;
  bvec3 isCount;
  bvec3 isMean;
  float naN;
} aggregatorTransform;
`,Ff={name:"aggregatorTransform",vs:Uf,uniformTypes:{binIdRange:"vec4<i32>",isCount:"vec3<f32>",isMean:"vec3<f32>",naN:"f32"}};class kf{constructor(e,t){this.binBuffer=null,this.valueBuffer=null,this._domains=null,this.device=e,this.channelCount=t.channelCount,this.transform=zf(e,t),this.domainFBO=Yo(e,2,1)}destroy(){this.transform.destroy(),this.binBuffer?.destroy(),this.valueBuffer?.destroy(),this.domainFBO.colorAttachments[0].texture.destroy(),this.domainFBO.destroy()}get domains(){if(!this._domains){const e=this.device.readPixelsToArrayWebGL(this.domainFBO).buffer,t=new Float32Array(e);this._domains=[[-t[4],t[0]],[-t[5],t[1]],[-t[6],t[2]]].slice(0,this.channelCount)}return this._domains}setDimensions(e,t){const{model:i,transformFeedback:o}=this.transform;i.setVertexCount(e);const s={binIdRange:[t[0][0],t[0][1],t[1]?.[0]||0,t[1]?.[1]||0]};i.shaderInputs.setProps({aggregatorTransform:s});const r=e*t.length*4;(!this.binBuffer||this.binBuffer.byteLength<r)&&(this.binBuffer?.destroy(),this.binBuffer=this.device.createBuffer({byteLength:r}),o.setBuffer("binIds",this.binBuffer));const a=e*this.channelCount*4;(!this.valueBuffer||this.valueBuffer.byteLength<a)&&(this.valueBuffer?.destroy(),this.valueBuffer=this.device.createBuffer({byteLength:a}),o.setBuffer("values",this.valueBuffer))}update(e,t){if(!e)return;const i=this.transform,o=this.domainFBO,s=[0,1,2].map(l=>t[l]==="COUNT"?1:0),r=[0,1,2].map(l=>t[l]==="MEAN"?1:0),a={isCount:s,isMean:r,bins:e};i.model.shaderInputs.setProps({aggregatorTransform:a}),i.run({id:"gpu-aggregation-domain",framebuffer:o,discard:!1,parameters:{viewport:[0,0,2,1]},clearColor:[-3e38,-3e38,-3e38,0],clearDepth:!1,clearStencil:!1}),this._domains=null}}function zf(n,e){const t=`#version 300 es
#define SHADER_NAME gpu-aggregation-domain-vertex

uniform sampler2D bins;

#if NUM_DIMS == 1
out float binIds;
#else
out vec2 binIds;
#endif

#if NUM_CHANNELS == 1
flat out float values;
#elif NUM_CHANNELS == 2
flat out vec2 values;
#else
flat out vec3 values;
#endif

const float NAN = intBitsToFloat(-1);

void main() {
  int row = gl_VertexID / SAMPLER_WIDTH;
  int col = gl_VertexID - row * SAMPLER_WIDTH;
  vec4 weights = texelFetch(bins, ivec2(col, row), 0);
  vec3 value3 = mix(
    mix(weights.rgb, vec3(weights.a), aggregatorTransform.isCount),
    weights.rgb / max(weights.a, 1.0),
    aggregatorTransform.isMean
  );
  if (weights.a == 0.0) {
    value3 = vec3(NAN);
  }

#if NUM_DIMS == 1
  binIds = float(gl_VertexID + aggregatorTransform.binIdRange.x);
#else
  int y = gl_VertexID / (aggregatorTransform.binIdRange.y - aggregatorTransform.binIdRange.x);
  int x = gl_VertexID - y * (aggregatorTransform.binIdRange.y - aggregatorTransform.binIdRange.x);
  binIds.y = float(y + aggregatorTransform.binIdRange.z);
  binIds.x = float(x + aggregatorTransform.binIdRange.x);
#endif

#if NUM_CHANNELS == 3
  values = value3;
#elif NUM_CHANNELS == 2
  values = value3.xy;
#else
  values = value3.x;
#endif

  gl_Position = vec4(0., 0., 0., 1.);
  // This model renders into a 2x1 texture to obtain min and max simultaneously.
  // See comments in fragment shader
  gl_PointSize = 2.0;
}
`,i=`#version 300 es
#define SHADER_NAME gpu-aggregation-domain-fragment

precision highp float;

#if NUM_CHANNELS == 1
flat in float values;
#elif NUM_CHANNELS == 2
flat in vec2 values;
#else
flat in vec3 values;
#endif

out vec4 fragColor;

void main() {
  vec3 value3;
#if NUM_CHANNELS == 3
  value3 = values;
#elif NUM_CHANNELS == 2
  value3.xy = values;
#else
  value3.x = values;
#endif
  if (isnan(value3.x)) discard;
  // This shader renders into a 2x1 texture with blending=max
  // The left pixel yields the max value of each channel
  // The right pixel yields the min value of each channel
  if (gl_FragCoord.x < 1.0) {
    fragColor = vec4(value3, 1.0);
  } else {
    fragColor = vec4(-value3, 1.0);
  }
}
`;return n.type==="webgl"&&n.getExtension("GL_ARB_shader_bit_encoding"),new ge(n,{vs:t,fs:i,topology:"point-list",modules:[Ff],parameters:{blend:!0,blendColorSrcFactor:"one",blendColorDstFactor:"one",blendColorOperation:"max",blendAlphaSrcFactor:"one",blendAlphaDstFactor:"one",blendAlphaOperation:"max"},defines:{NUM_DIMS:e.dimensions,NUM_CHANNELS:e.channelCount,SAMPLER_WIDTH:rt},varyings:["binIds","values"],disableWarnings:!0})}class Mn{static isSupported(e){return e.features.has("float32-renderable-webgl")&&e.features.has("texture-blend-float-webgl")}constructor(e,t){this.binCount=0,this.binIds=null,this.results=[],this.device=e,this.dimensions=t.dimensions,this.channelCount=t.channelCount,this.props={...t,pointCount:0,binIdRange:[[0,0]],operations:[],attributes:{},binOptions:{}},this.needsUpdate=new Array(this.channelCount).fill(!0),this.binSorter=new Mf(e,t),this.aggregationTransform=new kf(e,t),this.setProps(t)}getBins(){const e=this.aggregationTransform.binBuffer;return e?(this.binIds?.buffer!==e&&(this.binIds={buffer:e,type:"float32",size:this.dimensions}),this.binIds):null}getResult(e){const t=this.aggregationTransform.valueBuffer;return!t||e>=this.channelCount?null:(this.results[e]?.buffer!==t&&(this.results[e]={buffer:t,type:"float32",size:1,stride:this.channelCount*4,offset:e*4}),this.results[e])}getResultDomain(e){return this.aggregationTransform.domains[e]}getBin(e){if(e<0||e>=this.binCount)return null;const{binIdRange:t}=this.props;let i;if(this.dimensions===1)i=[e+t[0][0]];else{const[[a,l],[c]]=t,u=l-a;i=[e%u+a,Math.floor(e/u)+c]}const o=this.binSorter.getBinValues(e);if(!o)return null;const s=o[3],r=[];for(let a=0;a<this.channelCount;a++){const l=this.props.operations[a];l==="COUNT"?r[a]=s:s===0?r[a]=NaN:r[a]=l==="MEAN"?o[a]/s:o[a]}return{id:i,value:r,count:s}}destroy(){this.binSorter.destroy(),this.aggregationTransform.destroy()}setProps(e){const t=this.props;if("binIdRange"in e&&!de(e.binIdRange,t.binIdRange,2)){const i=e.binIdRange;if(H.assert(i.length===this.dimensions),this.dimensions===1){const[[o,s]]=i;this.binCount=s-o}else{const[[o,s],[r,a]]=i;this.binCount=(s-o)*(a-r)}this.binSorter.setDimensions(this.binCount,i),this.aggregationTransform.setDimensions(this.binCount,i),this.setNeedsUpdate()}if(e.operations)for(let i=0;i<this.channelCount;i++)e.operations[i]!==t.operations[i]&&this.setNeedsUpdate(i);if(e.pointCount!==void 0&&e.pointCount!==t.pointCount&&(this.binSorter.setModelProps({vertexCount:e.pointCount}),this.setNeedsUpdate()),e.binOptions&&(de(e.binOptions,t.binOptions,2)||this.setNeedsUpdate(),this.binSorter.model.shaderInputs.setProps({binOptions:e.binOptions})),e.attributes){const i={},o={};for(const s of Object.values(e.attributes))for(const[r,a]of Object.entries(s.getValue()))ArrayBuffer.isView(a)?o[r]=a:a&&(i[r]=a);this.binSorter.setModelProps({attributes:i,constantAttributes:o})}e.shaderModuleProps&&this.binSorter.setModelProps({shaderModuleProps:e.shaderModuleProps}),Object.assign(this.props,e)}setNeedsUpdate(e){e===void 0?this.needsUpdate.fill(!0):this.needsUpdate[e]=!0}update(){}preDraw(){if(!this.needsUpdate.some(Boolean))return;const{operations:e}=this.props,t=this.needsUpdate.map((i,o)=>i?e[o]:null);this.binSorter.update(t),this.aggregationTransform.update(this.binSorter.texture,e);for(let i=0;i<this.channelCount;i++)this.needsUpdate[i]&&(this.needsUpdate[i]=!1,this.props.onUpdate?.({channel:i}))}}class Zo extends Pi{get isDrawable(){return!0}initializeState(){}updateState(e){super.updateState(e);const t=this.getAggregatorType();if(e.changeFlags.extensionsChanged||this.state.aggregatorType!==t){this.state.aggregator?.destroy();const i=this.createAggregator(t);return i.setProps({attributes:this.getAttributeManager()?.attributes}),this.setState({aggregator:i,aggregatorType:t}),!0}return!1}finalizeState(e){super.finalizeState(e),this.state.aggregator.destroy()}updateAttributes(e){const{aggregator:t}=this.state;t.setProps({attributes:e});for(const i in e)this.onAttributeChange(i);t.update()}draw({shaderModuleProps:e}){const{aggregator:t}=this.state;t.setProps({shaderModuleProps:e}),t.preDraw()}_getAttributeManager(){return new Io(this.context.device,{id:this.props.id,stats:this.context.stats})}}Zo.layerName="AggregationLayer";const Vf=[[255,255,178],[254,217,118],[254,178,76],[253,141,60],[240,59,32],[189,0,38]];function Gf(n,e=!1,t=Float32Array){let i;if(Number.isFinite(n[0]))i=new t(n);else{i=new t(n.length*4);let o=0;for(let s=0;s<n.length;s++){const r=n[s];i[o++]=r[0],i[o++]=r[1],i[o++]=r[2],i[o++]=Number.isFinite(r[3])?r[3]:255}}if(e)for(let o=0;o<i.length;o++)i[o]/=255;return i}const xt={linear:"linear",quantile:"nearest",quantize:"nearest",ordinal:"nearest"};function jf(n,e){n.setSampler({minFilter:xt[e],magFilter:xt[e]})}function $f(n,e,t="linear"){const i=Gf(e,!1,Uint8Array);return n.createTexture({format:"rgba8unorm",sampler:{minFilter:xt[t],magFilter:xt[t],addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge"},data:i,width:i.length/4,height:1})}class Dn{constructor(e,t){this.props={scaleType:"linear",lowerPercentile:0,upperPercentile:100},this.domain=null,this.cutoff=null,this.input=e,this.inputLength=t,this.attribute=e}getScalePercentile(){if(!this._percentile){const e=Nn(this.input,this.inputLength);this._percentile=Hf(e)}return this._percentile}getScaleOrdinal(){if(!this._ordinal){const e=Nn(this.input,this.inputLength);this._ordinal=Wf(e)}return this._ordinal}getCutoff({scaleType:e,lowerPercentile:t,upperPercentile:i}){if(e==="quantile")return[t,i-1];if(t>0||i<100){const{domain:o}=this.getScalePercentile();let s=o[Math.floor(t)-1]??-1/0,r=o[Math.floor(i)-1]??1/0;if(e==="ordinal"){const{domain:a}=this.getScaleOrdinal();s=a.findIndex(l=>l>=s),r=a.findIndex(l=>l>r)-1,r===-2&&(r=a.length-1)}return[s,r]}return null}update(e){const t=this.props;if(e.scaleType!==t.scaleType)switch(e.scaleType){case"quantile":{const{attribute:i}=this.getScalePercentile();this.attribute=i,this.domain=[0,99];break}case"ordinal":{const{attribute:i,domain:o}=this.getScaleOrdinal();this.attribute=i,this.domain=[0,o.length-1];break}default:this.attribute=this.input,this.domain=null}return(e.scaleType!==t.scaleType||e.lowerPercentile!==t.lowerPercentile||e.upperPercentile!==t.upperPercentile)&&(this.cutoff=this.getCutoff(e)),this.props=e,this}}function Wf(n){const e=new Set;for(const o of n)Number.isFinite(o)&&e.add(o);const t=Array.from(e).sort(),i=new Map;for(let o=0;o<t.length;o++)i.set(t[o],o);return{attribute:{value:n.map(o=>Number.isFinite(o)?i.get(o):NaN),type:"float32",size:1},domain:t}}function Hf(n,e=100){const t=Array.from(n).filter(Number.isFinite).sort(Yf);let i=0;const o=Math.max(1,e),s=new Array(o-1);for(;++i<o;)s[i-1]=qf(t,i/o);return{attribute:{value:n.map(r=>Number.isFinite(r)?Zf(s,r):NaN),type:"float32",size:1},domain:s}}function Nn(n,e){const t=(n.stride??4)/4,i=(n.offset??0)/4;let o=n.value;if(!o){const r=n.buffer?.readSyncWebGL(0,t*4*e);r&&(o=new Float32Array(r.buffer),n.value=o)}if(t===1)return o.subarray(0,e);const s=new Float32Array(e);for(let r=0;r<e;r++)s[r]=o[r*t+i];return s}function Yf(n,e){return n-e}function qf(n,e){const t=n.length;if(e<=0||t<2)return n[0];if(e>=1)return n[t-1];const i=(t-1)*e,o=Math.floor(i),s=n[o],r=n[o+1];return s+(r-s)*(i-o)}function Zf(n,e){let t=0,i=n.length;for(;t<i;){const o=t+i>>>1;n[o]>e?i=o:t=o+1}return t}function Kf({dataBounds:n,getBinId:e,padding:t=0}){const i=[n[0],n[1],[n[0][0],n[1][1]],[n[1][0],n[0][1]]].map(l=>e(l)),o=Math.min(...i.map(l=>l[0]))-t,s=Math.min(...i.map(l=>l[1]))-t,r=Math.max(...i.map(l=>l[0]))+t+1,a=Math.max(...i.map(l=>l[1]))+t+1;return[[o,r],[s,a]]}const Xf=`const HEXBIN_DISTANCE: vec2<f32> = vec2<f32>(1.7320508, 1.5);

struct Attributes {
  @builtin(instance_index) instanceIndex: u32,
  @location(0) positions: vec3<f32>,
  @location(1) normals: vec3<f32>,
  @location(2) instancePositions: vec2<f32>,
  @location(3) instanceColorValues: f32,
  @location(4) instanceElevationValues: f32,
};

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) pickingColor: vec3<f32>,
};

fn hexbinCentroid(binId: vec2<f32>, radius: f32) -> vec2<f32> {
  var adjustedBinId = binId;
  adjustedBinId.x += fract(adjustedBinId.y * 0.5);
  return adjustedBinId * HEXBIN_DISTANCE * radius;
}

fn interpolate(value: f32, domain: vec2<f32>, range: vec2<f32>) -> f32 {
  let ratio = clamp((value - domain.x) / (domain.y - domain.x), 0.0, 1.0);
  return mix(range.x, range.y, ratio);
}

fn sampleColorRange(value: f32, domain: vec2<f32>) -> vec4<f32> {
  let ratio = (value - domain.x) / (domain.y - domain.x);
  return textureSampleLevel(colorRange, colorRangeSampler, vec2<f32>(ratio, 0.5), 0.0);
}

@vertex
fn vertexMain(attributes: Attributes) -> Varyings {
  var output: Varyings;
  geometry.pickingColor = picking_getPickingColorFromIndex(attributes.instanceIndex);
  output.pickingColor = geometry.pickingColor;

  if (
    attributes.instanceColorValues != attributes.instanceColorValues ||
    attributes.instanceColorValues < hexagon.colorDomain.z ||
    attributes.instanceColorValues > hexagon.colorDomain.w ||
    attributes.instanceElevationValues < hexagon.elevationDomain.z ||
    attributes.instanceElevationValues > hexagon.elevationDomain.w
  ) {
    output.position = vec4<f32>(0.0);
    output.color = vec4<f32>(0.0);
    return output;
  }

  var commonPosition =
    hexbinCentroid(attributes.instancePositions, column.radius) +
    (hexagon.originCommon - project.commonOrigin.xy);
  commonPosition += attributes.positions.xy * column.radius * column.coverage;
  geometry.position = vec4<f32>(commonPosition, 0.0, 1.0);
  geometry.normal = project_normal(attributes.normals);

  if (column.extruded > 0.5) {
    var elevation = interpolate(
      attributes.instanceElevationValues,
      hexagon.elevationDomain.xy,
      hexagon.elevationRange
    );
    elevation = project_size_float(elevation);
    geometry.position.z = (attributes.positions.z + 1.0) / 2.0 * elevation;
  }

  output.position = project_common_position_to_clipspace(geometry.position);
  var colorValue = sampleColorRange(attributes.instanceColorValues, hexagon.colorDomain.xy);
  if (column.extruded > 0.5) {
    colorValue = vec4<f32>(
      lighting_getLightColor2(
        colorValue.rgb,
        project.cameraPosition,
        geometry.position.xyz,
        geometry.normal
      ),
      colorValue.a
    );
  }
  output.color = vec4<f32>(colorValue.rgb, colorValue.a * layer.opacity);
  return output;
}

@fragment
fn fragmentMain(varyings: Varyings) -> @location(0) vec4<f32> {
  if (picking.isActive > 0.5) {
    if (!picking_isColorValid(varyings.pickingColor)) {
      discard;
    }
    return vec4<f32>(varyings.pickingColor, 1.0);
  }

  var color = varyings.color;
  if (picking.isHighlightActive > 0.5) {
    let highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
    if (picking_isColorZero(abs(varyings.pickingColor - highlightedObjectColor))) {
      let highLightAlpha = picking.highlightColor.a;
      let blendedAlpha = highLightAlpha + color.a * (1.0 - highLightAlpha);
      if (blendedAlpha > 0.0) {
        let highLightRatio = highLightAlpha / blendedAlpha;
        color = vec4<f32>(
          mix(color.rgb, picking.highlightColor.rgb, highLightRatio),
          blendedAlpha
        );
      } else {
        color = vec4<f32>(color.rgb, 0.0);
      }
    }
  }

  return deckgl_premultiplied_alpha(color);
}
`,Ko=Math.PI/3,Ct=2*Math.sin(Ko),At=1.5,Jf=Array.from({length:6},(n,e)=>{const t=e*Ko;return[Math.sin(t),-Math.cos(t)]});function Yt([n,e],t){let i=Math.round(e=e/t/At),o=Math.round(n=n/t/Ct-(i&1)/2);const s=e-i;if(Math.abs(s)*3>1){const r=n-o,a=o+(n<o?-1:1)/2,l=i+(e<i?-1:1),c=n-a,u=e-l;r*r+s*s>c*c+u*u&&(o=a+(i&1?1:-1)/2,i=l)}return[o,i]}const Qf=`
const vec2 DIST = vec2(${Ct}, ${At});

ivec2 pointToHexbin(vec2 p, float radius) {
  p /= radius * DIST;
  float pj = round(p.y);
  float pjm2 = mod(pj, 2.0);
  p.x -= pjm2 * 0.5;
  float pi = round(p.x);
  vec2 d1 = p - vec2(pi, pj);

  if (abs(d1.y) * 3. > 1.) {
    vec2 v2 = step(0.0, d1) - 0.5;
    v2.y *= 2.0;
    vec2 d2 = d1 - v2;
    if (dot(d1, d1) > dot(d2, d2)) {
      pi += v2.x + pjm2 - 0.5;
      pj += v2.y;
    }
  }
  return ivec2(pi, pj);
}
`;function Un([n,e],t){return[(n+(e&1)/2)*t*Ct,e*t*At]}const ed=`
const vec2 DIST = vec2(${Ct}, ${At});

vec2 hexbinCentroid(vec2 binId, float radius) {
  binId.x += fract(binId.y * 0.5);
  return binId * DIST * radius;
}
`,td=`#version 300 es
#define SHADER_NAME hexagon-cell-layer-vertex-shader
in vec3 positions;
in vec3 normals;
in vec2 instancePositions;
in float instanceElevationValues;
in float instanceColorValues;
uniform sampler2D colorRange;
out vec4 vColor;
${ed}
float interp(float value, vec2 domain, vec2 range) {
float r = min(max((value - domain.x) / (domain.y - domain.x), 0.), 1.);
return mix(range.x, range.y, r);
}
vec4 interp(float value, vec2 domain, sampler2D range) {
float r = (value - domain.x) / (domain.y - domain.x);
return texture(range, vec2(r, 0.5));
}
void main(void) {
geometry.pickingColor = picking_getPickingColorFromInstanceID();
if (isnan(instanceColorValues) ||
instanceColorValues < hexagon.colorDomain.z ||
instanceColorValues > hexagon.colorDomain.w ||
instanceElevationValues < hexagon.elevationDomain.z ||
instanceElevationValues > hexagon.elevationDomain.w
) {
gl_Position = vec4(0.);
return;
}
vec2 commonPosition = hexbinCentroid(instancePositions, column.radius) + (hexagon.originCommon - project.commonOrigin.xy);
commonPosition += positions.xy * column.radius * column.coverage;
geometry.position = vec4(commonPosition, 0.0, 1.0);
geometry.normal = project_normal(normals);
float elevation = 0.0;
if (column.extruded) {
elevation = interp(instanceElevationValues, hexagon.elevationDomain.xy, hexagon.elevationRange);
elevation = project_size(elevation);
geometry.position.z = (positions.z + 1.0) / 2.0 * elevation;
}
gl_Position = project_common_position_to_clipspace(geometry.position);
DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
vColor = interp(instanceColorValues, hexagon.colorDomain.xy, colorRange);
vColor.a *= layer.opacity;
if (column.extruded) {
vColor.rgb = lighting_getLightColor(vColor.rgb, project.cameraPosition, geometry.position.xyz, geometry.normal);
}
DECKGL_FILTER_COLOR(vColor, geometry);
}
`,id=`struct HexagonUniforms {
  colorDomain: vec4<f32>,
  elevationDomain: vec4<f32>,
  elevationRange: vec2<f32>,
  originCommon: vec2<f32>,
};

@group(0) @binding(auto) var<uniform> hexagon: HexagonUniforms;
@group(0) @binding(auto) var colorRange: texture_2d<f32>;
@group(0) @binding(auto) var colorRangeSampler: sampler;
`,nd=`layout(std140) uniform hexagonUniforms {
  vec4 colorDomain;
  vec4 elevationDomain;
  vec2 elevationRange;
  vec2 originCommon;
} hexagon;
`,od={name:"hexagon",source:id,vs:nd,uniformTypes:{colorDomain:"vec4<f32>",elevationDomain:"vec4<f32>",elevationRange:"vec2<f32>",originCommon:"vec2<f32>"}};class Xo extends Ei{getShaders(){const e=super.getShaders();return e.modules.push(od),{...e,source:Xf,vs:td}}initializeState(){super.initializeState();const e=this.getAttributeManager();e.remove(["instanceElevations","instanceFillColors","instanceLineColors","instanceStrokeWidths"]),e.addInstanced({instancePositions:{size:2,type:"float32",accessor:"getBin"},instanceColorValues:{size:1,type:"float32",accessor:"getColorValue"},instanceElevationValues:{size:1,type:"float32",accessor:"getElevationValue"}})}updateState(e){super.updateState(e);const{props:t,oldProps:i}=e,o=this.state.fillModel;if(i.colorRange!==t.colorRange){this.state.colorTexture?.destroy(),this.state.colorTexture=$f(this.context.device,t.colorRange,t.colorScaleType);const s={colorRange:this.state.colorTexture};o.shaderInputs.setProps({hexagon:s})}else i.colorScaleType!==t.colorScaleType&&jf(this.state.colorTexture,t.colorScaleType)}finalizeState(e){super.finalizeState(e),this.state.colorTexture?.destroy()}draw({uniforms:e}){const{radius:t,hexOriginCommon:i,elevationRange:o,elevationScale:s,extruded:r,coverage:a,colorDomain:l,elevationDomain:c}=this.props,u=this.props.colorCutoff||[-1/0,1/0],f=this.props.elevationCutoff||[-1/0,1/0],h=this.state.fillModel,g={colorDomain:[Math.max(l[0],u[0]),Math.min(l[1],u[1]),Math.max(l[0]-1,u[0]),Math.min(l[1]+1,u[1])],elevationDomain:[Math.max(c[0],f[0]),Math.min(c[1],f[1]),Math.max(c[0]-1,f[0]),Math.min(c[1]+1,f[1])],elevationRange:[o[0]*s,o[1]*s],originCommon:i};h.shaderInputs.setProps({column:{extruded:r,coverage:a,radius:t},hexagon:g}),h.draw(this.context.renderPass)}}Xo.layerName="HexagonCellLayer";const sd=`layout(std140) uniform binOptionsUniforms {
  vec2 hexOriginCommon;
  float radiusCommon;
} binOptions;
`,rd={name:"binOptions",vs:sd,uniformTypes:{hexOriginCommon:"vec2<f32>",radiusCommon:"f32"}};function Fn(){}const ad={gpuAggregation:!0,colorDomain:null,colorRange:Vf,getColorValue:{type:"accessor",value:null},getColorWeight:{type:"accessor",value:1},colorAggregation:"SUM",lowerPercentile:{type:"number",min:0,max:100,value:0},upperPercentile:{type:"number",min:0,max:100,value:100},colorScaleType:"quantize",onSetColorDomain:Fn,elevationDomain:null,elevationRange:[0,1e3],getElevationValue:{type:"accessor",value:null},getElevationWeight:{type:"accessor",value:1},elevationAggregation:"SUM",elevationScale:{type:"number",min:0,value:1},elevationLowerPercentile:{type:"number",min:0,max:100,value:0},elevationUpperPercentile:{type:"number",min:0,max:100,value:100},elevationScaleType:"linear",onSetElevationDomain:Fn,radius:{type:"number",min:1,value:1e3},coverage:{type:"number",min:0,max:1,value:1},getPosition:{type:"accessor",value:n=>n.position},hexagonAggregator:{type:"function",optional:!0,value:null},extruded:!1,material:!0};class Oi extends Zo{getAggregatorType(){const{gpuAggregation:e,hexagonAggregator:t,getColorValue:i,getElevationValue:o}=this.props;return e&&(t||i||o)?(H.warn("Features not supported by GPU aggregation, falling back to CPU")(),"cpu"):e&&Mn.isSupported(this.context.device)?"gpu":"cpu"}createAggregator(e){if(e==="cpu"){const{hexagonAggregator:t,radius:i}=this.props;return new Tf({dimensions:2,getBin:{sources:["positions"],getValue:({positions:o},s,r)=>{if(t)return t(o,i);const l=this.state.aggregatorViewport.projectPosition(o),{radiusCommon:c,hexOriginCommon:u}=r;return Yt([l[0]-u[0],l[1]-u[1]],c)}},getValue:[{sources:["colorWeights"],getValue:({colorWeights:o})=>o},{sources:["elevationWeights"],getValue:({elevationWeights:o})=>o}]})}return new Mn(this.context.device,{dimensions:2,channelCount:2,bufferLayout:this.getAttributeManager().getBufferLayouts({isInstanced:!1}),...super.getShaders({modules:[_e,rd],vs:`
  in vec3 positions;
  in vec3 positions64Low;
  in float colorWeights;
  in float elevationWeights;
  
  ${Qf}

  void getBin(out ivec2 binId) {
    vec3 positionCommon = project_position(positions, positions64Low);
    binId = pointToHexbin(positionCommon.xy, binOptions.radiusCommon);
  }
  void getValue(out vec2 value) {
    value = vec2(colorWeights, elevationWeights);
  }
  `})})}initializeState(){super.initializeState(),this.getAttributeManager().add({positions:{size:3,accessor:"getPosition",type:"float64",fp64:this.use64bitPositions()},colorWeights:{size:1,accessor:"getColorWeight"},elevationWeights:{size:1,accessor:"getElevationWeight"}})}updateState(e){const t=super.updateState(e),{props:i,oldProps:o,changeFlags:s}=e,{aggregator:r}=this.state;if((s.dataChanged||!this.state.dataAsArray)&&(i.getColorValue||i.getElevationValue)&&(this.state.dataAsArray=Array.from(Lt(i.data).iterable)),t||s.dataChanged||i.radius!==o.radius||i.getColorValue!==o.getColorValue||i.getElevationValue!==o.getElevationValue||i.colorAggregation!==o.colorAggregation||i.elevationAggregation!==o.elevationAggregation){this._updateBinOptions();const{radiusCommon:a,hexOriginCommon:l,binIdRange:c,dataAsArray:u}=this.state;if(r.setProps({binIdRange:c,pointCount:this.getNumInstances(),operations:[i.colorAggregation,i.elevationAggregation],binOptions:{radiusCommon:a,hexOriginCommon:l},onUpdate:this._onAggregationUpdate.bind(this)}),u){const{getColorValue:f,getElevationValue:h}=this.props;r.setProps({customOperations:[f&&(g=>f(g.map(y=>u[y]),{indices:g,data:i.data})),h&&(g=>h(g.map(y=>u[y]),{indices:g,data:i.data}))]})}}return s.updateTriggersChanged&&s.updateTriggersChanged.getColorValue&&r.setNeedsUpdate(0),s.updateTriggersChanged&&s.updateTriggersChanged.getElevationValue&&r.setNeedsUpdate(1),t}_updateBinOptions(){const e=this.getBounds();let t=1,i=[0,0],o=[[0,1],[0,1]],s=this.context.viewport;if(e&&Number.isFinite(e[0][0])){let r=[(e[0][0]+e[1][0])/2,(e[0][1]+e[1][1])/2];const{radius:a}=this.props,{unitsPerMeter:l}=s.getDistanceScales(r);t=l[0]*a;const c=Yt(s.projectFlat(r),t);r=s.unprojectFlat(Un(c,t));const u=s.constructor;s=s.isGeospatial?new u({longitude:r[0],latitude:r[1],zoom:12}):new Ls({position:[r[0],r[1],0],zoom:12}),i=[Math.fround(s.center[0]),Math.fround(s.center[1])],o=Kf({dataBounds:e,getBinId:f=>{const h=s.projectFlat(f);return h[0]-=i[0],h[1]-=i[1],Yt(h,t)},padding:1})}this.setState({radiusCommon:t,hexOriginCommon:i,binIdRange:o,aggregatorViewport:s})}draw(e){e.shaderModuleProps.project&&(e.shaderModuleProps.project.viewport=this.state.aggregatorViewport),super.draw(e)}_onAggregationUpdate({channel:e}){const t=this.getCurrentLayer().props,{aggregator:i}=this.state;if(e===0){const o=i.getResult(0);this.setState({colors:new Dn(o,i.binCount)}),t.onSetColorDomain(i.getResultDomain(0))}else if(e===1){const o=i.getResult(1);this.setState({elevations:new Dn(o,i.binCount)}),t.onSetElevationDomain(i.getResultDomain(1))}}onAttributeChange(e){const{aggregator:t}=this.state;switch(e){case"positions":t.setNeedsUpdate(),this._updateBinOptions();const{radiusCommon:i,hexOriginCommon:o,binIdRange:s}=this.state;t.setProps({binIdRange:s,binOptions:{radiusCommon:i,hexOriginCommon:o}});break;case"colorWeights":t.setNeedsUpdate(0);break;case"elevationWeights":t.setNeedsUpdate(1);break}}renderLayers(){const{aggregator:e,radiusCommon:t,hexOriginCommon:i}=this.state,{elevationScale:o,colorRange:s,elevationRange:r,extruded:a,coverage:l,material:c,transitions:u,colorScaleType:f,lowerPercentile:h,upperPercentile:g,colorDomain:y,elevationScaleType:b,elevationLowerPercentile:w,elevationUpperPercentile:S,elevationDomain:A}=this.props,L=this.getSubLayerClass("cells",Xo),B=e.getBins(),k=this.state.colors?.update({scaleType:f,lowerPercentile:h,upperPercentile:g}),V=this.state.elevations?.update({scaleType:b,lowerPercentile:w,upperPercentile:S});return!k||!V?null:new L(this.getSubLayerProps({id:"cells"}),{data:{length:e.binCount,attributes:{getBin:B,getColorValue:k.attribute,getElevationValue:V.attribute}},dataComparator:(Y,X)=>Y.length===X.length,updateTriggers:{getBin:[B],getColorValue:[k.attribute],getElevationValue:[V.attribute]},diskResolution:6,vertices:Jf,radius:t,hexOriginCommon:i,elevationScale:o,colorRange:s,colorScaleType:f,elevationRange:r,extruded:a,coverage:l,material:c,colorDomain:k.domain||y||e.getResultDomain(0),elevationDomain:V.domain||A||e.getResultDomain(1),colorCutoff:k.cutoff,elevationCutoff:V.cutoff,transitions:u&&{getFillColor:u.getColorValue||u.getColorWeight,getElevation:u.getElevationValue||u.getElevationWeight},extensions:[]})}getPickingInfo(e){const t=e.info,{index:i}=t;if(i>=0){const o=this.state.aggregator.getBin(i);let s;if(o){const r=Un(o.id,this.state.radiusCommon),a=this.context.viewport.unprojectFlat(r);s={col:o.id[0],row:o.id[1],position:a,colorValue:o.value[0],elevationValue:o.value[1],count:o.count},o.pointIndices&&(s.pointIndices=o.pointIndices,s.points=Array.isArray(this.props.data)?o.pointIndices.map(l=>this.props.data[l]):[])}t.object=s}return t}}Oi.layerName="HexagonLayer";Oi.defaultProps=ad;function ld(n,e,t){const i=e.filter(s=>s.tipo===t);if(i.length===0)return[];const o=[];for(const s of n){if(s.pob<=0)continue;let r=null,a=1/0;for(const l of i){const c=zn(s.centro[0],s.centro[1],l.lon,l.lat);c<a&&(a=c,r=l)}r&&o.push({barrio:s.nombre,poblacion:s.pob,origen:s.centro,destino:[r.lon,r.lat],equipamiento:r.nombre||"Sin nombre",distancia:a})}return o.sort((s,r)=>r.poblacion-s.poblacion).slice(0,es)}function cd(n,e){const t=rs(),i=as();return new Si({id:"deck-puntos",data:n,getPosition:o=>[o.lon,o.lat],getFillColor:o=>e==="frescura"?i[o.frescura]:t[o.categoria],getRadius:6,radiusUnits:"pixels",radiusMinPixels:3,radiusMaxPixels:14,stroked:!0,getLineColor:[255,255,255,180],lineWidthMinPixels:1,pickable:!0,updateTriggers:{getFillColor:[e]}})}function Jo(n,e,t){const i=()=>n.filter(o=>o.frescura==="sin_verificar"||o.frescura==="vencido");return t==="equipamientos"?e:t==="pendientes"?i():t==="ambos"?[...n,...e]:n}function ud(n,e,t,i,o){const s=Jo(n,e,i);return new Oi({id:"deck-densidad",data:s,getPosition:r=>[r.lon,r.lat],radius:t,extruded:o,elevationRange:[0,is],elevationScale:o?1:0,colorRange:Ke.map(r=>[r[0],r[1],r[2]]),opacity:.85,coverage:.92,pickable:!0,updateTriggers:{getPosition:[i]}})}function fd(n){const e=ns(),t=os(),i=ss(),o=Math.max(1,...n.map(s=>s.poblacion));return new wi({id:"deck-flujos",data:n,getSourcePosition:s=>s.origen,getTargetPosition:s=>s.destino,getSourceColor:s=>s.distancia>at?i:e,getTargetColor:s=>s.distancia>at?i:t,getWidth:s=>1+s.poblacion/o*9,widthUnits:"pixels",getHeight:.4,pickable:!0,updateTriggers:{getWidth:[o],getSourceColor:[n.length]}})}function dd(n,e,t){const i=e.filter(s=>s.tipo===t),o=[];for(const s of n){let r=null;for(const a of i){const l=zn(s.centro[0],s.centro[1],a.lon,a.lat);(r===null||l<r)&&(r=l)}for(const a of s.poligonos)o.push({nombre:s.nombre,anillos:a,poblacion:s.pob,viviendas:s.viv,areaHa:s.areaHa,distancia:r,servicios:s.pob>0?s.pobServB/s.pob:0})}return o}function kn(n,e){return e==="viviendas"?n.viviendas:e==="densidad"?n.areaHa>0?n.poblacion/n.areaHa:0:n.poblacion}function hd(n,e,t,i){const o=Math.max(1,...n.map(r=>kn(r,e))),s=r=>{if(t==="servicios"){const c=Math.min(5,Math.floor((1-r.servicios)*6));return Ke[c]}const a=r.distancia;if(a===null)return Ke[5];const l=a<250?0:a<500?1:a<750?2:a<1e3?3:4;return Ke[l+1]};return new Bi({id:"deck-barrios",data:n,getPolygon:r=>r.anillos,extruded:i,getElevation:r=>kn(r,e)/o*ts,getFillColor:s,getLineColor:[255,255,255,120],lineWidthMinPixels:1,stroked:!0,filled:!0,wireframe:!1,opacity:.85,pickable:!0,updateTriggers:{getElevation:[e,o,i],getFillColor:[t]}})}function gd(n){const e=n.map(i=>i.distancia).sort((i,o)=>i-o),t=new Map;for(const i of n){const o=t.get(i.equipamiento)??{nombre:i.equipamiento,barrios:0,poblacion:0};o.barrios++,o.poblacion+=i.poblacion,t.set(i.equipamiento,o)}return{poblacion:n.reduce((i,o)=>i+o.poblacion,0),lejos:n.filter(i=>i.distancia>at).length,poblacionLejos:n.filter(i=>i.distancia>at).reduce((i,o)=>i+o.poblacion,0),mediana:e.length?e[Math.floor((e.length-1)/2)]:null,porEquipamiento:[...t.values()].sort((i,o)=>o.poblacion-i.poblacion)}}function pd(n){const e=new Map;for(const t of n)e.set(t.categoria,(e.get(t.categoria)??0)+1);return[...e.entries()].map(([t,i])=>({clave:t,n:i})).sort((t,i)=>i.n-t.n)}const _d=Object.freeze(Object.defineProperty({__proto__:null,asignar:ld,capaBarrios:hd,capaDensidad:ud,capaFlujos:fd,capaPuntos:cd,datosDensidad:Jo,piezasDeBarrios:dd,resumenFlujos:gd,resumenPuntos:pd},Symbol.toStringTag,{value:"Module"}));export{Ha as A,ge as B,vi as C,F as G,j as M,El as a,Se as b,si as c,Ll as d,Sl as e,vd as f,ce as g,Cl as h,Vl as i,_d as j,Ol as r};

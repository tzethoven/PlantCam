const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["favicon.svg"]),
	mimeTypes: {".svg":"image/svg+xml"},
	_: {
		client: {start:"_app/immutable/entry/start.a65I3Dq6.js",app:"_app/immutable/entry/app.B2sshFRV.js",imports:["_app/immutable/entry/start.a65I3Dq6.js","_app/immutable/chunks/CmAfY6ra.js","_app/immutable/chunks/CAZe_J1D.js","_app/immutable/chunks/Cq4Xyxph.js","_app/immutable/chunks/CVcRNK37.js","_app/immutable/entry/app.B2sshFRV.js","_app/immutable/chunks/Cq4Xyxph.js","_app/immutable/chunks/CAZe_J1D.js","_app/immutable/chunks/CVcRNK37.js","_app/immutable/chunks/NZTpNUN0.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./chunks/0-Z5QQZPk_.js')),
			__memo(() => import('./chunks/1-CDWM8Pri.js')),
			__memo(() => import('./chunks/2-CCdpLeUe.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api/water/toggle",
				pattern: /^\/api\/water\/toggle\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./chunks/_server.ts-uF_sPlOA.js'))
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();

const prerendered = new Set([]);

const base = "";

export { base, manifest, prerendered };
//# sourceMappingURL=manifest.js.map

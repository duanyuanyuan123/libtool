###
```
libTool
├─ .git
│  ├─ COMMIT_EDITMSG
│  ├─ config
│  ├─ description
│  ├─ HEAD
│  ├─ hooks
│  │  ├─ applypatch-msg.sample
│  │  ├─ commit-msg.sample
│  │  ├─ fsmonitor-watchman.sample
│  │  ├─ post-update.sample
│  │  ├─ pre-applypatch.sample
│  │  ├─ pre-commit.sample
│  │  ├─ pre-merge-commit.sample
│  │  ├─ pre-push.sample
│  │  ├─ pre-rebase.sample
│  │  ├─ pre-receive.sample
│  │  ├─ prepare-commit-msg.sample
│  │  ├─ push-to-checkout.sample
│  │  └─ update.sample
│  ├─ index
│  ├─ info
│  │  └─ exclude
│  ├─ logs
│  │  ├─ HEAD
│  │  └─ refs
│  │     └─ heads
│  │        └─ master
├─ .gitignore
├─ package.json
├─ packages
│  ├─ core
│  │  ├─ package.json
│  │  └─ src
│  │     ├─ core.ts
│  │     └─ index.ts
│  ├─ doc
│  │  ├─ package.json
│  │  └─ src
│  │     ├─ doc.ts
│  │     └─ index.ts
│  ├─ libtool
│  │  ├─ example
│  │  │  ├─ html
│  │  │  │  └─ index.html
│  │  │  ├─ js
│  │  │  └─ static
│  │  ├─ package.json
│  │  └─ src
│  │     └─ index.ts
│  ├─ postil
│  │  ├─ index.js
│  │  ├─ package.json
│  │  ├─ README.md
│  │  └─ src
│  │     ├─ index.ts
│  │     └─ postil.ts
│  ├─ protobuf
│  │  ├─ index.js
│  │  ├─ package.json
│  │  ├─ README.md
│  │  └─ src
│  │     ├─ index.ts
│  │     └─ protobuf.ts
│  ├─ webaudio
│  │  ├─ package.json
│  │  └─ src
│  │     ├─ index.ts
│  │     └─ webaudio.ts
│  └─ webcodec
│     ├─ index.js
│     ├─ package.json
│     ├─ README.md
│     └─ src
│        ├─ index.ts
│        └─ webcodec.ts
├─ pnpm-lock.yaml
├─ pnpm-workspace.yaml
├─ README.md
├─ rollup.config.js
├─ scripts
│  ├─ build.js
│  ├─ dev.js
│  └─ utils.js
└─ tsconfig.json

```
### 开发环境： npm run dev
### 生产环境   npm run build --format global
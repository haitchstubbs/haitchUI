"use client";

import * as React from "react";

/**
 * ObservabilityOverlay
 * - Click the badge to expand a panel
 * - Shows runtime stats (memory where available, long tasks, event-loop lag, basic nav)
 * - Shows React Profiler timings for wrapped subtrees
 * - Shows mount stack traces for components that opt-in via `useMountTrace` / `withMountTrace`
 *
 * Usage:
 * <ObservabilityRoot enabled>
 *   <ObsProfiler id="App">
 *     <App />
 *   </ObsProfiler>
 * </ObservabilityRoot>
 */

type LongTaskEntry = {
	name: string;
	startTime: number;
	duration: number;
};

type MemorySample = {
	ts: number;
	usedJSHeapSize?: number;
	totalJSHeapSize?: number;
	jsHeapSizeLimit?: number;
};

type ReactProfilerSample = {
	id: string;
	phase: "mount" | "update" | "nested-update";
	actualDuration: number; // time spent rendering the committed update
	baseDuration: number; // estimated time to render the entire subtree without memoization
	startTime: number;
	commitTime: number;
	ts: number;
};

type MountTrace = {
	name: string;
	ts: number;
	stack?: string;
};

type MountedNode = {
	key: string;
	name: string;
	mountedAt: number;
	trace?: string;
};

type Store = {
	enabled: boolean;
	version: number;
	bump(): void;

	// runtime
	memory: MemorySample[];
	longTasks: LongTaskEntry[];
	eventLoopLagMs: number;
	fps: number;

	profiler: ReactProfilerSample[];
	mounted: Map<string, MountedNode>;

	pushMemory(sample: MemorySample): void;
	pushLongTask(entry: LongTaskEntry): void;
	setEventLoopLag(ms: number): void;
	setFps(fps: number): void;
	pushProfiler(sample: ReactProfilerSample): void;
	registerMount(node: MountedNode): void;
	unregisterMount(key: string): void;
	clear(): void;
};

function createStore(enabled: boolean): Store {
	return {
		enabled,
		version: 0,
		bump() {
			this.version++;
		},

		memory: [],
		longTasks: [],
		eventLoopLagMs: 0,
		fps: 0,

		profiler: [],
		mounted: new Map(),

		pushMemory(sample) {
			if (!this.enabled) return;
			this.memory.push(sample);
			if (this.memory.length > 120) this.memory.splice(0, this.memory.length - 120);
			this.bump();
		},
		pushLongTask(entry) {
			if (!this.enabled) return;
			this.longTasks.push(entry);
			if (this.longTasks.length > 200) this.longTasks.splice(0, this.longTasks.length - 200);
			this.bump();
		},
		setEventLoopLag(ms) {
			if (!this.enabled) return;
			if (this.eventLoopLagMs === ms) return; // avoid pointless bumps
			this.eventLoopLagMs = ms;
			this.bump();
		},
		setFps(fps) {
			if (!this.enabled) return;
			if (this.fps === fps) return;
			this.fps = fps;
			this.bump();
		},
		pushProfiler(sample) {
			if (!this.enabled) return;
			this.profiler.push(sample);
			if (this.profiler.length > 1000) this.profiler.splice(0, this.profiler.length - 1000);
			this.bump();
		},
		registerMount(node) {
			if (!this.enabled) return;
			this.mounted.set(node.key, node);
			this.bump();
		},
		unregisterMount(key) {
			if (!this.enabled) return;
			if (!this.mounted.has(key)) return;
			this.mounted.delete(key);
			this.bump();
		},
		clear() {
			this.memory = [];
			this.longTasks = [];
			this.profiler = [];
			this.mounted.clear();
			this.eventLoopLagMs = 0;
			this.fps = 0;
			this.bump();
		},
	};
}

// ---- store context with manual subscription (cheap re-renders) ----

type StoreSnapshot = {
	enabled: boolean;
	memoryLast?: MemorySample;
	longTasksLast?: LongTaskEntry;
	eventLoopLagMs: number;
	fps: number;

	profiler: ReactProfilerSample[];
	mounted: MountedNode[];
};

type StoreApi = {
	store: Store;
	subscribe(cb: () => void): () => void;
	getSnapshot(): StoreSnapshot;
	getServerSnapshot(): StoreSnapshot;
	notify(): void;
};

const SERVER_SNAPSHOT: StoreSnapshot = {
	enabled: false,
	memoryLast: undefined,
	longTasksLast: undefined,
	eventLoopLagMs: 0,
	fps: 0,
	profiler: [],
	mounted: [],
};

const ObservabilityContext = React.createContext<StoreApi | null>(null);

function useStoreApi() {
	const ctx = React.useContext(ObservabilityContext);
	if (!ctx) throw new Error("ObservabilityRoot missing");
	return ctx;
}

function useStoreSnapshot(): StoreSnapshot {
	const api = useStoreApi();
	return React.useSyncExternalStore(api.subscribe, api.getSnapshot, api.getServerSnapshot);
}

// ---- public root ----

export function ObservabilityRoot({ enabled = true, children }: { enabled?: boolean; children: React.ReactNode }) {
	const cachedVersionRef = React.useRef<number>(-1);
	const cachedSnapshotRef = React.useRef<StoreSnapshot>(SERVER_SNAPSHOT);
	const storeRef = React.useRef<Store | null>(null);
	const listenersRef = React.useRef(new Set<() => void>());
	const snapshotRef = React.useRef<StoreSnapshot | null>(null);
	if (!storeRef.current) storeRef.current = createStore(enabled);
	// keep enabled in sync
	storeRef.current.enabled = enabled;

	const notify = React.useCallback(() => {
		for (const cb of listenersRef.current) cb();
	}, []);

	const api = React.useMemo<StoreApi>(() => {
		const subscribe = (cb: () => void) => {
			listenersRef.current.add(cb);
			return () => listenersRef.current.delete(cb);
		};

		const getSnapshot = (): StoreSnapshot => {
			const s = storeRef.current!;
			const v = s.version;

			// IMPORTANT: return identical object reference if unchanged
			if (cachedVersionRef.current === v) {
				return cachedSnapshotRef.current;
			}

			const next: StoreSnapshot = {
				enabled: s.enabled,
				memoryLast: s.memory[s.memory.length - 1],
				longTasksLast: s.longTasks[s.longTasks.length - 1],
				eventLoopLagMs: s.eventLoopLagMs,
				fps: s.fps,
				profiler: s.profiler, // same array reference (we mutate + bump)
				mounted: Array.from(s.mounted.values()).sort((a, b) => b.mountedAt - a.mountedAt),
			};

			cachedVersionRef.current = v;
			cachedSnapshotRef.current = next;
			snapshotRef.current = next; // if you still want this
			return next;
		};

		const getServerSnapshot = () => SERVER_SNAPSHOT;

		return { store: storeRef.current!, subscribe, getSnapshot, getServerSnapshot, notify };
	}, [notify]);

	// ---- runtime probes ----
	React.useEffect(() => {
		if (!enabled) return;

		const store = storeRef.current!;
		let memTimer: number | null = null;

		// memory (Chromium only)
		memTimer = window.setInterval(() => {
			const perfAny = performance as any;
			const mem = perfAny?.memory as { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } | undefined;

			store.pushMemory({
				ts: Date.now(),
				usedJSHeapSize: mem?.usedJSHeapSize,
				totalJSHeapSize: mem?.totalJSHeapSize,
				jsHeapSizeLimit: mem?.jsHeapSizeLimit,
			});
			notify();
		}, 1000);

		return () => {
			if (memTimer) window.clearInterval(memTimer);
		};
	}, [enabled, notify]);

	React.useEffect(() => {
		if (!enabled) return;

		const store = storeRef.current!;
		let observer: PerformanceObserver | null = null;

		// long tasks
		try {
			observer = new PerformanceObserver((list) => {
				for (const entry of list.getEntries()) {
					const e = entry as PerformanceEntry;
					store.pushLongTask({
						name: e.name || "longtask",
						startTime: e.startTime,
						duration: e.duration,
					});
				}
				notify();
			});

			observer.observe({ entryTypes: ["longtask"] as any });
		} catch {
			// not supported
		}

		return () => observer?.disconnect();
	}, [enabled, notify]);

	React.useEffect(() => {
		if (!enabled) return;

		const store = storeRef.current!;
		// event loop lag via setInterval drift
		let last = performance.now();
		const interval = 250;
		const handle = window.setInterval(() => {
			const now = performance.now();
			const drift = now - last - interval;
			last = now;
			store.setEventLoopLag(Math.max(0, drift));
			notify();
		}, interval);

		return () => window.clearInterval(handle);
	}, [enabled, notify]);

	React.useEffect(() => {
		if (!enabled) return;

		const store = storeRef.current!;
		// FPS-ish via RAF count
		let raf = 0;
		let frames = 0;
		let last = performance.now();

		const tick = (t: number) => {
			frames++;
			const dt = t - last;
			if (dt >= 1000) {
				store.setFps(Math.round((frames * 1000) / dt));
				frames = 0;
				last = t;
				notify();
			}
			raf = requestAnimationFrame(tick);
		};

		raf = requestAnimationFrame(tick);
		return () => cancelAnimationFrame(raf);
	}, [enabled, notify]);

	return (
		<ObservabilityContext.Provider value={api}>
			{children}
			{enabled ? <ObservabilityOverlay /> : null}
		</ObservabilityContext.Provider>
	);
}

// ---- react profiler wrapper ----

export function ObsProfiler({ id, children }: { id: string; children: React.ReactNode }) {
	const api = useStoreApi();

	const onRender = React.useCallback<React.ProfilerOnRenderCallback>(
		(profilerId, phase, actualDuration, baseDuration, startTime, commitTime) => {
			api.store.pushProfiler({
				id: profilerId,
				phase,
				actualDuration,
				baseDuration,
				startTime,
				commitTime,
				ts: Date.now(),
			});
			api.notify();
		},
		[api]
	);

	return (
		<React.Profiler id={id} onRender={onRender}>
			{children}
		</React.Profiler>
	);
}

// ---- mount trace (opt-in) ----

function safeStack(skipLines = 0): string | undefined {
	try {
		const err = new Error("mount");
		const stack = err.stack;
		if (!stack) return undefined;
		const lines = stack.split("\n");
		// Drop first line ("Error: mount") + caller frames
		return lines
			.slice(1 + skipLines)
			.join("\n")
			.trim();
	} catch {
		return undefined;
	}
}

let globalMountId = 0;

export function useMountTrace(name: string, opts?: { captureStack?: boolean }) {
	const api = useStoreApi();
	const keyRef = React.useRef<string | null>(null);

	if (!keyRef.current) {
		globalMountId++;
		keyRef.current = `${name}:${globalMountId}`;
	}

	React.useEffect(() => {
		const key = keyRef.current!;
		const trace = opts?.captureStack === false ? undefined : safeStack(2);

		api.store.registerMount({
			key,
			name,
			mountedAt: Date.now(),
			trace,
		});

		return () => api.store.unregisterMount(key);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [name]);
}

export function withMountTrace<T extends React.ComponentType<any>>(Component: T, name: string, opts?: { captureStack?: boolean }) {
	type P = React.ComponentProps<T>;

	const Wrapped = (props: P) => {
		useMountTrace(name, opts);
		return React.createElement(Component, props);
	};

	Wrapped.displayName = `withMountTrace(${name})`;
	return Wrapped;
}
// ---- overlay UI ----

function formatBytes(n?: number) {
	if (n == null) return "—";
	const units = ["B", "KB", "MB", "GB"];
	let v = n;
	let i = 0;
	while (v >= 1024 && i < units.length - 1) {
		v /= 1024;
		i++;
	}
	return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

function ms(n: number) {
	return `${n.toFixed(1)}ms`;
}

function ObservabilityOverlay() {
	const snap = useStoreSnapshot();
	const api = useStoreApi();

	const [open, setOpen] = React.useState(false);
	const [tab, setTab] = React.useState<"overview" | "react" | "mounts">("overview");
	const [filter, setFilter] = React.useState("");

	const mem = snap.memoryLast;
	const used = mem?.usedJSHeapSize;
	const limit = mem?.jsHeapSizeLimit;

	const lastLong = snap.longTasksLast;
	const longTaskText = lastLong && lastLong.duration >= 50 ? `${ms(lastLong.duration)} @ ${ms(lastLong.startTime)}` : "—";

	const filteredProfiler = React.useMemo(() => {
		const q = filter.trim().toLowerCase();
		const rows = snap.profiler.slice(-500); // recent window
		if (!q) return rows;
		return rows.filter((r) => r.id.toLowerCase().includes(q));
	}, [snap.profiler, filter]);

	const profilerAgg = React.useMemo(() => {
		// aggregate by id
		const map = new Map<string, { id: string; commits: number; totalActual: number; maxActual: number; lastTs: number }>();

		for (const r of filteredProfiler) {
			const cur = map.get(r.id) ?? {
				id: r.id,
				commits: 0,
				totalActual: 0,
				maxActual: 0,
				lastTs: 0,
			};
			cur.commits += 1;
			cur.totalActual += r.actualDuration;
			cur.maxActual = Math.max(cur.maxActual, r.actualDuration);
			cur.lastTs = Math.max(cur.lastTs, r.ts);
			map.set(r.id, cur);
		}

		return Array.from(map.values()).sort((a, b) => b.totalActual - a.totalActual);
	}, [filteredProfiler]);

	const filteredMounts = React.useMemo(() => {
		const q = filter.trim().toLowerCase();
		const rows = snap.mounted;
		if (!q) return rows;
		return rows.filter((m) => m.name.toLowerCase().includes(q));
	}, [snap.mounted, filter]);

	return (
		<div
			style={{
				position: "fixed",
				zIndex: 2147483647,
				right: 12,
				bottom: 12,
				fontFamily: 'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji","Segoe UI Emoji"',
			}}
		>
			{/* badge */}
			<button
				type="button"
				onClick={() => setOpen((v) => !v)}
				style={{
					display: "flex",
					alignItems: "center",
					gap: 10,
					borderRadius: 12,
					border: "1px solid rgba(255,255,255,0.12)",
					background: "rgba(0,0,0,0.72)",
					color: "white",
					padding: "10px 12px",
					boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
					cursor: "pointer",
					userSelect: "none",
				}}
				aria-expanded={open}
				title="Observability overlay"
			>
				<span style={{ fontWeight: 700, letterSpacing: 0.2 }}>OBS</span>
				<span style={{ opacity: 0.9 }}>
					{formatBytes(used)} {limit ? ` / ${formatBytes(limit)}` : ""}
				</span>
				<span style={{ opacity: 0.85 }}>FPS {snap.fps || "—"}</span>
				<span style={{ opacity: 0.85 }}>Lag {ms(snap.eventLoopLagMs)}</span>
				<span style={{ opacity: 0.85 }}>LT {longTaskText}</span>
			</button>

			{/* panel */}
			{open ? (
				<div
					style={{
						marginTop: 10,
						width: 560,
						maxWidth: "calc(100vw - 24px)",
						maxHeight: "min(70vh, 720px)",
						overflow: "hidden",
						borderRadius: 16,
						border: "1px solid rgba(255,255,255,0.12)",
						background: "rgba(0,0,0,0.82)",
						color: "white",
						boxShadow: "0 14px 48px rgba(0,0,0,0.45)",
					}}
				>
					<div style={{ display: "flex", alignItems: "center", gap: 8, padding: 10 }}>
						<TabButton active={tab === "overview"} onClick={() => setTab("overview")}>
							Overview
						</TabButton>
						<TabButton active={tab === "react"} onClick={() => setTab("react")}>
							React
						</TabButton>
						<TabButton active={tab === "mounts"} onClick={() => setTab("mounts")}>
							Mounts
						</TabButton>

						<div style={{ flex: 1 }} />

						<input
							value={filter}
							onChange={(e) => setFilter(e.target.value)}
							placeholder="Filter…"
							style={{
								width: 180,
								borderRadius: 10,
								border: "1px solid rgba(255,255,255,0.16)",
								background: "rgba(255,255,255,0.06)",
								color: "white",
								padding: "8px 10px",
								outline: "none",
							}}
						/>

						<button
							type="button"
							onClick={() => {
								api.store.clear();
							}}
							style={{
								borderRadius: 10,
								border: "1px solid rgba(255,255,255,0.16)",
								background: "rgba(255,255,255,0.06)",
								color: "white",
								padding: "8px 10px",
								cursor: "pointer",
							}}
						>
							Clear
						</button>
					</div>

					<div
						style={{
							borderTop: "1px solid rgba(255,255,255,0.10)",
							padding: 10,
							overflow: "auto",
							maxHeight: "min(70vh, 720px)",
						}}
					>
						{tab === "overview" ? (
							<OverviewView snap={snap} />
						) : tab === "react" ? (
							<ReactView agg={profilerAgg} samples={filteredProfiler} />
						) : (
							<MountsView mounts={filteredMounts} />
						)}
					</div>
				</div>
			) : null}
		</div>
	);
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
	return (
		<button
			type="button"
			onClick={onClick}
			style={{
				borderRadius: 10,
				border: "1px solid rgba(255,255,255,0.16)",
				background: active ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)",
				color: "white",
				padding: "8px 10px",
				cursor: "pointer",
			}}
		>
			{children}
		</button>
	);
}

function OverviewView({ snap }: { snap: StoreSnapshot }) {
	const mem = snap.memoryLast;
	const used = mem?.usedJSHeapSize;
	const total = mem?.totalJSHeapSize;
	const limit = mem?.jsHeapSizeLimit;

	const memSupported = used != null;

	return (
		<div style={{ display: "grid", gap: 10 }}>
			<Card title="Runtime">
				<Row label="FPS" value={snap.fps ? String(snap.fps) : "—"} />
				<Row label="Event loop lag" value={ms(snap.eventLoopLagMs)} />
				<Row label="Long tasks" value={snap.longTasksLast ? ms(snap.longTasksLast.duration) : "—"} />
			</Card>

			<Card title="Memory (JS heap)">
				{!memSupported ? (
					<div style={{ opacity: 0.8, lineHeight: 1.35 }}>
						Not available in this browser. (Chromium exposes <code style={{ opacity: 0.9 }}>performance.memory</code>
						in many contexts; Safari/Firefox usually don’t.)
					</div>
				) : (
					<>
						<Row label="Used" value={formatBytes(used)} />
						<Row label="Total" value={formatBytes(total)} />
						<Row label="Limit" value={formatBytes(limit)} />
					</>
				)}
			</Card>

			<Card title="React & Mount coverage">
				<div style={{ opacity: 0.9, lineHeight: 1.4 }}>
					React timings appear for subtrees wrapped in <code>ObsProfiler</code>. Mount stacks appear for components that call{" "}
					<code>useMountTrace</code> (or use <code>withMountTrace</code>).
				</div>
			</Card>
		</div>
	);
}

function ReactView({
	agg,
	samples,
}: {
	agg: { id: string; commits: number; totalActual: number; maxActual: number; lastTs: number }[];
	samples: ReactProfilerSample[];
}) {
	return (
		<div style={{ display: "grid", gap: 10 }}>
			<Card title="Aggregated (recent window)">
				{agg.length === 0 ? (
					<div style={{ opacity: 0.85 }}>No profiler samples yet. Wrap some subtrees in &lt;ObsProfiler id="..."&gt;.</div>
				) : (
					<div style={{ display: "grid", gap: 6 }}>
						{agg.slice(0, 30).map((a) => (
							<div
								key={a.id}
								style={{
									display: "grid",
									gridTemplateColumns: "1fr auto auto auto",
									gap: 10,
									padding: "8px 10px",
									borderRadius: 12,
									background: "rgba(255,255,255,0.06)",
									border: "1px solid rgba(255,255,255,0.10)",
								}}
							>
								<div style={{ fontWeight: 650 }}>{a.id}</div>
								<div style={{ opacity: 0.9 }}>commits {a.commits}</div>
								<div style={{ opacity: 0.9 }}>total {ms(a.totalActual)}</div>
								<div style={{ opacity: 0.9 }}>max {ms(a.maxActual)}</div>
							</div>
						))}
					</div>
				)}
			</Card>

			<Card title={`Raw samples (${samples.length} shown)`}>
				<div style={{ display: "grid", gap: 6 }}>
					{samples
						.slice(-40)
						.reverse()
						.map((s, idx) => (
							<div
								key={`${s.ts}:${idx}`}
								style={{
									display: "grid",
									gridTemplateColumns: "1fr auto auto",
									gap: 10,
									padding: "8px 10px",
									borderRadius: 12,
									background: "rgba(255,255,255,0.04)",
									border: "1px solid rgba(255,255,255,0.08)",
								}}
							>
								<div style={{ fontWeight: 600 }}>
									{s.id} <span style={{ opacity: 0.75, fontWeight: 500 }}>({s.phase})</span>
								</div>
								<div style={{ opacity: 0.9 }}>actual {ms(s.actualDuration)}</div>
								<div style={{ opacity: 0.9 }}>base {ms(s.baseDuration)}</div>
							</div>
						))}
				</div>
			</Card>
		</div>
	);
}

function MountsView({ mounts }: { mounts: MountedNode[] }) {
	const [selectedKey, setSelectedKey] = React.useState<string | null>(mounts[0]?.key ?? null);

	React.useEffect(() => {
		if (selectedKey && mounts.some((m) => m.key === selectedKey)) return;
		setSelectedKey(mounts[0]?.key ?? null);
	}, [mounts, selectedKey]);

	const selected = mounts.find((m) => m.key === selectedKey) ?? null;

	return (
		<div
			style={{
				display: "grid",
				gridTemplateColumns: "1fr 1.2fr",
				gap: 10,
				alignItems: "start",
			}}
		>
			<Card title={`Mounted components (${mounts.length})`}>
				{mounts.length === 0 ? (
					<div style={{ opacity: 0.85 }}>
						No mount traces yet. Add <code>useMountTrace("MyComponent")</code> to components you want stacks for.
					</div>
				) : (
					<div style={{ display: "grid", gap: 6 }}>
						{mounts.slice(0, 80).map((m) => (
							<button
								key={m.key}
								type="button"
								onClick={() => setSelectedKey(m.key)}
								style={{
									textAlign: "left",
									borderRadius: 12,
									border: "1px solid rgba(255,255,255,0.10)",
									background: m.key === selectedKey ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.06)",
									color: "white",
									padding: "8px 10px",
									cursor: "pointer",
								}}
							>
								<div style={{ fontWeight: 650 }}>{m.name}</div>
								<div style={{ opacity: 0.8, fontSize: 12 }}>{new Date(m.mountedAt).toLocaleTimeString()}</div>
							</button>
						))}
					</div>
				)}
			</Card>

			<Card title="Stack trace">
				{!selected ? (
					<div style={{ opacity: 0.85 }}>Select a component to view its mount stack trace.</div>
				) : selected.trace ? (
					<pre
						style={{
							margin: 0,
							whiteSpace: "pre-wrap",
							wordBreak: "break-word",
							fontSize: 12,
							lineHeight: 1.35,
							opacity: 0.95,
						}}
					>
						{selected.trace}
					</pre>
				) : (
					<div style={{ opacity: 0.85 }}>No stack captured for this component.</div>
				)}
			</Card>
		</div>
	);
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<div
			style={{
				borderRadius: 16,
				border: "1px solid rgba(255,255,255,0.10)",
				background: "rgba(255,255,255,0.04)",
				padding: 12,
			}}
		>
			<div style={{ fontWeight: 750, marginBottom: 10 }}>{title}</div>
			{children}
		</div>
	);
}

function Row({ label, value }: { label: string; value: string }) {
	return (
		<div style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "4px 0" }}>
			<div style={{ opacity: 0.85 }}>{label}</div>
			<div style={{ fontWeight: 650 }}>{value}</div>
		</div>
	);
}

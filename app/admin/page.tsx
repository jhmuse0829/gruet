"use client";

import { FormEvent, useMemo, useState } from "react";
import { members } from "../../data/members";
import { adminSignIn, fetchResponses } from "../../lib/supabase";

type ResponseRow = { member_id: string; goal: string; success_metric: string; current_state: string; current_actions: string; weekly_actions: string; next_action: string; obstacle: string; support_needed: string; updated_at: string; };

export default function AdminPage() {
  const [rows, setRows] = useState<ResponseRow[] | null>(null);
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [query, setQuery] = useState(""); const [filter, setFilter] = useState<"all" | "done" | "waiting">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);

  async function login(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError("");
    try { const session = await adminSignIn(email, password); setRows(await fetchResponses(session.access_token)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "로그인하지 못했습니다."); }
    finally { setLoading(false); }
  }

  const responseMap = useMemo(() => new Map((rows ?? []).map((row) => [row.member_id, row])), [rows]);
  const list = members.filter((member) => {
    const matchesQuery = member.name.toLowerCase().includes(query.toLowerCase()); const done = responseMap.has(member.id);
    return matchesQuery && (filter === "all" || (filter === "done" ? done : !done));
  });
  const selected = selectedId ? responseMap.get(selectedId) : undefined;

  if (!rows) return <main className="admin-login"><section><a href="/" className="back-link">← 설문으로 돌아가기</a><div className="brand-mark large">돈</div><p className="eyebrow">돈그릇 운영자</p><h1>목표 관리 대시보드</h1><p>운영자 계정으로 로그인해 구성원의 목표와 응답 현황을 확인하세요.</p><form onSubmit={login}><label>이메일<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@example.com" /></label><label>비밀번호<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></label>{error && <p className="error-message">{error}</p>}<button className="primary-button" disabled={loading}>{loading ? "확인 중…" : "운영자 로그인"}</button></form></section></main>;

  const completed = rows.length; const rate = Math.round((completed / members.length) * 100);
  return <main className="dashboard"><aside><div className="side-brand"><div className="brand-mark">돈</div><div><strong>돈그릇</strong><span>운영자 센터</span></div></div><nav><button className="active">▦ 응답 현황</button><a href="/">↗ 구성원 설문</a></nav><div className="side-note">12월까지 함께<br />꾸준히, 구체적으로.</div></aside><section className="dashboard-main"><header><div><p className="eyebrow">12월 목표 프로젝트</p><h1>응답 현황</h1></div><div className="date-chip">총 {members.length}명</div></header><div className="stats"><article><span>전체 구성원</span><strong>{members.length}<small>명</small></strong></article><article className="green"><span>응답 완료</span><strong>{completed}<small>명</small></strong></article><article className="orange"><span>미응답</span><strong>{members.length - completed}<small>명</small></strong></article><article className="navy"><span>제출률</span><strong>{rate}<small>%</small></strong></article></div><section className="response-panel"><div className="toolbar"><div className="filter-tabs"><button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>전체</button><button className={filter === "done" ? "active" : ""} onClick={() => setFilter("done")}>응답 완료</button><button className={filter === "waiting" ? "active" : ""} onClick={() => setFilter("waiting")}>미응답</button></div><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="이름 검색" /></div><div className="response-list">{list.map((member) => { const row = responseMap.get(member.id); return <button key={member.id} onClick={() => row && setSelectedId(member.id)} className={row ? "response-row done" : "response-row"}><span className="avatar">{member.name.slice(0, 1)}</span><strong>{member.name}</strong><span className="goal-preview">{row?.goal ?? "아직 목표를 작성하지 않았어요"}</span><span className="status">{row ? "응답 완료" : "미응답"}</span><time>{row ? new Date(row.updated_at).toLocaleDateString("ko-KR") : "—"}</time><i>›</i></button>; })}</div></section></section>{selected && <div className="modal-backdrop" onClick={() => setSelectedId(null)}><article className="detail-modal" onClick={(e) => e.stopPropagation()}><button className="modal-close" onClick={() => setSelectedId(null)}>×</button><p className="eyebrow">구성원 목표 상세</p><h2>{members.find((m) => m.id === selected.member_id)?.name}</h2><Detail title="12월 최종 목표" text={selected.goal} /><Detail title="성공 기준" text={selected.success_metric} /><Detail title="현재 상태" text={selected.current_state} /><Detail title="현재 하고 있는 행동" text={selected.current_actions} /><Detail title="매주 반복할 행동" text={selected.weekly_actions} /><Detail title="이번 주 핵심 행동" text={selected.next_action} /><Detail title="예상 장애물" text={selected.obstacle} /><Detail title="필요한 도움" text={selected.support_needed} /></article></div>}</main>;
}

function Detail({ title, text }: { title: string; text: string }) { return <div className="detail-block"><span>{title}</span><p>{text || "작성하지 않음"}</p></div>; }

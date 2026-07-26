"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { members } from "../data/members";
import { fetchSubmittedMemberIds, submitGoal } from "../lib/supabase";

type FormState = {
  memberId: string;
  goal: string;
  successMetric: string;
  currentState: string;
  currentActions: string;
  weeklyActions: string;
  nextAction: string;
  obstacle: string;
  supportNeeded: string;
};

const emptyForm: FormState = {
  memberId: "",
  goal: "",
  successMetric: "",
  currentState: "",
  currentActions: "",
  weeklyActions: "",
  nextAction: "",
  obstacle: "",
  supportNeeded: "",
};

export default function Home() {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const [form, setForm] = useState<FormState>(emptyForm);
  const [query, setQuery] = useState("");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [submittedMemberIds, setSubmittedMemberIds] = useState<Set<string>>(new Set());
  const [loadingMembers, setLoadingMembers] = useState(true);

  useEffect(() => {
    fetchSubmittedMemberIds()
      .then((ids) => setSubmittedMemberIds(new Set(ids)))
      .catch((reason) => setError(reason instanceof Error ? reason.message : "작성 완료 명단을 불러오지 못했습니다."))
      .finally(() => setLoadingMembers(false));
  }, []);

  const filteredMembers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? members.filter((member) => member.name.toLowerCase().includes(q)) : members;
  }, [query]);

  const selected = members.find((member) => member.id === form.memberId);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      await submitGoal(form);
      setSubmittedMemberIds((current) => new Set(current).add(form.memberId));
      setStep(3);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "저장 중 문제가 생겼습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  }

  if (step === 3) {
    return (
      <main className="shell success-shell">
        <section className="success-card">
          <div className="success-mark">✓</div>
          <p className="eyebrow">목표 등록 완료</p>
          <h1>{selected?.name}님, 함께 끝까지 가요.</h1>
          <p>작성한 내용은 운영자에게 안전하게 전달되었습니다. 다음 점검 때 구체적인 실행 조언으로 다시 만나요.</p>
          <button className="secondary-button" onClick={() => { setForm(emptyForm); setQuery(""); setStep(1); }}>
            다른 응답 작성하기
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      <header className="brand-row">
        <div className="brand-mark">돈</div>
        <div><strong>돈그릇</strong><span>12월 목표 프로젝트</span></div>
        <a href={`${basePath}/admin/`} className="admin-link">운영자</a>
      </header>

      <section className="hero">
        <p className="eyebrow">우리의 목표를 현실로 만드는 기록</p>
        <h1>12월의 나는,<br /><em>어디까지 가 있을까요?</em></h1>
        <p>목표를 선명하게 적는 순간 실행이 시작됩니다.<br />지금의 위치와 다음 행동을 차근차근 알려주세요.</p>
        <div className="progress"><span className={step >= 1 ? "active" : ""}>1</span><i /><span className={step >= 2 ? "active" : ""}>2</span></div>
      </section>

      {step === 1 ? (
        <section className="card member-card">
          <div className="card-heading"><span>01</span><div><h2>내 이름을 선택해주세요</h2><p>작성 완료된 이름은 다시 선택할 수 없어요.</p></div></div>
          <label className="search-box"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="이름 또는 닉네임 검색" /></label>
          {error && <p className="error-message">{error}</p>}
          <div className="member-grid">
            {filteredMembers.map((member) => {
              const submitted = submittedMemberIds.has(member.id);
              return (
                <button key={member.id} disabled={loadingMembers || submitted} className={`member${form.memberId === member.id ? " selected" : ""}${submitted ? " submitted" : ""}`} onClick={() => update("memberId", member.id)}>
                  <span>{member.name.slice(0, 1)}</span><strong>{member.name}<small>{submitted ? "작성 완료" : ""}</small></strong><i>{submitted || form.memberId === member.id ? "✓" : ""}</i>
                </button>
              );
            })}
          </div>
          <button className="primary-button" disabled={!form.memberId} onClick={() => setStep(2)}>목표 작성하러 가기 <span>→</span></button>
        </section>
      ) : (
        <form className="card goal-form" onSubmit={handleSubmit}>
          <div className="card-heading"><span>02</span><div><h2>{selected?.name}님의 12월 목표</h2><p>정답은 없어요. 지금 떠오르는 그대로 적어주세요.</p></div></div>

          <Field number="1" title="12월 31일까지 꼭 이루고 싶은 목표는 무엇인가요?" hint="가장 중요한 목표 하나를 구체적으로 적어주세요." required value={form.goal} onChange={(v) => update("goal", v)} placeholder="예: 온라인 클래스 월 매출 500만 원 달성" />
          <Field number="2" title="그 목표를 확인할 수 있는 완료 기준은 무엇일까요?" required value={form.successMetric} onChange={(v) => update("successMetric", v)} placeholder="예: 월 순매출 500만 원, 수강생 100명" />
          <Field number="3" title="8월 돈그릇 스터디 전까지 어디까지 와 있는지 알려주세요." hint="현재 수치, 준비 정도, 진행 상황을 알려주세요." required value={form.currentState} onChange={(v) => update("currentState", v)} placeholder="예: 클래스 기획 완료, 현재 매출 120만 원" />
          <Field number="4" title="목표를 위해 지금 하고 있는 행동은 무엇인가요?" value={form.currentActions} onChange={(v) => update("currentActions", v)} placeholder="예: 주 3회 콘텐츠 발행, 고객 인터뷰" />
          <Field number="5" title="매주 반복할 핵심 행동 3가지는 무엇인가요?" value={form.weeklyActions} onChange={(v) => update("weeklyActions", v)} placeholder={"1. 잠재 고객 20명 만나기\n2. 콘텐츠 3개 발행\n3. 매출 지표 기록"} />
          <Field number="6" title="이번 주에 반드시 끝낼 한 가지는요?" required value={form.nextAction} onChange={(v) => update("nextAction", v)} placeholder="예: 클래스 소개 페이지 초안 완성" />
          <Field number="7" title="예상되는 가장 큰 장애물은 무엇인가요?" value={form.obstacle} onChange={(v) => update("obstacle", v)} placeholder="예: 퇴근 후 시간이 부족하고 우선순위가 자주 바뀜" />
          <Field number="8" title="모임에서 어떤 도움을 받고 싶나요?" value={form.supportNeeded} onChange={(v) => update("supportNeeded", v)} placeholder="예: 주간 실행 점검, 마케팅 피드백" />

          {error && <p className="error-message">{error}</p>}
          <div className="form-actions"><button type="button" className="secondary-button" onClick={() => setStep(1)}>← 이름 다시 선택</button><button className="primary-button compact" disabled={saving}>{saving ? "저장 중…" : "내 목표 등록하기"}</button></div>
          <p className="privacy-note">작성 내용은 돈그릇 목표 관리 목적으로만 사용됩니다.</p>
        </form>
      )}
      <footer>DON-GEULEUT · 함께 성장하는 사람들의 그릇</footer>
    </main>
  );
}

function Field({ number, title, hint, required, value, onChange, placeholder }: { number: string; title: string; hint?: string; required?: boolean; value: string; onChange: (value: string) => void; placeholder: string; }) {
  return (
    <label className="field"><div className="field-title"><span>{number}</span><strong>{title}</strong>{required && <b>필수</b>}</div>{hint && <small>{hint}</small>}<textarea required={required} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /></label>
  );
}

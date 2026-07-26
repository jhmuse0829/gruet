const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export type GoalSubmission = {
  memberId: string; goal: string; successMetric: string; currentState: string; currentActions: string;
  weeklyActions: string; nextAction: string; obstacle: string; supportNeeded: string;
};

function configured() { return Boolean(url && key); }

export async function fetchSubmittedMemberIds() {
  if (!configured()) throw new Error("Supabase 연결 정보가 필요합니다.");
  const response = await fetch(`${url}/rest/v1/rpc/list_submitted_member_ids`, {
    method: "POST",
    headers: { apikey: key!, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: "{}",
    cache: "no-store",
  });
  if (!response.ok) throw new Error("작성 완료 명단을 불러오지 못했습니다.");
  const rows = await response.json() as Array<{ member_id: string }>;
  return rows.map((row) => row.member_id);
}

export async function submitGoal(data: GoalSubmission) {
  if (!configured()) throw new Error("아직 저장 공간 연결이 완료되지 않았습니다. 운영자에게 알려주세요.");
  const response = await fetch(`${url}/rest/v1/rpc/submit_goal`, {
    method: "POST",
    headers: { apikey: key!, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      p_member_id: data.memberId, p_goal: data.goal, p_success_metric: data.successMetric,
      p_current_state: data.currentState, p_current_actions: data.currentActions,
      p_weekly_actions: data.weeklyActions, p_next_action: data.nextAction,
      p_obstacle: data.obstacle, p_support_needed: data.supportNeeded,
    }),
  });
  if (!response.ok) throw new Error("저장하지 못했습니다. 입력 내용을 확인하고 다시 시도해주세요.");
}

export async function adminSignIn(email: string, password: string) {
  if (!configured()) throw new Error("Supabase 연결 정보가 필요합니다.");
  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, { method: "POST", headers: { apikey: key!, "Content-Type": "application/json" }, body: JSON.stringify({ email, password }) });
  if (!response.ok) throw new Error("이메일 또는 비밀번호를 확인해주세요.");
  return response.json() as Promise<{ access_token: string }>;
}

export async function fetchResponses(token: string) {
  const response = await fetch(`${url}/rest/v1/goal_responses?select=*&order=updated_at.desc`, { headers: { apikey: key!, Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!response.ok) throw new Error("응답을 불러오지 못했습니다. 관리자 권한을 확인해주세요.");
  return response.json();
}

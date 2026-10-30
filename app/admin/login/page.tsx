// app/admin/login/page.tsx
"use client";

import { Suspense, useActionState } from "react"; // ⬅️ dùng useActionState
import { useSearchParams } from "next/navigation";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { loginAction } from "./actions";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className="w-full rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-60"
    >
      {pending ? "Đang đăng nhập…" : "Đăng nhập"}
    </button>
  );
}

function LoginInner() {
  const params = useSearchParams();
  const next = params.get("next") || "/admin";

  // ⬇️ useActionState thay cho useFormState
  const [state, formAction] = useActionState(loginAction, null);

  return (
    <div className="mx-auto max-w-sm rounded-xl border bg-white p-6 shadow-sm">
      <h1 className="mb-4 text-xl font-semibold">Đăng nhập</h1>

      {state?.error && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-2 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <form action={formAction} className="space-y-3">
        <input
          name="user"
          type="text"
          placeholder="Tài khoản"
          className="w-full rounded-lg border px-3 py-2"
          
        />
        <input
          name="pass"
          type="password"
          placeholder="Mật khẩu"
          className="w-full rounded-lg border px-3 py-2"
          required
        />
        <input type="hidden" name="next" value={next} />
        <SubmitBtn />
      </form>

      <div className="mt-3 text-xs text-gray-500">
        <Link href="/">← Về trang chủ</Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-gray-500">Đang tải…</div>}>
      <LoginInner />
    </Suspense>
  );
}

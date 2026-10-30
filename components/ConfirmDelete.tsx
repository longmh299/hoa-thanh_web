// components/ConfirmDelete.tsx
"use client";

import { useState, useTransition } from "react";

type BaseProps = {
  label?: string;
  confirmText?: string;
  className?: string;
};

type PropsOnConfirm = BaseProps & {
  /** Gọi thẳng hàm xoá (server action wrapper hoặc API) */
  onConfirm: () => Promise<void> | void;
  action?: never;
  hidden?: never;
};

type PropsAction = BaseProps & {
  /** Submit server action qua <form action={...}> */
  action: (formData: FormData) => Promise<void> | void;
  hidden?: Record<string, string | number | boolean>;
  onConfirm?: never;
};

type Props = PropsOnConfirm | PropsAction;

/* ---- Type guards để TS biết chắc chắn nhánh nào ---- */
function hasOnConfirm(p: Props): p is PropsOnConfirm {
  return typeof (p as any).onConfirm === "function";
}
function hasAction(p: Props): p is PropsAction {
  return typeof (p as any).action === "function";
}

export default function ConfirmDelete({
  label = "Xoá",
  confirmText = "Bạn chắc chắn muốn xoá?",
  className = "px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700",
  ...rest
}: Props) {
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className} disabled={pending}>
        {pending ? "Đang xoá…" : label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50">
          <div className="w-[min(92vw,420px)] rounded-xl bg-white p-5 shadow-xl">
            <p className="mb-4 text-sm text-gray-700">{confirmText}</p>

            {err && <div className="mb-3 text-xs text-red-600">{err}</div>}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
              >
                Huỷ
              </button>

              {hasOnConfirm(rest) ? (
                // ===== Mode 1: onConfirm =====
                <button
                  type="button"
                  className="px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                  onClick={() => {
                    setErr(null);
                    startTransition(async () => {
                      try {
                        await rest.onConfirm();
                        setOpen(false);
                      } catch (e: any) {
                        setErr(e?.message || "Xoá thất bại, vui lòng thử lại.");
                      }
                    });
                  }}
                  disabled={pending}
                >
                  {pending ? "Đang xoá…" : "Xoá"}
                </button>
              ) : hasAction(rest) ? (
                // ===== Mode 2: action + hidden (submit server action) =====
                <form action={rest.action} onSubmit={() => setOpen(false)}>
                  {rest.hidden &&
                    Object.entries(rest.hidden).map(([k, v]) => (
                      <input key={k} type="hidden" name={k} value={String(v)} />
                    ))}
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                  >
                    Xoá
                  </button>
                </form>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

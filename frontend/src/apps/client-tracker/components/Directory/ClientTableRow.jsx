import React, { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  User,
  Star,
  Phone,
  MessageSquarePlus,
  AlertTriangle,
  MessageCircle,
  Check,
} from "lucide-react";

const ClientTableRow = ({
  client,
  onClick,
  index,
  variant = "desktop",
  isSelected = false,
  onToggleSelect,
  onQuickLog,
}) => {
  const [isManuallyToggled, setIsManuallyToggled] = useState(false);
  const isExpanded = client.shouldAutoExpand
    ? !isManuallyToggled
    : isManuallyToggled;

  const formatAUM = (value) => {
    if (!value || value === 0) return "₹0";
    if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹${(value / 100000).toFixed(2)} L`;
    return `₹${new Intl.NumberFormat("en-IN").format(value)}`;
  };

  const getCategoryStyles = (cat) => {
    switch (cat) {
      case "Diamond":
        return "bg-cyan-50 text-cyan-700 border-cyan-200/80 dark:bg-cyan-500/10 dark:text-cyan-300 dark:border-cyan-500/25";
      case "Gold":
        return "bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/25";
      case "Silver":
        return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/10 dark:text-slate-300 dark:border-slate-500/25";
      default:
        return "bg-orange-50 text-orange-700 border-orange-200/80 dark:bg-orange-500/10 dark:text-orange-300 dark:border-orange-500/25";
    }
  };

  const getTierBarColor = (cat) => {
    switch (cat) {
      case "Diamond":
        return "bg-cyan-500";
      case "Gold":
        return "bg-amber-500";
      case "Silver":
        return "bg-slate-400";
      default:
        return "bg-orange-500";
    }
  };

  const rawPhone = client.contactDetails?.phoneNo;
  const cleanDigits =
    rawPhone && rawPhone !== "N/A" ? rawPhone.replace(/\D/g, "") : "";
  const hasValidPhone = cleanDigits.length >= 10;
  const whatsappNumber =
    cleanDigits.length === 10 ? `91${cleanDigits}` : cleanDigits;

  const handleToggleExpand = (e) => {
    e.stopPropagation();
    setIsManuallyToggled(!isManuallyToggled);
  };

  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    onToggleSelect?.(client._id);
  };

  const formatRecency = () => {
    if (!client.latestUpdate) return "No logs";
    const days = client.daysSinceUpdate;
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days}d ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
  };

  const formattedDate = client.latestUpdate
    ? new Date(client.latestUpdate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "2-digit",
      })
    : "--";

  const isEven = index % 2 === 0;
  const baseBg = isSelected
    ? "bg-sky-50/70 dark:bg-sky-500/10"
    : isEven
    ? "bg-white dark:bg-[#161B26]"
    : "bg-slate-50/40 dark:bg-[#1C2230]/35";

  // ==========================================
  // MOBILE COMPACT ERGONOMIC CARD (Sharp Geometry)
  // ==========================================
  if (variant === "mobile") {
    return (
      <div
        className={`w-full rounded-lg border transition-colors overflow-hidden ${
          isSelected
            ? "bg-sky-50/50 dark:bg-sky-500/10 border-sky-400 dark:border-sky-500/50"
            : "bg-white dark:bg-[#161B26] border-slate-200 dark:border-slate-800/80"
        }`}
      >
        {/* Main Tappable Body */}
        <div
          onClick={() => onClick(client)}
          className="p-3 active:bg-slate-50 dark:active:bg-[#1C2230] transition-colors cursor-pointer space-y-2"
        >
          {/* Top Line: Select + Name + AUM */}
          <div className="flex items-start justify-between gap-2 w-full">
            <div className="flex items-start gap-2 min-w-0 flex-1">
              <button
                type="button"
                onClick={handleCheckboxClick}
                aria-label="Select family"
                className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                  isSelected
                    ? "bg-sky-600 border-sky-600 text-white"
                    : "border-slate-300 dark:border-slate-600 bg-transparent"
                }`}
              >
                {isSelected && <Check size={10} strokeWidth={3} />}
              </button>

              <div className="min-w-0 flex-1">
                <h3 className="sora-font text-[13px] font-bold text-slate-900 dark:text-white leading-snug truncate">
                  {client.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                    {client.pan || "NO PAN"}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    {client.members?.length > 1
                      ? `${client.members.length} Members`
                      : "Individual"}
                  </span>
                  {client.isQuiet && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[9px] font-semibold border border-rose-200/70 dark:border-rose-500/30">
                      <AlertTriangle size={9} /> {client.daysSinceUpdate}d quiet
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0">
              <span className="sora-font text-[13px] font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                {formatAUM(client.familyAum)}
              </span>
              <span
                className={`mt-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-semibold border ${getCategoryStyles(
                  client.category
                )}`}
              >
                {client.category}
              </span>
            </div>
          </div>

          {/* Relative AUM Bar */}
          <div className="w-full h-1 bg-slate-100 dark:bg-[#1C2230] rounded-full overflow-hidden">
            <div
              style={{
                width: `${Math.min(100, Math.max(4, client.aumSharePct * 3))}%`,
              }}
              className={`h-full ${getTierBarColor(client.category)} opacity-85`}
            />
          </div>
        </div>

        {/* Thumb-Friendly Quick Action Footer (Wraps cleanly on narrow screens) */}
        <div className="flex flex-wrap items-center justify-between px-3 py-1.5 bg-slate-50/90 dark:bg-[#1C2230]/60 border-t border-slate-100 dark:border-slate-800/80 gap-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {hasValidPhone ? (
              <>
                <a
                  href={`tel:${cleanDigits}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 active:scale-95"
                >
                  <Phone size={11} className="text-sky-600 dark:text-sky-400" />
                  <span>Call</span>
                </a>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 active:scale-95"
                >
                  <MessageCircle size={11} />
                  <span>WhatsApp</span>
                </a>
              </>
            ) : (
              <span className="text-[10px] font-mono text-slate-400 px-1">
                No phone
              </span>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickLog?.(client);
              }}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white dark:bg-[#161B26] border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-700 dark:text-slate-200 active:scale-95 cursor-pointer"
            >
              <MessageSquarePlus size={11} className="text-sky-600 dark:text-sky-400" />
              <span>Log</span>
            </button>
          </div>

          {client.members?.length > 1 ? (
            <button
              type="button"
              onClick={handleToggleExpand}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-sky-50 dark:bg-sky-500/15 border border-sky-200/80 dark:border-sky-500/30 text-[11px] font-semibold text-sky-700 dark:text-sky-300 cursor-pointer ml-auto"
            >
              <span>Family ({client.members.length})</span>
              {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
          ) : (
            <span className="text-[10px] font-mono text-slate-400 ml-auto">
              {formatRecency()}
            </span>
          )}
        </div>

        {/* Expanded Mobile Family Members */}
        {isExpanded && client.members?.length > 1 && (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/70 bg-slate-50 dark:bg-[#131720] border-t border-slate-200/70 dark:border-slate-800">
            {client.members.map((member) => {
              const isActuallyHead =
                member.isFamilyHead || member.pan === client.pan;
              return (
                <div
                  key={`mob-m-${member._id}`}
                  onClick={() => onClick(member)}
                  className="px-3 py-2 pl-4 border-l-2 border-l-sky-500 active:bg-sky-50/40 dark:active:bg-[#1C2230] cursor-pointer flex items-center justify-between gap-2"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {isActuallyHead ? (
                        <Star
                          size={11}
                          className="text-sky-500 fill-sky-500 shrink-0"
                        />
                      ) : (
                        <User
                          size={11}
                          className="text-slate-400 shrink-0"
                        />
                      )}
                      <span className="sora-font text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {member.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 pl-4 block truncate">
                      {member.pan || "NO PAN"} • {isActuallyHead ? "Head" : "Member"}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 shrink-0">
                    {formatAUM(member.aum)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // DESKTOP ACTIONABLE LEDGER ROW
  // ==========================================
  return (
    <>
      <tr
        className={`transition-colors group border-b border-slate-200 dark:border-slate-800 hover:bg-sky-50/40 dark:hover:bg-[#1C2230]/80 ${baseBg}`}
      >
        <td className="px-4 py-3 align-middle">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCheckboxClick}
              aria-label="Select family"
              className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                isSelected
                  ? "bg-sky-600 border-sky-600 text-white"
                  : "border-slate-300 dark:border-slate-600 hover:border-sky-500 bg-transparent"
              }`}
            >
              {isSelected && <Check size={10} strokeWidth={3} />}
            </button>

            {client.members?.length > 1 ? (
              <button
                type="button"
                onClick={handleToggleExpand}
                className="p-1 hover:bg-sky-100/70 dark:hover:bg-sky-500/15 rounded-md text-sky-600 dark:text-sky-400 transition-colors shrink-0 cursor-pointer"
                title={isExpanded ? "Collapse members" : "Expand family members"}
              >
                {isExpanded ? (
                  <ChevronDown size={14} strokeWidth={2.4} />
                ) : (
                  <ChevronRight size={14} strokeWidth={2.4} />
                )}
              </button>
            ) : (
              <div className="w-6 shrink-0" />
            )}

            <div
              onClick={() => onClick(client)}
              className="flex flex-col min-w-0 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="sora-font text-[13px] font-semibold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300 transition-colors truncate">
                  {client.name}
                </span>
                {client.members?.length > 1 ? (
                  <span className="text-[10px] bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 px-1.5 py-0.5 rounded-md font-semibold border border-sky-200/70 dark:border-sky-500/25 shrink-0">
                    {client.members.length} MEMBERS
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-100 dark:bg-[#1C2230] text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-md font-medium border border-slate-200/70 dark:border-slate-700/70 shrink-0">
                    INDIV
                  </span>
                )}
              </div>
              <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 tracking-wider uppercase mt-0.5">
                {client.pan}
              </span>
            </div>
          </div>
        </td>

        <td
          className="px-4 py-3 align-middle cursor-pointer"
          onClick={() => onClick(client)}
        >
          <div className="flex flex-col gap-1 max-w-[190px]">
            <div className="flex items-center justify-between gap-2">
              <span className="sora-font text-[13px] font-bold text-slate-900 dark:text-white font-mono tabular-nums whitespace-nowrap">
                {formatAUM(client.familyAum)}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold border ${getCategoryStyles(
                  client.category
                )}`}
              >
                {client.category}
              </span>
            </div>
            <div className="w-full h-1 bg-slate-100 dark:bg-[#1C2230] rounded-full overflow-hidden">
              <div
                style={{
                  width: `${Math.min(100, Math.max(3, client.aumSharePct * 3))}%`,
                }}
                className={`h-full ${getTierBarColor(client.category)} opacity-85`}
              />
            </div>
          </div>
        </td>

        <td
          className="px-4 py-3 align-middle cursor-pointer"
          onClick={() => onClick(client)}
        >
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 tabular-nums font-mono">
                {rawPhone || "N/A"}
              </span>
              {client.isQuiet && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 text-[10px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  Quiet
                </span>
              )}
            </div>
            <span className="text-[11px] truncate max-w-[200px] text-slate-500 dark:text-slate-400">
              {client.contactDetails?.email && client.contactDetails.email !== "N/A"
                ? client.contactDetails.email
                : "No email"}
            </span>
          </div>
        </td>

        <td
          className="px-4 py-3 align-middle cursor-pointer"
          onClick={() => onClick(client)}
        >
          <div className="flex flex-col">
            <span
              className={`text-xs font-semibold ${
                client.isQuiet
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-slate-700 dark:text-slate-200"
              }`}
            >
              {formatRecency()}
            </span>
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
              {formattedDate}
            </span>
          </div>
        </td>

        <td className="px-4 py-3 text-right align-middle">
          <div className="inline-flex items-center justify-end gap-1 opacity-85 group-hover:opacity-100 transition-opacity">
            {hasValidPhone && (
              <>
                <a
                  href={`tel:${cleanDigits}`}
                  onClick={(e) => e.stopPropagation()}
                  title={`Call ${rawPhone}`}
                  className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161B26] hover:border-sky-400 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                >
                  <Phone size={13} />
                </a>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title="Message on WhatsApp"
                  className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161B26] hover:border-emerald-400 text-emerald-600 dark:text-emerald-400 transition-colors"
                >
                  <MessageCircle size={13} />
                </a>
              </>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onQuickLog?.(client);
              }}
              title="Log Interaction"
              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#161B26] hover:border-sky-400 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-300 transition-colors cursor-pointer"
            >
              <MessageSquarePlus size={12} />
              <span>Log</span>
            </button>
          </div>
        </td>
      </tr>

      {/* DESKTOP EXPANDED MEMBER ROWS */}
      {isExpanded &&
        client.members.map((member) => {
          const isActuallyHead =
            member.isFamilyHead || member.pan === client.pan;
          const memberPct =
            client.familyAum > 0
              ? (((Number(member.aum) || 0) / client.familyAum) * 100).toFixed(0)
              : 0;

          return (
            <tr
              key={member._id}
              onClick={() => onClick(member)}
              className="transition-colors border-b border-slate-200/80 dark:border-slate-800/80 cursor-pointer hover:bg-sky-50/40 dark:hover:bg-[#1C2230] bg-slate-50/80 dark:bg-[#131720]"
            >
              <td className="px-4 py-2.5 pl-16 relative align-middle">
                <div className="absolute left-11 top-0 bottom-0 w-0.5 bg-sky-500/40" />
                <div className="flex items-center gap-2">
                  {isActuallyHead ? (
                    <Star
                      size={12}
                      className="text-sky-500 fill-sky-500 shrink-0"
                    />
                  ) : (
                    <User size={12} className="text-slate-400 shrink-0" />
                  )}
                  <span className="sora-font text-xs font-semibold text-slate-700 dark:text-slate-200">
                    {member.name}
                  </span>
                  <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded-md bg-white dark:bg-[#1C2230] border border-slate-200/80 dark:border-slate-700">
                    {isActuallyHead ? "Head" : "Member"}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-400 pl-5 mt-0.5">
                  {member.pan || "NO PAN"}
                </p>
              </td>

              <td className="px-4 py-2.5 align-middle">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold font-mono text-slate-800 dark:text-slate-200">
                    {formatAUM(member.aum)}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    ({memberPct}%)
                  </span>
                </div>
              </td>

              <td className="px-4 py-2.5 align-middle">
                <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                  {member.contactDetails?.phoneNo || "N/A"}
                </span>
              </td>

              <td className="px-4 py-2.5 align-middle" colSpan={2}>
                <span className="text-[11px] font-medium text-sky-600 dark:text-sky-400">
                  Open profile →
                </span>
              </td>
            </tr>
          );
        })}
    </>
  );
};

export default ClientTableRow;
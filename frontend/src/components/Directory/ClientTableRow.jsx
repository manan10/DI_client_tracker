import { Phone, Mail } from "lucide-react";

const ClientTableRow = ({ client }) => (
  <tr className="hover:bg-blue-50/30 transition-colors group">
    <td className="px-8 py-6">
      <p className="font-black text-slate-800 text-sm uppercase">
        {client.name}
      </p>
      <p className="text-[10px] font-bold text-slate-400 mt-1 font-mono tracking-tighter uppercase">
        {client.pan}
      </p>
    </td>
    <td className="px-8 py-6">
      <span
        className={`text-[10px] font-black uppercase tracking-widest block mb-1 ${
          client.category === "Diamond"
            ? "text-blue-600"
            : client.category === "Gold"
              ? "text-amber-600"
              : client.category === "Silver"
                ? "text-slate-500"
                : "text-orange-700"
        }`}
      >
        {client.category || "Silver"}
      </span>
      <p className="font-bold text-slate-900 text-sm">
        ₹{(client.aum || 0).toLocaleString("en-IN")}
      </p>
    </td>
    <td className="px-8 py-6">
      <div className="flex flex-col gap-1">
        <span className="flex items-center text-[11px] font-bold text-slate-600 gap-2">
          <Phone size={12} className="text-slate-400" />{" "}
          {client.contactDetails?.phoneNo || "N/A"}
        </span>
        <span className="flex items-center text-[11px] font-bold text-slate-600 gap-2">
          <Mail size={12} className="text-slate-400" />{" "}
          {client.contactDetails?.email || "N/A"}
        </span>
      </div>
    </td>
    <td className="px-8 py-6 text-right">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
        {client.updatedAt
          ? new Date(client.updatedAt).toLocaleDateString("en-IN")
          : "New"}
      </p>
    </td>
  </tr>
);

export default ClientTableRow;

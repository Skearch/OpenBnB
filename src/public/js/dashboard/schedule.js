document.addEventListener("DOMContentLoaded", async () => {
    const tbody = document.getElementById("gaps-table-body");
    if (!tbody) return;
    const propertyId = document.body.dataset.propertyId;
    if (!propertyId) return;

    function formatDateTime(dt) {
        if (!dt) return "-";
        const d = new Date(dt);
        return d.toLocaleString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    try {
        const res = await fetch(`/api/property/cleaning-gaps/${propertyId}`);
        const data = await res.json();
        tbody.innerHTML = "";
        if (data.success && Array.isArray(data.gaps) && data.gaps.length) {
            data.gaps.forEach(gap => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
          <td class="border border-gray-300 px-2 py-1">${formatDateTime(gap.start)}</td>
          <td class="border border-gray-300 px-2 py-1">${formatDateTime(gap.end)}</td>
        `;
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="2" class="text-center text-gray-500 py-6">No cleaning gaps found.</td></tr>`;
        }
    } catch {
        tbody.innerHTML = `<tr><td colspan="2" class="text-center text-red-500 py-6">Failed to load cleaning gaps.</td></tr>`;
    }
});
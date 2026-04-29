(function () {
  const fmtINR = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  const fmtNum = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

  function num(id) {
    const v = parseFloat(document.getElementById(id).value);
    return isFinite(v) ? v : 0;
  }

  // ============================================================
  // Tab switching
  // ============================================================
  document.querySelectorAll(".tab").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      document.querySelectorAll(".panel").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      document.getElementById(btn.dataset.tab).classList.add("active");
      // resize charts that may be hidden
      if (waterfall) waterfall.resize();
      if (emergencyChart) emergencyChart.resize();
    });
  });

  // ============================================================
  // RETIREMENT CALCULATOR
  // ============================================================
  let waterfall;

  function calcRetirement() {
    const currentAge = num("r-currentAge");
    const retireAge = num("r-retireAge");
    const startCorpus = num("r-startCorpus");
    let monthly = num("r-monthly");
    const annualRate = num("r-rate") / 100;
    const inflation = num("r-inflation") / 100;
    const stepup = num("r-stepup") / 100;

    const years = Math.max(0, retireAge - currentAge);
    const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;

    const rows = [];
    let corpus = startCorpus;
    let totalInvested = startCorpus;
    let totalReturns = 0;

    for (let y = 1; y <= years; y++) {
      const opening = corpus;
      let yearContribution = 0;
      let yearReturn = 0;

      for (let m = 0; m < 12; m++) {
        const interest = corpus * monthlyRate;
        corpus += interest + monthly;
        yearReturn += interest;
        yearContribution += monthly;
      }

      totalInvested += yearContribution;
      totalReturns += yearReturn;

      const ageAtClose = currentAge + y;
      const realClosing = corpus / Math.pow(1 + inflation, y);

      rows.push({
        year: y,
        age: ageAtClose,
        opening,
        contribution: yearContribution,
        returns: yearReturn,
        closing: corpus,
        realClosing,
      });

      // step-up next year's monthly contribution
      monthly = monthly * (1 + stepup);
    }

    const finalCorpus = corpus;
    const realFinal = years > 0 ? finalCorpus / Math.pow(1 + inflation, years) : finalCorpus;
    const realRate = (1 + annualRate) / (1 + inflation) - 1;

    document.getElementById("r-finalNominal").textContent = fmtINR.format(finalCorpus);
    document.getElementById("r-finalReal").textContent = fmtINR.format(realFinal);
    document.getElementById("r-totalInvested").textContent = fmtINR.format(totalInvested);
    document.getElementById("r-totalReturns").textContent = fmtINR.format(totalReturns);
    document.getElementById("r-realRate").textContent = (realRate * 100).toFixed(2) + "%";
    document.getElementById("r-years").textContent = years;

    renderRetirementTable(rows);
    renderWaterfall(startCorpus, rows);
  }

  function renderRetirementTable(rows) {
    const tbody = document.querySelector("#r-table tbody");
    tbody.innerHTML = rows
      .map(
        (r) => `
        <tr>
          <td>${r.age}</td>
          <td>${fmtINR.format(r.opening)}</td>
          <td>${fmtINR.format(r.contribution)}</td>
          <td>${fmtINR.format(r.returns)}</td>
          <td>${fmtINR.format(r.closing)}</td>
          <td>${fmtINR.format(r.realClosing)}</td>
        </tr>`
      )
      .join("");
  }

  function renderWaterfall(startCorpus, rows) {
    // Bucket years for readability if there are many
    const bucketSize = rows.length > 20 ? 5 : rows.length > 10 ? 2 : 1;

    const buckets = [];
    for (let i = 0; i < rows.length; i += bucketSize) {
      const slice = rows.slice(i, i + bucketSize);
      const last = slice[slice.length - 1];
      buckets.push({
        label: bucketSize === 1 ? `Age ${last.age}` : `Age ${slice[0].age}-${last.age}`,
        contribution: slice.reduce((s, r) => s + r.contribution, 0),
        returns: slice.reduce((s, r) => s + r.returns, 0),
        closing: last.closing,
      });
    }

    // Build stacked bar where each bar = previous closing (base) + contributions + returns
    const labels = ["Start", ...buckets.map((b) => b.label)];

    const baseSeries = [0]; // invisible base for waterfall offset
    const contribSeries = [startCorpus]; // start corpus shown as initial contribution
    const returnsSeries = [0];

    let runningBase = startCorpus;
    for (const b of buckets) {
      baseSeries.push(runningBase);
      contribSeries.push(b.contribution);
      returnsSeries.push(b.returns);
      runningBase = b.closing;
    }

    if (waterfall) waterfall.destroy();

    const ctx = document.getElementById("waterfallChart").getContext("2d");
    waterfall = new Chart(ctx, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Existing corpus",
            data: baseSeries,
            backgroundColor: "rgba(108, 140, 255, 0.55)",
            borderColor: "rgba(108, 140, 255, 0.9)",
            borderWidth: 1,
            stack: "s",
          },
          {
            label: "Contributions added",
            data: contribSeries,
            backgroundColor: "rgba(139, 92, 246, 0.85)",
            borderColor: "rgba(139, 92, 246, 1)",
            borderWidth: 1,
            stack: "s",
          },
          {
            label: "Returns earned",
            data: returnsSeries,
            backgroundColor: "rgba(52, 211, 153, 0.85)",
            borderColor: "rgba(52, 211, 153, 1)",
            borderWidth: 1,
            stack: "s",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            ticks: { color: "#9aa0c7" },
            grid: { color: "rgba(255,255,255,0.04)" },
          },
          y: {
            stacked: true,
            ticks: {
              color: "#9aa0c7",
              callback: (v) => abbrev(v),
            },
            grid: { color: "rgba(255,255,255,0.06)" },
          },
        },
        plugins: {
          legend: { labels: { color: "#e8ebff" } },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const ds = ctx.dataset.label;
                const v = ctx.parsed.y;
                if (ds === "Existing corpus" && ctx.dataIndex === 0) return null;
                return `${ds}: ${fmtINR.format(v)}`;
              },
              footer: (items) => {
                if (!items.length) return "";
                const total = items.reduce((s, it) => s + it.parsed.y, 0);
                return `Total at this point: ${fmtINR.format(total)}`;
              },
            },
          },
        },
      },
    });
  }

  function abbrev(v) {
    if (Math.abs(v) >= 1e7) return "₹" + (v / 1e7).toFixed(1) + "Cr";
    if (Math.abs(v) >= 1e5) return "₹" + (v / 1e5).toFixed(1) + "L";
    if (Math.abs(v) >= 1e3) return "₹" + (v / 1e3).toFixed(0) + "K";
    return "₹" + v;
  }

  document.getElementById("r-calc").addEventListener("click", calcRetirement);

  // ============================================================
  // EMERGENCY CORPUS
  // ============================================================
  let emergencyChart;

  function calcEmergency() {
    const current = num("e-currentCorpus");
    const fixed = num("e-fixed");
    const cutdown = num("e-cutdown");
    const aggressive = num("e-aggressive");
    const currentSaving = num("e-currentSaving");
    const annualRate = num("e-rate") / 100;

    const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
    const aggressivePace = currentSaving + cutdown + aggressive;

    document.getElementById("e-paceCurrent").textContent = fmtINR.format(currentSaving) + " / mo";
    document.getElementById("e-paceAggressive").textContent = fmtINR.format(aggressivePace) + " / mo";

    const goals = [
      { months: 3, label: "3 months — short cushion" },
      { months: 6, label: "6 months — standard buffer" },
      { months: 9, label: "9 months — unstable-job armor" },
    ];

    const goalsEl = document.getElementById("e-goals");
    const tbody = document.querySelector("#e-table tbody");
    goalsEl.innerHTML = "";
    tbody.innerHTML = "";

    const tableRows = [];

    goals.forEach((g) => {
      const target = g.months * fixed;
      const gap = Math.max(0, target - current);
      const progress = target === 0 ? 100 : Math.min(100, (current / target) * 100);
      const met = current >= target;

      const tCurrent = monthsToReach(current, target, currentSaving, monthlyRate);
      const tAggro = monthsToReach(current, target, aggressivePace, monthlyRate);

      // Goal card
      const goalDiv = document.createElement("div");
      goalDiv.className = "goal";
      goalDiv.innerHTML = `
        <div class="goal-head">
          <div>
            <div class="goal-title">${g.label}</div>
            <div class="goal-amount">Target ${fmtINR.format(target)} • You have ${fmtINR.format(current)}</div>
          </div>
          <span class="badge ${met ? "met" : progress >= 50 ? "partial" : "unmet"}">
            ${met ? "Goal met" : progress.toFixed(0) + "%"}
          </span>
        </div>
        <div class="progress"><div class="progress-fill ${met ? "met" : ""}" style="width:${progress}%"></div></div>
        <div class="goal-meta">
          <span>Gap: ${fmtINR.format(gap)}</span>
          <span>${met ? "Done — keep parked in liquid fund" : `~${fmtMonths(tAggro)} aggressive / ${fmtMonths(tCurrent)} current`}</span>
        </div>
      `;
      goalsEl.appendChild(goalDiv);

      tableRows.push({
        label: `${g.months} mo`,
        target,
        gap,
        tCurrent,
        tAggro,
      });
    });

    tbody.innerHTML = tableRows
      .map(
        (r) => `
        <tr>
          <td>${r.label}</td>
          <td>${fmtINR.format(r.target)}</td>
          <td>${fmtINR.format(r.gap)}</td>
          <td>${fmtMonths(r.tCurrent)}</td>
          <td>${fmtMonths(r.tAggro)}</td>
        </tr>`
      )
      .join("");

    renderEmergencyChart(current, fixed, currentSaving, aggressivePace, monthlyRate);
    renderTips({ current, fixed, cutdown, aggressive, currentSaving, aggressivePace, goals });
  }

  function monthsToReach(start, target, monthlyContrib, monthlyRate) {
    if (start >= target) return 0;
    if (monthlyContrib <= 0 && monthlyRate <= 0) return Infinity;

    let bal = start;
    let m = 0;
    while (bal < target && m < 600) {
      bal = bal * (1 + monthlyRate) + monthlyContrib;
      m++;
    }
    return bal >= target ? m : Infinity;
  }

  function fmtMonths(m) {
    if (!isFinite(m)) return "Never at this pace";
    if (m === 0) return "Reached";
    if (m < 12) return `${m} mo`;
    const years = Math.floor(m / 12);
    const rem = m % 12;
    return rem === 0 ? `${years} yr` : `${years} yr ${rem} mo`;
  }

  function renderEmergencyChart(start, fixed, paceCurrent, paceAggressive, monthlyRate) {
    const horizon = 36; // 3 years projection
    const labels = Array.from({ length: horizon + 1 }, (_, i) => `M${i}`);

    const proj = (pace) => {
      const out = [start];
      let bal = start;
      for (let i = 0; i < horizon; i++) {
        bal = bal * (1 + monthlyRate) + pace;
        out.push(bal);
      }
      return out;
    };

    const dataCurrent = proj(paceCurrent);
    const dataAggressive = proj(paceAggressive);

    if (emergencyChart) emergencyChart.destroy();

    const ctx = document.getElementById("emergencyChart").getContext("2d");
    emergencyChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: "Current pace",
            data: dataCurrent,
            borderColor: "rgba(108, 140, 255, 1)",
            backgroundColor: "rgba(108, 140, 255, 0.15)",
            tension: 0.25,
            fill: true,
            pointRadius: 0,
            borderWidth: 2,
          },
          {
            label: "Aggressive pace",
            data: dataAggressive,
            borderColor: "rgba(52, 211, 153, 1)",
            backgroundColor: "rgba(52, 211, 153, 0.15)",
            tension: 0.25,
            fill: true,
            pointRadius: 0,
            borderWidth: 2,
          },
          {
            label: "3-month goal",
            data: Array(horizon + 1).fill(3 * fixed),
            borderColor: "rgba(251, 191, 36, 0.7)",
            borderDash: [6, 4],
            pointRadius: 0,
            borderWidth: 1.5,
            fill: false,
          },
          {
            label: "6-month goal",
            data: Array(horizon + 1).fill(6 * fixed),
            borderColor: "rgba(244, 114, 182, 0.7)",
            borderDash: [6, 4],
            pointRadius: 0,
            borderWidth: 1.5,
            fill: false,
          },
          {
            label: "9-month goal",
            data: Array(horizon + 1).fill(9 * fixed),
            borderColor: "rgba(248, 113, 113, 0.7)",
            borderDash: [6, 4],
            pointRadius: 0,
            borderWidth: 1.5,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        scales: {
          x: { ticks: { color: "#9aa0c7", maxTicksLimit: 12 }, grid: { color: "rgba(255,255,255,0.04)" } },
          y: {
            ticks: { color: "#9aa0c7", callback: (v) => abbrev(v) },
            grid: { color: "rgba(255,255,255,0.06)" },
          },
        },
        plugins: {
          legend: { labels: { color: "#e8ebff" } },
          tooltip: {
            callbacks: { label: (c) => `${c.dataset.label}: ${fmtINR.format(c.parsed.y)}` },
          },
        },
      },
    });
  }

  function renderTips({ current, fixed, cutdown, aggressive, currentSaving, aggressivePace, goals }) {
    const ul = document.getElementById("e-tips");
    const tips = [];

    const target3 = 3 * fixed;
    const target6 = 6 * fixed;
    const target9 = 9 * fixed;

    if (current < target3) {
      tips.push(`Hit the 3-month line first — you need <strong>${fmtINR.format(target3 - current)}</strong> more. Park it in a liquid mutual fund or sweep-in FD.`);
    } else if (current < target6) {
      tips.push(`You've cleared 3 months. Next milestone: <strong>${fmtINR.format(target6 - current)}</strong> away from the 6-month buffer.`);
    } else if (current < target9) {
      tips.push(`Strong base. The 9-month buffer is <strong>${fmtINR.format(target9 - current)}</strong> away — useful if your industry is volatile.`);
    } else {
      tips.push(`9-month corpus achieved. Keep it parked, and route excess savings to long-term investing for retirement.`);
    }

    if (cutdown > 0) {
      const pct = ((cutdown / fixed) * 100).toFixed(0);
      tips.push(`Cutting <strong>${fmtINR.format(cutdown)}/mo</strong> from discretionary spend (~${pct}% of fixed expenses) accelerates every goal.`);
    }

    if (aggressive > 0) {
      tips.push(`Aggressive top-up of <strong>${fmtINR.format(aggressive)}/mo</strong> on top of cuts boosts your monthly fund flow to <strong>${fmtINR.format(aggressivePace)}</strong>.`);
    }

    if (currentSaving === 0 && aggressivePace === 0) {
      tips.push(`No monthly savings flowing in. Even ₹2,000–₹5,000/month auto-debited on payday compounds quickly.`);
    }

    tips.push(`Keep this corpus boring: liquid mutual fund, high-yield savings, or sweep-in FD. Equity is for retirement, not for emergencies.`);

    if (fixed > 0 && currentSaving > 0) {
      const savingsRate = ((currentSaving / (fixed + currentSaving)) * 100).toFixed(0);
      tips.push(`Your current savings rate (toward this fund) is roughly <strong>${savingsRate}%</strong> of fixed-expenses-equivalent income.`);
    }

    ul.innerHTML = tips.map((t) => `<li>${t}</li>`).join("");
  }

  document.getElementById("e-calc").addEventListener("click", calcEmergency);

  // ============================================================
  // Run once on load with defaults
  // ============================================================
  calcRetirement();
  calcEmergency();
})();

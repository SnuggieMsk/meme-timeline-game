(function () {
  const fmtINR = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  // ============================================================
  // Expense / instrument ledger schemas
  // ============================================================
  const CURRENT_YEAR = new Date().getFullYear();

  const RETIREMENT_INSTRUMENTS = [
    { id: "equity-mf", label: "Equity mutual funds (SIP)", hint: "Diversified, large/mid/flexi cap", default: 60000 },
    { id: "ppf-epf", label: "PPF & EPF", hint: "Tax-favored, sovereign-backed", default: 25000 },
    { id: "nps", label: "NPS (Tier I)", hint: "Long-horizon, equity-debt blend", default: 10000 },
    { id: "debt-mf", label: "Debt & hybrid funds", hint: "Stability, accrual income", default: 15000 },
    { id: "fd-bonds", label: "FDs & bonds", hint: "Fixed-income ladder", default: 10000 },
    { id: "direct-equity", label: "Direct equity", hint: "Concentrated convictions", default: 0 },
    { id: "alts", label: "AIF / PMS / unlisted", hint: "Alternates, REITs, gold", default: 0 },
    { id: "other-inv", label: "Other recurring investment", hint: "", default: 0 },
  ];

  const RETIREMENT_EXPENSES = [
    { id: "housing", label: "Housing — rent, society dues, property tax", hint: "Excludes home-loan EMI", default: 35000 },
    { id: "emi-home", label: "Home loan EMI", hint: "Set the closing year", default: 90000, hasStop: true, defaultStopYear: CURRENT_YEAR + 14 },
    { id: "emi-auto", label: "Auto / vehicle loan EMI", hint: "Set the closing year", default: 22000, hasStop: true, defaultStopYear: CURRENT_YEAR + 4 },
    { id: "emi-other", label: "Other loan EMIs (personal, education)", hint: "Set the closing year", default: 12000, hasStop: true, defaultStopYear: CURRENT_YEAR + 5 },
    { id: "utilities", label: "Utilities & connectivity", hint: "Power, water, gas, internet, mobile", default: 14000 },
    { id: "groceries", label: "Groceries & household running", hint: "Provisions, daily needs", default: 35000 },
    { id: "domestic", label: "Domestic help, cook, driver", hint: "", default: 22000 },
    { id: "education", label: "Children's education & dependents", hint: "Fees, coaching, parental support", default: 45000 },
    { id: "healthcare", label: "Healthcare & insurance premia", hint: "Premiums + routine medical", default: 18000 },
    { id: "lifestyle", label: "Lifestyle — dining, travel, leisure, shopping", hint: "Annualised monthly equivalent", default: 70000 },
    { id: "other-out", label: "Other recurring outflows", hint: "", default: 8000 },
  ];

  const ESSENTIALS = [
    { id: "housing", label: "Housing — rent, society dues, property tax", hint: "Includes building maintenance", default: 60000 },
    { id: "emi-home", label: "Home loan EMI", hint: "", default: 80000 },
    { id: "emi-other", label: "Other EMIs (auto, personal, education)", hint: "", default: 25000 },
    { id: "utilities", label: "Utilities", hint: "Electricity, water, gas, internet, mobile", default: 12000 },
    { id: "groceries", label: "Groceries & household", hint: "Provisions, daily needs", default: 35000 },
    { id: "transport", label: "Transport & fuel", hint: "Personal vehicle, cabs, public transit", default: 12000 },
    { id: "domestic", label: "Domestic help, cook, driver", hint: "", default: 20000 },
    { id: "education", label: "Children's education & coaching", hint: "Fees, books, tutoring", default: 35000 },
    { id: "healthcare", label: "Healthcare — regular & insurance", hint: "Premiums, OPD, medication", default: 15000 },
    { id: "dependents", label: "Dependent support", hint: "Parents, family obligations", default: 10000 },
    { id: "other-ess", label: "Other essentials", hint: "", default: 5000 },
  ];

  const DISCRETIONARY = [
    { id: "dining", label: "Dining out & food delivery", hint: "", default: 18000 },
    { id: "travel", label: "Travel & holidays", hint: "Annualised monthly equivalent", default: 25000 },
    { id: "entertainment", label: "Entertainment & memberships", hint: "OTT, club, events", default: 8000 },
    { id: "lifestyle", label: "Shopping & lifestyle", hint: "Apparel, gadgets, home", default: 20000 },
    { id: "wellness", label: "Wellness & personal care", hint: "Salon, spa, gym, fitness", default: 8000 },
    { id: "gifts", label: "Gifts & social occasions", hint: "Weddings, festivals, philanthropy", default: 10000 },
    { id: "other-disc", label: "Other discretionary", hint: "", default: 5000 },
  ];

  // ============================================================
  // Build ledgers
  // ============================================================
  function buildLedger(containerId, items) {
    const c = document.getElementById(containerId);
    const hasAnyStop = items.some((i) => i.hasStop);
    if (hasAnyStop) c.classList.add("has-stop");
    c.innerHTML = items
      .map((it) => {
        const stopCell = it.hasStop
          ? `<div class="ledger-stop">
               <input type="number" class="stop-year" data-stop="${it.id}" value="${it.defaultStopYear}" min="${CURRENT_YEAR}" max="${CURRENT_YEAR + 60}" placeholder="Year ends" />
               <span class="stop-suffix">closes</span>
             </div>`
          : hasAnyStop
          ? `<div class="ledger-stop ledger-stop-empty"><span>—</span></div>`
          : "";
        return `
        <div class="ledger-row${it.hasStop ? " has-stop" : ""}">
          <div>
            <span class="ledger-label">${it.label}</span>
            ${it.hint ? `<span class="ledger-hint">${it.hint}</span>` : ""}
          </div>
          ${stopCell}
          <div class="input-prefix">
            <span>₹</span>
            <input type="number" data-key="${it.id}" value="${it.default}" min="0" step="500" />
          </div>
        </div>
      `;
      })
      .join("");
  }

  buildLedger("r-instruments", RETIREMENT_INSTRUMENTS);
  buildLedger("r-expenses", RETIREMENT_EXPENSES);
  buildLedger("e-essentials", ESSENTIALS);
  buildLedger("e-discretionary", DISCRETIONARY);

  // ============================================================
  // Helpers
  // ============================================================
  function num(id) {
    const el = document.getElementById(id);
    if (!el) return 0;
    const v = parseFloat(el.value);
    return isFinite(v) ? v : 0;
  }

  function ledgerSum(containerId) {
    const inputs = document.querySelectorAll(`#${containerId} input[type="number"][data-key]`);
    let total = 0;
    inputs.forEach((i) => {
      const v = parseFloat(i.value);
      if (isFinite(v)) total += v;
    });
    return total;
  }

  function ledgerSumActiveAtYear(containerId, targetYear) {
    const rows = document.querySelectorAll(`#${containerId} .ledger-row`);
    let total = 0;
    rows.forEach((row) => {
      const amtInput = row.querySelector('input[type="number"][data-key]');
      const stopInput = row.querySelector('input[type="number"][data-stop]');
      const v = parseFloat(amtInput && amtInput.value);
      if (!isFinite(v)) return;
      if (stopInput) {
        const stop = parseFloat(stopInput.value);
        if (isFinite(stop) && stop < targetYear) return; // EMI has closed by retirement
      }
      total += v;
    });
    return total;
  }

  function abbrev(v) {
    if (v == null || !isFinite(v)) return "—";
    if (Math.abs(v) >= 1e7) return "₹" + (v / 1e7).toFixed(2) + " Cr";
    if (Math.abs(v) >= 1e5) return "₹" + (v / 1e5).toFixed(1) + " L";
    if (Math.abs(v) >= 1e3) return "₹" + (v / 1e3).toFixed(0) + " K";
    return "₹" + Math.round(v);
  }

  function abbrevShort(v) {
    if (v == null || !isFinite(v)) return "—";
    if (Math.abs(v) >= 1e7) return "₹" + (v / 1e7).toFixed(1) + "Cr";
    if (Math.abs(v) >= 1e5) return "₹" + (v / 1e5).toFixed(1) + "L";
    if (Math.abs(v) >= 1e3) return "₹" + (v / 1e3).toFixed(0) + "K";
    return "₹" + Math.round(v);
  }

  function abbrevFull(v) {
    if (Math.abs(v) >= 1e7) return fmtINR.format(v) + ` (${(v / 1e7).toFixed(2)} Cr)`;
    return fmtINR.format(v);
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
      if (waterfall) waterfall.resize();
      if (emergencyChart) emergencyChart.resize();
    });
  });

  // ============================================================
  // RETIREMENT
  // ============================================================
  let waterfall, depletionChart, allocationDonut, expenseDonut;
  let userTouchedTarget = false;

  function simulateAccumulation(start, monthly, annualRate, years, stepup) {
    const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
    let corpus = start;
    let totalInvested = start;
    let totalReturns = 0;
    let m = monthly;
    const rows = [];

    for (let y = 1; y <= years; y++) {
      const opening = corpus;
      let yearContribution = 0;
      let yearReturn = 0;

      for (let i = 0; i < 12; i++) {
        const interest = corpus * monthlyRate;
        corpus += interest + m;
        yearReturn += interest;
        yearContribution += m;
      }

      totalInvested += yearContribution;
      totalReturns += yearReturn;

      rows.push({
        year: y,
        opening,
        contribution: yearContribution,
        returns: yearReturn,
        closing: corpus,
      });

      m = m * (1 + stepup);
    }

    return { finalCorpus: corpus, totalInvested, totalReturns, rows, finalMonthlySIP: m / (1 + stepup) };
  }

  function calcRetirement() {
    const monthly = ledgerSum("r-instruments");
    document.getElementById("r-monthlyTotal").textContent = fmtINR.format(monthly);

    const currentAge = num("r-currentAge");
    const retireAge = num("r-retireAge");
    const startCorpus = num("r-startCorpus");
    const annualRate = num("r-rate") / 100;
    const inflation = num("r-inflation") / 100;
    const stepup = num("r-stepup") / 100;

    const retYears = num("r-retYears");
    const postRate = num("r-postRate") / 100;

    const years = Math.max(0, retireAge - currentAge);
    const retirementYear = CURRENT_YEAR + years;

    const expenseTotal = ledgerSum("r-expenses");
    const expenseAtRetire = ledgerSumActiveAtYear("r-expenses", retirementYear);
    document.getElementById("r-expenseTotal").textContent = fmtINR.format(expenseTotal);
    document.getElementById("r-expenseAtRetire").textContent = fmtINR.format(expenseAtRetire);
    window.__projectedAtRetire = expenseAtRetire;

    // Auto-sync target spend the first time / whenever the user hasn't manually overridden
    const targetEl = document.getElementById("r-targetSpend");
    if (!userTouchedTarget && expenseAtRetire > 0) {
      targetEl.value = Math.round(expenseAtRetire);
    }
    const targetSpendToday = num("r-targetSpend");

    // Main projection
    const main = simulateAccumulation(startCorpus, monthly, annualRate, years, stepup);
    const finalCorpus = main.finalCorpus;

    // Enrich rows with age + real value
    const rows = main.rows.map((r, i) => ({
      ...r,
      age: currentAge + r.year,
      realClosing: r.closing / Math.pow(1 + inflation, r.year),
    }));

    const realFinal = years > 0 ? finalCorpus / Math.pow(1 + inflation, years) : finalCorpus;
    const realRate = (1 + annualRate) / (1 + inflation) - 1;

    document.getElementById("r-finalNominal").textContent = abbrev(finalCorpus);
    document.getElementById("r-finalNominalSub").textContent = fmtINR.format(finalCorpus);
    document.getElementById("r-finalReal").textContent = abbrev(realFinal);
    document.getElementById("r-totalInvested").textContent = abbrev(main.totalInvested);
    document.getElementById("r-totalReturns").textContent = abbrev(main.totalReturns);
    document.getElementById("r-realRate").textContent = (realRate * 100).toFixed(2) + "%";
    document.getElementById("r-years").textContent = years;

    // Personalised headline
    const clientName = (document.getElementById("clientName").value || "").trim();
    document.getElementById("r-headlineTitle").textContent =
      clientName ? `${clientName.split(" ")[0]}'s number` : "Your number";

    renderRetirementTable(rows);
    renderWaterfall(startCorpus, rows);
    renderLifestyle({ finalCorpus, targetSpendToday, yearsToRetire: years, inflation, retYears, postRate });
    renderCostOfWaiting({ startCorpus, monthly, annualRate, years, stepup, finalCorpus });
    renderMilestones({ rows, currentAge });
    renderDepletion({ finalCorpus, targetSpendToday, yearsToRetire: years, inflation, retYears, postRate, currentAge });
    renderAllocationDonut();
    renderExpenseDonut(retirementYear);

    // Update active scenario snapshot if any
    captureScenarioIfActive({ finalCorpus, realFinal, targetSpendToday, years });
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
    const bucketSize = rows.length > 20 ? 5 : rows.length > 10 ? 2 : 1;

    const buckets = [];
    for (let i = 0; i < rows.length; i += bucketSize) {
      const slice = rows.slice(i, i + bucketSize);
      const last = slice[slice.length - 1];
      buckets.push({
        label: bucketSize === 1 ? `${last.age}` : `${slice[0].age}–${last.age}`,
        contribution: slice.reduce((s, r) => s + r.contribution, 0),
        returns: slice.reduce((s, r) => s + r.returns, 0),
        closing: last.closing,
      });
    }

    const labels = ["Today", ...buckets.map((b) => `Age ${b.label}`)];
    const baseSeries = [0];
    const contribSeries = [startCorpus];
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
            label: "Carried-forward base",
            data: baseSeries,
            backgroundColor: "rgba(20, 33, 61, 0.78)",
            borderColor: "rgba(20, 33, 61, 1)",
            borderWidth: 0,
            stack: "s",
            borderRadius: 1,
          },
          {
            label: "Capital committed",
            data: contribSeries,
            backgroundColor: "rgba(176, 141, 87, 0.85)",
            borderColor: "rgba(176, 141, 87, 1)",
            borderWidth: 0,
            stack: "s",
            borderRadius: 1,
          },
          {
            label: "Returns earned",
            data: returnsSeries,
            backgroundColor: "rgba(47, 125, 91, 0.78)",
            borderColor: "rgba(47, 125, 91, 1)",
            borderWidth: 0,
            stack: "s",
            borderRadius: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
            ticks: { color: "#6b7180", font: { family: "Inter", size: 11 } },
            grid: { display: false },
            border: { color: "#e8e1cf" },
          },
          y: {
            stacked: true,
            ticks: { color: "#6b7180", font: { family: "Inter", size: 11 }, callback: (v) => abbrev(v) },
            grid: { color: "rgba(20,33,61,0.05)" },
            border: { display: false },
          },
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: "#1f2c4a",
              font: { family: "Inter", size: 12 },
              boxWidth: 10,
              boxHeight: 10,
              padding: 16,
            },
          },
          tooltip: {
            backgroundColor: "#fff",
            titleColor: "#14213d",
            bodyColor: "#1f2c4a",
            borderColor: "#e8e1cf",
            borderWidth: 1,
            padding: 12,
            titleFont: { family: "Inter", weight: "600" },
            bodyFont: { family: "Inter" },
            callbacks: {
              label: (ctx) => {
                const ds = ctx.dataset.label;
                const v = ctx.parsed.y;
                if (ds === "Carried-forward base" && ctx.dataIndex === 0) return null;
                return `${ds}: ${fmtINR.format(v)}`;
              },
              footer: (items) => {
                if (!items.length) return "";
                const total = items.reduce((s, it) => s + it.parsed.y, 0);
                return `Cumulative: ${fmtINR.format(total)}`;
              },
            },
          },
        },
      },
    });
  }

  function renderLifestyle({ finalCorpus, targetSpendToday, yearsToRetire, inflation, retYears, postRate }) {
    const el = document.getElementById("r-lifestyle");
    if (!targetSpendToday || targetSpendToday <= 0) {
      el.innerHTML = `<div class="lifestyle-card"><div class="lifestyle-label">Set a target spend</div><div class="lifestyle-foot">Enter a desired retirement monthly spend to see the gap analysis.</div></div>`;
      return;
    }

    const targetSpendAtRetire = targetSpendToday * Math.pow(1 + inflation, yearsToRetire);
    const annualSpendAtRetire = targetSpendAtRetire * 12;

    // Required corpus = PV of inflation-adjusted annuity at post-retirement real return
    const realPostRate = (1 + postRate) / (1 + inflation) - 1;
    let required;
    if (Math.abs(realPostRate) < 1e-8) {
      required = annualSpendAtRetire * retYears;
    } else {
      required = (annualSpendAtRetire * (1 - Math.pow(1 + realPostRate, -retYears))) / realPostRate;
    }

    const surplus = finalCorpus - required;
    const status = surplus >= 0 ? "surplus" : "deficit";
    const statusLabel = surplus >= 0 ? "On course" : "Shortfall";

    el.innerHTML = `
      <div class="lifestyle-card">
        <div class="lifestyle-label">Lifestyle cost at retirement</div>
        <div class="lifestyle-value">${abbrev(targetSpendAtRetire)}/mo</div>
        <div class="lifestyle-foot">${fmtINR.format(targetSpendToday)} today, inflated at ${(inflation * 100).toFixed(1)}% over ${yearsToRetire} yrs</div>
      </div>
      <div class="lifestyle-card">
        <div class="lifestyle-label">Corpus required to fund ${retYears} years</div>
        <div class="lifestyle-value">${abbrev(required)}</div>
        <div class="lifestyle-foot">Real return assumed: ${(realPostRate * 100).toFixed(2)}%</div>
      </div>
      <div class="lifestyle-card ${status}">
        <div class="lifestyle-label">Projected corpus</div>
        <div class="lifestyle-value">${abbrev(finalCorpus)}</div>
        <div class="lifestyle-foot">${fmtINR.format(finalCorpus)}</div>
      </div>
      <div class="lifestyle-card ${status}">
        <div class="lifestyle-label">${statusLabel}</div>
        <div class="lifestyle-value">${surplus >= 0 ? "+" : "−"}${abbrev(Math.abs(surplus))}</div>
        <div class="lifestyle-foot">${
          surplus >= 0
            ? "Buffer over the lifestyle target."
            : "Increase contributions, extend horizon, or moderate the target."
        }</div>
      </div>
    `;
  }

  // ============================================================
  // COST OF WAITING
  // ============================================================
  function renderCostOfWaiting({ startCorpus, monthly, annualRate, years, stepup, finalCorpus }) {
    const wrap = document.getElementById("r-costOfWaiting");
    if (!wrap) return;
    const valueEl = wrap.querySelector(".cow-value");
    const footEl = wrap.querySelector(".cow-foot");

    if (years <= 5 || monthly === 0) {
      valueEl.textContent = "—";
      footEl.textContent = "Enter your monthly investment to see this estimate.";
      return;
    }

    // Project as if started 5 years later — same total horizon, fewer accumulating years
    // Starting corpus continues to compound over 5 idle years too (no contributions)
    const idleYears = 5;
    const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
    let idleCorpus = startCorpus;
    for (let i = 0; i < idleYears * 12; i++) idleCorpus *= 1 + monthlyRate;

    const delayed = simulateAccumulation(idleCorpus, monthly, annualRate, years - idleYears, stepup);
    const lostCorpus = finalCorpus - delayed.finalCorpus;
    const lostPct = finalCorpus > 0 ? (lostCorpus / finalCorpus) * 100 : 0;

    valueEl.textContent = "−" + abbrev(lostCorpus);
    footEl.textContent = `Starting five years from now leaves ${lostPct.toFixed(0)}% of the corpus on the table — about ${abbrev(delayed.finalCorpus)} versus ${abbrev(finalCorpus)}.`;
  }

  // ============================================================
  // MILESTONES TIMELINE
  // ============================================================
  function renderMilestones({ rows, currentAge }) {
    const el = document.getElementById("r-timeline");
    if (!el || !rows.length) return;

    const maxCorpus = rows[rows.length - 1].closing;
    const candidateMarks = [1e7, 2e7, 5e7, 1e8, 2e8, 5e8, 1e9, 2e9];
    const marks = candidateMarks.filter((v) => v <= maxCorpus);

    if (!marks.length) {
      el.innerHTML = `<div class="timeline-empty">The first crore lies beyond this projection horizon.</div>`;
      return;
    }

    const milestones = marks.map((val) => {
      const row = rows.find((r) => r.closing >= val);
      return { value: val, age: row.age, year: CURRENT_YEAR + row.year };
    });

    const startAge = currentAge;
    const endAge = rows[rows.length - 1].age;
    const span = endAge - startAge;

    const markersHTML = milestones
      .map((m) => {
        const pct = span > 0 ? ((m.age - startAge) / span) * 100 : 50;
        const isMajor = m.value === 1e7 || m.value === 1e8;
        return `
          <div class="timeline-marker" style="left:${pct}%">
            <span class="timeline-label-above">${abbrevShort(m.value)}</span>
            <span class="timeline-dot ${isMajor ? "milestone-major" : ""}"></span>
            <span class="timeline-label-below"><span class="age">Age ${m.age}</span> · ${m.year}</span>
          </div>
        `;
      })
      .join("");

    el.innerHTML = `
      <div class="timeline-rail">${markersHTML}</div>
    `;
  }

  // ============================================================
  // DEPLETION SIM (post-retirement drawdown)
  // ============================================================
  function simulateDepletion({ corpus, annualSpendAtRetire, postRate, inflation, retYears }) {
    const out = [{ year: 0, balance: corpus }];
    let bal = corpus;
    let spend = annualSpendAtRetire;
    let runsOutAtYear = null;

    for (let y = 1; y <= retYears; y++) {
      bal = bal * (1 + postRate) - spend;
      if (bal < 0 && runsOutAtYear === null) {
        runsOutAtYear = y;
        bal = 0;
      }
      out.push({ year: y, balance: Math.max(0, bal) });
      spend *= 1 + inflation;
    }

    return { points: out, runsOutAtYear };
  }

  function renderDepletion({ finalCorpus, targetSpendToday, yearsToRetire, inflation, retYears, postRate, currentAge }) {
    const note = document.getElementById("r-depletionNote");
    if (!targetSpendToday || finalCorpus <= 0) {
      if (depletionChart) { depletionChart.destroy(); depletionChart = null; }
      const ctx = document.getElementById("depletionChart").getContext("2d");
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      note.textContent = "Set a target spend to see the drawdown.";
      note.className = "depletion-note";
      return;
    }

    const annualSpend = targetSpendToday * Math.pow(1 + inflation, yearsToRetire) * 12;
    const sim = simulateDepletion({ corpus: finalCorpus, annualSpendAtRetire: annualSpend, postRate, inflation, retYears });

    const retireAge = currentAge + yearsToRetire;
    const labels = sim.points.map((p) => `Age ${retireAge + p.year}`);
    const data = sim.points.map((p) => p.balance);

    if (depletionChart) depletionChart.destroy();

    const ctx = document.getElementById("depletionChart").getContext("2d");
    depletionChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Corpus balance",
          data,
          borderColor: "rgba(20, 33, 61, 0.9)",
          backgroundColor: (ctx) => {
            const chart = ctx.chart;
            const { ctx: c, chartArea } = chart;
            if (!chartArea) return "rgba(176, 141, 87, 0.15)";
            const g = c.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            g.addColorStop(0, "rgba(176, 141, 87, 0.30)");
            g.addColorStop(1, "rgba(176, 141, 87, 0.02)");
            return g;
          },
          tension: 0.3,
          fill: true,
          pointRadius: 0,
          borderWidth: 2.5,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { ticks: { color: "#6b7180", font: { family: "Inter", size: 11 }, maxTicksLimit: 8 }, grid: { display: false }, border: { color: "#e8e1cf" } },
          y: { ticks: { color: "#6b7180", font: { family: "Inter", size: 11 }, callback: (v) => abbrev(v) }, grid: { color: "rgba(20,33,61,0.05)" }, border: { display: false } },
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#fff",
            titleColor: "#14213d",
            bodyColor: "#1f2c4a",
            borderColor: "#e8e1cf",
            borderWidth: 1,
            padding: 12,
            callbacks: { label: (c) => "Balance: " + fmtINR.format(c.parsed.y) },
          },
        },
      },
    });

    if (sim.runsOutAtYear !== null) {
      const ageOut = retireAge + sim.runsOutAtYear;
      note.textContent = `At this lifestyle and these returns, the corpus runs out at age ${ageOut}. Plan to extend the horizon, raise contributions, or moderate the target.`;
      note.className = "depletion-note deficit";
    } else {
      const remaining = sim.points[sim.points.length - 1].balance;
      note.textContent = `At age ${retireAge + retYears}, the corpus still holds ${abbrev(remaining)} — comfortably ahead of the lifestyle target.`;
      note.className = "depletion-note surplus";
    }
  }

  // ============================================================
  // DONUTS
  // ============================================================
  const DONUT_PALETTE = [
    "#14213d", "#b08d57", "#2f7d5b", "#5a6584", "#d6b884",
    "#7c5d3a", "#3d537a", "#a16f1d", "#1f2c4a", "#98a0b0",
    "#4ea37a",
  ];

  function buildDonut(canvasId, legendId, items) {
    const total = items.reduce((s, i) => s + i.value, 0);
    const filtered = items.filter((i) => i.value > 0);

    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");

    if (!filtered.length || total === 0) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      document.getElementById(legendId).innerHTML = `<div class="muted small" style="text-align:center; padding: 12px 0;">No data yet.</div>`;
      return null;
    }

    const data = {
      labels: filtered.map((i) => i.label),
      datasets: [{
        data: filtered.map((i) => i.value),
        backgroundColor: filtered.map((_, idx) => DONUT_PALETTE[idx % DONUT_PALETTE.length]),
        borderColor: "#fdfaf3",
        borderWidth: 2,
        hoverOffset: 6,
      }],
    };

    const chart = new Chart(ctx, {
      type: "doughnut",
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#fff",
            titleColor: "#14213d",
            bodyColor: "#1f2c4a",
            borderColor: "#e8e1cf",
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: (c) => {
                const v = c.parsed;
                const pct = ((v / total) * 100).toFixed(1);
                return `${c.label}: ${fmtINR.format(v)} (${pct}%)`;
              },
            },
          },
        },
      },
    });

    document.getElementById(legendId).innerHTML = filtered
      .map((it, idx) => {
        const pct = ((it.value / total) * 100).toFixed(1);
        const color = DONUT_PALETTE[idx % DONUT_PALETTE.length];
        return `
          <div class="donut-legend-row">
            <span class="donut-legend-swatch" style="background:${color}"></span>
            <span class="donut-legend-label">${it.label}</span>
            <span class="donut-legend-amount">${abbrevShort(it.value)}</span>
            <span class="donut-legend-pct">${pct}%</span>
          </div>
        `;
      })
      .join("");

    return chart;
  }

  function renderAllocationDonut() {
    if (allocationDonut) allocationDonut.destroy();
    const items = RETIREMENT_INSTRUMENTS.map((it) => {
      const inp = document.querySelector(`#r-instruments input[data-key="${it.id}"]`);
      const v = parseFloat(inp && inp.value);
      return { label: it.label.replace(/\s*\(.*?\)\s*/g, "").trim(), value: isFinite(v) ? v : 0 };
    });
    allocationDonut = buildDonut("allocationDonut", "allocationLegend", items);
  }

  function renderExpenseDonut(retirementYear) {
    if (expenseDonut) expenseDonut.destroy();
    const items = RETIREMENT_EXPENSES.map((it) => {
      const inp = document.querySelector(`#r-expenses input[data-key="${it.id}"]`);
      const v = parseFloat(inp && inp.value);
      return { label: it.label.split(" — ")[0].split(",")[0].trim(), value: isFinite(v) ? v : 0 };
    });
    expenseDonut = buildDonut("expenseDonut", "expenseLegend", items);
  }

  // ============================================================
  // SCENARIO COMPARE
  // ============================================================
  const scenarios = { A: null, B: null };
  let activePlan = null;

  function captureScenarioIfActive(snapshot) {
    if (!activePlan) return;
    scenarios[activePlan] = { ...scenarios[activePlan], ...snapshot, savedAt: Date.now() };
    renderComparePanel();
  }

  function saveScenario(slot) {
    activePlan = slot;
    scenarios[slot] = {}; // mark as active; will be filled by next calc
    calcRetirement(); // triggers captureScenarioIfActive
    activePlan = null;
    document.querySelector(`.scenario-btn[data-save="${slot}"]`).classList.add("has-data");
    renderComparePanel();
  }

  function clearScenarios() {
    scenarios.A = null;
    scenarios.B = null;
    document.querySelectorAll(".scenario-btn[data-save]").forEach((b) => b.classList.remove("has-data"));
    renderComparePanel();
  }

  function renderComparePanel() {
    const panel = document.getElementById("comparePanel");
    const a = scenarios.A;
    const b = scenarios.B;

    if (!a && !b) { panel.hidden = true; return; }
    panel.hidden = false;

    const setCell = (slot, plan) => {
      const valEl = document.querySelector(`[data-plan-value="${slot}"]`);
      const footEl = document.querySelector(`[data-plan-foot="${slot}"]`);
      if (!plan) {
        valEl.textContent = "—";
        footEl.textContent = "Not yet saved.";
      } else {
        valEl.textContent = abbrev(plan.finalCorpus);
        footEl.textContent = `${abbrev(plan.realFinal)} in today's ₹ • ${plan.years} yrs`;
      }
    };
    setCell("A", a);
    setCell("B", b);

    const deltaEl = document.getElementById("compareDelta");
    const deltaFootEl = document.getElementById("compareDeltaFoot");
    if (a && b) {
      const diff = b.finalCorpus - a.finalCorpus;
      deltaEl.textContent = (diff >= 0 ? "+" : "−") + abbrev(Math.abs(diff));
      const pct = a.finalCorpus > 0 ? ((diff / a.finalCorpus) * 100).toFixed(1) : "—";
      deltaFootEl.textContent = `B vs A: ${pct}%`;
    } else {
      deltaEl.textContent = "—";
      deltaFootEl.textContent = "Save both plans to compare.";
    }
  }

  // ============================================================
  // EMERGENCY
  // ============================================================
  let emergencyChart;

  function calcEmergency() {
    const essTotal = ledgerSum("e-essentials");
    const discTotal = ledgerSum("e-discretionary");
    document.getElementById("e-essTotal").textContent = fmtINR.format(essTotal);
    document.getElementById("e-discTotal").textContent = fmtINR.format(discTotal);

    const current = num("e-currentCorpus");
    const annualRate = num("e-rate") / 100;
    const currentSaving = num("e-currentSaving");
    const aggressiveTopup = num("e-aggressive");
    const trimPct = num("e-trimPct") / 100;

    // Style the slider track
    const slider = document.getElementById("e-trimPct");
    slider.style.setProperty("--val", `${trimPct * 100}%`);
    document.getElementById("e-trimPctOut").textContent = `${Math.round(trimPct * 100)}%`;

    const trimAmount = discTotal * trimPct;
    const aggressivePace = currentSaving + trimAmount + aggressiveTopup;

    const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;

    document.getElementById("e-paceCurrent").textContent = fmtINR.format(currentSaving) + " / mo";
    document.getElementById("e-paceAggressive").textContent = fmtINR.format(aggressivePace) + " / mo";
    document.getElementById("e-paceBreakdown").textContent =
      `Base ${fmtINR.format(currentSaving)} + trim ${fmtINR.format(trimAmount)} + top-up ${fmtINR.format(aggressiveTopup)}`;

    const goals = [
      { months: 3, label: "Three-month cushion", sub: "Absorbs a short shock — medical event, role transition" },
      { months: 6, label: "Six-month buffer", sub: "The conventional resilience standard" },
      { months: 9, label: "Nine-month armour", sub: "For volatile sectors, sabbaticals, founder runways" },
    ];

    const goalsEl = document.getElementById("e-goals");
    const tbody = document.querySelector("#e-table tbody");
    goalsEl.innerHTML = "";
    tbody.innerHTML = "";

    const tableRows = [];

    goals.forEach((g) => {
      const target = g.months * essTotal;
      const gap = Math.max(0, target - current);
      const progress = target === 0 ? 100 : Math.min(100, (current / target) * 100);
      const met = current >= target && target > 0;

      const tCurrent = monthsToReach(current, target, currentSaving, monthlyRate);
      const tAggro = monthsToReach(current, target, aggressivePace, monthlyRate);

      const div = document.createElement("div");
      div.className = "goal";
      div.innerHTML = `
        <div class="goal-head">
          <div>
            <div class="goal-title">${g.label}</div>
            <div class="goal-amount">${g.sub} • Target ${fmtINR.format(target)}</div>
          </div>
          <span class="badge ${met ? "met" : progress >= 50 ? "partial" : "unmet"}">
            ${met ? "Achieved" : progress.toFixed(0) + "%"}
          </span>
        </div>
        <div class="progress"><div class="progress-fill ${met ? "met" : ""}" style="width:${progress}%"></div></div>
        <div class="goal-meta">
          <span>${met ? "Cushion in place" : "Gap " + fmtINR.format(gap)}</span>
          <span>${met ? "—" : `${fmtMonths(tAggro)} accelerated · ${fmtMonths(tCurrent)} current`}</span>
        </div>
      `;
      goalsEl.appendChild(div);

      tableRows.push({ label: `${g.months} months`, target, gap, tCurrent, tAggro });
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

    renderEmergencyChart(current, essTotal, currentSaving, aggressivePace, monthlyRate);
    renderTips({ current, essTotal, discTotal, trimAmount, aggressiveTopup, currentSaving, aggressivePace });
  }

  function monthsToReach(start, target, monthlyContrib, monthlyRate) {
    if (target <= 0) return 0;
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
    if (!isFinite(m)) return "Not at this pace";
    if (m === 0) return "Reached";
    if (m < 12) return `${m} mo`;
    const years = Math.floor(m / 12);
    const rem = m % 12;
    return rem === 0 ? `${years} yr` : `${years} yr ${rem} mo`;
  }

  function renderEmergencyChart(start, essTotal, paceCurrent, paceAggressive, monthlyRate) {
    const horizon = 36;
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
            borderColor: "rgba(20, 33, 61, 0.85)",
            backgroundColor: "rgba(20, 33, 61, 0.05)",
            tension: 0.25,
            fill: true,
            pointRadius: 0,
            borderWidth: 2,
          },
          {
            label: "Accelerated pace",
            data: dataAggressive,
            borderColor: "rgba(176, 141, 87, 1)",
            backgroundColor: "rgba(176, 141, 87, 0.10)",
            tension: 0.25,
            fill: true,
            pointRadius: 0,
            borderWidth: 2,
          },
          {
            label: "3-month",
            data: Array(horizon + 1).fill(3 * essTotal),
            borderColor: "rgba(47, 125, 91, 0.6)",
            borderDash: [5, 4],
            pointRadius: 0,
            borderWidth: 1.5,
            fill: false,
          },
          {
            label: "6-month",
            data: Array(horizon + 1).fill(6 * essTotal),
            borderColor: "rgba(161, 111, 29, 0.6)",
            borderDash: [5, 4],
            pointRadius: 0,
            borderWidth: 1.5,
            fill: false,
          },
          {
            label: "9-month",
            data: Array(horizon + 1).fill(9 * essTotal),
            borderColor: "rgba(162, 48, 48, 0.6)",
            borderDash: [5, 4],
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
          x: {
            ticks: { color: "#6b7180", font: { family: "Inter", size: 11 }, maxTicksLimit: 13 },
            grid: { display: false },
            border: { color: "#e8e1cf" },
          },
          y: {
            ticks: { color: "#6b7180", font: { family: "Inter", size: 11 }, callback: (v) => abbrev(v) },
            grid: { color: "rgba(20,33,61,0.05)" },
            border: { display: false },
          },
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: { color: "#1f2c4a", font: { family: "Inter", size: 12 }, boxWidth: 10, boxHeight: 10, padding: 14 },
          },
          tooltip: {
            backgroundColor: "#fff",
            titleColor: "#14213d",
            bodyColor: "#1f2c4a",
            borderColor: "#e8e1cf",
            borderWidth: 1,
            padding: 12,
            callbacks: { label: (c) => `${c.dataset.label}: ${fmtINR.format(c.parsed.y)}` },
          },
        },
      },
    });
  }

  function renderTips({ current, essTotal, discTotal, trimAmount, aggressiveTopup, currentSaving, aggressivePace }) {
    const ul = document.getElementById("e-tips");
    const tips = [];

    const t3 = 3 * essTotal;
    const t6 = 6 * essTotal;
    const t9 = 9 * essTotal;

    if (essTotal === 0) {
      tips.push(`Walk through the essentials ledger to anchor the target. Without it, the milestones can't be sized.`);
    } else if (current < t3) {
      tips.push(`Priority is the three-month cushion — a gap of <strong>${fmtINR.format(t3 - current)}</strong>. Park it in a liquid mutual fund or a sweep-in fixed deposit for instant access.`);
    } else if (current < t6) {
      tips.push(`The three-month cushion is in place. Next milestone — six months — is <strong>${fmtINR.format(t6 - current)}</strong> away.`);
    } else if (current < t9) {
      tips.push(`A solid six-month buffer is set. The nine-month armour is <strong>${fmtINR.format(t9 - current)}</strong> away — useful for volatile sectors or planned sabbaticals.`);
    } else {
      tips.push(`Nine-month corpus achieved. Maintain it in low-volatility instruments and channel further savings to long-horizon equity for retirement.`);
    }

    if (discTotal > 0 && essTotal > 0) {
      const ratio = ((discTotal / (essTotal + discTotal)) * 100).toFixed(0);
      tips.push(`Discretionary spend is roughly <strong>${ratio}%</strong> of total monthly outflow — a meaningful lever.`);
    }

    if (trimAmount > 0) {
      tips.push(`Redirecting <strong>${fmtINR.format(trimAmount)}/month</strong> from discretionary into this fund shortens every milestone.`);
    }

    if (aggressiveTopup > 0) {
      tips.push(`The additional <strong>${fmtINR.format(aggressiveTopup)}/month</strong> top-up takes the accelerated pace to <strong>${fmtINR.format(aggressivePace)}/month</strong>.`);
    }

    if (currentSaving === 0 && aggressivePace === 0) {
      tips.push(`No monthly flow is being allocated — automating even a modest standing instruction on payday will compound quickly.`);
    }

    tips.push(`Keep this corpus deliberately conservative — liquid funds, sweep-in FDs, or a high-yield savings account. Equity belongs in the long-horizon portfolio.`);

    ul.innerHTML = tips.map((t) => `<li>${t}</li>`).join("");
  }

  // ============================================================
  // Live recalc
  // ============================================================
  const debounce = (fn, ms = 150) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  };

  const recalcRet = debounce(calcRetirement, 120);
  const recalcEm = debounce(calcEmergency, 120);

  document.querySelector("#retirement").addEventListener("input", recalcRet);
  document.querySelector("#emergency").addEventListener("input", recalcEm);

  // Track when the user manually edits the lifestyle target so we stop auto-syncing
  const targetEl = document.getElementById("r-targetSpend");
  targetEl.addEventListener("input", () => { userTouchedTarget = true; });

  // "Use the projected at-retirement outflow" link
  const syncBtn = document.getElementById("r-syncTarget");
  if (syncBtn) {
    syncBtn.addEventListener("click", () => {
      userTouchedTarget = false; // re-engage auto-sync
      calcRetirement();
    });
  }

  // ============================================================
  // Personalisation, date, print, scenarios
  // ============================================================
  function fmtDate(d) {
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  }
  document.getElementById("dateStamp").textContent = fmtDate(new Date());

  const clientEl = document.getElementById("clientName");
  const advisorEl = document.getElementById("advisorName");

  function syncTitle() {
    const c = (clientEl.value || "").trim();
    const a = (advisorEl.value || "").trim();
    const parts = ["Wealth Planner"];
    if (c) parts.push(c);
    parts.push(fmtDate(new Date()));
    document.title = parts.join(" — ");
    if (a) {
      // mirror to a hidden meta? skip — just keep value present for print
    }
    // Refresh the personalised headline
    document.getElementById("r-headlineTitle").textContent =
      c ? `${c.split(" ")[0]}'s number` : "Your number";
  }
  clientEl.addEventListener("input", syncTitle);
  advisorEl.addEventListener("input", syncTitle);

  document.getElementById("printBtn").addEventListener("click", () => {
    window.print();
  });

  document.querySelectorAll(".scenario-btn[data-save]").forEach((btn) => {
    btn.addEventListener("click", () => saveScenario(btn.dataset.save));
  });
  document.getElementById("clearScenarios").addEventListener("click", clearScenarios);

  // Initial render
  syncTitle();
  calcRetirement();
  calcEmergency();
})();

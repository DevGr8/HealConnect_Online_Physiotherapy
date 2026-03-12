(function () {
  const navbar = document.querySelector(".navbar");
  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileClose = document.getElementById("mobileClose");

  if (navbar) {
    window.addEventListener("scroll", () => {
      navbar.classList.toggle("scrolled", window.scrollY > 60);
    });
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => mobileMenu.classList.add("open"));
  }
  if (mobileClose) {
    mobileClose.addEventListener("click", () =>
      mobileMenu.classList.remove("open"),
    );
  }

  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a, #mobileMenu a").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === currentPage || (currentPage === "" && href === "index.html")) {
      link.classList.add("active");
    }
  });
})();

(function () {
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("visible");
      }),
    { threshold: 0.12 },
  );
  document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));
})();

const Notifications = {
  container: null,
  init() {
    this.container = document.getElementById("notificationBar");
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.id = "notificationBar";
      this.container.className = "notification-bar";
      document.body.appendChild(this.container);
    }
  },
  show(title, message, type = "info", duration = 5000) {
    if (!this.container) this.init();
    const icons = {
      info: "💬",
      warning: "⚠️",
      error: "❌",
      success: "✅",
      reminder: "🔔",
    };
    const el = document.createElement("div");
    el.className = `notification ${type !== "info" ? type : ""}`;
    el.innerHTML = `
      <span class="notif-icon">${icons[type] || icons.info}</span>
      <div class="notif-text">
        <strong>${title}</strong>
        <span>${message}</span>
      </div>
      <button class="notif-close" aria-label="Dismiss">✕</button>
    `;
    el.querySelector(".notif-close").addEventListener("click", () =>
      el.remove(),
    );
    this.container.appendChild(el);
    if (duration > 0) setTimeout(() => el.remove(), duration);
  },
};
Notifications.init();

(function () {
  const sessions = [
    {
      id: 1,
      therapist: "Dr. Sarah Chen",
      type: "Back Pain Therapy",
      dateOffset: 0.5,
      status: "upcoming",
    },
    {
      id: 2,
      therapist: "Dr. Marcus Webb",
      type: "Knee Rehabilitation",
      dateOffset: 1,
      status: "upcoming",
    },
    {
      id: 3,
      therapist: "Dr. Priya Sharma",
      type: "Shoulder Recovery",
      dateOffset: 24,
      status: "upcoming",
    },
  ];

  function checkReminders() {
    sessions.forEach((session) => {
      if (session.status !== "upcoming") return;
      const hoursUntil = session.dateOffset;
      if (hoursUntil <= 1) {
        const mins = Math.round(hoursUntil * 60);
        Notifications.show(
          "🔔 Session Reminder",
          `Your session with ${session.therapist} starts in ${mins < 60 ? mins + " minutes" : "1 hour"}`,
          "reminder",
          8000,
        );
      }
    });
  }

  setTimeout(checkReminders, 2000);

  window.HealConnect = window.HealConnect || {};
  window.HealConnect.checkReminders = checkReminders;
  window.HealConnect.sessions = sessions;
})();

(function () {
  const form = document.getElementById("bookingForm");
  if (!form) return;

  const tpCards = document.querySelectorAll(".tp-card");
  const tpHidden = document.getElementById("therapistHidden");
  const tpError = document.getElementById("therapistError");

  tpCards.forEach((card) => {
    function selectCard() {
      tpCards.forEach((c) => {
        c.classList.remove("selected");
        c.setAttribute("aria-checked", "false");
      });
      card.classList.add("selected");
      card.setAttribute("aria-checked", "true");
      tpHidden.value = card.dataset.name;
      if (tpError) tpError.style.display = "none";
      updateSummary();
    }
    card.addEventListener("click", selectCard);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        selectCard();
      }
    });
  });

  const slots = document.querySelectorAll(".time-slot:not(.unavailable)");
  const slotError = document.getElementById("slotError");
  let selectedSlot = null;

  slots.forEach((slot) => {
    slot.addEventListener("click", () => {
      slots.forEach((s) => s.classList.remove("selected"));
      slot.classList.add("selected");
      selectedSlot = slot.dataset.time;
      if (slotError) slotError.style.display = "none";
      updateSummary();
    });
    slot.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        slot.click();
      }
    });
  });

  const datePicker = document.getElementById("sessionDate");
  if (datePicker) datePicker.min = new Date().toISOString().split("T")[0];

  function formatDate(str) {
    if (!str) return "—";
    const d = new Date(str + "T00:00:00");
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function updateSummary() {
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val || "—";
    };
    set("sumName", document.getElementById("patientName")?.value);
    set("sumDate", formatDate(document.getElementById("sessionDate")?.value));
    set("sumTime", selectedSlot);
    set("sumTherapist", tpHidden?.value);
    set("sumCategory", document.getElementById("injuryCategory")?.value);
    const mode = document.getElementById("sessionType")?.value || "Online";
    set("sumType", mode);
    const sumFee = document.getElementById("sumFee");
    if (sumFee)
      sumFee.textContent = mode === "Home Visit" ? "₹1,799" : "₹1,299";
  }

  document
    .querySelectorAll(
      "#bookingForm input, #bookingForm select, #bookingForm textarea",
    )
    .forEach((el) => {
      el.addEventListener("input", updateSummary);
      el.addEventListener("change", updateSummary);
    });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    let valid = true;

    if (!tpHidden.value) {
      if (tpError) {
        tpError.style.display = "block";
        tpError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      valid = false;
    }
    if (!selectedSlot) {
      if (slotError) {
        slotError.style.display = "block";
        if (valid)
          slotError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      valid = false;
    }
    if (!valid) return;

    const btn = document.getElementById("bookSubmitBtn");
    if (btn) {
      btn.textContent = "Booking…";
      btn.disabled = true;
    }

    setTimeout(() => {
      Notifications.show(
        "Session Confirmed ✅",
        "Booked with " +
          tpHidden.value +
          " at " +
          selectedSlot +
          ". Check your email!",
        "success",
        9000,
      );
      this.reset();
      tpCards.forEach((c) => {
        c.classList.remove("selected");
        c.setAttribute("aria-checked", "false");
      });
      slots.forEach((s) => s.classList.remove("selected"));
      selectedSlot = null;
      tpHidden.value = "";
      if (btn) {
        btn.textContent = "Confirm Booking →";
        btn.disabled = false;
      }
      updateSummary();
    }, 1500);
  });

  updateSummary();
})();

(function () {
  if (!document.getElementById("exerciseGrid")) return;

  const exercises = [
    {
      id: 1,
      category: "back-pain",
      title: "Cat-Cow Stretch",
      description:
        "Gentle spinal flexion and extension to relieve lower back tension and improve mobility.",
      difficulty: "beginner",
      duration: "8:30",
      sets: "3 sets",
      reps: "12 reps",
      videoId: "kqnua4rJVVA",
      tag: "tag-back-pain",
      tagLabel: "Back Pain",
    },
    {
      id: 2,
      category: "back-pain",
      title: "Bird-Dog Exercise",
      description:
        "Core stabilization movement to strengthen lower back and glute muscles simultaneously.",
      difficulty: "intermediate",
      duration: "12:15",
      sets: "3 sets",
      reps: "10 reps",
      videoId: "wiFNA3sqjCA",
      tag: "tag-back-pain",
      tagLabel: "Back Pain",
    },
    {
      id: 3,
      category: "knee",
      title: "Terminal Knee Extension",
      description:
        "Targeted quadriceps strengthening exercise for knee stability and pain reduction.",
      difficulty: "beginner",
      duration: "6:45",
      sets: "2 sets",
      reps: "15 reps",
      videoId: "4BOTvaRaDnI",
      tag: "tag-knee",
      tagLabel: "Knee Rehab",
    },
    {
      id: 4,
      category: "knee",
      title: "Wall Squat Progression",
      description:
        "Progressive squat variations to rebuild knee strength after injury or surgery.",
      difficulty: "intermediate",
      duration: "14:20",
      sets: "3 sets",
      reps: "8 reps",
      videoId: "zhKJGrJGpEk",
      tag: "tag-knee",
      tagLabel: "Knee Rehab",
    },
    {
      id: 5,
      category: "shoulder",
      title: "Pendulum Shoulder Circles",
      description:
        "Passive range-of-motion exercise to gently mobilize a stiff or recovering shoulder.",
      difficulty: "beginner",
      duration: "5:00",
      sets: "2 sets",
      reps: "20 circles",
      videoId: "7p2PnMuq3ZY",
      tag: "tag-shoulder",
      tagLabel: "Shoulder Recovery",
    },
    {
      id: 6,
      category: "shoulder",
      title: "Scapular Retraction",
      description:
        "Strengthening the muscles between shoulder blades to improve posture and stability.",
      difficulty: "intermediate",
      duration: "9:50",
      sets: "3 sets",
      reps: "12 reps",
      videoId: "lbozu0DPcYI",
      tag: "tag-shoulder",
      tagLabel: "Shoulder Recovery",
    },
    {
      id: 7,
      category: "post-surgery",
      title: "Ankle Pump & Circles",
      description:
        "Post-surgical circulation exercise to prevent clots and reduce lower limb swelling.",
      difficulty: "beginner",
      duration: "4:30",
      sets: "4 sets",
      reps: "15 reps",
      videoId: "9N_XVagzMKo",
      tag: "tag-post-surgery",
      tagLabel: "Post-Surgery",
    },
    {
      id: 8,
      category: "post-surgery",
      title: "Scar Tissue Mobilization",
      description:
        "Gentle soft-tissue techniques to improve flexibility and reduce scar adhesions.",
      difficulty: "advanced",
      duration: "18:00",
      sets: "1 set",
      reps: "5 min",
      videoId: "oBhMPQOFDZM",
      tag: "tag-post-surgery",
      tagLabel: "Post-Surgery",
    },
    {
      id: 9,
      category: "back-pain",
      title: "Pelvic Tilt & Bridge",
      description:
        "Foundational glute and core exercise essential for lumbar spine rehabilitation.",
      difficulty: "beginner",
      duration: "10:00",
      sets: "3 sets",
      reps: "12 reps",
      videoId: "2PuB8GHR1h4",
      tag: "tag-back-pain",
      tagLabel: "Back Pain",
    },
  ];

  const diffIcons = { beginner: "🟢", intermediate: "🟡", advanced: "🔴" };

  function renderCard(ex) {
    return `
      <article class="exercise-card" data-category="${ex.category}" data-id="${ex.id}">
        <div class="video-placeholder">
          <iframe 
            src="https://www.youtube.com/embed/${ex.videoId}?rel=0&modestbranding=1"
            title="${ex.title}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
          <div class="video-overlay">
            <div class="play-btn">▶</div>
          </div>
          <span class="video-duration">${ex.duration}</span>
        </div>
        <div class="exercise-info">
          <div class="exercise-meta">
            <span class="tag ${ex.tag}">${ex.tagLabel}</span>
            <span class="difficulty diff-${ex.difficulty}">
              <span class="diff-dot"></span>
              <span>${ex.difficulty.charAt(0).toUpperCase() + ex.difficulty.slice(1)}</span>
            </span>
          </div>
          <h3>${ex.title}</h3>
          <p>${ex.description}</p>
          <div class="exercise-footer">
            <div class="exercise-stats">
              <span>📦 ${ex.sets}</span>
              <span>🔁 ${ex.reps}</span>
            </div>
            <button class="btn-sm" data-id="${ex.id}">Start →</button>
          </div>
        </div>
      </article>
    `;
  }

  const grid = document.getElementById("exerciseGrid");

  if (grid && grid.children.length === 0) {
    grid.innerHTML = exercises.map(renderCard).join("");
  }

  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.dataset.filter;
      const cards = document.querySelectorAll(".exercise-card, .ex-card");
      cards.forEach((card) => {
        const match = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("hidden", !match);
        if (match) card.style.animation = "fadeUp 0.4s ease both";
      });
      const countEl = document.getElementById("exerciseCount");
      if (countEl) {
        const visible = Array.from(cards).filter(
          (c) => !c.classList.contains("hidden"),
        ).length;
        countEl.textContent = visible;
      }
    });
  });

  const countEl = document.getElementById("exerciseCount");
  if (countEl) countEl.textContent = exercises.length;

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn-sm");
    if (!btn) return;
    const card = btn.closest(".exercise-card");
    const overlay = card.querySelector(".video-overlay");
    if (overlay) overlay.style.display = "none";
    const iframe = card.querySelector("iframe");
    if (iframe) {
      iframe.src += "&autoplay=1";
      iframe.style.pointerEvents = "auto";
    }
    Notifications.show(
      "Exercise Started",
      "Great work! Track your reps in My Recovery.",
      "success",
      4000,
    );
  });

  const categorySelect = document.getElementById("categoryDropdown");
  if (categorySelect) {
    categorySelect.addEventListener("change", () => {
      const val = categorySelect.value;
      const matchBtn = document.querySelector(
        `.filter-btn[data-filter="${val}"]`,
      );
      if (matchBtn) matchBtn.click();
    });
  }
})();

(function () {
  if (!document.getElementById("recoveryPage")) return;

  let completedCount = parseInt(
    localStorage.getItem("hc_completed") || "8",
    10,
  );
  let upcomingCount = 3;

  function updateCounters() {
    const el = document.getElementById("completedCount");
    const el2 = document.getElementById("upcomingCount");
    if (el) el.textContent = completedCount;
    if (el2) el2.textContent = upcomingCount;
  }
  updateCounters();

  document.querySelectorAll(".mark-complete-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const item = this.closest(".session-item");
      const statusEl = item.querySelector(".session-status");
      if (statusEl && statusEl.classList.contains("status-upcoming")) {
        statusEl.className = "session-status status-completed";
        statusEl.textContent = "Completed";
        this.remove();
        completedCount++;
        upcomingCount = Math.max(0, upcomingCount - 1);
        localStorage.setItem("hc_completed", completedCount);
        updateCounters();
        Notifications.show(
          "Session Marked",
          "Great job completing your physiotherapy session! 💪",
          "success",
        );
      }
    });
  });

  const notesInput = document.getElementById("notesInput");
  const notesList = document.getElementById("notesList");
  const saveNoteBtn = document.getElementById("saveNoteBtn");
  let notes = JSON.parse(localStorage.getItem("hc_notes") || "[]");

  function renderNotes() {
    if (!notesList) return;
    if (notes.length === 0) {
      notesList.innerHTML =
        '<p style="color:var(--text-muted);font-size:0.88rem;padding:8px 0;">No notes yet. Add your first recovery note above.</p>';
      return;
    }
    notesList.innerHTML = notes
      .map(
        (n, i) => `
      <div class="note-chip">
        <p>${n.text}</p>
        <span class="note-date">${n.date}</span>
        <button class="note-delete" data-index="${i}" aria-label="Delete note">🗑</button>
      </div>
    `,
      )
      .join("");
    notesList.querySelectorAll(".note-delete").forEach((btn) => {
      btn.addEventListener("click", function () {
        notes.splice(parseInt(this.dataset.index), 1);
        localStorage.setItem("hc_notes", JSON.stringify(notes));
        renderNotes();
      });
    });
  }

  if (saveNoteBtn) {
    saveNoteBtn.addEventListener("click", () => {
      const text = notesInput?.value.trim();
      if (!text) {
        Notifications.show(
          "Empty Note",
          "Please write something before saving.",
          "warning",
        );
        return;
      }
      const now = new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      notes.unshift({ text, date: now });
      localStorage.setItem("hc_notes", JSON.stringify(notes));
      if (notesInput) notesInput.value = "";
      renderNotes();
      Notifications.show(
        "Note Saved",
        "Your recovery note has been saved.",
        "success",
        3000,
      );
    });
  }

  renderNotes();

  document.querySelectorAll(".progress-bar-fill").forEach((bar) => {
    const target = bar.dataset.width;
    setTimeout(() => {
      bar.style.width = target;
    }, 300);
  });
})();

(function () {
  const toggle = document.getElementById("pricingToggle");
  if (!toggle) return;

  let isMonthly = false;

  const perSessionPrices = {
    starter: { amount: "₹799", original: null, period: "per session" },
    plus: { amount: "₹1,299", original: null, period: "per session" },
    premium: { amount: "₹1,899", original: null, period: "per session" },
  };
  const monthlyPrices = {
    starter: {
      amount: "₹2,999",
      original: "₹3,196",
      period: "per month · 4 sessions",
    },
    plus: {
      amount: "₹4,499",
      original: "₹5,196",
      period: "per month · 4 sessions",
    },
    premium: {
      amount: "₹6,499",
      original: "₹7,596",
      period: "per month · 4 sessions",
    },
  };

  function updatePrices() {
    const prices = isMonthly ? monthlyPrices : perSessionPrices;
    Object.entries(prices).forEach(([plan, data]) => {
      const amountEl = document.querySelector(
        `[data-plan="${plan}"] .price-amount`,
      );
      const periodEl = document.querySelector(
        `[data-plan="${plan}"] .price-period`,
      );
      const origEl = document.querySelector(
        `[data-plan="${plan}"] .price-original`,
      );
      if (amountEl) amountEl.textContent = data.amount;
      if (periodEl) periodEl.textContent = data.period;
      if (origEl) {
        origEl.textContent = data.original ? `was ${data.original}` : "";
        origEl.style.display = data.original ? "block" : "none";
      }
    });

    toggle.classList.toggle("monthly", isMonthly);
    document
      .querySelector(".toggle-label.per-session")
      ?.classList.toggle("active", !isMonthly);
    document
      .querySelector(".toggle-label.monthly")
      ?.classList.toggle("active", isMonthly);
  }

  toggle.addEventListener("click", () => {
    isMonthly = !isMonthly;
    updatePrices();
  });

  updatePrices();
})();

window.selectPlan = function (card, planId) {
  document
    .querySelectorAll(".pricing-card")
    .forEach((c) => c.classList.remove("plan-selected"));
  card.classList.add("plan-selected");
  const radio = document.getElementById(
    "plan" + planId.charAt(0).toUpperCase() + planId.slice(1),
  );
  if (radio) radio.checked = true;
};

window.addToRecovery = function (btn, name) {
  btn.textContent = "Added ✓";
  btn.style.background = "var(--primary)";
  btn.style.color = "#fff";
  btn.disabled = true;
  if (window.Notifications) {
    Notifications.show(
      "Added to Your Plan",
      name + " has been added to your recovery programme.",
      "success",
      4000,
    );
  }
};

let player;
const citationList = document.getElementById("citation-list");
const detail = document.getElementById("citation-detail");
const citationCards = document.getElementById("citation-cards");
const citationSimple = document.getElementById("citation-simple");
const citations = Array.isArray(window.CITATIONS) ? window.CITATIONS : [];
const filterSlide = document.getElementById("filter-slide");
const filterUsage = document.getElementById("filter-usage");
const filterContainer = document.getElementById("citation-filters");

const detailTitle = detail ? detail.querySelector(".detail-title") : null;
const detailSource = detail ? detail.querySelector(".detail-source") : null;
const detailMeta = detail ? detail.querySelector(".detail-meta") : null;
const detailNotes = detail ? detail.querySelector(".detail-notes") : null;
const detailAttribution = detail ? detail.querySelector(".detail-attribution") : null;
const detailLink = detail ? detail.querySelector(".detail-link") : null;
const detailCitationsLink = detail ? detail.querySelector("#detail-citations-link") : null;
const detailLogo = detail ? detail.querySelector(".detail-logo") : null;
const detailImage = detail ? detail.querySelector(".detail-image") : null;
const detailImageWrap = detail ? detail.querySelector(".detail-image-wrap") : null;

const escapeSelector = (value) => {
  if (window.CSS && CSS.escape) return CSS.escape(value);
  return value.replace(/["\\]/g, "\\$&");
};

const formatTime = (seconds) => {
  if (Number.isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
};

const isImagePath = (path) => Boolean(path && /\.(png|jpe?g|gif|webp|svg)$/i.test(path));

const normalizeCitation = (citation) => {
  const source = citation.source || {};
  const presentation = citation.presentation || {};
  const fallbackSource = typeof citation.source === "string" ? citation.source : "";
  const type = source.type || (citation.sourcePath ? "image" : "link");
  const ref =
    type === "image"
      ? source.path || citation.sourcePath || ""
      : source.url || citation.url || "";

  return {
    number: citation.number,
    slug: citation.slug,
    time: Number(citation.time) || 0,
    slide: presentation.slide ?? citation.slide,
    claim: citation.claim || citation.title || "",
    notes: citation.notes || "",
    sourceTitle: source.title || citation.title || "",
    sourceAuthor: source.author || fallbackSource || "",
    sourceYear: source.year || "",
    attribution: source.attribution || "",
    usage: presentation.usage || source.usage || citation.usage || "",
    logo: source.logo || citation.logo || "",
    sourceType: type,
    sourceRef: ref,
  };
};

const normalizedCitations = citations.map(normalizeCitation);

const setActiveCitation = (button) => {
  document.querySelectorAll(".citation-item").forEach((item) => {
    item.classList.toggle("active", item === button);
  });

  const claim = button.getAttribute("data-claim");
  const sourceTitle = button.getAttribute("data-source-title");
  const sourceAuthor = button.getAttribute("data-source-author");
  const sourceYear = button.getAttribute("data-source-year");
  const attribution = button.getAttribute("data-attribution");
  const notes = button.getAttribute("data-notes");
  const sourceRef = button.getAttribute("data-source-ref");
  const sourceType = button.getAttribute("data-source-type");
  const usage = button.getAttribute("data-usage");
  const slide = button.getAttribute("data-slide");
  const number = button.getAttribute("data-number");
  const logo = button.getAttribute("data-logo");
  const slug = button.getAttribute("data-slug");

  if (!detailTitle || !detailSource || !detailNotes || !detailLink) return;

  detailTitle.textContent = number ? `${number}. ${claim || "Citation"}` : claim || "Citation";
  detailSource.textContent = [sourceAuthor, sourceYear && `(${sourceYear})`, sourceTitle]
    .filter(Boolean)
    .join(" ");
  detailNotes.textContent = notes || "";
  if (detailMeta) {
    const metaParts = [];
    if (slide) metaParts.push(`Slide ${slide}`);
    if (usage) metaParts.push(usage);
    detailMeta.textContent = metaParts.join(" • ");
    detailMeta.hidden = metaParts.length === 0;
  }
  if (detailAttribution) {
    detailAttribution.textContent = attribution ? `Attribution: ${attribution}` : "";
    detailAttribution.hidden = !attribution;
  }
  detailLink.href = sourceRef || "#";
  detailLink.textContent = sourceRef ? "Open source" : "Source not available";
  detailLink.setAttribute("aria-disabled", sourceRef ? "false" : "true");

  if (detailCitationsLink) {
    if (slug) {
      detailCitationsLink.href = `citations.html#cite=${encodeURIComponent(slug)}`;
      detailCitationsLink.hidden = false;
    } else {
      detailCitationsLink.hidden = true;
    }
  }

  if (detailLogo) {
    if (logo) {
      detailLogo.src = logo;
      detailLogo.alt = `${sourceAuthor || "Source"} logo`;
      detailLogo.hidden = false;
    } else {
      detailLogo.hidden = true;
    }
  }

  if (detailImage) {
    if (sourceType === "image" && isImagePath(sourceRef)) {
      detailImage.src = sourceRef;
      detailImage.alt = sourceTitle || "Citation image";
      detailImage.hidden = false;
    } else {
      detailImage.hidden = true;
    }
    if (detailImageWrap) {
      detailImageWrap.hidden = detailImage.hidden;
    }
  }

  if (detail) {
    detail.classList.toggle(
      "has-image",
      Boolean(detailImageWrap && !detailImageWrap.hidden),
    );
  }
};

const getCitationSlugFromLocation = () => {
  const params = new URLSearchParams(window.location.search);
  const querySlug = params.get("cite");
  if (querySlug) return querySlug;

  const hash = window.location.hash.replace(/^#/, "");
  if (!hash) return null;
  if (hash.startsWith("cite=")) return decodeURIComponent(hash.slice(5));
  return decodeURIComponent(hash);
};

const findCitationBySlug = (slug) => {
  if (!slug) return null;
  const safeSlug = escapeSelector(slug);
  return document.querySelector(`.citation-item[data-slug="${safeSlug}"]`);
};

const buildCitationItem = (citation) => {
  const normalized = normalizeCitation(citation);
  const item = document.createElement("li");
  const button = document.createElement("button");
  button.className = "citation-item";
  button.setAttribute("data-number", normalized.number);
  button.setAttribute("data-slug", normalized.slug);
  button.setAttribute("data-time", normalized.time);
  button.setAttribute("data-claim", normalized.claim);
  button.setAttribute("data-slide", normalized.slide ?? "");
  button.setAttribute("data-usage", normalized.usage);
  button.setAttribute("data-source-title", normalized.sourceTitle);
  button.setAttribute("data-source-author", normalized.sourceAuthor);
  button.setAttribute("data-source-year", normalized.sourceYear);
  button.setAttribute("data-attribution", normalized.attribution);
  button.setAttribute("data-source-type", normalized.sourceType);
  button.setAttribute("data-source-ref", normalized.sourceRef);
  button.setAttribute("data-notes", normalized.notes);
  button.setAttribute("data-logo", normalized.logo || "");

  const logo = document.createElement("img");
  logo.className = "citation-logo";
  logo.src = normalized.logo || "";
  logo.alt = `${normalized.sourceAuthor || "Source"} logo`;
  logo.loading = "lazy";
  if (!normalized.logo) {
    logo.hidden = true;
  }

  const meta = document.createElement("div");
  meta.className = "citation-meta";

  const time = document.createElement("span");
  time.className = "time";
  time.textContent = formatTime(normalized.time);

  const text = document.createElement("span");
  text.className = "text";
  const label = normalized.sourceAuthor || normalized.sourceTitle || "Source";
  text.textContent = `${normalized.number} ${label}: ${normalized.claim}`;

  meta.append(time, text);
  button.append(logo, meta);
  item.appendChild(button);
  return item;
};

const renderCitations = () => {
  if (!citationList || citations.length === 0) return;
  citationList.innerHTML = "";
  citations.forEach((citation) => {
    citationList.appendChild(buildCitationItem(citation));
  });
};

const buildCitationCard = (citation) => {
  const normalized = normalizeCitation(citation);
  const card = document.createElement("article");
  card.className = "citation-card";

  const number = document.createElement("div");
  number.className = "citation-number";
  number.textContent = `${normalized.number}`;

  const heading = document.createElement("h3");
  heading.className = "citation-title";
  heading.textContent = normalized.sourceAuthor || normalized.sourceTitle;

  const claim = document.createElement("p");
  claim.className = "citation-claim";
  claim.textContent = normalized.claim;

  const notes = document.createElement("p");
  notes.className = "citation-notes";
  notes.textContent = normalized.notes;

  const actions = document.createElement("div");
  actions.className = "citation-actions";

  const link = document.createElement("a");
  link.className = "detail-link";
  link.href = normalized.sourceRef || "#";
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = "Open source";

  const jump = document.createElement("a");
  jump.className = "detail-link";
  jump.href = `index.html#cite=${encodeURIComponent(normalized.slug)}`;
  jump.textContent = "View in video";

  actions.append(link, jump);
  card.append(number, heading, claim, notes, actions);
  return card;
};

const renderCitationCards = () => {
  if (!citationCards || citations.length === 0) return;
  citationCards.innerHTML = "";
  citations.forEach((citation) => {
    citationCards.appendChild(buildCitationCard(citation));
  });
};

const buildSimpleCitationItem = (normalized) => {
  const item = document.createElement("li");
  item.className = "simple-card";
  item.dataset.slug = normalized.slug;
  item.id = `cite-${normalized.slug}`;
  item.classList.add(
    normalized.sourceType === "image" ? "simple-card--image" : "simple-card--link",
  );

  const info = document.createElement("div");
  info.className = "simple-info";

  const header = document.createElement("div");
  header.className = "simple-header";

  const logo = document.createElement("img");
  logo.className = "simple-logo";
  logo.src = normalized.logo || "";
  logo.alt = `${normalized.sourceAuthor || "Source"} logo`;
  logo.loading = "lazy";
  if (!normalized.logo) {
    logo.hidden = true;
  }

  const number = document.createElement("div");
  number.className = "simple-number";
  number.textContent = `${normalized.number}`;

  const source = document.createElement("div");
  source.className = "simple-source-name";
  source.textContent = normalized.sourceAuthor || normalized.sourceTitle;

  header.append(logo, number, source);

  const subtitle = document.createElement("div");
  subtitle.className = "simple-subtitle";
  const subtitleParts = [];
  if (normalized.sourceTitle) subtitleParts.push(normalized.sourceTitle);
  if (normalized.sourceYear) subtitleParts.push(normalized.sourceYear);
  subtitle.textContent = subtitleParts.join(" · ");
  subtitle.hidden = subtitleParts.length === 0;

  const metaRow = document.createElement("div");
  metaRow.className = "simple-meta-row";
  const metaItems = [];
  if (normalized.slide) metaItems.push(`Slide ${normalized.slide}`);
  if (normalized.usage) metaItems.push(normalized.usage);
  if (normalized.sourceType) metaItems.push(normalized.sourceType.toUpperCase());
  metaItems.forEach((itemText) => {
    const chip = document.createElement("span");
    chip.className = "simple-chip";
    chip.textContent = itemText;
    metaRow.appendChild(chip);
  });
  metaRow.hidden = metaItems.length === 0;

  const claim = document.createElement("p");
  claim.className = "simple-claim";
  claim.textContent = normalized.claim;

  const notes = document.createElement("p");
  notes.className = "simple-notes";
  notes.textContent = normalized.notes;
  notes.hidden = !normalized.notes;

  const attribution = document.createElement("p");
  attribution.className = "simple-attribution";
  attribution.textContent = normalized.attribution ? `Attribution: ${normalized.attribution}` : "";
  attribution.hidden = !normalized.attribution;

  info.append(header, subtitle, metaRow, claim, notes, attribution);

  const aside = document.createElement("div");
  aside.className = "simple-aside";

  if (normalized.sourceType === "image" && isImagePath(normalized.sourceRef)) {
    const preview = document.createElement("img");
    preview.className = "simple-image";
    preview.src = normalized.sourceRef;
    preview.alt = normalized.sourceTitle || "Citation source image";
    preview.loading = "lazy";
    preview.decoding = "async";
    aside.append(preview);
  } else {
    const fileBox = document.createElement("div");
    fileBox.className = "simple-file";
    const fileLabel = document.createElement("div");
    fileLabel.textContent = "Source file";
    const fileName = document.createElement("div");
    fileName.className = "simple-file-name";
    fileName.textContent = normalized.sourceRef
      ? normalized.sourceRef.split("/").slice(-1)[0]
      : "Not provided";
    fileBox.append(fileLabel, fileName);
    aside.append(fileBox);
  }

  const link = document.createElement("a");
  link.className = "simple-link";
  link.href = normalized.sourceRef || "#";
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = "Open source";

  aside.append(link);
  item.append(info, aside);
  return item;
};

const renderSimpleCitations = (items = normalizedCitations) => {
  if (!citationSimple) return;
  citationSimple.innerHTML = "";

  if (items.length === 0) {
    const empty = document.createElement("li");
    empty.className = "simple-empty";
    empty.textContent = "No citations match these filters.";
    citationSimple.appendChild(empty);
    return;
  }

  items.forEach((citation) => {
    citationSimple.appendChild(buildSimpleCitationItem(citation));
  });
};

const scrollToSimpleCitation = () => {
  if (!citationSimple) return;
  const slug = getCitationSlugFromLocation();
  if (!slug) return;
  const safeSlug = escapeSelector(slug);
  const target = document.querySelector(`.simple-card[data-slug="${safeSlug}"]`);
  if (target) {
    document.querySelectorAll(".simple-card--focus").forEach((card) => {
      card.classList.remove("simple-card--focus");
    });
    target.classList.add("simple-card--focus");
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

const populateFilterOptions = () => {
  if (!filterContainer || !filterSlide || !filterUsage) return;

  const slides = Array.from(
    new Set(normalizedCitations.map((c) => c.slide).filter((value) => value !== undefined && value !== "")),
  ).sort((a, b) => Number(a) - Number(b));

  const usages = Array.from(
    new Set(normalizedCitations.map((c) => c.usage).filter((value) => value)),
  ).sort();

  if (slides.length === 0 && usages.length === 0) {
    filterContainer.hidden = true;
    return;
  }

  slides.forEach((slide) => {
    const option = document.createElement("option");
    option.value = String(slide);
    option.textContent = `Slide ${slide}`;
    filterSlide.appendChild(option);
  });

  usages.forEach((usage) => {
    const option = document.createElement("option");
    option.value = usage;
    option.textContent = usage;
    filterUsage.appendChild(option);
  });

  if (slides.length === 0) {
    filterSlide.parentElement.hidden = true;
  }
  if (usages.length === 0) {
    filterUsage.parentElement.hidden = true;
  }
};

const applyFilters = () => {
  if (!filterSlide || !filterUsage) return;
  const selectedSlide = filterSlide.value;
  const selectedUsage = filterUsage.value;

  const filtered = normalizedCitations.filter((citation) => {
    const slideMatch =
      selectedSlide === "all" || String(citation.slide) === String(selectedSlide);
    const usageMatch = selectedUsage === "all" || citation.usage === selectedUsage;
    return slideMatch && usageMatch;
  });

  renderSimpleCitations(filtered);
  scrollToSimpleCitation();
};

if (citationList) {
  citationList.addEventListener("click", (event) => {
    const button = event.target.closest(".citation-item");
    if (!button) return;

    const time = Number(button.getAttribute("data-time"));
    if (!Number.isNaN(time) && player && player.seekTo) {
      player.seekTo(time, true);
      player.playVideo();
    }

    setActiveCitation(button);

    const slug = button.getAttribute("data-slug");
    if (slug) {
      history.replaceState(null, "", `#cite=${encodeURIComponent(slug)}`);
    }
  });
}

renderCitations();
renderCitationCards();
renderSimpleCitations();
populateFilterOptions();
applyFilters();

if (filterSlide) {
  filterSlide.addEventListener("change", applyFilters);
}
if (filterUsage) {
  filterUsage.addEventListener("change", applyFilters);
}

const initialSlug = getCitationSlugFromLocation();
const initialCitation =
  findCitationBySlug(initialSlug) || document.querySelector(".citation-item");

if (initialCitation) {
  setActiveCitation(initialCitation);
  // Initial seek handled in onPlayerReady
}

const sortedCitations = citations
  .map((citation) => ({
    slug: citation.slug,
    time: Number(citation.time) || 0,
  }))
  .sort((a, b) => a.time - b.time);

const syncCitationWithVideo = () => {
  if (!player || !player.getCurrentTime || sortedCitations.length === 0) return;
  const current = player.getCurrentTime();
  let activeSlug = null;

  for (let i = 0; i < sortedCitations.length; i += 1) {
    if (sortedCitations[i].time <= current) {
      activeSlug = sortedCitations[i].slug;
    } else {
      break;
    }
  }

  if (!activeSlug) return;
  const activeButton = findCitationBySlug(activeSlug);
  if (activeButton && !activeButton.classList.contains("active")) {
    setActiveCitation(activeButton);
    activeButton.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
};

// --- YouTube API Setup ---
let checkInterval;

// Inject YouTube API script
const tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// Global callback for YouTube API
window.onYouTubeIframeAPIReady = function () {
  player = new YT.Player("presentation-video", {
    height: "100%",
    width: "100%",
    videoId: "Y-ipxCTr5nY", // Replace with your actual video ID
    playerVars: {
      playsinline: 1,
      modestbranding: 1,
      rel: 0,
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });
};

function onPlayerReady(event) {
  if (initialCitation) {
    const time = Number(initialCitation.getAttribute("data-time"));
    if (!Number.isNaN(time)) {
      player.seekTo(time, true);
    }
  }
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    checkInterval = setInterval(syncCitationWithVideo, 500);
  } else {
    clearInterval(checkInterval);
  }
}

import JSZip from "jszip";
import { ScormProject, Slide } from "./types";

/**
 * Generates a SCORM 2004 compliant package from a project
 */
export async function generateScormPackage(project: ScormProject): Promise<Blob> {
  const zip = new JSZip();

  // 1. Create imsmanifest.xml
  const manifest = generateManifest(project);
  zip.file("imsmanifest.xml", manifest);

  // 2. Create SCORM API wrapper
  zip.file("scorm_api.js", generateScormAPI());

  // 3. Create main HTML file
  zip.file("index.html", generateIndexHTML(project));

  // 4. Create styles
  zip.file("styles.css", generateStyles(project));

  // 5. Create content JS with slides data
  zip.file("content.js", generateContentJS(project));

  // 6. Create slide renderer
  zip.file("renderer.js", generateRendererJS());

  // 7. Add metadata
  zip.file("metadata.xml", generateMetadata(project));

  // Generate the zip file
  return await zip.generateAsync({ type: "blob" });
}

function generateManifest(project: ScormProject): string {
  const totalTime = project.slides.reduce((acc, s) => acc + (s.duration_seconds || 60), 0);
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${project.id}" version="1.0"
  xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_v1p3"
  xmlns:adlseq="http://www.adlnet.org/xsd/adlseq_v1p3"
  xmlns:adlnav="http://www.adlnet.org/xsd/adlnav_v1p3"
  xmlns:imsss="http://www.imsglobal.org/xsd/imsss">
  
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>2004 4th Edition</schemaversion>
  </metadata>
  
  <organizations default="org_${project.id}">
    <organization identifier="org_${project.id}">
      <title>${escapeXml(project.title)}</title>
      <item identifier="item_${project.id}" identifierref="resource_${project.id}">
        <title>${escapeXml(project.title)}</title>
        <imsss:sequencing>
          <imsss:deliveryControls completionSetByContent="true" objectiveSetByContent="true"/>
        </imsss:sequencing>
      </item>
    </organization>
  </organizations>
  
  <resources>
    <resource identifier="resource_${project.id}" type="webcontent" adlcp:scormType="sco" href="index.html">
      <file href="index.html"/>
      <file href="styles.css"/>
      <file href="content.js"/>
      <file href="renderer.js"/>
      <file href="scorm_api.js"/>
    </resource>
  </resources>
</manifest>`;
}

function generateScormAPI(): string {
  return `
// SCORM 2004 API Wrapper
var ScormAPI = (function() {
  var API = null;
  var initialized = false;
  var terminated = false;
  
  function findAPI(win) {
    var attempts = 0;
    while (!win.API_1484_11 && win.parent && win.parent !== win && attempts < 10) {
      win = win.parent;
      attempts++;
    }
    return win.API_1484_11 || null;
  }
  
  function getAPI() {
    if (!API) {
      API = findAPI(window);
      if (!API && window.opener) {
        API = findAPI(window.opener);
      }
    }
    return API;
  }
  
  return {
    initialize: function() {
      var api = getAPI();
      if (api && !initialized) {
        var result = api.Initialize("");
        initialized = (result === "true");
        return initialized;
      }
      // Fallback for testing without LMS
      initialized = true;
      return true;
    },
    
    terminate: function() {
      var api = getAPI();
      if (api && initialized && !terminated) {
        var result = api.Terminate("");
        terminated = (result === "true");
        return terminated;
      }
      return true;
    },
    
    getValue: function(element) {
      var api = getAPI();
      if (api && initialized) {
        return api.GetValue(element);
      }
      return "";
    },
    
    setValue: function(element, value) {
      var api = getAPI();
      if (api && initialized) {
        return api.SetValue(element, value) === "true";
      }
      return false;
    },
    
    commit: function() {
      var api = getAPI();
      if (api && initialized) {
        return api.Commit("") === "true";
      }
      return false;
    },
    
    setScore: function(score, max, min) {
      this.setValue("cmi.score.raw", score);
      this.setValue("cmi.score.max", max || 100);
      this.setValue("cmi.score.min", min || 0);
      this.setValue("cmi.score.scaled", score / (max || 100));
    },
    
    setProgress: function(progress) {
      this.setValue("cmi.progress_measure", progress / 100);
    },
    
    setCompleted: function() {
      this.setValue("cmi.completion_status", "completed");
      this.commit();
    },
    
    setPassed: function() {
      this.setValue("cmi.success_status", "passed");
      this.commit();
    },
    
    setFailed: function() {
      this.setValue("cmi.success_status", "failed");
      this.commit();
    },
    
    getBookmark: function() {
      return this.getValue("cmi.location") || "0";
    },
    
    setBookmark: function(location) {
      this.setValue("cmi.location", location.toString());
      this.commit();
    }
  };
})();

// Auto-initialize on load
window.addEventListener('load', function() {
  ScormAPI.initialize();
});

// Auto-terminate on unload
window.addEventListener('beforeunload', function() {
  ScormAPI.terminate();
});
`;
}

function generateIndexHTML(project: ScormProject): string {
  return `<!DOCTYPE html>
<html lang="${project.language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(project.title)}</title>
  <link rel="stylesheet" href="styles.css">
  <script src="scorm_api.js"></script>
  <script src="content.js"></script>
  <script src="renderer.js"></script>
</head>
<body>
  <div id="scorm-container">
    <header id="scorm-header">
      <div class="header-content">
        <h1 id="course-title">${escapeHtml(project.title)}</h1>
        <div id="progress-container">
          <span id="progress-text">0%</span>
          <div id="progress-bar"><div id="progress-fill"></div></div>
        </div>
      </div>
    </header>
    
    <main id="slide-container"></main>
    
    <footer id="scorm-footer">
      <div class="nav-buttons">
        <button id="btn-prev" onclick="navigatePrev()" disabled>← Anterior</button>
        <span id="slide-counter">1 / ${project.slides.length}</span>
        <button id="btn-next" onclick="navigateNext()">Siguiente →</button>
      </div>
    </footer>
  </div>
  
  <script>
    document.addEventListener('DOMContentLoaded', function() {
      initializeContent();
    });
  </script>
</body>
</html>`;
}

function generateStyles(project: ScormProject): string {
  const theme = project.settings.theme;
  return `
:root {
  --primary: ${theme.primary_color};
  --secondary: ${theme.secondary_color};
  --background: #ffffff;
  --foreground: #1a1a1a;
  --muted: #f5f5f5;
  --border: #e5e5e5;
  --radius: 8px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: ${theme.font_family}, system-ui, sans-serif;
  background: var(--background);
  color: var(--foreground);
  min-height: 100vh;
}

#scorm-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

#scorm-header {
  background: var(--primary);
  color: white;
  padding: 1rem 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
}

#course-title {
  font-size: 1.25rem;
  font-weight: 600;
}

#progress-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

#progress-bar {
  width: 150px;
  height: 8px;
  background: rgba(255,255,255,0.3);
  border-radius: 4px;
  overflow: hidden;
}

#progress-fill {
  height: 100%;
  background: white;
  width: 0%;
  transition: width 0.3s ease;
}

#slide-container {
  flex: 1;
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
}

#scorm-footer {
  border-top: 1px solid var(--border);
  padding: 1rem 2rem;
  background: var(--muted);
}

.nav-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
}

.nav-buttons button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: var(--radius);
  background: var(--primary);
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
}

.nav-buttons button:hover:not(:disabled) {
  opacity: 0.9;
}

.nav-buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

#slide-counter {
  color: #666;
  font-size: 0.875rem;
}

/* Slide types */
.slide {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.slide-title {
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border-radius: var(--radius);
}

.slide-title h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.slide-title .subtitle {
  font-size: 1.25rem;
  opacity: 0.9;
}

.slide-content h2 {
  color: var(--primary);
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
}

.slide-content .content-body {
  line-height: 1.8;
  font-size: 1.1rem;
}

.slide-quiz {
  max-width: 700px;
  margin: 0 auto;
}

.quiz-question {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.quiz-option {
  padding: 1rem;
  border: 2px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s;
}

.quiz-option:hover {
  border-color: var(--primary);
  background: rgba(var(--primary-rgb), 0.05);
}

.quiz-option.selected {
  border-color: var(--primary);
  background: rgba(var(--primary-rgb), 0.1);
}

.quiz-option.correct {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
}

.quiz-option.incorrect {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.quiz-explanation {
  margin-top: 1.5rem;
  padding: 1rem;
  background: var(--muted);
  border-radius: var(--radius);
  border-left: 4px solid var(--primary);
}

.slide-hotspot {
  position: relative;
  display: inline-block;
}

.hotspot-point {
  position: absolute;
  width: 30px;
  height: 30px;
  background: var(--primary);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.875rem;
  transition: transform 0.2s;
}

.hotspot-point:hover {
  transform: scale(1.1);
}

.hotspot-popup {
  position: absolute;
  background: white;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  max-width: 300px;
  z-index: 100;
}

.slide-accordion .accordion-item {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-bottom: 0.5rem;
  overflow: hidden;
}

.accordion-header {
  padding: 1rem;
  background: var(--muted);
  cursor: pointer;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.accordion-content {
  padding: 1rem;
  display: none;
}

.accordion-item.open .accordion-content {
  display: block;
}

.slide-summary .key-point {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: var(--muted);
  border-radius: var(--radius);
  margin-bottom: 0.75rem;
}

.key-point-icon {
  width: 24px;
  height: 24px;
  background: var(--primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
`;
}

function generateContentJS(project: ScormProject): string {
  return `
var SCORM_CONTENT = ${JSON.stringify({
    title: project.title,
    slides: project.slides,
    settings: project.settings
  }, null, 2)};
`;
}

function generateRendererJS(): string {
  return `
var currentSlide = 0;
var totalSlides = 0;
var quizAnswers = {};
var slideVisited = {};

function initializeContent() {
  totalSlides = SCORM_CONTENT.slides.length;
  
  // Restore bookmark if available
  var bookmark = ScormAPI.getBookmark();
  if (bookmark && parseInt(bookmark) < totalSlides) {
    currentSlide = parseInt(bookmark);
  }
  
  renderSlide(currentSlide);
  updateProgress();
  updateNavigation();
}

function renderSlide(index) {
  var slide = SCORM_CONTENT.slides[index];
  var container = document.getElementById('slide-container');
  
  slideVisited[index] = true;
  ScormAPI.setBookmark(index);
  
  var html = '';
  
  switch(slide.type) {
    case 'title':
      html = renderTitleSlide(slide);
      break;
    case 'content':
      html = renderContentSlide(slide);
      break;
    case 'quiz':
      html = renderQuizSlide(slide, index);
      break;
    case 'video':
      html = renderVideoSlide(slide);
      break;
    case 'image':
      html = renderImageSlide(slide);
      break;
    case 'hotspot':
      html = renderHotspotSlide(slide);
      break;
    case 'accordion':
      html = renderAccordionSlide(slide);
      break;
    case 'summary':
      html = renderSummarySlide(slide);
      break;
    default:
      html = '<div class="slide slide-content"><h2>' + slide.title + '</h2><p>Tipo de slide no soportado: ' + slide.type + '</p></div>';
  }
  
  container.innerHTML = html;
  updateProgress();
  updateNavigation();
}

function renderTitleSlide(slide) {
  var html = '<div class="slide slide-title">';
  if (slide.logo_url) {
    html += '<img src="' + slide.logo_url + '" alt="Logo" style="height: 60px; margin-bottom: 2rem;">';
  }
  html += '<h1>' + escapeHtml(slide.title) + '</h1>';
  if (slide.subtitle) {
    html += '<p class="subtitle">' + escapeHtml(slide.subtitle) + '</p>';
  }
  if (slide.author) {
    html += '<p style="margin-top: 2rem; opacity: 0.7;">' + escapeHtml(slide.author) + '</p>';
  }
  html += '</div>';
  return html;
}

function renderContentSlide(slide) {
  var html = '<div class="slide slide-content">';
  html += '<h2>' + escapeHtml(slide.title) + '</h2>';
  html += '<div class="content-body">' + parseMarkdown(slide.content) + '</div>';
  if (slide.media && slide.media.url) {
    html += '<div style="margin-top: 2rem;">';
    if (slide.media.type === 'image') {
      html += '<img src="' + slide.media.url + '" alt="' + (slide.media.caption || '') + '" style="max-width: 100%; border-radius: 8px;">';
    }
    if (slide.media.caption) {
      html += '<p style="text-align: center; color: #666; margin-top: 0.5rem;">' + escapeHtml(slide.media.caption) + '</p>';
    }
    html += '</div>';
  }
  html += '</div>';
  return html;
}

function renderQuizSlide(slide, slideIndex) {
  var html = '<div class="slide slide-quiz">';
  html += '<div class="quiz-meta" style="margin-bottom: 1rem;">';
  html += '<span style="background: #f0f0f0; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.875rem;">' + slide.points + ' puntos</span>';
  html += '</div>';
  html += '<p class="quiz-question">' + escapeHtml(slide.question) + '</p>';
  html += '<div class="quiz-options">';
  
  var answered = quizAnswers[slideIndex] !== undefined;
  
  slide.options.forEach(function(opt, idx) {
    var classes = 'quiz-option';
    if (answered) {
      if (opt.isCorrect) classes += ' correct';
      else if (quizAnswers[slideIndex] === opt.id) classes += ' incorrect';
    } else if (quizAnswers[slideIndex] === opt.id) {
      classes += ' selected';
    }
    
    html += '<div class="' + classes + '" onclick="selectQuizOption(' + slideIndex + ', \\'' + opt.id + '\\')" data-id="' + opt.id + '">';
    html += escapeHtml(opt.text);
    html += '</div>';
  });
  
  html += '</div>';
  
  if (!answered) {
    html += '<button onclick="submitQuiz(' + slideIndex + ')" style="margin-top: 1.5rem; padding: 0.75rem 2rem; background: var(--primary); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">Comprobar respuesta</button>';
  }
  
  if (answered && slide.explanation) {
    var isCorrect = slide.options.find(function(o) { return o.id === quizAnswers[slideIndex]; }).isCorrect;
    html += '<div class="quiz-explanation">';
    html += '<strong>' + (isCorrect ? '¡Correcto!' : 'Incorrecto') + '</strong>';
    html += '<p>' + escapeHtml(slide.explanation) + '</p>';
    html += '</div>';
  }
  
  if (slide.hint && !answered) {
    html += '<p style="margin-top: 1rem; color: #666; font-size: 0.875rem;">💡 Pista: ' + escapeHtml(slide.hint) + '</p>';
  }
  
  html += '</div>';
  return html;
}

function selectQuizOption(slideIndex, optionId) {
  if (quizAnswers[slideIndex] !== undefined) return; // Already answered
  
  document.querySelectorAll('.quiz-option').forEach(function(el) {
    el.classList.remove('selected');
  });
  document.querySelector('.quiz-option[data-id="' + optionId + '"]').classList.add('selected');
  quizAnswers[slideIndex] = optionId;
}

function submitQuiz(slideIndex) {
  if (quizAnswers[slideIndex] === undefined) {
    alert('Selecciona una respuesta');
    return;
  }
  renderSlide(slideIndex); // Re-render to show result
  updateScore();
}

function renderVideoSlide(slide) {
  var html = '<div class="slide slide-video">';
  html += '<h2>' + escapeHtml(slide.title) + '</h2>';
  
  if (slide.video_type === 'youtube') {
    var videoId = slide.video_url.match(/(?:youtube\\.com\\/watch\\?v=|youtu\\.be\\/)([^&]+)/);
    if (videoId) {
      html += '<iframe src="https://www.youtube.com/embed/' + videoId[1] + '" style="width: 100%; aspect-ratio: 16/9; border: none; border-radius: 8px;" allowfullscreen></iframe>';
    }
  } else if (slide.video_type === 'mp4') {
    html += '<video src="' + slide.video_url + '" controls style="width: 100%; border-radius: 8px;"></video>';
  }
  
  if (slide.transcript) {
    html += '<details style="margin-top: 1rem;"><summary style="cursor: pointer; color: var(--primary);">Ver transcripción</summary>';
    html += '<p style="margin-top: 0.5rem; padding: 1rem; background: #f5f5f5; border-radius: 8px;">' + escapeHtml(slide.transcript) + '</p></details>';
  }
  
  html += '</div>';
  return html;
}

function renderImageSlide(slide) {
  var html = '<div class="slide slide-image">';
  html += '<h2>' + escapeHtml(slide.title) + '</h2>';
  html += '<div style="text-align: center;">';
  html += '<img src="' + slide.image_url + '" alt="' + escapeHtml(slide.alt_text) + '" style="max-width: 100%; max-height: 70vh; border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">';
  if (slide.caption) {
    html += '<p style="margin-top: 1rem; color: #666;">' + escapeHtml(slide.caption) + '</p>';
  }
  html += '</div></div>';
  return html;
}

function renderHotspotSlide(slide) {
  var html = '<div class="slide slide-hotspot-container">';
  html += '<h2>' + escapeHtml(slide.title) + '</h2>';
  if (slide.instruction) {
    html += '<p style="color: #666; margin-bottom: 1rem;">' + escapeHtml(slide.instruction) + '</p>';
  }
  html += '<div class="slide-hotspot" style="position: relative; display: inline-block;">';
  html += '<img src="' + slide.image_url + '" style="max-width: 100%; border-radius: 8px;">';
  
  slide.hotspots.forEach(function(hs, idx) {
    html += '<div class="hotspot-point" style="left: ' + hs.x + '%; top: ' + hs.y + '%;" onclick="toggleHotspot(this, ' + idx + ')">' + (idx + 1) + '</div>';
  });
  
  html += '</div>';
  html += '<div id="hotspot-content" style="margin-top: 1rem; padding: 1rem; background: #f5f5f5; border-radius: 8px; display: none;"></div>';
  html += '</div>';
  
  window.hotspotData = slide.hotspots;
  return html;
}

function toggleHotspot(el, idx) {
  var contentDiv = document.getElementById('hotspot-content');
  var hs = window.hotspotData[idx];
  contentDiv.innerHTML = '<strong>' + escapeHtml(hs.label) + '</strong><p>' + escapeHtml(hs.content) + '</p>';
  contentDiv.style.display = 'block';
}

function renderAccordionSlide(slide) {
  var html = '<div class="slide slide-accordion">';
  html += '<h2>' + escapeHtml(slide.title) + '</h2>';
  
  slide.items.forEach(function(item, idx) {
    html += '<div class="accordion-item" id="acc-' + idx + '">';
    html += '<div class="accordion-header" onclick="toggleAccordion(' + idx + ')">';
    html += escapeHtml(item.title);
    html += '<span>▼</span>';
    html += '</div>';
    html += '<div class="accordion-content">' + parseMarkdown(item.content) + '</div>';
    html += '</div>';
  });
  
  html += '</div>';
  return html;
}

function toggleAccordion(idx) {
  var item = document.getElementById('acc-' + idx);
  item.classList.toggle('open');
}

function renderSummarySlide(slide) {
  var html = '<div class="slide slide-summary">';
  html += '<h2 style="color: var(--primary); margin-bottom: 1.5rem;">' + escapeHtml(slide.title) + '</h2>';
  
  slide.key_points.forEach(function(point) {
    html += '<div class="key-point">';
    html += '<div class="key-point-icon">✓</div>';
    html += '<span>' + escapeHtml(point) + '</span>';
    html += '</div>';
  });
  
  if (slide.next_steps) {
    html += '<div style="margin-top: 2rem; padding: 1rem; border: 2px dashed #ddd; border-radius: 8px;">';
    html += '<strong>Próximos pasos</strong>';
    html += '<p style="color: #666; margin-top: 0.5rem;">' + escapeHtml(slide.next_steps) + '</p>';
    html += '</div>';
  }
  
  html += '</div>';
  return html;
}

function navigateNext() {
  if (currentSlide < totalSlides - 1) {
    currentSlide++;
    renderSlide(currentSlide);
  } else {
    checkCompletion();
  }
}

function navigatePrev() {
  if (currentSlide > 0) {
    currentSlide--;
    renderSlide(currentSlide);
  }
}

function updateProgress() {
  var visitedCount = Object.keys(slideVisited).length;
  var progress = Math.round((visitedCount / totalSlides) * 100);
  
  document.getElementById('progress-text').textContent = progress + '%';
  document.getElementById('progress-fill').style.width = progress + '%';
  document.getElementById('slide-counter').textContent = (currentSlide + 1) + ' / ' + totalSlides;
  
  ScormAPI.setProgress(progress);
}

function updateNavigation() {
  document.getElementById('btn-prev').disabled = currentSlide === 0;
  document.getElementById('btn-next').textContent = currentSlide === totalSlides - 1 ? 'Finalizar' : 'Siguiente →';
}

function updateScore() {
  var quizSlides = SCORM_CONTENT.slides.filter(function(s) { return s.type === 'quiz'; });
  var totalPoints = 0;
  var earnedPoints = 0;
  
  quizSlides.forEach(function(qs, idx) {
    var slideIdx = SCORM_CONTENT.slides.indexOf(qs);
    totalPoints += qs.points;
    
    if (quizAnswers[slideIdx]) {
      var selected = qs.options.find(function(o) { return o.id === quizAnswers[slideIdx]; });
      if (selected && selected.isCorrect) {
        earnedPoints += qs.points;
      }
    }
  });
  
  if (totalPoints > 0) {
    var score = Math.round((earnedPoints / totalPoints) * 100);
    ScormAPI.setScore(score, 100, 0);
  }
}

function checkCompletion() {
  var visitedCount = Object.keys(slideVisited).length;
  var completionThreshold = SCORM_CONTENT.settings.completion_threshold / 100;
  
  if (visitedCount / totalSlides >= completionThreshold) {
    ScormAPI.setCompleted();
    
    updateScore();
    var score = parseInt(ScormAPI.getValue("cmi.score.raw") || "0");
    
    if (score >= SCORM_CONTENT.settings.passing_score) {
      ScormAPI.setPassed();
      alert('¡Felicidades! Has completado el curso con éxito.');
    } else {
      ScormAPI.setFailed();
      alert('Has completado el curso. Puntuación: ' + score + '%');
    }
  }
}

function escapeHtml(text) {
  if (!text) return '';
  var div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function parseMarkdown(text) {
  if (!text) return '';
  // Basic markdown parsing
  return text
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>')
    .replace(/\\*(.*?)\\*/g, '<em>$1</em>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\\/li>)/s, '<ul>$1</ul>')
    .replace(/\\n/g, '<br>');
}
`;
}

function generateMetadata(project: ScormProject): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<lom xmlns="http://ltsc.ieee.org/xsd/LOM">
  <general>
    <identifier>
      <catalog>URI</catalog>
      <entry>${project.id}</entry>
    </identifier>
    <title>
      <string language="${project.language}">${escapeXml(project.title)}</string>
    </title>
    <language>${project.language}</language>
    <description>
      <string language="${project.language}">${escapeXml(project.description || '')}</string>
    </description>
  </general>
  <technical>
    <format>text/html</format>
  </technical>
</lom>`;
}

function escapeXml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function escapeHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

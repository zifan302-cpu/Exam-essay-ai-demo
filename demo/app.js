const form = document.querySelector("#essayForm");
const submitButton = form.querySelector(".primary-button");
const examPaperInput = document.querySelector("#examPaper");
const taskTypeInput = document.querySelector("#taskType");
const targetScoreInput = document.querySelector("#targetScore");
const userLevelInput = document.querySelector("#userLevel");
const ideaPolicyInput = document.querySelector("#ideaPolicy");
const topicInput = document.querySelector("#topic");
const ideasInput = document.querySelector("#ideas");
const complexityInput = document.querySelector("#complexity");
const complexityLabel = document.querySelector("#complexityLabel");
const sampleButton = document.querySelector("#sampleButton");
const copyButton = document.querySelector("#copyButton");
const downloadButton = document.querySelector("#downloadButton");
const toast = document.querySelector("#toast");

const resultTitle = document.querySelector("#resultTitle");
const matchScore = document.querySelector("#matchScore");
const wordCount = document.querySelector("#wordCount");
const toneLabel = document.querySelector("#toneLabel");
const scoreNumber = document.querySelector("#scoreNumber");
const scoreCaption = document.querySelector("#scoreCaption");
const essayTags = document.querySelector("#essayTags");
const essayOutput = document.querySelector("#essayOutput");
const outlineOutput = document.querySelector("#outlineOutput");
const patternOutput = document.querySelector("#patternOutput");
const vocabOutput = document.querySelector("#vocabOutput");
const diagnosisOutput = document.querySelector("#diagnosisOutput");

let currentResult = null;

const sample = {
  topic:
    "Directions: Write an essay of 160-220 words based on the following topic: The increasing use of artificial intelligence in education has brought both opportunities and challenges. You should discuss its influence on students' learning and give your own opinion.",
  ideas:
    "AI can give students quick feedback and help them practise writing more often.\nSome students may depend on AI too much and stop thinking independently.\nMy view is that AI should be used as a learning assistant, not as a replacement for teachers or students' own effort.\nSchools should teach students to use AI responsibly.",
};

const examPaperProfiles = {
  english1: {
    label: "英语一大作文",
    scoreMax: 20,
    wordGoal: "160-220 words",
    topBand: "16-20 分",
  },
  english2: {
    label: "英语二大作文",
    scoreMax: 15,
    wordGoal: "160-220 words",
    topBand: "12-15 分",
  },
};

const taskTypeProfiles = {
  "text-discussion": "文字材料议论文",
  "chart-description": "图表/图画文字描述",
};

const targetScoreProfiles = {
  safe: "稳妥提分",
  high: "高分冲刺",
  excellent: "范文级表达",
};

const userLevelProfiles = {
  foundation: {
    label: "基础稳分",
    control: "句式要稳，优先准确，亮点表达保持少而准。",
  },
  intermediate: {
    label: "中等提分",
    control: "在准确基础上增加过渡、同义替换和适度复杂句。",
  },
  advanced: {
    label: "高分冲刺",
    control: "允许更成熟的抽象表达，但仍避免堆砌生僻词。",
  },
};

const ideaPolicyProfiles = {
  preserve: "尽量保留我的观点",
  optimize: "保留核心并优化论证",
  rebuild: "只保留主题方向，重建高分论证",
};

const complexityNames = {
  1: "稳妥准确",
  2: "清晰自然",
  3: "标准高分",
  4: "适度亮点",
  5: "冲刺表达",
};

function getFormData() {
  return {
    examPaper: examPaperInput.value,
    taskType: taskTypeInput.value,
    targetScore: targetScoreInput.value,
    userLevel: userLevelInput.value,
    ideaPolicy: ideaPolicyInput.value,
    topic: topicInput.value.trim(),
    ideas: ideasInput.value.trim(),
    complexity: Number(complexityInput.value),
  };
}

function splitIdeas(rawIdeas) {
  const parts = rawIdeas
    .split(/\n|;|；/)
    .map((item) => item.trim())
    .filter(Boolean);

  return parts.length
    ? parts.slice(0, 6)
    : [
        "The essay should explain the social meaning behind the topic.",
        "It should present a clear position rather than list empty slogans.",
        "It should connect individual development with broader social progress.",
      ];
}

function cleanTopic(topic) {
  const compact = topic.replace(/\s+/g, " ").trim();
  const topicMatch = compact.match(/topic:\s*(.+)$/i);
  return (topicMatch ? topicMatch[1] : compact) || "the given topic";
}

function buildLocalEssay(data) {
  const topic = cleanTopic(data.topic);
  const ideas = splitIdeas(data.ideas);

  return [
    `In recent years, ${topic} has become a topic of growing public attention. It is not merely a technical or personal issue, but a question closely related to students' development and the quality of education. A balanced view is therefore needed.`,
    `To begin with, ${ideas[0].replace(/\.$/, "")}. This is meaningful because timely support can make learning more efficient and encourage students to revise their work more frequently. For many learners, repeated practice is often more important than one impressive answer.`,
    `However, ${ideas[1]?.replace(/\.$/, "") || "the possible risks should not be ignored"}. If students rely on ready-made answers, they may gradually lose the habit of independent thinking. Education should help people form judgment, not simply give them fluent sentences.`,
    `From my perspective, ${ideas[2]?.replace(/\.$/, "") || "the key lies in responsible use"}. Schools and students should treat new tools as assistants rather than substitutes. Only in this way can efficiency lead to real progress in learning.`,
  ];
}

function buildLocalOutline(data, essay) {
  const names = ["开头点题", "正面论证", "风险分析", "观点收束"];
  const focuses = [
    "引出题目，说明其教育或社会意义，避免一上来空泛表态。",
    "承接用户观点，解释积极影响，并加入结果说明。",
    "处理潜在问题，体现辩证思考和考研作文的论证层次。",
    "明确个人立场，给出可执行的收束建议。",
  ];

  return names.map((name, index) => ({
    name,
    focus: focuses[index],
    sample: essay[index],
  }));
}

function buildLocalPatterns() {
  return [
    {
      title: "现象引入",
      note: "适合考研大作文第一段，语气正式但不夸张。",
      pattern: "In recent years, ... has become a topic of growing public attention.",
    },
    {
      title: "意义提升",
      note: "把具体问题上升到教育、社会或个人发展层面。",
      pattern: "It is not merely a personal issue, but a question closely related to ...",
    },
    {
      title: "正面论证",
      note: "用于主体段解释原因和结果。",
      pattern: "This is meaningful because ..., which can further lead to ...",
    },
    {
      title: "风险让步",
      note: "避免文章只有单边论证。",
      pattern: "However, the possible risks should not be ignored.",
    },
    {
      title: "结尾收束",
      note: "适合从工具、个人和学校责任角度收尾。",
      pattern: "Only in this way can ... lead to real progress in ...",
    },
  ];
}

function buildLocalVocab() {
  return [
    {
      word: "timely support",
      cn: "及时支持",
      tags: ["education", "writing"],
      use: "Timely support can make learning more efficient.",
    },
    {
      word: "independent thinking",
      cn: "独立思考",
      tags: ["ability", "exam"],
      use: "Students should not lose the habit of independent thinking.",
    },
    {
      word: "responsible use",
      cn: "负责任地使用",
      tags: ["technology", "attitude"],
      use: "Responsible use is the key to making technology beneficial.",
    },
    {
      word: "ready-made answers",
      cn: "现成答案",
      tags: ["risk", "learning"],
      use: "Ready-made answers may weaken students' motivation to think.",
    },
    {
      word: "balanced view",
      cn: "平衡观点",
      tags: ["argument", "logic"],
      use: "A balanced view is needed when discussing this issue.",
    },
    {
      word: "real progress",
      cn: "真正进步",
      tags: ["result", "education"],
      use: "Efficiency should lead to real progress in learning.",
    },
  ];
}

function buildLocalDiagnosis(data, words) {
  const profile = examPaperProfiles[data.examPaper];
  return [
    {
      title: "本地模板提示",
      text: "当前为本地回退结果，不代表 Qwen 的真实生成质量。配置 DASHSCOPE_API_KEY 并通过本地服务或 Vercel 打开后，会优先调用 Qwen。",
    },
    {
      title: "评分口径",
      text: `${profile.label} 采用 ${profile.scoreMax} 分制。正式生成会输出档位、给分依据和修订建议。`,
    },
    {
      title: "词数检查",
      text: `当前约 ${words} 词，目标是 160-220 词。真实生成会强制检查词数。`,
    },
    {
      title: "质量方向",
      text: "下一步重点是先生成提纲，再成文，并让模型按阅卷标准自评后输出修订稿。",
    },
  ];
}

function createLocalResult(data) {
  const essay = buildLocalEssay(data);
  const words = countWords(essay);
  const profile = examPaperProfiles[data.examPaper];

  return {
    data,
    provider: "local",
    title: `${profile.label}本地示例稿`,
    essay,
    words,
    score: Math.round(profile.scoreMax * 0.72),
    scoreMax: profile.scoreMax,
    band: "第三档-第二档边缘",
    outline: buildLocalOutline(data, essay),
    patterns: buildLocalPatterns(),
    vocab: buildLocalVocab(),
    diagnosis: buildLocalDiagnosis(data, words),
  };
}

async function generateResult(data) {
  if (location.protocol !== "file:") {
    try {
      showToast("正在生成提纲、作文与阅卷诊断");
      return await createRemoteResult(data);
    } catch (error) {
      console.warn(error);
      showToast("Qwen 暂不可用，已切回本地示例");
    }
  }

  return createLocalResult(data);
}

async function createRemoteResult(data) {
  const response = await fetch("/api/generate-postgraduate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || payload.detail || payload.error || "Qwen API failed");
  }

  const essay = asArray(payload.essay).length ? asArray(payload.essay) : buildLocalEssay(data);
  const profile = examPaperProfiles[data.examPaper];

  return {
    data,
    provider: payload.provider || "dashscope",
    model: payload.model,
    usage: payload.usage,
    title: payload.title || `${profile.label}高分修订稿`,
    essay,
    words: payload.words || countWords(essay),
    score: payload.score || Math.round(profile.scoreMax * 0.82),
    scoreMax: payload.scoreMax || profile.scoreMax,
    band: payload.band || "第二档",
    scoreBasis: payload.scoreBasis || "",
    outline: asArray(payload.outline).length ? payload.outline : buildLocalOutline(data, essay),
    patterns: asArray(payload.patterns).length ? payload.patterns : buildLocalPatterns(),
    vocab: asArray(payload.vocab).length ? payload.vocab : buildLocalVocab(),
    diagnosis: buildDiagnosisCards(payload, data),
  };
}

function buildDiagnosisCards(payload, data) {
  const cards = [];

  cards.push({
    title: `预估档位：${payload.band || "待判断"}`,
    text: payload.scoreBasis || "模型未返回详细给分依据。",
  });

  asArray(payload.revisionNotes).forEach((note, index) => {
    cards.push({ title: `修订建议 ${index + 1}`, text: String(note) });
  });

  asArray(payload.grammarFixes).forEach((item, index) => {
    cards.push({
      title: item.point || `语法提醒 ${index + 1}`,
      text: [item.explanation, item.example, item.correction].filter(Boolean).join(" "),
    });
  });

  asArray(payload.diagnosis).forEach((item) => cards.push(item));

  if (cards.length <= 1) {
    return buildLocalDiagnosis(data, payload.words || 0);
  }

  return cards.slice(0, 8);
}

function renderResult(result) {
  currentResult = result;
  resultTitle.textContent = result.title;
  matchScore.textContent = `${result.score}/${result.scoreMax}`;
  wordCount.textContent = String(result.words);
  toneLabel.textContent = result.provider === "dashscope" ? "Qwen" : "本地";
  scoreNumber.textContent = result.score;
  scoreCaption.textContent = `${result.scoreMax} 分制`;

  renderTags(result);
  renderEssay(result);
  renderOutline(result);
  renderPatterns(result);
  renderVocab(result);
  renderDiagnosis(result);
}

function renderTags(result) {
  clearNode(essayTags);
  const profile = examPaperProfiles[result.data.examPaper];
  const tags = [
    result.provider === "dashscope" ? "Qwen API" : "本地示例",
    profile.label,
    taskTypeProfiles[result.data.taskType],
    `${result.score}/${result.scoreMax}`,
    result.band,
    targetScoreProfiles[result.data.targetScore],
    userLevelProfiles[result.data.userLevel].label,
  ];
  if (result.model) tags.push(result.model);
  tags.filter(Boolean).forEach((tag) => addTextElement(essayTags, "span", tag, "pill"));
}

function renderEssay(result) {
  clearNode(essayOutput);
  result.essay.forEach((paragraph) => addTextElement(essayOutput, "p", paragraph));
}

function renderOutline(result) {
  clearNode(outlineOutput);
  result.outline.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "outline-item";
    addTextElement(card, "small", `P${index + 1}`);
    addTextElement(card, "strong", item.name || `段落 ${index + 1}`);
    addTextElement(card, "p", item.focus || item.text || "");
    outlineOutput.appendChild(card);
  });
}

function renderPatterns(result) {
  clearNode(patternOutput);
  result.patterns.forEach((item) => {
    const card = document.createElement("article");
    card.className = "sentence-card";
    addTextElement(card, "strong", item.title || "句型");
    addTextElement(card, "p", item.note || "");
    addTextElement(card, "code", item.pattern || "");
    patternOutput.appendChild(card);
  });
}

function renderVocab(result) {
  clearNode(vocabOutput);
  result.vocab.forEach((item) => {
    const card = document.createElement("article");
    card.className = "vocab-item";
    addTextElement(card, "strong", item.word || "");
    addTextElement(card, "p", item.cn || "");
    const tagWrap = document.createElement("div");
    asArray(item.tags).forEach((tag) => addTextElement(tagWrap, "span", tag));
    card.appendChild(tagWrap);
    addTextElement(card, "p", item.use || "");
    vocabOutput.appendChild(card);
  });
}

function renderDiagnosis(result) {
  clearNode(diagnosisOutput);
  result.diagnosis.forEach((item) => {
    const card = document.createElement("article");
    card.className = "diagnosis-item";
    addTextElement(card, "strong", item.title || "诊断");
    addTextElement(card, "p", item.text || "");
    diagnosisOutput.appendChild(card);
  });
}

function buildMarkdown(result) {
  return [
    `# ${result.title}`,
    "",
    `- 考试版本：${examPaperProfiles[result.data.examPaper].label}`,
    `- 题型：${taskTypeProfiles[result.data.taskType]}`,
    `- 评分：${result.score}/${result.scoreMax}`,
    `- 档位：${result.band || ""}`,
    `- 词数：${result.words}`,
    `- 来源：${result.provider === "dashscope" ? result.model || "Qwen" : "本地示例"}`,
    "",
    "## 高分稿",
    "",
    ...result.essay.flatMap((paragraph) => [paragraph, ""]),
    "## 提纲",
    "",
    ...result.outline.map((item, index) => `${index + 1}. ${item.name}: ${item.focus}`),
    "",
    "## 句型",
    "",
    ...result.patterns.map((item) => `- ${item.title}: ${item.pattern}`),
    "",
    "## 词汇",
    "",
    ...result.vocab.map((item) => `- ${item.word}: ${item.cn}. ${item.use}`),
    "",
    "## 评分与建议",
    "",
    ...result.diagnosis.map((item) => `- ${item.title}: ${item.text}`),
  ].join("\n");
}

async function copyMarkdown() {
  if (!currentResult) return;
  const markdown = buildMarkdown(currentResult);

  try {
    await navigator.clipboard.writeText(markdown);
    showToast("已复制 Markdown");
  } catch {
    const helper = document.createElement("textarea");
    helper.value = markdown;
    helper.setAttribute("readonly", "");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    helper.remove();
    showToast("已复制 Markdown");
  }
}

function downloadMarkdown() {
  if (!currentResult) return;
  const blob = new Blob([buildMarkdown(currentResult)], {
    type: "text/markdown;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "postgraduate-essay-result.md";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("已导出 Markdown");
}

function clearNode(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function addTextElement(parent, tag, text, className) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  parent.appendChild(element);
  return element;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function countWords(paragraphs) {
  return paragraphs
    .join(" ")
    .split(/\s+/)
    .filter((word) => /[A-Za-z]/.test(word)).length;
}

function updateComplexityLabel() {
  complexityLabel.textContent = complexityNames[complexityInput.value];
}

function setGenerating(isGenerating) {
  submitButton.disabled = isGenerating;
  sampleButton.disabled = isGenerating;
  submitButton.querySelector("span").textContent = isGenerating ? "生成中" : "生成高分稿";
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 1800);
}

function loadSample() {
  examPaperInput.value = "english2";
  taskTypeInput.value = "text-discussion";
  targetScoreInput.value = "high";
  userLevelInput.value = "intermediate";
  ideaPolicyInput.value = "optimize";
  topicInput.value = sample.topic;
  ideasInput.value = sample.ideas;
  complexityInput.value = "3";
  updateComplexityLabel();
}

document.querySelectorAll(".tab-button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab-button").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".result-panel").forEach((panel) => panel.classList.remove("active"));
    button.classList.add("active");
    document.querySelector(`#panel-${button.dataset.tab}`).classList.add("active");
  });
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const data = getFormData();
  if (!data.topic) {
    showToast("请先输入题目");
    topicInput.focus();
    return;
  }

  setGenerating(true);
  try {
    renderResult(await generateResult(data));
    showToast("已生成考研大作文方案");
  } finally {
    setGenerating(false);
  }
});

complexityInput.addEventListener("input", updateComplexityLabel);
sampleButton.addEventListener("click", () => {
  loadSample();
  renderResult(createLocalResult(getFormData()));
});
copyButton.addEventListener("click", copyMarkdown);
downloadButton.addEventListener("click", downloadMarkdown);

loadSample();
renderResult(createLocalResult(getFormData()));

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch(() => undefined);
  });
}

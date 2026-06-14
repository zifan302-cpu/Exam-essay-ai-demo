const form = document.querySelector("#essayForm");
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
const essayTags = document.querySelector("#essayTags");
const essayOutput = document.querySelector("#essayOutput");
const outlineOutput = document.querySelector("#outlineOutput");
const patternOutput = document.querySelector("#patternOutput");
const vocabOutput = document.querySelector("#vocabOutput");
const diagnosisOutput = document.querySelector("#diagnosisOutput");

let currentResult = null;

const sample = {
  topic:
    "Some people believe that artificial intelligence will make education more equal, while others worry it may widen the gap. Discuss both views and give your own opinion.",
  ideas:
    "AI can provide low-cost feedback for students who cannot afford tutors.\nStudents with stronger self-discipline and better digital access may benefit more.\nMy view: schools should combine AI tools with teacher guidance and transparent rules.",
};

const examProfiles = {
  ielts: {
    name: "IELTS Task 2",
    targetUnit: "Band",
    wordGoal: "260-300",
    tone: "Academic",
    promise: "观点清晰、双边论证、结尾明确表态",
    paragraphs: ["Introduction", "Body 1", "Body 2", "Conclusion"],
  },
  postgraduate: {
    name: "考研英语大作文",
    targetUnit: "Score",
    wordGoal: "180-220",
    tone: "Formal",
    promise: "现象解释、原因分析、建议收束",
    paragraphs: ["描述现象", "分析原因", "提出建议", "总结升华"],
  },
  cet: {
    name: "四六级议论文",
    targetUnit: "Level",
    wordGoal: "160-200",
    tone: "Clear",
    promise: "立场明确、例证直观、表达稳妥",
    paragraphs: ["开头点题", "主体论证", "举例说明", "结尾总结"],
  },
};

const levelProfiles = {
  foundation: {
    label: "基础可用",
    tone: "稳妥",
    control: "短句为主，减少嵌套从句",
  },
  intermediate: {
    label: "中等进阶",
    tone: "自然",
    control: "句式有变化，避免炫技",
  },
  advanced: {
    label: "冲刺高分",
    tone: "亮眼",
    control: "允许更强逻辑连接和抽象表达",
  },
};

const complexityNames = {
  1: "稳妥",
  2: "清晰",
  3: "适中",
  4: "有亮点",
  5: "冲刺高分",
};

function getFormData() {
  const data = new FormData(form);
  return {
    examType: data.get("examType"),
    targetBand: data.get("targetBand"),
    level: data.get("level"),
    stance: data.get("stance"),
    topic: topicInput.value.trim(),
    ideas: ideasInput.value.trim(),
    complexity: Number(complexityInput.value),
  };
}

function hasChinese(text) {
  return /[\u4e00-\u9fff]/.test(text);
}

function cleanTopic(topic) {
  const compact = topic.replace(/\s+/g, " ").trim();
  if (!compact) {
    return "this social issue";
  }
  if (hasChinese(compact)) {
    return "the issue described in the prompt";
  }
  if (compact.length > 120) {
    return compact.slice(0, 117) + "...";
  }
  return compact;
}

function splitIdeas(rawIdeas) {
  const parts = rawIdeas
    .split(/\n|;|；/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (parts.length >= 3) {
    return parts.slice(0, 5);
  }

  return [
    ...parts,
    "The answer should consider both short-term convenience and long-term learning outcomes.",
    "A strong essay should move beyond slogans and explain who benefits, who may be harmed, and under what conditions.",
    "The final position can be moderate: use the tool, but keep human judgment and fair access in the system.",
  ].slice(0, 5);
}

function stanceSentence(stance) {
  if (stance === "support") {
    return "I therefore lean towards the positive side, as long as the change is introduced with proper safeguards.";
  }
  if (stance === "oppose") {
    return "I therefore remain cautious, because the possible costs may outweigh the short-term convenience.";
  }
  return "My view is that both concerns are valid, but the outcome depends on how the change is governed and taught.";
}

function chooseConnectors(complexity) {
  if (complexity <= 2) {
    return ["First", "Also", "However", "As a result", "In conclusion"];
  }
  if (complexity === 3) {
    return ["To begin with", "More importantly", "Nevertheless", "For this reason", "Overall"];
  }
  return ["At a practical level", "More fundamentally", "That said", "This is why", "Taken together"];
}

function buildEssay(data) {
  const profile = examProfiles[data.examType];
  const level = levelProfiles[data.level];
  const topic = cleanTopic(data.topic);
  const ideas = splitIdeas(data.ideas);
  const connectors = chooseConnectors(data.complexity);
  const stance = stanceSentence(data.stance);

  if (data.examType === "postgraduate") {
    return [
      `The discussion around ${topic} reflects a wider change in the way people study, work and make decisions. It is not enough to praise new tools blindly or reject them out of fear. What matters is whether they can help ordinary learners build real ability instead of only producing a polished surface.`,
      `${connectors[0]}, ${ideas[0].replace(/\.$/, "")}. This point is especially important for students who do not have constant access to expensive tutoring or high-quality feedback. A useful system can lower the cost of practice and make revision more frequent. ${connectors[1]}, ${ideas[1].replace(/\.$/, "")}. If access, discipline and guidance are uneven, the same tool may create very different results among different groups of students.`,
      `${connectors[2]}, the solution is not to avoid technology, but to use it with clear educational rules. ${ideas[2].replace(/\.$/, "")}. Schools and learners should treat AI output as a draft, a mirror and a training material, rather than as a final answer. In this way, students can learn how an argument is organized, why a sentence works, and which expressions can be reused in a new topic.`,
      `${connectors[4]}, I believe that the value of such tools depends on thoughtful use. When technology is combined with human judgment, fair access and repeated practice, it can improve writing ability instead of weakening it.`,
    ];
  }

  if (data.examType === "cet") {
    return [
      `Nowadays, ${topic} has become a topic that many students and teachers discuss. Different people hold different views, but I believe the key is to use new methods in a balanced and responsible way.`,
      `${connectors[0]}, ${ideas[0].replace(/\.$/, "")}. This can help learners receive feedback more quickly and practise more often. ${connectors[1]}, ${ideas[1].replace(/\.$/, "")}. If some students have better resources or stronger self-control, they may improve faster than others.`,
      `${connectors[2]}, this problem can be reduced if schools give students clear guidance. For example, teachers can ask students to compare an AI draft with their own writing, collect useful expressions, and revise the essay step by step. In this process, the tool becomes part of learning rather than a shortcut.`,
      `${connectors[4]}, I support careful use of this kind of tool. It should help students think, write and review, but it should not replace their own effort.`,
    ];
  }

  return [
    `In recent years, ${topic} has moved from a specialist discussion to a practical question for ordinary learners. Some people welcome this change because it seems to make support more accessible, whereas others worry that it may simply reward students who already have stronger resources. ${stance}`,
    `${connectors[0]}, the optimistic view is understandable. ${ideas[0].replace(/\.$/, "")}. For many learners, especially those who cannot afford frequent private tutoring, instant feedback can turn writing from an occasional task into a repeatable habit. It also allows students to test different ways of organizing an argument before they meet a teacher, which makes later feedback more efficient.`,
    `${connectors[2]}, the concern about inequality should not be dismissed. ${ideas[1].replace(/\.$/, "")}. A student with reliable internet access, strong self-discipline and good guidance may use the same tool to improve reasoning, vocabulary and revision. Another student may only copy a fluent answer without understanding why it works. In that case, the technology widens the gap not because it is useless, but because it is used without a learning system.`,
    `${connectors[3]}, the most reasonable approach is to combine technical support with human guidance. ${ideas[2].replace(/\.$/, "")}. Teachers can require students to explain the outline, replace unsuitable expressions and collect sentence patterns that match their own level. Such a process keeps the efficiency of AI while still protecting the deeper goal of education: independent thinking and controlled communication.`,
    `${connectors[4]}, I believe ${topic} can be beneficial, but only when it is treated as a training partner rather than a substitute writer. If access is fair and the output is turned into reusable knowledge, it can help more students write with clarity, depth and confidence.`,
  ];
}

function buildOutline(data, essay) {
  const profile = examProfiles[data.examType];
  const ideas = splitIdeas(data.ideas);
  return profile.paragraphs.map((name, index) => {
    const paragraph = essay[index] || essay[essay.length - 1];
    const focus =
      index === 0
        ? "引入题目，建立问题意识，并给出整体立场。"
        : index === profile.paragraphs.length - 1
          ? "回收主张，避免空泛口号，形成自然结尾。"
          : `展开论证：${ideas[index - 1] || ideas[0]}`;
    return {
      name,
      focus,
      sample: paragraph,
    };
  });
}

function buildPatterns(data) {
  const topic = cleanTopic(data.topic);
  const level = levelProfiles[data.level];
  return [
    {
      title: "双边讨论开头",
      note: "适合雅思和考研大作文开头，先承认争议，再收束到自己的判断。",
      pattern:
        "Some people welcome this change because ..., whereas others worry that .... My view is that ... depends on how it is used.",
    },
    {
      title: "论证深度推进",
      note: "用来避免只写优缺点，把问题推进到条件、对象和结果。",
      pattern:
        "The real question is not whether " + topic + " is useful, but who can benefit from it and under what conditions.",
    },
    {
      title: "反方让步",
      note: "适合在第二个主体段处理风险，体现思辨性。",
      pattern:
        "This concern should not be dismissed, because the same tool may produce very different outcomes among different learners.",
    },
    {
      title: "学习型结尾",
      note: "把工具价值和个人能力连接起来，适合本产品强调的学习转化。",
      pattern:
        "It should be treated as a training partner rather than a substitute, so that efficiency can lead to real improvement.",
    },
    {
      title: "个人水平控制",
      note: `当前选择：${level.control}。`,
      pattern:
        "A strong answer does not need rare words; it needs clear logic, controlled sentences and examples that directly support the claim.",
    },
  ];
}

function buildVocab(data) {
  const base = [
    {
      word: "accessible support",
      cn: "可获得的支持",
      tags: ["education", "fairness"],
      use: "AI can make writing support more accessible to learners with limited resources.",
    },
    {
      word: "repeatable practice",
      cn: "可重复练习",
      tags: ["learning", "habit"],
      use: "Repeatable practice is more useful than one impressive model essay.",
    },
    {
      word: "human guidance",
      cn: "人的指导",
      tags: ["teacher", "control"],
      use: "Human guidance is still needed to turn a draft into real writing ability.",
    },
    {
      word: "widen the gap",
      cn: "扩大差距",
      tags: ["inequality", "risk"],
      use: "Without fair access, the same technology may widen the gap between students.",
    },
    {
      word: "independent thinking",
      cn: "独立思考",
      tags: ["argument", "value"],
      use: "The deeper goal of writing is independent thinking, not fluent copying.",
    },
    {
      word: "controlled communication",
      cn: "有控制的表达",
      tags: ["style", "exam"],
      use: "High-scoring writing depends on controlled communication rather than decorative language.",
    },
  ];

  if (data.complexity >= 4) {
    base.push({
      word: "governed use",
      cn: "有规则的使用",
      tags: ["policy", "balance"],
      use: "Governed use allows schools to keep the benefits of technology while reducing misuse.",
    });
  }

  return base;
}

function buildDiagnosis(data, essay) {
  const profile = examProfiles[data.examType];
  const level = levelProfiles[data.level];
  return [
    {
      title: "考试贴合度",
      text: `${profile.name} 需要 ${profile.promise}。当前草稿已围绕该要求组织段落，但真实产品应继续加入更细的评分规则。`,
    },
    {
      title: "表达难度",
      text: `当前控制为“${complexityNames[data.complexity]}”，${level.control}。如果用户目标是短期提分，应优先保证准确和连贯。`,
    },
    {
      title: "个人化程度",
      text: "用户输入的思路已经进入主体段，但初版只是规则拼接。接入大模型后，应要求模型保留用户观点并补足例证。",
    },
    {
      title: "复习价值",
      text: "句型卡片和词汇包可以直接沉淀到个人语料库，这是区别于普通作文生成器的关键学习闭环。",
    },
  ];
}

function countWords(paragraphs) {
  return paragraphs
    .join(" ")
    .split(/\s+/)
    .filter((word) => /[A-Za-z]/.test(word)).length;
}

function calculateScore(data, words) {
  let score = 78;
  if (data.topic.length > 40) score += 6;
  if (data.ideas.length > 60) score += 8;
  if (data.complexity >= 3) score += 4;
  if (data.level === "advanced") score += 3;
  if (words > 150) score += 3;
  return Math.min(score, 96);
}

function createResult(data) {
  const essay = buildEssay(data);
  const words = countWords(essay);
  const score = calculateScore(data, words);
  return {
    data,
    essay,
    words,
    score,
    outline: buildOutline(data, essay),
    patterns: buildPatterns(data),
    vocab: buildVocab(data),
    diagnosis: buildDiagnosis(data, essay),
  };
}

function clearNode(node) {
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function addTextElement(parent, tag, text, className) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  element.textContent = text;
  parent.appendChild(element);
  return element;
}

function renderTags(result) {
  clearNode(essayTags);
  const profile = examProfiles[result.data.examType];
  const tags = [
    profile.name,
    `${profile.targetUnit} ${result.data.targetBand}`,
    `${profile.wordGoal} words`,
    levelProfiles[result.data.level].label,
    complexityNames[result.data.complexity],
  ];

  tags.forEach((tag) => {
    addTextElement(essayTags, "span", tag, "pill");
  });
}

function renderEssay(result) {
  clearNode(essayOutput);
  result.essay.forEach((paragraph) => {
    addTextElement(essayOutput, "p", paragraph);
  });
}

function renderOutline(result) {
  clearNode(outlineOutput);
  result.outline.forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "outline-item";
    addTextElement(card, "small", `P${index + 1}`);
    addTextElement(card, "strong", item.name);
    addTextElement(card, "p", item.focus);
    outlineOutput.appendChild(card);
  });
}

function renderPatterns(result) {
  clearNode(patternOutput);
  result.patterns.forEach((item) => {
    const card = document.createElement("article");
    card.className = "sentence-card";
    addTextElement(card, "strong", item.title);
    addTextElement(card, "p", item.note);
    addTextElement(card, "code", item.pattern);
    patternOutput.appendChild(card);
  });
}

function renderVocab(result) {
  clearNode(vocabOutput);
  result.vocab.forEach((item) => {
    const card = document.createElement("article");
    card.className = "vocab-item";
    addTextElement(card, "strong", item.word);
    addTextElement(card, "p", item.cn);
    const tagWrap = document.createElement("div");
    item.tags.forEach((tag) => addTextElement(tagWrap, "span", tag));
    card.appendChild(tagWrap);
    addTextElement(card, "p", item.use);
    vocabOutput.appendChild(card);
  });
}

function renderDiagnosis(result) {
  clearNode(diagnosisOutput);
  result.diagnosis.forEach((item) => {
    const card = document.createElement("article");
    card.className = "diagnosis-item";
    addTextElement(card, "strong", item.title);
    addTextElement(card, "p", item.text);
    diagnosisOutput.appendChild(card);
  });
}

function renderResult(result) {
  const profile = examProfiles[result.data.examType];
  currentResult = result;
  resultTitle.textContent = `${profile.name} 定制作文`;
  matchScore.textContent = `${result.score}%`;
  wordCount.textContent = String(result.words);
  toneLabel.textContent = profile.tone;
  scoreNumber.textContent = result.score;

  renderTags(result);
  renderEssay(result);
  renderOutline(result);
  renderPatterns(result);
  renderVocab(result);
  renderDiagnosis(result);
}

function buildMarkdown(result) {
  const profile = examProfiles[result.data.examType];
  const lines = [
    `# ${profile.name} 定制作文`,
    "",
    `- 目标档位：${result.data.targetBand}`,
    `- 当前水平：${levelProfiles[result.data.level].label}`,
    `- 表达难度：${complexityNames[result.data.complexity]}`,
    `- 匹配度：${result.score}%`,
    `- 词数：${result.words}`,
    "",
    "## 作文",
    "",
    ...result.essay.flatMap((paragraph) => [paragraph, ""]),
    "## 结构",
    "",
    ...result.outline.map((item, index) => `${index + 1}. ${item.name}：${item.focus}`),
    "",
    "## 可迁移句型",
    "",
    ...result.patterns.map((item) => `- ${item.title}：${item.pattern}`),
    "",
    "## 词汇包",
    "",
    ...result.vocab.map((item) => `- ${item.word}：${item.cn}。${item.use}`),
  ];
  return lines.join("\n");
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
  link.download = "essay-ai-result.md";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast("已导出 Markdown");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

function updateComplexityLabel() {
  complexityLabel.textContent = complexityNames[complexityInput.value];
}

function loadSample() {
  topicInput.value = sample.topic;
  ideasInput.value = sample.ideas;
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

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = getFormData();
  if (!data.topic) {
    showToast("请先输入作文题目");
    topicInput.focus();
    return;
  }
  renderResult(createResult(data));
  showToast("已生成定制作文方案");
});

complexityInput.addEventListener("input", updateComplexityLabel);
sampleButton.addEventListener("click", () => {
  loadSample();
  renderResult(createResult(getFormData()));
});
copyButton.addEventListener("click", copyMarkdown);
downloadButton.addEventListener("click", downloadMarkdown);

loadSample();
renderResult(createResult(getFormData()));

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch(() => undefined);
  });
}

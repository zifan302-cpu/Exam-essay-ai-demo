const DASHSCOPE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";
const DEFAULT_MODEL = process.env.DASHSCOPE_MODEL || "qwen3.7-plus";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "missing_dashscope_api_key",
      message: "请在本地或 Vercel 环境变量中配置 DASHSCOPE_API_KEY。",
    });
  }

  const input = parseBody(req.body);
  if (!input?.topic?.trim()) {
    return res.status(400).json({ error: "missing_topic" });
  }

  const model = process.env.DASHSCOPE_MODEL || DEFAULT_MODEL;

  try {
    const response = await fetch(DASHSCOPE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildDashScopePayload(input, model)),
    });

    const raw = await response.text();

    if (!response.ok) {
      return res.status(response.status).json({
        error: "dashscope_error",
        detail: raw.slice(0, 1000),
      });
    }

    const payload = JSON.parse(raw);
    const content = payload?.choices?.[0]?.message?.content || "";
    const parsed = parseJsonFromModel(content);

    return res.status(200).json(normalizeResult(parsed, input, model, payload.usage));
  } catch (error) {
    return res.status(500).json({
      error: "generation_failed",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

function parseBody(body) {
  if (!body) return {};
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
}

function buildDashScopePayload(input, model) {
  const profile = buildUserProfile(input);
  const rubric = buildRubric(profile.scoreMax);

  return {
    model,
    messages: [
      {
        role: "system",
        content: [
          "你是中国研究生入学考试英语大作文阅卷老师兼写作教研老师。",
          "任务：根据题目和考生思路，先规划提纲，再生成高分参考稿，并按阅卷标准自评后修订。",
          "评分维度：内容要点、语法词汇丰富度与准确性、行文连贯性、格式与语域。",
          "文章必须是英文；讲解、提纲、诊断、语法说明用中文为主。",
          "不要鼓励照抄，输出应便于学习和改写。",
          "只输出严格 JSON，不要 Markdown，不要代码块，不要额外说明。",
        ].join("\n"),
      },
      {
        role: "user",
        content: [
          "请生成考研英语大作文学习方案。",
          "",
          "用户输入：",
          JSON.stringify(profile, null, 2),
          "",
          "压缩评分标准：",
          rubric,
          "",
          "执行要求：",
          [
            "1. 先在内部确定中心立意、段落功能、论点和例证，再写最终作文；不要输出内部推理过程。",
            "2. 最终作文为 4 段，160-220 词。若初稿低于 180 词，应补充具体例证或结果说明。",
            "3. 必须吸收用户想法；若用户想法空泛，要补足具体论证，但不能跑题。",
            "4. 语言要像考研高分作文：正式、清楚、自然、有少量亮点，不堆砌生僻词和长难句。",
            "5. 自评后再修订一次，只输出修订后的高分稿。",
            "6. 给出分数、档位、给分依据、语法知识点和纠正示例、词汇表达建议。",
          ].join("\n"),
          "",
          "输出 JSON schema：",
          JSON.stringify(buildSchema(profile), null, 2),
        ].join("\n"),
      },
    ],
    temperature: 0.42,
    top_p: 0.85,
    max_tokens: 2300,
  };
}

function buildUserProfile(input) {
  const examMap = {
    english1: { label: "考研英语一大作文", scoreMax: 20, highBand: "16-20" },
    english2: { label: "考研英语二大作文", scoreMax: 15, highBand: "12-15" },
  };
  const taskMap = {
    "text-discussion": "文字材料议论文",
    "chart-description": "图表/图画文字描述。当前用户只提供文字描述，暂不处理图片。",
  };
  const targetMap = {
    safe: "稳妥提分：优先准确、完整、连贯",
    high: "高分冲刺：完整论证 + 清楚例证 + 少量亮点表达",
    excellent: "范文级表达：更成熟的立意和衔接，但仍保持可模仿",
  };
  const levelMap = {
    foundation: "基础稳分：短句和中等词汇为主，减少复杂嵌套",
    intermediate: "中等提分：允许适度复杂句、同义替换和较自然衔接",
    advanced: "高分冲刺：允许更成熟表达，但不能堆砌难词",
  };
  const ideaPolicyMap = {
    preserve: "尽量保留用户观点，只做语言和结构优化",
    optimize: "保留核心观点，并补足论证层次和例证",
    rebuild: "只保留主题方向，重建更高分的论证",
  };
  const complexityMap = {
    1: "稳妥准确",
    2: "清晰自然",
    3: "标准高分",
    4: "适度亮点",
    5: "冲刺表达",
  };

  const exam = examMap[input.examPaper] || examMap.english2;

  return {
    exam: exam.label,
    scoreMax: exam.scoreMax,
    highBand: exam.highBand,
    taskType: taskMap[input.taskType] || taskMap["text-discussion"],
    target: targetMap[input.targetScore] || targetMap.high,
    userLevel: levelMap[input.userLevel] || levelMap.intermediate,
    ideaPolicy: ideaPolicyMap[input.ideaPolicy] || ideaPolicyMap.optimize,
    expressionStrategy: complexityMap[input.complexity] || complexityMap[3],
    topic: input.topic,
    userIdeas: input.ideas || "",
  };
}

function buildRubric(scoreMax) {
  if (scoreMax === 15) {
    return [
      "第一档 12-15：内容要点完整准确，评论精炼到位；语法结构和词汇丰富准确；衔接自然有效；格式语域恰当。",
      "第二档 10-11：大部分要点准确，评论相关；语言较丰富，少量小错不影响理解；结构清晰。",
      "第三档 7-9：覆盖主要内容但细节或深度不足；词汇句式基本够用；错误不影响整体理解；衔接较简单。",
      "第四档 5-6：要点遗漏或解释不准；语言单调且错误较多；连贯性弱。",
      "第五档 1-4：明显偏题或遗漏主要内容；语言错误严重；缺少组织。",
    ].join("\n");
  }

  return [
    "第一档 16-20：任务完成充分，观点明确，论证有层次；语法词汇丰富准确；衔接多样自然；格式语域贴切。",
    "第二档 13-15：要点基本完整，论证较清楚；语言较丰富，少量错误不影响理解；结构较严密。",
    "第三档 9-12：完成基本任务但深度有限；语法词汇能满足需求；有一些错误；衔接简单但基本连贯。",
    "第四档 5-8：要点不足或无关内容较多；语言单调，错误影响理解；组织较弱。",
    "第五档 1-4：明显未完成任务，内容偏离，错误严重，缺少分段和连贯。",
  ].join("\n");
}

function buildSchema(profile) {
  return {
    title: `${profile.exam}高分修订稿`,
    essay: ["英文第1段", "英文第2段", "英文第3段", "英文第4段"],
    score: Math.max(1, profile.scoreMax - 2),
    scoreMax: profile.scoreMax,
    band: "第一档",
    scoreBasis: "中文说明：为什么给这个分数，分别从内容、语言、连贯、语域说明。",
    outline: [
      { name: "开头点题", focus: "中文说明该段功能、中心句和注意事项" },
      { name: "主体论证一", focus: "中文说明论点、例证和衔接" },
      { name: "主体论证二", focus: "中文说明论点、例证和衔接" },
      { name: "结尾收束", focus: "中文说明立场和升华方式" },
    ],
    revisionNotes: ["中文：本次为了提分做了什么修订"],
    grammarFixes: [
      {
        point: "语法知识点名称",
        explanation: "先用中文讲知识点",
        example: "给一个英文例句",
        correction: "说明原本容易错在哪里以及如何改",
      },
    ],
    patterns: [
      { title: "句型名称", note: "中文说明适用场景", pattern: "English sentence pattern" },
    ],
    vocab: [
      {
        word: "English phrase",
        cn: "中文释义",
        tags: ["topic", "exam"],
        use: "English example sentence",
      },
    ],
    diagnosis: [{ title: "诊断项", text: "中文建议" }],
  };
}

function parseJsonFromModel(content) {
  const cleaned = content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      return JSON.parse(cleaned.slice(start, end + 1));
    }
    throw new Error("模型没有返回可解析的 JSON。");
  }
}

function normalizeResult(result, input, model, usage) {
  const profile = buildUserProfile(input);
  const essay = asStringArray(result.essay).slice(0, 4);
  const scoreMax = Number(result.scoreMax) || profile.scoreMax;

  return {
    provider: "dashscope",
    model,
    usage,
    title: result.title || `${profile.exam}高分修订稿`,
    essay,
    words: countWords(essay),
    score: clamp(Number(result.score) || Math.round(scoreMax * 0.82), 1, scoreMax),
    scoreMax,
    band: String(result.band || "").trim(),
    scoreBasis: String(result.scoreBasis || "").trim(),
    outline: asCardArray(result.outline, ["name", "focus"]).slice(0, 4),
    revisionNotes: asStringArray(result.revisionNotes).slice(0, 6),
    grammarFixes: asCardArray(result.grammarFixes, [
      "point",
      "explanation",
      "example",
      "correction",
    ]).slice(0, 5),
    patterns: asCardArray(result.patterns, ["title", "note", "pattern"]).slice(0, 8),
    vocab: asVocabArray(result.vocab).slice(0, 10),
    diagnosis: asCardArray(result.diagnosis, ["title", "text"]).slice(0, 6),
    request: {
      examPaper: input.examPaper,
      taskType: input.taskType,
      targetScore: input.targetScore,
      userLevel: input.userLevel,
      ideaPolicy: input.ideaPolicy,
      complexity: input.complexity,
      topic: input.topic,
    },
  };
}

function asStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item || "").trim()).filter(Boolean);
}

function asCardArray(value, keys) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const card = {};
      keys.forEach((key) => {
        card[key] = String(item?.[key] || "").trim();
      });
      return card;
    })
    .filter((item) => keys.some((key) => item[key]));
}

function asVocabArray(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => ({
      word: String(item?.word || "").trim(),
      cn: String(item?.cn || "").trim(),
      tags: Array.isArray(item?.tags) ? item.tags.map(String).slice(0, 4) : [],
      use: String(item?.use || "").trim(),
    }))
    .filter((item) => item.word);
}

function countWords(paragraphs) {
  return paragraphs
    .join(" ")
    .split(/\s+/)
    .filter((word) => /[A-Za-z]/.test(word)).length;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

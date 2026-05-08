<template>
  <div class="ai-chat">
    <!-- 欢迎区 / 消息列表 -->
    <div ref="chatBodyRef" class="ai-chat-body">
      <!-- 空状态欢迎页 -->
      <div v-if="messages.length === 0" class="ai-welcome">
        <div class="ai-welcome-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <h2 class="ai-welcome-title">医学统计 AI 助手</h2>
        <p class="ai-welcome-desc">我可以帮你解答医学统计相关的问题，包括样本量计算、随机化方案设计、统计方法选择等。</p>
        <div class="ai-welcome-prompts">
          <div v-for="prompt in quickPrompts" :key="prompt" class="ai-welcome-prompt" @click="sendQuickPrompt(prompt)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="14" height="14"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
            {{ prompt }}
          </div>
        </div>
      </div>

      <!-- 消息列表 -->
      <div v-else class="ai-messages">
        <div v-for="(msg, idx) in messages" :key="idx" class="ai-msg" :class="msg.role">
          <div class="ai-msg-avatar">
            <template v-if="msg.role === 'user'">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="18" height="18"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </template>
            <template v-else>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" width="18" height="18"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
            </template>
          </div>
          <div class="ai-msg-content">
            <div class="ai-msg-name">{{ msg.role === 'user' ? '你' : 'AI 助手' }}</div>
            <div class="ai-msg-text" v-html="msg.content" />
            <div v-if="msg.role === 'assistant'" class="ai-msg-actions">
              <button class="ai-msg-action" title="复制" @click="copyText(msg.content)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 加载动画 -->
        <div v-if="isLoading" class="ai-msg assistant">
          <div class="ai-msg-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" width="18" height="18"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
          </div>
          <div class="ai-msg-content">
            <div class="ai-msg-name">AI 助手</div>
            <div class="ai-typing">
              <span /><span /><span />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 输入区 -->
    <div class="ai-chat-footer">
      <div class="ai-input-wrap">
        <textarea
          ref="inputRef"
          v-model="inputText"
          class="ai-input"
          placeholder="输入你的医学统计问题..."
          rows="1"
          @keydown.enter.exact.prevent="handleSend"
          @input="autoResize"
        />
        <button v-if="isLoading" class="ai-stop-btn" @click="handleStop">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
        </button>
        <button v-else class="ai-send-btn" :class="{ active: inputText.trim() }" :disabled="!inputText.trim()" @click="handleSend">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" width="18" height="18"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
        </button>
      </div>
      <div class="ai-input-hint">AI 回复仅供参考，重要决策请以专业统计师意见为准</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { streamChat, type ChatMessage as APIChatMessage } from "@/api/ai-chat";

declare global {
  interface Window {
    katex: {
      renderToString: (tex: string, options?: Record<string, unknown>) => string;
    };
  }
}

defineOptions({ name: "MedicalStatsAI" });

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const messages = ref<ChatMessage[]>([]);
const inputText = ref("");
const isLoading = ref(false);
const chatBodyRef = ref<HTMLElement>();
const inputRef = ref<HTMLTextAreaElement>();
let abortController: AbortController | null = null;

const quickPrompts = [
  "两独立样本 t 检验需要多大样本量？",
  "什么时候用分层区组随机？",
  "如何选择合适的随机化方法？",
  "非劣效性试验的样本量怎么算？",
  "最小化随机和分层随机有什么区别？",
  "LogRank 检验的适用条件是什么？",
];

function scrollToBottom() {
  nextTick(() => {
    if (chatBodyRef.value) {
      chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight;
    }
  });
}

function autoResize() {
  const el = inputRef.value;
  if (!el) return;
  el.style.height = "auto";
  el.style.height = Math.min(el.scrollHeight, 160) + "px";
}

function sendQuickPrompt(prompt: string) {
  inputText.value = prompt;
  handleSend();
}

function copyText(html: string) {
  const text = html.replace(/<[^>]+>/g, "");
  navigator.clipboard.writeText(text);
}

/** 渲染 LaTeX 公式为 HTML（使用 KaTeX） */
function renderLatex(text: string): string {
  // 块级公式 \[ ... \] 或 $$ ... $$
  text = text.replace(/\\\[([\s\S]*?)\\\]/g, (_match, formula) => {
    try {
      return `<span class="katex-display">${window.katex.renderToString(formula.trim(), { displayMode: true, throwOnError: false })}</span>`;
    } catch {
      return `<code class="latex-error">${formula}</code>`;
    }
  });
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_match, formula) => {
    try {
      return `<span class="katex-display">${window.katex.renderToString(formula.trim(), { displayMode: true, throwOnError: false })}</span>`;
    } catch {
      return `<code class="latex-error">${formula}</code>`;
    }
  });

  // 行内公式 \( ... \) 或 $ ... $（不贪婪，单行内）
  text = text.replace(/\\\((.*?)\\\)/g, (_match, formula) => {
    try {
      return window.katex.renderToString(formula.trim(), { displayMode: false, throwOnError: false });
    } catch {
      return `<code class="latex-error">${formula}</code>`;
    }
  });
  text = text.replace(/(?<!\$)\$(?!\$)(.+?)(?<!\$)\$(?!\$)/g, (_match, formula) => {
    try {
      return window.katex.renderToString(formula.trim(), { displayMode: false, throwOnError: false });
    } catch {
      return `<code class="latex-error">${formula}</code>`;
    }
  });

  return text;
}

/** 简单 Markdown → HTML（标题、加粗、列表、段落、代码块、LaTeX） */
function markdownToHtml(md: string): string {
  // 先处理 LaTeX 公式（在其他 markdown 处理之前）
  let html = window.katex ? renderLatex(md) : md;

  html = html
    // 代码块
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="lang-$1">$2</code></pre>')
    // 行内代码
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // 标题 h1-h5
    .replace(/^#{5}\s+(.+)$/gm, "<h5>$1</h5>")
    .replace(/^#{4}\s+(.+)$/gm, "<h4>$1</h4>")
    .replace(/^#{3}\s+(.+)$/gm, "<h3>$1</h3>")
    .replace(/^#{2}\s+(.+)$/gm, "<h2>$1</h2>")
    .replace(/^#\s+(.+)$/gm, "<h1>$1</h1>")
    // 加粗（** 和 __ 两种语法）
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/__(.+?)__/g, "<strong>$1</strong>")
    // 斜体
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/_(.+?)_/g, "<em>$1</em>")
    // 无序列表
    .replace(/^[-*]\s+(.+)$/gm, "<li>$1</li>")
    // 有序列表
    .replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>");

  // 把连续 <li> 包裹成 <ul>
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>");
  // 段落（非标签开头的行）
  html = html
    .split("\n\n")
    .map((block) => {
      block = block.trim();
      if (!block) return "";
      if (block.startsWith("<")) return block;
      return `<p>${block.replace(/\n/g, "<br>")}</p>`;
    })
    .join("");

  return html;
}

function handleStop() {
  if (abortController) {
    abortController.abort();
    abortController = null;
    isLoading.value = false;
  }
}

async function handleSend() {
  const text = inputText.value.trim();
  if (!text || isLoading.value) return;

  messages.value.push({ role: "user", content: text });
  inputText.value = "";
  if (inputRef.value) {
    inputRef.value.style.height = "auto";
  }
  isLoading.value = true;
  abortController = new AbortController();
  scrollToBottom();

  // 构建发给 API 的消息（只发 user/assistant 历史）
  const apiMessages: APIChatMessage[] = messages.value.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.role === "user" ? m.content : "", // assistant 的 html 不发回去，避免干扰
  })).filter(m => m.content);

  // 添加 assistant 占位
  const assistantIdx = messages.value.length;
  messages.value.push({ role: "assistant", content: "" });

  let rawContent = "";

  await streamChat(
    apiMessages,
    // onChunk：逐步追加内容
    (chunk: string) => {
      rawContent += chunk;
      messages.value[assistantIdx].content = markdownToHtml(rawContent);
      scrollToBottom();
    },
    // onDone
    () => {
      messages.value[assistantIdx].content = markdownToHtml(rawContent);
      isLoading.value = false;
      abortController = null;
      scrollToBottom();
    },
    // onError
    (err: Error) => {
      messages.value[assistantIdx].content = `<p style="color: #e53e3e;">请求失败：${err.message}</p><p>请检查 <code>src/api/ai-chat.ts</code> 中的 API Key 配置是否正确。</p>`;
      isLoading.value = false;
      abortController = null;
      scrollToBottom();
    },
    abortController.signal,
  );
}
</script>

<style scoped>
.ai-chat {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 50px);
  max-height: calc(100vh - 50px);
}

/* ===== 消息区 ===== */
.ai-chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.ai-chat-body::-webkit-scrollbar { width: 5px; }
.ai-chat-body::-webkit-scrollbar-thumb { background: rgba(0, 0, 0, 0.06); border-radius: 3px; }

/* ===== 欢迎页 ===== */
.ai-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
}

.ai-welcome-icon {
  width: 64px;
  height: 64px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.1), rgba(8, 145, 178, 0.08));
  margin-bottom: 20px;
}

.ai-welcome-icon svg {
  width: 32px;
  height: 32px;
  color: var(--el-color-primary);
}

.ai-welcome-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--el-text-color-primary);
}

.ai-welcome-desc {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  max-width: 440px;
  line-height: 1.7;
  margin: 0 0 32px;
}

.ai-welcome-prompts {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  max-width: 560px;
  width: 100%;
}

.ai-welcome-prompt {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid var(--el-border-color-lighter);
  font-size: 13px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
}

.ai-welcome-prompt:hover {
  background: rgba(255, 255, 255, 0.6);
  border-color: var(--el-color-primary-light-5);
  color: var(--el-color-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

/* ===== 消息 ===== */
.ai-messages {
  max-width: 780px;
  margin: 0 auto;
}

.ai-msg {
  display: flex;
  gap: 14px;
  margin-bottom: 24px;
  animation: msgIn 0.3s ease both;
}

.ai-msg.user {
  flex-direction: row-reverse;
}

@keyframes msgIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

.ai-msg-avatar {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.ai-msg.user .ai-msg-avatar {
  background: linear-gradient(135deg, var(--el-color-primary), #0891b2);
  color: white;
}

.ai-msg.assistant .ai-msg-avatar {
  background: rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.08);
  color: var(--el-color-primary);
}

.ai-msg-content {
  flex: 1;
  min-width: 0;
}

.ai-msg.user .ai-msg-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.ai-msg-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin-bottom: 6px;
}

.ai-msg-text {
  font-size: 14px;
  line-height: 1.8;
  color: var(--el-text-color-primary);
}

.ai-msg.user .ai-msg-text {
  padding: 12px 16px;
  border-radius: 16px 4px 16px 16px;
  background: linear-gradient(135deg, var(--el-color-primary), #0891b2);
  color: white;
  display: inline-block;
  max-width: 75%;
}

.ai-msg-text :deep(p) { margin: 0 0 8px; }
.ai-msg-text :deep(p:last-child) { margin: 0; }
.ai-msg-text :deep(h1),
.ai-msg-text :deep(h2),
.ai-msg-text :deep(h3),
.ai-msg-text :deep(h4),
.ai-msg-text :deep(h5) { margin: 16px 0 8px; color: var(--el-text-color-primary); }
.ai-msg-text :deep(h1) { font-size: 20px; }
.ai-msg-text :deep(h2) { font-size: 18px; }
.ai-msg-text :deep(h3) { font-size: 16px; font-weight: 700; }
.ai-msg-text :deep(h4) { font-size: 15px; font-weight: 600; }
.ai-msg-text :deep(h5) { font-size: 14px; font-weight: 600; }
.ai-msg-text :deep(ul) { padding-left: 18px; margin: 8px 0; }
.ai-msg-text :deep(li) { margin: 4px 0; }
.ai-msg-text :deep(strong) { color: var(--el-color-primary); font-weight: 600; }
.ai-msg-text :deep(.katex-display) { display: block; margin: 12px 0; text-align: center; overflow-x: auto; }
.ai-msg-text :deep(.katex) { font-size: 1.05em; }
.ai-msg-text :deep(.latex-error) { color: #e53e3e; background: rgba(229, 62, 62, 0.06); padding: 2px 6px; border-radius: 4px; }

.ai-msg-actions {
  display: flex;
  gap: 4px;
  margin-top: 8px;
}

.ai-msg-action {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  border: none;
  background: transparent;
  color: var(--el-text-color-placeholder);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.ai-msg-action:hover {
  background: rgba(0, 0, 0, 0.04);
  color: var(--el-text-color-regular);
}

/* ===== 打字动画 ===== */
.ai-typing {
  display: flex;
  gap: 5px;
  padding: 4px 0;
}

.ai-typing span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--el-color-primary-light-5);
  animation: typingBounce 1.2s ease-in-out infinite;
}

.ai-typing span:nth-child(2) { animation-delay: 0.15s; }
.ai-typing span:nth-child(3) { animation-delay: 0.3s; }

@keyframes typingBounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-6px); opacity: 1; }
}

/* ===== 输入区 ===== */
.ai-chat-footer {
  flex-shrink: 0;
  padding: 16px 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.ai-input-wrap {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  width: 100%;
  max-width: 780px;
  padding: 10px 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.5);
  border: 1.5px solid var(--el-border-color-lighter);
  backdrop-filter: blur(12px);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.ai-input-wrap:focus-within {
  border-color: var(--el-color-primary-light-3);
  box-shadow: 0 0 0 4px rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.06);
}

.ai-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  line-height: 1.6;
  color: var(--el-text-color-primary);
  resize: none;
  max-height: 160px;
  font-family: inherit;
}

.ai-input::placeholder {
  color: var(--el-text-color-placeholder);
}

.ai-send-btn {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: none;
  background: var(--el-border-color-lighter);
  color: var(--el-text-color-placeholder);
  cursor: not-allowed;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
}

.ai-send-btn.active {
  background: linear-gradient(135deg, var(--el-color-primary), #0891b2);
  color: white;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(var(--el-color-primary-rgb, 64, 158, 255), 0.25);
}

.ai-send-btn.active:hover {
  transform: scale(1.05);
}

.ai-stop-btn {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #e53e3e, #f56565);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
  box-shadow: 0 4px 14px rgba(229, 62, 62, 0.25);
  animation: pulseStop 1.5s ease-in-out infinite;
}

.ai-stop-btn:hover {
  transform: scale(1.05);
  background: linear-gradient(135deg, #c53030, #e53e3e);
}

@keyframes pulseStop {
  0%, 100% { box-shadow: 0 4px 14px rgba(229, 62, 62, 0.25); }
  50% { box-shadow: 0 4px 20px rgba(229, 62, 62, 0.4); }
}

.ai-input-hint {
  margin-top: 8px;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
}

@media (max-width: 768px) {
  .ai-welcome-prompts { grid-template-columns: 1fr; }
  .ai-chat-body { padding: 16px; }
  .ai-chat-footer { padding: 12px 16px 16px; }
}
</style>

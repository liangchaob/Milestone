<template>
  <div class="landing">
    <section class="card landing-hero">
      <div class="hero-title mb-2">说出你的目标，Milestone 帮你搞定！</div>
      <div class="hero-sub mb-4">从一个目标，到一条清晰的SOP/路线图。你只需要照着做，Milestone 带你一直走到终点。</div>
      <div class="mb-2" style="font-size:12px;font-weight:600">我想要...</div>
      <div style="display:flex;gap:8px">
        <input ref="inputRef" v-model="goal" @keyup.enter="start" class="input" placeholder="输入你想达成的目标" style="flex:1" />
      </div>
      <div class="hero-cta">
        <button class="btn btn-primary btn-cta" @click="start">开始</button>
      </div>
      <div class="examples">
        <div class="example-chip" v-for="(t,i) in visibleExamples" :key="i" @mouseenter="onHover(i, true)" @mouseleave="onHover(i, false)" @click="onPick(t)">
          <transition name="chip-fx" mode="out-in">
            <span :key="t">{{ t }}</span>
          </transition>
        </div>
      </div>
    </section>

    <section class="section values">
      <div class="section-title">把模糊目标，变成能完成的步骤。</div>
      <div class="cards">
        <div class="feature-card">
          <div class="feature-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
              <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6"/>
              <path d="M12 7 L12 12 L16 14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="feature-title">自动拆解你的目标</div>
          <div class="feature-text">输入一句话，Milestone 自动生成阶段目标、每周重点和每日行动。</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
              <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" stroke-width="1.6"/>
              <path d="M7 9 H17 M7 13 H13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="feature-title">不再自己想下一步</div>
          <div class="feature-text">系统告诉你“今天该做什么”，减少决策疲劳。</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
              <path d="M4 16 L9 11 L13 13 L20 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="feature-title">路线图可视化推进</div>
          <div class="feature-text">看到清晰的进度、阶段达成率、下一步路径，避免迷茫。</div>
        </div>
        <div class="feature-card">
          <div class="feature-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
              <path d="M12 5 A7 7 0 1 0 19 12" stroke="currentColor" stroke-width="1.6" fill="none"/>
              <path d="M20 4 L20 9 L15 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="feature-title">动态调整计划</div>
          <div class="feature-text">你的进度真实变化时，Milestone 会自动为你调节节奏。</div>
        </div>
      </div>
    </section>

    <section class="section how">
      <div class="section-title">3 步，让任何目标都能被完成</div>
      <div class="steps">
        <div class="step">
          <div class="step-index">1</div>
          <div class="step-title">说出你的目标</div>
          <div class="step-text">输入一句话目标即可，无需会写计划。示例：“我想通过 N2”、“我想跑 10 公里”、“我想开始一个副业”。</div>
        </div>
        <div class="step">
          <div class="step-index">2</div>
          <div class="step-title">回答几个必要问题</div>
          <div class="step-text">背景、时间、当前状态、以往尝试等。Milestone 依此为你生成“适合你”的计划。</div>
        </div>
        <div class="step">
          <div class="step-index">3</div>
          <div class="step-title">获得可执行路线图</div>
          <div class="step-text">包含里程碑阶段、每周行动重点、每日可完成的小步骤与自动追踪反馈。你只需要照着清单做即可。</div>
        </div>
      </div>
    </section>

    <section class="section samples">
      <div class="section-title">看看别人如何用 Milestone 推进目标</div>
      <div class="cards samples-grid">
        <div class="sample-card">
          <div class="sample-title">减脂 5 公斤 · 90 天</div>
          <ul class="sample-list">
            <li>第 1 阶段：饮食重置</li>
            <li>第 2 阶段：基础训练</li>
            <li>第 3 阶段：强化阶段</li>
            <li>第 4 阶段：维持 & 复盘</li>
          </ul>
        </div>
        <div class="sample-card">
          <div class="sample-title">英语四级 · 60 天冲刺</div>
          <ul class="sample-list">
            <li>词汇基础</li>
            <li>题型拆解</li>
            <li>模考节奏</li>
            <li>考前 7 天复盘</li>
          </ul>
        </div>
        <div class="sample-card">
          <div class="sample-title">30 天完成一个副业 MVP</div>
          <ul class="sample-list">
            <li>选题验证</li>
            <li>需求整理</li>
            <li>做最小原型</li>
            <li>上线测试</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="section quotes">
      <div class="section-title">关于目标与路线</div>
      <div class="cards quotes-grid">
        <div class="quote-card">
          <div class="quote-text-en">“All problems that look like ‘lack of action’ actually come from a lack of clarity and precision.”</div>
          <div class="quote-text-cn">“所有的行动力的问题，其实都来源于精确性的不足。”</div>
          <div class="quote-foot"><img class="quote-avatar" :src="avatarElon" alt="Elon Musk" /><div class="quote-author">伊隆·马斯克（Elon Musk，企业家）</div></div>
        </div>

        <div class="quote-card">
          <div class="quote-text-en">“People don’t fail because they lack willpower. They fail because the system doesn’t support them.”</div>
          <div class="quote-text-cn">“人们失败并不是因为缺少意志力，而是因为系统没有支持他们。”</div>
          <div class="quote-foot"><img class="quote-avatar" :src="avatarFogg" alt="BJ Fogg" /><div class="quote-author">BJ Fogg（斯坦福行为设计实验室）</div></div>
        </div>
        <div class="quote-card">
          <div class="quote-text-en">“People act based on the path of least resistance.”</div>
          <div class="quote-text-cn">“人们会沿着阻力最小的路径行动。”</div>
          <div class="quote-foot"><img class="quote-avatar" :src="avatarRicardo" alt="David Ricardo" /><div class="quote-author">大卫·李嘉图（David Ricardo）</div></div>
        </div>
        <div class="quote-card">
          <div class="quote-text-en">“You do not rise to the level of your goals. You fall to the level of your systems.”</div>
          <div class="quote-text-cn">“你不会达到目标的高度，你会掉到你所建立系统的水平。”</div>
          <div class="quote-foot"><img class="quote-avatar" :src="avatarJames" alt="James Clear" /><div class="quote-author">詹姆斯·克利尔（James Clear，《原子习惯》作者）</div></div>
        </div>
        <div class="quote-card">
          <div class="quote-text-en">“Plans are only good intentions unless they immediately degenerate into hard work.”</div>
          <div class="quote-text-cn">“计划若不能立刻变成艰苦的行动，就只是一种良好的意愿。”</div>
          <div class="quote-foot"><img class="quote-avatar" :src="avatarDrucker" alt="Peter Drucker" /><div class="quote-author">彼得·德鲁克（Peter Drucker）</div></div>
        </div>
        <div class="quote-card">
          <div class="quote-text-en">“The safest way to get what you want is to deserve what you want.”</div>
          <div class="quote-text-cn">“得到你想要之物的最安全方式，就是让自己配得上它。”</div>
          <div class="quote-foot"><img class="quote-avatar" :src="avatarMunger" alt="Charlie Munger" /><div class="quote-author">查理·芒格（Charlie Munger）</div></div>
        </div>
      </div>
    </section>

    <section class="section audience">
      <div class="section-title">Milestone 适合任何想要“搞定一件事”的人</div>
      <div class="tag-cloud">
        <span class="tag">想要改变但不知道从哪开始</span>
        <span class="tag">学过很多方法却执行不下去</span>
        <span class="tag">雄心万丈结果被各种问题卡住了</span>
        <span class="tag">想转行 / 学技能，但缺路径</span>
        <span class="tag">想减脂 /健身但容易半途</span>
        <span class="tag">不想每天自己想“今天干啥”</span>
        <span class="tag">想做副业 / 做项目但不知道顺序</span>
        <span class="tag">想让生活更有秩序的人</span>
      </div>
      <div class="section-note">你并不缺动力，缺的是KnowHow，Milestone 帮你搞定这个路线。</div>
    </section>

    <section class="section final-cta">
      <div class="section-title">准备好开启你的下一段旅程了吗？</div>
      <div class="section-sub">说出你的目标，Milestone 帮你把它搞定！</div>
      <button class="btn btn-primary btn-cta" @click="start">立即开始使用 Milestone</button>
    </section>
    <footer class="site-footer">Copyright©Zhildata 2025-2026</footer>
  </div>
  </template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const goal = ref('')
const inputRef = ref(null)
import avatarElon from '../../../famous/Elon Musk.png'
import avatarMunger from '../../../famous/Charlie Munger.png'
import avatarDrucker from '../../../famous/Peter Drucker.png'
import avatarJames from '../../../famous/James Clear.png'
import avatarFogg from '../../../famous/BJ Fogg.png'
import avatarRicardo from '../../../famous/David Ricardo.png'

function start() {
  const base = (goal.value || '').trim()
  if (!base) return
  router.push({ path:'/chat', query:{ goal: base } })
}

const exampleTexts = [
  '“三个月瘦 5 公斤”',
  '“90 天跑完 10 公里”',
  '“30 天早睡早起”',
  '“60 天通过英语四级”',
  '“半年转行做产品”',
  '“提高睡眠质量”',
  '“做一个副业赚钱”',
  '“7 天读完一本书并做笔记”',
  '“一个月写完 5 篇技术文章”',
  '“90 天掌握 Python 基础”',
  '“30 天完成个人网站”',
  '“完成 21 天冥想”',
  '“30 天坚持力量训练”',
  '“提升演讲与表达能力”',
  '“通过 JLPT N2”',
  '“通过 PMP 考试”',
  '“提升数据分析能力”',
  '“学会基础摄影并出片”',
  '“完成 30 天断舍离”',
  '“建立理财与记账习惯”',
  '“完成一次半马”',
  '“学会基础吉他伴奏”',
  '“做一个 Notion 模板并上线”',
  '“完成一个副业 MVP”',
  '“90 天提高口语表达”',
  '“30 天写完 3 个开源 PR”',
  '“30 天掌握数据可视化”',
  '“60 天拿到驾照”',
  '“30 天完成家庭收纳”',
  '“建立阅读与输出习惯”',
  '“完整跑步 50 公里月度挑战”',
  '“30 天零糖挑战”',
  '“一个月学会基础钢琴”',
  '“30 天完成摄影打样集”',
  '“90 天通过雅思 6.5”',
  '“60 天完成 UI 作品集”',
  '“一个月完成 1 本技术书”',
  '“建立每周复盘习惯”',
  '“30 天完成简历与求职准备”',
  '“30 天完成小红书内容 20 篇”',
  '“一个月发布 4 条视频”'
]
const slots = 16
const slotIndices = ref(Array.from({ length: slots }, (_, i) => i % exampleTexts.length))
const hovered = ref(new Set())
const visibleExamples = computed(() => slotIndices.value.map(i => exampleTexts[i]))
let timer
onMounted(() => {
  timer = setInterval(() => {
    const used = new Set()
    slotIndices.value = slotIndices.value.map((idx, i) => {
      if (hovered.value.has(i)) { used.add(idx); return idx }
      if (Math.random() < 0.45) { used.add(idx); return idx }
      let next = (idx + 1 + Math.floor(Math.random() * 3)) % exampleTexts.length
      while (used.has(next)) next = (next + 1) % exampleTexts.length
      used.add(next)
      return next
    })
  }, 4200)
})
onBeforeUnmount(() => { if (timer) clearInterval(timer) })

function onHover(i, isEnter) {
  const s = new Set(hovered.value)
  if (isEnter) s.add(i)
  else s.delete(i)
  hovered.value = s
}

function stripQuotes(t) {
  return t.replace(/[“”]/g, '')
}

function onPick(t) {
  goal.value = stripQuotes(t)
  if (inputRef.value) inputRef.value.focus()
}
</script>

<style scoped>
</style>

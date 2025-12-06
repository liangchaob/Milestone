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
          <div class="feature-title">自动拆解你的目标</div>
          <div class="feature-text">输入一句话，Milestone 自动生成阶段目标、每周重点和每日行动。</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">不再自己想下一步</div>
          <div class="feature-text">系统告诉你“今天该做什么”，减少决策疲劳。</div>
        </div>
        <div class="feature-card">
          <div class="feature-title">路线图可视化推进</div>
          <div class="feature-text">看到清晰的进度、阶段达成率、下一步路径，避免迷茫。</div>
        </div>
        <div class="feature-card">
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
      <div class="section-note">所有计划都会根据你的背景自动调整。</div>
    </section>

    <section class="section diff">
      <div class="section-title">不是任务清单，而是真正的“目标实现系统”</div>
      <div class="compare">
        <div class="compare-row compare-head">
          <div class="compare-cell">功能</div>
          <div class="compare-cell">待办工具</div>
          <div class="compare-cell">习惯类工具</div>
          <div class="compare-cell">笔记/看板工具</div>
          <div class="compare-cell">Milestone</div>
        </div>
        <div class="compare-row">
          <div class="compare-cell">自动拆解目标</div>
          <div class="compare-cell">✗</div>
          <div class="compare-cell">✗</div>
          <div class="compare-cell">✗</div>
          <div class="compare-cell">✓</div>
        </div>
        <div class="compare-row">
          <div class="compare-cell">自动生成路线图</div>
          <div class="compare-cell">✗</div>
          <div class="compare-cell">✗</div>
          <div class="compare-cell">△</div>
          <div class="compare-cell">✓</div>
        </div>
        <div class="compare-row">
          <div class="compare-cell">告诉你下一步</div>
          <div class="compare-cell">✗</div>
          <div class="compare-cell">✗</div>
          <div class="compare-cell">✗</div>
          <div class="compare-cell">✓</div>
        </div>
        <div class="compare-row">
          <div class="compare-cell">动态调整</div>
          <div class="compare-cell">弱</div>
          <div class="compare-cell">弱</div>
          <div class="compare-cell">✗</div>
          <div class="compare-cell">✓</div>
        </div>
        <div class="compare-row">
          <div class="compare-cell">面向普通用户</div>
          <div class="compare-cell">△（计划难）</div>
          <div class="compare-cell">✓</div>
          <div class="compare-cell">△（复杂）</div>
          <div class="compare-cell">✓</div>
        </div>
      </div>
      <div class="section-sub">Milestone 帮你“从想做 → 到做到”。不是提醒你任务，而是让你完成目标。</div>
    </section>

    <section class="section audience">
      <div class="section-title">Milestone 适合任何想要“真正做成一件事”的人。</div>
      <div class="tag-cloud">
        <span class="tag">想要改变但不知道从哪开始</span>
        <span class="tag">学过很多方法却执行不下去</span>
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
      <div class="section-sub">说出你的目标，Milestone 会帮你把它做成。</div>
      <button class="btn btn-primary btn-cta" @click="start">立即开始使用 Milestone</button>
    </section>
  </div>
  </template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const goal = ref('')
const inputRef = ref(null)

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

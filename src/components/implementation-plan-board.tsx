"use client";

import Link from "next/link";

const phases = [
  {
    title: "第1阶段：先验证需求，不急着做全功能",
    date: "2026-07-26 至 2026-08-25",
    goal: "确认海外用户是否愿意为求职照 / 证件照结果付费。",
    actions: [
      "上线英文首页、定价页、预览页和邮箱收集表单。",
      "保留 3 个核心卖点：passport / visa、LinkedIn、resume photo。",
      "做 3-5 个 SEO 页面，不做大量内容农场。",
      "支付先接 Lemon Squeezy 链路占位，先看注册和点击意向。",
      "用 Codex 每周迭代文案、落地页和预览流程，不做 App。",
    ],
    deliverables: [
      "官网可访问",
      "用户可上传照片并看到预览",
      "有 waitlist 和 analytics",
      "有 1 套清晰价格结构",
    ],
    metrics: ["访问量 >= 300", "邮箱注册 >= 30", "付费或强意向 >= 5"],
  },
  {
    title: "第2阶段：做可卖的 v1，不做花哨平台",
    date: "2026-08-26 至 2026-10-25",
    goal: "把预览站升级成真正可以收款和交付的 Web 产品。",
    actions: [
      "完善上传、抠背景、尺寸裁切、前后对比和下载流程。",
      "接入订单记录、支付回执、邮件通知、历史记录。",
      "固定只做 3 套预设，不扩散到滤镜社区和聊天 AI。",
      "做最基础的退款、客服和 FAQ 页面。",
      "让 Codex 成为默认开发助手：页面、接口、文案、测试都由 Codex 协同完成。",
    ],
    deliverables: ["v1 上线", "美元支付可用", "下载链路完整", "基础售后流程可执行"],
    metrics: ["注册转付费 >= 3%", "退款率 < 8%", "至少 3 套尺寸稳定可用"],
  },
  {
    title: "第3阶段：开始放大自然流量和副线收入",
    date: "2026-10-26 至 2027-01-25",
    goal: "让主产品开始稳定获客，同时让 PFMEA / 精益产品贡献辅助现金流。",
    actions: [
      "补各国尺寸预设、打印排版、历史记录和重复下载。",
      "集中新增 30-50 个高意图 SEO 页面。",
      "正式准备 Product Hunt 发布，但前提是支付和新手流程稳定。",
      "把 PFMEA、精益模板、办公室检查清单做成标准数字包，放到 Gumroad / Lemon Squeezy。",
      "短视频只做演示型内容：前后对比、签证尺寸、LinkedIn 头像优化。",
    ],
    deliverables: [
      "主产品 SEO 体系",
      "副线数字包货架",
      "首轮公开发布素材",
      "基础转介绍机制",
    ],
    metrics: ["自然流量成为主渠道之一", "副线收入 >= 300 美元/月", "总月收入接近 1500 美元"],
  },
  {
    title: "第4阶段：验证通过后，再考虑第二曲线",
    date: "2027-01-26 至 2027-07-25",
    goal: "在已有收入基础上做包装升级，而不是重新创业一次。",
    actions: [
      "若 Web 已稳定，再封装 macOS / iOS 版本。",
      "建立联盟分销和简单推荐返佣。",
      "根据真实反馈决定是否做浏览器插件或更多证件尺寸包。",
      "继续保持 PFMEA / 精益产品标准化，拒绝重咨询和深定制。",
      "把团队扩张建立在现金流上，不提前养人。",
    ],
    deliverables: ["第二曲线候选产品", "增长渠道复用机制", "更稳定的月度复盘节奏"],
    metrics: ["月收入 2550-2850 美元", "折合月收入约 1.8 万到 2.1 万人民币", "达到年收入 20 万人民币节奏"],
  },
];

const solutions = [
  {
    title: "问题1：CATIA 自动压紧块没客户",
    answer:
      "解决方案：降级为备选项目，只保留介绍页或演示素材，不再占主开发周期。当前市场反馈不足，不适合继续作为现金流主线。",
  },
  {
    title: "问题2：B2B 太卷，沟通和交付太重",
    answer:
      "解决方案：B2B 不彻底放弃，但只做标准化数字包。PFMEA、精益工具、检查清单都按下载产品卖，不接高沟通定制。",
  },
  {
    title: "问题3：想做 B2C，客户池更大",
    answer:
      "解决方案：主产品锁定海外个人用户，优先做求职照、简历照、LinkedIn 头像和签证证件照。卖的是明确结果，不卖 AI 概念。",
  },
  {
    title: "问题4：如何尽量赚美元",
    answer:
      "解决方案：官网英文优先，收款以 Lemon Squeezy 为主，分发走 Product Hunt、Gumroad、SEO、Reddit、短视频。先做 Web，再考虑 App。",
  },
  {
    title: "问题5：只有 1 个人，如何推进",
    answer:
      "解决方案：先把产品范围压到极小。你自己负责产品、开发、内容和客服；收入稳定后，第一批外包给设计、内容和客服，不先扩程序员。",
  },
];

const channels = [
  "1. 独立官网：承接搜索流量和直接转化。",
  "2. Lemon Squeezy：美元收款和税务处理。",
  "3. SEO 页面：长期最便宜的获客渠道。",
  "4. Product Hunt：集中曝光，不是长期主渠道。",
  "5. Gumroad：副线数字包镜像销售。",
  "6. TikTok / YouTube Shorts / Instagram Reels：做短视频演示引流。",
  "7. Reddit / Quora：拿高意图问题流量。",
];

const staffing = [
  "0-6个月：1个人。你负责产品、开发、上线、客服、内容。",
  "6-12个月：1名全职 + 1名兼职或外包。优先设计、内容、客服。",
  "12-24个月：2-3人。你 + 增长运营 + 兼职开发或客服。",
  "24-36个月：4-6人。补产品开发、增长、客服、运营。",
  "36-60个月：7-10人。前提是至少 2-3 个产品持续盈利。",
];

const weeklyCadence = [
  "周一：看上周访问、注册、付费、退款，决定本周只优化 1 个核心漏斗。",
  "周二：用 Codex 改首页、定价页、SEO 页或上传流程。",
  "周三：补内容和短视频脚本，发布 1-2 条演示内容。",
  "周四：检查支付、邮件、下载、客服和退款流程。",
  "周五：做 1 次版本发布和复盘，更新下周优先级。",
  "周六：做海外社区分发或 Product Hunt 预热素材。",
];

export function ImplementationPlanBoard() {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 rounded-[38px] border border-line bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(238,244,233,0.94))] p-8 shadow-[0_30px_90px_rgba(17,36,60,0.10)] lg:grid-cols-[1.08fr_0.92fr] lg:p-12">
        <div className="space-y-6">
          <div className="inline-flex rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-night">
            12个月执行方案｜B2C 主线｜Codex 驱动开发
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-semibold leading-[1.02] tracking-tight text-night sm:text-6xl">
              先把 PhotoReady 做成能卖的 B2C 产品，再考虑扩公司。
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-muted">
              这不是公司管理系统，而是你接下来 12 个月的实施布局。
              主产品聚焦海外求职照 / 证件照处理工具，副线保留 PFMEA
              和精益数字产品，所有开发与迭代默认以 Codex 为主要开发工具。
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/preview"
              className="inline-flex h-12 items-center justify-center rounded-full bg-night px-6 text-sm font-semibold text-white transition hover:bg-accent-strong"
            >
              继续看产品预览
            </Link>
            <Link
              href="/pricing"
              className="inline-flex h-12 items-center justify-center rounded-full border border-line-strong px-6 text-sm font-semibold text-night transition hover:border-accent hover:text-accent-strong"
            >
              查看定价模型
            </Link>
          </div>
        </div>

        <div className="grid gap-4 rounded-[32px] bg-night p-5 text-white shadow-[0_28px_88px_rgba(17,36,60,0.22)]">
          <div className="rounded-[24px] border border-white/10 bg-white/6 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/60">
              收入目标
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[20px] bg-white/6 p-4">
                <div className="text-3xl font-semibold">20万 RMB</div>
                <div className="mt-2 text-sm text-white/70">12 个月目标年收入</div>
              </div>
              <div className="rounded-[20px] bg-white/6 p-4">
                <div className="text-3xl font-semibold">2550-2850 USD</div>
                <div className="mt-2 text-sm text-white/70">第 12 个月目标月收入</div>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/6 p-5">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-white/60">
              默认收入结构
            </p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-white/80">
              <p>120 个订阅用户 × 10 美元/月 = 1200 美元/月</p>
              <p>70 个单次购买用户 × 15 美元 = 1050 美元/月</p>
              <p>PFMEA / 精益数字产品 = 300-600 美元/月</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-[32px] border border-line bg-white p-8 shadow-[0_24px_80px_rgba(17,36,60,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
            先回答你的核心问题
          </p>
          <div className="mt-6 space-y-4">
            {solutions.map((item) => (
              <div
                key={item.title}
                className="rounded-[24px] border border-line bg-paper p-5"
              >
                <h2 className="text-2xl font-semibold tracking-tight text-night">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-muted">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[32px] border border-line bg-white p-8 shadow-[0_24px_80px_rgba(17,36,60,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
            这周就能开始的布局
          </p>
          <div className="mt-6 grid gap-4">
            {[
              "把首页主卖点固定为 passport / LinkedIn / resume 三件套。",
              "把支付描述固定成免费预览 + 单次付费 + 订阅等待名单。",
              "先做英文市场，不同时铺中文和 App Store。",
              "给 PFMEA / 精益工具单独做数字包货架页，不接定制。",
              "每周只优化 1 个漏斗：访问、注册、付费三选一。",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[22px] border border-line bg-[linear-gradient(180deg,#ffffff,#f4f6f1)] p-4 text-sm leading-7 text-night"
              >
                {item}
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-[24px] bg-night p-5 text-sm leading-7 text-white/80">
            核心原则：先卖明确结果，不卖复杂技术；先做 Web，后做 App；先做海外英文市场，后考虑国内和多语言。
          </div>
        </article>
      </section>

      <section className="rounded-[34px] border border-line bg-white p-8 shadow-[0_24px_80px_rgba(17,36,60,0.08)]">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
            分阶段执行
          </p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight text-night">
            从 1 个人开始，也能按阶段推进
          </h2>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {phases.map((phase) => (
            <article
              key={phase.title}
              className="rounded-[28px] border border-line bg-paper p-6"
            >
              <div className="text-sm font-semibold uppercase tracking-[0.14em] text-accent-strong">
                {phase.date}
              </div>
              <h3 className="mt-3 text-3xl font-semibold tracking-tight text-night">
                {phase.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-muted">
                目标：{phase.goal}
              </p>

              <div className="mt-5">
                <div className="text-sm font-semibold text-night">
                  关键动作
                </div>
                <ul className="mt-3 space-y-2 text-sm leading-7 text-muted">
                  {phase.actions.map((action) => (
                    <li key={action} className="flex gap-3">
                      <span className="mt-2 h-2.5 w-2.5 rounded-full bg-accent" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[20px] bg-white p-4">
                  <div className="text-sm font-semibold text-night">
                    阶段产出
                  </div>
                  <div className="mt-3 space-y-2 text-sm leading-7 text-muted">
                    {phase.deliverables.map((item) => (
                      <p key={item}>{item}</p>
                    ))}
                  </div>
                </div>
                <div className="rounded-[20px] bg-white p-4">
                  <div className="text-sm font-semibold text-night">
                    验收指标
                  </div>
                  <div className="mt-3 space-y-2 text-sm leading-7 text-muted">
                    {phase.metrics.map((item) => (
                      <p key={item}>{item}</p>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
        <article className="rounded-[32px] border border-line bg-white p-8 shadow-[0_24px_80px_rgba(17,36,60,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
            销售渠道顺序
          </p>
          <div className="mt-6 space-y-3">
            {channels.map((item) => (
              <div
                key={item}
                className="rounded-[22px] border border-line bg-paper p-4 text-sm leading-7 text-night"
              >
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[32px] border border-line bg-white p-8 shadow-[0_24px_80px_rgba(17,36,60,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
            人员发展预测
          </p>
          <div className="mt-6 space-y-3">
            {staffing.map((item) => (
              <div
                key={item}
                className="rounded-[22px] border border-line bg-[linear-gradient(180deg,#ffffff,#f4f6f1)] p-4 text-sm leading-7 text-night"
              >
                {item}
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-[24px] border border-line bg-paper p-5 text-sm leading-7 text-muted">
            招人原则：月稳定收入没到 1 万人民币前，不建议招全职；第一批外包优先设计、内容、客服，不先扩程序员。
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="rounded-[32px] border border-line bg-white p-8 shadow-[0_24px_80px_rgba(17,36,60,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
            Codex 执行方式
          </p>
          <div className="mt-6 grid gap-4">
            {[
              "用 Codex 生成和迭代首页、SEO 页面、定价页和政策页。",
              "用 Codex 完成 Next.js 页面、API、组件和表单流程。",
              "用 Codex 写产品文案、邮件模板、客服话术和发布清单。",
              "用 Codex 做每周版本更新、小实验和回归检查。",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[22px] border border-line bg-paper p-4 text-sm leading-7 text-night"
              >
                {item}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[32px] border border-line bg-white p-8 shadow-[0_24px_80px_rgba(17,36,60,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
            每周执行节奏
          </p>
          <div className="mt-6 space-y-3">
            {weeklyCadence.map((item) => (
              <div
                key={item}
                className="rounded-[22px] border border-line bg-[linear-gradient(180deg,#ffffff,#f4f6f1)] p-4 text-sm leading-7 text-night"
              >
                {item}
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}

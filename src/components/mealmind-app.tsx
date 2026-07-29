"use client";

import {
  startTransition,
  useMemo,
  useId,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import {
  AppTab,
  cuisineOptions as cuisineOptionDefs,
  createDailyDigest,
  defaultPreferenceState,
  dietaryOptions as dietaryOptionDefs,
  dishCandidates,
  quickMealFilters,
  supportPlatforms as supportPlatformDefs,
  tasteOptions as tasteOptionDefs,
  type CuisineId,
  type DishCandidate,
  type MealSlot,
  type RestrictionId,
  type TasteId,
} from "@/lib/mealmind";

type PreferenceState = typeof defaultPreferenceState;

type RankedDish = DishCandidate & {
  score: number;
  rankLabel: string;
};

const TAB_ORDER: Array<{
  id: AppTab;
  label: string;
  icon: ComponentType<{ active?: boolean }>;
}> = [
  { id: "today", label: "今日", icon: HomeIcon },
  { id: "import", label: "导入", icon: UploadIcon },
  { id: "settings", label: "设置", icon: GearIcon },
];

const rankLabels = ["稳妥复购", "相近替代", "低重复探索"] as const;

export function MealMindApp() {
  const [activeTab, setActiveTab] = useState<AppTab>("today");
  const [preferences, setPreferences] = useState<PreferenceState>(
    defaultPreferenceState,
  );
  const [selectedDishId, setSelectedDishId] = useState(dishCandidates[0].id);
  const [refreshTick, setRefreshTick] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const digest = useMemo(() => createDailyDigest(new Date()), []);

  const rankedRecommendations = useMemo(
    () =>
      rankDishes(
        dishCandidates,
        preferences,
        refreshTick,
        selectedDishId,
      ).slice(0, 3),
    [preferences, refreshTick, selectedDishId],
  );

  const effectiveSelectedDishId = rankedRecommendations.some(
    (dish) => dish.id === selectedDishId,
  )
    ? selectedDishId
    : rankedRecommendations[0]?.id ?? dishCandidates[0].id;

  const activeDish =
    rankedRecommendations.find((dish) => dish.id === effectiveSelectedDishId) ??
    rankedRecommendations[0] ??
    dishCandidates[0];

  const themeClasses = isDarkMode
    ? "bg-[#10131a] text-white"
    : "bg-[#f3f4f8] text-[#17181c]";
  const shellClasses = isDarkMode
    ? "border-white/8 bg-[#10141c] shadow-[0_28px_90px_rgba(2,6,23,0.35)]"
    : "border-black/5 bg-[#fffefc] shadow-[0_28px_90px_rgba(15,23,42,0.12)]";
  const panelClasses = isDarkMode
    ? "border-white/8 bg-white/4 text-white shadow-[0_18px_40px_rgba(2,6,23,0.24)]"
    : "border-[#ece8e2] bg-white text-[#1c1d21] shadow-[0_10px_24px_rgba(15,23,42,0.06)]";
  const mutedTextClasses = isDarkMode ? "text-white/62" : "text-[#7b7f89]";

  function updatePreference<K extends keyof PreferenceState>(
    key: K,
    value: PreferenceState[K],
  ) {
    setPreferences((current) => ({ ...current, [key]: value }));
  }

  function toggleRestriction(id: RestrictionId) {
    setPreferences((current) => ({
      ...current,
      restrictions: {
        ...current.restrictions,
        [id]: !current.restrictions[id],
      },
    }));
  }

  function toggleCuisine(id: CuisineId) {
    setPreferences((current) => ({
      ...current,
      cuisines: {
        ...current.cuisines,
        [id]: !current.cuisines[id],
      },
    }));
  }

  function setTaste(taste: TasteId, value: number) {
    setPreferences((current) => ({
      ...current,
      tastes: {
        ...current.tastes,
        [taste]: value,
      },
    }));
  }

  function setPriceBound(bound: "min" | "max", value: number) {
    setPreferences((current) => {
      const next = {
        ...current.priceRange,
        [bound]: value,
      };
      if (next.min > next.max) {
        if (bound === "min") {
          next.max = value;
        } else {
          next.min = value;
        }
      }
      return { ...current, priceRange: next };
    });
  }

  const handleTabChange = (tab: AppTab) => {
    startTransition(() => {
      setActiveTab(tab);
    });
  };

  return (
    <main className={`min-h-screen ${themeClasses} px-3 py-3 sm:px-6 sm:py-6`}>
      <div
        className={`relative mx-auto flex min-h-[calc(100svh-1.5rem)] w-full max-w-[430px] flex-col overflow-hidden rounded-[36px] border ${shellClasses}`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,100,47,0.12),transparent_30%),radial-gradient(circle_at_80%_18%,rgba(255,150,80,0.08),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.3),rgba(255,255,255,0))]" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/60 to-transparent" />

        <div className="relative flex flex-1 flex-col">
          <StatusBar dark={isDarkMode} />

          <header className="px-5 pt-1">
            {activeTab === "today" ? (
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <BrandMark />
                    <div className="text-[28px] font-extrabold tracking-[-0.05em]">
                      MealMind
                      <span className="text-[#ff642f]">AI</span>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-[32px] font-extrabold leading-[1.06] tracking-[-0.05em]">
                      Good Morning! ☀️
                    </h1>
                    <p className={`mt-2 text-[15px] ${mutedTextClasses}`}>
                      {digest.month} {digest.day}, {digest.year} • {digest.weekday}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className={`relative mt-1 inline-flex h-11 w-11 items-center justify-center rounded-full border ${isDarkMode ? "border-white/10 bg-white/6" : "border-[#ece8e2] bg-white"} transition hover:scale-[1.03]`}
                  aria-label="Notifications"
                >
                  <BellIcon />
                  <span className="absolute right-[12px] top-[11px] h-2.5 w-2.5 rounded-full border-2 border-white bg-[#ff5a2b]" />
                </button>
              </div>
            ) : activeTab === "import" ? (
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleTabChange("today")}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${isDarkMode ? "border-white/10 bg-white/6" : "border-[#ece8e2] bg-white"} transition hover:scale-[1.03]`}
                  aria-label="Back"
                >
                  <BackIcon />
                </button>
                <div className="flex-1 text-center">
                  <h1 className="text-[24px] font-bold tracking-[-0.04em]">
                    导入偏好
                  </h1>
                </div>
                <div className="h-10 w-10" />
              </div>
            ) : (
              <div className="pt-2 text-center">
                <h1 className="text-[24px] font-bold tracking-[-0.04em]">
                  设置
                </h1>
              </div>
            )}
          </header>

          <section className="relative flex-1 overflow-y-auto px-4 pb-28 pt-4">
            {activeTab === "today" ? (
              <TodayScreen
                recommendations={rankedRecommendations}
                activeDish={activeDish}
                panelClasses={panelClasses}
                mutedTextClasses={mutedTextClasses}
                onSelectDish={setSelectedDishId}
                onRefresh={() =>
                  setRefreshTick((current) => (current + 1) % 97)
                }
                mealSlot={preferences.mealSlot}
                onMealSlotChange={(slot) =>
                  updatePreference("mealSlot", slot as MealSlot)
                }
              />
            ) : activeTab === "import" ? (
              <ImportScreen
                panelClasses={panelClasses}
                preferences={preferences}
                dietaryOptions={dietaryOptionDefs}
                cuisineOptions={cuisineOptionDefs}
                tasteOptions={tasteOptionDefs}
                supportPlatforms={supportPlatformDefs}
                onToggleRestriction={toggleRestriction}
                onToggleCuisine={toggleCuisine}
                onPriceBoundChange={setPriceBound}
                onTasteChange={setTaste}
                onSave={() => handleTabChange("today")}
              />
            ) : (
              <SettingsScreen
                panelClasses={panelClasses}
                mutedTextClasses={mutedTextClasses}
                isDarkMode={isDarkMode}
                onDarkModeChange={setIsDarkMode}
              />
            )}
          </section>

          <BottomNav
            activeTab={activeTab}
            isDarkMode={isDarkMode}
            onChange={handleTabChange}
          />
        </div>
      </div>
    </main>
  );
}

function TodayScreen({
  recommendations,
  activeDish,
  panelClasses,
  mutedTextClasses,
  onSelectDish,
  onRefresh,
  mealSlot,
  onMealSlotChange,
}: {
  recommendations: RankedDish[];
  activeDish: RankedDish;
  panelClasses: string;
  mutedTextClasses: string;
  onSelectDish: (id: string) => void;
  onRefresh: () => void;
  mealSlot: MealSlot;
  onMealSlotChange: (slot: MealSlot) => void;
}) {
  return (
    <div className="space-y-4">
      <section
        className={`overflow-hidden rounded-[30px] border ${panelClasses}`}
      >
        <div className="relative grid gap-4 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-3">
              <div className="inline-flex rounded-full bg-[#fff2ea] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#ff642f]">
                Today&apos;s Pick
              </div>
              <div className="space-y-1">
                <h2 className="max-w-[210px] text-[28px] font-extrabold leading-[1.05] tracking-[-0.05em]">
                  {activeDish.dishName}
                </h2>
                <p className={`text-[14px] ${mutedTextClasses}`}>
                  {activeDish.merchantName}
                </p>
              </div>
              <div className="flex items-center gap-2 text-[14px] font-medium">
                <StarRow rating={activeDish.rating} />
                <span className={mutedTextClasses}>{activeDish.rating.toFixed(1)}</span>
                <span className={mutedTextClasses}>({activeDish.confidence})</span>
              </div>
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center rounded-[16px] bg-gradient-to-r from-[#ff6c32] to-[#ff4f29] px-4 text-[14px] font-semibold text-white shadow-[0_10px_24px_rgba(255,102,51,0.28)] transition hover:translate-y-[-1px]"
              >
                设为今天选择
              </button>
            </div>
            <div className="relative shrink-0">
              <div className="absolute inset-0 rounded-[30px] bg-gradient-to-br from-[#ffefe3] via-[#fff9f4] to-[#ecf7ff] blur-2xl" />
              <div className="relative h-[188px] w-[190px]">
                <DishVisual key={activeDish.id} dish={activeDish} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {recommendationHints(activeDish).map((hint) => (
              <span
                key={hint}
                className="rounded-full bg-[#f6f7fb] px-3 py-1 text-[12px] font-medium text-[#4f5562]"
              >
                {hint}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 rounded-[22px] bg-[#f8f9fc] px-4 py-3">
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#8b909c]">
                Meal focus
              </div>
              <div className="mt-1 text-[15px] font-semibold">
                {mealSlot === "午餐"
                  ? "午餐优先 · 平衡口味"
                  : mealSlot === "晚餐"
                    ? "晚餐优先 · 适度饱腹"
                    : mealSlot === "早餐"
                      ? "早餐优先 · 轻量提神"
                      : "夜宵优先 · 低重复"}
              </div>
            </div>
            <button
              type="button"
              onClick={onRefresh}
              className="inline-flex h-10 items-center justify-center rounded-full border border-[#ff642f]/20 bg-white px-4 text-[13px] font-semibold text-[#ff5b2d] transition hover:bg-[#fff4ef]"
            >
              换一批
            </button>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-[17px] font-bold tracking-[-0.03em]">Quick Filters</h3>
          <button
            type="button"
            className={`text-[13px] font-medium ${mutedTextClasses}`}
          >
            See All
          </button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          {quickMealFilters.map((filter) => {
            const active = filter.id === mealSlot;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => onMealSlotChange(filter.id)}
                className={`rounded-[22px] border px-2 py-3 text-center transition duration-300 ${
                  active
                    ? "border-[#ff642f]/20 bg-[#fff5ef] shadow-[0_12px_28px_rgba(255,100,47,0.12)]"
                    : `border-transparent ${panelClasses}`
                }`}
                style={{ transform: active ? "translateY(-2px)" : "translateY(0)" }}
              >
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#fff5ef] text-[22px]">
                  {filter.icon}
                </div>
                <div className="mt-2 text-[13px] font-medium">{filter.label}</div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[17px] font-bold tracking-[-0.03em]">
            Recommended For You
          </h3>
          <span className={`text-[13px] ${mutedTextClasses}`}>
            只给你 3 个选项
          </span>
        </div>

        <div className="grid gap-3">
          {recommendations.map((dish, index) => {
            const active = activeDish.id === dish.id;
            return (
              <button
                key={dish.id}
                type="button"
                onClick={() => onSelectDish(dish.id)}
                className={`group w-full overflow-hidden rounded-[26px] border text-left transition-all duration-300 ${
                  active
                    ? "border-[#ff642f]/30 bg-white shadow-[0_18px_36px_rgba(255,100,47,0.14)]"
                    : `${panelClasses} hover:-translate-y-0.5`
                }`}
              >
                <div className="grid grid-cols-[108px_minmax(0,1fr)] gap-0">
                  <div className="relative h-full min-h-[118px]">
                    <DishVisual small key={dish.id} dish={dish} />
                    <div className="absolute left-3 top-3 rounded-full bg-white/88 px-2.5 py-1 text-[11px] font-semibold text-[#ff5d2e] shadow-sm">
                      #{index + 1} {rankLabels[index]}
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-col justify-between p-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-[17px] font-bold leading-tight tracking-[-0.03em]">
                            {dish.dishName}
                          </h4>
                          <p className={`mt-1 text-[13px] ${mutedTextClasses}`}>
                            {dish.merchantName}
                          </p>
                        </div>
                        <div className="rounded-full bg-[#f6f7fb] px-2.5 py-1 text-[11px] font-semibold text-[#ff5d2e]">
                          {dish.confidence}%
                        </div>
                      </div>
                      <p className={`line-clamp-2 text-[13px] leading-6 ${mutedTextClasses}`}>
                        {dish.summary}
                      </p>
                    </div>

                    <div className="mt-3 flex items-end justify-between gap-3">
                      <div className="flex flex-wrap gap-1.5">
                        {dish.reasonTags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-[#f6f7fb] px-2.5 py-1 text-[11px] font-medium text-[#57606e]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="text-right">
                        <div className="text-[14px] font-semibold text-[#ff5d2e]">
                          {dish.estimatedPrice}
                        </div>
                        <div className={`text-[12px] ${mutedTextClasses}`}>
                          {dish.estimatedEta}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function ImportScreen({
  panelClasses,
  preferences,
  dietaryOptions,
  cuisineOptions,
  tasteOptions,
  supportPlatforms,
  onToggleRestriction,
  onToggleCuisine,
  onPriceBoundChange,
  onTasteChange,
  onSave,
}: {
  panelClasses: string;
  preferences: PreferenceState;
  dietaryOptions: typeof dietaryOptionDefs;
  cuisineOptions: typeof cuisineOptionDefs;
  tasteOptions: typeof tasteOptionDefs;
  supportPlatforms: string[];
  onToggleRestriction: (id: RestrictionId) => void;
  onToggleCuisine: (id: CuisineId) => void;
  onPriceBoundChange: (bound: "min" | "max", value: number) => void;
  onTasteChange: (taste: TasteId, value: number) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-4">
      <PreferenceSection title="饮食限制" subtitle="选择你的饮食需求，AI 将据此推荐" panelClasses={panelClasses}>
        <div className="space-y-1.5">
          {dietaryOptions.map((option) => {
            const enabled = preferences.restrictions[option.id];
            return (
              <div
                key={option.id}
                role="button"
                tabIndex={0}
                onClick={() => onToggleRestriction(option.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onToggleRestriction(option.id);
                  }
                }}
                className="flex w-full cursor-pointer items-center gap-3 rounded-[18px] px-1 py-2.5 text-left transition hover:bg-black/[0.02]"
              >
                <span className="text-[24px]">{option.icon}</span>
                <span className="flex-1 text-[15px] font-medium text-[#1d2026]">
                  {option.label}
                </span>
                <Switch enabled={enabled} />
              </div>
            );
          })}
        </div>
      </PreferenceSection>

      <PreferenceSection title="菜系偏好" subtitle="选择你喜欢的菜系" panelClasses={panelClasses}>
        <div className="flex flex-wrap gap-2">
          {cuisineOptions.map((option) => {
            const active = preferences.cuisines[option.id];
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onToggleCuisine(option.id)}
                className={`rounded-full px-5 py-2.5 text-[14px] font-semibold transition ${
                  active
                    ? "bg-[#ff642f] text-white shadow-[0_10px_24px_rgba(255,100,47,0.24)]"
                    : "border border-[#dcdfe6] bg-white text-[#40444d]"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </PreferenceSection>

      <PreferenceSection title="价格区间" subtitle="设置每餐预算范围" panelClasses={panelClasses}>
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <span className="text-[14px] font-medium text-[#5a5f69]">¥15</span>
            <span className="text-[26px] font-extrabold tracking-[-0.04em] text-[#ff642f]">
              ¥{preferences.priceRange.min} - ¥{preferences.priceRange.max}
            </span>
            <span className="text-[14px] font-medium text-[#5a5f69]">¥80</span>
          </div>
          <DualRange
            min={15}
            max={80}
            valueMin={preferences.priceRange.min}
            valueMax={preferences.priceRange.max}
            onMinChange={(value) => onPriceBoundChange("min", value)}
            onMaxChange={(value) => onPriceBoundChange("max", value)}
          />
          <div className="flex justify-between text-[13px] text-[#70747d]">
            <span>经济</span>
            <span>适中</span>
            <span>品质</span>
            <span>高端</span>
          </div>
        </div>
      </PreferenceSection>

      <PreferenceSection title="口味偏好" subtitle="调整口味权重" panelClasses={panelClasses}>
        <div className="space-y-4">
          {tasteOptions.map((option) => {
            const value = preferences.tastes[option.id];
            return (
              <div key={option.id} className="grid grid-cols-[76px_56px_minmax(0,1fr)_56px] items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[22px]">
                    {option.id === "spicy" ? "🌶️" : option.id === "greasy" ? "💧" : "🍬"}
                  </span>
                  <span className="text-[14px] font-semibold">{option.label}</span>
                </div>
                <span className="text-[13px] text-[#6a707a]">{option.minLabel}</span>
                <RangeSlider value={value} onChange={(next) => onTasteChange(option.id, next)} />
                <span className="text-right text-[13px] text-[#6a707a]">{option.maxLabel}</span>
              </div>
            );
          })}
        </div>
      </PreferenceSection>

      <PreferenceSection title="导入历史订单" subtitle="从外卖平台或截图导入历史订单" panelClasses={panelClasses}>
        <div className="space-y-4">
          <button
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-[18px] border border-[#ff642f] bg-white px-4 py-4 text-[15px] font-semibold text-[#ff5d2e] transition hover:bg-[#fff6f1]"
          >
            <CameraIcon />
            从外卖平台导入历史订单
          </button>
          <div className="text-center text-[13px] text-[#6f7480]">
            支持平台：
            <span className="ml-2 inline-flex flex-wrap justify-center gap-2 align-middle">
              {supportPlatforms.map((platform) => (
                <span
                  key={platform}
                  className="inline-flex items-center rounded-full bg-[#f6f7fb] px-3 py-1.5 font-medium text-[#4e5461]"
                >
                  {platform}
                </span>
              ))}
            </span>
          </div>
        </div>
      </PreferenceSection>

      <button
        type="button"
        onClick={onSave}
        className="sticky bottom-4 flex h-[58px] w-full items-center justify-center rounded-[18px] bg-gradient-to-r from-[#ff6c32] to-[#ff4f29] text-[18px] font-extrabold text-white shadow-[0_16px_36px_rgba(255,100,47,0.28)] transition hover:translate-y-[-1px]"
      >
        保存偏好
      </button>
    </div>
  );
}

function SettingsScreen({
  panelClasses,
  mutedTextClasses,
  isDarkMode,
  onDarkModeChange,
}: {
  panelClasses: string;
  mutedTextClasses: string;
  isDarkMode: boolean;
  onDarkModeChange: (value: boolean) => void;
}) {
  return (
    <div className="space-y-4">
      <section className={`rounded-[30px] border ${panelClasses} p-4`}>
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#ff7a42] to-[#ff4d28] text-[30px] font-extrabold text-white shadow-[0_10px_24px_rgba(255,100,47,0.24)]">
            U
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[22px] font-extrabold tracking-[-0.04em]">
              User_9527
            </div>
            <div className={`mt-1 text-[14px] ${mutedTextClasses}`}>
              user@example.com
            </div>
          </div>
          <button
            type="button"
            className="rounded-full border border-[#ff642f] px-4 py-2 text-[14px] font-semibold text-[#ff5d2e]"
          >
            编辑资料
          </button>
        </div>
      </section>

      <SettingsGroup title="账户" panelClasses={panelClasses}>
        <SettingsRow icon={<UserIcon />} label="账户与安全" />
        <SettingsRow icon={<CardIcon />} label="支付方式" />
        <SettingsRow icon={<LocationIcon />} label="收货地址" />
      </SettingsGroup>

      <SettingsGroup title="偏好" panelClasses={panelClasses}>
        <SettingsRow icon={<BellIcon small />} label="通知设置" />
        <SettingsRow
          icon={<MoonIcon />}
          label="深色模式"
          rightNode={<Switch enabled={isDarkMode} onClick={() => onDarkModeChange(!isDarkMode)} />}
        />
        <SettingsRow icon={<GlobeIcon />} label="语言" value="简体中文" />
      </SettingsGroup>

      <SettingsGroup title="数据" panelClasses={panelClasses}>
        <SettingsRow icon={<StatsIcon />} label="用餐统计" />
        <SettingsRow icon={<BadgeIcon />} label="成就徽章" />
        <div className="px-4 pb-4 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#ff642f]/20 bg-[#fff3ed]">
                <TrendIcon />
              </span>
              <span className="text-[16px] font-medium">AI推荐准确率</span>
            </div>
            <span className="text-[18px] font-bold text-[#ff5d2e]">87%</span>
          </div>
          <div className="mt-3 h-3 rounded-full bg-[#e8ebf2]">
            <div className="h-3 rounded-full bg-gradient-to-r from-[#ff6c32] to-[#ff4f29]" style={{ width: "87%" }} />
          </div>
        </div>
      </SettingsGroup>

      <SettingsGroup title="帮助" panelClasses={panelClasses}>
        <SettingsRow icon={<HelpIcon />} label="帮助中心" />
        <SettingsRow icon={<MessageIcon />} label="反馈建议" />
        <SettingsRow icon={<StarIcon />} label="评分应用" />
      </SettingsGroup>

      <SettingsGroup title="关于" panelClasses={panelClasses}>
        <SettingsRow icon={<InfoIcon />} label="关于 MealMind" />
        <SettingsRow icon={<DocIcon />} label="隐私政策" />
        <SettingsRow icon={<EditIcon />} label="用户协议" />
        <div className={`pb-3 pt-2 text-center text-[13px] ${mutedTextClasses}`}>
          Version 2.1.0
        </div>
      </SettingsGroup>

      <button
        type="button"
        className="h-[54px] w-full rounded-[18px] border border-[#ff642f] bg-white text-[18px] font-bold text-[#e63923]"
      >
        退出登录
      </button>
    </div>
  );
}

function PreferenceSection({
  title,
  subtitle,
  panelClasses,
  children,
}: {
  title: string;
  subtitle: string;
  panelClasses: string;
  children: ReactNode;
}) {
  return (
    <section className={`rounded-[28px] border ${panelClasses} p-4`}>
      <div className="mb-3 flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ff642f]/20 bg-[#fff4ed] text-[20px]">
          <LeafIcon />
        </span>
        <div>
          <h2 className="text-[18px] font-extrabold tracking-[-0.03em]">{title}</h2>
          <p className="mt-1 text-[13px] text-[#757b86]">{subtitle}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function SettingsGroup({
  title,
  panelClasses,
  children,
}: {
  title: string;
  panelClasses: string;
  children: ReactNode;
}) {
  return (
    <section className={`rounded-[28px] border ${panelClasses}`}>
      <div className="px-4 pt-4 text-[15px] font-medium text-[#6d7280]">
        {title}
      </div>
      <div className="mt-2 divide-y divide-[#eceef3]">
        {children}
      </div>
    </section>
  );
}

function SettingsRow({
  icon,
  label,
  value,
  rightNode,
}: {
  icon: ReactNode;
  label: string;
  value?: string;
  rightNode?: ReactNode;
}) {
  return (
    <div className="flex min-h-[60px] items-center gap-3 px-4 py-2">
      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#fff6f2] text-[#ff5d2e]">
        {icon}
      </span>
      <span className="text-[16px] font-medium">{label}</span>
      <div className="ml-auto flex items-center gap-3 text-[14px] text-[#7d8290]">
        {value ? <span>{value}</span> : null}
        {rightNode}
        {!rightNode && !value ? <ChevronRightIcon /> : null}
      </div>
    </div>
  );
}

function BottomNav({
  activeTab,
  isDarkMode,
  onChange,
}: {
  activeTab: AppTab;
  isDarkMode: boolean;
  onChange: (tab: AppTab) => void;
}) {
  const navClasses = isDarkMode
    ? "border-white/8 bg-[#10141c]/96"
    : "border-[#ece8e2] bg-white/96";

  return (
    <nav
      className={`absolute inset-x-3 bottom-3 rounded-[26px] border px-2 py-2 backdrop-blur-xl ${navClasses}`}
    >
      <div className="grid grid-cols-3 gap-2">
        {TAB_ORDER.map((item) => {
          const active = item.id === activeTab;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`flex flex-col items-center justify-center rounded-[20px] py-2.5 transition duration-300 ${
                active
                  ? "bg-[#fff1e9] text-[#ff5d2e] shadow-[0_10px_24px_rgba(255,100,47,0.12)]"
                  : isDarkMode
                    ? "text-white/62 hover:bg-white/5"
                    : "text-[#626773] hover:bg-[#f6f7fb]"
              }`}
            >
              <Icon active={active} />
              <span className="mt-1 text-[12px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function RangeSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="relative">
      <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#e7eaf0]" />
      <div
        className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#ff642f]"
        style={{ width: `${value}%` }}
      />
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="relative z-10 h-7 w-full appearance-none bg-transparent"
      />
      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 28px;
          height: 28px;
          border-radius: 9999px;
          background: white;
          border: 3px solid #ff642f;
          box-shadow: 0 8px 18px rgba(255, 100, 47, 0.18);
        }
        input[type="range"]::-moz-range-thumb {
          width: 28px;
          height: 28px;
          border-radius: 9999px;
          background: white;
          border: 3px solid #ff642f;
          box-shadow: 0 8px 18px rgba(255, 100, 47, 0.18);
        }
        input[type="range"]::-webkit-slider-runnable-track {
          background: transparent;
          height: 28px;
        }
        input[type="range"]::-moz-range-track {
          background: transparent;
          height: 28px;
        }
      `}</style>
    </div>
  );
}

function DualRange({
  min,
  max,
  valueMin,
  valueMax,
  onMinChange,
  onMaxChange,
}: {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
}) {
  const left = ((valueMin - min) / (max - min)) * 100;
  const right = ((valueMax - min) / (max - min)) * 100;

  return (
    <div className="relative pb-3 pt-3">
      <div className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#e8ebf2]" />
      <div
        className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#ff642f]"
        style={{ left: `${left}%`, width: `${Math.max(right - left, 2)}%` }}
      />
      <input
        type="range"
        min={min}
        max={max}
        value={valueMin}
        onChange={(event) => {
          const next = Math.min(Number(event.target.value), valueMax);
          onMinChange(next);
        }}
        className="range-layer absolute inset-0 z-20 h-10 w-full appearance-none bg-transparent"
      />
      <input
        type="range"
        min={min}
        max={max}
        value={valueMax}
        onChange={(event) => {
          const next = Math.max(Number(event.target.value), valueMin);
          onMaxChange(next);
        }}
        className="range-layer absolute inset-0 z-20 h-10 w-full appearance-none bg-transparent"
      />
      <style jsx>{`
        .range-layer::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          pointer-events: auto;
          width: 30px;
          height: 30px;
          border-radius: 9999px;
          background: white;
          border: 3px solid #ff642f;
          box-shadow: 0 10px 22px rgba(255, 100, 47, 0.18);
        }
        .range-layer::-moz-range-thumb {
          pointer-events: auto;
          width: 30px;
          height: 30px;
          border-radius: 9999px;
          background: white;
          border: 3px solid #ff642f;
          box-shadow: 0 10px 22px rgba(255, 100, 47, 0.18);
        }
        .range-layer::-webkit-slider-runnable-track {
          background: transparent;
          height: 30px;
        }
        .range-layer::-moz-range-track {
          background: transparent;
          height: 30px;
        }
      `}</style>
    </div>
  );
}

function Switch({
  enabled,
  onClick,
}: {
  enabled: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onClick}
      className={`relative inline-flex h-8 w-14 items-center rounded-full transition ${
        enabled ? "bg-[#ff642f]" : "bg-[#d8dbe3]"
      }`}
    >
      <span
        className={`inline-block h-6 w-6 rounded-full bg-white shadow-[0_4px_10px_rgba(0,0,0,0.14)] transition ${
          enabled ? "translate-x-7" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function StarRow({ rating }: { rating: number }) {
  const stars = Array.from({ length: 5 }, (_, index) => rating >= index + 1);
  return (
    <span className="flex items-center gap-0.5 text-[#ff9d2f]">
      {stars.map((filled, index) => (
        <StarIcon key={index} filled={filled} />
      ))}
    </span>
  );
}

function DishVisual({
  dish,
  small = false,
}: {
  dish: RankedDish;
  small?: boolean;
}) {
  const shadowId = useId();
  return (
    <div className={`relative h-full w-full overflow-hidden ${small ? "" : "rounded-[32px]"} shadow-[0_12px_30px_rgba(15,23,42,0.10)]`}>
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 22% 18%, ${dish.palette[2]} 0%, transparent 22%), radial-gradient(circle at 78% 18%, ${dish.palette[1]} 0%, transparent 20%), linear-gradient(180deg, ${dish.palette[0]} 0%, ${dish.palette[1]} 100%)`,
        }}
      />
      <div className="absolute inset-0 opacity-40">
        <div className="absolute left-[-10%] top-[-10%] h-24 w-24 rounded-full bg-white/18 blur-2xl" />
        <div className="absolute bottom-0 right-[-12%] h-28 w-28 rounded-full bg-white/10 blur-2xl" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <svg viewBox="0 0 240 180" className="h-full w-full">
          <defs>
            <filter id={shadowId}>
              <feDropShadow dx="0" dy="12" stdDeviation="16" floodOpacity="0.24" />
            </filter>
          </defs>
          <ellipse cx="120" cy="132" rx="82" ry="22" fill="rgba(0,0,0,0.18)" />
          <g filter={`url(#${shadowId})`}>
            <ellipse cx="120" cy="118" rx="86" ry="58" fill="#fffaf4" />
            <ellipse cx="120" cy="116" rx="70" ry="44" fill="#f3eadf" />
            {renderDishInterior(dish)}
          </g>
        </svg>
      </div>
      {!small ? (
        <div className="absolute bottom-3 left-3 rounded-full bg-white/88 px-3 py-1 text-[11px] font-semibold text-[#ff5d2e]">
          {dish.imageLabel}
        </div>
      ) : null}
    </div>
  );
}

function renderDishInterior(dish: RankedDish) {
  switch (dish.visual) {
    case "poke":
      return (
        <g>
          <circle cx="95" cy="95" r="16" fill="#ff884d" />
          <circle cx="124" cy="84" r="14" fill="#ff7a3d" />
          <circle cx="147" cy="100" r="12" fill="#7ccf6f" />
          <circle cx="160" cy="80" r="10" fill="#2f855a" />
          <circle cx="112" cy="112" r="11" fill="#f8d95a" />
          <circle cx="82" cy="114" r="10" fill="#a855f7" />
          <circle cx="137" cy="118" r="12" fill="#ffb347" />
          <circle cx="103" cy="74" r="9" fill="#8ee3b3" />
          <rect x="87" y="87" width="28" height="18" rx="4" fill="#fb923c" transform="rotate(-12 87 87)" />
          <rect x="129" y="66" width="26" height="18" rx="4" fill="#f97316" transform="rotate(14 129 66)" />
          <path d="M77 121c14-16 32-25 48-25s31 7 45 22" stroke="#7c3aed" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.7" />
        </g>
      );
    case "pasta":
      return (
        <g>
          <path d="M74 96c22-32 64-39 96-24" stroke="#f59e0b" strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M80 108c22-28 58-33 86-17" stroke="#fde68a" strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M88 117c18-21 46-26 68-12" stroke="#fb923c" strokeWidth="8" strokeLinecap="round" fill="none" />
          <circle cx="92" cy="80" r="9" fill="#5b3a29" />
          <circle cx="132" cy="88" r="7" fill="#5b3a29" />
          <circle cx="145" cy="110" r="6" fill="#5b3a29" />
          <path d="M110 67c10 12 22 18 38 20" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
        </g>
      );
    case "burger":
      return (
        <g>
          <path d="M74 86c10-24 86-24 96 0H74Z" fill="#f8b04a" />
          <path d="M70 96h100c-2 14-9 22-20 28H90c-12-6-18-14-20-28Z" fill="#7a4a22" />
          <path d="M74 104h92c-3 10-8 17-15 23H89c-7-6-12-13-15-23Z" fill="#3cb46e" />
          <path d="M78 116h84c-2 10-8 16-18 21H96c-10-5-16-11-18-21Z" fill="#e84c3d" />
          <path d="M80 127h80c-4 10-11 16-20 20H100c-10-4-16-10-20-20Z" fill="#f0c27a" />
          <path d="M78 80c10-14 74-14 86 0" stroke="#fff2d9" strokeWidth="5" strokeLinecap="round" />
        </g>
      );
    case "noodles":
      return (
        <g>
          <path d="M72 114c0-26 21-47 48-47s48 21 48 47v5H72v-5Z" fill="#f4d9b6" />
          <path d="M84 104c18-18 44-24 72-14" stroke="#f97316" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M84 116c18-16 46-20 72-10" stroke="#fb923c" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M88 126c14-11 35-14 59-7" stroke="#fde68a" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M123 66c14 8 21 18 24 30" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" fill="none" />
          <path d="M137 63l10 8" stroke="#ef4444" strokeWidth="8" strokeLinecap="round" fill="none" />
        </g>
      );
    case "salad":
      return (
        <g>
          <path d="M72 114c0-24 21-43 48-43s48 19 48 43H72Z" fill="#d8f1d8" />
          <circle cx="93" cy="94" r="12" fill="#3cb46e" />
          <circle cx="118" cy="84" r="13" fill="#f59e0b" />
          <circle cx="143" cy="97" r="11" fill="#22c55e" />
          <circle cx="128" cy="110" r="12" fill="#f97316" />
          <circle cx="102" cy="116" r="10" fill="#fb7185" />
          <path d="M88 74c14 10 24 24 30 42" stroke="#16a34a" strokeWidth="7" strokeLinecap="round" fill="none" />
        </g>
      );
    case "rice":
    default:
      return (
        <g>
          <ellipse cx="120" cy="112" rx="68" ry="43" fill="#f8eddc" />
          <circle cx="97" cy="96" r="12" fill="#ff7a3d" />
          <circle cx="122" cy="89" r="12" fill="#fb923c" />
          <circle cx="145" cy="100" r="11" fill="#2dd4bf" />
          <rect x="87" y="109" width="76" height="16" rx="8" fill="#f97316" opacity="0.9" />
          <path d="M89 73c28 6 50 6 76 0" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity="0.8" />
        </g>
      );
  }
}

function recommendationHints(dish: RankedDish) {
  return dish.reasonTags.length > 3
    ? dish.reasonTags.slice(0, 3)
    : dish.reasonTags;
}

function rankDishes(
  dishes: DishCandidate[],
  preferences: PreferenceState,
  refreshTick: number,
  selectedDishId: string,
) {
  const allowed = dishes.filter((dish) => {
    if (preferences.restrictions.vegetarian && !dish.isVegetarian) {
      return false;
    }
    if (preferences.restrictions.vegan && !dish.isVegan) {
      return false;
    }
    if (preferences.restrictions.glutenFree && !dish.isGlutenFree) {
      return false;
    }
    if (preferences.restrictions.dairyFree && !dish.isDairyFree) {
      return false;
    }
    if (preferences.restrictions.nutFree && !dish.isNutFree) {
      return false;
    }
    return true;
  });

  return allowed
    .map((dish, index) => {
      let score = dish.confidence;
      score += preferences.cuisines[dish.cuisineId] ? 18 : 0;
      score += dish.mealSlots.includes(preferences.mealSlot) ? 12 : -6;

      const dishPrice = parseAveragePrice(dish.estimatedPrice);
      const minMaxMid = (preferences.priceRange.min + preferences.priceRange.max) / 2;
      const priceDistance = Math.abs(dishPrice - minMaxMid);
      score += Math.max(0, 12 - priceDistance / 2);

      score += tasteScore(dish, preferences);
      score -= dish.id === selectedDishId ? 2 : 0;
      score += refreshTick % 2 === 0 && index === 2 ? 4 : 0;
      score += refreshTick % 3 === 1 && index === 0 ? 2 : 0;

      return {
        ...dish,
        score,
        rankLabel: "",
      };
    })
    .sort((a, b) => b.score - a.score)
    .map((dish, index) => ({
      ...dish,
      rankLabel: rankLabels[index] ?? "推荐",
    }));
}

function parseAveragePrice(priceLabel: string) {
  const values = priceLabel.match(/\d+/g)?.map(Number) ?? [30, 40];
  const sum = values.reduce((acc, value) => acc + value, 0);
  return sum / values.length;
}

function tasteScore(dish: DishCandidate, preferences: PreferenceState) {
  const dishProfiles: Record<string, Record<TasteId, number>> = {
    "ocean-poke": { spicy: 18, greasy: 8, sweet: 12 },
    "truffle-pasta": { spicy: 10, greasy: 72, sweet: 18 },
    "avocado-burger": { spicy: 20, greasy: 84, sweet: 12 },
    "sichuan-noodles": { spicy: 88, greasy: 46, sweet: 15 },
    "thai-salad": { spicy: 48, greasy: 18, sweet: 56 },
    "salmon-rice": { spicy: 28, greasy: 34, sweet: 10 },
  };

  const profile = dishProfiles[dish.id] ?? {
    spicy: 40,
    greasy: 40,
    sweet: 40,
  };

  return (["spicy", "greasy", "sweet"] as TasteId[]).reduce((total, key) => {
    const desired = preferences.tastes[key] / 100;
    const actual = profile[key] / 100;
    return total + Math.max(0, 8 - Math.abs(desired - actual) * 12);
  }, 0);
}

function BrandMark() {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-[12px] bg-gradient-to-br from-[#ff7a42] to-[#ff4f28] text-white shadow-[0_10px_24px_rgba(255,100,47,0.18)]">
      <span className="text-[15px] font-black leading-none">M</span>
    </span>
  );
}

function StatusBar({ dark }: { dark: boolean }) {
  return (
    <div className="flex items-center justify-between px-6 pb-2 pt-4 text-[18px] font-bold tracking-[-0.04em]">
      <div>9:41</div>
      <div className={`flex items-center gap-2 ${dark ? "text-white" : "text-[#111217]"}`}>
        <SignalIcon />
        <WifiIcon />
        <BatteryIcon />
      </div>
    </div>
  );
}

function PageIcon({
  active,
  children,
}: {
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
        active ? "text-[#ff5d2e]" : "text-current"
      }`}
    >
      {children}
    </span>
  );
}

function HomeIcon({ active }: { active?: boolean }) {
  return (
    <PageIcon active={active}>
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 11.5 12 5l8 6.5" />
        <path d="M6.5 10.5V19h11V10.5" />
      </svg>
    </PageIcon>
  );
}

function UploadIcon({ active }: { active?: boolean }) {
  return (
    <PageIcon active={active}>
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 16V5" />
        <path d="m8.5 8.5 3.5-3.5 3.5 3.5" />
        <path d="M5.5 14.5V19h13v-4.5" />
      </svg>
    </PageIcon>
  );
}

function GearIcon({ active }: { active?: boolean }) {
  return (
    <PageIcon active={active}>
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3.2" />
        <path d="M19 12a7 7 0 0 0-.1-1l2-1.4-2-3.4-2.3.8a7 7 0 0 0-1.7-1L14.5 3h-5l-.4 2.1a7 7 0 0 0-1.7 1L5.1 5.2l-2 3.4 2 1.4a7 7 0 0 0 0 2L3.1 13.4l2 3.4 2.3-.8a7 7 0 0 0 1.7 1L9.5 21h5l.4-2.1a7 7 0 0 0 1.7-1l2.3.8 2-3.4-2-1.4c.1-.3.1-.6.1-1Z" />
      </svg>
    </PageIcon>
  );
}

function BellIcon({ small = false }: { small?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={small ? "h-5 w-5" : "h-5 w-5"} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 20h4" />
      <path d="M6.5 17h11l-1.5-2.2a4.5 4.5 0 0 1-.8-2.6V10a3.2 3.2 0 1 0-6.4 0v2.2c0 .9-.2 1.8-.8 2.6L6.5 17Z" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 8.5h4l1.5-2h4l1.5 2h3a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2h-14a2 2 0 0 1-2-2v-6.5a2 2 0 0 1 2-2Z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#ff5d2e]" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 14c0-4.5 4.5-9 12-9 0 7.5-4.5 12-9 12-2.5 0-3-1.5-3-3Z" />
      <path d="M8 16c0-2 2-4 6-6" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 20a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="3.5" />
    </svg>
  );
}

function CardIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="5" width="17" height="14" rx="2.5" />
      <path d="M3.5 9.5h17" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20s6-4.5 6-10a6 6 0 1 0-12 0c0 5.5 6 10 6 10Z" />
      <circle cx="12" cy="10" r="2.1" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16.5 16.5A7 7 0 0 1 7.5 7.5a7.8 7.8 0 1 0 9 9Z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18" />
      <path d="M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

function StatsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="11" width="3.5" height="8" rx="1" />
      <rect x="10.25" y="7" width="3.5" height="12" rx="1" />
      <rect x="16.5" y="4" width="3.5" height="15" rx="1" />
    </svg>
  );
}

function BadgeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 9.5 7.5 4.5 8l3.6 3.6-.9 5L12 14.5 16.8 16l-.9-5L19.5 8l-5-.5L12 3Z" />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-[#ff5d2e]" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="m4 16 6-6 4 4 6-8" />
      <path d="M14 6h6v6" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M9.8 9.2A2.7 2.7 0 1 1 14 11.4c-.8.5-1.5 1-1.5 2.1" />
      <path d="M12 17h0" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 5.5h15a2 2 0 0 1 2 2v7.5a2 2 0 0 1-2 2h-6l-4.5 3.5V17H4.5a2 2 0 0 1-2-2V7.5a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

function StarIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 ${filled ? "fill-current" : "fill-none"}`} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3.5 15.1 9l6.2.9-4.5 4.4 1.1 6.2L12 17.8 6.1 20.5l1.1-6.2L2.7 9.9l6.2-.9L12 3.5Z" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 10.5v5" />
      <path d="M12 7.5h0" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 3.5h6.5L18.5 8V20.5H7z" />
      <path d="M13.5 3.5V8H18.5" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20h4l10-10a2.8 2.8 0 0 0-4-4L4 16v4Z" />
      <path d="m13 7 4 4" />
    </svg>
  );
}

function SignalIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M2 18h3V12H2v6Zm5 0h3V8H7v10Zm5 0h3V5h-3v13Zm5 0h3V3h-3v15Z" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 9.5a11.5 11.5 0 0 1 15 0" />
      <path d="M7.5 12.5a7.5 7.5 0 0 1 9 0" />
      <path d="M10.5 15.5a3.5 3.5 0 0 1 3 0" />
      <circle cx="12" cy="18.2" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg viewBox="0 0 28 14" className="h-4 w-7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="1.6" width="22" height="10.8" rx="2.8" />
      <path d="M24 4.8h2v4.4h-2" />
      <path d="M4.2 4.6h12.8" />
    </svg>
  );
}

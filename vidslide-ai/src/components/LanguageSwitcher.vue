<template>
  <div class="language-switcher">
    <button class="lang-btn" :aria-label="currentLanguage.name" @click="toggleDropdown">
      <span class="lang-flag">{{ currentLanguage.flag }}</span>
      <span class="lang-name">{{ currentLanguage.name }}</span>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" :class="{ rotate: showDropdown }">
        <path
          d="M3 4.5L6 7.5L9 4.5"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </button>

    <div v-if="showDropdown" class="lang-dropdown" @click.stop>
      <button
        v-for="(lang, code) in languages"
        :key="code"
        class="lang-option"
        :class="{ active: code === currentLocale }"
        @click="selectLanguage(code)"
      >
        <span class="lang-flag">{{ lang.flag }}</span>
        <span class="lang-name">{{ lang.name }}</span>
        <svg v-if="code === currentLocale" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M13 4L6 11L3 8"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const emit = defineEmits(['change'])

const { locale } = useI18n()
const showDropdown = ref(false)

const languages = [
  { code: 'zhCN', name: '中文', flag: '🇨🇳' },
  { code: 'enUS', name: 'English', flag: '🇺🇸' },
  { code: 'jaJP', name: '日本語', flag: '🇯🇵' },
  { code: 'koKR', name: '한국어', flag: '🇰🇷' },
  { code: 'frFR', name: 'Français', flag: '🇫🇷' }
]

const currentLanguage = computed(() => {
  return languages.find(lang => lang.code === locale.value) || languages[0]
})

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const selectLanguage = code => {
  locale.value = code
  localStorage.setItem('vidslide-lang', code)
  showDropdown.value = false
  emit('change', code)
}

const handleClickOutside = event => {
  if (!event.target.closest('.language-switcher')) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  // 从localStorage恢复语言设置
  const savedLang = localStorage.getItem('vidslide-lang')
  if (savedLang && languages.some(lang => lang.code === savedLang)) {
    locale.value = savedLang
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.language-switcher {
  position: relative;
}

.lang-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 9999px;
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.lang-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.lang-btn svg {
  transition: transform 0.3s ease;
}

.lang-btn svg.rotate {
  transform: rotate(180deg);
}

.lang-flag {
  font-size: 1.125rem;
}

.lang-name {
  font-size: 0.875rem;
}

.lang-dropdown {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 180px;
  background: rgba(10, 14, 39, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1rem;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1) inset;
  overflow: hidden;
  z-index: 1000;
  animation: fadeInDown 0.2s ease-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.lang-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.lang-option:hover {
  background: rgba(255, 255, 255, 0.1);
}

.lang-option.active {
  background: rgba(0, 128, 255, 0.2);
  color: #ffffff;
}

.lang-option.active svg {
  margin-left: auto;
  color: #0080ff;
}

.lang-option .lang-flag {
  font-size: 1.25rem;
}

.lang-option .lang-name {
  flex: 1;
}
</style>

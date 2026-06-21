<template>
  <footer class="site-footer">
    <div class="footer-shell">
      <div class="footer-layout">
        <div class="footer-brand">
          <RouterLink to="/" class="footer-logo" aria-label="LiuYinChu'Space home">
            <span class="footer-logo-mark" aria-hidden="true">
              <img src="/favicon_liuyin.svg" alt="">
            </span>
            <span>LiuYinChu'Space</span>
          </RouterLink>
          <p class="footer-tagline">
            探索 · 记录 · 创造<br>
            Keep thinking, keep building.
          </p>
        </div>

        <nav class="footer-directory" aria-label="Footer navigation">
          <div
            v-for="(column, columnIndex) in footerColumns"
            :key="`footer-column-${columnIndex}`"
            class="footer-column"
          >
            <section
              v-for="group in column.groups"
              :key="group.title"
              class="footer-section"
            >
              <RouterLink class="footer-column-title" :to="group.to">
                {{ group.title }}
              </RouterLink>
              <ul
                v-if="group.links.length"
                class="footer-links"
              >
                <li
                  v-for="link in group.links"
                  :key="`${group.title}-${link.label}`"
                >
                  <RouterLink :to="link.to">
                    {{ link.label }}
                  </RouterLink>
                </li>
              </ul>
            </section>
          </div>
        </nav>

        <div class="footer-bottom">
          <p>&copy; 2024 - {{ currentYear }} LiuYinChu'Space. All Rights Reserved.</p>
          <div class="footer-contact" aria-label="Contact links">
            <a href="https://github.com/pifuyuini" target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href="mailto:mingchupifuyuini@gmail.com">Email</a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router'

const currentYear = new Date().getFullYear()

const footerColumns = [
  {
    groups: [
      {
        title: '随记',
        to: '/space1',
        links: [],
      },
      {
        title: '资源链接',
        to: '/rd',
        links: [
          { label: '文献', to: '/rliterature' },
          { label: '编程', to: '/rprogramming' },
          { label: '计算机', to: '/rcomputer' },
          { label: '资料', to: '/rmaterials' },
          { label: '工具', to: '/rtools' },
          { label: '文件', to: '/rfiles' },
        ],
      },
    ],
  },
  {
    groups: [
      {
        title: '代码与项目',
        to: '/code',
        links: [
          { label: 'Brisk Nexus', to: '/brisk-nexus' },
          { label: 'Data Analysis Helper', to: '/ysy-data-analysis-helper' },
          { label: 'Cyber Match', to: '/cyber-match' },
        ],
      },
    ],
  },
  {
    groups: [
      {
        title: '赛博会客厅',
        to: '/space3',
        links: [
          { label: '访客中心', to: '/visitor-center' },
          { label: '网络邻居', to: '/space2' },
        ],
      },
      {
        title: '关于',
        to: '/about',
        links: [
          { label: '自我介绍', to: '/about' },
          { label: '我的学术', to: '/research' },
          { label: '版权说明', to: '/credit' },
        ],
      },
    ],
  },
]
</script>

<style scoped>
.site-footer {
  position: relative;
  margin-top: clamp(3rem, 7vw, 6rem);
  color: rgba(245, 246, 255, 0.82);
  background:
    radial-gradient(circle at 15% 0%, rgba(116, 199, 236, 0.12), transparent 32%),
    radial-gradient(circle at 85% 8%, rgba(245, 194, 231, 0.09), transparent 30%),
    rgba(var(--ctp-mocha-base-rgb), 0.96);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-family: 'Inter', 'LXGW WenKai', system-ui, sans-serif;
}

.site-footer::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(116, 199, 236, 0.62), rgba(245, 194, 231, 0.52), transparent);
  opacity: 0.9;
}

.footer-shell {
  width: min(1220px, calc(100vw - 48px));
  margin: 0 auto;
  padding: clamp(4.5rem, 8vw, 7.5rem) 0 clamp(2rem, 4vw, 3rem);
}

.footer-layout {
  display: grid;
  grid-template-columns: minmax(14rem, 0.7fr) minmax(0, 2.45fr);
  grid-template-rows: auto 1fr;
  grid-template-areas:
    "brand directory"
    "meta directory";
  min-height: clamp(26rem, 44vw, 34rem);
  column-gap: clamp(3rem, 7vw, 7.5rem);
  row-gap: 3rem;
}

.footer-brand {
  grid-area: brand;
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.footer-logo {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  gap: 0.9rem;
  color: #fff;
  text-decoration: none;
  font-size: clamp(1.35rem, 2.3vw, 2.05rem);
  font-weight: 780;
  line-height: 1;
}

.footer-logo-mark {
  display: inline-flex;
  width: 3rem;
  height: 3rem;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(116, 199, 236, 0.18), rgba(245, 194, 231, 0.12));
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.22);
}

.footer-logo-mark img {
  width: 2.35rem;
  height: 2.35rem;
  border-radius: 50%;
}

.footer-logo:hover,
.footer-logo:focus-visible {
  color: #fff;
}

.footer-logo:hover .footer-logo-mark,
.footer-logo:focus-visible .footer-logo-mark {
  border-color: rgba(116, 199, 236, 0.5);
  box-shadow: 0 0 32px rgba(116, 199, 236, 0.16);
}

.footer-tagline {
  max-width: 36rem;
  margin: 0;
  color: rgba(205, 214, 244, 0.74);
  font-size: clamp(1rem, 1.55vw, 1.25rem);
  font-weight: 500;
  line-height: 1.8;
}

.footer-directory {
  grid-area: directory;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(2.6rem, 4.8vw, 5rem);
  align-items: start;
}

.footer-column {
  min-width: 0;
}

.footer-section + .footer-section {
  margin-top: clamp(2.5rem, 4vw, 4.2rem);
}

.footer-column-title {
  display: inline-flex;
  margin-bottom: 1.1rem;
  color: #fff;
  text-decoration: none;
  font-size: 0.96rem;
  font-weight: 740;
  line-height: 1.25;
}

.footer-column-title:hover,
.footer-column-title:focus-visible {
  color: #74c7ec;
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 0.72rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.footer-links a {
  display: inline-flex;
  width: fit-content;
  color: rgba(205, 214, 244, 0.66);
  text-decoration: none;
  font-size: 0.92rem;
  font-weight: 500;
  line-height: 1.42;
  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

.footer-links a:hover,
.footer-links a:focus-visible {
  color: rgba(245, 246, 255, 0.96);
  transform: translateX(3px);
}

.footer-bottom {
  grid-area: meta;
  align-self: end;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  color: rgba(166, 173, 200, 0.74);
  font-size: 0.88rem;
}

.footer-bottom p {
  margin: 0;
}

.footer-contact {
  display: flex;
  align-items: center;
  gap: 1.1rem;
}

.footer-contact a {
  color: rgba(205, 214, 244, 0.72);
  text-decoration: none;
  font-weight: 650;
  transition: color 0.2s ease;
}

.footer-contact a:hover,
.footer-contact a:focus-visible {
  color: #fff;
}

@media (max-width: 980px) {
  .footer-layout {
    grid-template-columns: 1fr;
    grid-template-areas:
      "brand"
      "directory"
      "meta";
    min-height: auto;
    gap: 3.5rem;
  }

  .footer-directory {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .site-footer {
    margin-top: 3rem;
  }

  .footer-shell {
    width: min(100% - 32px, 1220px);
    padding-top: 4rem;
  }

  .footer-directory {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 2.3rem 1.4rem;
  }

  .footer-bottom {
    padding-bottom: 1.25rem;
  }
}

@media (max-width: 420px) {
  .footer-directory {
    grid-template-columns: 1fr;
  }

  .footer-logo {
    font-size: 1.2rem;
  }
}
</style>

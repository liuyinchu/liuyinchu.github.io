<script setup>
import APlayer from 'aplayer'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Calendar from '../components/Calendar.vue'
import ToDoList from '../components/ToDoList.vue'
import Weather from '../components/Weather.vue'

// Apple macOS Big Sur / 512 Pixels wallpaper archive: https://512pixels.net/projects/default-mac-wallpapers-in-5k/
const wallpaper = '/bg/macos-big-sur-light.jpg'
const chatGptUrl = 'https://chat.openai.com/'
const ipInfoUrl = 'https://ipinfo.io/what-is-my-ip'

const topApps = [
  {
    id: 'todo',
    label: 'TODO',
    title: 'TODO List',
    icon: '/portal-icons/reminders.svg',
    align: 'left',
    windowClass: 'window-todo',
  },
  {
    id: 'music',
    label: 'Music',
    title: 'Music',
    icon: '/portal-icons/music.svg',
    align: 'right',
    windowClass: 'window-music',
  },
  {
    id: 'weather',
    label: 'Weather',
    title: 'Weather',
    icon: '/portal-icons/weather.svg',
    align: 'right',
    windowClass: 'window-weather',
  },
  {
    id: 'calendar',
    label: 'Calendar',
    title: 'Calendar',
    icon: '/portal-icons/calendar.svg',
    align: 'right',
    windowClass: 'window-calendar',
  },
]

const bottomApps = [
  {
    id: 'map',
    label: 'Spotlight',
    title: 'Spotlight',
    icon: '/portal-icons/spotlight.svg',
  },
  {
    id: 'dock',
    label: 'Launchpad',
    title: 'Launchpad',
    icon: '/portal-icons/launchpad.svg',
  },
]

const quickLinks = [
  { name: 'ChatGPT', url: chatGptUrl },
  { name: 'Claude', url: 'https://claude.ai/' },
  { name: 'Gemini', url: 'https://gemini.google.com/' },
  { name: 'GitHub', url: 'https://github.com/' },
  { name: 'Google', url: 'https://www.google.com/' },
  { name: 'Translate', url: 'https://translate.google.com/' },
  { name: 'Gmail', url: 'https://mail.google.com/' },
  { name: 'Drive', url: 'https://drive.google.com/drive/home' },
  { name: 'ipinfo', url: ipInfoUrl },
]

const resourceSearchSources = [
  { id: 'literature', label: '文献', file: 'literature.json', path: '/rliterature' },
  { id: 'programming', label: '编程', file: 'programming.json', path: '/rprogramming' },
  { id: 'computer', label: '计算机', file: 'computer.json', path: '/rcomputer' },
  { id: 'materials', label: '资料', file: 'materials.json', path: '/rmaterials' },
  { id: 'tools', label: '工具', file: 'tools.json', path: '/rtools' },
  { id: 'files', label: '文件', file: 'files.json', path: '/rfiles' },
]

const defaultSpotlightLinks = [
  {
    name: '首页',
    path: '/',
    hint: '返回滚动叙事首页',
    category: '核心入口',
    keywords: ['home', 'welcome', 'index'],
  },
  {
    name: '随记',
    path: '/space1',
    hint: '片刻、问题、读到的东西',
    category: '核心入口',
    keywords: ['jottings', 'notes', 'space1', 'blog'],
  },
  {
    name: '资源链接',
    path: '/rd',
    hint: '文献、工具、资料与文件',
    category: '核心入口',
    keywords: ['resources', 'links', 'rd'],
  },
  {
    name: '代码与项目',
    path: '/code',
    hint: '项目、实验与代码记录',
    category: '核心入口',
    keywords: ['code', 'projects', 'programming'],
  },
  {
    name: '赛博会客厅',
    path: '/space3',
    hint: '访客中心、网络邻居与开放空间中枢',
    category: '核心入口',
    keywords: ['lounge', 'visitor', 'friends', 'guest', 'space3'],
  },
  {
    name: '关于',
    path: '/about',
    hint: '自我介绍、学术与说明',
    category: '核心入口',
    keywords: ['about', 'profile', 'statement'],
  },
]

const fallbackSearchItems = [
  ...defaultSpotlightLinks,
  {
    name: '访客中心',
    path: '/visitor-center',
    hint: '访客信息、IP 定位和访客地球仪',
    category: '赛博会客厅',
    keywords: ['visitor', 'ip', 'globe', 'guest'],
  },
  {
    name: '网络邻居',
    path: '/space2',
    hint: '朋友们的个人站点与友链街区',
    category: '赛博会客厅',
    keywords: ['friends', 'neighbor', 'links', 'space2'],
  },
  {
    name: '自我介绍',
    path: '/about/self',
    hint: '站主自我介绍和个人页面',
    category: '关于',
    keywords: ['self', 'intro', 'profile'],
  },
  {
    name: '学术主页',
    path: '/research',
    hint: '研究综述、学术脉络和学术名片入口',
    category: '关于',
    keywords: ['research', 'academic', 'scholar'],
  },
  {
    name: '我的学术',
    path: '/academic',
    hint: '由 JSON 和 Markdown 驱动的学术名片 deck',
    category: '关于',
    keywords: ['cv', 'resume', 'academic', 'deck'],
  },
  {
    name: '版权说明',
    path: '/credit',
    hint: '网站内容、素材与版权说明',
    category: '关于',
    keywords: ['copyright', 'credit', 'license'],
  },
  {
    name: '文献',
    path: '/rliterature',
    hint: '论文、文献与阅读资料',
    category: '资源链接',
    keywords: ['literature', 'paper', 'reference'],
  },
  {
    name: '编程',
    path: '/rprogramming',
    hint: '编程语言、开发资料与实践链接',
    category: '资源链接',
    keywords: ['programming', 'coding', 'developer'],
  },
  {
    name: '计算机',
    path: '/rcomputer',
    hint: '计算机科学与相关学习资源',
    category: '资源链接',
    keywords: ['computer science', 'cs', 'algorithm'],
  },
  {
    name: '资料',
    path: '/rmaterials',
    hint: '常用材料、文档与学习资料',
    category: '资源链接',
    keywords: ['materials', 'docs', 'data'],
  },
  {
    name: '工具',
    path: '/rtools',
    hint: '在线工具与效率工具集合',
    category: '资源链接',
    keywords: ['tools', 'utilities'],
  },
  {
    name: '文件',
    path: '/rfiles',
    hint: '文件资源与可下载内容入口',
    category: '资源链接',
    keywords: ['files', 'download'],
  },
  {
    name: '实验报告',
    path: '/labreport',
    hint: '实验报告与课程实践记录',
    category: '代码与项目',
    keywords: ['lab', 'report', 'experiment'],
  },
  {
    name: 'Ysy Data Analysis Helper',
    path: '/ysy-data-analysis-helper',
    hint: '个人实验数据分析工具',
    category: '代码与项目',
    keywords: ['data analysis', 'python', 'project'],
  },
  {
    name: 'Brisk Nexus',
    path: '/brisk-nexus',
    hint: '个人小巧思合集',
    category: '代码与项目',
    keywords: ['brisk', 'nexus', 'toy'],
  },
  {
    name: 'Cyber Match',
    path: '/cyber-match',
    hint: 'Cyber Match Vue 游戏',
    category: '代码与项目',
    keywords: ['game', 'vue', 'cyber match'],
  },
  {
    name: 'Portal',
    path: '/portal',
    hint: 'macOS 风格桌面入口与常用工具',
    category: '功能页',
    keywords: ['portal', 'desktop', 'dock', 'music', 'weather', 'todo', 'calendar'],
  },
]

const activeWindow = ref(null)
const activeOverlay = ref(null)
const minimizedWindow = ref(null)
const now = ref(new Date())
const dockGroups = ref([])
const musicTracks = ref([])
const aplayerContainer = ref(null)
const spotlightQuery = ref('')
const launchpadQuery = ref('')
const spotlightSelectedIndex = ref(0)
const searchItems = ref([])
const loadingData = ref(true)
const dataError = ref('')
const portalDesktopRef = ref(null)
const windowRef = ref(null)
const spotlightInput = ref(null)
const launchpadInput = ref(null)
const launchpadPanel = ref(null)
const dockRef = ref(null)
const liquidCanvasRef = ref(null)
const liquidWebGLReady = ref(false)
const liquidMaterialPresets = Object.freeze({
  strip: {
    radius: 0,
    bevel: 6,
    refraction: 2.4,
    dispersion: 0.06,
    tint: 0.08,
    highlight: 0.6,
    opacity: 0.92,
    interaction: 0.08,
    ior: 1.22,
    normalStrength: 0.82,
    shininess: 76,
    adaptivity: 0.34,
    softness: 7,
    tintColor: [0.13, 0.15, 0.19],
  },
  window: {
    radius: 14,
    bevel: 20,
    refraction: 6.5,
    dispersion: 0.12,
    tint: 0.14,
    highlight: 0.86,
    opacity: 0.97,
    interaction: 0.16,
    ior: 1.34,
    normalStrength: 0.9,
    shininess: 48,
    adaptivity: 0.76,
    softness: 20,
    tintColor: [0.12, 0.14, 0.18],
  },
  panel: {
    radius: 22,
    bevel: 22,
    refraction: 7,
    dispersion: 0.12,
    tint: 0.15,
    highlight: 0.84,
    opacity: 0.97,
    interaction: 0.2,
    ior: 1.36,
    normalStrength: 0.96,
    shininess: 46,
    adaptivity: 0.86,
    softness: 22,
    tintColor: [0.12, 0.14, 0.18],
  },
  dock: {
    radius: 24,
    bevel: 17,
    refraction: 8.5,
    dispersion: 0.18,
    tint: 0.075,
    highlight: 0.9,
    opacity: 0.98,
    interaction: 0.38,
    ior: 1.48,
    normalStrength: 1.1,
    shininess: 64,
    adaptivity: 0.48,
    softness: 10,
    tintColor: [0.2, 0.22, 0.26],
  },
  search: {
    radius: 999,
    bevel: 10,
    refraction: 6,
    dispersion: 0.1,
    tint: 0.095,
    highlight: 0.74,
    opacity: 0.96,
    interaction: 0.28,
    ior: 1.44,
    normalStrength: 1.04,
    shininess: 58,
    adaptivity: 0.56,
    softness: 12,
    tintColor: [0.14, 0.16, 0.2],
  },
  circle: {
    radius: 999,
    bevel: 9,
    refraction: 6.5,
    dispersion: 0.12,
    tint: 0.09,
    highlight: 0.8,
    opacity: 0.97,
    interaction: 0.32,
    ior: 1.5,
    normalStrength: 1.1,
    shininess: 64,
    adaptivity: 0.5,
    softness: 9,
    tintColor: [0.17, 0.19, 0.23],
  },
})

const liquidVertexShaderSource = `#version 300 es
precision highp float;

layout(location = 0) in vec2 aCorner;

uniform vec2 uResolution;
uniform vec4 uRect;

out vec2 vLocal;
out vec2 vScreen;

void main() {
  vec2 screenPosition = uRect.xy + aCorner * uRect.zw;
  vec2 clipPosition = screenPosition / uResolution * 2.0 - 1.0;
  gl_Position = vec4(clipPosition.x, -clipPosition.y, 0.0, 1.0);
  vLocal = aCorner * uRect.zw;
  vScreen = screenPosition;
}
`

const liquidFragmentShaderSource = `#version 300 es
precision highp float;

uniform sampler2D uWallpaper;
uniform vec2 uResolution;
uniform vec4 uWallpaperRect;
uniform vec4 uRect;
uniform vec2 uLight;
uniform vec4 uShape;
uniform vec4 uMaterial;
uniform vec4 uOptics;
uniform vec3 uTintColor;
uniform float uBrightness;
uniform float uPixelScale;
uniform float uSoftness;

in vec2 vLocal;
in vec2 vScreen;

out vec4 fragmentColor;

float roundedBoxDistance(vec2 point, vec2 halfSize, float radius) {
  vec2 offset = abs(point) - halfSize + vec2(radius);
  return min(max(offset.x, offset.y), 0.0)
    + length(max(offset, 0.0))
    - radius;
}

vec2 safeNormalize(vec2 value) {
  return value / max(length(value), 0.0001);
}

vec2 wallpaperUv(vec2 screenPosition) {
  vec2 uv = (screenPosition - uWallpaperRect.xy) / uWallpaperRect.zw;
  uv = clamp(uv, vec2(0.001), vec2(0.999));
  return vec2(uv.x, 1.0 - uv.y);
}

vec3 srgbToLinear(vec3 color) {
  vec3 safeColor = clamp(color, vec3(0.0), vec3(1.0));
  vec3 low = safeColor / 12.92;
  vec3 high = pow(
    (safeColor + 0.055) / 1.055,
    vec3(2.4)
  );
  return mix(
    low,
    high,
    step(vec3(0.04045), safeColor)
  );
}

vec3 linearToSrgb(vec3 color) {
  vec3 safeColor = clamp(color, vec3(0.0), vec3(1.0));
  vec3 low = safeColor * 12.92;
  vec3 high = 1.055 * pow(safeColor, vec3(1.0 / 2.4)) - 0.055;
  return mix(
    low,
    high,
    step(vec3(0.0031308), safeColor)
  );
}

float linearLuminance(vec3 color) {
  return dot(color, vec3(0.2126, 0.7152, 0.0722));
}

vec3 sampleWallpaper(vec2 screenPosition) {
  return texture(uWallpaper, wallpaperUv(screenPosition)).rgb;
}

vec3 sampleRefractedWallpaper(vec2 screenPosition, vec2 axis, float dispersion) {
  vec2 redUv = wallpaperUv(screenPosition + axis * dispersion);
  vec2 greenUv = wallpaperUv(screenPosition);
  vec2 blueUv = wallpaperUv(screenPosition - axis * dispersion);

  return vec3(
    texture(uWallpaper, redUv).r,
    texture(uWallpaper, greenUv).g,
    texture(uWallpaper, blueUv).b
  );
}

vec3 sampleSoftenedRefraction(
  vec2 screenPosition,
  vec2 dispersionAxis,
  float dispersion,
  float softness,
  float edge,
  float materialization
) {
  // Prefilter detail before the reconstruction kernel. Convert screen pixels
  // to texture texels so the material stays consistent across resize and DPR.
  vec2 texelsPerPixel = vec2(textureSize(uWallpaper, 0)) / uWallpaperRect.zw;
  float blurLod = max(0.0, log2(max(
    softness * max(texelsPerPixel.x, texelsPerPixel.y) * 0.7,
    1.0
  )));
  vec2 spread = vec2(softness * 0.42, 0.0);
  vec3 softened = srgbToLinear(textureLod(
    uWallpaper, wallpaperUv(screenPosition), blurLod
  ).rgb) * 0.4;
  softened += srgbToLinear(textureLod(
    uWallpaper, wallpaperUv(screenPosition + spread.xy), blurLod
  ).rgb) * 0.15;
  softened += srgbToLinear(textureLod(
    uWallpaper, wallpaperUv(screenPosition - spread.xy), blurLod
  ).rgb) * 0.15;
  softened += srgbToLinear(textureLod(
    uWallpaper, wallpaperUv(screenPosition + spread.yx), blurLod
  ).rgb) * 0.15;
  softened += srgbToLinear(textureLod(
    uWallpaper, wallpaperUv(screenPosition - spread.yx), blurLod
  ).rgb) * 0.15;
  vec3 crisp = srgbToLinear(sampleRefractedWallpaper(
    screenPosition,
    dispersionAxis,
    dispersion
  ));
  return mix(crisp, softened, (1.0 - edge * 0.16) * materialization);
}

float glassHeight(
  vec2 point,
  vec2 halfSize,
  float radius,
  float bevel,
  float zRadius
) {
  float inside = max(
    -roundedBoxDistance(point, halfSize, radius),
    0.0
  );
  float depth = min(inside, bevel);
  return sqrt(max(depth * (2.0 * zRadius - depth), 0.0));
}

vec3 glassNormal(
  vec2 point,
  vec2 halfSize,
  float radius,
  float bevel,
  float zRadius,
  float strength
) {
  float epsilon = 1.25 * uPixelScale;
  float leftHeight = glassHeight(
    point - vec2(epsilon, 0.0),
    halfSize,
    radius,
    bevel,
    zRadius
  );
  float rightHeight = glassHeight(
    point + vec2(epsilon, 0.0),
    halfSize,
    radius,
    bevel,
    zRadius
  );
  float topHeight = glassHeight(
    point - vec2(0.0, epsilon),
    halfSize,
    radius,
    bevel,
    zRadius
  );
  float bottomHeight = glassHeight(
    point + vec2(0.0, epsilon),
    halfSize,
    radius,
    bevel,
    zRadius
  );
  vec2 gradient = vec2(
    rightHeight - leftHeight,
    bottomHeight - topHeight
  ) / (2.0 * epsilon);

  return normalize(vec3(-gradient * strength, 1.0));
}

void main() {
  vec2 halfSize = uRect.zw * 0.5;
  float radius = min(uShape.x, min(halfSize.x, halfSize.y));
  vec2 centered = vLocal - halfSize;
  float distanceToShape = roundedBoxDistance(centered, halfSize, radius);
  float antialias = max(fwidth(distanceToShape), 0.55);
  float mask = 1.0 - smoothstep(-antialias, antialias, distanceToShape);

  float insideDistance = max(-distanceToShape, 0.0);
  float logicalMinSize = min(uRect.z, uRect.w) / uPixelScale;
  float sizeFactor = smoothstep(
    72.0,
    520.0,
    logicalMinSize
  );
  float materialization = smoothstep(0.02, 0.96, uMaterial.z);
  float thicknessScale = mix(0.92, 1.1, sizeFactor);
  float bevel = max(
    uShape.y
      * thicknessScale
      * mix(0.62, 1.0, materialization),
    1.0
  );
  float zRadius = bevel;
  float edge = pow(
    1.0 - smoothstep(0.0, bevel, insideDistance),
    0.82
  );
  vec3 normal = glassNormal(
    centered,
    halfSize,
    radius,
    bevel,
    zRadius,
    uOptics.y
  );

  vec2 pointerVector = vScreen - uLight;
  float pointerDistance = length(pointerVector) / uPixelScale;
  float pointerLens = (
    1.0 - smoothstep(12.0, 112.0, pointerDistance)
  ) * uMaterial.w;

  vec2 pointerDirection = safeNormalize(pointerVector);
  normal = normalize(vec3(
    normal.xy + pointerDirection * pointerLens * edge * 0.08,
    normal.z
  ));

  vec2 displacement = -normal.xy
    * uShape.z
    * edge
    * thicknessScale
    * materialization;
  displacement += safeNormalize(pointerVector)
    * pointerLens
    * uShape.z
    * edge
    * 0.09
    * materialization;

  vec2 dispersionAxis = safeNormalize(
    normal.xy + displacement * 0.001
  );
  vec3 refracted = sampleSoftenedRefraction(
    vScreen + displacement,
    dispersionAxis,
    uShape.w * edge * materialization,
    uSoftness,
    edge,
    materialization
  );

  float statisticRadius = mix(3.0, 6.0, sizeFactor) * uPixelScale;
  vec2 sampleCenter = vScreen + displacement;
  float luminanceLeft = linearLuminance(srgbToLinear(sampleWallpaper(
    sampleCenter - vec2(statisticRadius, 0.0)
  )));
  float luminanceRight = linearLuminance(srgbToLinear(sampleWallpaper(
    sampleCenter + vec2(statisticRadius, 0.0)
  )));
  float luminanceTop = linearLuminance(srgbToLinear(sampleWallpaper(
    sampleCenter - vec2(0.0, statisticRadius)
  )));
  float luminanceBottom = linearLuminance(srgbToLinear(sampleWallpaper(
    sampleCenter + vec2(0.0, statisticRadius)
  )));
  float localMean = (
    luminanceLeft
    + luminanceRight
    + luminanceTop
    + luminanceBottom
  ) * 0.25;
  float localContrast = (
    abs(luminanceLeft - localMean)
    + abs(luminanceRight - localMean)
    + abs(luminanceTop - localMean)
    + abs(luminanceBottom - localMean)
  ) * 0.25;

  float sourceLuminance = linearLuminance(refracted);
  vec3 saturated = mix(
    vec3(sourceLuminance),
    refracted,
    1.03
  );
  float brightBackdrop = smoothstep(0.42, 0.82, localMean);
  float complexBackdrop = smoothstep(0.035, 0.16, localContrast);
  float adaptiveTint = uMaterial.x
    + uOptics.w * (
      brightBackdrop * 0.07
      + complexBackdrop * 0.055
      + sizeFactor * 0.018
    );
  vec3 glassColor = mix(
    saturated,
    srgbToLinear(uTintColor),
    clamp(adaptiveTint, 0.0, 0.26)
  );
  glassColor *= mix(1.018, 0.93, brightBackdrop * uOptics.w);
  glassColor *= mix(1.0, 0.97, complexBackdrop * uOptics.w);

  vec2 keyLightVector = vec2(
    uResolution.x * 0.22,
    -uResolution.y * 0.16
  ) - vScreen;
  vec3 keyLightDirection = normalize(vec3(
    keyLightVector / uResolution * vec2(uResolution.x / uResolution.y, 1.0) * 3.0,
    0.72
  ));
  vec2 interactiveLightVector = uLight - vScreen;
  vec3 interactiveLightDirection = normalize(vec3(
    interactiveLightVector / uResolution * vec2(uResolution.x / uResolution.y, 1.0) * 3.2,
    0.68
  ));
  vec3 viewDirection = vec3(0.0, 0.0, 1.0);
  vec3 keyHalfDirection = normalize(keyLightDirection + viewDirection);
  vec3 interactiveHalfDirection = normalize(
    interactiveLightDirection + viewDirection
  );
  float keyVisibility = max(dot(normal, keyLightDirection), 0.0);
  float interactiveVisibility = max(
    dot(normal, interactiveLightDirection),
    0.0
  );

  float keySpecular = pow(
    max(dot(normal, keyHalfDirection), 0.0),
    uOptics.z
  ) * keyVisibility * edge;
  float interactiveSpecular = pow(
    max(dot(normal, interactiveHalfDirection), 0.0),
    max(uOptics.z * 0.82, 24.0)
  ) * interactiveVisibility * edge * pointerLens;
  float r0 = pow(
    (uOptics.x - 1.0) / (uOptics.x + 1.0),
    2.0
  );
  float fresnel = (
    r0
    + (1.0 - r0) * pow(1.0 - max(normal.z, 0.0), 5.0)
  ) * edge;
  float innerRim = (
    1.0 - smoothstep(
      0.0,
      1.15 * uPixelScale,
      insideDistance
    )
  ) * mask;

  glassColor = clamp(
    glassColor * min(uBrightness, 1.0),
    vec3(0.0),
    vec3(1.0)
  );
  float highlightEnergy = (
      keySpecular * 0.3
      + interactiveSpecular * 0.24
      + innerRim * 0.075
    )
    * uMaterial.y
    * materialization
    * uBrightness;
  glassColor = mix(
    glassColor,
    srgbToLinear(vec3(1.0, 0.985, 0.95)),
    clamp(highlightEnergy, 0.0, 0.58)
  );
  float fresnelEnergy = fresnel
    * 0.1
    * uMaterial.y
    * materialization
    * uBrightness;
  glassColor = mix(
    glassColor,
    srgbToLinear(vec3(0.86, 0.92, 1.0)),
    clamp(fresnelEnergy, 0.0, 0.16)
  );

  float alpha = mask * uMaterial.z;
  vec3 outputColor = linearToSrgb(glassColor);
  fragmentColor = vec4(outputColor * alpha, alpha);
}
`
const windowPos = ref({ x: 0, y: 0 })
const restoreWindowPos = ref({ x: 0, y: 0 })
const dragDelta = ref({ x: 0, y: 0 })
const windowPositioned = ref(false)
const windowMaximized = ref(false)
const windowBodyScrolled = ref(false)
const dragging = ref(false)
const compactLayout = ref(false)
const isMinimizing = ref(false)
const isRestoring = ref(false)
const activeMenu = ref(null)
const windowDockTransform = ref({ x: 0, y: 0, scale: 0.15 })
let minimizedWindowRect
const desktopFocused = ref(true)
const lastFocusedElement = ref(null)
const overlayReturnFocus = ref(null)
let clockTimer
let player
let dragPointerId = null
let dragCaptureTarget = null
let dragStart = { pointerX: 0, pointerY: 0, originX: 0, originY: 0 }
let windowPositionUserAdjusted = false
let dockAnimationFrame
let dockSettleTimer
let liquidLightAnimationFrame
let liquidRenderer
let liquidRendererGeneration = 0
let liquidRenderUntil = 0
let liquidGlassMotionQuery
let liquidGlassTransparencyQuery
let liquidGlassForcedColorsQuery
let liquidGlassContrastQuery
let liquidGlassPointerQuery
let liquidPointerActive = false
let liquidLightTarget = { x: 0, y: 0 }
let liquidLightCurrent = { x: 0, y: 0 }

const allWindowApps = computed(() => [...topApps, ...bottomApps])
const activeWindowApp = computed(() => topApps.find((app) => app.id === activeWindow.value))
const activeOverlayApp = computed(() => bottomApps.find((app) => app.id === activeOverlay.value))
const activeApp = computed(
  () => activeOverlayApp.value || (desktopFocused.value && !minimizedWindow.value ? activeWindowApp.value : null),
)
const minimizedApp = computed(() => allWindowApps.value.find((app) => app.id === minimizedWindow.value))
const dockWindowApps = computed(() => [
  bottomApps[0],
  ...topApps.filter((app) => app.id !== 'todo'),
  bottomApps[1],
])
const visibleWindow = computed(() => Boolean(activeWindowApp.value && minimizedWindow.value !== activeWindow.value && !activeOverlay.value))
const portalMenus = computed(() => [
  { id: 'go', label: 'Go', items: [
    { label: 'Spotlight', app: 'map', shortcut: '⌘K' },
    { label: 'Launchpad', app: 'dock' },
    { label: 'Home', href: '/', separator: true },
    { label: 'Articles', href: '/space1' },
  ] },
  { id: 'window', label: 'Window', items: [
    ...topApps.map(app => ({ label: app.title, app: app.id })),
    { label: 'Minimize', action: 'minimize', disabled: !visibleWindow.value, separator: true },
    { label: 'Restore minimized window', action: 'restore', disabled: !minimizedWindow.value },
    { label: windowMaximized.value ? 'Restore size' : 'Zoom', action: 'zoom', disabled: !visibleWindow.value || compactLayout.value },
    { label: 'Close window', action: 'close', disabled: !visibleWindow.value },
  ] },
  { id: 'help', label: 'Help', items: [
    { label: 'Search this site', app: 'map' },
    { label: 'Open ChatGPT', href: chatGptUrl, separator: true },
    { label: 'IP information', href: ipInfoUrl },
  ] },
])

function menuTrigger(id = activeMenu.value) {
  return portalDesktopRef.value?.querySelector('[data-portal-menu="' + id + '"]')
}

async function closeMenu(restoreFocus = false) {
  const trigger = menuTrigger()
  activeMenu.value = null
  if (restoreFocus) {
    await nextTick()
    trigger?.focus({ preventScroll: true })
  }
}

async function openMenu(id, focusPosition = null) {
  activeMenu.value = id
  await nextTick()
  if (focusPosition !== null) {
    const items = [...portalDesktopRef.value.querySelectorAll('.menu-dropdown :is(a, button)[role="menuitem"]:not(:disabled)')]
    items[focusPosition === 'last' ? items.length - 1 : 0]?.focus({ preventScroll: true })
  }
}

function toggleMenu(id) {
  if (activeMenu.value === id) closeMenu()
  else openMenu(id)
}

async function activateMenuItem(item) {
  if (item.disabled) return
  const trigger = menuTrigger()
  await closeMenu()
  trigger?.focus({ preventScroll: true })
  if (item.app) await openWindow(item.app, trigger)
  else if (item.action === 'minimize') await minimizeWindow()
  else if (item.action === 'restore') await restoreMinimizedWindow()
  else if (item.action === 'zoom') {
    await toggleMaximizeWindow()
    await focusActiveSurface()
  }
  else if (item.action === 'close') await closeWindow()
}

function handleMenuKeydown(event, id) {
  if (event.metaKey || event.ctrlKey || event.altKey) return
  const key = event.key
  if (key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    closeMenu(true)
    return
  }
  if (key === 'Tab') {
    event.preventDefault()
    closeMenu().then(() => {
      const next = event.shiftKey ? menuTrigger(id)
        : portalDesktopRef.value?.querySelector('.menu-right button')
      next?.focus({ preventScroll: true })
    })
    return
  }
  if (key === 'ArrowLeft' || key === 'ArrowRight') {
    event.preventDefault()
    const menus = portalMenus.value
    const index = menus.findIndex(menu => menu.id === id)
    const next = menus[(index + (key === 'ArrowRight' ? 1 : -1) + menus.length) % menus.length]
    if (activeMenu.value) openMenu(next.id, 'first')
    else menuTrigger(next.id)?.focus({ preventScroll: true })
    return
  }
  if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(key)) return
  event.preventDefault()
  if (activeMenu.value !== id) {
    openMenu(id, key === 'ArrowUp' || key === 'End' ? 'last' : 'first')
    return
  }
  const items = [...event.currentTarget.querySelectorAll(':is(a, button)[role="menuitem"]:not(:disabled)')]
  const index = items.indexOf(document.activeElement)
  const next = key === 'Home' ? 0 : key === 'End' ? items.length - 1
    : index < 0 ? (key === 'ArrowUp' ? items.length - 1 : 0)
      : (index + (key === 'ArrowDown' ? 1 : -1) + items.length) % items.length
  items[next]?.focus({ preventScroll: true })
}

function handleMenuOutsidePointerDown(event) {
  if (!activeMenu.value || event.target.closest('.menu-commands')) return
  const focusedMenuItem = document.activeElement?.closest('.menu-dropdown')
  const focusableTarget = event.target.closest(
    'a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex], [contenteditable="true"]',
  )
  closeMenu(Boolean(focusedMenuItem && !focusableTarget))
}

const normalizedSearchItems = computed(() => {
  const source = searchItems.value.length ? searchItems.value : fallbackSearchItems
  return source.map(normalizeSearchItem).filter((item) => item.name && item.path)
})
const filteredSpotlightLinks = computed(() => {
  const terms = normalizeText(spotlightQuery.value).split(/\s+/).filter(Boolean)

  if (!terms.length) return defaultSpotlightLinks.map(normalizeSearchItem)

  return normalizedSearchItems.value
    .filter((item) => terms.every((term) => item.searchText.includes(term)))
    .sort((a, b) => scoreSearchItem(b, terms) - scoreSearchItem(a, terms))
    .slice(0, 12)
})
const spotlightGroups = computed(() => {
  const grouped = new Map()

  filteredSpotlightLinks.value.forEach((item) => {
    if (!grouped.has(item.category)) grouped.set(item.category, [])
    grouped.get(item.category).push(item)
  })

  let resultIndex = 0
  return Array.from(grouped, ([category, items]) => ({
    category,
    items: items.map((item) => ({ ...item, resultIndex: resultIndex++ })),
  }))
})
const spotlightFlatLinks = computed(() => spotlightGroups.value.flatMap((group) => group.items))
const filteredDockGroups = computed(() => {
  const query = normalizeText(launchpadQuery.value)
  if (!query) return dockGroups.value

  return dockGroups.value
    .map((group) => ({
      ...group,
      links: group.links.filter((site) => normalizeText(`${site.name} ${site.url}`).includes(query)),
    }))
    .filter((group) => group.links.length)
})
const menuTime = computed(() => {
  const date = now.value
  const monthDay = `${date.getMonth() + 1}月${date.getDate()}日`
  const weekday = date.toLocaleDateString('zh-CN', { weekday: 'short' })
  const time = now.value.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false })
  return `${monthDay} ${weekday} ${time}`
})
const windowStyle = computed(() => {
  const motion = {
    '--window-dock-x': windowDockTransform.value.x + 'px',
    '--window-dock-y': windowDockTransform.value.y + 'px',
    '--window-dock-scale': windowDockTransform.value.scale,
  }
  if (compactLayout.value || !windowPositioned.value) return motion

  if (windowMaximized.value) {
    return {
      ...motion,
      top: 'var(--portal-window-max-top, 34px)',
      left: 'var(--portal-window-max-inset, 8px)',
      width: 'calc(100vw - var(--portal-window-max-gutter, 16px))',
      height: 'calc(100dvh - var(--portal-window-max-height-offset, 112px))',
      maxHeight: 'none',
    }
  }

  const style = {
    ...motion,
    top: `${windowPos.value.y}px`,
    left: `${windowPos.value.x}px`,
  }
  if (dragging.value) {
    style.transform = `translate3d(${dragDelta.value.x}px, ${dragDelta.value.y}px, 0)`
  }
  return style
})

function iconForUrl(url, size = 256) {
  return `https://www.google.com/s2/favicons?sz=${size}&domain_url=${encodeURIComponent(url)}`
}

function fallbackIcon(label = '?') {
  const initial = Array.from(String(label).trim())[0]?.toUpperCase() || '?'
  const safeInitial = initial.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;',
  })[character])
  let hash = 0
  Array.from(String(label)).forEach((character) => {
    hash = ((hash << 5) - hash + character.codePointAt(0)) | 0
  })
  const hue = Math.abs(hash) % 360
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop stop-color="hsl(${hue} 72% 64%)"/>
          <stop offset="1" stop-color="hsl(${(hue + 38) % 360} 64% 42%)"/>
        </linearGradient>
      </defs>
      <rect width="256" height="256" rx="58" fill="url(#g)"/>
      <circle cx="196" cy="52" r="54" fill="white" fill-opacity=".14"/>
      <text x="128" y="154" text-anchor="middle" fill="white"
        font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="108" font-weight="600">${safeInitial}</text>
    </svg>
  `
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

function handleIconError(event, label) {
  const image = event.currentTarget
  if (image.dataset.fallbackApplied) return
  image.dataset.fallbackApplied = 'true'
  image.src = fallbackIcon(label)
}

function normalizeText(value) {
  return String(value ?? '').toLowerCase().trim()
}

function compactText(value, maxLength = 96) {
  const text = String(value ?? '')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[[^\]]+]\([^)]*\)/g, (match) => match.replace(/^\[|\]\([^)]*\)$/g, ''))
    .replace(/[#>*_`|~-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trim()}...`
}

function normalizeSearchItem(item) {
  const name = item.name || item.title || ''
  const hint = item.hint || item.description || item.desc || ''
  const category = item.category || '站内页面'
  const keywords = Array.isArray(item.keywords) ? item.keywords : []
  const path = item.path || item.url || item.href || '/'
  const external = Boolean(item.external || /^https?:\/\//i.test(path))
  const searchText = normalizeText([
    name,
    hint,
    category,
    path,
    ...keywords,
  ].join(' '))

  return {
    name,
    path,
    external,
    hint,
    category,
    keywords,
    searchText,
    rank: Number(item.rank ?? 60),
  }
}

function scoreSearchItem(item, terms) {
  const name = normalizeText(item.name)
  const category = normalizeText(item.category)
  const hint = normalizeText(item.hint)
  const path = normalizeText(item.path)
  let score = item.rank

  terms.forEach((term) => {
    if (name === term) score += 120
    else if (name.startsWith(term)) score += 82
    else if (name.includes(term)) score += 56

    if (category.includes(term)) score += 24
    if (path.includes(term)) score += 20
    if (hint.includes(term)) score += 12
  })

  if (!item.external) score += 8
  return score
}

async function fetchJsonArray(path) {
  try {
    const response = await fetch(path, { cache: 'no-cache' })
    if (!response.ok) return []
    const data = await response.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function uniqueSearchItems(items) {
  const seen = new Set()
  return items.filter((item) => {
    const normalized = normalizeSearchItem(item)
    const key = `${normalizeText(normalized.name)}|${normalized.path}`
    if (!normalized.name || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function buildArticleSearchItems(articles) {
  return articles.map((article) => ({
    name: article.title,
    path: `/space1/${article.id}`,
    hint: article.desc || article.date || '',
    category: '随记',
    keywords: ['article', 'jottings', article.id, article.author, article.date],
    rank: 72,
  }))
}

function buildProjectSearchItems(projects) {
  return projects
    .filter((project) => project.homepage || project.repo)
    .map((project) => ({
      name: project.name,
      path: project.homepage || project.repo,
      external: !project.homepage && Boolean(project.repo),
      hint: project.desc || '',
      category: '代码与项目',
      keywords: ['code', 'project', project.category, project.repo],
      rank: 76,
    }))
}

function buildResourceSearchItems(resourceGroups) {
  return resourceGroups.flatMap(({ source, items }) => items.map((item) => ({
    name: item.name,
    path: item.url || source.path,
    external: Boolean(item.url),
    hint: compactText(item.intro || item.add || source.label),
    category: `资源链接 · ${source.label}`,
    keywords: ['resource', source.id, source.label, item.url],
    rank: 54,
  })))
}

function buildFriendSearchItems(friends) {
  return friends.map((friend) => ({
    name: friend.name,
    path: friend.link,
    external: true,
    hint: friend.desc || '网络邻居',
    category: '网络邻居',
    keywords: ['friend', 'neighbor', 'links'],
    rank: 52,
  }))
}

async function loadSearchItems() {
  const [
    staticItems,
    articles,
    projects,
    friends,
    ...resourceData
  ] = await Promise.all([
    fetchJsonArray('/data/search-index.json'),
    fetchJsonArray('/articles.json'),
    fetchJsonArray('/code_proj.json'),
    fetchJsonArray('/friends.json'),
    ...resourceSearchSources.map((source) => fetchJsonArray(`/resource/${source.file}`)),
  ])

  const resourceGroups = resourceSearchSources.map((source, index) => ({
    source,
    items: resourceData[index] || [],
  }))

  return uniqueSearchItems([
    ...fallbackSearchItems,
    ...staticItems,
    ...buildArticleSearchItems(articles),
    ...buildProjectSearchItems(projects),
    ...buildResourceSearchItems(resourceGroups),
    ...buildFriendSearchItems(friends),
  ])
}

function isOrdinaryWindow(id) {
  return Boolean(id && id !== 'map' && id !== 'dock')
}

function rememberCurrentFocus(target = lastFocusedElement, preferred = null) {
  const element = preferred || document.activeElement
  if (element instanceof HTMLElement && !element.closest('.menu-dropdown')
    && (target === overlayReturnFocus || !windowRef.value?.contains(element))) {
    target.value = element
  }
}

async function restorePreviousFocus(target = lastFocusedElement, appId = null) {
  await nextTick()
  const usable = element => element?.isConnected && element.getClientRects().length
    && !element.closest('[inert]')
  const fallback = dockRef.value?.querySelector('[data-app-id="' + appId + '"]')
    || portalDesktopRef.value?.querySelector('[data-app-id="' + appId + '"]')
  const element = usable(target.value) ? target.value : usable(fallback) ? fallback : dockRef.value
  element?.focus({ preventScroll: true })
}


function updateCompactLayout() {
  compactLayout.value = window.matchMedia(
    '(max-width: 1100px), (max-width: 1366px) and (hover: none) and (pointer: coarse)',
  ).matches

  if (compactLayout.value) {
    cancelWindowDrag()
  }
}

function clampWindowPosition(x, y, rect = windowRef.value?.getBoundingClientRect()) {
  if (!rect) return { x, y }
  const visibleTitlebar = 40
  const minX = visibleTitlebar - rect.width
  const maxX = window.innerWidth - visibleTitlebar
  const minY = 28
  const maxY = Math.max(minY, window.innerHeight - visibleTitlebar)

  return {
    x: Math.min(Math.max(x, minX), maxX),
    y: Math.min(Math.max(y, minY), maxY),
  }
}

function windowLayoutRect() {
  const element = windowRef.value
  const root = portalDesktopRef.value
  if (!element || !root) return null
  const origin = root.getBoundingClientRect()
  return {
    left: origin.left + element.offsetLeft,
    top: origin.top + element.offsetTop,
    width: element.offsetWidth,
    height: element.offsetHeight,
  }
}

async function centerWindow() {
  if (!isOrdinaryWindow(activeWindow.value) || compactLayout.value) return
  await nextTick()
  const rect = windowLayoutRect()
  if (!rect) return

  windowPos.value = clampWindowPosition(
    Math.max(8, (window.innerWidth - rect.width) / 2),
    Math.max(34, (window.innerHeight - rect.height) / 2),
    rect,
  )
  restoreWindowPos.value = { ...windowPos.value }
  windowPositioned.value = true
  windowPositionUserAdjusted = false
  requestLiquidGlassRender(220)
}

async function focusActiveSurface() {
  await nextTick()

  if (activeOverlay.value === 'map') {
    spotlightInput.value?.focus({ preventScroll: true })
  } else if (activeOverlay.value === 'dock') {
    const touchFirstLayout = compactLayout.value
      || window.matchMedia('(hover: none) and (pointer: coarse)').matches
    if (touchFirstLayout) launchpadPanel.value?.focus({ preventScroll: true })
    else launchpadInput.value?.focus({ preventScroll: true })
  } else if (isOrdinaryWindow(activeWindow.value) && minimizedWindow.value !== activeWindow.value) {
    windowRef.value?.focus({ preventScroll: true })
  }
}

async function openWindow(id, returnTarget = null) {
  if (!id) return
  cancelWindowDrag()
  closeMenu()

  if (!isOrdinaryWindow(id)) {
    if (!activeOverlay.value) rememberCurrentFocus(overlayReturnFocus, returnTarget)
    activeOverlay.value = id
    spotlightSelectedIndex.value = 0
    await focusActiveSurface()
    return
  }

  desktopFocused.value = true
  activeOverlay.value = null
  if (activeWindow.value === id && minimizedWindow.value === id) {
    await restoreMinimizedWindow()
    return
  }

  const changingWindow = activeWindow.value !== id
  if (changingWindow) {
    rememberCurrentFocus(lastFocusedElement, returnTarget)
    minimizedWindow.value = null
    isMinimizing.value = false
    isRestoring.value = false
    windowMaximized.value = false
    windowPositioned.value = false
    windowPositionUserAdjusted = false
    windowBodyScrolled.value = false
  }

  activeWindow.value = id
  spotlightSelectedIndex.value = 0

  if (isOrdinaryWindow(id) && !windowPositioned.value) {
    await centerWindow()
  }
  await focusActiveSurface()
}

async function closeWindow() {
  if (activeOverlay.value) {
    const closingApp = activeOverlay.value
    activeOverlay.value = null
    await restorePreviousFocus(overlayReturnFocus, closingApp)
    overlayReturnFocus.value = null
    return
  }

  if (!activeWindow.value) return
  cancelWindowDrag()
  const closingApp = activeWindow.value
  isMinimizing.value = false
  isRestoring.value = false
  activeWindow.value = null
  minimizedWindow.value = null
  windowMaximized.value = false
  windowPositioned.value = false
  windowPositionUserAdjusted = false
  windowBodyScrolled.value = false
  desktopFocused.value = false
  await restorePreviousFocus(lastFocusedElement, closingApp)
}

async function handleDesktopPointerDown() {
  if (activeOverlay.value) {
    await closeWindow()
    return
  }

  desktopFocused.value = false
}

function activateWindowSurface() {
  desktopFocused.value = true
}

function updateWindowDockTransform(rect = minimizedWindowRect) {
  const target = dockRef.value?.querySelector('[data-app-id="' + activeWindow.value + '"]')
    || portalDesktopRef.value?.querySelector('[data-app-id="' + activeWindow.value + '"]')
  if (!rect || !target) return
  const dock = target.getBoundingClientRect()
  windowDockTransform.value = {
    x: dock.left + dock.width / 2 - rect.left - rect.width / 2,
    y: dock.top + dock.height / 2 - rect.top - rect.height / 2,
    scale: Math.max(0.08, Math.min(0.2, dock.width / rect.width)),
  }
}

async function minimizeWindow() {
  if (!visibleWindow.value) return
  cancelWindowDrag()
  minimizedWindowRect = windowRef.value?.getBoundingClientRect()
  isMinimizing.value = true
  isRestoring.value = false
  desktopFocused.value = false
  minimizedWindow.value = activeWindow.value
  await nextTick()
  updateWindowDockTransform()
  requestLiquidGlassRender(260)
  await restorePreviousFocus({ value: null }, activeWindow.value)
}

function handleWindowAfterLeave() {
  isMinimizing.value = false
  requestLiquidGlassRender(0)
}

async function restoreMinimizedWindow() {
  if (!minimizedWindow.value) return
  cancelWindowDrag()
  closeMenu()
  activeOverlay.value = null
  updateWindowDockTransform()
  isRestoring.value = true
  desktopFocused.value = true
  activeWindow.value = minimizedWindow.value
  minimizedWindow.value = null
  isMinimizing.value = false
  await nextTick()
  if (!compactLayout.value) {
    const rect = windowLayoutRect()
    if (!windowPositionUserAdjusted && !windowMaximized.value) await centerWindow()
    else if (rect) windowPos.value = clampWindowPosition(windowPos.value.x, windowPos.value.y, rect)
    await nextTick()
    if (dockRef.value?.querySelector('[data-app-id="' + activeWindow.value + '"]')) {
      updateWindowDockTransform(windowLayoutRect())
    }
  }
  requestLiquidGlassRender(260)
  await focusActiveSurface()
}

async function toggleMaximizeWindow() {
  if (!visibleWindow.value || compactLayout.value) return
  cancelWindowDrag()

  if (windowMaximized.value) {
    windowMaximized.value = false
    await nextTick()
    const rect = windowRef.value?.getBoundingClientRect()
    windowPos.value = clampWindowPosition(
      restoreWindowPos.value.x,
      restoreWindowPos.value.y,
      rect,
    )
    restoreWindowPos.value = { ...windowPos.value }
    return
  }

  const rect = windowRef.value?.getBoundingClientRect()
  if (rect) {
    windowPos.value = { x: rect.left, y: rect.top }
    restoreWindowPos.value = { ...windowPos.value }
    windowPositioned.value = true
  }
  windowMaximized.value = true
}

function startWindowDrag(event) {
  if (
    event.button !== 0
    || compactLayout.value
    || windowMaximized.value
    || event.target.closest('.traffic-lights')
  ) return

  const rect = windowRef.value?.getBoundingClientRect()
  if (!rect) return

  desktopFocused.value = true
  cancelWindowDrag()
  windowPos.value = { x: rect.left, y: rect.top }
  windowPositioned.value = true
  dragStart = {
    pointerX: event.clientX,
    pointerY: event.clientY,
    originX: rect.left,
    originY: rect.top,
  }
  dragDelta.value = { x: 0, y: 0 }
  dragging.value = true
  dragPointerId = event.pointerId
  dragCaptureTarget = event.currentTarget
  dragCaptureTarget.setPointerCapture(event.pointerId)
  window.addEventListener('pointermove', moveWindowDrag)
  window.addEventListener('pointerup', endWindowDrag)
  window.addEventListener('pointercancel', endWindowDrag)
}

function moveWindowDrag(event) {
  if (!dragging.value || event.pointerId !== dragPointerId) return
  const rect = windowRef.value?.getBoundingClientRect()
  const proposed = clampWindowPosition(
    dragStart.originX + event.clientX - dragStart.pointerX,
    dragStart.originY + event.clientY - dragStart.pointerY,
    rect
      ? { width: rect.width, height: rect.height }
      : undefined,
  )
  dragDelta.value = {
    x: proposed.x - dragStart.originX,
    y: proposed.y - dragStart.originY,
  }
  requestLiquidGlassRender(90)
}

function endWindowDrag(event) {
  if (!dragging.value || event.pointerId !== dragPointerId) return
  const completedPointerId = dragPointerId
  const captureTarget = dragCaptureTarget
  if (dragDelta.value.x !== 0 || dragDelta.value.y !== 0) {
    windowPositionUserAdjusted = true
  }
  windowPos.value = {
    x: dragStart.originX + dragDelta.value.x,
    y: dragStart.originY + dragDelta.value.y,
  }
  restoreWindowPos.value = { ...windowPos.value }
  dragging.value = false
  dragDelta.value = { x: 0, y: 0 }
  dragPointerId = null
  dragCaptureTarget = null
  removeWindowDragListeners()

  if (captureTarget?.hasPointerCapture(completedPointerId)) {
    captureTarget.releasePointerCapture(completedPointerId)
  }
  requestLiquidGlassRender(220)
}

function removeWindowDragListeners() {
  window.removeEventListener('pointermove', moveWindowDrag)
  window.removeEventListener('pointerup', endWindowDrag)
  window.removeEventListener('pointercancel', endWindowDrag)
}

function cancelWindowDrag() {
  const cancelledPointerId = dragPointerId
  const captureTarget = dragCaptureTarget
  dragging.value = false
  dragDelta.value = { x: 0, y: 0 }
  dragPointerId = null
  dragCaptureTarget = null
  removeWindowDragListeners()

  if (
    cancelledPointerId !== null
    && captureTarget?.hasPointerCapture(cancelledPointerId)
  ) {
    captureTarget.releasePointerCapture(cancelledPointerId)
  }
}

async function handleViewportResize() {
  const wasCompactLayout = compactLayout.value
  updateCompactLayout()
  requestLiquidGlassRender(320)
  if (window.innerWidth <= 900) resetDockMagnification()
  if (wasCompactLayout !== compactLayout.value) await nextTick()
  if (
    compactLayout.value
    || windowMaximized.value
    || !windowPositioned.value
    || !isOrdinaryWindow(activeWindow.value)
    || minimizedWindow.value === activeWindow.value
  ) return

  const rect = windowRef.value?.getBoundingClientRect()
  if (!windowPositionUserAdjusted) {
    await centerWindow()
    return
  }
  windowPos.value = clampWindowPosition(windowPos.value.x, windowPos.value.y, rect)
}

function trapFocus(event, root) {
  if (event.key !== 'Tab' || !root) return
  const focusable = Array.from(root.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )).filter((element) => {
    const style = window.getComputedStyle(element)
    return (
      style.display !== 'none'
      && style.visibility !== 'hidden'
      && element.getClientRects().length > 0
    )
  })

  if (!focusable.length) {
    event.preventDefault()
    root.focus({ preventScroll: true })
    return
  }

  const currentIndex = focusable.indexOf(document.activeElement)
  const direction = event.shiftKey ? -1 : 1
  const nextIndex = currentIndex < 0
    ? (event.shiftKey ? focusable.length - 1 : 0)
    : (currentIndex + direction + focusable.length) % focusable.length

  event.preventDefault()
  focusable[nextIndex].focus()
}

function handleDialogKeydown(event) {
  if (activeOverlay.value) {
    trapFocus(event, event.currentTarget)
  }
}

function handleWindowBodyScroll(event) {
  windowBodyScrolled.value = event.currentTarget.scrollTop > 0
}

async function activateSpotlightResult(item) {
  if (!item) return
  window.open(item.path, '_blank', 'noopener,noreferrer')
  await closeWindow()
}

async function revealSelectedSpotlightResult() {
  await nextTick()
  document.querySelector(
    `.spotlight-result[data-result-index="${spotlightSelectedIndex.value}"]`,
  )?.scrollIntoView({ block: 'nearest' })
}

async function handleSpotlightKeydown(event) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    spotlightSelectedIndex.value = Math.min(
      spotlightSelectedIndex.value + 1,
      Math.max(0, spotlightFlatLinks.value.length - 1),
    )
    await revealSelectedSpotlightResult()
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    spotlightSelectedIndex.value = Math.max(0, spotlightSelectedIndex.value - 1)
    await revealSelectedSpotlightResult()
  } else if (event.key === 'Enter') {
    event.preventDefault()
    await activateSpotlightResult(spotlightFlatLinks.value[spotlightSelectedIndex.value])
  } else if (event.key === 'Escape') {
    event.preventDefault()
    await closeWindow()
  }
}

function handleGlobalKeydown(event) {
  if (event.defaultPrevented) return
  const commandKey = event.metaKey || event.ctrlKey

  if (commandKey && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    const returnTarget = activeMenu.value ? menuTrigger() : null
    openWindow('map', returnTarget)
  } else if (event.key === 'Escape' && activeMenu.value) {
    event.preventDefault()
    closeMenu(true)
  } else if (event.key === 'Escape' && (activeWindow.value || activeOverlay.value)) {
    event.preventDefault()
    closeWindow()
  }
}

function handleDockPointerMove(event) {
  if (
    compactLayout.value
    || window.innerWidth <= 900
    || event.pointerType === 'touch'
    || !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) return

  window.cancelAnimationFrame(dockAnimationFrame)
  window.clearTimeout(dockSettleTimer)
  const pointerX = event.clientX
  dockAnimationFrame = window.requestAnimationFrame(() => {
    const dock = dockRef.value
    if (!dock) return
    dock.classList.remove('is-settling')
    const dockRect = dock.getBoundingClientRect()
    const dockStyles = window.getComputedStyle(dock)
    const readDockMetric = (name, fallback) => (
      Number.parseFloat(dockStyles.getPropertyValue(name)) || fallback
    )
    const radius = readDockMetric('--portal-dock-magnify-radius', 90)
    const maxShift = readDockMetric('--portal-dock-magnify-shift', 6)
    const maxLift = readDockMetric('--portal-dock-magnify-lift', 10)

    dock.querySelectorAll('.launcher-item').forEach((item) => {
      const itemCenter = dockRect.left + item.offsetLeft - dock.scrollLeft + item.offsetWidth / 2
      const signedDistance = itemCenter - pointerX
      const distance = Math.abs(signedDistance)
      const influence = distance >= radius
        ? 0
        : (Math.cos(Math.PI * distance / radius) + 1) / 2
      const scale = 1 + influence * 0.28
      const direction = Math.sign(signedDistance)
      const horizontalInfluence = Math.min(1, distance / 52)
      item.style.setProperty('--dock-scale', scale.toFixed(3))
      item.style.setProperty(
        '--dock-shift',
        `${direction * influence * horizontalInfluence * maxShift}px`,
      )
      item.style.setProperty('--dock-lift', `${influence * -maxLift}px`)
    })
  })
}

function resetDockMagnification() {
  window.cancelAnimationFrame(dockAnimationFrame)
  const dock = dockRef.value
  if (!dock) return

  dock.classList.add('is-settling')
  dock.querySelectorAll('.launcher-item').forEach((item) => {
    item.style.removeProperty('--dock-scale')
    item.style.removeProperty('--dock-shift')
    item.style.removeProperty('--dock-lift')
  })
  window.clearTimeout(dockSettleTimer)
  dockSettleTimer = window.setTimeout(() => {
    dock.classList.remove('is-settling')
  }, 260)
  requestLiquidGlassRender(260)
}

function compileLiquidShader(gl, shaderType, source) {
  const shader = gl.createShader(shaderType)
  if (!shader) throw new Error('Unable to allocate a Liquid Glass shader')

  gl.shaderSource(shader, source)
  gl.compileShader(shader)

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || 'Unknown shader compile error'
    gl.deleteShader(shader)
    throw new Error(message)
  }

  return shader
}

function createLiquidProgram(gl) {
  const vertexShader = compileLiquidShader(
    gl,
    gl.VERTEX_SHADER,
    liquidVertexShaderSource,
  )
  let fragmentShader

  try {
    fragmentShader = compileLiquidShader(
      gl,
      gl.FRAGMENT_SHADER,
      liquidFragmentShaderSource,
    )
  } catch (error) {
    gl.deleteShader(vertexShader)
    throw error
  }
  const program = gl.createProgram()

  if (!program) {
    gl.deleteShader(vertexShader)
    gl.deleteShader(fragmentShader)
    throw new Error('Unable to allocate the Liquid Glass program')
  }

  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  gl.deleteShader(vertexShader)
  gl.deleteShader(fragmentShader)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) || 'Unknown program link error'
    gl.deleteProgram(program)
    throw new Error(message)
  }

  return program
}

function liquidSurfaceZIndex(surface) {
  if (surface.matches('.menu-dropdown')) return 500
  if (surface.closest('.spotlight-overlay')) {
    return surface.matches('.spotlight-panel') ? 400 : 401
  }
  if (surface.closest('.launchpad-overlay')) {
    return surface.matches('.launchpad-groups') ? 340 : 341
  }
  if (surface.matches('.portal-menu-bar')) return 200
  if (surface.matches('.launcher-tooltip')) return 190
  if (surface.matches('.bottom-launcher')) return 180
  if (surface.matches('.mac-window')) return 120
  return 100
}

function liquidSurfaceOpacity(surface, root) {
  let opacity = 1
  let element = surface

  while (element && element !== root) {
    opacity *= Number.parseFloat(window.getComputedStyle(element).opacity) || 0
    element = element.parentElement
  }

  return opacity
}

function syncLiquidSurfaceObservers(renderer, surfaces) {
  if (!renderer.resizeObserver) return

  const currentSurfaces = new Set(surfaces)
  renderer.observedSurfaces.forEach((surface) => {
    if (!currentSurfaces.has(surface)) {
      renderer.resizeObserver.unobserve(surface)
      renderer.observedSurfaces.delete(surface)
    }
  })

  currentSurfaces.forEach((surface) => {
    if (!renderer.observedSurfaces.has(surface)) {
      renderer.resizeObserver.observe(surface)
      renderer.observedSurfaces.add(surface)
    }
  })
}

function rebuildLiquidLuminanceMap(renderer, cssWidth, cssHeight) {
  const mapWidth = 96
  const mapHeight = Math.max(
    36,
    Math.round(mapWidth * cssHeight / cssWidth),
  )
  if (
    renderer.luminanceMap?.width === mapWidth
    && renderer.luminanceMap?.height === mapHeight
  ) return

  const canvas = renderer.luminanceCanvas || document.createElement('canvas')
  const context = canvas.getContext('2d', {
    alpha: false,
    willReadFrequently: true,
  })
  if (!context) return

  canvas.width = mapWidth
  canvas.height = mapHeight
  const coverScale = Math.max(
    mapWidth / renderer.image.naturalWidth,
    mapHeight / renderer.image.naturalHeight,
  ) * 1.02
  const wallpaperWidth = renderer.image.naturalWidth * coverScale
  const wallpaperHeight = renderer.image.naturalHeight * coverScale
  const wallpaperX = (mapWidth - wallpaperWidth) / 2
  const wallpaperY = (mapHeight - wallpaperHeight) / 2

  context.clearRect(0, 0, mapWidth, mapHeight)
  context.drawImage(
    renderer.image,
    wallpaperX,
    wallpaperY,
    wallpaperWidth,
    wallpaperHeight,
  )

  try {
    renderer.luminanceCanvas = canvas
    renderer.luminanceMap = {
      width: mapWidth,
      height: mapHeight,
      pixels: context.getImageData(0, 0, mapWidth, mapHeight).data,
    }
  } catch {
    renderer.luminanceMap = undefined
  }
}

function sampleLiquidSurfaceLuminance(renderer, rect, rootRect) {
  const map = renderer.luminanceMap
  if (!map) return undefined

  const samplePositions = [
    [0.5, 0.5],
    [0.2, 0.25],
    [0.8, 0.25],
    [0.2, 0.75],
    [0.8, 0.75],
  ]
  const samples = samplePositions.map(([horizontal, vertical]) => {
    const rootX = rect.left - rootRect.left + rect.width * horizontal
    const rootY = rect.top - rootRect.top + rect.height * vertical
    const mapX = Math.max(
      0,
      Math.min(
        map.width - 1,
        Math.round(rootX / rootRect.width * (map.width - 1)),
      ),
    )
    const mapY = Math.max(
      0,
      Math.min(
        map.height - 1,
        Math.round(rootY / rootRect.height * (map.height - 1)),
      ),
    )
    const index = (mapY * map.width + mapX) * 4
    const red = Math.pow(map.pixels[index] / 255, 2.2)
    const green = Math.pow(map.pixels[index + 1] / 255, 2.2)
    const blue = Math.pow(map.pixels[index + 2] / 255, 2.2)
    return red * 0.2126 + green * 0.7152 + blue * 0.0722
  })
  const mean = samples.reduce((sum, sample) => sum + sample, 0) / samples.length
  const contrast = samples.reduce(
    (sum, sample) => sum + Math.abs(sample - mean),
    0,
  ) / samples.length

  return { mean, contrast }
}

function adaptLiquidSurfaceForeground(surface, kind, statistics) {
  if (!statistics || !['strip', 'search', 'circle'].includes(kind)) return

  const currentTone = surface.dataset.liquidForeground
  const useDarkForeground = currentTone === 'dark'
    ? statistics.mean > 0.54
    : statistics.mean > 0.64
  const nextTone = useDarkForeground ? 'dark' : 'light'
  if (currentTone === nextTone) return

  surface.dataset.liquidForeground = nextTone
  surface.style.setProperty(
    '--liquid-foreground',
    useDarkForeground
      ? 'rgba(17, 24, 33, 0.9)'
      : 'rgba(255, 255, 255, 0.94)',
  )
  surface.style.setProperty(
    '--liquid-foreground-muted',
    useDarkForeground
      ? 'rgba(17, 24, 33, 0.58)'
      : 'rgba(255, 255, 255, 0.62)',
  )
  surface.style.setProperty(
    '--liquid-foreground-shadow',
    useDarkForeground
      ? '0 1px 1px rgba(255, 255, 255, 0.16)'
      : `0 1px 2px rgba(0, 0, 0, ${Math.min(
        0.52,
        0.26 + statistics.contrast * 1.8,
      ).toFixed(3)})`,
  )
}

function resizeLiquidCanvas(renderer, rootRect) {
  const cssWidth = Math.max(1, rootRect.width)
  const cssHeight = Math.max(1, rootRect.height)
  const coarsePointer = liquidGlassPointerQuery?.matches === false
  const ultraWideViewport = cssWidth >= 2560 && cssHeight >= 1400
  const pixelBudget = coarsePointer ? 1200000 : (ultraWideViewport ? 8400000 : 4200000)
  const scaleLimit = coarsePointer ? 1.45 : (ultraWideViewport ? 1 : 1.35)
  const budgetScale = Math.sqrt(pixelBudget / (cssWidth * cssHeight))
  const renderScale = Math.min(
    window.devicePixelRatio || 1,
    scaleLimit,
    budgetScale,
  )
  const width = Math.max(1, Math.round(cssWidth * renderScale))
  const height = Math.max(1, Math.round(cssHeight * renderScale))

  if (renderer.canvas.width !== width || renderer.canvas.height !== height) {
    renderer.canvas.width = width
    renderer.canvas.height = height
  }

  rebuildLiquidLuminanceMap(renderer, cssWidth, cssHeight)
  renderer.cssWidth = cssWidth
  renderer.cssHeight = cssHeight
  renderer.scaleX = width / cssWidth
  renderer.scaleY = height / cssHeight
}

function drawLiquidGlass(renderer) {
  const root = portalDesktopRef.value
  if (!root || !renderer.image.naturalWidth || !renderer.image.naturalHeight) return

  const rootRect = root.getBoundingClientRect()
  resizeLiquidCanvas(renderer, rootRect)

  const {
    canvas,
    gl,
    image,
    program,
    texture,
    uniforms,
    vao,
    scaleX,
    scaleY,
    cssWidth,
    cssHeight,
  } = renderer
  const surfaces = [...root.querySelectorAll('[data-liquid-surface]')]
    .filter((surface) => {
      const rect = surface.getBoundingClientRect()
      return (
        rect.width > 0
        && rect.height > 0
        && surface.getClientRects().length > 0
        && window.getComputedStyle(surface).visibility !== 'hidden'
      )
    })
    .sort((first, second) => liquidSurfaceZIndex(first) - liquidSurfaceZIndex(second))

  syncLiquidSurfaceObservers(renderer, surfaces)

  const coverScale = Math.max(
    cssWidth / image.naturalWidth,
    cssHeight / image.naturalHeight,
  ) * 1.02
  const wallpaperWidth = image.naturalWidth * coverScale
  const wallpaperHeight = image.naturalHeight * coverScale
  const wallpaperX = (cssWidth - wallpaperWidth) / 2
  const wallpaperY = (cssHeight - wallpaperHeight) / 2

  gl.viewport(0, 0, canvas.width, canvas.height)
  gl.disable(gl.SCISSOR_TEST)
  gl.clearColor(0, 0, 0, 0)
  gl.clear(gl.COLOR_BUFFER_BIT)
  gl.disable(gl.DEPTH_TEST)
  gl.disable(gl.CULL_FACE)
  gl.enable(gl.BLEND)
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
  gl.useProgram(program)
  gl.bindVertexArray(vao)
  gl.activeTexture(gl.TEXTURE0)
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.uniform1i(uniforms.wallpaper, 0)
  gl.uniform2f(uniforms.resolution, canvas.width, canvas.height)
  gl.uniform4f(
    uniforms.wallpaperRect,
    wallpaperX * scaleX,
    wallpaperY * scaleY,
    wallpaperWidth * scaleX,
    wallpaperHeight * scaleY,
  )
  gl.uniform2f(
    uniforms.light,
    liquidLightCurrent.x * scaleX,
    liquidLightCurrent.y * scaleY,
  )
  gl.enable(gl.SCISSOR_TEST)

  surfaces.forEach((surface) => {
    const rect = surface.getBoundingClientRect()
    const kind = surface.dataset.liquidKind
    const preset = liquidMaterialPresets[kind]
    if (!preset) return

    const x = (rect.left - rootRect.left) * scaleX
    const y = (rect.top - rootRect.top) * scaleY
    const width = rect.width * scaleX
    const height = rect.height * scaleY
    const left = Math.max(0, Math.floor(x))
    const right = Math.min(canvas.width, Math.ceil(x + width))
    const top = Math.max(0, Math.floor(y))
    const bottom = Math.min(canvas.height, Math.ceil(y + height))
    if (right <= left || bottom <= top) return

    const computedStyle = window.getComputedStyle(surface)
    const computedRadius = Number.parseFloat(computedStyle.borderTopLeftRadius)
    const cssRadius = Number.isFinite(computedRadius)
      ? computedRadius
      : preset.radius
    const scale = (scaleX + scaleY) / 2
    const contrastMode = liquidGlassContrastQuery?.matches
    const surfaceOpacity = liquidSurfaceOpacity(surface, root) * preset.opacity
    const brightness = surface.classList.contains('is-receded') ? 0.84 : 1.02
    const surfaceStatistics = sampleLiquidSurfaceLuminance(
      renderer,
      rect,
      rootRect,
    )
    adaptLiquidSurfaceForeground(surface, kind, surfaceStatistics)

    gl.scissor(
      left,
      canvas.height - bottom,
      right - left,
      bottom - top,
    )
    gl.uniform4f(uniforms.rect, x, y, width, height)
    gl.uniform4f(
      uniforms.shape,
      Math.min(cssRadius, rect.width / 2, rect.height / 2) * scale,
      preset.bevel * scale,
      preset.refraction * scale,
      (contrastMode ? 0 : preset.dispersion) * scale,
    )
    gl.uniform4f(
      uniforms.material,
      preset.tint + (contrastMode ? 0.08 : 0),
      contrastMode ? preset.highlight * 0.72 : preset.highlight,
      surfaceOpacity,
      liquidGlassMotionQuery?.matches ? 0 : preset.interaction,
    )
    gl.uniform4f(
      uniforms.optics,
      preset.ior,
      preset.normalStrength,
      preset.shininess,
      preset.adaptivity,
    )
    gl.uniform3fv(uniforms.tintColor, preset.tintColor)
    gl.uniform1f(uniforms.brightness, brightness)
    gl.uniform1f(uniforms.pixelScale, scale)
    gl.uniform1f(
      uniforms.softness,
      preset.softness * scale * (contrastMode ? 0.55 : 1),
    )
    gl.drawArrays(gl.TRIANGLES, 0, 6)
  })

  gl.disable(gl.SCISSOR_TEST)
  gl.bindVertexArray(null)
}

function renderLiquidGlassFrame(timestamp) {
  liquidLightAnimationFrame = undefined
  const renderer = liquidRenderer
  if (!renderer || document.visibilityState === 'hidden') return

  const root = portalDesktopRef.value
  if (!root) return
  const rootRect = root.getBoundingClientRect()
  const defaultLight = {
    x: rootRect.width * 0.24,
    y: -rootRect.height * 0.12,
  }
  const target = (
    liquidPointerActive
    && !liquidGlassMotionQuery?.matches
    && liquidGlassPointerQuery?.matches
  )
    ? liquidLightTarget
    : defaultLight

  if (!renderer.lastFrameTime || liquidGlassMotionQuery?.matches) {
    liquidLightCurrent = { ...target }
  } else {
    const deltaSeconds = Math.min(0.05, (timestamp - renderer.lastFrameTime) / 1000)
    const smoothing = 1 - Math.exp(-deltaSeconds * 17)
    liquidLightCurrent.x += (target.x - liquidLightCurrent.x) * smoothing
    liquidLightCurrent.y += (target.y - liquidLightCurrent.y) * smoothing
  }
  renderer.lastFrameTime = timestamp

  drawLiquidGlass(renderer)

  if (!liquidWebGLReady.value && renderer.gl.getError() === renderer.gl.NO_ERROR) {
    liquidWebGLReady.value = true
    nextTick(() => requestLiquidGlassRender(180))
  }

  const lightDistance = Math.hypot(
    target.x - liquidLightCurrent.x,
    target.y - liquidLightCurrent.y,
  )
  if (
    timestamp < liquidRenderUntil
    || (!liquidGlassMotionQuery?.matches && lightDistance > 0.35)
  ) {
    liquidLightAnimationFrame = window.requestAnimationFrame(renderLiquidGlassFrame)
  } else {
    renderer.lastFrameTime = 0
  }
}

function requestLiquidGlassRender(animateMilliseconds = 0) {
  if (!liquidRenderer || document.visibilityState === 'hidden') return
  liquidRenderUntil = liquidGlassMotionQuery?.matches
    ? 0
    : Math.max(liquidRenderUntil, performance.now() + animateMilliseconds)
  if (!liquidLightAnimationFrame) {
    liquidLightAnimationFrame = window.requestAnimationFrame(renderLiquidGlassFrame)
  }
}

function disposeLiquidRendererResources(renderer) {
  if (!renderer) return
  const { gl } = renderer
  renderer.resizeObserver?.disconnect()
  renderer.mutationObserver?.disconnect()
  renderer.canvas.removeEventListener('webglcontextlost', renderer.handleContextLost)
  renderer.canvas.removeEventListener('webglcontextrestored', renderer.handleContextRestored)
  gl.deleteTexture(renderer.texture)
  gl.deleteBuffer(renderer.buffer)
  gl.deleteVertexArray(renderer.vao)
  gl.deleteProgram(renderer.program)
}

function destroyLiquidGlassRenderer() {
  liquidRendererGeneration += 1
  window.cancelAnimationFrame(liquidLightAnimationFrame)
  liquidLightAnimationFrame = undefined
  liquidRenderUntil = 0
  liquidWebGLReady.value = false

  const renderer = liquidRenderer
  liquidRenderer = undefined
  if (!renderer) return

  disposeLiquidRendererResources(renderer)
  renderer.canvas.width = renderer.canvas.width
}

async function initializeLiquidGlassRenderer() {
  destroyLiquidGlassRenderer()
  if (
    liquidGlassTransparencyQuery?.matches
    || liquidGlassForcedColorsQuery?.matches
  ) return

  const canvas = liquidCanvasRef.value
  const root = portalDesktopRef.value
  if (!canvas || !root) return

  const generation = ++liquidRendererGeneration
  const gl = canvas.getContext('webgl2', {
    alpha: true,
    premultipliedAlpha: true,
    antialias: false,
    depth: false,
    stencil: false,
    preserveDrawingBuffer: false,
    powerPreference: 'high-performance',
  })
  if (!gl) return

  let renderer
  let program
  let vao
  let buffer
  let texture

  try {
    program = createLiquidProgram(gl)
    vao = gl.createVertexArray()
    buffer = gl.createBuffer()
    if (!vao || !buffer) throw new Error('Unable to allocate Liquid Glass geometry')

    gl.bindVertexArray(vao)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        0, 0,
        1, 0,
        0, 1,
        0, 1,
        1, 0,
        1, 1,
      ]),
      gl.STATIC_DRAW,
    )
    gl.enableVertexAttribArray(0)
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
    gl.bindVertexArray(null)

    const image = new Image()
    image.decoding = 'async'
    const imageLoaded = new Promise((resolve, reject) => {
      image.addEventListener('load', resolve, { once: true })
      image.addEventListener('error', () => reject(new Error('Wallpaper texture failed to load')), {
        once: true,
      })
    })
    image.src = wallpaper
    await imageLoaded
    if (typeof image.decode === 'function') {
      await image.decode().catch(() => {})
    }
    if (generation !== liquidRendererGeneration) {
      gl.deleteBuffer(buffer)
      gl.deleteVertexArray(vao)
      gl.deleteProgram(program)
      return
    }

    texture = gl.createTexture()
    if (!texture) throw new Error('Unable to allocate the wallpaper texture')
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      image,
    )
    gl.generateMipmap(gl.TEXTURE_2D)

    const uniform = (name) => {
      const location = gl.getUniformLocation(program, name)
      if (location === null) throw new Error(`Missing Liquid Glass uniform: ${name}`)
      return location
    }
    const uniforms = {
      wallpaper: uniform('uWallpaper'),
      resolution: uniform('uResolution'),
      wallpaperRect: uniform('uWallpaperRect'),
      rect: uniform('uRect'),
      light: uniform('uLight'),
      shape: uniform('uShape'),
      material: uniform('uMaterial'),
      optics: uniform('uOptics'),
      tintColor: uniform('uTintColor'),
      brightness: uniform('uBrightness'),
      pixelScale: uniform('uPixelScale'),
      softness: uniform('uSoftness'),
    }

    const handleContextLost = (event) => {
      event.preventDefault()
      window.cancelAnimationFrame(liquidLightAnimationFrame)
      liquidLightAnimationFrame = undefined
      liquidWebGLReady.value = false
    }
    const handleContextRestored = () => initializeLiquidGlassRenderer()

    renderer = {
      canvas,
      gl,
      image,
      program,
      vao,
      buffer,
      texture,
      uniforms,
      observedSurfaces: new Set(),
      lastFrameTime: 0,
      handleContextLost,
      handleContextRestored,
    }
    liquidRenderer = renderer

    canvas.addEventListener('webglcontextlost', handleContextLost)
    canvas.addEventListener('webglcontextrestored', handleContextRestored)
    renderer.resizeObserver = new ResizeObserver(() => requestLiquidGlassRender(240))
    renderer.resizeObserver.observe(root)
    renderer.mutationObserver = new MutationObserver(() => {
      requestLiquidGlassRender(320)
    })
    renderer.mutationObserver.observe(root, {
      childList: true,
      subtree: true,
    })

    const rootRect = root.getBoundingClientRect()
    liquidLightTarget = {
      x: rootRect.width * 0.24,
      y: -rootRect.height * 0.12,
    }
    liquidLightCurrent = { ...liquidLightTarget }
    requestLiquidGlassRender(360)
  } catch (error) {
    if (renderer) {
      disposeLiquidRendererResources(renderer)
    } else {
      if (texture) gl.deleteTexture(texture)
      if (buffer) gl.deleteBuffer(buffer)
      if (vao) gl.deleteVertexArray(vao)
      if (program) gl.deleteProgram(program)
    }
    if (generation === liquidRendererGeneration) {
      liquidRenderer = undefined
      liquidWebGLReady.value = false
    }
    console.warn('Liquid Glass renderer fallback:', error)
  }
}

function handleLiquidGlassPreferenceChange() {
  if (liquidGlassTransparencyQuery?.matches || liquidGlassForcedColorsQuery?.matches) {
    destroyLiquidGlassRenderer()
  } else {
    initializeLiquidGlassRenderer()
  }
}

function handleLiquidMotionPreferenceChange() {
  liquidPointerActive = false
  resetDockMagnification()
  requestLiquidGlassRender(0)
}

function handleLiquidContrastPreferenceChange() {
  requestLiquidGlassRender(0)
}

function handleLiquidLightPointerMove(event) {
  if (
    event.pointerType === 'touch'
    || liquidGlassMotionQuery?.matches
    || !liquidGlassPointerQuery?.matches
  ) return

  const rootRect = portalDesktopRef.value?.getBoundingClientRect()
  if (!rootRect) return
  liquidPointerActive = true
  liquidLightTarget = {
    x: event.clientX - rootRect.left,
    y: event.clientY - rootRect.top,
  }
  requestLiquidGlassRender(220)
}

function handleLiquidLightPress(event) {
  if (liquidGlassMotionQuery?.matches) return

  const rootRect = portalDesktopRef.value?.getBoundingClientRect()
  if (!rootRect) return
  liquidPointerActive = true
  liquidLightTarget = {
    x: event.clientX - rootRect.left,
    y: event.clientY - rootRect.top,
  }
  requestLiquidGlassRender(event.pointerType === 'touch' ? 360 : 260)
}

function resetLiquidLight() {
  liquidPointerActive = false
  requestLiquidGlassRender(liquidGlassMotionQuery?.matches ? 0 : 300)
}

function handleLiquidGlassScroll() {
  requestLiquidGlassRender(160)
}

function handleLiquidGlassFocus() {
  requestLiquidGlassRender(220)
}

function handleLiquidVisibilityChange() {
  if (document.visibilityState === 'hidden') {
    window.cancelAnimationFrame(liquidLightAnimationFrame)
    liquidLightAnimationFrame = undefined
  } else {
    requestLiquidGlassRender(120)
  }
}

async function loadPortalData() {
  loadingData.value = true
  dataError.value = ''

  try {
    const [musicRes, dockRes] = await Promise.all([
      fetch('/data/portal-music.json'),
      fetch('/data/portal-dock.json'),
    ])

    if (!musicRes.ok) throw new Error(`Music JSON ${musicRes.status}`)
    if (!dockRes.ok) throw new Error(`Dock JSON ${dockRes.status}`)

    musicTracks.value = await musicRes.json()
    dockGroups.value = await dockRes.json()
    searchItems.value = await loadSearchItems()
  } catch (error) {
    dataError.value = `Portal data failed: ${error.message}`
  } finally {
    loadingData.value = false
  }
}

function destroyPlayer() {
  const current = player
  player = null
  if (!current) return
  // A queued APlayer error-skip callback must see an empty list after teardown.
  current.list.clear()
  current.destroy()
}

function labelPlayerControls(container) {
  const labels = {
    '.aplayer-icon-back': 'Previous track',
    '.aplayer-icon-forward': 'Next track',
    '.aplayer-icon-play': 'Play',
    '.aplayer-icon-pause': 'Pause',
    '.aplayer-icon-order': 'Change playback order',
    '.aplayer-icon-loop': 'Change repeat mode',
    '.aplayer-icon-volume-down': 'Mute or unmute',
    '.aplayer-icon-menu': 'Show or hide track list',
    '.aplayer-pic .aplayer-button': player?.audio.paused ? 'Play' : 'Pause',
  }
  for (const [selector, label] of Object.entries(labels)) {
    container.querySelectorAll(selector).forEach(control => {
      control.setAttribute('aria-label', label)
      control.title = label
      if (control.tagName !== 'BUTTON') {
        control.setAttribute('role', 'button')
        control.tabIndex = 0
      }
    })
  }
}

async function mountPlayer() {
  await nextTick()
  if (loadingData.value || activeWindow.value !== 'music' || !aplayerContainer.value || !musicTracks.value.length || player) return

  player = new APlayer({
    container: aplayerContainer.value,
    autoplay: false,
    theme: '#89b4fa',
    listFolded: false,
    listMaxHeight: '246px',
    audio: musicTracks.value,
  })
  const container = aplayerContainer.value
  const updateLabels = () => labelPlayerControls(container)
  updateLabels()
  player.on('play', updateLabels)
  player.on('pause', updateLabels)
  container.addEventListener('keydown', event => {
    if (['Enter', ' '].includes(event.key) && event.target.matches('[role="button"]')) {
      event.preventDefault()
      event.target.click()
    }
  })
}

async function handleWindowAfterEnter() {
  isRestoring.value = false
  if (!windowPositionUserAdjusted && !windowMaximized.value) {
    await centerWindow()
  }
  if (activeWindow.value === 'music') await mountPlayer()
  await focusActiveSurface()
  requestLiquidGlassRender(220)
}

watch(activeWindow, async (next) => {
  if (next !== 'music') destroyPlayer()
  else await mountPlayer()
})

watch([musicTracks, loadingData], async () => {
  if (activeWindow.value === 'music') await mountPlayer()
})

watch(spotlightQuery, () => {
  spotlightSelectedIndex.value = 0
})

watch(spotlightFlatLinks, (links) => {
  spotlightSelectedIndex.value = Math.min(
    spotlightSelectedIndex.value,
    Math.max(0, links.length - 1),
  )
})

watch(
  [activeWindow, activeOverlay, minimizedWindow, windowMaximized],
  async () => {
    await nextTick()
    requestLiquidGlassRender(360)
  },
)

onMounted(async () => {
  loadPortalData()
  updateCompactLayout()
  liquidGlassMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  liquidGlassTransparencyQuery = window.matchMedia('(prefers-reduced-transparency: reduce)')
  liquidGlassForcedColorsQuery = window.matchMedia('(forced-colors: active)')
  liquidGlassContrastQuery = window.matchMedia('(prefers-contrast: more)')
  liquidGlassPointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)')
  liquidGlassTransparencyQuery.addEventListener('change', handleLiquidGlassPreferenceChange)
  liquidGlassForcedColorsQuery.addEventListener('change', handleLiquidGlassPreferenceChange)
  liquidGlassMotionQuery.addEventListener('change', handleLiquidMotionPreferenceChange)
  liquidGlassContrastQuery.addEventListener('change', handleLiquidContrastPreferenceChange)
  document.addEventListener('visibilitychange', handleLiquidVisibilityChange)
  document.addEventListener('pointerdown', handleMenuOutsidePointerDown, true)
  window.addEventListener('keydown', handleGlobalKeydown)
  window.addEventListener('resize', handleViewportResize)
  await nextTick()
  initializeLiquidGlassRenderer()
  clockTimer = window.setInterval(() => {
    now.value = new Date()
  }, 30000)
})

onBeforeUnmount(() => {
  destroyPlayer()
  cancelWindowDrag()
  window.clearInterval(clockTimer)
  window.clearTimeout(dockSettleTimer)
  window.cancelAnimationFrame(dockAnimationFrame)
  window.cancelAnimationFrame(liquidLightAnimationFrame)
  destroyLiquidGlassRenderer()
  liquidGlassTransparencyQuery?.removeEventListener('change', handleLiquidGlassPreferenceChange)
  liquidGlassForcedColorsQuery?.removeEventListener('change', handleLiquidGlassPreferenceChange)
  liquidGlassMotionQuery?.removeEventListener('change', handleLiquidMotionPreferenceChange)
  liquidGlassContrastQuery?.removeEventListener('change', handleLiquidContrastPreferenceChange)
  document.removeEventListener('visibilitychange', handleLiquidVisibilityChange)
  document.removeEventListener('pointerdown', handleMenuOutsidePointerDown, true)
  window.removeEventListener('keydown', handleGlobalKeydown)
  window.removeEventListener('resize', handleViewportResize)
})
</script>

<template>
  <main
    ref="portalDesktopRef"
    class="portal-desktop"
    :class="{
      'has-active-overlay': Boolean(activeOverlay),
      'is-desktop-focused': desktopFocused,
      'has-liquid-webgl': liquidWebGLReady,
      'has-open-menu': Boolean(activeMenu),
    }"
    :style="{ '--portal-wallpaper': `url(${wallpaper})` }"
    @pointerdown.self="handleDesktopPointerDown"
    @pointerdown.capture="handleLiquidLightPress"
    @pointerup.capture="resetLiquidLight"
    @pointercancel.capture="resetLiquidLight"
    @pointermove="handleLiquidLightPointerMove"
    @pointerleave="resetLiquidLight"
    @scroll.capture="handleLiquidGlassScroll"
    @focusin.capture="handleLiquidGlassFocus"
    @focusout.capture="handleLiquidGlassFocus"
  >
    <div class="wallpaper" aria-hidden="true"></div>
    <canvas
      ref="liquidCanvasRef"
      class="liquid-glass-canvas"
      aria-hidden="true"
    ></canvas>
    <div class="desktop-vignette" aria-hidden="true"></div>

    <header
      class="portal-menu-bar liquid-surface"
      data-liquid-surface
      data-liquid-kind="strip"
      aria-label="Portal menu bar"
    >
      <div class="menu-left">
        <RouterLink to="/" class="menu-home-link" aria-label="Back to home">
          <img src="/favicon_liuyin.svg" alt="" class="menu-brand-icon">
        </RouterLink>
        <strong class="menu-current-app">{{ activeApp?.title ?? 'Finder' }}</strong>
        <nav class="menu-commands" aria-label="Application menus">
          <div
            v-for="menu in portalMenus"
            :key="menu.id"
            class="menu-group"
            @keydown="handleMenuKeydown($event, menu.id)"
            @pointerenter="activeMenu && openMenu(menu.id)"
          >
            <button
              class="menu-command"
              type="button"
              :id="'portal-menu-trigger-' + menu.id"
              :data-portal-menu="menu.id"
              :class="{ 'is-active': activeMenu === menu.id }"
              aria-haspopup="menu"
              :aria-expanded="activeMenu === menu.id"
              :aria-controls="'portal-menu-' + menu.id"
              @click="toggleMenu(menu.id)"
            >{{ menu.label }}</button>
            <div
              v-if="activeMenu === menu.id"
              :id="'portal-menu-' + menu.id"
              class="menu-dropdown liquid-surface"
              data-liquid-surface
              data-liquid-kind="panel"
              role="menu"
              :aria-labelledby="'portal-menu-trigger-' + menu.id"
            >
              <template v-for="item in menu.items" :key="item.label">
                <div v-if="item.separator" class="menu-separator" role="separator"></div>
                <a
                  v-if="item.href"
                  class="menu-item"
                  :href="item.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  role="menuitem"
                  tabindex="-1"
                  @click="closeMenu()"
                >
                  <span>{{ item.label }}</span>
                </a>
                <button
                  v-else
                  class="menu-item"
                  type="button"
                  role="menuitem"
                  tabindex="-1"
                  :disabled="item.disabled"
                  @click="activateMenuItem(item)"
                >
                  <span>{{ item.label }}</span>
                  <kbd v-if="item.shortcut">{{ item.shortcut }}</kbd>
                </button>
              </template>
            </div>
          </div>
        </nav>
      </div>

      <div class="menu-right">
        <button
          class="menu-glyph-button"
          type="button"
          :class="{ 'is-active': activeOverlay === 'map' }"
          aria-label="Open Spotlight"
          data-app-id="map"
          title="Spotlight (⌘K)"
          @click="openWindow('map')"
        >
<img class="menu-tool-icon" src="/portal-icons/spotlight.svg" alt="">
        </button>
        <button
          class="menu-glyph-button control-center-glyph"
          type="button"
          :class="{ 'is-active': activeWindow === 'todo' && minimizedWindow !== 'todo' }"
          aria-label="Open TODO List"
          data-app-id="todo"
          aria-haspopup="dialog"
          title="TODO List"
          @click="openWindow('todo')"
        >
<img class="menu-tool-icon" src="/portal-icons/reminders.svg" alt="">
        </button>
        <a
          class="menu-status-glyph menu-status-action"
          :href="ipInfoUrl"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open IP information"
          title="IP information"
        >
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M2.6 7.2a11 11 0 0 1 14.8 0M5.2 10.1a7.1 7.1 0 0 1 9.6 0M8 13a3 3 0 0 1 4 0"></path>
            <circle cx="10" cy="16" r="1"></circle>
          </svg>
        </a>
        <span class="menu-status-glyph battery-glyph" aria-label="Battery charged" title="Battery">
          <svg viewBox="0 0 24 20" aria-hidden="true">
            <rect x="2" y="5" width="18" height="10" rx="2"></rect>
            <path d="M21 8v4"></path>
            <rect class="battery-level" x="4" y="7" width="13.5" height="6" rx="1"></rect>
          </svg>
        </span>
        <button
          class="menu-clock menu-clock-action"
          type="button"
          :class="{ 'is-active': activeWindow === 'calendar' && minimizedWindow !== 'calendar' }"
          aria-label="Open Calendar"
          data-app-id="calendar"
          aria-haspopup="dialog"
          title="Calendar"
          @click="openWindow('calendar')"
        >{{ menuTime }}</button>
      </div>
    </header>

    <Transition
      name="window-shell"
      appear
      @before-enter="requestLiquidGlassRender(260)"
      @before-leave="requestLiquidGlassRender(260)"
      @after-enter="handleWindowAfterEnter"
      @after-leave="handleWindowAfterLeave"
      @leave-cancelled="handleWindowAfterLeave"
    >
      <section
        v-if="activeWindowApp"
        v-show="minimizedWindow !== activeWindow"
        :key="activeWindowApp.id"
        ref="windowRef"
        class="mac-window liquid-surface"
        data-liquid-surface
        data-liquid-kind="window"
        :class="[
          activeWindowApp.windowClass,
          {
            'is-positioned': windowPositioned && !compactLayout,
            'is-maximized': windowMaximized,
            'is-dragging': dragging,
            'is-minimizing': isMinimizing,
            'is-restoring': isRestoring,
            'is-receded': activeOverlay || !desktopFocused,
          },
        ]"
        :style="windowStyle"
        :aria-label="activeWindowApp.title"
        role="dialog"
        aria-modal="false"
        :aria-hidden="activeOverlay ? 'true' : undefined"
        :inert="Boolean(activeOverlay)"
        tabindex="-1"
        @pointerdown.stop="activateWindowSurface"
        @keydown="handleDialogKeydown"
      >
        <div
          class="window-titlebar"
          :class="{ 'has-scrolled-divider': windowBodyScrolled }"
          @pointerdown="startWindowDrag"
          @lostpointercapture="endWindowDrag"
          @dblclick="toggleMaximizeWindow"
        >
          <div class="traffic-lights" aria-label="Window controls" @pointerdown.stop>
            <button
              class="traffic-light close"
              type="button"
              aria-label="Close window"
              @pointerdown.stop
              @click.stop="closeWindow"
            ></button>
            <button
              class="traffic-light minimize"
              type="button"
              aria-label="Minimize window"
              @pointerdown.stop
              @click.stop="minimizeWindow"
            ></button>
            <button
              class="traffic-light zoom"
              type="button"
              :aria-label="windowMaximized ? 'Restore window' : 'Maximize window'"
              :disabled="compactLayout"
              @pointerdown.stop
              @click.stop="toggleMaximizeWindow"
            ></button>
          </div>
          <div class="window-title">
            <img class="window-title-glyph" :src="activeWindowApp.icon" alt="">
            <span>{{ activeWindowApp.title }}</span>
          </div>
        </div>

        <div
          class="window-body"
          @scroll.passive="handleWindowBodyScroll"
        >
          <div v-if="dataError" class="portal-error" role="alert">{{ dataError }}</div>

          <section
            v-if="activeWindow === 'music'"
            class="mac-app-content music-app"
          >
            <div v-if="loadingData" class="portal-loading" role="status">Loading music library...</div>
            <div v-else ref="aplayerContainer" class="aplayer-mount"></div>
          </section>

          <section v-else-if="activeWindow === 'weather'" class="mac-app-content widget-shell weather-shell">
            <Weather
              class="portal-widget weather-widget"
            />
          </section>

          <section v-else-if="activeWindow === 'calendar'" class="mac-app-content widget-shell calendar-shell">
            <Calendar
              class="portal-widget calendar-widget"
            />
          </section>

          <section v-else-if="activeWindow === 'todo'" class="mac-app-content widget-shell todo-shell">
            <header
              class="todo-overview"
            >
              <div>
                <p>REMINDERS</p>
                <h2>My Tasks</h2>
                <span>Keep the next thing clear and close at hand.</span>
              </div>
              <span class="todo-overview-mark" aria-hidden="true">
<img src="/portal-icons/reminders.svg" alt="">
              </span>
            </header>
            <ToDoList
              class="portal-widget todo-widget"
            />
          </section>
        </div>
      </section>
    </Transition>

    <Transition name="spotlight-shell" appear>
      <div
        v-if="activeOverlay === 'map'"
        class="spotlight-overlay"
        @pointerdown.self="closeWindow"
      >
        <section
          class="spotlight-panel liquid-surface"
          data-liquid-surface
          data-liquid-kind="panel"
          aria-label="Spotlight"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          @pointerdown.stop
          @keydown="handleDialogKeydown"
        >
          <button
            class="spotlight-close"
            type="button"
            aria-label="Close Spotlight"
            @click="closeWindow"
          >×</button>
          <label
            class="spotlight-search liquid-surface"
            data-liquid-surface
            data-liquid-kind="search"
          >
            <span class="spotlight-magnifier" aria-hidden="true"></span>
            <input
              ref="spotlightInput"
              v-model="spotlightQuery"
              class="spotlight-input"
              type="search"
              role="combobox"
              autocomplete="off"
              placeholder="Spotlight Search"
              aria-label="Search LiuYinChu's Space"
              aria-autocomplete="list"
              aria-controls="portal-spotlight-results"
              aria-describedby="portal-spotlight-help"
              aria-expanded="true"
              :aria-activedescendant="spotlightFlatLinks.length
                ? `spotlight-result-${spotlightSelectedIndex}`
                : undefined"
              @keydown="handleSpotlightKeydown"
            >
          </label>

          <div
            id="portal-spotlight-results"
            class="spotlight-results liquid-pane"
            role="listbox"
            aria-label="Site search results"
          >
            <section
              v-for="(group, groupIndex) in spotlightGroups"
              :key="group.category"
              class="spotlight-group"
              role="group"
              :aria-labelledby="`spotlight-group-${groupIndex}`"
            >
              <h2 :id="`spotlight-group-${groupIndex}`">{{ group.category }}</h2>
              <button
                v-for="link in group.items"
                :key="`${link.external ? 'external' : 'internal'}-${link.path}`"
                :id="`spotlight-result-${link.resultIndex}`"
                class="spotlight-result"
                :class="{ 'is-selected': spotlightSelectedIndex === link.resultIndex }"
                :data-result-index="link.resultIndex"
                type="button"
                role="option"
                tabindex="-1"
                :aria-label="`${link.name}，${link.hint || link.category}，在新标签页打开`"
                :aria-selected="spotlightSelectedIndex === link.resultIndex"
                @mouseenter="spotlightSelectedIndex = link.resultIndex"
                @click="activateSpotlightResult(link)"
              >
                <span class="spotlight-result-icon" aria-hidden="true">
                  <svg v-if="link.external" viewBox="0 0 20 20">
                    <path d="M8 4H4.8A1.8 1.8 0 0 0 3 5.8v9.4A1.8 1.8 0 0 0 4.8 17h9.4a1.8 1.8 0 0 0 1.8-1.8V12"></path>
                    <path d="M11 3h6v6M17 3l-8 8"></path>
                  </svg>
                  <svg v-else viewBox="0 0 20 20">
                    <path d="M5 2.8h6l4 4v10.4H5z"></path>
                    <path d="M11 2.8v4h4M7.5 11h5M7.5 14h5"></path>
                  </svg>
                </span>
                <span class="spotlight-result-copy">
                  <strong>{{ link.name }}</strong>
                  <small>{{ link.hint }}</small>
                </span>
                <span class="spotlight-result-meta" aria-hidden="true">
                  <span class="spotlight-result-category">{{ link.category }}</span>
                  <span class="spotlight-result-open">↗</span>
                </span>
              </button>
            </section>
            <p v-if="!spotlightFlatLinks.length" class="spotlight-empty" role="status">
              没有找到对应入口
            </p>
          </div>
          <footer
            class="spotlight-footer liquid-pane"
          >
            <span role="status" aria-live="polite">{{ spotlightFlatLinks.length }} 个结果</span>
            <span id="portal-spotlight-help" class="spotlight-help">
              <kbd>↑</kbd><kbd>↓</kbd> 选择
              <span aria-hidden="true">·</span>
              <kbd>↵</kbd> 新标签页打开
              <span aria-hidden="true">·</span>
              <kbd>esc</kbd> 关闭
            </span>
          </footer>
        </section>
      </div>
    </Transition>

    <Transition name="launchpad-shell" appear>
      <div
        v-if="activeOverlay === 'dock'"
        class="launchpad-overlay"
        @click.self="closeWindow"
      >
        <section
          ref="launchpadPanel"
          class="launchpad-panel"
          aria-label="Launchpad"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          @click.self="closeWindow"
          @keydown="handleDialogKeydown"
        >
          <button
            class="launchpad-close liquid-surface"
            data-liquid-surface
            data-liquid-kind="circle"
            type="button"
            aria-label="Close Launchpad"
            @click="closeWindow"
          >
            ×
          </button>
          <label
            class="launchpad-search liquid-surface"
            data-liquid-surface
            data-liquid-kind="search"
          >
            <span class="spotlight-magnifier" aria-hidden="true"></span>
            <input
              ref="launchpadInput"
              v-model="launchpadQuery"
              type="search"
              autocomplete="off"
              placeholder="Search"
              aria-label="Search Launchpad"
            >
          </label>

          <div v-if="dataError" class="portal-error" role="alert">{{ dataError }}</div>
          <div v-else-if="loadingData" class="portal-loading" role="status">Loading Launchpad...</div>
          <div
            v-else
            class="launchpad-groups liquid-surface"
            data-liquid-surface
            data-liquid-kind="panel"
            @click.self="closeWindow"
          >
            <section
              v-for="group in filteredDockGroups"
              :key="group.name"
              class="link-group"
              @click.self="closeWindow"
            >
              <h2>{{ group.name }}</h2>
              <div class="launchpad-grid" @click.self="closeWindow">
                <a
                  v-for="site in group.links"
                  :key="site.url"
                  :href="site.url"
                  class="launchpad-tile"
                  target="_blank"
                  rel="noopener noreferrer"
                  @click="closeWindow"
                >
                  <img
                    :src="iconForUrl(site.url)"
                    alt=""
                    @error="handleIconError($event, site.name)"
                  >
                  <span>{{ site.name }}</span>
                </a>
              </div>
            </section>
            <p v-if="!filteredDockGroups.length" class="launchpad-empty" role="status">
              No matching applications
            </p>
          </div>
        </section>
      </div>
    </Transition>

    <nav
      ref="dockRef"
      class="bottom-launcher liquid-surface"
      data-liquid-surface
      data-liquid-kind="dock"
      aria-label="Portal Dock"
      tabindex="-1"
      @pointerdown.stop
      @pointermove="handleDockPointerMove"
      @pointerover="requestLiquidGlassRender(500)"
      @pointerleave="resetDockMagnification"
      @pointercancel="resetDockMagnification"
    >
      <button
        v-for="app in dockWindowApps"
        :key="app.id"
        class="launcher-item"
        type="button"
        :data-app-id="app.id"
        :class="{
          'is-active': isOrdinaryWindow(app.id)
            ? activeWindow === app.id && minimizedWindow !== app.id
            : activeOverlay === app.id,
          'is-running': isOrdinaryWindow(app.id)
            ? activeWindow === app.id || minimizedWindow === app.id
            : activeOverlay === app.id,
        }"
        :aria-label="`Open ${app.label}`"
        @click="openWindow(app.id)"
      >
        <img
          class="portal-app-icon"
          :src="app.icon"
          alt=""
        >
        <span
          class="launcher-tooltip liquid-surface"
          data-liquid-surface
          data-liquid-kind="search"
        >{{ app.label }}</span>
      </button>

      <span class="launcher-divider" aria-hidden="true"></span>

      <a
        v-for="site in quickLinks"
        :key="site.url"
        :href="site.url"
        target="_blank"
        rel="noopener noreferrer"
        class="launcher-item"
        :aria-label="site.name"
      >
        <img
          :src="iconForUrl(site.url)"
          alt=""
          @error="handleIconError($event, site.name)"
        >
        <span
          class="launcher-tooltip liquid-surface"
          data-liquid-surface
          data-liquid-kind="search"
        >{{ site.name }}</span>
      </a>

      <template v-if="minimizedApp">
        <span class="launcher-divider" aria-hidden="true"></span>
        <button
          class="launcher-item minimized-window-preview"
          type="button"
          :data-app-id="minimizedApp.id"
          :aria-label="`Restore ${minimizedApp.title}`"
          @click="restoreMinimizedWindow"
        >
          <img
            class="portal-app-icon"
            :src="minimizedApp.icon"
            alt=""
          >
          <span
            class="launcher-tooltip liquid-surface"
            data-liquid-surface
            data-liquid-kind="search"
          >Restore {{ minimizedApp.title }}</span>
        </button>
      </template>
    </nav>
  </main>
</template>

<style scoped>
.portal-desktop {
  --portal-system-font: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', 'PingFang SC', sans-serif;
  --portal-material-menu: rgba(18, 28, 42, 0.08);
  --portal-material-window: rgba(16, 25, 38, 0.1);
  --portal-material-content: rgba(10, 18, 28, 0.11);
  --portal-material-dock: rgba(18, 28, 42, 0.07);
  --portal-material-blur: saturate(150%);
  --lg-shell-fill: rgba(17, 27, 41, 0.09);
  --lg-pane-fill: rgba(10, 18, 29, 0.06);
  --lg-pane-fill-strong: rgba(8, 15, 24, 0.1);
  --lg-control-fill: rgba(255, 255, 255, 0.075);
  --lg-control-hover: rgba(255, 255, 255, 0.12);
  --lg-border: rgba(255, 255, 255, 0.19);
  --lg-border-soft: rgba(255, 255, 255, 0.1);
  --lg-optical-tint: rgba(17, 27, 41, 0.065);
  --lg-optical-tint-strong: rgba(10, 18, 29, 0.11);
  --lg-light-x: 32%;
  --lg-light-y: 0px;
  --lg-light-strength: 0.085;
  --lg-edge-high:
    inset 0 0.5px 0 rgba(255, 255, 255, 0.3),
    inset 0 0 0 0.5px rgba(255, 255, 255, 0.055);
  --lg-edge-low: inset 0 -0.5px 0 rgba(0, 0, 0, 0.26);
  --lg-pane-filter: saturate(148%);
  --lg-control-filter: saturate(155%);
  --portal-hairline: rgba(255, 255, 255, 0.13);
  --portal-stroke-outer: rgba(0, 0, 0, 0.35);
  --portal-text-primary: rgba(255, 255, 255, 0.92);
  --portal-text-secondary: rgba(255, 255, 255, 0.8);
  --portal-text-tertiary: rgba(255, 255, 255, 0.64);
  --portal-text-accent: #0a84ff;
  --portal-shadow-window:
    0 0 0 0.5px var(--portal-stroke-outer),
    0 34px 96px rgba(0, 0, 0, 0.38),
    0 10px 30px rgba(0, 0, 0, 0.24);
  --portal-radius-window: 18px;
  --portal-radius-control: 9px;
  --portal-radius-icon: 22.5%;
  --portal-spring-settle: linear(
    0,
    0.294 10%,
    0.681 22%,
    0.885 32%,
    1.021 50%,
    0.986 66%,
    1.006 82%,
    1 100%
  );
  --portal-fw-regular: 400;
  --portal-fw-medium: 500;
  --portal-fw-semibold: 600;
  --portal-text: var(--portal-text-primary);
  --portal-muted: var(--portal-text-secondary);
  --portal-window-max-top: 34px;
  --portal-window-max-inset: 8px;
  --portal-window-max-gutter: 16px;
  --portal-window-max-height-offset: 112px;
  --portal-dock-magnify-radius: 90;
  --portal-dock-magnify-shift: 6;
  --portal-dock-magnify-lift: 10;

  position: relative;
  width: 100vw;
  height: 100dvh;
  overflow: hidden;
  color: var(--portal-text);
  background: #181825;
  font-family: var(--portal-system-font);
}

.widget-shell :deep(*),
.music-app :deep(*),
.portal-desktop :deep(button),
.portal-desktop :deep(input) {
  font-family: var(--portal-system-font) !important;
}

.wallpaper,
.desktop-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.wallpaper {
  z-index: 0;
  background-image: var(--portal-wallpaper);
  background-size: cover;
  background-position: center;
  transform: scale(1.02);
}

.liquid-glass-canvas {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: block;
  width: 100%;
  height: 100%;
  opacity: 0;
  pointer-events: none;
  transition: opacity 160ms ease-out;
}

.portal-desktop.has-liquid-webgl .liquid-glass-canvas {
  opacity: 1;
}

.desktop-vignette {
  z-index: 2;
  background:
    linear-gradient(
      180deg,
      rgba(12, 17, 26, 0.075),
      rgba(12, 17, 26, 0.015) 38%,
      rgba(12, 17, 26, 0.11)
    ),
    radial-gradient(circle at 50% 38%, rgba(255, 255, 255, 0.035), transparent 38rem);
}

.portal-menu-bar {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  height: 1.65rem;
  padding: 0 0.72rem;
  color: rgba(18, 20, 30, 0.9);
  border: 0;
  border-radius: 0;
  background: rgba(216, 224, 255, 0.72);
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.32), 0 10px 28px rgba(17, 17, 27, 0.12);
  backdrop-filter: blur(18px) saturate(170%);
  box-sizing: border-box;
}

.menu-left,
.menu-right {
  display: flex;
  align-items: center;
  min-width: 0;
}

.menu-left {
  justify-content: flex-start;
  gap: 0.42rem;
}

.menu-right {
  justify-content: flex-end;
  gap: 0.26rem;
}

.menu-clock {
  color: rgba(18, 20, 30, 0.82);
  font-size: 0.76rem;
  font-weight: var(--portal-fw-medium);
  white-space: nowrap;
}

.menu-brand-icon {
  width: 0.95rem;
  height: 0.95rem;
  border-radius: 0.24rem;
}

.menu-home-link {
  display: inline-flex;
  width: 1.24rem;
  height: 1.24rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.32rem;
  transition: background-color 0.16s ease;
}

.menu-home-link:hover,
.menu-home-link:focus-visible {
  background: rgba(255, 255, 255, 0.42);
  outline: none;
}

.mac-window {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 12;
  display: flex;
  width: min(920px, calc(100vw - 3rem));
  max-height: min(690px, calc(100dvh - 8.4rem));
  min-height: 24rem;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 0.82rem;
  background: rgba(32, 34, 48, 0.76);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.18),
    0 38px 110px rgba(0, 0, 0, 0.5);
  transform: translate(-50%, -50%);
  backdrop-filter: blur(34px) saturate(160%);
}

.window-music {
  width: min(780px, calc(100vw - 3rem));
  min-height: auto;
}
.window-weather { width: min(560px, calc(100vw - 3rem)); }
.window-calendar { width: min(600px, calc(100vw - 3rem)); }
.window-todo { width: min(690px, calc(100vw - 3rem)); }

.window-titlebar {
  display: grid;
  grid-template-columns: 5rem minmax(0, 1fr) 5rem;
  align-items: center;
  min-height: 2.4rem;
  padding: 0 0.9rem;
  background: rgba(27, 28, 40, 0.84);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-sizing: border-box;
}

.traffic-lights {
  display: flex;
  align-items: center;
  gap: 0.48rem;
}

.traffic-light {
  width: 0.78rem;
  height: 0.78rem;
  padding: 0;
  border: 0;
  border-radius: 50%;
}

.traffic-light.close {
  --traffic-color: #ff5f57;
  cursor: pointer;
}

.traffic-light.minimize {
  --traffic-color: #febc2e;
}

.traffic-light.zoom {
  --traffic-color: #28c840;
}

.traffic-light:disabled {
  cursor: default;
}

.window-title {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 0;
  color: rgba(245, 246, 255, 0.9);
  font-size: 0.88rem;
  font-weight: var(--portal-fw-semibold);
}

.window-title img {
  width: 1.05rem;
  height: 1.05rem;
  border-radius: 0.28rem;
}

.window-body {
  min-height: 0;
  flex: 1;
  overflow: auto;
  padding: clamp(1rem, 2vw, 1.35rem);
}

.window-music .window-body {
  padding-bottom: 1.1rem;
}

.portal-loading,
.portal-error {
  padding: 2rem;
  color: var(--portal-muted);
  text-align: center;
}

.portal-error {
  color: #f38ba8;
}

.mac-app-content {
  display: grid;
  gap: 1.05rem;
  min-height: 100%;
}

.music-app {
  gap: 1.15rem;
  min-height: auto;
}

.aplayer-mount {
  min-height: 0;
}

:deep(.aplayer) {
  margin: 0;
  border: 1px solid var(--portal-hairline);
  border-radius: 1.2rem;
  color: #cdd6f4;
  background: linear-gradient(145deg, rgba(62, 74, 103, 0.66), rgba(23, 30, 48, 0.58));
  box-shadow: inset 0 0 0 0.5px var(--portal-hairline);
  overflow: hidden;
}

:deep(.aplayer-list) {
  max-height: 246px;
  background: rgba(16, 22, 36, 0.2);
}

:deep(.aplayer-pic) {
  border-radius: 0 0.9rem 0.9rem 0;
  box-shadow:
    10px 0 24px rgba(3, 8, 20, 0.28),
    inset -1px 0 0 rgba(255, 255, 255, 0.08);
}

:deep(.aplayer-list ol li) {
  border-top-color: rgba(180, 190, 254, 0.1);
  color: #cdd6f4;
  background: transparent;
  transition: background-color 0.16s ease, color 0.16s ease;
}

:deep(.aplayer-list ol li:hover),
:deep(.aplayer-list-light) {
  color: rgba(245, 246, 255, 0.96) !important;
  background: rgba(137, 180, 250, 0.22) !important;
  box-shadow: inset 0 0 0 0.5px var(--portal-hairline);
}

:deep(.aplayer-list-light .aplayer-list-title),
:deep(.aplayer-list-light .aplayer-list-author) {
  color: rgba(245, 246, 255, 0.96) !important;
}

:deep(.aplayer-info),
:deep(.aplayer-list) {
  border-color: rgba(180, 190, 254, 0.1);
}

:deep(.aplayer .aplayer-controller .aplayer-bar-wrap .aplayer-bar),
:deep(.aplayer .aplayer-volume-bar-wrap .aplayer-volume-bar) {
  background: rgba(14, 20, 34, 0.42);
  box-shadow: inset 0 0 0 0.5px var(--portal-hairline);
}

.widget-shell :deep(.weather-container),
.widget-shell :deep(.todo-list-container),
.widget-shell :deep(.calendar),
.widget-shell :deep(.calendar-container),
.widget-shell :deep(.todo-container) {
  border: 1px solid rgba(180, 190, 254, 0.12);
  border-radius: 1rem;
  background: rgba(30, 30, 46, 0.58);
  box-shadow: none;
}

.spotlight-search {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.7rem;
  min-height: 3.2rem;
  padding: 0 1rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 1.05rem;
  color: rgba(245, 246, 255, 0.92);
  background: rgba(17, 24, 38, 0.34);
  box-shadow: inset 0 0 0 0.5px var(--portal-hairline);
  cursor: text;
}

.spotlight-magnifier {
  position: relative;
  display: inline-flex;
  width: 1.32rem;
  height: 1.32rem;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.spotlight-magnifier::before {
  content: '';
  width: 0.82rem;
  height: 0.82rem;
  border: 2px solid rgba(245, 246, 255, 0.72);
  border-radius: 50%;
}

.spotlight-magnifier::after {
  content: '';
  position: absolute;
  right: 0.18rem;
  bottom: 0.18rem;
  width: 0.48rem;
  height: 2px;
  border-radius: 999px;
  background: rgba(245, 246, 255, 0.72);
  transform: rotate(45deg);
}

.spotlight-input {
  width: 100%;
  min-width: 0;
  padding: 0;
  border: 0;
  color: rgba(245, 246, 255, 0.94);
  background: transparent;
  font: inherit;
  font-size: clamp(1.1rem, 2vw, 1.42rem);
  font-weight: var(--portal-fw-medium);
  outline: none;
}

.spotlight-input::placeholder {
  color: rgba(245, 246, 255, 0.56);
}

.spotlight-results {
  display: grid;
  overflow: hidden;
  border: 1px solid var(--portal-hairline);
  border-radius: 1.08rem;
  background: rgba(0, 0, 0, 0.2);
  box-shadow: inset 0 0 0 0.5px var(--portal-hairline);
}

.spotlight-result {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.9rem;
  min-height: 3.45rem;
  padding: 0 1rem;
  color: rgba(245, 246, 255, 0.9);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  text-decoration: none;
  transition: background-color 0.16s ease, box-shadow 0.16s ease;
}

.spotlight-result:last-child {
  border-bottom: 0;
}

.spotlight-result:hover,
.spotlight-result:focus-visible {
  background: rgba(137, 180, 250, 0.18);
  box-shadow: inset 0 0 0 0.5px var(--portal-hairline);
  outline: none;
}

.spotlight-result-copy {
  display: grid;
  min-width: 0;
  gap: 0.18rem;
}

.spotlight-result-copy strong {
  color: rgba(245, 246, 255, 0.95);
  font-size: 0.96rem;
}

.spotlight-result-copy small {
  overflow: hidden;
  color: rgba(205, 214, 244, 0.64);
  font-size: 0.78rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spotlight-empty {
  margin: 0;
  padding: 1.2rem 1rem;
  color: rgba(205, 214, 244, 0.62);
  font-size: 0.86rem;
  text-align: center;
}

.link-group {
  display: grid;
  gap: 1rem;
}

.link-group h2 {
  margin: 0;
  color: var(--group-accent, #b4befe);
  font-size: 0.86rem;
  font-weight: var(--portal-fw-semibold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.launchpad-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(5.6rem, 1fr));
  gap: 1.25rem 1rem;
}

.launchpad-tile {
  display: grid;
  justify-items: center;
  gap: 0.52rem;
  min-height: 5.9rem;
  padding: 0.35rem 0.2rem;
  border: 0;
  border-radius: 0.8rem;
  color: rgba(245, 246, 255, 0.9);
  background: transparent;
  text-align: center;
  text-decoration: none;
  transition: transform 0.18s ease, background-color 0.18s ease, border-color 0.18s ease;
}

.launchpad-tile:hover,
.launchpad-tile:focus-visible {
  background: rgba(255, 255, 255, 0.1);
  outline: none;
  transform: translateY(-3px);
}

.launchpad-tile img {
  width: 3.8rem;
  height: 3.8rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.92);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.6),
    0 12px 24px rgba(0, 0, 0, 0.24);
}

.launchpad-tile span {
  max-width: 100%;
  overflow-wrap: anywhere;
  color: rgba(245, 246, 255, 0.9);
  font-size: 0.76rem;
  font-weight: var(--portal-fw-medium);
  line-height: 1.25;
}

.bottom-launcher {
  position: absolute;
  right: 50%;
  bottom: max(1.15rem, env(safe-area-inset-bottom));
  z-index: 18;
  display: flex;
  align-items: end;
  justify-content: center;
  gap: clamp(0.34rem, 0.85vw, 0.66rem);
  width: auto;
  max-width: calc(100vw - 2rem);
  min-height: 4.7rem;
  padding: 0.48rem 0.7rem 0.42rem;
  overflow-x: auto;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 1.35rem;
  background: rgba(26, 28, 40, 0.5);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.24),
    0 24px 72px rgba(0, 0, 0, 0.36);
  transform: translateX(50%);
  backdrop-filter: blur(30px) saturate(170%);
  scrollbar-width: none;
}

.bottom-launcher::-webkit-scrollbar {
  display: none;
}

.launcher-item {
  position: relative;
  display: grid;
  justify-items: center;
  gap: 0.2rem;
  width: clamp(3rem, 4.3vw, 3.65rem);
  flex: 0 0 auto;
  padding: 0;
  border: 0;
  color: rgba(245, 246, 255, 0.88);
  background: transparent;
  font: inherit;
  font-size: 0.66rem;
  font-weight: var(--portal-fw-medium);
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  transition: transform 0.18s ease;
}

.launcher-item:hover,
.launcher-item:focus-visible {
  outline: none;
}

.launcher-item img {
  width: clamp(2.45rem, 4vw, 3rem);
  height: clamp(2.45rem, 4vw, 3rem);
  border-radius: 0.82rem;
  background: rgba(255, 255, 255, 0.88);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.55),
    0 12px 26px rgba(0, 0, 0, 0.32);
}

.launcher-item span {
  max-width: 4rem;
  overflow: hidden;
  line-height: 1.15;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.launcher-divider {
  width: 1px;
  height: 3.35rem;
  flex: 0 0 auto;
  background: rgba(255, 255, 255, 0.22);
}

@media (max-width: 900px) {
  .portal-menu-bar {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .bottom-launcher {
    justify-content: flex-start;
    width: auto;
  }
}

@media (max-width: 700px), (max-width: 950px) and (max-height: 600px) and (orientation: landscape) {
  .portal-menu-bar {
    height: calc(3rem + env(safe-area-inset-top));
    padding: env(safe-area-inset-top) 0.35rem 0;
  }

  .menu-left,
  .menu-right {
    gap: 0.08rem;
  }

  .menu-home-link {
    width: 2.75rem;
    min-width: 2.75rem;
    height: 2.75rem;
    padding: 0;
  }

  .menu-brand-icon {
    width: 1.1rem;
    height: 1.1rem;
  }

  .mac-window {
    top: calc(3rem + env(safe-area-inset-top) + 0.45rem);
    right: 0.5rem;
    bottom: calc(4.2rem + max(0.55rem, env(safe-area-inset-bottom)));
    left: 0.5rem;
    width: auto;
    max-height: none;
    min-height: 0;
    transform: none;
  }

  .window-titlebar {
    grid-template-columns: 2.75rem minmax(0, 1fr) 2.75rem;
    min-height: 2.75rem;
    padding: 0 0.55rem;
  }

  .traffic-lights {
    gap: 0;
  }

  .traffic-light.minimize,
  .traffic-light.zoom {
    display: none;
  }

  .traffic-light.close {
    position: relative;
    width: 2.75rem;
    height: 2.75rem;
    margin-left: -0.55rem;
    background: transparent;
  }

  .traffic-light.close::after {
    content: '';
    position: absolute;
    inset: 0;
    width: 0.78rem;
    height: 0.78rem;
    margin: auto;
    border-radius: 50%;
    background: #ff5f57;
  }

  .window-body {
    padding: 0.85rem;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
  }

  .bottom-launcher {
    align-items: center;
    min-height: 0;
    bottom: max(0.55rem, env(safe-area-inset-bottom));
    max-width: calc(100vw - 1rem);
    padding: 0.46rem 0.62rem;
    justify-content: flex-start;
    scroll-snap-type: x proximity;
    overscroll-behavior-inline: contain;
    -webkit-overflow-scrolling: touch;
  }

  .launcher-item span {
    display: none;
  }

  .launcher-item {
    width: 2.75rem;
    min-height: 2.75rem;
    scroll-snap-align: start;
    touch-action: manipulation;
  }

  .launcher-item img {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 0.68rem;
  }

  .launcher-divider {
    height: 2.45rem;
  }
}

/* macOS material pass */
.portal-menu-bar {
  height: 28px;
  padding: 0 10px;
  color: var(--portal-text-primary);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.015)),
    var(--portal-material-menu);
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.14);
  box-shadow:
    inset 0 -0.5px 0 rgba(0, 0, 0, 0.2),
    inset 0 0.5px 0 rgba(255, 255, 255, 0.12),
    0 1px 12px rgba(0, 0, 0, 0.12);
  -webkit-backdrop-filter: var(--portal-material-blur);
  backdrop-filter: var(--portal-material-blur);
}

.menu-left,
.menu-right {
  gap: 4px;
}

.menu-brand-icon {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  filter: saturate(0.72) brightness(1.08);
}

.menu-home-link,
.menu-glyph-button {
  display: inline-flex;
  width: 24px;
  height: 22px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 5px;
  color: var(--portal-text-primary);
  background: transparent;
  cursor: pointer;
  transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-home-link:hover,
.menu-glyph-button:hover,
.menu-glyph-button.is-active {
  background: rgba(255, 255, 255, 0.12);
}

.menu-current-app {
  margin: 0 6px 0 2px;
  color: var(--portal-text-primary);
  font-size: 13px;
  font-weight: var(--portal-fw-semibold);
  white-space: nowrap;
}

.menu-commands {
  display: flex;
  align-items: center;
  gap: 2px;
  color: var(--portal-text-primary);
  font-size: 13px;
  font-weight: var(--portal-fw-regular);
}

.menu-command {
  padding: 2px 7px;
  border: 0;
  border-radius: 5px;
  color: inherit;
  background: transparent;
  font: inherit;
  line-height: 1.2;
  text-decoration: none;
  cursor: pointer;
}

.menu-group {
  position: relative;
}

.menu-dropdown {
  position: absolute;
  top: calc(100% + 3px);
  left: 0;
  z-index: 60;
  min-width: 232px;
  padding: 5px;
  border: 0.5px solid rgba(255, 255, 255, 0.22);
  border-radius: 9px;
  color: rgba(255, 255, 255, 0.94);
  box-shadow: 0 12px 36px rgba(8, 12, 20, 0.28), 0 2px 8px rgba(8, 12, 20, 0.14);
  text-shadow: none;
  -webkit-backdrop-filter: blur(20px);
  backdrop-filter: blur(20px);
}

.portal-desktop.has-open-menu .portal-menu-bar {
  z-index: 60;
}

.portal-desktop.has-liquid-webgl .menu-dropdown.liquid-surface::before {
  background: rgba(30, 34, 43, 0.76);
}

.menu-item {
  display: flex;
  box-sizing: border-box;
  text-decoration: none;
  width: 100%;
  min-height: 28px;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 4px 9px;
  border: 0;
  border-radius: 5px;
  color: inherit;
  background: transparent;
  font: inherit;
  font-size: 13px;
  line-height: 20px;
  text-align: left;
  cursor: default;
}

.menu-item:not(:disabled):is(:hover, :focus-visible) {
  color: #fff;
  background: #087cf0;
  outline: none;
}

.menu-item:disabled {
  color: rgba(255, 255, 255, 0.35);
}

.menu-item kbd {
  color: inherit;
  font: inherit;
  opacity: 0.65;
}

.menu-separator {
  height: 1px;
  margin: 4px 7px;
  background: rgba(255, 255, 255, 0.13);
}

.menu-tool-icon {
  width: 16px;
  height: 16px;
  filter: brightness(0) invert(1);
}

.portal-menu-bar[data-liquid-foreground='dark'] .menu-tool-icon {
  filter: brightness(0);
}

.menu-command:hover,
.menu-command:focus-visible,
.menu-command.is-active {
  background: rgba(255, 255, 255, 0.1);
}

.menu-glyph-button svg,
.menu-status-glyph svg {
  width: 17px;
  height: 17px;
  overflow: visible;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.55;
}

.menu-status-glyph {
  display: inline-flex;
  width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 5px;
  color: var(--portal-text-primary);
  background: transparent;
  text-decoration: none;
}

.menu-status-action,
.menu-clock-action {
  cursor: pointer;
  transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-status-action:hover,
.menu-status-action:focus-visible,
.menu-clock-action:hover,
.menu-clock-action:focus-visible,
.menu-clock-action.is-active {
  background: rgba(255, 255, 255, 0.12);
}

.battery-glyph {
  width: 26px;
}

.battery-glyph svg {
  width: 22px;
}

.battery-level {
  fill: currentColor;
  stroke: none;
}

.menu-clock {
  margin-left: 3px;
  padding: 2px 5px;
  border: 0;
  border-radius: 5px;
  color: var(--portal-text-primary);
  background: transparent;
  font-family: inherit;
  font-size: 13px;
  font-weight: var(--portal-fw-regular);
  line-height: 1.2;
}

.mac-window {
  width: min(920px, calc(100vw - 48px));
  max-height: min(690px, calc(100dvh - 118px));
  min-height: 24rem;
  overflow: hidden;
  border: 0.5px solid rgba(255, 255, 255, 0.18);
  border-radius: var(--portal-radius-window);
  color: var(--portal-text-primary);
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.055), rgba(0, 0, 0, 0.025)),
    rgba(28, 32, 40, 0.62);
  box-shadow: var(--portal-shadow-window);
  -webkit-backdrop-filter: saturate(170%) blur(24px);
  backdrop-filter: saturate(170%) blur(24px);
  transform-origin: center center;
  transition:
    filter 220ms cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 220ms cubic-bezier(0.4, 0, 0.2, 1),
    border-color 220ms cubic-bezier(0.4, 0, 0.2, 1);
}

.mac-window.is-positioned {
  transform: none;
}

.mac-window.is-maximized {
  border-radius: var(--portal-radius-window);
}

.mac-window.is-dragging {
  user-select: none;
  transition: none !important;
}

.mac-window.is-receded {
  border-color: rgba(255, 255, 255, 0.09);
  filter: saturate(0.68) brightness(0.82);
  box-shadow:
    0 0 0 0.5px rgba(0, 0, 0, 0.28),
    0 16px 48px rgba(0, 0, 0, 0.26);
}

.window-music {
  width: min(700px, calc(100vw - 48px));
}

.window-weather {
  width: min(520px, calc(100vw - 48px));
}

.window-calendar {
  width: min(490px, calc(100vw - 48px));
}

.window-todo {
  width: min(600px, calc(100vw - 48px));
}

.window-titlebar {
  grid-template-columns: 84px minmax(0, 1fr) 84px;
  min-height: 37px;
  padding: 0 13px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.008)),
    rgba(12, 14, 20, 0.08);
  border-bottom: 0.5px solid transparent;
  cursor: grab;
  touch-action: none;
  transition: border-color 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.window-titlebar.has-scrolled-divider {
  border-bottom-color: var(--portal-hairline);
}

.window-titlebar:active {
  cursor: grabbing;
}

.traffic-lights {
  gap: 0;
}

.traffic-light {
  position: relative;
  flex: 0 0 auto;
  width: 24px;
  height: 24px;
  padding: 0;
  overflow: visible;
  border: 0;
  background: radial-gradient(circle, var(--traffic-color) 0 6px, transparent 6.5px);
  box-shadow: none;
  cursor: default;
}

.traffic-light.close {
  --traffic-color: #ff5f57;
}

.traffic-light.minimize {
  --traffic-color: #febc2e;
}

.traffic-light.zoom {
  --traffic-color: #28c840;
}

.traffic-light::before,
.traffic-light::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  display: block;
  background: rgba(52, 31, 29, 0.82);
  opacity: 0;
  transition: opacity 120ms cubic-bezier(0.4, 0, 0.2, 1);
}

.traffic-light.close::before,
.traffic-light.close::after {
  width: 7px;
  height: 1px;
  border-radius: 999px;
}

.traffic-light.close::before {
  transform: translate(-50%, -50%) rotate(45deg);
}

.traffic-light.close::after {
  transform: translate(-50%, -50%) rotate(-45deg);
}

.traffic-light.minimize::before {
  width: 7px;
  height: 1px;
  border-radius: 999px;
  transform: translate(-50%, -50%);
}

.traffic-light.minimize::after {
  display: none;
}

.traffic-light.zoom::before,
.traffic-light.zoom::after {
  width: 4px;
  height: 4px;
  background: transparent;
  border-color: rgba(16, 65, 31, 0.86);
  border-style: solid;
}

.traffic-light.zoom::before {
  border-width: 1px 0 0 1px;
  transform: translate(-3px, -3px);
}

.traffic-light.zoom::after {
  border-width: 0 1px 1px 0;
  transform: translate(-1px, -1px);
}

.traffic-lights:hover .traffic-light::before,
.traffic-lights:hover .traffic-light::after,
.traffic-light:focus-visible::before,
.traffic-light:focus-visible::after {
  opacity: 1;
}

.mac-window.is-receded .traffic-light {
  --traffic-color: rgba(255, 255, 255, 0.28);
}

.window-title {
  gap: 6px;
  color: var(--portal-text-secondary);
  font-size: 13px;
  font-weight: var(--portal-fw-medium);
}

.window-title img {
  width: 16px;
  height: 16px;
  border-radius: 0;
  object-fit: contain;
  filter: brightness(0) invert(1);
}

.window-title-glyph {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 1.5;
}

.window-body {
  padding: 14px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.025), rgba(0, 0, 0, 0.03)),
    var(--portal-material-content);
  scrollbar-color: rgba(255, 255, 255, 0.26) transparent;
  scrollbar-width: thin;
}

.window-body::-webkit-scrollbar,
.spotlight-results::-webkit-scrollbar,
.launchpad-panel::-webkit-scrollbar,
:deep(.aplayer-list::-webkit-scrollbar) {
  width: 8px;
  height: 8px;
}

.window-body::-webkit-scrollbar-track,
.spotlight-results::-webkit-scrollbar-track,
.launchpad-panel::-webkit-scrollbar-track,
:deep(.aplayer-list::-webkit-scrollbar-track) {
  background: transparent;
}

.window-body::-webkit-scrollbar-thumb,
.spotlight-results::-webkit-scrollbar-thumb,
.launchpad-panel::-webkit-scrollbar-thumb,
:deep(.aplayer-list::-webkit-scrollbar-thumb) {
  border: 2px solid transparent;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.26);
  background-clip: padding-box;
}

.window-music .window-body {
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.02), rgba(0, 0, 0, 0.03)),
    var(--portal-material-content);
}

.mac-app-content {
  gap: 10px;
}

.music-app {
  gap: 10px;
}

:deep(.aplayer) {
  margin: 0;
  overflow: hidden;
  border: 0.5px solid var(--portal-hairline);
  border-radius: var(--portal-radius-control);
  color: #f5f5f7;
  background: rgba(255, 255, 255, 0.055);
  box-shadow: none;
}

:deep(.aplayer-list) {
  background: rgba(0, 0, 0, 0.14);
}

:deep(.aplayer-pic) {
  border-radius: 0;
  box-shadow: none;
}

:deep(.aplayer-list ol li) {
  border-top-color: var(--portal-hairline);
  color: var(--portal-text-secondary);
  background: transparent;
}

:deep(.aplayer-list ol li:hover),
:deep(.aplayer-list-light) {
  color: var(--portal-text-primary) !important;
  background: rgba(10, 132, 255, 0.22) !important;
  box-shadow: none;
}

:deep(.aplayer .aplayer-controller .aplayer-bar-wrap .aplayer-bar),
:deep(.aplayer .aplayer-volume-bar-wrap .aplayer-volume-bar) {
  background: rgba(0, 0, 0, 0.28);
  box-shadow: inset 0 0 0 0.5px var(--portal-hairline);
}

.widget-shell :deep(.weather-container),
.widget-shell :deep(.todo-list-container),
.widget-shell :deep(.calendar),
.widget-shell :deep(.calendar-container),
.widget-shell :deep(.todo-container) {
  border: 0.5px solid var(--portal-hairline);
  border-radius: var(--portal-radius-control);
  background: rgba(255, 255, 255, 0.045);
  box-shadow: none;
}

.window-todo {
  min-height: 470px;
}

.window-todo .window-body {
  padding: 18px;
  background:
    radial-gradient(circle at 92% 4%, rgba(10, 132, 255, 0.13), transparent 260px),
    radial-gradient(circle at 10% 100%, rgba(94, 92, 230, 0.11), transparent 280px),
    rgba(25, 27, 34, 0.84);
}

.todo-shell {
  align-content: start;
  gap: 14px;
  min-height: 390px;
}

.todo-overview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 4px;
}

.todo-overview p,
.todo-overview h2 {
  margin: 0;
}

.todo-overview p {
  color: rgba(100, 210, 255, 0.84);
  font-size: 10px;
  font-weight: var(--portal-fw-semibold);
  letter-spacing: 0.14em;
}

.todo-overview h2 {
  margin-top: 2px;
  color: var(--portal-text-primary);
  font-size: 22px;
  font-weight: var(--portal-fw-semibold);
  letter-spacing: -0.025em;
}

.todo-overview div > span {
  display: block;
  margin-top: 3px;
  color: var(--portal-text-secondary);
  font-size: 12px;
}

.todo-overview-mark {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 0.5px solid rgba(100, 210, 255, 0.28);
  border-radius: 13px;
  color: rgba(151, 220, 255, 0.94);
  background: linear-gradient(145deg, rgba(10, 132, 255, 0.22), rgba(94, 92, 230, 0.14));
  box-shadow: inset 0 0.5px 0 rgba(255, 255, 255, 0.16);
}

.todo-overview-mark img {
  width: 24px;
  height: 24px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
  filter: brightness(0) invert(1);
}

.todo-shell :deep(.todo-list-container),
.todo-shell :deep(.todo-container) {
  width: 100%;
  min-height: 300px;
  height: auto;
  padding: 16px;
  border: 0.5px solid rgba(255, 255, 255, 0.12);
  border-radius: 15px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.025)),
    rgba(18, 21, 32, 0.55);
  box-shadow:
    inset 0 0.5px 0 rgba(255, 255, 255, 0.14),
    0 16px 36px rgba(0, 0, 0, 0.14);
  box-sizing: border-box;
}

.todo-shell :deep(.mode-switch) {
  width: fit-content;
  min-height: 34px;
  align-items: center;
  gap: 3px;
  margin: 0 0 14px;
  padding: 3px;
  border: 0.5px solid rgba(255, 255, 255, 0.09);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.18);
}

.todo-shell :deep(.mode-btn) {
  min-width: 104px;
  min-height: 28px;
  padding: 4px 12px;
  border: 0;
  border-radius: 7px;
  color: var(--portal-text-secondary);
  background: transparent;
  font-family: inherit;
  font-size: 12px;
  font-weight: var(--portal-fw-medium);
  letter-spacing: 0;
  cursor: pointer;
}

.todo-shell :deep(.mode-btn:hover) {
  color: var(--portal-text-primary);
  background: rgba(255, 255, 255, 0.07);
}

.todo-shell :deep(.mode-btn.active) {
  color: var(--portal-text-primary);
  border: 0.5px solid rgba(255, 255, 255, 0.15);
  background: rgba(255, 255, 255, 0.14);
  box-shadow:
    0 1px 4px rgba(0, 0, 0, 0.2),
    inset 0 0.5px 0 rgba(255, 255, 255, 0.13);
  font-weight: var(--portal-fw-semibold);
}

.todo-shell :deep(.current-day-chip) {
  min-height: 28px;
  padding: 4px 10px;
  border: 0;
  border-radius: 7px;
  color: var(--portal-text-primary);
  background: rgba(10, 132, 255, 0.24);
  font-family: inherit;
  font-size: 11px;
  font-weight: var(--portal-fw-medium);
}

.todo-shell :deep(.input-section) {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 32px;
  gap: 8px;
  margin-bottom: 0;
  padding: 4px;
  border: 0.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 13px;
  background: rgba(0, 0, 0, 0.2);
  box-shadow: inset 0 0.5px 0 rgba(255, 255, 255, 0.06);
  align-items: center;
}

.todo-shell :deep(.task-input) {
  min-width: 0;
  min-height: 44px;
  padding: 0 12px;
  border: 0;
  border-radius: 9px;
  color: var(--portal-text-primary);
  background: rgba(255, 255, 255, 0.055);
  box-shadow: inset 0 0 0 0.5px rgba(255, 255, 255, 0.06);
  font-family: inherit;
  font-size: 14px;
  outline: none;
}

.todo-shell :deep(.task-input::placeholder) {
  color: var(--portal-text-tertiary);
}

.todo-shell :deep(.task-input:focus),
.todo-shell :deep(.task-input:focus-visible) {
  box-shadow:
    inset 0 0 0 1.5px var(--portal-text-accent),
    0 0 0 3px rgba(10, 132, 255, 0.16);
}

.todo-shell :deep(.add-button) {
  width: 44px;
  height: 44px;
  padding: 0 0 2px;
  border: 0;
  border-radius: 10px;
  color: white;
  background: linear-gradient(145deg, #35a2ff, #0a72df);
  box-shadow:
    inset 0 0.5px 0 rgba(255, 255, 255, 0.34),
    0 5px 14px rgba(0, 102, 204, 0.26);
  font-family: inherit;
  font-size: 24px;
  font-weight: var(--portal-fw-regular);
  line-height: 1;
}

.todo-shell :deep(.add-button:hover) {
  background: linear-gradient(145deg, #52b1ff, #1484f2);
  transform: translateY(-1px);
}

.todo-shell :deep(.task-list) {
  display: flex;
  min-height: 170px;
  max-height: 250px;
  flex: 1 1 auto;
  flex-direction: column;
  margin: 14px 0 0;
  padding: 0 4px 0 0;
  overflow-y: auto;
}

.todo-shell :deep(.task-list:empty) {
  align-items: center;
  justify-content: center;
  border: 0.5px dashed rgba(255, 255, 255, 0.11);
  border-radius: 13px;
  background:
    radial-gradient(circle at 50% 20%, rgba(10, 132, 255, 0.09), transparent 150px),
    rgba(255, 255, 255, 0.018);
}

.todo-shell :deep(.task-list:empty::before) {
  content: '✓';
  display: grid;
  width: 32px;
  height: 32px;
  margin-bottom: 10px;
  place-items: center;
  border: 0;
  border-radius: 50%;
  color: var(--portal-text-tertiary);
  background: rgba(255, 255, 255, 0.045);
  font-size: 18px;
}

.todo-shell :deep(.task-list:empty::after) {
  content: 'No reminders yet\A Add one above when something comes to mind.';
  color: var(--portal-text-secondary);
  font-size: 12px;
  line-height: 1.55;
  text-align: center;
  white-space: pre;
}

.todo-shell :deep(.task-item) {
  min-height: 50px;
  margin-bottom: 8px;
  padding: 10px 12px;
  border: 0.5px solid rgba(255, 255, 255, 0.1);
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.055);
  box-shadow: inset 0 0.5px 0 rgba(255, 255, 255, 0.07);
}

.todo-shell :deep(.task-item:hover) {
  border-color: rgba(255, 255, 255, 0.16);
  background: rgba(255, 255, 255, 0.075);
}

.todo-shell :deep(.task-item.completed) {
  border-color: rgba(48, 209, 88, 0.26);
  background: rgba(48, 209, 88, 0.07);
  opacity: 0.72;
}

.todo-shell :deep(.custom-checkbox) {
  width: 20px;
  height: 20px;
  border: 1.5px solid rgba(255, 255, 255, 0.34);
  background: rgba(0, 0, 0, 0.18);
}

.todo-shell :deep(.hidden-checkbox:checked ~ .custom-checkbox) {
  border-color: #30d158;
  background: #30d158;
}

.todo-shell :deep(.task-text) {
  margin-left: 10px;
  color: var(--portal-text-primary);
  font-family: inherit;
  font-size: 13px;
  font-weight: var(--portal-fw-regular);
}

.todo-shell :deep(.task-meta),
.todo-shell :deep(.date-chip) {
  color: var(--portal-text-tertiary);
  font-family: inherit;
  font-size: 11px;
}

.todo-shell :deep(.delete-button) {
  min-width: 32px;
  min-height: 32px;
  margin-left: 8px;
  padding: 6px;
  border-radius: 8px;
  color: #ff6961;
}

.todo-shell :deep(.delete-button:hover) {
  color: #ff8a84;
  background: rgba(255, 105, 97, 0.12);
  transform: none;
}

.portal-loading,
.portal-error {
  color: var(--portal-text-secondary);
  font-weight: var(--portal-fw-regular);
}

.portal-error {
  color: #ff9f9a;
}

.window-shell-enter-active {
  transition:
    opacity 180ms ease-out,
    transform 220ms cubic-bezier(0.2, 0.7, 0.2, 1);
}

.window-shell-leave-active {
  transition:
    opacity 140ms ease-in,
    transform 140ms ease-in;
}

.mac-window.window-shell-enter-from,
.mac-window.window-shell-leave-to {
  opacity: 0;
  transform: translate(-50%, calc(-50% + 6px)) scale(0.98);
}

.mac-window.is-positioned.window-shell-enter-from,
.mac-window.is-positioned.window-shell-leave-to {
  transform: translateY(6px) scale(0.98);
}

.mac-window.is-positioned.is-minimizing.window-shell-leave-to,
.mac-window.is-positioned.is-restoring.window-shell-enter-from {
  opacity: 0;
  transform: translate3d(var(--window-dock-x), var(--window-dock-y), 0) scale(var(--window-dock-scale));
}

.mac-window.is-minimizing.window-shell-leave-active,
.mac-window.is-restoring.window-shell-enter-active {
  transition: opacity 220ms ease, transform 250ms cubic-bezier(0.2, 0.7, 0.2, 1);
}

.spotlight-overlay,
.launchpad-overlay {
  position: absolute;
  inset: 0;
}

.spotlight-overlay {
  z-index: 40;
  background:
    radial-gradient(
      ellipse 700px 500px at 50% 18%,
      rgba(4, 9, 18, 0.32),
      rgba(4, 9, 18, 0.08) 62%,
      transparent 82%
    );
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}

.spotlight-panel {
  position: absolute;
  top: clamp(72px, 14vh, 118px);
  left: 50%;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  width: min(680px, calc(100vw - 32px));
  max-height: min(590px, calc(100dvh - 150px));
  overflow: hidden;
  border: 0.5px solid rgba(255, 255, 255, 0.2);
  border-radius: 22px;
  color: var(--portal-text-primary);
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.065), rgba(0, 0, 0, 0.04)),
    rgba(31, 33, 39, 0.8);
  box-shadow:
    inset 0 0.5px 0 rgba(255, 255, 255, 0.24),
    inset 0 -0.5px 0 rgba(0, 0, 0, 0.18),
    0 34px 96px rgba(0, 0, 0, 0.42),
    0 10px 28px rgba(0, 0, 0, 0.26);
  transform: translateX(-50%);
  -webkit-backdrop-filter: saturate(165%) blur(24px);
  backdrop-filter: saturate(165%) blur(24px);
}

.spotlight-close {
  display: none;
}

.spotlight-search {
  position: relative;
  min-height: 60px;
  padding: 0 18px;
  border: 0;
  border-radius: 0;
  border-bottom: 0.5px solid var(--portal-hairline);
  background: rgba(5, 8, 14, 0.13);
  box-shadow: none;
}

.spotlight-magnifier::before {
  border-color: var(--portal-text-secondary);
}

.spotlight-magnifier::after {
  background: var(--portal-text-secondary);
}

.spotlight-input {
  color: var(--portal-text-primary);
  font-size: clamp(19px, 3vw, 22px);
  font-weight: var(--portal-fw-regular);
}

.spotlight-input::placeholder {
  color: var(--portal-text-tertiary);
}

.spotlight-results {
  min-height: 0;
  max-height: 448px;
  padding: 6px 7px 10px;
  overflow-y: auto;
  border: 0;
  border-radius: 0;
  background: rgba(18, 20, 25, 0.62);
  box-shadow: none;
  overscroll-behavior: contain;
}

.spotlight-group {
  display: grid;
}

.spotlight-group + .spotlight-group {
  margin-top: 2px;
}

.spotlight-group h2 {
  margin: 0;
  padding: 9px 10px 6px;
  color: var(--portal-text-tertiary);
  font-size: 11px;
  font-weight: var(--portal-fw-semibold);
  letter-spacing: 0.035em;
  text-transform: none;
}

.spotlight-result {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) auto;
  width: 100%;
  min-height: 44px;
  padding: 4px 10px;
  border: 0;
  border-radius: 10px;
  color: var(--portal-text-primary);
  background: transparent;
  font: inherit;
  text-align: left;
  cursor: pointer;
  box-shadow: none;
  transition:
    background-color 150ms cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1),
    transform 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.spotlight-result:hover,
.spotlight-result:focus-visible {
  background: rgba(255, 255, 255, 0.075);
}

.spotlight-result.is-selected {
  background: rgba(10, 132, 255, 0.68);
  box-shadow:
    inset 0 0.5px 0 rgba(255, 255, 255, 0.22),
    0 3px 12px rgba(0, 74, 155, 0.18);
}

.spotlight-result-icon {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 0;
  border-radius: 9px;
  color: var(--portal-text-secondary);
  background: rgba(255, 255, 255, 0.085);
  box-shadow: none;
}

.spotlight-result.is-selected .spotlight-result-icon {
  color: rgba(255, 255, 255, 0.94);
  border-color: rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.14);
}

.spotlight-result-icon svg {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.45;
}

.spotlight-result-copy {
  gap: 1px;
}

.spotlight-result-copy strong {
  color: var(--portal-text-primary);
  font-size: 13px;
  font-weight: var(--portal-fw-medium);
}

.spotlight-result-copy small {
  color: var(--portal-text-secondary);
  font-size: 11px;
}

.spotlight-result-category {
  max-width: 120px;
  overflow: hidden;
  padding: 0;
  border: 0;
  border-radius: 0;
  color: var(--portal-text-secondary);
  background: transparent;
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spotlight-result-meta {
  display: flex;
  align-items: center;
  gap: 7px;
}

.spotlight-result-open {
  color: var(--portal-text-tertiary);
  font-size: 14px;
  line-height: 1;
}

.spotlight-result.is-selected .spotlight-result-category {
  color: rgba(255, 255, 255, 0.82);
  background: transparent;
}

.spotlight-result.is-selected .spotlight-result-open {
  color: rgba(255, 255, 255, 0.82);
}

.spotlight-empty {
  color: var(--portal-text-secondary);
}

.spotlight-footer {
  display: flex;
  min-height: 38px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 14px;
  border-top: 0.5px solid var(--portal-hairline);
  color: var(--portal-text-tertiary);
  background: rgba(14, 16, 21, 0.72);
  font-size: 11px;
}

.spotlight-help {
  display: flex;
  align-items: center;
  gap: 5px;
}

.spotlight-help kbd {
  display: inline-grid;
  min-width: 19px;
  height: 19px;
  padding: 0 4px;
  place-items: center;
  border: 0.5px solid rgba(255, 255, 255, 0.14);
  border-radius: 5px;
  color: var(--portal-text-secondary);
  background: rgba(255, 255, 255, 0.065);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);
  font-family: inherit;
  font-size: 10px;
  line-height: 1;
}

.spotlight-shell-enter-active {
  transition: opacity 190ms ease-out;
}

.spotlight-shell-leave-active {
  transition: opacity 150ms ease-in;
}

.spotlight-shell-enter-active .spotlight-panel {
  transition: transform 200ms cubic-bezier(0.32, 0.72, 0, 1);
}

.spotlight-shell-leave-active .spotlight-panel {
  transition: transform 140ms ease-in;
}

.spotlight-shell-enter-from,
.spotlight-shell-leave-to {
  opacity: 0;
}

.spotlight-shell-enter-from .spotlight-panel,
.spotlight-shell-leave-to .spotlight-panel {
  transform: translateX(-50%) scale(0.97);
  width: min(640px, calc(100vw - 32px));
}

.launchpad-overlay {
  z-index: 34;
  overflow: hidden;
  color: var(--portal-text-primary);
  background: rgba(9, 12, 18, 0.22);
  -webkit-backdrop-filter: blur(24px) brightness(0.76) saturate(130%);
  backdrop-filter: blur(24px) brightness(0.76) saturate(130%);
}

.launchpad-panel {
  position: absolute;
  inset: 26px 0 0;
  overflow-y: auto;
  padding: 44px clamp(32px, 7vw, 110px) 118px;
}

.launchpad-close {
  position: fixed;
  top: 38px;
  right: 24px;
  display: grid;
  width: 34px;
  height: 34px;
  padding: 0;
  place-items: center;
  border: 0.5px solid rgba(255, 255, 255, 0.18);
  border-radius: 50%;
  color: var(--portal-text-secondary);
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.015)),
    rgba(22, 25, 31, 0.38);
  font: inherit;
  font-size: 20px;
  cursor: pointer;
}

.launchpad-search {
  display: grid;
  grid-template-columns: auto 1fr;
  width: min(300px, 72vw);
  min-height: 36px;
  align-items: center;
  gap: 8px;
  margin: 0 auto 38px;
  padding: 0 10px;
  border: 0.5px solid rgba(255, 255, 255, 0.18);
  border-radius: 999px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.08), transparent),
    rgba(18, 21, 27, 0.38);
  box-shadow:
    inset 0 0.5px 0 rgba(255, 255, 255, 0.16),
    0 8px 24px rgba(0, 0, 0, 0.12);
}

.launchpad-search .spotlight-magnifier {
  width: 15px;
  height: 15px;
  transform: scale(0.78);
}

.launchpad-search input {
  width: 100%;
  min-width: 0;
  padding: 0;
  border: 0;
  color: var(--portal-text-primary);
  background: transparent;
  font: inherit;
  font-size: 14px;
  font-weight: var(--portal-fw-regular);
  outline: none;
}

.launchpad-search input::placeholder {
  color: var(--portal-text-tertiary);
}

.launchpad-search:focus-within {
  border-color: rgba(10, 132, 255, 0.82);
  box-shadow:
    0 0 0 2px rgba(10, 132, 255, 0.7),
    0 0 0 4px rgba(255, 255, 255, 0.14),
    inset 0 0.5px 0 rgba(255, 255, 255, 0.16),
    0 8px 24px rgba(0, 0, 0, 0.12);
}

.launchpad-search input:focus-visible {
  outline: none;
}

.launchpad-groups {
  display: grid;
  gap: 34px;
  max-width: 1180px;
  margin: 0 auto;
}

.link-group {
  gap: 16px;
}

.link-group h2 {
  color: var(--portal-text-secondary);
  font-size: 13px;
  font-weight: var(--portal-fw-medium);
  letter-spacing: 0;
  text-transform: none;
}

.launchpad-grid {
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 30px 20px;
}

.launchpad-tile {
  min-height: 92px;
  gap: 8px;
  padding: 0;
  border-radius: 10px;
  color: var(--portal-text-primary);
  background: transparent;
  transition: transform 180ms cubic-bezier(0.4, 0, 0.2, 1);
}

.launchpad-tile:hover,
.launchpad-tile:focus-visible {
  background: transparent;
  transform: scale(1.025);
}

.launchpad-tile img {
  width: 72px;
  height: 72px;
  border-radius: var(--portal-radius-icon);
  object-fit: cover;
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.26);
}

.launchpad-tile span {
  color: var(--portal-text-primary);
  font-size: 12px;
  font-weight: var(--portal-fw-regular);
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.48);
}

.launchpad-empty {
  margin: 8vh 0 0;
  color: var(--portal-text-secondary);
  text-align: center;
}

.launchpad-shell-enter-active {
  transition: opacity 210ms ease-out;
}

.launchpad-shell-leave-active {
  transition: opacity 160ms ease-in;
}

.launchpad-shell-enter-active .launchpad-panel {
  transition: transform 220ms cubic-bezier(0.32, 0.72, 0, 1);
}

.launchpad-shell-leave-active .launchpad-panel {
  transition: transform 150ms ease-in;
}

.launchpad-shell-enter-from,
.launchpad-shell-leave-to {
  opacity: 0;
}

.launchpad-shell-enter-from .launchpad-panel,
.launchpad-shell-leave-to .launchpad-panel {
  transform: scale(1.015);
}

.bottom-launcher {
  bottom: max(12px, env(safe-area-inset-bottom));
  gap: 3px;
  padding: 6px 10px;
  overflow: visible;
  border: 0.5px solid rgba(255, 255, 255, 0.22);
  border-radius: 19px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.012)),
    var(--portal-material-dock);
  box-shadow:
    inset 0 0.5px 0 rgba(255, 255, 255, 0.32),
    inset 0 -0.5px 0 rgba(0, 0, 0, 0.22),
    0 18px 50px rgba(0, 0, 0, 0.26);
  -webkit-backdrop-filter: saturate(175%) blur(24px);
  backdrop-filter: saturate(175%) blur(24px);
}

.launcher-item {
  --dock-scale: 1;
  --dock-shift: 0px;
  --dock-lift: 0px;
  display: flex;
  width: 46px;
  height: 52px;
  align-items: end;
  justify-content: center;
  overflow: visible;
  color: var(--portal-text-primary);
  transform:
    translateX(var(--dock-shift))
    translateY(var(--dock-lift));
  transition: none;
  will-change: transform;
}

.bottom-launcher.is-settling .launcher-item {
  transition: transform 240ms var(--portal-spring-settle);
}

.launcher-item:hover,
.launcher-item:focus-visible {
  z-index: 2;
  outline: none;
}

.launcher-item img {
  width: 44px;
  height: 44px;
  border: 0.5px solid rgba(255, 255, 255, 0.12);
  border-radius: var(--portal-radius-icon);
  object-fit: cover;
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.27);
  transform: scale(var(--dock-scale));
  transform-origin: center bottom;
  transition: none;
  will-change: transform;
}

.bottom-launcher.is-settling .launcher-item img {
  transition: transform 240ms var(--portal-spring-settle);
}

.launcher-item .launcher-tooltip {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  display: block;
  max-width: min(240px, calc(100vw - 24px));
  padding: 5px 9px;
  overflow: visible;
  border: 0.5px solid var(--portal-hairline);
  border-radius: 6px;
  color: var(--portal-text-primary);
  background: rgba(33, 35, 41, 0.78);
  font-size: 12px;
  font-weight: var(--portal-fw-regular);
  line-height: 1.2;
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, 5px);
  transition:
    opacity 120ms ease-in,
    transform 120ms ease-in;
  white-space: nowrap;
  -webkit-backdrop-filter: blur(18px);
  backdrop-filter: blur(18px);
  width: max-content;
  text-overflow: clip;
  box-sizing: border-box;
}

.launcher-tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  width: 7px;
  height: 7px;
  border-right: 0.5px solid var(--portal-hairline);
  border-bottom: 0.5px solid var(--portal-hairline);
  background: rgba(33, 35, 41, 0.78);
  transform: translate(-50%, -4px) rotate(45deg);
}

.launcher-item:hover .launcher-tooltip,
.launcher-item:focus-visible .launcher-tooltip {
  opacity: 1;
  transform: translate(-50%, 0);
  transition-timing-function: ease-out;
  transition-delay: 280ms;
}

.launcher-item:focus-visible .launcher-tooltip {
  transition-delay: 0ms;
}

.launcher-item img.portal-app-icon {
  padding: 9px;
  object-fit: contain;
  border-color: rgba(255, 255, 255, 0.5);
  background: linear-gradient(160deg, #f8fafc, #d5dce7);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.75), 0 5px 12px rgba(0, 0, 0, 0.18);
}

.launcher-item[data-app-id='music'] .portal-app-icon {
  background: linear-gradient(160deg, #ffe3e9, #ed9fb2);
}

.launcher-item[data-app-id='weather'] .portal-app-icon {
  background: linear-gradient(160deg, #e3f4ff, #9bcaec);
}

.launcher-item[data-app-id='calendar'] .portal-app-icon {
  background: linear-gradient(160deg, #fff7ef, #eccaba);
}

.launcher-item[data-app-id='dock'] .portal-app-icon {
  background: linear-gradient(160deg, #e9e9ff, #bebee9);
}

.launcher-item:active img {
  transform: translateY(var(--dock-lift)) scale(calc(var(--dock-scale) * 0.94));
  transition-duration: 80ms;
}

.launcher-item.is-running::after,
.launcher-item.is-active::after {
  content: '';
  position: absolute;
  bottom: 1px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.72);
}

.launcher-divider {
  height: 40px;
  margin: 0 3px;
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 1px 0 0 rgba(0, 0, 0, 0.18);
}

.minimized-window-preview img {
  border-radius: 7px;
  filter: saturate(0.76) brightness(0.92);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.18),
    0 8px 20px rgba(0, 0, 0, 0.32);
}

/* Shared shell glass */
.spotlight-panel,
.bottom-launcher,
.launchpad-search,
.launchpad-close {
  border-color: var(--lg-border);
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.065), rgba(0, 0, 0, 0.045)),
    var(--lg-shell-fill);
  box-shadow:
    var(--lg-edge-high),
    var(--lg-edge-low),
    0 24px 68px rgba(0, 0, 0, 0.25);
  -webkit-backdrop-filter: saturate(170%) blur(22px);
  backdrop-filter: saturate(170%) blur(22px);
}

.window-titlebar {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.105), rgba(255, 255, 255, 0.018)),
    rgba(18, 24, 33, 0.18);
  box-shadow:
    inset 0 0.5px 0 rgba(255, 255, 255, 0.2),
    inset 0 -0.5px 0 rgba(0, 0, 0, 0.16);
}

.window-body,
.spotlight-search,
.spotlight-results,
.spotlight-footer,
.launchpad-groups,
:deep(.aplayer),
.widget-shell :deep(.weather-container),
.widget-shell :deep(.calendar),
.widget-shell :deep(.calendar-container),
.todo-shell :deep(.todo-list-container),
.todo-shell :deep(.todo-container) {
  border-color: var(--lg-border-soft);
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.045), rgba(0, 0, 0, 0.025)),
    var(--lg-pane-fill);
  box-shadow:
    var(--lg-edge-high),
    var(--lg-edge-low);
  -webkit-backdrop-filter: var(--lg-pane-filter);
  backdrop-filter: var(--lg-pane-filter);
}

.window-body {
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.035), rgba(0, 0, 0, 0.035)),
    var(--lg-pane-fill-strong);
  box-shadow:
    inset 0 0.5px 0 rgba(255, 255, 255, 0.16),
    inset 0 0 0 0.5px rgba(255, 255, 255, 0.04);
}

.mac-window.is-receded :is(.window-titlebar, .window-body) {
  filter: saturate(0.72) brightness(0.82);
  opacity: 0.56;
}

.menu-home-link:hover,
.menu-home-link:focus-visible,
.menu-glyph-button:hover,
.menu-glyph-button.is-active,
.menu-command:hover,
.menu-command:focus-visible,
.menu-command.is-active,
.menu-status-action:hover,
.menu-status-action:focus-visible,
.menu-clock-action:hover,
.menu-clock-action:focus-visible,
.menu-clock-action.is-active {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.055)),
    var(--lg-control-fill);
  box-shadow:
    inset 0 0.5px 0 rgba(255, 255, 255, 0.3),
    inset 0 -0.5px 0 rgba(0, 0, 0, 0.16);
  -webkit-backdrop-filter: var(--lg-control-filter);
  backdrop-filter: var(--lg-control-filter);
}

/* Weather */
.weather-shell :deep(.weather-container) {
  overflow: hidden;
  padding: 12px;
  border-width: 0.5px;
  border-style: solid;
  border-radius: 12px;
}

.weather-shell :deep(.weather-content) {
  display: grid;
  grid-template-rows: auto auto;
  align-content: start;
  gap: 10px;
}

.weather-shell :deep(.summary-text) {
  margin: 0;
  padding: 16px 18px;
  border: 0.5px solid var(--lg-border-soft);
  border-radius: 13px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02)),
    rgba(8, 14, 22, 0.22);
  box-shadow:
    inset 0 0.5px 0 rgba(255, 255, 255, 0.22),
    inset 0 -0.5px 0 rgba(0, 0, 0, 0.2);
  line-height: 1.48;
}

.weather-shell :deep(.highlight-city),
.weather-shell :deep(.highlight-desc) {
  color: rgba(255, 255, 255, 0.96);
  font-weight: 600;
}

.weather-shell :deep(.highlight-temp) {
  display: inline-flex;
  min-height: 34px;
  align-items: center;
  margin-left: 5px;
  padding: 0 3px;
  border: 0;
  border-radius: 0;
  color: var(--portal-text-primary);
  background:
    linear-gradient(145deg, rgba(102, 187, 255, 0.22), rgba(10, 132, 255, 0.08)),
    var(--lg-control-fill);
  box-shadow:
    inset 0 0.5px 0 rgba(255, 255, 255, 0.28),
    0 4px 18px rgba(0, 88, 175, 0.12);
  font-size: 32px;
  font-weight: 500;
  background: transparent;
  box-shadow: none;
}

.weather-shell :deep(.details-list) {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin: 0;
  padding: 0;
}

.weather-shell :deep(.details-list li) {
  display: grid;
  min-height: 46px;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 0.5px solid var(--lg-border-soft);
  border-radius: 12px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.065), rgba(255, 255, 255, 0.018)),
    rgba(8, 14, 22, 0.18);
  box-shadow: inset 0 0.5px 0 rgba(255, 255, 255, 0.15);
  transition:
    background-color 180ms cubic-bezier(0.4, 0, 0.2, 1),
    border-color 180ms cubic-bezier(0.4, 0, 0.2, 1),
    transform 180ms cubic-bezier(0.4, 0, 0.2, 1);
}

.weather-shell :deep(.details-list li:last-child) {
  grid-column: 1 / -1;
}

.weather-shell :deep(.details-list li:hover) {
  border-color: var(--lg-border);
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.105), rgba(255, 255, 255, 0.025)),
    rgba(8, 14, 22, 0.22);
  transform: translateY(-1px);
}

.weather-shell :deep(.bullet) {
  width: 7px;
  height: 7px;
  overflow: hidden;
  border: 0.5px solid rgba(184, 225, 255, 0.62);
  border-radius: 50%;
  color: transparent;
  background: rgba(101, 195, 255, 0.84);
  box-shadow: 0 0 10px rgba(87, 181, 255, 0.38);
}

.weather-shell :deep(.detail-value) {
  padding: 3px 8px;
  border: 0.5px solid var(--lg-border-soft);
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.9);
  background: var(--lg-control-fill);
  box-shadow: inset 0 0.5px 0 rgba(255, 255, 255, 0.16);
}

/* Calendar */
.calendar-shell :deep(.calendar) {
  padding: 12px;
  border-width: 0.5px;
  border-style: solid;
  border-radius: 12px;
}

.calendar-shell :deep(.calendar-header) {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) 32px auto auto;
  align-items: center;
  gap: 7px;
  margin-bottom: 9px;
  padding: 6px;
  border: 0.5px solid var(--lg-border-soft);
  border-radius: 12px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.018)),
    rgba(8, 14, 22, 0.18);
  box-shadow:
    inset 0 0.5px 0 rgba(255, 255, 255, 0.18),
    inset 0 -0.5px 0 rgba(0, 0, 0, 0.16);
}

.calendar-shell :deep(.month-title),
.calendar-shell :deep(.nav-btn),
.calendar-shell :deep(.today-btn),
.calendar-shell :deep(.mark-btn),
.calendar-shell :deep(.red-pill) {
  border: 0.5px solid var(--lg-border-soft);
  color: var(--portal-text-primary);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.025)),
    var(--lg-control-fill);
  box-shadow:
    inset 0 0.5px 0 rgba(255, 255, 255, 0.24),
    inset 0 -0.5px 0 rgba(0, 0, 0, 0.15);
  -webkit-backdrop-filter: var(--lg-control-filter);
  backdrop-filter: var(--lg-control-filter);
}

.calendar-shell :deep(.month-title) {
  min-width: 0;
  height: 32px;
  border-radius: 9px;
  line-height: 31px;
  text-align: center;
}

.calendar-shell :deep(.nav-btn) {
  width: 32px;
  height: 32px;
  border-radius: 10px;
}

.calendar-shell :deep(.today-btn),
.calendar-shell :deep(.mark-btn) {
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
}


.calendar-shell :deep(.nav-btn)::before {
  content: '';
  display: block;
  width: 14px;
  height: 14px;
  background: currentColor;
  -webkit-mask: url('/portal-icons/chevron-left.svg') center / contain no-repeat;
  mask: url('/portal-icons/chevron-left.svg') center / contain no-repeat;
}

.calendar-shell :deep(.nav-btn[aria-label='Next month'])::before {
  -webkit-mask-image: url('/portal-icons/chevron-right.svg');
  mask-image: url('/portal-icons/chevron-right.svg');
}

.calendar-shell :deep(.today-btn) {
  min-height: 28px;
  height: 28px;
  padding: 0 9px;
  border: 0.5px solid rgba(255, 255, 255, 0.14);
  border-radius: 7px;
  color: var(--portal-text-primary);
  background: rgba(255, 255, 255, 0.08);
  font-size: 12px;
  font-weight: 500;
}

.calendar-shell :deep(.mark-btn) {
  border-color: rgba(117, 181, 255, 0.55);
  color: #fff;
  background: #087cf0;
  min-height: 28px;
  height: 28px;
  padding: 0 9px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 500;
}

.calendar-shell :deep(.calendar-grid) {
  padding: 8px;
  border: 0.5px solid rgba(255, 255, 255, 0.09);
  border-radius: 12px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.035), transparent),
    rgba(5, 10, 17, 0.12);
}

.calendar-shell :deep(.calendar-day) {
  color: var(--portal-text-secondary);
  font-weight: 500;
  font-size: 12px;
}

.calendar-shell :deep(.calendar-cell) {
  min-height: 32px;
  border: 0.5px solid transparent;
  border-radius: 50%;
  color: var(--portal-text-primary);
  background: transparent;
  transition:
    color 150ms cubic-bezier(0.4, 0, 0.2, 1),
    background-color 150ms cubic-bezier(0.4, 0, 0.2, 1),
    border-color 150ms cubic-bezier(0.4, 0, 0.2, 1),
    transform 180ms var(--portal-spring-settle);
  width: 32px;
  height: 32px;
  padding: 0;
  box-sizing: border-box;
  justify-self: center;
  align-self: center;
  font-size: 13px;
  font-weight: 500;
}

.calendar-shell :deep(.calendar-cell:hover),
.calendar-shell :deep(.calendar-cell:focus-visible) {
  border-color: var(--lg-border);
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.13), rgba(255, 255, 255, 0.035)),
    var(--lg-control-fill);
  transform: none;
}

.calendar-shell :deep(.calendar-cell.is-red) {
  border-color: rgba(243, 139, 168, 0.45);
  color: #f38ba8;
  background: rgba(243, 139, 168, 0.1);
}

.calendar-shell :deep(.calendar-cell.selected:not(.today)) {
  border-color: #0a84ff;
  color: #fff;
  background: #0a84ff;
  box-shadow: none;
}

.calendar-shell :deep(.calendar-cell.today) {
  border-color: rgba(255, 112, 105, 0.5);
  color: #ffb3ae;
  background: rgba(255, 99, 91, 0.14);
  box-shadow: none;
}


.calendar-shell :deep(.calendar-cell:focus-visible) {
  outline: 2px solid var(--portal-text-accent);
  outline-offset: 2px;
}

.calendar-shell :deep(.calendar-cell.is-red.selected) {
  box-shadow: inset 0 -2px 0 #ff9c98;
}

.calendar-shell :deep(.calendar-cell.out-this-month) {
  color: var(--portal-text-tertiary);
}

.calendar-shell :deep(.red-dates) {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 0.5px solid var(--lg-border-soft);
}

.calendar-shell :deep(.red-pill) {
  border-color: rgba(243, 139, 168, 0.55);
  color: #f38ba8;
  background: rgba(243, 139, 168, 0.08);
}

/* TODO */
.todo-overview {
  padding: 12px 14px;
  border: 0.5px solid var(--lg-border-soft);
  border-radius: 14px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.065), rgba(255, 255, 255, 0.018)),
    rgba(8, 14, 22, 0.16);
  box-shadow:
    inset 0 0.5px 0 rgba(255, 255, 255, 0.2),
    inset 0 -0.5px 0 rgba(0, 0, 0, 0.18);
}

.todo-overview-mark {
  border-color: var(--lg-border);
  color: #9ed5ff;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.025)),
    var(--lg-control-fill);
  box-shadow:
    inset 0 0.5px 0 rgba(255, 255, 255, 0.28),
    inset 0 -0.5px 0 rgba(0, 0, 0, 0.16);
  -webkit-backdrop-filter: var(--lg-control-filter);
  backdrop-filter: var(--lg-control-filter);
}

.todo-shell :deep(.todo-list-container),
.todo-shell :deep(.todo-container) {
  border-color: var(--lg-border-soft);
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.05), rgba(0, 0, 0, 0.025)),
    rgba(7, 12, 20, 0.2);
  box-shadow:
    var(--lg-edge-high),
    var(--lg-edge-low);
}

.todo-shell :deep(.mode-switch),
.todo-shell :deep(.input-section),
.todo-shell :deep(.current-day-chip),
.todo-shell :deep(.add-button) {
  border-color: var(--lg-border-soft);
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.02)),
    var(--lg-control-fill);
  box-shadow:
    inset 0 0.5px 0 rgba(255, 255, 255, 0.22),
    inset 0 -0.5px 0 rgba(0, 0, 0, 0.17);
  -webkit-backdrop-filter: var(--lg-control-filter);
  backdrop-filter: var(--lg-control-filter);
}

.todo-shell :deep(.mode-btn.active) {
  border-color: var(--lg-border);
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.055)),
    var(--lg-control-fill);
}

.todo-shell :deep(.task-input) {
  background: rgba(5, 10, 17, 0.16);
  box-shadow: none;
  min-height: 34px;
  font-size: 13px;
}

.todo-shell :deep(.add-button) {
  border: 0.5px solid rgba(136, 206, 255, 0.5);
  color: white;
  background:
    linear-gradient(145deg, rgba(89, 185, 255, 0.92), rgba(9, 106, 211, 0.78)),
    rgba(10, 132, 255, 0.56);
  width: 32px;
  height: 32px;
  font-size: 22px;
  border-radius: 8px;
}

.todo-shell :deep(.task-list:empty) {
  border-style: solid;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.035), transparent),
    rgba(5, 10, 17, 0.1);
}

.todo-shell :deep(.task-item) {
  border-color: var(--lg-border-soft);
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.018)),
    rgba(8, 14, 22, 0.16);
  box-shadow: inset 0 0.5px 0 rgba(255, 255, 255, 0.14);
}

.todo-shell :deep(.task-item:hover) {
  border-color: var(--lg-border);
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.03)),
    rgba(8, 14, 22, 0.2);
}

/* Music */
:deep(.aplayer) {
  border-color: var(--lg-border);
  border-radius: 12px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.055), rgba(0, 0, 0, 0.025)),
    rgba(7, 12, 20, 0.2);
}

:deep(.aplayer-info) {
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.06), transparent),
    rgba(8, 14, 22, 0.14);
}

:deep(.aplayer-music .aplayer-title),
:deep(.aplayer-list-title) {
  color: rgba(255, 255, 255, 0.88) !important;
}

:deep(.aplayer-music .aplayer-author),
:deep(.aplayer-list-author) {
  color: var(--portal-text-secondary) !important;
  opacity: 1 !important;
}

:deep(.aplayer-list-index) {
  color: var(--portal-text-tertiary) !important;
}

:deep(.aplayer-list) {
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.025), transparent),
    rgba(4, 9, 16, 0.18);
  -webkit-backdrop-filter: var(--lg-pane-filter);
  backdrop-filter: var(--lg-pane-filter);
}

:deep(.aplayer-button) {
  border-radius: 50%;
  background: var(--lg-control-fill);
  box-shadow: inset 0 0.5px 0 rgba(255, 255, 255, 0.2);
}

:deep(.aplayer .aplayer-controller .aplayer-bar-wrap .aplayer-played),
:deep(.aplayer .aplayer-volume-bar-wrap .aplayer-volume) {
  background: var(--portal-text-accent) !important;
}

/* Spotlight */
.spotlight-search {
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.018)),
    rgba(8, 14, 22, 0.2);
}

.spotlight-results {
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.035), rgba(0, 0, 0, 0.025)),
    rgba(7, 12, 20, 0.3);
}

.spotlight-footer {
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.014)),
    rgba(7, 12, 20, 0.3);
}

.spotlight-result:hover,
.spotlight-result:focus-visible {
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.13), rgba(255, 255, 255, 0.035)),
    var(--lg-control-fill);
  box-shadow: inset 0 0.5px 0 rgba(255, 255, 255, 0.2);
}

.spotlight-result.is-selected {
  background:
    linear-gradient(145deg, rgba(73, 171, 255, 0.8), rgba(7, 100, 205, 0.58)),
    rgba(10, 132, 255, 0.46);
  box-shadow:
    inset 0 0.5px 0 rgba(255, 255, 255, 0.34),
    inset 0 -0.5px 0 rgba(0, 42, 93, 0.22),
    0 6px 18px rgba(0, 72, 150, 0.16);
}

.spotlight-result-icon,
.spotlight-help kbd {
  border: 0.5px solid var(--lg-border-soft);
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.025)),
    var(--lg-control-fill);
  box-shadow:
    inset 0 0.5px 0 rgba(255, 255, 255, 0.2),
    inset 0 -0.5px 0 rgba(0, 0, 0, 0.14);
}

/* Launchpad */
.launchpad-overlay {
  background:
    radial-gradient(circle at 50% 38%, rgba(255, 255, 255, 0.055), transparent 42rem),
    rgba(7, 12, 20, 0.16);
  -webkit-backdrop-filter: blur(18px) brightness(0.78) saturate(145%);
  backdrop-filter: blur(18px) brightness(0.78) saturate(145%);
}

.launchpad-groups {
  padding: 24px;
  border: 0.5px solid var(--lg-border-soft);
  border-radius: 28px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.045), rgba(0, 0, 0, 0.02)),
    rgba(8, 14, 22, 0.18);
  box-shadow:
    var(--lg-edge-high),
    var(--lg-edge-low),
    0 24px 64px rgba(0, 0, 0, 0.12);
}

.link-group + .link-group {
  padding-top: 24px;
  border-top: 0.5px solid var(--lg-border-soft);
}

.launchpad-tile {
  position: relative;
  isolation: isolate;
}

.launchpad-tile::before {
  content: '';
  position: absolute;
  inset: -8px -4px;
  z-index: -1;
  border: 0.5px solid transparent;
  border-radius: 18px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.13), rgba(255, 255, 255, 0.025)),
    var(--lg-control-fill);
  box-shadow:
    inset 0 0.5px 0 rgba(255, 255, 255, 0.22),
    0 10px 28px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transform: scale(0.92);
  transition:
    opacity 160ms ease-out,
    transform 220ms var(--portal-spring-settle),
    border-color 160ms cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-backdrop-filter: var(--lg-control-filter);
  backdrop-filter: var(--lg-control-filter);
}

.launchpad-tile:hover::before,
.launchpad-tile:focus-visible::before {
  border-color: var(--lg-border);
  opacity: 1;
  transform: scale(1);
}

.launcher-tooltip,
.launcher-tooltip::after {
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.13), rgba(255, 255, 255, 0.025)),
    rgba(15, 21, 30, 0.54);
  -webkit-backdrop-filter: var(--lg-control-filter);
  backdrop-filter: var(--lg-control-filter);
}

/* Optical Liquid Glass pass
 * The hidden SVG filters use rounded-rectangle SDF displacement maps generated
 * once at mount. Only the backing layer is refracted; UI content remains sharp.
 */
.liquid-filter-defs {
  position: fixed;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  overflow: hidden;
  pointer-events: none;
}

.liquid-surface {
  --lg-surface-radius: inherit;
  --lg-refraction: blur(0);
  isolation: isolate;
}

.launchpad-search.liquid-surface,
.launchpad-groups.liquid-surface {
  position: relative;
}

.liquid-surface::before,
.liquid-surface::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: var(--lg-surface-radius);
  pointer-events: none;
}

.liquid-surface::before {
  z-index: 0;
  overflow: hidden;
  background:
    radial-gradient(
      ellipse 190px 130px at var(--lg-light-x) var(--lg-light-y),
      rgb(255 255 255 / var(--lg-light-strength)),
      rgba(255, 255, 255, 0.028) 35%,
      transparent 72%
    ),
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.115) 0%,
      rgba(255, 255, 255, 0.018) 42%,
      rgba(4, 10, 18, 0.12) 100%
    ),
    var(--lg-optical-tint);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.28),
    inset 0 -1px 0 rgba(0, 0, 0, 0.24),
    inset 1px 0 0 rgba(255, 114, 158, 0.035),
    inset -1px 0 0 rgba(92, 170, 255, 0.045);
  -webkit-backdrop-filter:
    var(--lg-refraction)
    blur(13px)
    saturate(178%)
    brightness(1.03);
  backdrop-filter:
    var(--lg-refraction)
    blur(13px)
    saturate(178%)
    brightness(1.03);
}

.has-liquid-optics .liquid-surface[data-liquid-kind='window']::before {
  --lg-refraction: url('#portal-liquid-window');
}

.has-liquid-optics .liquid-surface[data-liquid-kind='panel']::before {
  --lg-refraction: url('#portal-liquid-panel');
}

.has-liquid-optics .liquid-surface[data-liquid-kind='dock']::before {
  --lg-refraction: url('#portal-liquid-dock');
}

.has-liquid-optics .liquid-surface[data-liquid-kind='strip']::before {
  --lg-refraction: url('#portal-liquid-strip');
}

.has-liquid-optics .liquid-surface[data-liquid-kind='search']::before {
  --lg-refraction: url('#portal-liquid-search');
}

.has-liquid-optics .liquid-surface[data-liquid-kind='circle']::before {
  --lg-refraction: url('#portal-liquid-circle');
}

.liquid-surface::after {
  z-index: 1;
  padding: 1px;
  background:
    radial-gradient(
      circle 170px at var(--lg-light-x) var(--lg-light-y),
      rgb(255 255 255 / calc(var(--lg-light-strength) + 0.12)),
      rgba(255, 255, 255, 0.055) 48%,
      transparent 74%
    ),
    linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.34),
      rgba(255, 255, 255, 0.07) 35%,
      rgba(255, 255, 255, 0.015) 62%,
      rgba(176, 213, 255, 0.16)
    );
  opacity: 0.92;
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  mask-composite: exclude;
}

.liquid-surface > * {
  position: relative;
  z-index: 2;
}

.portal-menu-bar.liquid-surface,
.spotlight-search.liquid-surface,
.launchpad-search.liquid-surface,
.launchpad-close.liquid-surface,
.launcher-tooltip.liquid-surface {
  color: var(--liquid-foreground, var(--portal-text-primary));
  text-shadow: var(
    --liquid-foreground-shadow,
    0 1px 2px rgba(0, 0, 0, 0.28)
  );
  transition:
    color 180ms cubic-bezier(0.4, 0, 0.2, 1),
    text-shadow 180ms cubic-bezier(0.4, 0, 0.2, 1);
}

.portal-menu-bar.liquid-surface :is(
  .menu-home-link,
  .menu-glyph-button,
  .menu-current-app,
  .menu-commands,
  .menu-command,
  .menu-status-glyph,
  .menu-status-action,
  .menu-clock,
  .menu-clock-action
) {
  color: inherit;
}

.spotlight-search.liquid-surface .spotlight-input,
.launchpad-search.liquid-surface input {
  color: inherit;
  text-shadow: inherit;
}

.spotlight-search.liquid-surface .spotlight-input::placeholder,
.launchpad-search.liquid-surface input::placeholder {
  color: var(--liquid-foreground-muted, var(--portal-text-tertiary));
  opacity: 1;
}

.portal-menu-bar.liquid-surface {
  --lg-surface-radius: 0;
  overflow: hidden;
  border-bottom-color: rgba(255, 255, 255, 0.2);
  background: transparent;
  box-shadow:
    0 1px 0 rgba(0, 0, 0, 0.16),
    0 5px 20px rgba(0, 0, 0, 0.09);
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}

.portal-menu-bar.liquid-surface::before {
  background:
    radial-gradient(
      ellipse 180px 52px at var(--lg-light-x) var(--lg-light-y),
      rgb(255 255 255 / var(--lg-light-strength)),
      transparent 72%
    ),
    linear-gradient(180deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0.025)),
    rgba(15, 25, 37, 0.32);
  -webkit-backdrop-filter:
    var(--lg-refraction)
    blur(18px)
    saturate(180%)
    brightness(0.98);
  backdrop-filter:
    var(--lg-refraction)
    blur(18px)
    saturate(180%)
    brightness(0.98);
}

.mac-window.liquid-surface,
.spotlight-panel.liquid-surface,
.launchpad-groups.liquid-surface,
.bottom-launcher.liquid-surface,
.spotlight-search.liquid-surface,
.launchpad-search.liquid-surface,
.launchpad-close.liquid-surface {
  background: transparent;
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}

.mac-window.liquid-surface {
  --lg-surface-radius: var(--portal-radius-window);
  border-color: rgba(255, 255, 255, 0.24);
  box-shadow:
    0 0 0 0.5px rgba(0, 0, 0, 0.32),
    0 34px 96px rgba(0, 0, 0, 0.34),
    0 10px 30px rgba(0, 0, 0, 0.2);
}

.mac-window.liquid-surface::before {
  background:
    radial-gradient(
      ellipse 240px 180px at var(--lg-light-x) var(--lg-light-y),
      rgb(255 255 255 / var(--lg-light-strength)),
      rgba(255, 255, 255, 0.018) 42%,
      transparent 74%
    ),
    linear-gradient(145deg, rgba(255, 255, 255, 0.095), rgba(4, 10, 18, 0.08)),
    var(--lg-optical-tint-strong);
  -webkit-backdrop-filter:
    var(--lg-refraction)
    blur(16px)
    saturate(168%)
    brightness(0.96);
  backdrop-filter:
    var(--lg-refraction)
    blur(16px)
    saturate(168%)
    brightness(0.96);
}

.window-titlebar {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.13), rgba(255, 255, 255, 0.018)),
    rgba(18, 25, 35, 0.2);
}

.window-body,
.window-todo .window-body,
.window-music .window-body {
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.025), rgba(0, 0, 0, 0.035)),
    rgba(10, 16, 25, 0.43);
  box-shadow:
    inset 0 0.5px 0 rgba(255, 255, 255, 0.11),
    inset 0 0 0 0.5px rgba(255, 255, 255, 0.025);
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}

.widget-shell :deep(.weather-container),
.widget-shell :deep(.calendar),
.widget-shell :deep(.calendar-container),
.todo-shell :deep(.todo-list-container),
.todo-shell :deep(.todo-container),
:deep(.aplayer),
:deep(.aplayer-list) {
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.035), rgba(0, 0, 0, 0.025)),
    rgba(9, 15, 24, 0.28);
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}

.spotlight-panel.liquid-surface {
  --lg-surface-radius: 18px;
  border-color: rgba(255, 255, 255, 0.25);
  box-shadow:
    0 0 0 0.5px rgba(0, 0, 0, 0.28),
    0 34px 90px rgba(0, 0, 0, 0.3);
}

.spotlight-results,
.spotlight-footer {
  background: rgba(9, 15, 24, 0.42);
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}

.spotlight-search.liquid-surface,
.launchpad-search.liquid-surface,
.launchpad-close.liquid-surface {
  --lg-surface-radius: 999px;
  border-color: rgba(255, 255, 255, 0.24);
  box-shadow:
    inset 0 0.5px 0 rgba(255, 255, 255, 0.22),
    0 8px 26px rgba(0, 0, 0, 0.12);
}

.spotlight-search.liquid-surface::before,
.launchpad-search.liquid-surface::before,
.launchpad-close.liquid-surface::before {
  background:
    radial-gradient(
      circle 90px at var(--lg-light-x) var(--lg-light-y),
      rgb(255 255 255 / var(--lg-light-strength)),
      transparent 72%
    ),
    linear-gradient(145deg, rgba(255, 255, 255, 0.13), rgba(255, 255, 255, 0.025)),
    rgba(20, 30, 43, 0.34);
  -webkit-backdrop-filter:
    var(--lg-refraction)
    blur(12px)
    saturate(180%);
  backdrop-filter:
    var(--lg-refraction)
    blur(12px)
    saturate(180%);
}

.launchpad-groups.liquid-surface {
  --lg-surface-radius: 28px;
  border-color: rgba(255, 255, 255, 0.19);
  box-shadow:
    0 0 0 0.5px rgba(0, 0, 0, 0.18),
    0 26px 70px rgba(0, 0, 0, 0.16);
}

.launchpad-groups.liquid-surface::before {
  background:
    radial-gradient(
      ellipse 260px 190px at var(--lg-light-x) var(--lg-light-y),
      rgb(255 255 255 / var(--lg-light-strength)),
      transparent 74%
    ),
    linear-gradient(145deg, rgba(255, 255, 255, 0.075), rgba(6, 12, 20, 0.075)),
    rgba(11, 20, 31, 0.28);
}

.bottom-launcher.liquid-surface {
  --lg-surface-radius: 24px;
  height: 65px;
  min-height: 0;
  box-sizing: border-box;
  align-items: center;
  gap: 3px;
  padding: 6px 10px;
  overflow: visible;
  border-color: rgba(255, 255, 255, 0.28);
  border-radius: var(--lg-surface-radius);
  box-shadow:
    0 0 0 0.5px rgba(0, 0, 0, 0.2),
    0 20px 55px rgba(0, 0, 0, 0.26);
}

.bottom-launcher.liquid-surface::before,
.bottom-launcher.liquid-surface::after {
  clip-path: inset(0 round var(--lg-surface-radius));
}

.bottom-launcher.liquid-surface::before {
  background:
    radial-gradient(
      ellipse 150px 72px at var(--lg-light-x) var(--lg-light-y),
      rgb(255 255 255 / var(--lg-light-strength)),
      rgba(255, 255, 255, 0.035) 44%,
      transparent 76%
    ),
    linear-gradient(145deg, rgba(255, 255, 255, 0.14), rgba(4, 10, 18, 0.08)),
    rgba(24, 32, 43, 0.27);
  -webkit-backdrop-filter:
    var(--lg-refraction)
    blur(17px)
    saturate(185%)
    brightness(1.03);
  backdrop-filter:
    var(--lg-refraction)
    blur(17px)
    saturate(185%)
    brightness(1.03);
}

.launcher-item {
  flex: 0 0 52px;
  display: grid;
  width: 52px;
  height: 52px;
  min-height: 0;
  grid-template-rows: 44px 8px;
  place-items: start center;
  align-content: center;
  gap: 0;
  box-sizing: border-box;
  transform: translateX(var(--dock-shift));
  transition: transform 130ms cubic-bezier(0.2, 0.7, 0.2, 1);
}

.launcher-item img {
  grid-row: 1;
  display: block;
  width: 44px;
  height: 44px;
  box-sizing: border-box;
  transform:
    translateY(var(--dock-lift))
    scale(var(--dock-scale));
  transform-origin: 50% 100%;
  transition: transform 130ms cubic-bezier(0.2, 0.7, 0.2, 1);
}

.launcher-item.is-running::after,
.launcher-item.is-active::after {
  left: 50%;
  bottom: 1px;
  width: 3px;
  height: 3px;
  z-index: 3;
  background: rgba(255, 255, 255, 0.74);
  box-shadow: 0 0 5px rgba(255, 255, 255, 0.28);
  transform: translateX(-50%);
}

.launcher-item.is-active::after {
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow:
    0 0 0 0.5px rgba(0, 0, 0, 0.16),
    0 0 6px rgba(255, 255, 255, 0.34);
}

.launcher-divider {
  align-self: center;
  height: 38px;
  background: linear-gradient(
    180deg,
    transparent,
    rgba(255, 255, 255, 0.22) 16%,
    rgba(0, 0, 0, 0.2) 84%,
    transparent
  );
  box-shadow: none;
}

/* Shader-driven Liquid Glass
 * WebGL redraws the wallpaper only inside registered SDF surfaces. These DOM
 * layers provide text contrast and hairlines without obscuring the refraction.
 */
.portal-desktop :is(
  .portal-menu-bar,
  .mac-window,
  .window-body,
  .spotlight-panel,
  .spotlight-search,
  .spotlight-results,
  .spotlight-footer,
  .launchpad-groups,
  .launchpad-search,
  .launchpad-close,
  .bottom-launcher,
  .todo-overview,
  .widget-shell :deep(.weather-container),
  .widget-shell :deep(.calendar),
  .widget-shell :deep(.calendar-container),
  .todo-shell :deep(.todo-list-container),
  .todo-shell :deep(.todo-container),
  :deep(.aplayer),
  :deep(.aplayer-list)
) {
  -webkit-backdrop-filter: none !important;
  backdrop-filter: none !important;
}

.liquid-surface {
  --lg-surface-radius: inherit;
  isolation: isolate;
  background: transparent !important;
}

.liquid-surface::before,
.liquid-surface::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
}

.liquid-surface::before {
  z-index: 0;
  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.045),
      rgba(255, 255, 255, 0.006) 44%,
      rgba(5, 12, 22, 0.045)
    ),
    rgba(10, 18, 29, 0.055);
  box-shadow:
    inset 0 0.5px 0 rgba(255, 255, 255, 0.16),
    inset 0 -0.5px 0 rgba(0, 0, 0, 0.1);
  -webkit-backdrop-filter: none !important;
  backdrop-filter: none !important;
}

.portal-desktop.has-liquid-webgl .liquid-surface::before {
  background: rgba(8, 15, 25, 0.018);
}

.liquid-surface::after {
  z-index: 1;
  padding: 0.65px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.28),
    rgba(255, 255, 255, 0.045) 34%,
    rgba(255, 255, 255, 0.015) 66%,
    rgba(146, 199, 255, 0.12)
  );
  opacity: 0.58;
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  mask-composite: exclude;
}

.liquid-surface > * {
  position: relative;
  z-index: 2;
}

.portal-menu-bar.liquid-surface {
  --lg-surface-radius: 0;
  overflow: visible;
  border-bottom-color: rgba(255, 255, 255, 0.14);
  box-shadow:
    0 0.5px 0 rgba(0, 0, 0, 0.12),
    0 7px 22px rgba(7, 16, 28, 0.07);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.28);
}

.portal-menu-bar.liquid-surface::before {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.065), transparent),
    rgba(14, 25, 39, 0.035);
}

.mac-window.liquid-surface {
  --lg-surface-radius: var(--portal-radius-window);
  border-color: rgba(255, 255, 255, 0.22);
  box-shadow:
    0 0 0 0.5px rgba(12, 18, 30, 0.16),
    0 34px 90px rgba(8, 15, 30, 0.24),
    0 8px 28px rgba(8, 15, 30, 0.12);
}

.mac-window.liquid-surface::before {
  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.035),
      transparent 42%,
      rgba(3, 10, 18, 0.04)
    ),
    rgba(8, 16, 27, 0.055);
}

.window-titlebar {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.09), transparent),
    rgba(20, 24, 33, 0.2);
  box-shadow:
    inset 0 -0.5px 0 rgba(0, 0, 0, 0.11);
  min-height: 40px;
}

.window-body,
.window-todo .window-body,
.window-music .window-body {
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.035), transparent 55%),
    rgba(18, 23, 32, 0.28);
  box-shadow: inset 0 0.5px 0 rgba(255, 255, 255, 0.055);
  text-shadow:
    0 1px 2px rgba(0, 0, 0, 0.26);
}

.widget-shell :deep(.weather-container),
.widget-shell :deep(.calendar),
.widget-shell :deep(.calendar-container),
.todo-shell :deep(.todo-list-container),
.todo-shell :deep(.todo-container),
:deep(.aplayer),
:deep(.aplayer-list) {
  border-color: rgba(255, 255, 255, 0.075);
  background: rgba(7, 13, 22, 0.035);
  box-shadow: none;
}

.weather-shell :deep(.weather-container),
.calendar-shell :deep(.calendar) {
  border: 0;
}

.weather-shell :deep(.summary-text) {
  border-color: rgba(255, 255, 255, 0.075);
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.04), transparent),
    rgba(6, 13, 22, 0.035);
  box-shadow: none;
  font-size: 15px;
  font-weight: 400;
}

.weather-shell :deep(.details-list) {
  gap: 0 16px;
}

.weather-shell :deep(.details-list li) {
  min-height: 48px;
  padding: 8px 5px;
  border: 0;
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.09);
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  color: rgba(255, 255, 255, 0.86);
  font-size: 13px;
  font-weight: 400;
}

.weather-shell :deep(.details-list li:hover) {
  border-color: rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.055);
  transform: none;
}

.weather-shell :deep(.bullet) {
  width: 5px;
  height: 5px;
  border: 0;
  background: rgba(116, 194, 255, 0.9);
  box-shadow: none;
}

.weather-shell :deep(.detail-value) {
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
  font-weight: 500;
  font-size: 13px;
}

.calendar-shell :deep(.calendar-header) {
  border: 0;
  background: transparent;
  box-shadow: none;
  grid-template-columns: 28px minmax(0, 1fr) 28px auto auto;
  gap: 6px;
}

.calendar-shell :deep(.month-title) {
  border: 0;
  background: transparent;
  box-shadow: none;
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
  height: 28px;
  line-height: 28px;
  font-size: 15px;
  font-weight: 600;
}

.calendar-shell :deep(.nav-btn) {
  border-color: rgba(255, 255, 255, 0.13);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.11), rgba(255, 255, 255, 0.025)),
    rgba(255, 255, 255, 0.045);
  box-shadow: inset 0 0.5px 0 rgba(255, 255, 255, 0.15);
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
  width: 28px;
  height: 28px;
  font-size: 0;
  display: grid;
  place-items: center;
  border-radius: 7px;
}

.calendar-shell :deep(.mark-btn[aria-label='Unmark red']) {
  border-color: rgba(255, 255, 255, 0.14);
  color: var(--portal-text-secondary);
  background: rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 0.5px 0 rgba(255, 255, 255, 0.1);
}

.calendar-shell :deep(.calendar-grid) {
  border: 0;
  background: transparent;
  grid-auto-rows: 36px;
  justify-items: center;
  align-items: center;
}

.calendar-shell :deep(.calendar-cell:not(.today):not(.selected):not(.is-red):hover),
.calendar-shell :deep(.calendar-cell:not(.today):not(.selected):not(.is-red):focus-visible) {
  border-color: rgba(255, 255, 255, 0.13);
  background: rgba(255, 255, 255, 0.075);
  transform: none;
}

.todo-overview {
  border: 0;
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.075);
  border-radius: 0;
  background: transparent;
  box-shadow: none;
}

.todo-overview-mark,
.todo-shell :deep(.mode-switch),
.todo-shell :deep(.input-section),
.todo-shell :deep(.current-day-chip) {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.045);
  box-shadow: inset 0 0.5px 0 rgba(255, 255, 255, 0.12);
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}

.todo-shell :deep(.todo-list-container),
.todo-shell :deep(.todo-container) {
  border: 0;
  background: transparent;
}

.todo-shell :deep(.task-input),
.todo-shell :deep(.task-list:empty) {
  background: transparent;
  border: 0;
}

.todo-shell :deep(.task-item) {
  border: 0;
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.08);
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  min-height: 44px;
  margin-bottom: 0;
  padding: 6px 4px;
  box-sizing: border-box;
}

.todo-shell :deep(.task-item:hover) {
  border-color: rgba(255, 255, 255, 0.13);
  background: rgba(255, 255, 255, 0.055);
}

:deep(.aplayer),
:deep(.aplayer-info),
:deep(.aplayer-list) {
  background: rgba(7, 13, 22, 0.04);
  box-shadow: none;
}

:deep(.aplayer-list ol li) {
  background: transparent;
}

/* One quiet content plane; the header and track list share its material. */
.window-music :deep(.aplayer) {
  border-color: rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.045), transparent 55%),
    rgba(20, 25, 34, 0.18);
  box-shadow: inset 0 0.5px 0 rgba(255, 255, 255, 0.08);
}

.window-music :deep(.aplayer-body) {
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.1);
}

.window-music :deep(.aplayer-pic) {
  border-right: 0.5px solid rgba(255, 255, 255, 0.12);
}

.window-music :deep(.aplayer-info) {
  background: transparent;
}

.window-music :deep(.aplayer-list) {
  border-top: 0;
  background: transparent;
}

.window-music :deep(.aplayer-list ol li) {
  border-top-color: rgba(255, 255, 255, 0.085);
  color: rgba(255, 255, 255, 0.76);
  background: transparent;
  height: 34px;
  line-height: 34px;
  font-size: 13px;
}

.window-music :deep(.aplayer-list ol li:hover) {
  color: rgba(255, 255, 255, 0.96) !important;
  background: rgba(255, 255, 255, 0.075) !important;
}

.window-music :deep(.aplayer-list-light) {
  color: rgba(255, 255, 255, 0.98) !important;
  background:
    linear-gradient(90deg, rgba(112, 169, 235, 0.24), rgba(112, 169, 235, 0.1))
    !important;
}

.window-music :deep(.aplayer-music .aplayer-title),
.window-music :deep(.aplayer-list-title) {
  color: rgba(255, 255, 255, 0.94) !important;
  font-size: 13px;
  font-weight: 500;
}

.window-music :deep(.aplayer-music .aplayer-author),
.window-music :deep(.aplayer-list-author),
.window-music :deep(.aplayer-list-index) {
  color: rgba(255, 255, 255, 0.62) !important;
  font-size: 11px;
}

.window-music :deep(.aplayer-list-light .aplayer-list-title),
.window-music :deep(.aplayer-list-light .aplayer-list-author),
.window-music :deep(.aplayer-list-light .aplayer-list-index) {
  color: rgba(255, 255, 255, 0.98) !important;
}


.window-music :deep(.aplayer-music .aplayer-author),
.window-music :deep(.aplayer-list-author) {
  font-size: 11px;
}

.window-music :deep(.aplayer-icon) {
  position: relative;
  min-width: 24px;
  min-height: 24px;
  margin: 0 1px;
  padding: 0;
}

.window-music :deep(.aplayer-icon svg) {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 18px !important;
  height: 18px !important;
  margin: 0;
  transform: translate(-50%, -50%);
}

.window-music :deep(.aplayer .aplayer-info .aplayer-controller .aplayer-time) {
  height: 28px;
  line-height: 28px;
}

.window-music :deep(.aplayer-button:focus-visible),
.window-music :deep(.aplayer-icon:focus-visible) {
  outline: 2px solid var(--portal-text-accent);
  outline-offset: 2px;
}

.window-music :deep(.aplayer-time) {
  color: rgba(255, 255, 255, 0.7);
}

.window-music :deep(.aplayer-icon path) {
  fill: rgba(255, 255, 255, 0.76) !important;
  transition: fill 160ms cubic-bezier(0.4, 0, 0.2, 1);
}

.window-music :deep(.aplayer-icon:hover path) {
  fill: rgba(255, 255, 255, 0.98) !important;
}

.window-music :deep(.aplayer-play) {
  border: 0.5px solid rgba(255, 255, 255, 0.24);
  background: rgba(5, 10, 18, 0.48);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
}

.window-music :deep(.aplayer .aplayer-controller .aplayer-bar-wrap .aplayer-bar),
.window-music :deep(.aplayer .aplayer-volume-bar-wrap .aplayer-volume-bar) {
  background: rgba(2, 7, 14, 0.42);
}

.window-music :deep(.aplayer .aplayer-controller .aplayer-bar-wrap .aplayer-loaded) {
  background: rgba(255, 255, 255, 0.24);
}

/* The wallpaper shader cannot sample DOM windows beneath a modal. Soften
 * that backdrop once at the scrim; keep the modal's content and rim sharp. */
.spotlight-overlay {
  background:
    radial-gradient(
      ellipse 720px 500px at 50% 18%,
      rgba(4, 9, 18, 0.075),
      transparent 78%
    ),
    rgba(12, 17, 26, 0.14);
  -webkit-backdrop-filter: blur(18px);
  backdrop-filter: blur(18px);
}

.spotlight-panel.liquid-surface {
  --lg-surface-radius: 22px;
  border-color: rgba(255, 255, 255, 0.18);
  box-shadow:
    0 0 0 0.5px rgba(0, 0, 0, 0.18),
    0 30px 86px rgba(0, 0, 0, 0.23);
}

.spotlight-search {
  background: rgba(255, 255, 255, 0.025);
  min-height: 56px;
}

.spotlight-results {
  background: rgba(18, 23, 32, 0.18);
}

.spotlight-footer {
  background: rgba(5, 11, 19, 0.1);
}

.launchpad-overlay {
  background:
    radial-gradient(circle at 50% 38%, rgba(255, 255, 255, 0.025), transparent 42rem),
    rgba(12, 17, 26, 0.14);
  -webkit-backdrop-filter: blur(18px);
  backdrop-filter: blur(18px);
}

.launchpad-groups.liquid-surface {
  --lg-surface-radius: 28px;
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow:
    0 0 0 0.5px rgba(0, 0, 0, 0.1),
    0 24px 64px rgba(0, 0, 0, 0.08);
}

.launchpad-groups.liquid-surface::before {
  background: rgba(8, 15, 25, 0.022);
}

.launchpad-tile::before {
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.09), transparent),
    rgba(255, 255, 255, 0.045);
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}

.bottom-launcher.liquid-surface {
  --lg-surface-radius: 24px;
  border-color: rgba(255, 255, 255, 0.18);
  background: transparent;
  box-shadow:
    0 0 0 0.5px rgba(8, 15, 30, 0.14),
    0 18px 48px rgba(8, 15, 30, 0.18),
    0 4px 14px rgba(8, 15, 30, 0.08);
}

.bottom-launcher.liquid-surface::before {
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.035), transparent),
    rgba(8, 15, 25, 0.02);
}

.bottom-launcher.liquid-surface::after {
  padding: 0.8px;
  opacity: 0.76;
}

.launcher-tooltip.liquid-surface {
  border-color: rgba(255, 255, 255, 0.22);
  background: transparent !important;
  box-shadow:
    0 0 0 0.5px rgba(0, 0, 0, 0.16),
    0 9px 26px rgba(0, 0, 0, 0.24);
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}

.launcher-tooltip.liquid-surface::before {
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.055), transparent),
    rgba(7, 14, 24, 0.055);
}

.launcher-tooltip.liquid-surface::after {
  display: none;
}

.portal-desktop.has-liquid-webgl .liquid-surface::before {
  background: linear-gradient(
    145deg,
    rgba(255, 255, 255, 0.055),
    rgba(255, 255, 255, 0.008) 45%,
    rgba(12, 18, 28, 0.025)
  );
  box-shadow:
    inset 0 0.75px 0 rgba(255, 255, 255, 0.27),
    inset 0 -0.75px 0 rgba(235, 242, 255, 0.12);
}

.portal-desktop.has-liquid-webgl .liquid-surface::after {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.52),
    rgba(255, 255, 255, 0.08) 32%,
    rgba(255, 255, 255, 0.035) 62%,
    rgba(235, 242, 255, 0.32)
  );
  opacity: 0.72;
}

.portal-desktop:not(.has-liquid-webgl) .liquid-surface::before {
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.12), transparent 55%),
    rgba(28, 34, 45, 0.68);
  -webkit-backdrop-filter: blur(20px) saturate(125%) !important;
  backdrop-filter: blur(20px) saturate(125%) !important;
}

.portal-desktop :is(
  .menu-home-link,
  .menu-glyph-button,
  .menu-command,
  .menu-status-action,
  .menu-clock-action
):is(:hover, :focus-visible, .is-active) {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.13), rgba(255, 255, 255, 0.035)),
    rgba(255, 255, 255, 0.05);
  -webkit-backdrop-filter: none;
  backdrop-filter: none;
}

.portal-desktop :is(
  .menu-home-link,
  .menu-glyph-button,
  .menu-command,
  .menu-status-action,
  .menu-clock-action,
  .traffic-light,
  .spotlight-result,
  .spotlight-close,
  .launchpad-close,
  .launchpad-tile,
  .launcher-item
):focus-visible {
  outline: 2px solid var(--portal-text-accent);
  outline-offset: 2px;
}

.mac-window:focus {
  outline: none;
}

@media (max-width: 1100px) and (min-width: 701px) {
  .launchpad-grid {
    grid-template-columns: repeat(7, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .menu-commands {
    display: none;
  }

  .menu-clock {
    display: inline;
  }

  .menu-current-app {
    margin-right: 2px;
  }

  .bottom-launcher {
    max-width: calc(100vw - 20px);
    overflow-x: auto;
    overflow-y: hidden;
  }

  .launcher-item {
    --dock-scale: 1 !important;
    --dock-shift: 0px !important;
    --dock-lift: 0px !important;
    transform: none !important;
  }

  .launcher-item img {
    transform: none !important;
  }

  .launcher-item .launcher-tooltip {
    display: none;
  }
}

@media (max-width: 700px), (max-width: 950px) and (max-height: 600px) and (orientation: landscape) {
  .portal-menu-bar {
    height: calc(44px + env(safe-area-inset-top));
    padding: env(safe-area-inset-top) 8px 0;
  }

  .menu-home-link,
  .menu-glyph-button {
    width: 34px;
    height: 34px;
  }

  .menu-current-app {
    max-width: 104px;
    overflow: hidden;
    font-size: 12px;
    text-overflow: ellipsis;
  }

  .menu-status-glyph,
  .battery-glyph {
    display: none;
  }

  .menu-clock {
    font-size: 11px;
  }

  .mac-window,
  .mac-window.is-positioned,
  .mac-window.is-maximized {
    top: calc(44px + env(safe-area-inset-top) + 14px) !important;
    right: 8px !important;
    bottom: calc(66px + max(8px, env(safe-area-inset-bottom))) !important;
    left: 8px !important;
    width: auto !important;
    height: auto !important;
    max-height: none !important;
    min-height: 0;
    transform: none !important;
  }

  .window-titlebar {
    grid-template-columns: 44px minmax(0, 1fr) 44px;
    min-height: 36px;
    padding: 0 8px;
    cursor: default;
  }

  .traffic-light.minimize,
  .traffic-light.zoom {
    display: none;
  }

  .traffic-light.close {
    width: 44px;
    height: 44px;
    margin-left: -8px;
    background: radial-gradient(circle, #ff5f57 0 6px, transparent 6.5px);
  }

  .traffic-light.close::before {
    content: '';
    position: absolute;
    display: none;
  }

  .traffic-light.close::after {
    display: none;
  }

  .window-body {
    padding: 10px;
  }

  .weather-shell :deep(.weather-content) {
    justify-content: flex-start;
    padding-top: 22px;
    box-sizing: border-box;
  }

  .weather-shell :deep(.details-list) {
    grid-template-columns: minmax(0, 1fr);
  }

  .weather-shell :deep(.details-list li:last-child) {
    grid-column: auto;
  }

  .calendar-shell :deep(.calendar-header) {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }

  .calendar-shell :deep(.calendar-header > .nav-btn:first-child) {
    grid-row: 1;
    grid-column: 1;
  }

  .calendar-shell :deep(.month-title) {
    grid-row: 1;
    grid-column: 2 / span 4;
  }

  .calendar-shell :deep(.calendar-header > .nav-btn:nth-of-type(2)) {
    grid-row: 1;
    grid-column: 6;
  }

  .calendar-shell :deep(.today-btn) {
    grid-row: 2;
    grid-column: 1 / span 3;
  }

  .calendar-shell :deep(.mark-btn) {
    grid-row: 2;
    grid-column: 4 / span 3;
  }

  .spotlight-overlay {
    background: rgba(3, 8, 15, 0.075);
  }

  .spotlight-panel {
    top: calc(44px + env(safe-area-inset-top) + 8px);
    right: 8px;
    bottom: auto;
    left: 8px;
    width: auto;
    max-height: calc(100dvh - 130px - env(safe-area-inset-top));
    transform: none;
  }

  .spotlight-search {
    min-height: 54px;
    padding: 0 14px;
  }

  .spotlight-input {
    font-size: 19px;
  }

  .spotlight-result {
    grid-template-columns: 32px minmax(0, 1fr);
    min-height: 54px;
  }

  .spotlight-result-meta {
    display: none;
  }

  .spotlight-footer {
    min-height: 34px;
  }

  .spotlight-help {
    display: none;
  }

  .window-todo .window-body {
    padding: 10px;
  }

  .todo-shell {
    min-height: 0;
  }

  .todo-overview {
    padding-inline: 2px;
  }

  .todo-overview h2 {
    font-size: 22px;
  }

  .todo-overview div > span {
    max-width: 230px;
  }

  .todo-shell :deep(.todo-list-container),
  .todo-shell :deep(.todo-container) {
    min-height: 0;
    padding: 12px;
  }

  .todo-shell :deep(.mode-switch) {
    width: 100%;
    overflow-x: auto;
    box-sizing: border-box;
  }

  .todo-shell :deep(.mode-btn) {
    min-width: 0;
    min-height: 44px;
    flex: 1 0 96px;
  }

  .todo-shell :deep(.current-day-chip) {
    min-height: 44px;
  }

  .todo-shell :deep(.input-section) {
    grid-template-columns: minmax(0, 1fr) 44px;
  }

  .todo-shell :deep(.task-input) {
    min-height: 44px;
    font-size: 16px;
  }

  .todo-shell :deep(.add-button) {
    width: 44px;
    height: 44px;
  }

  .calendar-shell :deep(.nav-btn),
  .calendar-shell :deep(.today-btn),
  .calendar-shell :deep(.mark-btn) {
    min-width: 44px;
    min-height: 44px;
    height: 44px;
  }

  .calendar-shell :deep(.calendar-grid) {
    grid-auto-rows: 44px;
  }

  .calendar-shell :deep(.calendar-cell) {
    width: 44px;
    max-width: 100%;
    height: 44px;
    min-height: 44px;
  }

  .window-music :deep(.aplayer-info) {
    min-height: 110px;
  }

  .window-music :deep(.aplayer-controller) {
    display: flex;
    flex-direction: column;
  }

  .window-music :deep(.aplayer .aplayer-info .aplayer-controller .aplayer-bar-wrap) {
    width: 100%;
    margin: 0;
    padding: 8px 0;
  }

  .window-music :deep(.aplayer .aplayer-info .aplayer-controller .aplayer-time) {
    position: static;
    display: flex;
    height: auto;
    min-height: 44px;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: nowrap;
  }

  .window-music :deep(.aplayer-icon) {
    min-width: 44px;
    min-height: 44px;
    margin: 0;
  }

  .window-music :deep(.aplayer-list ol li) {
    height: 44px;
    line-height: 44px;
  }

  .todo-shell :deep(.task-list) {
    min-height: 132px;
  }

  .spotlight-shell-enter-from .spotlight-panel,
  .spotlight-shell-leave-to .spotlight-panel {
    transform: scale(0.97);
  }

  .launchpad-panel {
    inset: calc(44px + env(safe-area-inset-top)) 0 0;
    padding: 36px 18px 88px;
  }

  .launchpad-close {
    top: calc(52px + env(safe-area-inset-top));
    right: 12px;
    width: 44px;
    height: 44px;
  }

  .launchpad-search {
    margin-bottom: 28px;
  }

  .launchpad-groups {
    gap: 28px;
    padding: 16px;
    border-radius: 22px;
  }

  .launchpad-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 24px 10px;
  }

  .launchpad-tile img {
    width: 58px;
    height: 58px;
  }

  .bottom-launcher.liquid-surface {
    bottom: max(8px, env(safe-area-inset-bottom));
    height: 53px;
    min-height: 0;
    padding: 4px 7px;
    justify-content: flex-start;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .launcher-item {
    --dock-scale: 1 !important;
    --dock-shift: 0px !important;
    --dock-lift: 0px !important;
    flex-basis: 44px;
    width: 44px;
    height: 44px;
    min-height: 0;
    grid-template-rows: 38px 6px;
    transform: none !important;
  }

  .launcher-item img {
    width: 38px;
    height: 38px;
    transform: none !important;
  }

  .launcher-item .launcher-tooltip {
    display: none;
  }

  .launcher-divider {
    height: 36px;
  }
}

@media (max-width: 480px) {
  .menu-clock {
    display: none;
  }

  .todo-overview-mark {
    width: 38px;
    height: 38px;
  }

  .todo-overview div > span {
    display: none;
  }

  .launchpad-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (hover: none), (pointer: coarse) {
  .launcher-item {
    --dock-scale: 1 !important;
    --dock-shift: 0px !important;
    --dock-lift: 0px !important;
    transform: none !important;
  }

  .launcher-item img {
    transform: none !important;
  }
}

/* Short desktop viewports keep the same control sizes with tighter spacing. */
@media (min-width: 1101px) and (max-width: 1600px) and (max-height: 780px) {
  .portal-desktop {
    --portal-window-max-top: 30px;
    --portal-window-max-inset: 6px;
    --portal-window-max-gutter: 12px;
    --portal-window-max-height-offset: 92px;
  }

  .mac-window {
    max-height: calc(100dvh - 98px);
    min-height: min(384px, calc(100dvh - 98px));
  }

  .window-todo {
    min-height: min(440px, calc(100dvh - 98px));
  }

  .window-titlebar {
    min-height: 34px;
  }

  .window-body {
    padding: 10px;
  }

  .window-music :deep(.aplayer-list) {
    max-height: 190px !important;
  }

  .spotlight-panel {
    top: 48px;
    max-height: calc(100dvh - 108px);
  }

  .launchpad-panel {
    padding-top: 28px;
    padding-bottom: 82px;
  }

  .launchpad-search {
    margin-bottom: 20px;
  }

  .launchpad-groups {
    gap: 22px;
  }

  .launchpad-grid {
    gap: 20px 16px;
  }

  .bottom-launcher.liquid-surface {
    --lg-surface-radius: 21px;
    bottom: max(7px, env(safe-area-inset-bottom));
    height: 57px;
    padding: 4px 8px;
    border-radius: var(--lg-surface-radius);
  }

  .bottom-launcher.liquid-surface::before,
  .bottom-launcher.liquid-surface::after {
    clip-path: inset(0 round var(--lg-surface-radius));
  }

  .launcher-item {
    flex-basis: 40px;
    width: 40px;
    height: 46px;
    grid-template-rows: 38px 8px;
  }

  .launcher-item img {
    width: 38px;
    height: 38px;
  }

  .launcher-divider {
    height: 34px;
    margin-inline: 2px;
  }
}

/* Tablet workspace: a touch-first window shell with the same desktop visual language. */
@media (min-width: 701px) and (max-width: 1100px),
  (min-width: 701px) and (max-width: 1366px) and (hover: none) and (pointer: coarse) {
  .portal-menu-bar {
    height: calc(44px + env(safe-area-inset-top));
    padding:
      env(safe-area-inset-top)
      max(10px, env(safe-area-inset-right))
      0
      max(10px, env(safe-area-inset-left));
  }

  .menu-left,
  .menu-right {
    gap: 2px;
  }

  .menu-commands {
    display: none;
  }

  .menu-home-link,
  .menu-glyph-button,
  .menu-status-glyph {
    width: 44px;
    height: 44px;
  }

  .menu-current-app {
    margin-right: 4px;
    font-size: 14px;
  }

  .menu-clock {
    min-height: 44px;
    padding-inline: 10px;
    font-size: 13px;
  }

  .mac-window,
  .mac-window.is-positioned,
  .mac-window.is-maximized {
    top: calc(44px + env(safe-area-inset-top) + 12px) !important;
    right: max(12px, env(safe-area-inset-right)) !important;
    bottom: calc(80px + max(12px, env(safe-area-inset-bottom))) !important;
    left: max(12px, env(safe-area-inset-left)) !important;
    width: auto !important;
    height: auto !important;
    max-height: none !important;
    min-height: 0;
    transform: none !important;
  }

  .window-titlebar {
    grid-template-columns: 52px minmax(0, 1fr) 52px;
    min-height: 44px;
    padding: 0 8px;
    cursor: default;
  }

  .traffic-light.minimize,
  .traffic-light.zoom {
    display: none;
  }

  .traffic-light.close {
    width: 44px;
    height: 44px;
    margin-left: -8px;
    border: 0;
    background: radial-gradient(circle, #ff5f57 0 6px, transparent 6.5px);
  }

  .traffic-light.close::before,
  .traffic-light.close::after {
    display: none;
  }

  .window-body {
    padding: 14px;
    overscroll-behavior: contain;
    -webkit-overflow-scrolling: touch;
  }

  .calendar-shell :deep(.nav-btn),
  .calendar-shell :deep(.today-btn),
  .calendar-shell :deep(.mark-btn),
  .todo-shell :deep(.mode-btn),
  .todo-shell :deep(.current-day-chip),
  .todo-shell :deep(.add-button) {
    min-height: 44px;
  }

  .spotlight-panel {
    top: calc(44px + env(safe-area-inset-top) + 18px);
    right: max(24px, env(safe-area-inset-right));
    left: max(24px, env(safe-area-inset-left));
    width: auto;
    max-height: calc(100dvh - 170px - env(safe-area-inset-top));
    transform: none;
  }

  .spotlight-search {
    min-height: 60px;
    padding-right: 68px;
  }

  .spotlight-search:focus-within {
    box-shadow: inset 0 0 0 2px rgba(10, 132, 255, 0.88);
  }

  .spotlight-close {
    position: absolute;
    top: 8px;
    right: 8px;
    z-index: 4;
    display: grid;
    width: 44px;
    height: 44px;
    padding: 0;
    place-items: center;
    border: 0;
    border-radius: 50%;
    color: var(--portal-text-primary);
    background: rgba(255, 255, 255, 0.1);
    font: inherit;
    font-size: 24px;
    cursor: pointer;
  }

  .launchpad-panel {
    inset: calc(44px + env(safe-area-inset-top)) 0 0;
    padding:
      46px
      max(30px, env(safe-area-inset-right))
      calc(104px + env(safe-area-inset-bottom))
      max(30px, env(safe-area-inset-left));
  }

  .launchpad-close {
    top: calc(54px + env(safe-area-inset-top));
    right: max(18px, env(safe-area-inset-right));
    width: 44px;
    height: 44px;
  }

  .launchpad-search {
    min-height: 44px;
    margin-bottom: 30px;
  }

  .launchpad-groups {
    gap: 30px;
  }

  .launchpad-grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 28px 16px;
  }

  .launchpad-tile img {
    width: 68px;
    height: 68px;
  }

  .bottom-launcher.liquid-surface {
    bottom: max(12px, env(safe-area-inset-bottom));
    height: 68px;
    max-width: calc(100vw - 24px - env(safe-area-inset-left) - env(safe-area-inset-right));
    padding: 6px 10px;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .launcher-item {
    --dock-scale: 1 !important;
    --dock-shift: 0px !important;
    --dock-lift: 0px !important;
    flex-basis: 48px;
    width: 48px;
    height: 56px;
    grid-template-rows: 46px 10px;
    transform: none !important;
  }

  .launcher-item img {
    width: 44px;
    height: 44px;
    transform: none !important;
  }

  .launcher-item .launcher-tooltip {
    display: none;
  }

  .launcher-divider {
    height: 40px;
  }
}

@media (min-width: 1101px) and (max-width: 1366px) and (hover: none) and (pointer: coarse) {
  .launchpad-grid {
    grid-template-columns: repeat(8, minmax(0, 1fr));
  }
}

/* Compact phones and short landscape screens: respect notches and make Dock scrolling explicit. */
@media (max-width: 700px),
  (max-width: 950px) and (max-height: 600px) and (orientation: landscape) {
  .portal-menu-bar {
    padding-left: max(8px, env(safe-area-inset-left));
    padding-right: max(8px, env(safe-area-inset-right));
  }

  .menu-left,
  .menu-right {
    gap: 0;
  }

  .menu-home-link,
  .menu-glyph-button {
    width: 44px;
    height: 44px;
  }

  .menu-current-app {
    max-width: 86px;
  }

  .mac-window,
  .mac-window.is-positioned,
  .mac-window.is-maximized {
    right: max(8px, env(safe-area-inset-right)) !important;
    left: max(8px, env(safe-area-inset-left)) !important;
  }

  .spotlight-panel {
    right: max(8px, env(safe-area-inset-right));
    left: max(8px, env(safe-area-inset-left));
  }

  .spotlight-search {
    padding-right: 62px;
  }

  .spotlight-search:focus-within {
    box-shadow: inset 0 0 0 2px rgba(10, 132, 255, 0.88);
  }

  .spotlight-close {
    position: absolute;
    top: 5px;
    right: max(5px, env(safe-area-inset-right));
    z-index: 4;
    display: grid;
    width: 44px;
    height: 44px;
    padding: 0;
    place-items: center;
    border: 0;
    border-radius: 50%;
    color: var(--portal-text-primary);
    background: rgba(255, 255, 255, 0.1);
    font: inherit;
    font-size: 24px;
    cursor: pointer;
  }

  .launchpad-panel {
    padding-right: max(18px, env(safe-area-inset-right));
    padding-left: max(18px, env(safe-area-inset-left));
  }

  .launchpad-close {
    right: max(12px, env(safe-area-inset-right));
  }

  .bottom-launcher.liquid-surface {
    right: max(8px, env(safe-area-inset-right));
    left: max(8px, env(safe-area-inset-left));
    width: auto;
    max-width: none;
    box-sizing: border-box;
    scroll-padding-inline: 7px;
    overscroll-behavior-inline: contain;
    transform: none;
  }
}

@media (max-width: 480px) {
  .launchpad-search {
    width: min(260px, calc(100vw - 128px));
  }
}

/* Phone portrait: keep the desktop metaphor readable instead of squeezing it horizontally. */
@media (max-width: 480px) and (orientation: portrait) {
  .mac-window,
  .mac-window.is-positioned,
  .mac-window.is-maximized {
    right: max(12px, env(safe-area-inset-right)) !important;
    left: max(12px, env(safe-area-inset-left)) !important;
  }

  .mac-window.liquid-surface::before {
    background:
      linear-gradient(
        145deg,
        rgba(255, 255, 255, 0.055),
        transparent 42%,
        rgba(3, 10, 18, 0.08)
      ),
      rgba(8, 16, 27, 0.22);
  }

  .window-titlebar {
    grid-template-columns: 52px minmax(0, 1fr) 52px;
    min-height: 44px;
  }

  .traffic-light.close {
    width: 44px;
    height: 44px;
    margin-left: -8px;
    border: 0;
    background: radial-gradient(circle, #ff5f57 0 6px, transparent 6.5px);
  }

  .traffic-light.close::before,
  .traffic-light.close::after {
    display: none;
  }

  .window-body,
  .window-todo .window-body,
  .window-music .window-body {
    background:
      linear-gradient(145deg, rgba(255, 255, 255, 0.03), transparent 48%),
      rgba(5, 11, 19, 0.28);
    text-shadow:
      0 1px 2px rgba(0, 0, 0, 0.58),
      0 0 10px rgba(0, 0, 0, 0.14);
  }

  .widget-shell :deep(.weather-container),
  .widget-shell :deep(.calendar),
  .todo-shell :deep(.todo-list-container),
  .todo-shell :deep(.todo-container) {
    background: rgba(7, 13, 22, 0.14);
  }

  .weather-shell :deep(.weather-container) {
    color: rgba(255, 255, 255, 0.92);
  }

  .weather-shell :deep(.loading-state) {
    color: rgba(255, 255, 255, 0.78);
    background: rgba(7, 13, 22, 0.18);
  }

  .calendar-shell :deep(.nav-btn),
  .calendar-shell :deep(.today-btn),
  .calendar-shell :deep(.mark-btn) {
    min-height: 44px;
  }

  .calendar-shell :deep(.nav-btn) {
    min-width: 44px;
  }

  .calendar-shell :deep(.calendar-grid) {
    grid-auto-rows: 44px;
    column-gap: 2px;
    row-gap: 4px;
  }

  .calendar-shell :deep(.calendar-cell) {
    width: 44px;
    max-width: 100%;
    height: 44px;
    min-height: 44px;
  }

  .calendar-shell :deep(.red-pill) {
    min-height: 36px;
    padding-inline: 10px;
  }

  .todo-overview-mark {
    width: 44px;
    height: 44px;
  }

  .spotlight-overlay {
    background: rgba(3, 8, 15, 0.2);
  }

  .spotlight-panel {
    right: max(12px, env(safe-area-inset-right));
    left: max(12px, env(safe-area-inset-left));
    background:
      linear-gradient(145deg, rgba(255, 255, 255, 0.075), rgba(0, 0, 0, 0.06)),
      rgba(18, 24, 34, 0.88);
  }

  .spotlight-search {
    background: rgba(7, 12, 20, 0.42);
  }

  .spotlight-results {
    background: rgba(10, 16, 26, 0.78);
  }

  .spotlight-group h2,
  .spotlight-footer {
    color: rgba(255, 255, 255, 0.74);
  }

  .launchpad-overlay {
    background: rgba(7, 12, 20, 0.34);
    -webkit-backdrop-filter: blur(18px);
    backdrop-filter: blur(18px);
  }

  .launchpad-panel {
    bottom: calc(73px + env(safe-area-inset-bottom));
    padding-bottom: 24px;
    scroll-padding-bottom: 24px;
  }

  .launchpad-panel:focus {
    outline: none;
  }

  .launchpad-close {
    top: calc(68px + env(safe-area-inset-top));
  }

  .launchpad-search input {
    font-size: 16px;
  }

  .launchpad-groups.liquid-surface {
    background: rgba(8, 15, 25, 0.18);
  }

  .launchpad-tile {
    min-height: 108px;
    align-content: start;
  }

  .launchpad-tile span {
    display: -webkit-box;
    min-height: 2.5em;
    overflow: hidden;
    line-height: 1.25;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .bottom-launcher.liquid-surface {
    right: auto;
    left: 50%;
    width: max-content;
    max-width: calc(100vw - 24px - env(safe-area-inset-left) - env(safe-area-inset-right));
    justify-content: center;
    overflow: visible;
    transform: translateX(-50%);
  }

  .bottom-launcher > a.launcher-item,
  .bottom-launcher > .launcher-divider {
    display: none;
  }
}

@media (max-width: 360px) and (orientation: portrait) {
  .todo-shell {
    width: 100%;
    grid-template-columns: minmax(0, 1fr);
  }

  .todo-overview {
    width: 100%;
    box-sizing: border-box;
  }

  .todo-shell :deep(.mode-switch) {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    overflow: visible;
  }

  .todo-shell :deep(.mode-btn) {
    width: auto;
    flex: none;
  }

  .todo-shell :deep(.current-day-chip) {
    width: 100%;
    grid-column: 1 / -1;
    white-space: nowrap;
  }

  .todo-shell :deep(.task-list:empty::after) {
    width: 100%;
    white-space: pre-wrap;
  }
}

@media (min-width: 560px) and (max-width: 950px) and (max-height: 600px) and (orientation: landscape) {
  .mac-window,
  .mac-window.is-positioned,
  .mac-window.is-maximized {
    bottom: calc(58px + max(5px, env(safe-area-inset-bottom))) !important;
  }

  .launchpad-panel {
    padding-top: 20px;
    padding-bottom: calc(70px + env(safe-area-inset-bottom));
  }

  .launchpad-search {
    min-height: 40px;
    margin-bottom: 16px;
  }

  .launchpad-groups {
    gap: 16px;
    padding: 12px;
  }

  .link-group + .link-group {
    padding-top: 14px;
  }

  .launchpad-grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
    gap: 18px 10px;
  }

  .launchpad-tile {
    min-height: 70px;
  }

  .launchpad-tile img {
    width: 52px;
    height: 52px;
  }

  .bottom-launcher.liquid-surface {
    bottom: max(5px, env(safe-area-inset-bottom));
    height: 49px;
    padding-block: 2px;
  }

  .launcher-item {
    flex-basis: 44px;
    width: 44px;
    height: 44px;
    grid-template-rows: 38px 6px;
  }

  .launcher-item img {
    width: 36px;
    height: 36px;
  }

  .launcher-divider {
    height: 34px;
  }
}

@supports not ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
  .portal-desktop:not(.has-liquid-webgl) .liquid-surface::before {
    background: rgba(35, 40, 50, 0.96);
    filter: none !important;
  }

  .liquid-surface::after {
    opacity: 0.6;
  }

  .portal-menu-bar {
    background: rgba(34, 38, 46, 0.96);
  }

  .mac-window,
  .spotlight-panel {
    background: rgba(39, 41, 48, 0.98);
  }

  .window-body,
  .window-todo .window-body,
  .window-music .window-body,
  .spotlight-results,
  .spotlight-footer,
  .launchpad-groups,
  .todo-overview,
  :deep(.aplayer),
  :deep(.aplayer-list),
  .widget-shell :deep(.weather-container),
  .widget-shell :deep(.calendar),
  .widget-shell :deep(.calendar-container),
  .todo-shell :deep(.todo-list-container),
  .todo-shell :deep(.todo-container) {
    background: rgba(26, 28, 34, 0.98);
  }

  .launchpad-overlay {
    background: rgba(25, 27, 33, 0.98);
  }

  .bottom-launcher,
  .launchpad-search,
  .launchpad-close,
  .launcher-tooltip,
  .launcher-tooltip::after {
    background: rgba(45, 48, 56, 0.96);
  }
}

@media (prefers-contrast: more) {
  .portal-desktop {
    --portal-hairline: rgba(255, 255, 255, 0.34);
    --portal-text-primary: rgba(255, 255, 255, 1);
    --portal-text-secondary: rgba(255, 255, 255, 0.88);
    --portal-text-tertiary: rgba(255, 255, 255, 0.74);
  }

  .portal-menu-bar,
  .mac-window,
  .spotlight-panel,
  .bottom-launcher,
  .launchpad-search,
  .launchpad-close {
    border-color: rgba(255, 255, 255, 0.42);
  }

  .portal-menu-bar.liquid-surface,
  .mac-window.liquid-surface,
  .spotlight-panel.liquid-surface,
  .bottom-launcher.liquid-surface,
  .launchpad-search.liquid-surface,
  .launchpad-close.liquid-surface {
    border-color: rgba(255, 255, 255, 0.48);
  }

  .window-body,
  .window-todo .window-body,
  .window-music .window-body,
  .spotlight-results,
  .spotlight-footer,
  .launchpad-groups,
  .todo-overview,
  :deep(.aplayer),
  .widget-shell :deep(.weather-container),
  .widget-shell :deep(.calendar),
  .widget-shell :deep(.calendar-container),
  .todo-shell :deep(.todo-list-container),
  .todo-shell :deep(.todo-container) {
    background: rgba(20, 22, 27, 0.9);
  }

  .portal-desktop :is(
    .menu-home-link,
    .menu-glyph-button,
    .menu-command,
    .menu-status-action,
    .menu-clock-action,
    .traffic-light,
    .spotlight-result,
    .launchpad-close,
    .launchpad-search input,
    .launchpad-tile,
    .launcher-item
  ):focus-visible {
    outline-width: 3px;
    outline-offset: 2px;
  }
}

@media (forced-colors: active) {
  .liquid-surface::before,
  .liquid-surface::after {
    display: none;
  }

  .menu-dropdown.liquid-surface,
  .portal-menu-bar.liquid-surface,
  .mac-window.liquid-surface,
  .spotlight-panel.liquid-surface,
  .bottom-launcher.liquid-surface,
  .spotlight-search.liquid-surface,
  .launchpad-groups.liquid-surface,
  .launchpad-search.liquid-surface,
  .launchpad-close.liquid-surface {
    color: CanvasText;
    border-color: CanvasText;
    background: Canvas !important;
    box-shadow: none;
  }

  .menu-dropdown,
  .portal-desktop,
  .portal-menu-bar,
  .mac-window,
  .window-titlebar,
  .window-body,
  .window-todo .window-body,
  .window-music .window-body,
  .spotlight-overlay,
  .spotlight-panel,
  .spotlight-search,
  .spotlight-results,
  .spotlight-footer,
  .launchpad-overlay,
  .launchpad-groups,
  .launchpad-search,
  .launchpad-close,
  .bottom-launcher,
  .launcher-tooltip,
  .launcher-tooltip::after,
  .todo-overview,
  :deep(.aplayer),
  :deep(.aplayer-list),
  .widget-shell :deep(.weather-container),
  .widget-shell :deep(.calendar),
  .widget-shell :deep(.calendar-container),
  .todo-shell :deep(.todo-list-container),
  .todo-shell :deep(.todo-container),
  .todo-shell :deep(.mode-switch),
  .todo-shell :deep(.input-section) {
    color: CanvasText;
    border-color: CanvasText;
    background: Canvas;
    box-shadow: none;
    filter: none;
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }

  .portal-desktop :is(
    button,
    a,
    input,
    [tabindex]
  ):focus-visible {
    outline: 3px solid Highlight;
    outline-offset: 2px;
  }

  .spotlight-result.is-selected {
    color: HighlightText;
    background: Highlight;
  }
}

@media (prefers-reduced-transparency: reduce) {
  .portal-desktop:not(.has-liquid-webgl) .liquid-surface::before {
    background: rgb(43, 43, 47);
    filter: none !important;
    -webkit-backdrop-filter: none !important;
    backdrop-filter: none !important;
  }

  .liquid-surface::after {
    display: none;
  }

  .menu-dropdown,
  .portal-menu-bar,
  .mac-window,
  .spotlight-panel,
  .spotlight-overlay,
  .bottom-launcher,
  .launchpad-overlay,
  .launcher-tooltip,
  .launchpad-groups,
  .todo-overview,
  :deep(.aplayer),
  :deep(.aplayer-list),
  .widget-shell :deep(.weather-container),
  .widget-shell :deep(.calendar),
  .widget-shell :deep(.calendar-container),
  .todo-shell :deep(.todo-list-container),
  .todo-shell :deep(.todo-container),
  .todo-shell :deep(.mode-switch),
  .todo-shell :deep(.input-section) {
    -webkit-backdrop-filter: none;
    backdrop-filter: none;
  }

  .portal-menu-bar {
    background: rgb(38, 38, 42);
  }

  .mac-window,
  .spotlight-panel {
    background: rgb(43, 43, 47);
  }

  .window-body,
  .window-todo .window-body,
  .window-music .window-body,
  .spotlight-results,
  .spotlight-footer,
  .launchpad-groups,
  .todo-overview,
  :deep(.aplayer),
  :deep(.aplayer-list),
  .widget-shell :deep(.weather-container),
  .widget-shell :deep(.calendar),
  .widget-shell :deep(.calendar-container),
  .todo-shell :deep(.todo-list-container),
  .todo-shell :deep(.todo-container) {
    background: rgb(31, 32, 37);
  }

  .spotlight-overlay {
    background: rgba(20, 20, 24, 0.92);
  }

  .todo-shell :deep(.todo-list-container),
  .todo-shell :deep(.todo-container) {
    background: rgb(35, 36, 44);
  }

  .bottom-launcher {
    background: rgb(52, 52, 56);
  }

  .launchpad-overlay {
    background: rgb(25, 25, 29);
  }

  .launcher-tooltip,
  .launcher-tooltip::after {
    background: rgb(36, 36, 40);
  }
}

@media (prefers-reduced-motion: reduce) {
  .liquid-glass-canvas,
  .window-shell-enter-active,
  .window-shell-leave-active,
  .spotlight-shell-enter-active,
  .spotlight-shell-leave-active,
  .spotlight-shell-enter-active .spotlight-panel,
  .spotlight-shell-leave-active .spotlight-panel,
  .launchpad-shell-enter-active,
  .launchpad-shell-leave-active,
  .launchpad-shell-enter-active .launchpad-panel,
  .launchpad-shell-leave-active .launchpad-panel,
  .launcher-item,
  .launcher-item img,
  .launcher-tooltip,
  .menu-glyph-button,
  .menu-command,
  .menu-status-action,
  .menu-clock-action,
  .spotlight-result,
  .todo-shell :deep(.mode-btn),
  .todo-shell :deep(.add-button),
  .launchpad-tile,
  .launchpad-tile::before,
  .weather-shell :deep(.details-list li),
  .calendar-shell :deep(.calendar-cell) {
    animation: none !important;
    transition: none !important;
  }

  .mac-window.window-shell-enter-from,
  .mac-window.window-shell-leave-to,
  .mac-window.is-positioned.window-shell-enter-from,
  .mac-window.is-positioned.window-shell-leave-to,
  .mac-window.is-positioned.is-minimizing.window-shell-leave-to,
  .mac-window.is-positioned.is-restoring.window-shell-enter-from,
  .spotlight-shell-enter-from .spotlight-panel,
  .spotlight-shell-leave-to .spotlight-panel,
  .launchpad-shell-enter-from .launchpad-panel,
  .launchpad-shell-leave-to .launchpad-panel {
    transform: none !important;
  }
}
</style>
